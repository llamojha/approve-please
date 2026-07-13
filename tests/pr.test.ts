import { describe, expect, it } from 'vitest';
import { instantiatePullRequest } from '../utils/pr';
import type { PullRequestTemplate } from '../data/prs';

const makeTemplate = (overrides: Partial<PullRequestTemplate> = {}): PullRequestTemplate => ({
  templateId: 'tpl-basic',
  title: 'Base title',
  author: 'Base Author',
  description: 'Base description',
  tags: ['base-tag'],
  importance: 'normal',
  files: [
    {
      filename: 'index.ts',
      language: 'typescript',
      lines: [{ lineNumber: 1, content: 'const value = 1;', isNew: true }]
    }
  ],
  bugPatterns: [
    {
      kind: 'logic',
      lineNumbers: [1],
      severity: 'minor',
      description: 'Base bug description'
    }
  ],
  ...overrides
});

describe('instantiatePullRequest', () => {
  it('builds an id starting with the templateId', () => {
    const pr = instantiatePullRequest(makeTemplate(), 1, 0, 'en');
    expect(pr.id.startsWith('tpl-basic')).toBe(true);
    expect(pr.templateId).toBe('tpl-basic');
  });

  it('copies files and bugPatterns deeply', () => {
    const template = makeTemplate();
    const pr = instantiatePullRequest(template, 1, 0, 'en');

    pr.files[0].lines[0].content = 'mutated';
    pr.bugPatterns[0].lineNumbers.push(99);
    pr.tags.push('mutated-tag');

    expect(template.files[0].lines[0].content).toBe('const value = 1;');
    expect(template.bugPatterns[0].lineNumbers).toEqual([1]);
    expect(template.tags).toEqual(['base-tag']);
  });

  it('uses base fields for locale en without localized metadata', () => {
    const pr = instantiatePullRequest(makeTemplate(), 1, 0, 'en');
    expect(pr.title).toBe('Base title');
    expect(pr.description).toBe('Base description');
    expect(pr.author).toBe('Base Author');
    expect(pr.tags).toEqual(['base-tag']);
  });

  it('picks localized.es fields for locale es', () => {
    const template = makeTemplate({
      localized: {
        en: { title: 'EN title', description: 'EN description' },
        es: { title: 'ES title', description: 'ES description' }
      }
    });
    const pr = instantiatePullRequest(template, 1, 0, 'es');
    expect(pr.title).toBe('ES title');
    expect(pr.description).toBe('ES description');
  });

  it('falls back to localized.en, then base fields, for locale es', () => {
    const template = makeTemplate({
      localized: {
        en: { title: 'EN title' },
        es: { description: 'ES description' }
      }
    });
    const pr = instantiatePullRequest(template, 1, 0, 'es');
    // es has no title -> en fallback
    expect(pr.title).toBe('EN title');
    // es provides description directly
    expect(pr.description).toBe('ES description');
    // neither locale provides author/tags -> base fields
    expect(pr.author).toBe('Base Author');
    expect(pr.tags).toEqual(['base-tag']);
  });

  it('resolves bug pattern descriptions through the locale fallback chain', () => {
    const template = makeTemplate({
      bugPatterns: [
        {
          kind: 'logic',
          lineNumbers: [1],
          severity: 'minor',
          description: 'Base bug description',
          localizedDescription: { es: 'ES bug description' }
        },
        {
          kind: 'security',
          lineNumbers: [1],
          severity: 'major',
          description: 'Base security description',
          localizedDescription: { en: 'EN security description' }
        }
      ]
    });
    const pr = instantiatePullRequest(template, 1, 0, 'es');
    expect(pr.bugPatterns[0].description).toBe('ES bug description');
    expect(pr.bugPatterns[1].description).toBe('EN security description');
  });
});
