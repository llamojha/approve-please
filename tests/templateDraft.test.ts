import { describe, expect, it } from 'vitest';
import {
  TEMPLATE_DRAFT_STORAGE_KEY,
  cloneTemplateDraft,
  createTemplateDraft,
  loadTemplateDraft,
  parseTemplateDraft,
  saveTemplateDraft,
  serializeTemplateDraft
} from '../utils/templateDraft';

describe('template draft workflow', () => {
  it('creates, serializes and parses a valid playable draft', () => {
    const draft = createTemplateDraft();
    const parsed = parseTemplateDraft(serializeTemplateDraft(draft));
    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.template).toEqual(draft);
  });

  it('keeps invalid imports out of the draft result', () => {
    expect(parseTemplateDraft('{ bad json').template).toBeUndefined();
    const invalid = parseTemplateDraft(JSON.stringify({ title: 'Incomplete' }));
    expect(invalid.template).toBeUndefined();
    expect(invalid.diagnostics.length).toBeGreaterThan(0);
  });

  it('clones without mutating the source identity', () => {
    const source = createTemplateDraft();
    const clone = cloneTemplateDraft(source);
    expect(clone.templateId).toBe(`${source.templateId}-copy`);
    expect(source.templateId).toBe('pr-community-new-scenario');
  });

  it('round-trips a versioned local draft and rejects corrupt storage', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); }
    };
    const draft = createTemplateDraft();
    saveTemplateDraft(storage, draft, new Date('2026-11-03T12:00:00.000Z'));
    expect(loadTemplateDraft(storage)).toEqual({ version: 1, updatedAt: '2026-11-03T12:00:00.000Z', template: draft });
    values.set(TEMPLATE_DRAFT_STORAGE_KEY, '{oops');
    expect(loadTemplateDraft(storage)).toBeNull();
  });
});
