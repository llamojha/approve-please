import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateTemplate } from '../lib/templates/validation.mjs';

const fixture = () => ({
  templateId: 'example', title: 'Example', author: 'Guest', description: '',
  tags: [], importance: 'normal',
  files: [{ filename: 'index.ts', language: 'typescript', lines: [
    { lineNumber: 1, content: 'broken()', isNew: true },
    { lineNumber: 2, content: 'context', isNew: false }
  ] }],
  bugPatterns: [{ kind: 'logic', severity: 'major', lineNumbers: [1] }]
});

describe('shared template validation', () => {
  it('returns field-addressable diagnostics for malformed content without mutation', () => {
    const draft = { ...fixture(), localized: { es: { tags: [42] } }, importance: 'urgent' };
    const before = JSON.stringify(draft);
    expect(validateTemplate(draft)).toEqual([
      { path: 'localized.es.tags[0]', code: 'invalid_type', message: 'localized.es.tags[0] must be a string.' },
      { path: 'importance', code: 'invalid_enum', message: 'importance must be one of: low, normal, high.' }
    ]);
    expect(JSON.stringify(draft)).toBe(before);
    expect(validateTemplate(null)).toEqual([{ path: '$', code: 'invalid_type', message: 'Template root must be an object.' }]);
  });

  it('rejects missing and unchanged bug lines', () => {
    const draft = fixture();
    draft.bugPatterns[0].lineNumbers = [2, 3];
    expect(validateTemplate(draft).map(({ code }) => code)).toEqual(['unchanged_line', 'missing_line']);
  });

  it('validates character metadata and explicit file/row references', () => {
    const draft = { ...fixture(), authorId: 'lucia', reactions: { 'correct-rejection': { en: 'Thanks', es: 'Gracias' } } };
    const explicit = { ...draft, bugPatterns: [{ ...draft.bugPatterns[0], lineRefs: [{ filename: 'index.ts', rowId: 'first' }] }],
      files: [{ ...draft.files[0], lines: [{ ...draft.files[0].lines[0], rowId: 'first', kind: 'addition' }, draft.files[0].lines[1]] }] };
    expect(validateTemplate(explicit)).toEqual([]);
    explicit.bugPatterns[0].lineRefs[0].filename = 'missing.ts';
    expect(validateTemplate(explicit).map(({ code }) => code)).toEqual(['missing_line', 'inconsistent_projection']);
    expect(validateTemplate({ ...draft, authorId: '', reactions: { oops: { fr: 42 } } }).map(({ code }) => code))
      .toEqual(['invalid_identity', 'invalid_enum', 'unsupported_locale', 'invalid_type']);
  });

  it('rejects ambiguous legacy annotations and unsupported removal rows', () => {
    const draft = fixture();
    draft.files.push({ ...draft.files[0], filename: 'second.ts' });
    expect(validateTemplate(draft).map(({ code }) => code)).toEqual(['ambiguous_line']);
    const removal = { ...fixture(), files: [{ ...fixture().files[0], lines: [{ ...fixture().files[0].lines[0], kind: 'removal' }] }] };
    expect(validateTemplate(removal).map(({ code }) => code)).toEqual(['invalid_enum']);
  });

  it('keeps explicit references compatible with numeric live selection', () => {
    const draft = fixture();
    draft.files.push({ ...draft.files[0], filename: 'second.ts' });
    const explicit = { ...draft, bugPatterns: [{ ...draft.bugPatterns[0],
      lineRefs: [{ filename: 'index.ts', rowId: 'line-1' }] }] };
    expect(validateTemplate(explicit).map(({ code }) => code)).toEqual(['ambiguous_line']);
    const clean = { ...fixture(), bugPatterns: [], files: [{ ...fixture().files[0], lines: [
      { lineNumber: 1, rowId: 'one', content: 'a', isNew: true },
      { lineNumber: 1, rowId: 'two', content: 'b', isNew: true }
    ] }] };
    expect(validateTemplate(clean).map(({ path, code }) => ({ path, code })))
      .toEqual([{ path: 'files[0].lines[1].lineNumber', code: 'duplicate_identity' }]);
  });

  it('shares CLI content diagnostics while folder and catalog checks stay in the wrapper', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'approve-validation-'));
    try {
      mkdirSync(path.join(root, 'scripts'));
      mkdirSync(path.join(root, 'lib/templates'), { recursive: true });
      cpSync('scripts/build-template-manifest.mjs', path.join(root, 'scripts/build-template-manifest.mjs'));
      cpSync('lib/templates/validation.mjs', path.join(root, 'lib/templates/validation.mjs'));
      const draft = { ...fixture(), importance: 'urgent' };
      for (const folder of ['example', 'different']) {
        const destination = path.join(root, 'data/prTemplates/generic', folder);
        mkdirSync(destination, { recursive: true });
        writeFileSync(path.join(destination, 'template.json'), JSON.stringify(draft));
      }
      const output = execFileSync(process.execPath, ['scripts/build-template-manifest.mjs', '--report-only'], { cwd: root, encoding: 'utf8' });
      expect(output).toContain('2 template(s) checked; 4 error(s)');
      expect(output).toContain(validateTemplate(draft)[0].message);
      expect(output).toContain("must match folder 'different'");
      expect(output).toContain("templateId 'example' duplicates");
      expect(() => execFileSync(process.execPath, ['scripts/build-template-manifest.mjs'], { cwd: root, stdio: 'pipe' })).toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
