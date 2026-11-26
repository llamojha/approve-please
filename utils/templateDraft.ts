import type { PullRequestTemplate } from '../types';
import { validateTemplate, type TemplateDiagnostic } from '../lib/templates/validation.mjs';

export const TEMPLATE_DRAFT_STORAGE_KEY = 'approve-please.template-draft.v1';

export interface TemplateDraftEnvelope {
  version: 1;
  updatedAt: string;
  template: PullRequestTemplate;
}

export const createTemplateDraft = (): PullRequestTemplate => ({
  templateId: 'pr-community-new-scenario',
  title: 'Describe the proposed change',
  author: 'Guest contributor',
  description: 'Explain what this pull request changes and why.',
  tags: ['community'],
  importance: 'normal',
  files: [{
    filename: 'src/example.ts',
    language: 'typescript',
    lines: [
      { rowId: 'line-1', kind: 'context', lineNumber: 1, content: 'export function example() {', isNew: false },
      { rowId: 'line-2', kind: 'addition', lineNumber: 2, content: '  return true;', isNew: true },
      { rowId: 'line-3', kind: 'context', lineNumber: 3, content: '}', isNew: false }
    ]
  }],
  bugPatterns: [],
  localized: {
    es: {
      title: 'Describe el cambio propuesto',
      description: 'Explica qué cambia este pull request y por qué.',
      tags: ['comunidad'],
      author: 'Colaborador invitado'
    }
  }
});

export const cloneTemplateDraft = (template: PullRequestTemplate): PullRequestTemplate => {
  const clone = JSON.parse(JSON.stringify(template)) as PullRequestTemplate;
  clone.templateId = `${template.templateId}-copy`;
  return clone;
};

export const validateTemplateDraft = (value: unknown): TemplateDiagnostic[] => validateTemplate(value);

export const parseTemplateDraft = (source: string): { template?: PullRequestTemplate; diagnostics: TemplateDiagnostic[] } => {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    return {
      diagnostics: [{
        path: '$',
        code: 'invalid_json',
        message: error instanceof Error ? error.message : 'The JSON could not be parsed.'
      }]
    };
  }
  const diagnostics = validateTemplateDraft(value);
  return diagnostics.length === 0 ? { template: value as PullRequestTemplate, diagnostics } : { diagnostics };
};

export const serializeTemplateDraft = (template: PullRequestTemplate): string =>
  `${JSON.stringify(template, null, 2)}\n`;

export const saveTemplateDraft = (storage: Pick<Storage, 'setItem'>, template: PullRequestTemplate, now = new Date()): void => {
  const envelope: TemplateDraftEnvelope = { version: 1, updatedAt: now.toISOString(), template };
  storage.setItem(TEMPLATE_DRAFT_STORAGE_KEY, JSON.stringify(envelope));
};

export const loadTemplateDraft = (storage: Pick<Storage, 'getItem'>): TemplateDraftEnvelope | null => {
  const raw = storage.getItem(TEMPLATE_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const envelope = JSON.parse(raw) as Partial<TemplateDraftEnvelope>;
    if (envelope.version !== 1 || typeof envelope.updatedAt !== 'string' || !envelope.template) return null;
    if (validateTemplateDraft(envelope.template).length > 0) return null;
    return envelope as TemplateDraftEnvelope;
  } catch {
    return null;
  }
};
