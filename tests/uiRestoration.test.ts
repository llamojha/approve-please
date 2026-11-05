import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ReviewDesk from '../components/work/ReviewDesk';
import { designStudyCopy } from '../constants/designStudyCopy';
import { studyReview } from '../constants/designStudyTeam';

describe('live desk context restoration', () => {
  it('renders PR tags and file language without adding another review step', () => {
    const pullRequest = {
      ...studyReview(0, 'en'),
      tags: ['security', 'auth'],
      files: studyReview(0, 'en').files.map(file => ({ ...file, language: 'typescript' }))
    };

    const html = renderToStaticMarkup(createElement(ReviewDesk, {
      pullRequest,
      repository: designStudyCopy.en.repository,
      number: 2487,
      branch: 'feat/session-guard → main',
      selected: [],
      onToggle: () => undefined,
      onClear: () => undefined,
      onVerdict: () => undefined,
      queueCount: 2,
      onOpenQueue: () => undefined,
      onOpenRules: () => undefined,
      labels: designStudyCopy.en,
      importanceLabels: { low: 'Low', normal: 'Medium', high: 'High' }
    }));

    expect(html).toContain('aria-label="PR tags"');
    expect(html).toContain('security');
    expect(html).toContain('auth');
    expect(html).toContain('aria-label="Language: typescript"');
    expect(html).toContain('Approve &amp; merge');
    expect(html).not.toContain('Next review');
  });

  it('keeps restoration controls and queue-pressure explanations bilingual', () => {
    expect(designStudyCopy.en.stats).toBe('Shift stats');
    expect(designStudyCopy.es.stats).toBe('Estadísticas');
    expect(designStudyCopy.en.queuePressure(2)).toContain('2');
    expect(designStudyCopy.es.queuePressureHint).toContain('velocidad');
    expect(designStudyCopy.en.settingsIntro).toContain('saved');
    expect(designStudyCopy.es.settingsIntro).toContain('guarda');
  });
});
