import { DayQuote } from '../types';

const DEFAULT_DAY_QUOTE: DayQuote = {
  speaker: 'Release Ops',
  role: {
    en: 'Ops',
    es: 'Operaciones'
  },
  text: {
    en: 'Keep calm and ship clean.',
    es: 'Mantén la calma y envía limpio.'
  }
};

export const dayQuotes: DayQuote[] = [
  {
    speaker: 'Riya (PM)',
    role: { en: 'Product Manager', es: 'Gerente de Producto' },
    text: {
      en: "Today's focus is fast approvals—marketing wants charts by lunch.",
      es: 'Hoy toca aprobar rápido: marketing quiere gráficas antes del almuerzo.'
    }
  },
  {
    speaker: 'Evan (SRE)',
    role: { en: 'Site Reliability', es: 'Fiabilidad del Sitio' },
    text: {
      en: 'Keep prod stable. One bad deploy and pager duty is all yours.',
      es: 'Mantén prod estable. Un deploy malo y el pager será todo tuyo.'
    }
  },
  {
    speaker: 'Marta (QA Lead)',
    role: { en: 'Quality Assurance', es: 'Aseguramiento de Calidad' },
    text: {
      en: 'If a PR skips tests, send it back. We need receipts.',
      es: 'Si un PR se salta los tests, devuélvelo. Necesitamos evidencias.'
    }
  },
  {
    speaker: 'Jules (CTO)',
    role: { en: 'CTO', es: 'CTO' },
    text: {
      en: 'Velocity matters, but not more than uptime. Use your judgment.',
      es: 'La velocidad importa, pero no más que la disponibilidad. Usa tu criterio.'
    }
  },
  {
    speaker: 'Noel (Security)',
    role: { en: 'Security Analyst', es: 'Analista de Seguridad' },
    text: {
      en: 'Anything with auth or tokens? Treat it like it bites.',
      es: '¿Algo con auth o tokens? Trátalo como si mordiera.'
    }
  },
  {
    speaker: 'Tessa (Data Eng)',
    role: { en: 'Data Engineering', es: 'Ingeniería de Datos' },
    text: {
      en: 'Analytics team is watching for logic slips—double-check comparisons.',
      es: 'El equipo de analytics vigila errores de lógica: revisa las comparaciones dos veces.'
    }
  },
  {
    speaker: 'Omar (Support)',
    role: { en: 'Customer Support', es: 'Atención al Cliente' },
    text: {
      en: 'Every bug we block is one fewer angry ticket. Help us out.',
      es: 'Cada bug que bloqueamos es un ticket enojado menos. Échanos la mano.'
    }
  },
  {
    speaker: 'Ling (Finance)',
    role: { en: 'Finance Ops', es: 'Operaciones Financieras' },
    text: {
      en: 'Billing jobs are fragile right now. Guard those boundary checks.',
      es: 'Los jobs de facturación están frágiles. Protege esos boundary checks.'
    }
  },
  {
    speaker: 'Priya (Compliance)',
    role: { en: 'Compliance', es: 'Compliance' },
    text: {
      en: 'Docs need to be pristine. No TODOs sneaking into README, please.',
      es: 'Las docs deben estar impecables. Nada de TODOs escondidos en el README.'
    }
  },
  {
    speaker: 'Cal (Infra)',
    role: { en: 'Infrastructure', es: 'Infraestructura' },
    text: {
      en: 'Queue backlogs are high; prioritize jobs that unblock other teams.',
      es: 'La cola está saturada; prioriza los trabajos que desbloqueen a otros equipos.'
    }
  },
  {
    speaker: 'Ben (Design)',
    role: { en: 'Design Lead', es: 'Líder de Diseño' },
    text: {
      en: 'UI tweaks can go fast—just make sure they actually render.',
      es: 'Los retoques de UI pueden ir rápido; solo asegúrate de que realmente rendericen.'
    }
  },
  {
    speaker: 'Sasha (AI Ops)',
    role: { en: 'AI Operations', es: 'Operaciones de IA' },
    text: {
      en: 'Packet analyzer helpers must normalize inputs. No shortcuts.',
      es: 'Los helpers del analizador de paquetes deben normalizar inputs. Nada de atajos.'
    }
  },
  {
    speaker: 'Harriet (Legal)',
    role: { en: 'Legal', es: 'Legal' },
    text: {
      en: 'No raw PII in logs. Flag anything sketchy immediately.',
      es: 'Nada de PII cruda en logs. Marca lo sospechoso de inmediato.'
    }
  },
  {
    speaker: 'Diego (Release Mgr)',
    role: { en: 'Release Manager', es: 'Gerente de Lanzamientos' },
    text: {
      en: 'Ship clean, ship steady, keep the metrics in the green.',
      es: 'Entrega limpio y parejo, mantén las métricas en verde.'
    }
  },
  {
    speaker: 'Imani (People Ops)',
    role: { en: 'People Ops', es: 'Operaciones de Personas' },
    text: {
      en: 'Remember to breathe. Approvals are a marathon, not a sprint.',
      es: 'Respira. Las aprobaciones son una maratón, no un sprint.'
    }
  },
  {
    speaker: 'Quinn (Chief of Staff)',
    role: { en: 'Chief of Staff', es: 'Jefe de Gabinete' },
    text: {
      en: 'Leadership is reading daily summaries now—make them proud.',
      es: 'Leadership lee los resúmenes diarios ahora: haz que se sientan orgullosos.'
    }
  },
  {
    speaker: 'Milo (Observability)',
    role: { en: 'Observability', es: 'Observabilidad' },
    text: {
      en: 'Watch for logging changes that could flood Grafana. It happened before.',
      es: 'Cuida los cambios de logging que puedan inundar Grafana. Ya pasó.'
    }
  },
  {
    speaker: 'Hazel (Backend)',
    role: { en: 'Backend Lead', es: 'Líder Backend' },
    text: {
      en: 'Logic bugs cost us last week. Compare, don’t assign.',
      es: 'Los bugs de lógica nos costaron la semana pasada. Compara, no asignes.'
    }
  },
  {
    speaker: 'Aria (Growth)',
    role: { en: 'Growth PM', es: 'PM de Growth' },
    text: {
      en: 'Feature rollout is hot. Approve the safe stuff quickly.',
      es: 'El rollout de features está caliente. Aprueba rápido lo seguro.'
    }
  },
  {
    speaker: 'Jonah (Intern)',
    role: { en: 'Summer Intern', es: 'Practicante de verano' },
    text: {
      en: 'I triple-checked my PR… probably. Please look anyway.',
      es: 'Revisé mi PR tres veces... creo. Revísalo igual, porfa.'
    }
  },
  {
    speaker: 'Mina (Automation)',
    role: { en: 'Build Engineer', es: 'Ingeniera de Build' },
    text: {
      en: 'Remember when CI exploded because someone rm -rf’d /? Let’s not do sequels.',
      es: '¿Recuerdas cuando CI explotó porque alguien hizo rm -rf /? No hagamos secuelas.'
    }
  },
  {
    speaker: 'Sam (Designer)',
    role: { en: 'Design', es: 'Diseño' },
    text: {
      en: 'If you see lorem ipsum in prod UI again, just pretend you didn’t hear it from me.',
      es: 'Si ves lorem ipsum en la UI de prod otra vez, finge que no te lo dije.'
    }
  },
  {
    speaker: 'Leo (Support Bot)',
    role: { en: 'Chatbot', es: 'Chatbot' },
    text: {
      en: '01001000 01100101 01101100 01110000. Translation: please add tests.',
      es: '01001000 01100101 01101100 01110000. Traducción: agrega tests, por favor.'
    }
  },
  {
    speaker: 'Casey (Release Ops)',
    role: { en: 'Ops', es: 'Operaciones' },
    text: {
      en: 'I named the servers after Star Trek captains so we’d respect them. It’s not working.',
      es: 'Le puse nombres de capitanes de Star Trek a los servers para que los respetaran. No funcionó.'
    }
  },
  {
    speaker: 'Dani (QA)',
    role: { en: 'QA Lead', es: 'Líder QA' },
    text: {
      en: 'Flaky test? Quarantine it. Flaky PM? I can’t help you there.',
      es: '¿Test flaky? Ponlo en cuarentena. ¿PM flaky? Ahí no puedo ayudarte.'
    }
  },
  {
    speaker: 'Rowan (Docs)',
    role: { en: 'Tech Writer', es: 'Redactora Técnica' },
    text: {
      en: 'Docs PRs get lonely. Approve them and they’ll tell you secrets.',
      es: 'Los PRs de docs se sienten solos. Apruébalos y te contarán secretos.'
    }
  },
  {
    speaker: 'Ivy (Security)',
    role: { en: 'Security', es: 'Seguridad' },
    text: {
      en: 'If the token starts with “lol-”, request changes immediately.',
      es: 'Si el token empieza con “lol-”, pide cambios de inmediato.'
    }
  },
  {
    speaker: 'Zeke (Infra)',
    role: { en: 'Infrastructure', es: 'Infraestructura' },
    text: {
      en: 'The queue looks small now. That’s how horror movies start.',
      es: 'La cola se ve pequeña ahora. Así empiezan las películas de terror.'
    }
  },
  {
    speaker: 'Alma (Data Science)',
    role: { en: 'Data Scientist', es: 'Científica de Datos' },
    text: {
      en: 'Shipping bugs is like feeding gremlins after midnight. Please don’t.',
      es: 'Enviar bugs es como alimentar gremlins después de medianoche. Mejor no.'
    }
  },
  {
    speaker: 'Poppy (Finance)',
    role: { en: 'Finance Ops', es: 'Operaciones Financieras' },
    text: {
      en: 'Accounting says “thanks” when you block overflows. That’s basically profit sharing.',
      es: 'Contabilidad dice “gracias” cuando bloqueas overflows. Eso casi cuenta como reparto de utilidades.'
    }
  }
];

export const getRandomDayQuote = (): DayQuote => {
  if (dayQuotes.length === 0) {
    return DEFAULT_DAY_QUOTE;
  }
  const index = Math.floor(Math.random() * dayQuotes.length);
  return dayQuotes[index];
};
