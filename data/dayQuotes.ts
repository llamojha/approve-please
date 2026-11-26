import { DayQuote } from '../types';

const DEFAULT_DAY_QUOTE: DayQuote = {
  characterId: 'riya',
  speaker: 'Riya',
  role: { en: 'Product manager', es: 'Responsable de producto' },
  text: {
    en: 'The queue will ask for speed. Your job is to know when speed gets expensive.',
    es: 'La cola te pedirá velocidad. Tu trabajo es saber cuándo la velocidad sale cara.'
  }
};

/** Shift notes come from the same ten coworkers players meet in the review queue. */
export const dayQuotes: DayQuote[] = [
  DEFAULT_DAY_QUOTE,
  {
    characterId: 'lucia', speaker: 'Lucía Navarro',
    role: { en: 'Frontend developer', es: 'Desarrolladora frontend' },
    text: {
      en: 'A tiny UI change can still hide a broken keyboard path. Give it one real pass.',
      es: 'Un cambio pequeño de interfaz aún puede romper el teclado. Dale una revisión de verdad.'
    }
  },
  {
    characterId: 'diego', speaker: 'Diego Martín',
    role: { en: 'Backend developer', es: 'Desarrollador backend' },
    text: {
      en: 'Read the failure path first. The happy path already has enough friends.',
      es: 'Lee primero el camino de error. El camino feliz ya tiene suficientes amigos.'
    }
  },
  {
    characterId: 'ines', speaker: 'Inés Romero',
    role: { en: 'Platform developer', es: 'Desarrolladora de plataforma' },
    text: {
      en: 'Platform changes travel farther than they look. Check who inherits the edge cases.',
      es: 'Los cambios de plataforma llegan más lejos de lo que parece. Mira quién hereda los casos límite.'
    }
  },
  {
    characterId: 'tessa', speaker: 'Tessa',
    role: { en: 'Data developer', es: 'Desarrolladora de datos' },
    text: {
      en: 'Plausible numbers are the sneakiest bugs. Follow the comparison, not the confidence.',
      es: 'Los números creíbles son los errores más escurridizos. Sigue la comparación, no la confianza.'
    }
  },
  {
    characterId: 'ben', speaker: 'Ben',
    role: { en: 'Design engineer', es: 'Ingeniero de diseño' },
    text: {
      en: 'If an interaction needs a paragraph to explain it, the code may not be the only thing to review.',
      es: 'Si una interacción necesita un párrafo para explicarse, quizá el código no sea lo único que revisar.'
    }
  },
  {
    characterId: 'jonah', speaker: 'Jonah',
    role: { en: 'Junior developer', es: 'Desarrollador júnior' },
    text: {
      en: 'I checked my PR twice. Please check the part I was too sure about.',
      es: 'Revisé mi PR dos veces. Mira justo la parte de la que estaba demasiado seguro.'
    }
  },
  {
    characterId: 'marta', speaker: 'Marta',
    role: { en: 'QA automation engineer', es: 'Ingeniera de automatización QA' },
    text: {
      en: 'A green test run is evidence, not immunity. Read what the test forgot to ask.',
      es: 'Las pruebas en verde son evidencia, no inmunidad. Lee lo que olvidaron preguntar.'
    }
  },
  {
    characterId: 'evan', speaker: 'Evan',
    role: { en: 'Site reliability engineer', es: 'Ingeniero de fiabilidad' },
    text: {
      en: 'A quiet pager is built one boring, careful review at a time.',
      es: 'Un busca silencioso se consigue con revisiones aburridas y cuidadosas, una a una.'
    }
  },
  {
    characterId: 'noel', speaker: 'Noel',
    role: { en: 'Security engineer', es: 'Ingeniero de seguridad' },
    text: {
      en: 'Trust the input after the check, never because the variable name sounds friendly.',
      es: 'Confía en la entrada después de comprobarla, nunca porque la variable tenga un nombre amable.'
    }
  }
];

export const getDefaultDayQuote = (): DayQuote => dayQuotes[0] ?? DEFAULT_DAY_QUOTE;

export const getRandomDayQuote = (): DayQuote => {
  if (dayQuotes.length === 0) return DEFAULT_DAY_QUOTE;
  return dayQuotes[Math.floor(Math.random() * dayQuotes.length)];
};
