import { describe, expect, it } from 'vitest';
import { formatLanguageLabel, getCodeLanguages, matchesLanguagePreference } from '../utils/language';
import type { PRFileDiff } from '../types';

const fileWithLanguage = (language: string): PRFileDiff => ({
  filename: `file.${language}`,
  language,
  lines: [{ lineNumber: 1, content: 'content', isNew: true }]
});

describe('getCodeLanguages', () => {
  it('canonicalizes aliases (ts -> typescript)', () => {
    expect(getCodeLanguages([fileWithLanguage('ts')])).toEqual(['typescript']);
    expect(getCodeLanguages([fileWithLanguage('tsx')])).toEqual(['typescript']);
  });

  it('excludes config languages such as markdown and yaml', () => {
    const files = [fileWithLanguage('markdown'), fileWithLanguage('yaml'), fileWithLanguage('md')];
    expect(getCodeLanguages(files)).toEqual([]);
  });

  it('deduplicates languages across files', () => {
    const files = [fileWithLanguage('ts'), fileWithLanguage('typescript'), fileWithLanguage('py')];
    expect(getCodeLanguages(files)).toEqual(['typescript', 'python']);
  });
});

describe('matchesLanguagePreference', () => {
  it('returns true for an empty preference', () => {
    expect(matchesLanguagePreference([fileWithLanguage('go')], [])).toBe(true);
  });

  it('matches when a code language is in the preference', () => {
    expect(matchesLanguagePreference([fileWithLanguage('ts')], ['typescript'])).toBe(true);
    expect(matchesLanguagePreference([fileWithLanguage('ts')], ['python'])).toBe(false);
  });

  it('matches config-only filesets only when generic is in the preference', () => {
    const configFiles = [fileWithLanguage('markdown'), fileWithLanguage('yaml')];
    expect(matchesLanguagePreference(configFiles, ['generic'])).toBe(true);
    expect(matchesLanguagePreference(configFiles, ['typescript'])).toBe(false);
  });
});

describe('formatLanguageLabel', () => {
  it('uses known labels', () => {
    expect(formatLanguageLabel('typescript')).toBe('TypeScript');
    expect(formatLanguageLabel('yaml')).toBe('YAML');
  });

  it('capitalizes unknown languages', () => {
    expect(formatLanguageLabel('rust')).toBe('Rust');
  });
});
