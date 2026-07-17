import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult
} from '@modelcontextprotocol/sdk/types.js';
import {
  buildManifest,
  discoverAndValidateTemplates,
  listLanguageFolders,
  validateTemplate,
  type TemplateDiagnostic,
  type TemplateRecord
} from '../scripts/build-template-manifest.mjs';

const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));
const TEMPLATE_ROOT = path.join(PROJECT_ROOT, 'data/prTemplates');
const LANGUAGE_PATTERN = /^[a-z][a-z0-9-]*$/;
const TEMPLATE_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const MAX_TEMPLATE_ID_LENGTH = 120;
const MAX_TEMPLATE_BYTES = 256 * 1024;

type JsonObject = Record<string, unknown>;
type ToolName = 'list_templates' | 'validate_template' | 'add_template';
type ErrorCode =
  | 'INVALID_ARGUMENT'
  | 'INVALID_TEMPLATE'
  | 'DUPLICATE_TEMPLATE'
  | 'PIPELINE_INVALID'
  | 'PIPELINE_FAILED'
  | 'IO_ERROR';

type ToolResponse =
  | { ok: true; [key: string]: unknown }
  | {
      ok: false;
      error: {
        code: ErrorCode;
        message: string;
        diagnostics: Array<{ path: string; message: string }>;
        rolledBack?: boolean;
      };
    };

interface TemplateServiceOptions {
  root?: string;
  regenerate?: (root: string) => Promise<unknown>;
}

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const failure = (
  code: ErrorCode,
  message: string,
  diagnostics: Array<{ path: string; message: string }> = [],
  rolledBack?: boolean
): ToolResponse => ({
  ok: false,
  error: {
    code,
    message,
    diagnostics,
    ...(rolledBack === undefined ? {} : { rolledBack })
  }
});

const targetRelativePath = (language: string, templateId: string): string =>
  `data/prTemplates/${language}/${templateId}/template.json`;

