import { describe, expect, it } from 'vitest';
import { normalizePullRequest } from '../utils/templateNormalization';
import { instantiatePullRequest } from '../utils/pr';
import type { PullRequest } from '../types';
import { eagerTemplates, templateLoaders } from '../data/prs';

export const fixture = (): PullRequest => ({
  id: 'pr', templateId: 'template', title: 'Fix', author: 'Guest', description: '', tags: [],
  importance: 'normal', estimatedReviewSeconds: 20,
  files: [{ filename: 'a.ts', language: 'typescript', lines: [
    { lineNumber: 1, content: 'bad()', isNew: true },
    { lineNumber: 2, content: 'ok()', isNew: false }
  ] }], bugPatterns: [{ kind: 'logic', severity: 'major', lineNumbers: [1] }]
});

describe('normalization boundary', () => {
  it('keeps legacy context and creates deterministic identities without mutation', () => {
    const pr = fixture(); const normalized = normalizePullRequest(pr);
    expect(normalized.files[0].lines[1].kind).toBe('context');
    expect(normalized.bugPatterns[0].lineRefs).toEqual([{ filename: 'a.ts', rowId: 'line-1' }]);
    expect(pr.files[0].lines[0].rowId).toBeUndefined();
  });
  it('rejects ambiguous legacy refs and resolves authored file identities', () => {
    const pr = fixture(); pr.files.push({ ...pr.files[0], filename: 'b.ts' });
    expect(() => normalizePullRequest(pr)).toThrow('ambiguous');
    pr.bugPatterns[0].lineRefs = [{ filename: 'b.ts', rowId: 'line-1' }];
    expect(normalizePullRequest(pr).bugPatterns[0].lineRefs[0].filename).toBe('b.ts');
    pr.bugPatterns[0].lineRefs[0].rowId = 'missing';
    expect(() => normalizePullRequest(pr)).toThrow('Unknown');
  });
  it('rejects duplicate files, rows and conflicting legacy metadata', () => {
    const pr = fixture(); pr.files.push(pr.files[0]);
    expect(() => normalizePullRequest(pr)).toThrow('Duplicate filename');
    pr.files.pop(); pr.files[0].lines[1].rowId = 'line-1';
    expect(() => normalizePullRequest(pr)).toThrow('Duplicate row');
    delete pr.files[0].lines[1].rowId; pr.files[0].lines[1].kind = 'addition';
    expect(() => normalizePullRequest(pr)).toThrow('disagree');
  });
  it('preserves and deep copies character metadata during instantiation', () => {
    const template = { ...fixture(), authorId: 'lucia-navarro', reactions: { 'correct-rejection': { es: 'Gracias' } },
      bugPatterns: [{ ...fixture().bugPatterns[0], lineRefs: [{ filename: 'a.ts', rowId: 'line-1' }] }] };
    const pr = instantiatePullRequest(template, 1, 0, 'es');
    expect(pr.authorId).toBe('lucia-navarro');
    pr.reactions!['correct-rejection']!.es = 'changed';
    pr.bugPatterns[0].lineRefs![0].rowId = 'changed';
    expect(template.reactions['correct-rejection'].es).toBe('Gracias');
    expect(template.bugPatterns[0].lineRefs[0].rowId).toBe('line-1');
  });
  it('normalizes every catalog scenario in both locales', async () => {
    const loaded = await Promise.all(Object.values(templateLoaders).map((loader) => loader()));
    const templates = [...eagerTemplates, ...loaded.flat()];
    expect(templates.length).toBe(390);
    for (const template of templates) for (const locale of ['en', 'es'] as const) {
      expect(() => normalizePullRequest(instantiatePullRequest(template, 1, 0, locale))).not.toThrow();
    }
  });
});
