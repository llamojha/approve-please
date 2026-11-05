import type { CharacterReactions, Locale } from '../types';

/** Public identity metadata. Scenario code and answers stay out of this registry. */
export const characters = [
  { id: 'lucia', name: 'Lucía Navarro', role: { en: 'Frontend developer', es: 'Desarrolladora frontend' } },
  { id: 'diego', name: 'Diego Martín', role: { en: 'Backend developer', es: 'Desarrollador backend' } },
  { id: 'ines', name: 'Inés Romero', role: { en: 'Platform developer', es: 'Desarrolladora de plataforma' } },
  { id: 'tessa', name: 'Tessa', role: { en: 'Data developer', es: 'Desarrolladora de datos' } },
  { id: 'ben', name: 'Ben', role: { en: 'Design engineer', es: 'Ingeniero de diseño' } },
  { id: 'jonah', name: 'Jonah', role: { en: 'Junior developer', es: 'Desarrollador júnior' } },
  { id: 'marta', name: 'Marta', role: { en: 'QA automation engineer', es: 'Ingeniera de automatización QA' } },
  { id: 'evan', name: 'Evan', role: { en: 'Site reliability engineer', es: 'Ingeniero de fiabilidad' } },
  { id: 'noel', name: 'Noel', role: { en: 'Security engineer', es: 'Ingeniero de seguridad' } },
  { id: 'riya', name: 'Riya', role: { en: 'Product manager', es: 'Responsable de producto' } },
] as const;

export type CharacterId = typeof characters[number]['id'];

