import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('data/prTemplates');

// The generic pack must stay eagerly imported: the day-1 tutorial PRs
// (pr-000-onboarding-readme-update, pr-001-sanitize-readme-api-key) live in
// data/prTemplates/generic/ and have to exist before the first wave fires at
// minute 0. Every other language pack is lazy-loaded via templateLoaders.
const EAGER_LANGUAGE = 'generic';

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
        continue;
      }
      if (entry.isFile() && entry.name === 'template.json') {
        results.push(fullPath);
      }
    }
  }
  return results.sort((a, b) => a.localeCompare(b));
};

const listLanguageFolders = async () => {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

const buildLanguagePack = async (language) => {
  const files = await readTemplates(path.join(ROOT, language));
  const seen = new Set();
  const imports = [
    `// Auto-generated manifest of pull-request templates (${language} pack)`,
    "import type { PullRequestTemplate } from '../../types';"
  ];
  const items = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const raw = await fs.readFile(file, 'utf8');
    let templateId;
    try {
      templateId = JSON.parse(raw)?.templateId ?? path.basename(path.dirname(file));
    } catch {
      templateId = path.basename(path.dirname(file));
    }
    const name = toIdentifier(templateId, seen);
    imports.push(`import ${name} from './${rel}';`);
    items.push(name);
  }

  const body = [
    'const templates = [',
    ...items.map((name) => `  ${name},`),
    '] as PullRequestTemplate[];',
    '',
    'export default templates;',
    ''
  ];

  const contents = `${imports.join('\n')}\n\n${body.join('\n')}`;
  const target = path.join(ROOT, `manifest.${language}.ts`);
  await fs.writeFile(target, contents, 'utf8');
};

const buildAggregator = async (languages) => {
  const lazyLanguages = languages.filter((language) => language !== EAGER_LANGUAGE);
  const lines = [
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
  ];

  const target = path.join(ROOT, 'templateManifest.ts');
  await fs.writeFile(target, lines.join('\n'), 'utf8');
};

const removeStalePacks = async (languages) => {
  const expected = new Set(languages.map((language) => `manifest.${language}.ts`));
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (/^manifest\..+\.ts$/.test(entry.name) && !expected.has(entry.name)) {
      await fs.unlink(path.join(ROOT, entry.name));
    }
  }
};

const buildManifest = async () => {
  const languages = await listLanguageFolders();
  if (!languages.includes(EAGER_LANGUAGE)) {
    throw new Error(
      `Missing required '${EAGER_LANGUAGE}' template folder — the day-1 tutorial templates must live there.`
    );
  }
  for (const language of languages) {
    await buildLanguagePack(language);
  }
  await buildAggregator(languages);
  await removeStalePacks(languages);
};

buildManifest().catch((error) => {
  console.error('Failed to build template manifest');
  console.error(error);
  process.exit(1);
});
