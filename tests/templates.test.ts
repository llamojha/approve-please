import { describe, expect, it } from 'vitest';
import cssTemplates from '../data/prTemplates/manifest.css';
import genericTemplates from '../data/prTemplates/manifest.generic';
import javaTemplates from '../data/prTemplates/manifest.java';
import javascriptTemplates from '../data/prTemplates/manifest.javascript';
import pythonTemplates from '../data/prTemplates/manifest.python';
import rustTemplates from '../data/prTemplates/manifest.rust';
import typescriptTemplates from '../data/prTemplates/manifest.typescript';
import type { PullRequest, PullRequestTemplate } from '../types';
import { instantiatePullRequest } from '../utils/pr';
import { characters } from '../data/characters';
import { templateCoworkers } from '../data/prTemplates/coworkerManifest';
import { existsSync } from 'node:fs';
import path from 'node:path';

const templatePacks: ReadonlyArray<readonly [language: string, templates: PullRequestTemplate[]]> = [
  ['css', cssTemplates],
  ['generic', genericTemplates],
  ['java', javaTemplates],
  ['javascript', javascriptTemplates],
  ['python', pythonTemplates],
  ['rust', rustTemplates],
  ['typescript', typescriptTemplates]
];

const expectInstantiatedPullRequest = (pr: PullRequest): void => {
  expect(pr.id.trim()).not.toBe('');
  expect(pr.title.trim()).not.toBe('');
  expect(pr.files).not.toHaveLength(0);
  expect(pr.files.some((file) => file.lines.length > 0)).toBe(true);
};

describe('generated PR template instantiation', () => {
  it('provides Spanish metadata and bug explanations across the catalog', () => {
    for (const [, templates] of templatePacks) {
      for (const template of templates) {
        expect(template.localized?.es, template.templateId).toBeDefined();
        for (const bug of template.bugPatterns) {
          if (bug.description) expect(bug.localizedDescription?.es, template.templateId).toBeTruthy();
        }
      }
    }
  });

  it('gives every production template a canonical coworker, portrait and bilingual reactions', () => {
    const templates = templatePacks.flatMap(([, pack]) => pack);
    expect(Object.keys(templateCoworkers).sort()).toEqual(templates.map(template => template.templateId).sort());
    for (const template of templates) {
      const character = characters.find(person => person.id === template.authorId);
      expect(character, template.templateId).toBeDefined();
      expect(template.author, template.templateId).toBe(character?.name);
      expect(templateCoworkers[template.templateId], template.templateId).toBe(template.authorId);
      for (const locale of ['en', 'es'] as const) {
        const localizedAuthor = template.localized?.[locale]?.author;
        if (localizedAuthor) expect(localizedAuthor, template.templateId).toBe(character?.name);
        const pr = instantiatePullRequest(template, 1, 0, locale);
        expect(pr.authorId, template.templateId).toBe(character?.id);
        expect(pr.author, template.templateId).toBe(character?.name);
        for (const outcome of ['clean-approval', 'correct-rejection', 'buggy-approval', 'false-positive'] as const) {
          expect(pr.reactions?.[outcome]?.[locale], `${template.templateId}/${locale}/${outcome}`).toBeTruthy();
        }
      }
    }
    for (const character of characters) {
      const assigned = templates.filter(template => template.authorId === character.id);
      expect(assigned.some(template => template.bugPatterns.length === 0), `${character.id} clean work`).toBe(true);
      expect(assigned.some(template => template.bugPatterns.length > 0), `${character.id} flawed work`).toBe(true);
      for (const expression of ['neutral', 'pleased', 'concerned']) {
        expect(existsSync(path.resolve('public/characters/studies', `${character.id}-${expression}.png`))).toBe(true);
      }
    }
  });
  templatePacks.forEach(([language, templates]) => {
    [...templates]
      .sort((left, right) => left.templateId.localeCompare(right.templateId))
      .forEach((template) => {
        it(`${language}/${template.templateId} instantiates in English and Spanish`, () => {
          expectInstantiatedPullRequest(instantiatePullRequest(template, 1, 0, 'en'));
          expectInstantiatedPullRequest(instantiatePullRequest(template, 1, 0, 'es'));
        });
      });
  });
});
