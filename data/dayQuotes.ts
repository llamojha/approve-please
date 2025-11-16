export interface DayQuote {
  speaker: string;
  role: string;
  text: string;
}

export const dayQuotes: DayQuote[] = [
  { speaker: 'Riya (PM)', role: 'Product Manager', text: "Today's focus is fast approvals—marketing wants charts by lunch." },
  { speaker: 'Evan (SRE)', role: 'Site Reliability', text: 'Keep prod stable. One bad deploy and pager duty is all yours.' },
  { speaker: 'Marta (QA Lead)', role: 'Quality Assurance', text: 'If a PR skips tests, send it back. We need receipts.' },
  { speaker: 'Jules (CTO)', role: 'CTO', text: 'Velocity matters, but not more than uptime. Use your judgment.' },
  { speaker: 'Noel (Security)', role: 'Security Analyst', text: 'Anything with auth or tokens? Treat it like it bites.' },
  { speaker: 'Tessa (Data Eng)', role: 'Data Engineering', text: 'Analytics team is watching for logic slips—double-check comparisons.' },
  { speaker: 'Omar (Support)', role: 'Customer Support', text: 'Every bug we block is one fewer angry ticket. Help us out.' },
  { speaker: 'Ling (Finance)', role: 'Finance Ops', text: 'Billing jobs are fragile right now. Guard those boundary checks.' },
  { speaker: 'Priya (Compliance)', role: 'Compliance', text: 'Docs need to be pristine. No TODOs sneaking into README, please.' },
  { speaker: 'Cal (Infra)', role: 'Infrastructure', text: 'Queue backlogs are high; prioritize jobs that unblock other teams.' },
  { speaker: 'Ben (Design)', role: 'Design Lead', text: 'UI tweaks can go fast—just make sure they actually render.' },
  { speaker: 'Sasha (AI Ops)', role: 'AI Operations', text: 'Packet analyzer helpers must normalize inputs. No shortcuts.' },
  { speaker: 'Harriet (Legal)', role: 'Legal', text: 'No raw PII in logs. Flag anything sketchy immediately.' },
  { speaker: 'Diego (Release Mgr)', role: 'Release Manager', text: 'Ship clean, ship steady, keep the metrics in the green.' },
  { speaker: 'Imani (People Ops)', role: 'People Ops', text: 'Remember to breathe. Approvals are a marathon, not a sprint.' },
  { speaker: 'Quinn (Chief of Staff)', role: 'Chief of Staff', text: 'Leadership is reading daily summaries now—make them proud.' },
  { speaker: 'Milo (Observability)', role: 'Observability', text: 'Watch for logging changes that could flood Grafana. It happened before.' },
  { speaker: 'Hazel (Backend)', role: 'Backend Lead', text: 'Logic bugs cost us last week. Compare, don’t assign.' },
  { speaker: 'Aria (Growth)', role: 'Growth PM', text: 'Feature rollout is hot. Approve the safe stuff quickly.' },
  { speaker: 'Jonah (Intern)', role: 'Summer Intern', text: 'I triple-checked my PR… probably. Please look anyway.' }
];

export const getRandomDayQuote = (): DayQuote => {
  if (dayQuotes.length === 0) {
    return { speaker: 'Release Ops', role: 'Ops', text: 'Keep calm and ship clean.' };
  }
  const index = Math.floor(Math.random() * dayQuotes.length);
  return dayQuotes[index];
};
