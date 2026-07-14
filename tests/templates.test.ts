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
