import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GetServerSidePropsContext } from 'next';
import { getServerSideProps } from '../pages/dev/design';

// The study is an isolated development surface, never a production game route.
describe('design study route', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does not expose the design study in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(await getServerSideProps({} as GetServerSidePropsContext)).toEqual({ notFound: true });
  });

  it('makes the study available in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(await getServerSideProps({} as GetServerSidePropsContext)).toEqual({ props: {} });
  });
});

// Every coworker has both kinds of work; identity and title cannot reveal the answer.
import { studyReview, studyTeam, initialStudyQueue, completeStudyReview } from '../constants/designStudyTeam';
import { normalizePullRequest } from '../utils/templateNormalization';
import { evaluateDecision } from '../utils/decision';

describe('full team review scenarios', () => {
  it('provides ten distinct identities and a clean/flawed edition for each', () => {
    expect(new Set(studyTeam.map(person => person.id)).size).toBe(10);
    for (let index = 0; index < 10; index += 1) {
      const first = studyReview(index, 'en');
      const second = studyReview(index + 10, 'es');
      expect(first.authorId).toBe(second.authorId);
      expect(first.bugPatterns.length + second.bugPatterns.length).toBe(1);
      expect(first.id).not.toBe(second.id);
      expect(studyReview(index, 'es').title).not.toBe(first.title);
    }
  });

  it('gives every author localized context without revealing the clean/flawed edition', () => {
    const descriptions = new Set<string>();
    for (let index = 0; index < studyTeam.length; index += 1) {
      const en = studyReview(index, 'en');
      const es = studyReview(index, 'es');
      expect(en.description.length).toBeGreaterThan(40);
      expect(es.description.length).toBeGreaterThan(40);
      expect(es.description).not.toBe(en.description);
      expect(studyReview(index + studyTeam.length, 'en').description).toBe(en.description);
      expect(studyReview(index + studyTeam.length, 'es').description).toBe(es.description);
      descriptions.add(en.description);
    }
    expect(descriptions.size).toBe(studyTeam.length);
  });

  it('offers all three priorities with both safe and flawed work at each level', () => {
    const editions = Array.from({ length: 20 }, (_, index) => studyReview(index, 'en'));
    for (const importance of ['low', 'normal', 'high']) {
      const matching = editions.filter(pr => pr.importance === importance);
      expect(matching.some(pr => pr.bugPatterns.length === 0)).toBe(true);
      expect(matching.some(pr => pr.bugPatterns.length > 0)).toBe(true);
    }
    for (let index = 0; index < 10; index += 1) {
      expect(editions[index].importance).toBe(editions[index + 10].importance);
      expect(studyReview(index, 'es').importance).toBe(editions[index].importance);
    }
  });

  it('evaluates every clean edition and every precisely tagged flawed edition', () => {
    for (let index = 0; index < 20; index += 1) {
      const pr = studyReview(index, 'en');
      const flawed = pr.bugPatterns.length > 0;
      const selected = pr.bugPatterns.flatMap(bug => bug.lineNumbers.map(number => ({ filename: pr.files[0].filename, rowId: `line-${number}` })));
      const receipt = evaluateDecision(normalizePullRequest(pr), flawed ? 'request-changes' : 'approve', selected, { stability: 50, velocity: 50, satisfaction: 50 });
      expect(receipt.outcome).toBe(flawed ? 'correct-rejection' : 'clean-approval');
      if (flawed) expect(receipt.precision).toBe('precise');
    }
  });
});

describe('review queue', () => {
  it('preserves earlier requests when reviewing a later selection', () => {
    const queue = initialStudyQueue();
    const selected = { ...queue, active: 7 };
    expect(selected.pending).toEqual(queue.pending);
    const next = completeStudyReview(selected);
    expect(next.pending).toEqual([0, 1, 2, 3, 4, 5, 6, 8, 9, 10]);
    expect(next.active).toBe(0);
    expect(next.next).toBe(11);
    expect(queue.pending).toHaveLength(10);
  });

  it('assigns fresh IDs without reintroducing completed requests', () => {
    let queue = initialStudyQueue();
    const completed = new Set<number>();
    for (let index = 0; index < 25; index += 1) {
      expect(completed.has(queue.active)).toBe(false);
      completed.add(queue.active);
      queue = completeStudyReview(queue);
      expect(queue.pending).toHaveLength(10);
      expect(new Set(queue.pending).size).toBe(10);
      expect(queue.pending.every(id => !completed.has(id))).toBe(true);
    }
  });
});
