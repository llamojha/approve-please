import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createTemplateService } from '../mcp/template-server';

const temporaryRoots: string[] = [];

const makeTemplate = (templateId: string, overrides: Record<string, unknown> = {}) => ({
  templateId,
  title: 'Add guarded account lookup',
  author: 'Kiro Bot',
  description: 'Adds an account lookup endpoint for support agents.',
  tags: ['security'],
  importance: 'normal',
  files: [
    {
      filename: 'src/accounts.ts',
      language: 'typescript',
      lines: [
        { lineNumber: 10, content: 'export const findAccount = (id: string) => {', isNew: true },
        { lineNumber: 11, content: '  return db.query(`SELECT * FROM accounts WHERE id = ${id}`);', isNew: true },
        { lineNumber: 12, content: '};', isNew: true }
      ]
    }
  ],
  bugPatterns: [
    {
      kind: 'security',
      lineNumbers: [11],
      severity: 'critical',
      description: 'User input is interpolated into SQL instead of passed as a parameter.'
    }
  ],
  ...overrides
});

const writeTemplate = async (root: string, language: string, template: Record<string, unknown>) => {
  const templateId = String(template.templateId);
  const directory = path.join(root, language, templateId);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(
    path.join(directory, 'template.json'),
    `${JSON.stringify(template, null, 2)}\n`,
    'utf8'
  );
};

const createFixture = async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'approve-please-mcp-'));
  temporaryRoots.push(root);
  await fs.mkdir(path.join(root, 'generic'), { recursive: true });
  await fs.mkdir(path.join(root, 'typescript'), { recursive: true });
  await writeTemplate(root, 'generic', makeTemplate('generic-existing'));
  return root;
};

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true }))
  );
});

