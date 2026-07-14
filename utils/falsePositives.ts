import type { BugKind } from '../types';

export interface FalsePositiveIncidentsText {
  reasonClean: string;
  reasonMixed: string;
}

export interface FalsePositiveReason {
  label: string;
  isClean: boolean;
}

export const formatFalsePositiveReason = (
  actualBugKinds: BugKind[],
  incidentsText: FalsePositiveIncidentsText,
  bugKindLabels: Record<BugKind, string>
): FalsePositiveReason => {
  if (actualBugKinds.length === 0) {
    return { label: incidentsText.reasonClean, isClean: true };
  }
  const uniqueKinds = Array.from(new Set(actualBugKinds));
  if (uniqueKinds.length === 1) {
    const [onlyKind] = uniqueKinds;
    return { label: bugKindLabels[onlyKind] ?? onlyKind, isClean: false };
  }
  return { label: incidentsText.reasonMixed, isClean: false };
};
