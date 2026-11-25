import { describe, expect, it } from 'vitest';
import { createInitialState, gameReducer } from '../context/GameContext';
import { AUDIO_PREFERENCES_STORAGE_KEY, defaultAudioPreferences, readAudioPreferences, writeAudioPreferences } from '../utils/audioPreferences';
import { clearSavedRun, isMeaningfulRun, readSavedRun, RUN_SAVE_STORAGE_KEY, validateSavedRun, writeSavedRun } from '../utils/runPersistence';
import javascriptTemplates from '../data/prTemplates/manifest.javascript';
import { instantiatePullRequest } from '../utils/pr';
import { getCharacter } from '../data/characters';

const memoryStorage = () => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); }
  };
};

describe('run persistence', () => {
  it('upgrades legacy queued authors to catalog coworkers without losing run progress', () => {
    const storage = memoryStorage();
    const template = javascriptTemplates[0];
    const queued = instantiatePullRequest(template, 2, 0, 'en');
    delete queued.authorId;
    delete queued.reactions;
    queued.author = 'Legacy Guest';
    const state = { ...createInitialState(), phase: 'WORK' as const, currentDay: 2, currentTime: 91,
      queue: [queued], currentPR: queued, meters: { stability: 87, velocity: 65, satisfaction: 72 },
      counters: { bugsToProd: 0, prsApproved: 3, prsRejected: 2, truePositives: 2, falsePositives: 0, cleanApprovals: 3 },
      spawnedTemplateIds: [template.templateId], deliveryMarkers: ['default:0'] };
    writeSavedRun(storage, state);
    const restored = readSavedRun(storage)!.state;
    expect(restored.queue[0].authorId).toBe(template.authorId);
    expect(restored.queue[0].author).toBe(getCharacter(template.authorId)?.name);
    expect(restored.queue[0].reactions?.['correct-rejection']?.en).toBeTruthy();
    expect(restored.queue[0].reactions?.['correct-rejection']?.es).toBeTruthy();
    expect(restored.currentPR).toBe(restored.queue[0]);
    expect(restored.queue[0].files).toEqual(queued.files);
    expect(restored.queue[0].bugPatterns).toEqual(queued.bugPatterns);
    expect({ ...restored, queue: [], currentPR: null }).toEqual({ ...state, queue: [], currentPR: null });
    expect(queued.author).toBe('Legacy Guest');
    expect(storage.getItem(RUN_SAVE_STORAGE_KEY)).toContain('Legacy Guest');
  });

  it('preserves external guest snapshots and authored reactions when restoring', () => {
    const storage = memoryStorage();
    const guest = { ...instantiatePullRequest(javascriptTemplates[0], 1, 0, 'en'),
      templateId: 'external-contributor-draft', author: 'Guest Contributor', authorId: undefined,
      reactions: { 'clean-approval': { en: 'Custom response' } } };
    const state = { ...createInitialState(), phase: 'WORK' as const, queue: [guest], currentPR: guest };
    writeSavedRun(storage, state);
    expect(readSavedRun(storage)?.state.queue[0]).toEqual(guest);
  });

  it('round-trips meaningful state without advancing time', () => {
    const storage = memoryStorage();
    const state = { ...createInitialState(), phase: 'WORK' as const, currentTime: 91, deliveryMarkers: ['default:0', 'scripted:0-0'] };
    writeSavedRun(storage, state, new Date('2026-11-03T12:00:00.000Z'));
    const restored = readSavedRun(storage);
    expect(restored?.state.currentTime).toBe(91);
    expect(restored?.state.deliveryMarkers).toEqual(['default:0', 'scripted:0-0']);
    expect(validateSavedRun(restored)).toBe(true);
  });

  it('rejects corrupt and incompatible saves and clears them', () => {
    const storage = memoryStorage();
    storage.setItem(RUN_SAVE_STORAGE_KEY, JSON.stringify({ version: 99, state: createInitialState() }));
    expect(readSavedRun(storage)).toBeNull();
    clearSavedRun(storage);
    expect(storage.getItem(RUN_SAVE_STORAGE_KEY)).toBeNull();
  });

  it('rejects incomplete v1 state before it can reach the game', () => {
    const state = createInitialState();
    expect(validateSavedRun({ version: 1, savedAt: new Date().toISOString(), state: { ...state, meters: {} } })).toBe(false);
    expect(validateSavedRun({ version: 1, savedAt: new Date().toISOString(), state: { ...state, counters: undefined } })).toBe(false);
    expect(validateSavedRun({ version: 1, savedAt: new Date().toISOString(), state: { ...state, languagePreference: undefined } })).toBe(false);
  });

  it('restores unpaused and records delivery markers once', () => {
    const queued = {
      id: 'pr-1', templateId: 'template-1', title: 'Safe change', author: 'Guest', description: 'Description',
      tags: [], files: [{ filename: 'a.ts', language: 'typescript', lines: [{ lineNumber: 1, content: 'ok', isNew: true }] }],
      bugPatterns: [], importance: 'normal' as const, estimatedReviewSeconds: 10
    };
    const saved = { ...createInitialState(), phase: 'WORK' as const, simulationPaused: true, queue: [queued], currentPR: { id: queued.id } as typeof queued };
    const restored = gameReducer(createInitialState(), { type: 'RESTORE_RUN', state: saved });
    const marked = gameReducer(restored, { type: 'MARK_DELIVERY', marker: 'default:0' });
    expect(restored.simulationPaused).toBe(false);
    expect(restored.currentPR).toBe(queued);
    expect(gameReducer(marked, { type: 'MARK_DELIVERY', marker: 'default:0' })).toBe(marked);
    expect(marked.deliveryMarkers).toEqual(['default:0']);
    expect(isMeaningfulRun(restored)).toBe(true);
  });
});

describe('audio preferences', () => {
  it('persists valid channel choices and volume', () => {
    const storage = memoryStorage();
    const value = { musicEnabled: true, notificationsEnabled: true, volume: 0.6 };
    writeAudioPreferences(storage, value);
    expect(readAudioPreferences(storage)).toEqual(value);
  });

  it('uses safe defaults for invalid storage', () => {
    const storage = memoryStorage();
    storage.setItem(AUDIO_PREFERENCES_STORAGE_KEY, JSON.stringify({ musicEnabled: true, volume: 4 }));
    expect(readAudioPreferences(storage)).toEqual(defaultAudioPreferences);
  });
});
