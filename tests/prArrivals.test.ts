import { describe, expect, it } from 'vitest';
import { incomingPullRequests } from '../hooks/usePRArrivalNotice';

describe('PR arrival identity', () => {
  it('detects arrivals when a reviewed PR leaves in the same batch', () => {
    expect(incomingPullRequests(['a', 'b'], ['b', 'c'])).toEqual(['c']);
  });
  it('does not notify for selection, reorder or removal of existing requests', () => {
    expect(incomingPullRequests(['a', 'b'], ['b', 'a'])).toEqual([]);
    expect(incomingPullRequests(['a', 'b'], ['b'])).toEqual([]);
  });
  it('counts distinct arrivals in a batch once', () => {
    expect(incomingPullRequests(['a'], ['a', 'c', 'c', 'd'])).toEqual(['c', 'd']);
  });
});
