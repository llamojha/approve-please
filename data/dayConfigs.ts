import { DayConfig } from '../types';

export const dayConfigs: DayConfig[] = [
  {
    day: 1,
    codename: 'Orientation',
    briefing: '',
    rules: [
      {
        id: 'day1-logic',
        description: 'No obvious logic errors. Double-check comparisons and off-by-one errors.',
        appliesTo: ['logic']
      }
    ],
    spawn: {
      pool: ['pr-003-add-usage-analytics-panel', 'pr-012-trigger-predicate-for-audit-pipeline', 'logic-boundary-check', 'pr-013-queue-warranty-center-jobs'],
      waves: [
        { atMinute: 60, count: 1 },
        { atMinute: 180, count: 1 },
        { atMinute: 360, count: 1 }
      ],
      scriptedWaves: [
        {
          atMinute: 0,
          templateIds: ['pr-000-onboarding-readme-update', 'pr-001-sanitize-readme-api-key'],
          note: 'Tutorial PRs: clean README approval, then reject exposed API key.'
        }
      ]
    }
  },
  {
    day: 2,
    codename: 'Testing Mandate',
    briefing: 'Mgmt wants test coverage up. Reject PRs that skip tests or leave TODOs.',
    rules: [
      {
        id: 'day1-logic',
        description: 'No obvious logic errors.',
        appliesTo: ['logic']
      },
      {
        id: 'day2-tests',
        description: 'Every PR must touch tests or explicitly justify why not.',
        appliesTo: 'any'
      }
    ],
    spawn: {
      pool: ['logic-boundary-check', 'tests-mandatory', 'style-sloppy', 'clean-hotfix'],
      waves: [
        { atMinute: 0, count: 2 },
        { atMinute: 60, count: 3 },
        { atMinute: 180, count: 3 },
        { atMinute: 360, count: 2 }
      ],
      targetQueueSeconds: 180,
      dynamicCadenceMinutes: 45
    }
  },
  {
    day: 3,
    codename: 'Security Crackdown',
    briefing: 'SREs are on edge after that SQL incident. Security patterns are priority #1.',
    rules: [
      {
        id: 'day1-logic',
        description: 'No obvious logic errors.',
        appliesTo: ['logic']
      },
      {
        id: 'day2-tests',
        description: 'Every PR must touch tests or justify why not.',
        appliesTo: 'any'
      },
      {
        id: 'day3-security',
        description: 'Reject insecure patterns (raw SQL, unchecked auth, insecure tokens).',
        appliesTo: ['security']
      }
    ],
    spawn: {
      pool: ['security-sql', 'performance-loop', 'logic-session-expiry', 'clean-hotfix', 'clean-refactor'],
      waves: [
        { atMinute: 0, count: 2 },
        { atMinute: 60, count: 3 },
        { atMinute: 180, count: 4 },
        { atMinute: 360, count: 3 }
      ],
      targetQueueSeconds: 240,
      dynamicCadenceMinutes: 30
    }
  }
];

export const getDayConfig = (day: number): DayConfig => {
  return dayConfigs[Math.min(day - 1, dayConfigs.length - 1)];
};
