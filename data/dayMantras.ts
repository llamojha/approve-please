import { Locale } from '../types';

export type DayMantra = Record<Locale, string>;

const DEFAULT_MANTRA: DayMantra = {
  en: 'Operations',
  es: 'Operaciones'
};

export const dayMantras: DayMantra[] = [
  {
    en: 'Security sweeps today - slow your scroll, catch every leak.',
    es: 'Operativo de seguridad hoy: baja la velocidad y detecta cada filtración.'
  },
  {
    en: "If it smells off, it's off - reject and move on.",
    es: 'Si huele mal, está mal: rechaza y sigue.'
  },
  {
    en: "Audit day: if it's not tested, it's not approved.",
    es: 'Día de auditoría: si no está probado, no se aprueba.'
  },
  {
    en: 'Green checks over green lights - tests first, throughput second.',
    es: 'Checks verdes antes que luces verdes: primero pruebas, después ritmo.'
  },
  {
    en: "Friday deploy rush - move fast, but don't break the brand.",
    es: 'Carrera de deploy del viernes: avanza rápido, pero sin romper la marca.'
  },
  {
    en: 'Chaos sprint mode: ship clean, skip vanity.',
    es: 'Modo sprint caótico: entrega limpio y olvida la vanidad.'
  },
  {
    en: 'Incident fallout - no risks, no spin, only safe releases.',
    es: 'Secuelas de incidente: cero riesgos, cero humo, solo releases seguros.'
  },
  {
    en: 'Yesterday burned us - today, nothing sketchy leaves this desk.',
    es: 'Ayer nos quemamos: hoy no sale nada sospechoso de este escritorio.'
  },
  {
    en: 'Compliance spotlight on - gray areas are now red flags.',
    es: 'Reflector de compliance: las zonas grises ahora son banderas rojas.'
  },
  {
    en: 'If a lawyer might squint, you should reject.',
    es: 'Si un abogado podría fruncir el ceño, recházalo.'
  },
  {
    en: 'Performance panic - every millisecond is sacred.',
    es: 'Pánico de performance: cada milisegundo es sagrado.'
  },
  {
    en: 'Fewer words, faster world - trim every nonessential.',
    es: 'Menos palabras, mundo más veloz: recorta lo que no sea esencial.'
  },
  {
    en: 'Ops on edge - avoid complexity, bless the simple path.',
    es: 'Ops al límite: evita la complejidad, bendice el camino simple.'
  },
  {
    en: 'Today we chase numbers - say yes to bold but safe.',
    es: 'Hoy perseguimos métricas: di que sí a lo audaz pero seguro.'
  },
  {
    en: 'Engagement day - back the risky idea, not the boring one.',
    es: 'Día de engagement: apoya la idea arriesgada, no la aburrida.'
  },
  {
    en: 'Growth storm - opt in to experiments, opt out of fear.',
    es: 'Tormenta de growth: únete a los experimentos, abandona el miedo.'
  },
  {
    en: 'Brand trust day - protect feelings before funnels.',
    es: 'Día de confianza de marca: protege emociones antes que funnels.'
  },
  {
    en: 'Real people read this - choose kindness over cleverness.',
    es: 'Gente real lee esto: elige la amabilidad sobre la genialidad.'
  },
  {
    en: 'Tone check: one rude line can sink the whole release.',
    es: 'Chequeo de tono: una línea grosera puede hundir el release completo.'
  },
  {
    en: "Accessibility focus - if everyone can't use it, no one ships it.",
    es: 'Enfoque en accesibilidad: si no todos pueden usarlo, nadie lo envía.'
  },
  {
    en: 'Security breach aftermath - assume attackers read everything.',
    es: 'Posbrecha de seguridad: asume que los atacantes leen todo.'
  },
  {
    en: 'Paranoia is policy now: verify, re-verify, then approve.',
    es: 'La paranoia es política: verifica, vuelve a verificar y recién aprueba.'
  },
  {
    en: 'Data hunger day - collect less, justify more.',
    es: 'Día de hambre de datos: recolecta menos, justifica más.'
  },
  {
    en: "Privacy spotlight - if you can't defend it, don't approve it.",
    es: 'Reflector de privacidad: si no puedes defenderlo, no lo apruebes.'
  },
  {
    en: "Legal is watching - no promises you can't legally keep.",
    es: 'Legal está mirando: no prometas nada que no puedas cumplir legalmente.'
  },
  {
    en: 'Regulation wave - when in doubt, over-disclose.',
    es: 'Oleada regulatoria: ante la duda, sobre-explica.'
  },
  {
    en: "Exec review day - messy PRs become your problem, not theirs.",
    es: 'Día de revisión ejecutiva: los PRs desordenados ahora son tu problema.'
  },
  {
    en: 'Keep it polished - typos today read like incompetence tomorrow.',
    es: 'Manténlo pulido: los typos de hoy serán incompetencia mañana.'
  },
  {
    en: 'Launch eve - stability beats sparkle.',
    es: 'Víspera de lanzamiento: la estabilidad vence al brillo.'
  },
  {
    en: 'Big release day - no TODOs survive the desk.',
    es: 'Gran día de release: ningún TODO sobrevive en este escritorio.'
  },
  {
    en: 'Error budget bleeding - slow approvals, save the system.',
    es: 'Budget de errores sangrando: frena aprobaciones, salva el sistema.'
  },
  {
    en: 'Rate limits tight - favor small, low-risk changes.',
    es: 'Límites de tasa ajustados: prioriza cambios pequeños y de bajo riesgo.'
  },
  {
    en: "Outage hangover - ship only what can't break twice.",
    es: 'Resaca de outage: solo envía lo que no pueda romperse dos veces.'
  },
  {
    en: "Cost-cutting sprint - performance and efficiency or it doesn't pass.",
    es: 'Sprint de recorte de costos: sin performance y eficiencia no pasa.'
  },
  {
    en: "Infra stress test - heavy features wait, lean features go.",
    es: 'Stress test de infra: las features pesadas esperan, las ligeras avanzan.'
  },
  {
    en: "On-call empathy day - don't approve anything you'd hate to debug at 3am.",
    es: 'Día de empatía on-call: no apruebes lo que odiarías depurar a las 3am.'
  },
  {
    en: 'Vendor chaos - trust nothing that talks to third parties.',
    es: 'Caos de vendors: no confíes en nada que hable con terceros.'
  },
  {
    en: 'Shadow IT alert - unowned code is unapproved code.',
    es: 'Alerta de shadow IT: el código sin dueño no se aprueba.'
  },
  {
    en: 'Phishing scare - scrutinize every link like it bites.',
    es: 'Susto de phishing: revisa cada enlace como si mordiera.'
  },
  {
    en: 'Security theater day - if it looks insecure, it is.',
    es: 'Día de teatro de seguridad: si parece inseguro, lo es.'
  },
  {
    en: 'Throughput challenge - approve fast, but never blind.',
    es: 'Desafío de throughput: aprueba rápido, pero nunca a ciegas.'
  },
  {
    en: 'Speed trial - first instinct rules, second glance saves.',
    es: 'Prueba de velocidad: manda tu primer instinto, pero valida con la segunda mirada.'
  },
  {
    en: 'Leniency day - assume good intent, nudge instead of nuke.',
    es: 'Día de indulgencia: asume buena intención, empuja en lugar de explotar.'
  },
  {
    en: 'Hardliner day - one serious flaw is an instant no.',
    es: 'Día de dureza: un fallo serio es un no instantáneo.'
  },
  {
    en: 'Refactor focus - reward cleanup, punish cruft.',
    es: 'Enfoque en refactor: premia la limpieza, castiga la mugre.'
  },
  {
    en: "Docs day - if it's not explained, it's not approved.",
    es: 'Día de docs: si no está explicado, no se aprueba.'
  },
  {
    en: 'Metrics day - approve what you can measure.',
    es: 'Día de métricas: aprueba lo que puedas medir.'
  },
  {
    en: 'Experiments open - A/B tests get priority in the queue.',
    es: 'Experimentos abiertos: los A/B tienen prioridad en la cola.'
  },
  {
    en: 'User trust fragile - no dark patterns on your watch.',
    es: 'La confianza del usuario es frágil: nada de dark patterns bajo tu vigilancia.'
  },
  {
    en: "Remember: you're the last gate - ship what you'd sign your name to.",
    es: 'Recuerda: eres la última puerta. Solo envía lo que firmarías.'
  }
];

export const getDayMantra = (): DayMantra => {
  if (dayMantras.length === 0) {
    return DEFAULT_MANTRA;
  }
  const index = Math.floor(Math.random() * dayMantras.length);
  return dayMantras[index];
};