describe('template MCP service', () => {
  it('lists real templates and filters by language', async () => {
    const root = await createFixture();
    await writeTemplate(root, 'typescript', makeTemplate('typescript-existing'));
    const service = createTemplateService({ root, regenerate: async () => undefined });

    const all = await service.listTemplates({});
    const typescript = await service.listTemplates({ language: 'typescript' });

    expect(all).toMatchObject({ ok: true, count: 2 });
    expect(typescript).toMatchObject({
      ok: true,
      count: 1,
      templates: [
        {
          templateId: 'typescript-existing',
          language: 'typescript',
          bugKinds: ['security']
        }
      ]
    });
  });

  it('validates a candidate without writing to disk', async () => {
    const root = await createFixture();
    const service = createTemplateService({ root, regenerate: async () => undefined });
    const before = await fs.readdir(path.join(root, 'typescript'));

    const result = await service.validateTemplate({
      language: 'typescript',
      template: makeTemplate('typescript-candidate')
    });
    const after = await fs.readdir(path.join(root, 'typescript'));

    expect(result).toMatchObject({
      ok: true,
      valid: true,
      templateId: 'typescript-candidate'
    });
    expect(after).toEqual(before);
  });

  it('returns canonical bug-line diagnostics', async () => {
    const root = await createFixture();
    const service = createTemplateService({ root, regenerate: async () => undefined });
    const template = makeTemplate('typescript-unchanged-line');
    const files = template.files as Array<{
      lines: Array<{ lineNumber: number; content: string; isNew: boolean }>;
    }>;
    files[0].lines[1].isNew = false;

    const result = await service.validateTemplate({ language: 'typescript', template });

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'INVALID_TEMPLATE',
        diagnostics: [
          {
            message:
              'bugPatterns[0].lineNumbers[0] references unchanged line 11; bug lines must be new.'
          }
        ]
      }
    });
  });

  it('rejects unsafe language and template identifiers', async () => {
    const root = await createFixture();
    const service = createTemplateService({ root, regenerate: async () => undefined });

    const languageResult = await service.validateTemplate({
      language: '../typescript',
      template: makeTemplate('typescript-safe')
    });
    const idResult = await service.validateTemplate({
      language: 'typescript',
      template: makeTemplate('../escape')
    });

    expect(languageResult).toMatchObject({ ok: false, error: { code: 'INVALID_ARGUMENT' } });
    expect(idResult).toMatchObject({ ok: false, error: { code: 'INVALID_TEMPLATE' } });
  });

  it('rejects a duplicate ID from another language pack', async () => {
    const root = await createFixture();
    const service = createTemplateService({ root, regenerate: async () => undefined });

    const result = await service.validateTemplate({
      language: 'typescript',
      template: makeTemplate('generic-existing')
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_TEMPLATE' } });
  });

  it('atomically adds formatted JSON and invokes manifest regeneration', async () => {
    const root = await createFixture();
    const regenerated: string[] = [];
    const service = createTemplateService({
      root,
      regenerate: async (templateRoot) => {
        regenerated.push(templateRoot);
      }
    });
    const template = makeTemplate('typescript-added');

    const result = await service.addTemplate({ language: 'typescript', template });
    const contents = await fs.readFile(
      path.join(root, 'typescript/typescript-added/template.json'),
      'utf8'
    );

    expect(result).toMatchObject({
      ok: true,
      created: true,
      manifestsRegenerated: true
    });
    expect(regenerated).toEqual([root]);
    expect(contents).toBe(`${JSON.stringify(template, null, 2)}\n`);
  });

  it('serializes simultaneous adds so only one can create an ID', async () => {
    const root = await createFixture();
    const service = createTemplateService({ root, regenerate: async () => undefined });
    const input = {
      language: 'typescript',
      template: makeTemplate('typescript-race')
    };

    const results = await Promise.all([service.addTemplate(input), service.addTemplate(input)]);

    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toMatchObject([
      { error: { code: 'DUPLICATE_TEMPLATE' } }
    ]);
  });

  it('removes a published template when manifest generation fails', async () => {
    const root = await createFixture();
    const service = createTemplateService({
      root,
      regenerate: async () => {
        throw new Error('injected failure');
      }
    });

    const result = await service.addTemplate({
      language: 'typescript',
      template: makeTemplate('typescript-rollback')
    });

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PIPELINE_FAILED', rolledBack: true }
    });
    await expect(
      fs.stat(path.join(root, 'typescript/typescript-rollback'))
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects unknown language packs and oversized candidates', async () => {
    const root = await createFixture();
    const service = createTemplateService({ root, regenerate: async () => undefined });

    const unknown = await service.validateTemplate({
      language: 'ruby',
      template: makeTemplate('ruby-candidate')
    });
    const oversized = await service.validateTemplate({
      language: 'typescript',
      template: makeTemplate('typescript-oversized', { description: 'x'.repeat(300_000) })
    });

    expect(unknown).toMatchObject({ ok: false, error: { code: 'INVALID_ARGUMENT' } });
    expect(oversized).toMatchObject({ ok: false, error: { code: 'INVALID_TEMPLATE' } });
  });

  it('does not overwrite an existing destination directory', async () => {
    const root = await createFixture();
    const target = path.join(root, 'typescript/typescript-existing-path');
    await fs.mkdir(target);
    await fs.writeFile(path.join(target, 'keep.txt'), 'keep', 'utf8');
    const service = createTemplateService({ root, regenerate: async () => undefined });

    const result = await service.addTemplate({
      language: 'typescript',
      template: makeTemplate('typescript-existing-path')
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_TEMPLATE' } });
    await expect(fs.readFile(path.join(target, 'keep.txt'), 'utf8')).resolves.toBe('keep');
  });

  it('does not follow or replace a symlinked destination', async () => {
    const root = await createFixture();
    const target = path.join(root, 'typescript/typescript-symlink');
    await fs.symlink(path.join(root, 'generic/generic-existing'), target, 'dir');
    const service = createTemplateService({ root, regenerate: async () => undefined });

    const result = await service.addTemplate({
      language: 'typescript',
      template: makeTemplate('typescript-symlink')
    });

    expect(result).toMatchObject({ ok: false, error: { code: 'DUPLICATE_TEMPLATE' } });
    expect((await fs.lstat(target)).isSymbolicLink()).toBe(true);
  });
});
