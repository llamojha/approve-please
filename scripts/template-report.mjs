import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUG_KINDS = ['logic', 'security', 'performance', 'style', 'accessibility'];
const SEVERITIES = ['minor', 'major', 'critical'];
const TEMPLATE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../data/prTemplates');

const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const sum = (values) => values.reduce((total, value) => total + value, 0);

const walkTemplateFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => compareText(left.name, right.name))
    .flatMap((entry) => {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return walkTemplateFiles(entryPath);
      }
      return entry.isFile() && entry.name === 'template.json' ? [entryPath] : [];
    });

const readTemplate = (templatePath) => {
  try {
    return JSON.parse(readFileSync(templatePath, 'utf8'));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read ${relative(TEMPLATE_ROOT, templatePath)}: ${reason}`);
  }
};

const makeLanguageStats = () => ({
  templateCount: 0,
  cleanCount: 0,
  missingSpanishCount: 0,
  kindCounts: Object.fromEntries(BUG_KINDS.map((kind) => [kind, 0])),
  severityCounts: Object.fromEntries(SEVERITIES.map((severity) => [severity, 0]))
});

const createTable = (headers, rows) => {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => String(row[index]).length))
  );
  const formatRow = (row) =>
    row.map((cell, index) => String(cell).padStart(widths[index])).join('  ');

  return [formatRow(headers), widths.map((width) => '-'.repeat(width)).join('  '), ...rows.map(formatRow)].join('\n');
};

const templates = walkTemplateFiles(TEMPLATE_ROOT).map((templatePath) => ({
  templatePath,
  language: relative(TEMPLATE_ROOT, templatePath).split('/')[0],
  template: readTemplate(templatePath)
}));

const statsByLanguage = new Map();
for (const { language, template } of templates) {
  const stats = statsByLanguage.get(language) ?? makeLanguageStats();
  const patterns = Array.isArray(template.bugPatterns) ? template.bugPatterns : [];

  stats.templateCount += 1;
  if (patterns.length === 0) {
    stats.cleanCount += 1;
  }
  if (template.localized?.es === undefined) {
    stats.missingSpanishCount += 1;
  }

  for (const kind of BUG_KINDS) {
    if (patterns.some((pattern) => pattern?.kind === kind)) {
      stats.kindCounts[kind] += 1;
    }
  }
  for (const pattern of patterns) {
    if (SEVERITIES.includes(pattern?.severity)) {
      stats.severityCounts[pattern.severity] += 1;
    }
  }

  statsByLanguage.set(language, stats);
}

const languageRows = [...statsByLanguage.keys()].sort(compareText).map((language) => {
  const stats = statsByLanguage.get(language);
  return [
    language,
    ...BUG_KINDS.map((kind) => stats.kindCounts[kind]),
    stats.cleanCount,
    stats.templateCount
  ];
});
const languageTotals = [
  'TOTAL',
  ...BUG_KINDS.map((kind) => sum(languageRows.map((row) => row[BUG_KINDS.indexOf(kind) + 1]))),
  sum(languageRows.map((row) => row[BUG_KINDS.length + 1])),
  sum(languageRows.map((row) => row[BUG_KINDS.length + 2]))
];

const severityRows = [...statsByLanguage.keys()].sort(compareText).map((language) => {
  const stats = statsByLanguage.get(language);
  const severityCounts = SEVERITIES.map((severity) => stats.severityCounts[severity]);
  return [language, ...severityCounts, sum(severityCounts)];
});
const severityTotals = [
  'TOTAL',
  ...SEVERITIES.map((severity) => sum(severityRows.map((row) => row[SEVERITIES.indexOf(severity) + 1]))),
  sum(severityRows.map((row) => row[SEVERITIES.length + 1]))
];

const localizationRows = [...statsByLanguage.keys()].sort(compareText).map((language) => {
  const stats = statsByLanguage.get(language);
  return [language, stats.templateCount, stats.missingSpanishCount];
});
const localizationTotals = [
  'TOTAL',
  sum(localizationRows.map((row) => row[1])),
  sum(localizationRows.map((row) => row[2]))
];

console.log('Template coverage report');
console.log(`Template files discovered: ${templates.length}`);
console.log('\nTemplates by language and bug kind (a template is counted once per kind)');
console.log(
  createTable(
    ['Language', 'Logic', 'Security', 'Performance', 'Style', 'Accessibility', 'Clean', 'Templates'],
    [...languageRows, languageTotals]
  )
);
console.log('\nBug patterns by language and severity');
console.log(createTable(['Language', 'Minor', 'Major', 'Critical', 'Patterns'], [...severityRows, severityTotals]));
console.log('\nTemplates missing localized.es');
console.log(createTable(['Language', 'Templates', 'Missing es'], [...localizationRows, localizationTotals]));
console.log(`\nTemplate total: ${localizationTotals[1]}`);
