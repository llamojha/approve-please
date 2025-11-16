import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('data/prTemplates');

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

const readTemplates = async () => {
  const stack = [ROOT];
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

const buildManifest = async () => {
  const files = await readTemplates();
  const seen = new Set();
  const imports = [
    '// Auto-generated manifest of pull-request templates',
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
    'export const templateManifest = [',
    ...items.map((name) => `  ${name},`),
    '] as PullRequestTemplate[];',
    '',
    'export default templateManifest;',
    ''
  ];

  const contents = `${imports.join('\n')}\n\n${body.join('\n')}`;
  const target = path.join(ROOT, 'templateManifest.ts');
  await fs.writeFile(target, contents, 'utf8');
};

buildManifest().catch((error) => {
  console.error('Failed to build template manifest');
  console.error(error);
  process.exit(1);
});
