import { WORK_DAY_MINUTES } from '../constants/game';
import type { GameState } from '../context/GameContext';
import { normalizePullRequest } from './templateNormalization';
import { templateCoworkers } from '../data/prTemplates/coworkerManifest';
import { getCharacter, reactionsForCharacter } from '../data/characters';

export const RUN_SAVE_STORAGE_KEY = 'approve-please.run.v1';
export const BASICS_RUN_SAVE_STORAGE_KEY = 'approve-please.basics-run.v1';
export const RUN_SAVE_VERSION = 1;

export interface RunSaveEnvelope {
  version: 1;
  savedAt: string;
  state: GameState;
}

const phases = new Set(['BRIEFING', 'WORK', 'SUMMARY', 'GAME_OVER']);
const difficulties = new Set(['normal', 'learning']);
const meterKeys = ['stability', 'velocity', 'satisfaction'] as const;
const counterKeys = ['bugsToProd', 'prsApproved', 'prsRejected', 'truePositives', 'falsePositives', 'cleanApprovals'] as const;
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const hasLocalizedText = (value: unknown): boolean => isObject(value) && typeof value.en === 'string' && typeof value.es === 'string';

export const isMeaningfulRun = (state: GameState): boolean =>
  state.phase !== 'BRIEFING' || state.currentDay > 1 || state.history.length > 0 || state.currentTime > 0 || state.decisionReceipts.length > 0;

export const validateSavedRun = (value: unknown): value is RunSaveEnvelope => {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Partial<RunSaveEnvelope>;
  if (envelope.version !== RUN_SAVE_VERSION || typeof envelope.savedAt !== 'string' || !envelope.state) return false;
  const state = envelope.state;
  if (state.contentTrack !== undefined && state.contentTrack !== 'code' && state.contentTrack !== 'basics') return false;
  if (state.contentTrack === 'basics' && state.currentDay > 6) return false;
  if (!Number.isInteger(state.runId) || state.runId < 1 || !Number.isInteger(state.currentDay) || state.currentDay < 1) return false;
  if (!phases.has(state.phase) || !Number.isFinite(state.currentTime) || state.currentTime < 0 || state.currentTime > WORK_DAY_MINUTES) return false;
  if (!Array.isArray(state.languagePreference) || state.languagePreference.some(value => typeof value !== 'string') || !difficulties.has(state.difficulty)) return false;
  if (!Array.isArray(state.queue) || !Array.isArray(state.history) || !Array.isArray(state.decisionReceipts) || !Array.isArray(state.deliveryMarkers) ||
    state.deliveryMarkers.some(value => typeof value !== 'string')) return false;
  if (!Array.isArray(state.spawnedTemplateIds) || state.spawnedTemplateIds.some(value => typeof value !== 'string')) return false;
  if (typeof state.leaderboardEligible !== 'boolean') return false;
  if (!isObject(state.meters) || meterKeys.some(key => !Number.isFinite(state.meters[key]) || state.meters[key] < 0 || state.meters[key] > 100)) return false;
  if (!isObject(state.counters) || counterKeys.some(key => !Number.isFinite(state.counters[key]) || state.counters[key] < 0)) return false;
  if (!hasLocalizedText(state.currentMantra) || !isObject(state.dayQuote) || typeof state.dayQuote.speaker !== 'string' ||
    !hasLocalizedText(state.dayQuote.role) || !hasLocalizedText(state.dayQuote.text)) return false;
  if (!Array.isArray(state.prodIncidents) || !Array.isArray(state.falsePositiveRecords) || typeof state.simulationPaused !== 'boolean') return false;
  if (state.lastDecision !== null && !isObject(state.lastDecision)) return false;
  try {
    state.queue.forEach(pr => {
      normalizePullRequest(pr);
      if (pr.learningContext !== undefined && (!isObject(pr.learningContext) || typeof pr.learningContext.brief !== 'string' || typeof pr.learningContext.explanation !== 'string')) throw new Error('Invalid learning context');
    });
  } catch {
    return false;
  }
  if (state.currentPR !== null && (!isObject(state.currentPR) || !state.queue.some(pr => pr.id === state.currentPR?.id))) return false;
  return true;
};

export const readSavedRun = (storage: Pick<Storage, 'getItem'>, storageKey = RUN_SAVE_STORAGE_KEY): RunSaveEnvelope | null => {
  const raw = storage.getItem(storageKey);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!validateSavedRun(value)) return null;
    // Older saves retain complete PR snapshots, including the legacy guest names.
    // Refresh only catalog identities; never reset a run or load scenario packs.
    const queue = value.state.queue.map(pr => {
      const authorId = templateCoworkers[pr.templateId];
      const character = getCharacter(authorId);
      if (!authorId || !character) return pr;
      return { ...pr, authorId, author: character.name, reactions: pr.reactions ?? reactionsForCharacter(authorId) };
    });
    return { ...value, state: { ...value.state, contentTrack: value.state.contentTrack ?? 'code', queue, currentPR: queue.find(pr => pr.id === value.state.currentPR?.id) ?? null } };
  } catch {
    return null;
  }
};

export const writeSavedRun = (storage: Pick<Storage, 'setItem'>, state: GameState, now = new Date(), storageKey = RUN_SAVE_STORAGE_KEY): RunSaveEnvelope => {
  const envelope: RunSaveEnvelope = { version: RUN_SAVE_VERSION, savedAt: now.toISOString(), state };
  storage.setItem(storageKey, JSON.stringify(envelope));
  return envelope;
};

export const clearSavedRun = (storage: Pick<Storage, 'removeItem'>, storageKey = RUN_SAVE_STORAGE_KEY): void => storage.removeItem(storageKey);
