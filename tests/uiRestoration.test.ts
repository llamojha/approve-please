import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ReviewDesk from '../components/work/ReviewDesk';
import { designStudyCopy } from '../constants/designStudyCopy';
import { TRANSLATIONS } from '../constants/i18n';
import { studyReview } from '../constants/designStudyTeam';
import { dayQuotes } from '../data/dayQuotes';
import { characters } from '../data/characters';

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
    expect(designStudyCopy.es.queuePressureHint.toLowerCase()).toContain('velocidad');
    expect(designStudyCopy.en.settingsIntro).toContain('saved');
    expect(designStudyCopy.es.settingsIntro).toContain('guarda');
  });

  it('pluralizes tagged-line feedback in both locales', () => {
    expect(designStudyCopy.en.selected(1)).toBe('line tagged');
    expect(designStudyCopy.en.selected(2)).toBe('lines tagged');
    expect(designStudyCopy.es.selected(1)).toBe('línea marcada');
    expect(designStudyCopy.es.selected(2)).toBe('líneas marcadas');
  });

  it('teaches the live review loop and uses team-trust terminology', () => {
    const englishGuide = TRANSLATIONS.en.landing.tutorialSlides.flatMap(slide => slide.description).join(' ');
    const spanishGuide = TRANSLATIONS.es.landing.tutorialSlides.flatMap(slide => slide.description).join(' ');
    expect(englishGuide).toContain('queue-drain chevrons');
    expect(englishGuide).toContain('Alt+A');
    expect(englishGuide).toContain('Background music');
    expect(englishGuide).not.toContain('Rulebook hints');
    expect(spanishGuide).toContain('indicadores de desgaste de cola');
    expect(TRANSLATIONS.en.shared.meters.satisfaction).toBe('Team trust');
    expect(TRANSLATIONS.es.shared.meters.satisfaction).toBe('Confianza del equipo');
  });

  it('makes shift start, practice mode and saved-run reset explicit in both locales', () => {
    const english = TRANSLATIONS.en.landing.refresh;
    const spanish = TRANSLATIONS.es.landing.refresh;
    expect(english.takeSeat).toBe('Start your shift');
    expect(english.learningTitle).toBe('Practice mode');
    expect(english.learningDescription).toContain('waiting PRs do not drain');
    expect(english.resume(2)).toContain('Day 2');
    expect(english.newRun).toContain('Day 1');
    expect(english.newRunHint).toContain('Clears this saved shift');
    expect(spanish.takeSeat).toBe('Empezar mi turno');
    expect(spanish.learningTitle).toBe('Modo de práctica');
    expect(spanish.resume(2)).toContain('Día 2');
    expect(spanish.newRun).toContain('día 1');
  });

  it('uses the established coworker cast for every shift quote', () => {
    const characterIds = new Set(characters.map(character => character.id));
    expect(dayQuotes).toHaveLength(characters.length);
    expect(dayQuotes.every(quote => characterIds.has(quote.characterId as typeof characters[number]['id']))).toBe(true);
    expect(dayQuotes.every(quote => quote.text.en && quote.text.es)).toBe(true);
  });

  it('frames the day summary as a bilingual learning recap', () => {
    expect(TRANSLATIONS.en.summary.wentWellBody(1, 2)).toContain('2 bugs stopped');
    expect(TRANSLATIONS.en.summary.learnBody(1, 1)).toContain('1 bug escaped');
    expect(TRANSLATIONS.es.summary.wentWellHeading).toBe('Qué salió bien');
    expect(TRANSLATIONS.es.summary.evidenceHeading).toBe('Evidencia en el diff');
  });
});
