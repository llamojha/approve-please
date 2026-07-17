import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve('data/prTemplates');
const EAGER_LANGUAGE = 'generic';
const BUG_KINDS = new Set(['logic', 'security', 'performance', 'style', 'accessibility']);
const SEVERITIES = new Set(['minor', 'major', 'critical']);
const IMPORTANCE = new Set(['low', 'normal', 'high']);
const LOCALES = new Set(['en', 'es']);
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

export const readTemplates = async (dir) => {
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

export const listLanguageFolders = async (root = DEFAULT_ROOT) => {
  const entries = await fs.readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(comparePaths);
};

const validateString = (value, field, file, diagnostics) => {
  if (typeof value[field] !== 'string') {
    diagnostics.push({ file, message: `${field} must be a string.` });
    return false;
  }
  return true;
};

const validateStringArray = (value, field, file, diagnostics) => {
  if (!Array.isArray(value[field])) {
    diagnostics.push({ file, message: `${field} must be an array.` });
    return false;
  }

  value[field].forEach((item, index) => {
    if (typeof item !== 'string') {
      diagnostics.push({ file, message: `${field}[${index}] must be a string.` });
    }
  });
  return true;
};

const validateLocalized = (localized, file, diagnostics) => {
  if (localized === undefined) {
    return;
  }
  if (!isObject(localized)) {
    diagnostics.push({ file, message: 'localized must be an object.' });
    return;
  }

  Object.entries(localized).forEach(([locale, metadata]) => {
    if (!LOCALES.has(locale)) {
      diagnostics.push({ file, message: `localized.${locale} is not supported; use en or es.` });
    }
    if (!isObject(metadata)) {
      diagnostics.push({ file, message: `localized.${locale} must be an object.` });
      return;
    }
    ['title', 'author', 'description'].forEach((field) => {
      if (metadata[field] !== undefined && typeof metadata[field] !== 'string') {
        diagnostics.push({ file, message: `localized.${locale}.${field} must be a string.` });
      }
    });
    if (metadata.tags !== undefined) {
      if (!Array.isArray(metadata.tags)) {
        diagnostics.push({ file, message: `localized.${locale}.tags must be an array.` });
      } else {
        metadata.tags.forEach((tag, index) => {
          if (typeof tag !== 'string') {
            diagnostics.push({
              file,
              message: `localized.${locale}.tags[${index}] must be a string.`
            });
          }
        });
      }
    }
  });
};

export const validateTemplate = (template, file, diagnostics) => {
  if (!isObject(template)) {
    diagnostics.push({ file, message: 'Template root must be an object.' });
    return;
  }

  const hasTemplateId = validateString(template, 'templateId', file, diagnostics);
  ['title', 'author', 'description'].forEach((field) => validateString(template, field, file, diagnostics));
  validateStringArray(template, 'tags', file, diagnostics);
  validateLocalized(template.localized, file, diagnostics);

  if (typeof template.importance !== 'string') {
    diagnostics.push({ file, message: 'importance must be a string.' });
  } else if (!IMPORTANCE.has(template.importance)) {
    diagnostics.push({ file, message: `importance must be one of: ${[...IMPORTANCE].join(', ')}.` });
  }

  if (hasTemplateId && template.templateId !== path.basename(path.dirname(file))) {
    diagnostics.push({
      file,
      message: `templateId '${template.templateId}' must match folder '${path.basename(path.dirname(file))}'.`
    });
  }

  const allLineNumbers = new Set();
  const newLineNumbers = new Set();
  if (!Array.isArray(template.files)) {
    diagnostics.push({ file, message: 'files must be an array.' });
  } else if (template.files.length === 0) {
    diagnostics.push({ file, message: 'files must not be empty.' });
  } else {
    template.files.forEach((diff, fileIndex) => {
      const prefix = `files[${fileIndex}]`;
      if (!isObject(diff)) {
        diagnostics.push({ file, message: `${prefix} must be an object.` });
        return;
      }
      if (typeof diff.filename !== 'string') {
        diagnostics.push({ file, message: `${prefix}.filename must be a string.` });
      }
      if (typeof diff.language !== 'string') {
        diagnostics.push({ file, message: `${prefix}.language must be a string.` });
      }
      if (!Array.isArray(diff.lines)) {
        diagnostics.push({ file, message: `${prefix}.lines must be an array.` });
        return;
      }
      if (diff.lines.length === 0) {
        diagnostics.push({ file, message: `${prefix}.lines must not be empty.` });
      }
      diff.lines.forEach((line, lineIndex) => {
        const linePrefix = `${prefix}.lines[${lineIndex}]`;
        if (!isObject(line)) {
          diagnostics.push({ file, message: `${linePrefix} must be an object.` });
          return;
        }
        const validNumber = Number.isInteger(line.lineNumber) && line.lineNumber >= 1;
        if (!validNumber) {
          diagnostics.push({ file, message: `${linePrefix}.lineNumber must be an integer of at least 1.` });
        } else {
          allLineNumbers.add(line.lineNumber);
          if (line.isNew === true) {
            newLineNumbers.add(line.lineNumber);
          }
        }
        if (typeof line.content !== 'string') {
          diagnostics.push({ file, message: `${linePrefix}.content must be a string.` });
        }
        if (typeof line.isNew !== 'boolean') {
          diagnostics.push({ file, message: `${linePrefix}.isNew must be a boolean.` });
        }
      });
    });
  }

  if (!Array.isArray(template.bugPatterns)) {
    diagnostics.push({ file, message: 'bugPatterns must be an array.' });
    return;
  }

  template.bugPatterns.forEach((bug, bugIndex) => {
    const prefix = `bugPatterns[${bugIndex}]`;
    if (!isObject(bug)) {
      diagnostics.push({ file, message: `${prefix} must be an object.` });
      return;
    }
    if (typeof bug.kind !== 'string') {
      diagnostics.push({ file, message: `${prefix}.kind must be a string.` });
    } else if (!BUG_KINDS.has(bug.kind)) {
      diagnostics.push({ file, message: `${prefix}.kind must be one of: ${[...BUG_KINDS].join(', ')}.` });
    }
    if (typeof bug.severity !== 'string') {
      diagnostics.push({ file, message: `${prefix}.severity must be a string.` });
    } else if (!SEVERITIES.has(bug.severity)) {
      diagnostics.push({ file, message: `${prefix}.severity must be one of: ${[...SEVERITIES].join(', ')}.` });
    }
    if (bug.description !== undefined && typeof bug.description !== 'string') {
      diagnostics.push({ file, message: `${prefix}.description must be a string.` });
    }
    if (bug.localizedDescription !== undefined) {
      if (!isObject(bug.localizedDescription)) {
        diagnostics.push({ file, message: `${prefix}.localizedDescription must be an object.` });
      } else {
        Object.entries(bug.localizedDescription).forEach(([locale, description]) => {
          if (!LOCALES.has(locale)) {
            diagnostics.push({
              file,
              message: `${prefix}.localizedDescription.${locale} is not supported; use en or es.`
            });
          }
          if (typeof description !== 'string') {
            diagnostics.push({
              file,
              message: `${prefix}.localizedDescription.${locale} must be a string.`
            });
          }
        });
      }
    }
    if (!Array.isArray(bug.lineNumbers)) {
      diagnostics.push({ file, message: `${prefix}.lineNumbers must be an array.` });
      return;
    }
    if (bug.lineNumbers.length === 0) {
      diagnostics.push({ file, message: `${prefix}.lineNumbers must not be empty.` });
    }
    bug.lineNumbers.forEach((lineNumber, lineIndex) => {
      const linePrefix = `${prefix}.lineNumbers[${lineIndex}]`;
      if (!Number.isInteger(lineNumber) || lineNumber < 1) {
        diagnostics.push({ file, message: `${linePrefix} must be an integer of at least 1.` });
      } else if (!allLineNumbers.has(lineNumber)) {
        diagnostics.push({ file, message: `${linePrefix} references missing line ${lineNumber}.` });
      } else if (!newLineNumbers.has(lineNumber)) {
        diagnostics.push({ file, message: `${linePrefix} references unchanged line ${lineNumber}; bug lines must be new.` });
      }
    });
  });
};

export const discoverAndValidateTemplates = async (languages, root = DEFAULT_ROOT) => {
  const diagnostics = [];
  const templates = [];

  for (const language of languages) {
    const files = await readTemplates(path.join(root, language));
    for (const file of files) {
      let template;
      try {
        template = JSON.parse(await fs.readFile(file, 'utf8'));
      } catch (error) {
        diagnostics.push({ file, message: `Invalid JSON: ${error.message}` });
        continue;
      }
      validateTemplate(template, file, diagnostics);
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

const buildLanguagePack = (language, templates, root = DEFAULT_ROOT) => {
  const seen = new Set();
  const imports = [
    `// Auto-generated manifest of pull-request templates (${language} pack)`,
    "import type { PullRequestTemplate } from '../../types';"
  ];
  const items = [];

  templates.forEach(({ file, template }) => {
    const rel = path.relative(root, file).split(path.sep).join('/');
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

const writeManifestsWithRollback = async (outputs, languages, root = DEFAULT_ROOT) => {
  const temporaryDirectory = await fs.mkdtemp(path.join(path.dirname(root), '.manifest-tmp-'));
  const originals = new Map();
  try {
    await Promise.all(
      [...outputs.entries()].map(([target, contents]) =>
        fs.writeFile(path.join(temporaryDirectory, path.basename(target)), contents, 'utf8')
      )
    );

    const expected = new Set(languages.map((language) => `manifest.${language}.ts`));
    const entries = await fs.readdir(root, { withFileTypes: true });
    const staleTargets = entries
      .filter(
        (entry) =>
          entry.isFile() && /^manifest\..+\.ts$/.test(entry.name) && !expected.has(entry.name)
      )
      .map((entry) => path.join(root, entry.name));
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
    await fs.rm(temporaryDirectory, { recursive: true, force: true }).catch(() => undefined);
  }
};

const printDiagnostics = (diagnostics, templateCount, log = console.log) => {
  const ordered = [...diagnostics].sort(
    (left, right) => comparePaths(relativePath(left.file), relativePath(right.file)) || left.message.localeCompare(right.message)
  );
  log(`Template validation: ${templateCount} template(s) checked; ${ordered.length} error(s).`);
  ordered.forEach(({ file, message }) => log(`${relativePath(file)}: ${message}`));
};

export const buildManifest = async ({
  root = DEFAULT_ROOT,
  reportOnly: shouldReportOnly = reportOnly,
  log = console.log
} = {}) => {
  const languages = await listLanguageFolders(root);
  if (!languages.includes(EAGER_LANGUAGE)) {
    throw new Error(
      `Missing required '${EAGER_LANGUAGE}' template folder — the day-1 tutorial templates must live there.`
    );
  }

  const { diagnostics, templates } = await discoverAndValidateTemplates(languages, root);
  if (log) {
    printDiagnostics(diagnostics, templates.length, log);
  }
  if (shouldReportOnly) {
    if (log) {
      log('Report-only mode: no manifests were written.');
    }
    return { diagnostics, templates };
  }
  if (diagnostics.length > 0) {
    throw new Error('Template validation failed; manifests were not written.');
  }

  const outputs = new Map();
  languages.forEach((language) => {
    const packTemplates = templates.filter((entry) => entry.language === language);
    outputs.set(path.join(root, `manifest.${language}.ts`), buildLanguagePack(language, packTemplates, root));
  });
  outputs.set(path.join(root, 'templateManifest.ts'), buildAggregator(languages));
  await writeManifestsWithRollback(outputs, languages, root);
  return { diagnostics, templates };
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  buildManifest().catch((error) => {
    console.error('Failed to build template manifest');
    console.error(error);
    process.exit(1);
  });
}