const reactionCopy: Record<CharacterId, CharacterReactions> = {
  lucia: {
    'clean-approval': { en: 'Nice. The first run stays simple.', es: 'Bien. El primer uso sigue siendo sencillo.' },
    'correct-rejection': { en: 'Good catch — that interaction needed another pass.', es: 'Buena captura: esa interacción necesitaba otra vuelta.' },
    'buggy-approval': { en: 'That empty state is going to feel very empty.', es: 'Ese estado vacío va a sentirse demasiado vacío.' },
    'false-positive': { en: 'I can tighten the explanation, but the change was safe.', es: 'Puedo aclarar la explicación, pero el cambio era seguro.' },
  },
  diego: {
    'clean-approval': { en: 'Merged. One less thing for tonight’s on-call.', es: 'Integrado. Una cosa menos para la guardia de esta noche.' },
    'correct-rejection': { en: 'Good stop. I’ll make the failure path boring.', es: 'Bien parado. Haré que el fallo sea aburrido.' },
    'buggy-approval': { en: 'I’ll keep the incident channel open.', es: 'Dejaré abierto el canal de incidentes.' },
    'false-positive': { en: 'Fair question. This path was already covered.', es: 'Buena pregunta. Este caso ya estaba cubierto.' },
  },
  ines: {
    'clean-approval': { en: 'The platform lives to automate another day.', es: 'La plataforma vive para automatizar otro día.' },
    'correct-rejection': { en: 'You found the sharp edge before everyone else did.', es: 'Encontraste el borde peligroso antes que el resto.' },
    'buggy-approval': { en: 'That will echo across a few services.', es: 'Eso va a resonar en unos cuantos servicios.' },
    'false-positive': { en: 'The guardrail is noisy, but it is holding.', es: 'La protección hace ruido, pero está funcionando.' },
  },
  tessa: {
    'clean-approval': { en: 'The numbers can start moving now.', es: 'Los números ya pueden empezar a moverse.' },
    'correct-rejection': { en: 'Good read. That data would have lied to us.', es: 'Buena lectura. Esos datos nos habrían mentido.' },
    'buggy-approval': { en: 'I hope nobody built a dashboard on that yet.', es: 'Espero que nadie haya montado un panel con eso todavía.' },
    'false-positive': { en: 'The query looks odd, but the result is sound.', es: 'La consulta parece rara, pero el resultado es correcto.' },
  },
  ben: {
    'clean-approval': { en: 'Tiny details, properly shipped.', es: 'Pequeños detalles, bien publicados.' },
    'correct-rejection': { en: 'Good eye. That would have felt wrong immediately.', es: 'Buen ojo. Eso se habría sentido mal enseguida.' },
    'buggy-approval': { en: 'That is going to look louder in production.', es: 'Eso va a verse mucho más en producción.' },
    'false-positive': { en: 'The unusual bit is intentional this time.', es: 'Esta vez la parte extraña es intencionada.' },
  },
  jonah: {
    'clean-approval': { en: 'It shipped! I checked it twice, honestly.', es: '¡Publicado! Lo revisé dos veces, de verdad.' },
    'correct-rejection': { en: 'Thank you. I know exactly what I missed now.', es: 'Gracias. Ahora sé exactamente qué se me escapó.' },
    'buggy-approval': { en: 'Oh no. I’m opening the fix now.', es: 'Vaya. Abro el arreglo ahora mismo.' },
    'false-positive': { en: 'I can add a comment so this is easier to trust.', es: 'Puedo añadir un comentario para que sea más fácil confiar.' },
  },
  marta: {
    'clean-approval': { en: 'Green here and green in the test run.', es: 'Verde aquí y verde en las pruebas.' },
    'correct-rejection': { en: 'Excellent. I’m turning that catch into a regression test.', es: 'Excelente. Convertiré esa captura en una prueba de regresión.' },
    'buggy-approval': { en: 'That gap belongs in the test suite tomorrow.', es: 'Ese hueco entra mañana en la suite de pruebas.' },
    'false-positive': { en: 'The automation already exercises that branch.', es: 'La automatización ya cubre esa rama.' },
  },
  evan: {
    'clean-approval': { en: 'Quiet deploys are my favorite kind.', es: 'Mis despliegues favoritos son los silenciosos.' },
    'correct-rejection': { en: 'You just saved the pager a long night.', es: 'Le acabas de ahorrar una noche larga al busca.' },
    'buggy-approval': { en: 'The pager is typing…', es: 'El busca está escribiendo…' },
    'false-positive': { en: 'The redundancy looks expensive until it is needed.', es: 'La redundancia parece cara hasta que hace falta.' },
  },
  noel: {
    'clean-approval': { en: 'Small surface, clear boundary. Good.', es: 'Superficie pequeña, límite claro. Bien.' },
    'correct-rejection': { en: 'Exactly. Trust that input only after the check.', es: 'Exacto. Confía en esa entrada solo después de comprobarla.' },
    'buggy-approval': { en: 'Rotate the keys. I’ll start the review.', es: 'Rotad las claves. Empiezo la revisión.' },
    'false-positive': { en: 'Suspicion is healthy. This boundary was intact.', es: 'Sospechar es sano. Este límite estaba intacto.' },
  },
  riya: {
    'clean-approval': { en: 'Great. The safe part can reach customers.', es: 'Genial. La parte segura puede llegar a clientes.' },
    'correct-rejection': { en: 'Right call. We can move fast after we make it safe.', es: 'Buena decisión. Podemos ir rápido después de hacerlo seguro.' },
    'buggy-approval': { en: 'We need a smaller blast radius, immediately.', es: 'Necesitamos reducir el impacto, ya.' },
    'false-positive': { en: 'Let’s unblock this and keep the concern documented.', es: 'Desbloqueemos esto y dejemos la preocupación documentada.' },
  },
};

export const getCharacter = (id: string | undefined) => characters.find(character => character.id === id);

export const reactionsForCharacter = (id: CharacterId, locale?: Locale): CharacterReactions => {
  if (!locale) return reactionCopy[id];
  return Object.fromEntries(Object.entries(reactionCopy[id]).map(([outcome, copy]) => [outcome, { [locale]: copy?.[locale] ?? copy?.en }])) as CharacterReactions;
};