export const createTemplateService = ({
  root = TEMPLATE_ROOT,
  regenerate = (templateRoot) =>
    buildManifest({ root: templateRoot, reportOnly: false, log: null })
}: TemplateServiceOptions = {}) => {
  let mutationTail: Promise<void> = Promise.resolve();

  const relativeDiagnostic = (diagnostic: TemplateDiagnostic) => {
    const relative = path.relative(root, diagnostic.file).split(path.sep).join('/');
    return {
      path: relative.startsWith('..') ? 'data/prTemplates' : `data/prTemplates/${relative}`,
      message: diagnostic.message
    };
  };

  const inspectRepository = async (): Promise<
    | { ok: true; languages: string[]; templates: TemplateRecord[] }
    | { ok: false; response: ToolResponse }
  > => {
    try {
      const languages = await listLanguageFolders(root);
      if (!languages.includes('generic')) {
        return {
          ok: false,
          response: failure(
            'PIPELINE_INVALID',
            "The template pipeline is missing the required 'generic' language pack."
          )
        };
      }
      const result = await discoverAndValidateTemplates(languages, root);
      if (result.diagnostics.length > 0) {
        return {
          ok: false,
          response: failure(
            'PIPELINE_INVALID',
            'Existing template data is invalid; fix it before using the MCP tools.',
            result.diagnostics.map(relativeDiagnostic)
          )
        };
      }
      return { ok: true, languages, templates: result.templates };
    } catch {
      return {
        ok: false,
        response: failure('IO_ERROR', 'Unable to read the template pipeline.')
      };
    }
  };

  const validateLanguage = async (
    language: unknown,
    languages: string[]
  ): Promise<ToolResponse | null> => {
    if (typeof language !== 'string' || !LANGUAGE_PATTERN.test(language)) {
      return failure('INVALID_ARGUMENT', 'language must be a lowercase language-pack name.');
    }
    if (!languages.includes(language)) {
      return failure('INVALID_ARGUMENT', `Unknown language pack '${language}'.`);
    }
    try {
      const languagePath = path.join(root, language);
      const stat = await fs.lstat(languagePath);
      if (!stat.isDirectory() || stat.isSymbolicLink()) {
        return failure('INVALID_ARGUMENT', `Language pack '${language}' is not a safe directory.`);
      }
    } catch {
      return failure('INVALID_ARGUMENT', `Language pack '${language}' is unavailable.`);
    }
    return null;
  };

  const validateCandidate = async (
    language: unknown,
    template: unknown,
    repository: { languages: string[]; templates: TemplateRecord[] }
  ): Promise<
    | { ok: true; language: string; template: JsonObject; templateId: string; target: string }
    | { ok: false; response: ToolResponse }
  > => {
    const languageError = await validateLanguage(language, repository.languages);
    if (languageError) {
      return { ok: false, response: languageError };
    }
    if (!isObject(template)) {
      return {
        ok: false,
        response: failure('INVALID_TEMPLATE', 'template must be a JSON object.')
      };
    }
    let serialized: string;
    try {
      serialized = JSON.stringify(template);
    } catch {
      return {
        ok: false,
        response: failure('INVALID_TEMPLATE', 'template must be JSON-serializable.')
      };
    }
    if (Buffer.byteLength(serialized, 'utf8') > MAX_TEMPLATE_BYTES) {
      return {
        ok: false,
        response: failure('INVALID_TEMPLATE', 'template must not exceed 256 KiB.')
      };
    }

    const templateId = template.templateId;
    if (
      typeof templateId !== 'string' ||
      templateId.length > MAX_TEMPLATE_ID_LENGTH ||
      !TEMPLATE_ID_PATTERN.test(templateId)
    ) {
      return {
        ok: false,
        response: failure(
          'INVALID_TEMPLATE',
          'templateId must be 1–120 lowercase letters, numbers, or internal hyphens.'
        )
      };
    }

    const safeLanguage = language as string;
    const target = path.join(root, safeLanguage, templateId, 'template.json');
    const relativeTarget = targetRelativePath(safeLanguage, templateId);
    const relative = path.relative(root, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return {
        ok: false,
        response: failure('INVALID_TEMPLATE', 'The derived template path is unsafe.')
      };
    }

    const diagnostics: TemplateDiagnostic[] = [];
    validateTemplate(template, target, diagnostics);
    if (diagnostics.length > 0) {
      return {
        ok: false,
        response: failure(
          'INVALID_TEMPLATE',
          'The candidate template failed validation.',
          diagnostics.map((diagnostic) => ({
            path: relativeTarget,
            message: diagnostic.message
          }))
        )
      };
    }

    if (
      repository.templates.some(
        (record) => isObject(record.template) && record.template.templateId === templateId
      )
    ) {
      return {
        ok: false,
        response: failure('DUPLICATE_TEMPLATE', `Template '${templateId}' already exists.`)
      };
    }

    try {
      await fs.lstat(path.dirname(target));
      return {
        ok: false,
        response: failure('DUPLICATE_TEMPLATE', `Template path '${relativeTarget}' already exists.`)
      };
    } catch (error) {
      if (!isObject(error) || error.code !== 'ENOENT') {
        return {
          ok: false,
          response: failure('IO_ERROR', 'Unable to inspect the template destination.')
        };
      }
    }

    return { ok: true, language: safeLanguage, template, templateId, target };
  };

  const listTemplates = async (args: unknown): Promise<ToolResponse> => {
    if (args !== undefined && !isObject(args)) {
      return failure('INVALID_ARGUMENT', 'Tool arguments must be an object.');
    }
    const repository = await inspectRepository();
    if (!repository.ok) {
      return repository.response;
    }
    const language = isObject(args) ? args.language : undefined;
    if (language !== undefined) {
      const languageError = await validateLanguage(language, repository.languages);
      if (languageError) {
        return languageError;
      }
    }
    const templates = repository.templates
      .filter((record) => language === undefined || record.language === language)
      .map((record) => {
        const template = record.template as JsonObject;
        const bugs = Array.isArray(template.bugPatterns) ? template.bugPatterns : [];
        return {
          templateId: template.templateId,
          language: record.language,
          title: template.title,
          relativePath: targetRelativePath(record.language, String(template.templateId)),
          bugKinds: [
            ...new Set(
              bugs
                .filter(isObject)
                .map((bug) => bug.kind)
                .filter((kind): kind is string => typeof kind === 'string')
            )
          ].sort()
        };
      })
      .sort((left, right) =>
        left.language.localeCompare(right.language) ||
        String(left.templateId).localeCompare(String(right.templateId))
      );
    return { ok: true, count: templates.length, templates };
  };

  const validateTemplateTool = async (args: unknown): Promise<ToolResponse> => {
    if (!isObject(args)) {
      return failure('INVALID_ARGUMENT', 'Tool arguments must be an object.');
    }
    const repository = await inspectRepository();
    if (!repository.ok) {
      return repository.response;
    }
    const candidate = await validateCandidate(args.language, args.template, repository);
    if (!candidate.ok) {
      return candidate.response;
    }
    return {
      ok: true,
      valid: true,
      templateId: candidate.templateId,
      language: candidate.language,
      targetPath: targetRelativePath(candidate.language, candidate.templateId),
      diagnostics: []
    };
  };

  const addTemplateNow = async (args: unknown): Promise<ToolResponse> => {
    if (!isObject(args)) {
      return failure('INVALID_ARGUMENT', 'Tool arguments must be an object.');
    }
    const repository = await inspectRepository();
    if (!repository.ok) {
      return repository.response;
    }
    const candidate = await validateCandidate(args.language, args.template, repository);
    if (!candidate.ok) {
      return candidate.response;
    }

    const targetDirectory = path.dirname(candidate.target);
    const languageDirectory = path.dirname(targetDirectory);
    const stagingDirectory = path.join(
      languageDirectory,
      `.${candidate.templateId}.${randomUUID()}.tmp`
    );
    let published = false;
    try {
      await fs.mkdir(stagingDirectory, { recursive: false });
      await fs.writeFile(
        path.join(stagingDirectory, 'template.json'),
        `${JSON.stringify(candidate.template, null, 2)}\n`,
        { encoding: 'utf8', flag: 'wx' }
      );
      await fs.rename(stagingDirectory, targetDirectory);
      published = true;
      await regenerate(root);
      return {
        ok: true,
        created: true,
        templateId: candidate.templateId,
        language: candidate.language,
        relativePath: targetRelativePath(candidate.language, candidate.templateId),
        manifestsRegenerated: true
      };
    } catch {
      if (published) {
        try {
          await fs.rm(targetDirectory, { recursive: true, force: true });
          return failure(
            'PIPELINE_FAILED',
            'Manifest generation failed; the new template was removed.',
            [],
            true
          );
        } catch {
          return failure(
            'IO_ERROR',
            'Manifest generation failed and the new template could not be fully rolled back.',
            [],
            false
          );
        }
      }
      return failure('IO_ERROR', 'Unable to create the template safely.');
    } finally {
      await fs.rm(stagingDirectory, { recursive: true, force: true }).catch(() => undefined);
    }
  };

  const addTemplate = async (args: unknown): Promise<ToolResponse> => {
    const previous = mutationTail;
    let release: () => void = () => undefined;
    mutationTail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await addTemplateNow(args);
    } finally {
      release();
    }
  };

  return { listTemplates, validateTemplate: validateTemplateTool, addTemplate };
};

