import { APPROVAL_EFFECTS, REQUEST_CHANGES_EFFECTS, SEVERITY_WEIGHTS, gameSettings } from '../constants/gameSettings';
import type { Counters, DecisionOutcome, LineReference, MeterSet, NormalizedPullRequest } from '../types';
import { lineReferenceKey } from './templateNormalization';

export type ReviewVerdict = 'approve' | 'request-changes';
export type PrecisionResult = 'not-applicable' | 'untagged' | 'precise' | 'inaccurate' | 'mixed';

export interface DecisionReceipt {
  prId: string;
  templateId: string;
  title: string;
  author: string;
  authorId?: string;
  verdict: ReviewVerdict;
  outcome: DecisionOutcome;
  correct: boolean;
  precision: PrecisionResult;
  bonusApplied: boolean;
  matchedBugCount: number;
  totalBugCount: number;
  counterDelta: Partial<Counters>;
  requestedMeterDelta: MeterSet;
  appliedMeterDelta: MeterSet;
  metersAfter: MeterSet;
}

/** Shared decision semantics for the live desk, fixture study and future authoring tools. */
export const evaluateDecision = (
  pr: NormalizedPullRequest, verdict: ReviewVerdict, selectedLines: LineReference[], meters: MeterSet
): DecisionReceipt => {
  const allRows = new Set(pr.files.flatMap((file) => file.lines.map((line) =>
    lineReferenceKey({ filename: file.filename, rowId: line.rowId }))));
  const selected = new Set(selectedLines.map(lineReferenceKey));
  if ([...selected].some((key) => !allRows.has(key))) throw new Error('Selection references an unknown row');
  for (const value of Object.values(meters)) {
    if (!Number.isFinite(value) || value < gameSettings.meters.min || value > gameSettings.meters.max) {
      throw new Error('Meters must be finite values within the configured bounds');
    }
  }
  const bugRows = new Set(pr.bugPatterns.flatMap((bug) => bug.lineRefs.map(lineReferenceKey)));
  const matchedBugCount = pr.bugPatterns.filter((bug) => bug.lineRefs.some((ref) => selected.has(lineReferenceKey(ref)))).length;
  const hasWrong = [...selected].some((key) => !bugRows.has(key));
  const hasBugs = pr.bugPatterns.length > 0;
  const precision: PrecisionResult = verdict === 'approve' ? 'not-applicable' : selected.size === 0 ? 'untagged'
    : matchedBugCount === 0 ? 'inaccurate' : hasWrong ? 'mixed' : 'precise';
  const bonusApplied = precision === 'precise';
  const outcome: DecisionOutcome = verdict === 'approve' ? (hasBugs ? 'buggy-approval' : 'clean-approval')
    : hasBugs ? 'correct-rejection' : 'false-positive';
  const counterDelta: Partial<Counters> = {};
  const requestedMeterDelta: MeterSet = { stability: 0, velocity: 0, satisfaction: 0 };
  if (verdict === 'approve') {
    Object.assign(counterDelta, APPROVAL_EFFECTS.baseCounters);
    requestedMeterDelta.velocity = hasBugs ? APPROVAL_EFFECTS.velocityOnBug : APPROVAL_EFFECTS.velocityOnClean;
    if (hasBugs) {
      const severity = pr.bugPatterns.reduce((sum, bug) => sum + SEVERITY_WEIGHTS[bug.severity], 0);
      counterDelta.bugsToProd = pr.bugPatterns.length;
      requestedMeterDelta.stability = -severity * APPROVAL_EFFECTS.stabilityPenaltyMultiplier;
      requestedMeterDelta.satisfaction = -Math.ceil(severity / APPROVAL_EFFECTS.satisfactionPenaltyDivisor);
    } else {
      Object.assign(counterDelta, APPROVAL_EFFECTS.cleanCounters);
      requestedMeterDelta.satisfaction = APPROVAL_EFFECTS.satisfactionOnClean;
    }
  } else {
    Object.assign(counterDelta, REQUEST_CHANGES_EFFECTS.baseCounters);
    Object.assign(requestedMeterDelta, REQUEST_CHANGES_EFFECTS.baseMeters);
    if (bonusApplied) {
      Object.assign(counterDelta, REQUEST_CHANGES_EFFECTS.hitCounters);
      Object.assign(requestedMeterDelta, REQUEST_CHANGES_EFFECTS.hitMeters);
    } else if (!hasBugs) Object.assign(counterDelta, REQUEST_CHANGES_EFFECTS.missCounters);
  }
  const metersAfter = { ...meters };
  const appliedMeterDelta = { ...requestedMeterDelta };
  for (const key of Object.keys(metersAfter) as (keyof MeterSet)[]) {
    metersAfter[key] = Math.min(gameSettings.meters.max, Math.max(gameSettings.meters.min, meters[key] + requestedMeterDelta[key]));
    appliedMeterDelta[key] = metersAfter[key] - meters[key];
  }
  return { prId: pr.id, templateId: pr.templateId, title: pr.title, author: pr.author, authorId: pr.authorId,
    verdict, outcome, correct: outcome === 'clean-approval' || outcome === 'correct-rejection', precision,
    bonusApplied, matchedBugCount, totalBugCount: pr.bugPatterns.length, counterDelta,
    requestedMeterDelta, appliedMeterDelta, metersAfter };
};
