import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { eagerTemplates, templateLoaders } from '../data/prs';

const TEMPLATE_ROOT = path.resolve(__dirname, '../data/prTemplates');

const languageFoldersOnDisk = (): string[] =>
  readdirSync(TEMPLATE_ROOT).filter((entry) =>
    statSync(path.join(TEMPLATE_ROOT, entry)).isDirectory()
  );

describe('templateLoaders', () => {
  it('has a loader for every non-generic language folder on disk', () => {
    const expected = languageFoldersOnDisk()
      .filter((folder) => folder !== 'generic')
      .sort();
    expect(Object.keys(templateLoaders).sort()).toEqual(expected);
  });

  it('loaders resolve to non-empty template arrays', async () => {
    for (const [language, loader] of Object.entries(templateLoaders)) {
      const templates = await loader();
      expect(Array.isArray(templates), `${language} pack is an array`).toBe(true);
      expect(templates.length, `${language} pack is non-empty`).toBeGreaterThan(0);
      templates.forEach((template) => {
        expect(template.templateId).toBeTruthy();
      });
    }
  });
});

describe('eagerTemplates', () => {
  it('contains both day-1 tutorial templates', () => {
    const ids = eagerTemplates.map((template) => template.templateId);
    expect(ids).toContain('pr-000-onboarding-readme-update');
    expect(ids).toContain('pr-001-sanitize-readme-api-key');
  });
});