const tools = [
  {
    name: 'list_templates',
    description: "List validated PR templates from Approve Please's real data pipeline.",
    inputSchema: {
      type: 'object' as const,
      properties: { language: { type: 'string' } },
      additionalProperties: false
    }
  },
  {
    name: 'validate_template',
    description: 'Validate a candidate PR template without writing files.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        language: { type: 'string' },
        template: { type: 'object' }
      },
      required: ['language', 'template'],
      additionalProperties: false
    }
  },
  {
    name: 'add_template',
    description: 'Validate and add a new PR template, then regenerate the game manifests.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        language: { type: 'string' },
        template: { type: 'object' }
      },
      required: ['language', 'template'],
      additionalProperties: false
    }
  }
];

export const createMcpServer = () => {
  const service = createTemplateService();
  const server = new Server(
    { name: 'approve-please-templates', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const name = request.params.name as ToolName;
    const args = request.params.arguments;
    let response: ToolResponse;
    if (name === 'list_templates') {
      response = await service.listTemplates(args);
    } else if (name === 'validate_template') {
      response = await service.validateTemplate(args);
    } else if (name === 'add_template') {
      response = await service.addTemplate(args);
    } else {
      response = failure('INVALID_ARGUMENT', `Unknown tool '${request.params.name}'.`);
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(response) }],
      isError: !response.ok
    };
  });
  return server;
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const server = createMcpServer();
  server.connect(new StdioServerTransport()).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Failed to start MCP server.');
    process.exit(1);
  });
}
