import type { LineReference, NormalizedPullRequest, PullRequest } from '../types';

/** JSON tuple encoding avoids collisions between filenames and authored row IDs. */
export const lineReferenceKey = (ref: LineReference): string => JSON.stringify([ref.filename, ref.rowId]);

/** Boundary adapter for validated content; never mutates the legacy PR. */
export const normalizePullRequest = (pr: PullRequest): NormalizedPullRequest => {
  const filenames = new Set<string>();
  const byKey = new Map<string, number>();
  const additions = new Set<string>();
  const byNumber = new Map<number, LineReference[]>();
  const files = pr.files.map((file) => {
    if (filenames.has(file.filename)) throw new Error(`Duplicate filename: ${file.filename}`);
    filenames.add(file.filename);
    return { ...file, lines: file.lines.map((line) => {
      const rowId = line.rowId ?? `line-${line.lineNumber}`;
      const kind = line.kind ?? (line.isNew ? 'addition' : 'context');
      if (!rowId || !['addition', 'context'].includes(kind)) throw new Error('Unsupported row identity or kind');
      if ((kind === 'addition') !== line.isNew) throw new Error('kind and isNew disagree');
      const ref = { filename: file.filename, rowId };
      const key = lineReferenceKey(ref);
      if (byKey.has(key)) throw new Error(`Duplicate row identity: ${key}`);
      byKey.set(key, line.lineNumber);
      if (kind === 'addition') additions.add(key);
      byNumber.set(line.lineNumber, [...(byNumber.get(line.lineNumber) ?? []), ref]);
      return { ...line, rowId, kind };
    }) };
  });
  const bugPatterns = pr.bugPatterns.map((pattern) => {
    const lineRefs = pattern.lineRefs?.map((ref) => ({ ...ref })) ?? pattern.lineNumbers.map((number) => {
      const candidates = byNumber.get(number) ?? [];
      if (candidates.length !== 1) throw new Error(`Missing or ambiguous legacy bug line: ${number}`);
      return { ...candidates[0] };
    });
    if (!lineRefs.length) throw new Error('Bug annotation requires at least one line');
    const numbers = lineRefs.map((ref) => {
      const number = byKey.get(lineReferenceKey(ref));
      if (number === undefined) throw new Error(`Unknown bug row: ${lineReferenceKey(ref)}`);
      if (!additions.has(lineReferenceKey(ref))) throw new Error('Bug annotation must reference an addition');
      return number;
    });
    if (pattern.lineRefs && (numbers.some((n) => !pattern.lineNumbers.includes(n)) ||
      pattern.lineNumbers.some((n) => !numbers.includes(n)))) throw new Error('lineRefs and lineNumbers disagree');
    return { ...pattern, lineNumbers: [...pattern.lineNumbers], lineRefs };
  });
  return { ...pr, tags: [...pr.tags], files, bugPatterns,
    ...(pr.reactions ? { reactions: Object.fromEntries(Object.entries(pr.reactions)
      .map(([outcome, translations]) => [outcome, { ...translations }])) } : {}) };
};
