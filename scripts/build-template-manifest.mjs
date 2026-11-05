import { promises as fs } from 'node:fs';
import path from 'node:path';
import { validateTemplate } from '../lib/templates/validation.mjs';

const ROOT = path.resolve('data/prTemplates');
const EAGER_LANGUAGE = 'generic';
const reportOnly = process.argv.slice(2).includes('--report-only');

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const relativePath = (file) => path.relative(process.cwd(), file).split(path.sep).join('/');
const comparePaths = (left, right) => left.localeCompare(right);

const toIdentifier = (templateId, seen) => {
  const slug = templateId
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'template';
  let base = slug;
  if (/^[0-9]/.test(base)) {
    base = `_${base}`;
  }

  let name = `tpl_${base}`;
  let counter = 1;
  while (seen.has(name)) {
    counter += 1;
    name = `tpl_${base}_${counter}`;
  }
  seen.add(name);
  return name;
};

const readTemplates = async (dir) => {
  const stack = [dir];
  const results = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name === 'template.json') {
        results.push(fullPath);
      }
    }
  }

  return results.sort(comparePaths);
};

const listLanguageFolders = async () => {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(comparePaths);
};

const discoverAndValidateTemplates = async (languages) => {
  const diagnostics = [];
  const templates = [];

  for (const language of languages) {
    const files = await readTemplates(path.join(ROOT, language));
    for (const file of files) {
      let template;
      try {
        template = JSON.parse(await fs.readFile(file, 'utf8'));
      } catch (error) {
        diagnostics.push({ file, message: `Invalid JSON: ${error.message}` });
        continue;
      }
      diagnostics.push(...validateTemplate(template).map((diagnostic) => ({ file, ...diagnostic })));
      if (isObject(template) && typeof template.templateId === 'string' && template.templateId !== path.basename(path.dirname(file))) {
        diagnostics.push({
          file,
          path: 'templateId',
          code: 'folder_mismatch',
          message: `templateId '${template.templateId}' must match folder '${path.basename(path.dirname(file))}'.`
        });
      }
      templates.push({ file, language, template });
    }
  }

  const ids = new Map();
  templates.forEach(({ file, template }) => {
    if (!isObject(template) || typeof template.templateId !== 'string') {
      return;
    }
    const firstFile = ids.get(template.templateId);
    if (firstFile) {
      diagnostics.push({
        file,
        message: `templateId '${template.templateId}' duplicates ${relativePath(firstFile)}.`
      });
    } else {
      ids.set(template.templateId, file);
    }
  });

  return { diagnostics, templates };
};

const buildLanguagePack = (language, templates) => {
  const seen = new Set();
  const imports = [
    `// Auto-generated manifest of pull-request templates (${language} pack)`,
    "import type { PullRequestTemplate } from '../../types';"
  ];
  const items = [];

  templates.forEach(({ file, template }) => {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const name = toIdentifier(template.templateId, seen);
    imports.push(`import ${name} from './${rel}';`);
    items.push(name);
  });

  return [
    ...imports,
    '',
    'const templates = [',
    ...items.map((name) => `  ${name},`),
    '] as PullRequestTemplate[];',
    '',
    'export default templates;',
    ''
  ].join('\n');
};

const buildAggregator = (languages) => {
  const lazyLanguages = languages.filter((language) => language !== EAGER_LANGUAGE);
  return [
    '// Auto-generated manifest of pull-request templates',
    '// Aggregates the per-language packs in this folder: the generic pack is',
    '// imported eagerly (the day-1 tutorial PRs live there and must exist before',
    '// the first wave at minute 0); every other pack is lazy-loaded on demand.',
    "import type { PullRequestTemplate } from '../../types';",
    `import genericTemplates from './manifest.${EAGER_LANGUAGE}';`,
    '',
    'export const eagerTemplates: PullRequestTemplate[] = genericTemplates;',
    '',
    'export const templateLoaders: Record<string, () => Promise<PullRequestTemplate[]>> = {',
    ...lazyLanguages.map(
      (language) => `  ${language}: () => import('./manifest.${language}').then((m) => m.default),`
    ),
    '};',
    ''
  ].join('\n');
};

const writeManifestsWithRollback = async (outputs, languages) => {
  const temporaryDirectory = await fs.mkdtemp(path.join(path.dirname(ROOT), '.manifest-tmp-'));
  const originals = new Map();
  try {
    await Promise.all(
      [...outputs.entries()].map(([target, contents]) =>
        fs.writeFile(path.join(temporaryDirectory, path.basename(target)), contents, 'utf8')
      )
    );

    const expected = new Set(languages.map((language) => `manifest.${language}.ts`));
    const entries = await fs.readdir(ROOT, { withFileTypes: true });
    const staleTargets = entries
      .filter(
        (entry) =>
          entry.isFile() && /^manifest\..+\.ts$/.test(entry.name) && !expected.has(entry.name)
      )
      .map((entry) => path.join(ROOT, entry.name));
    const affectedTargets = new Set([...outputs.keys(), ...staleTargets]);

    for (const target of affectedTargets) {
      try {
        originals.set(target, await fs.readFile(target));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
        originals.set(target, null);
      }
    }

    try {
      for (const target of outputs.keys()) {
        await fs.rename(path.join(temporaryDirectory, path.basename(target)), target);
      }
      for (const target of staleTargets) {
        await fs.unlink(target);
      }
    } catch (error) {
      await Promise.all(
        [...originals.entries()].map(([target, contents]) =>
          contents === null
            ? fs.rm(target, { force: true })
            : fs.writeFile(target, contents)
        )
      );
      throw error;
    }
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
};

const printDiagnostics = (diagnostics, templateCount) => {
  const ordered = [...diagnostics].sort(
    (left, right) => comparePaths(relativePath(left.file), relativePath(right.file)) || left.message.localeCompare(right.message)
  );
  console.log(`Template validation: ${templateCount} template(s) checked; ${ordered.length} error(s).`);
  ordered.forEach(({ file, message }) => console.log(`${relativePath(file)}: ${message}`));
};

const buildManifest = async () => {
  const languages = await listLanguageFolders();
  if (!languages.includes(EAGER_LANGUAGE)) {
    throw new Error(
      `Missing required '${EAGER_LANGUAGE}' template folder — the day-1 tutorial templates must live there.`
    );
  }

  const { diagnostics, templates } = await discoverAndValidateTemplates(languages);
  printDiagnostics(diagnostics, templates.length);
  if (reportOnly) {
    console.log('Report-only mode: no manifests were written.');
    return;
  }
  if (diagnostics.length > 0) {
    throw new Error('Template validation failed; manifests were not written.');
  }

  const outputs = new Map();
  languages.forEach((language) => {
    const packTemplates = templates.filter((entry) => entry.language === language);
    outputs.set(path.join(ROOT, `manifest.${language}.ts`), buildLanguagePack(language, packTemplates));
  });
  outputs.set(path.join(ROOT, 'templateManifest.ts'), buildAggregator(languages));
  await writeManifestsWithRollback(outputs, languages);
};

buildManifest().catch((error) => {
  console.error('Failed to build template manifest');
  console.error(error);
  process.exit(1);
});
