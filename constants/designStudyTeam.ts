import type { BugKind, PullRequest } from '../types';

export type StudyLocale = 'en' | 'es';
export type StudyExpression = 'neutral' | 'pleased' | 'concerned';
export const studyTeam = [
  {
    "id": "lucia",
    "name": "Lucía Navarro",
    "role": {
      "en": "Frontend developer",
      "es": "Desarrolladora frontend"
    },
    "quote": {
      "en": "The first empty screen is part of the product, too.",
      "es": "La primera pantalla vacía también es producto."
    },
    "title": {
      "en": "Give new workspaces a proper welcome",
      "es": "Dar la bienvenida a los espacios nuevos"
    },
    "filename": "src/components/Welcome.tsx",
    "branch": "welcome-workspace",
    "lines": [
      "export function Welcome({ onCreate }: Props) {",
      "  return (",
      "    <section aria-label=\"Your workspace\">",
      "      <h2>Good things start small.</h2>",
      "      <button type=\"button\" onClick={onCreate}>",
      "        Create a project",
      "      </button>",
      "    </section>",
      "  );",
      "}"
    ],
    "bugLine": 5,
    "flawedLine": "      <button type=\"button\" onClick={() => onCreate}>",
    "bugKind": "logic"
  },
  {
    "id": "diego",
    "name": "Diego Martín",
    "role": {
      "en": "Backend developer",
      "es": "Desarrollador backend"
    },
    "quote": {
      "en": "Small diff. Still deserves a proper look.",
      "es": "Pocos cambios. Merecen una buena revisión."
    },
    "title": {
      "en": "Make account logs useful after midnight",
      "es": "Registros de cuentas útiles de madrugada"
    },
    "filename": "src/api/account.ts",
    "branch": "account-observability",
    "lines": [
      "export async function getAccount(req: Request) {",
      "  const session = await requireSession(req);",
      "  const account = await db.account.findUnique({",
      "    where: { id: session.accountId },",
      "  });",
      "  if (!account) return new Response(null, { status: 404 });",
      "",
      "  logger.info(\"Account loaded\", {",
      "    accountId: account.id,",
      "    traceId: req.headers.get(\"x-request-id\"),",
      "  });",
      "  return Response.json({ name: account.name });",
      "}"
    ],
    "bugLine": 10,
    "flawedLine": "    accessToken: session.accessToken,",
    "bugKind": "security"
  },
  {
    "id": "ines",
    "name": "Inés Romero",
    "role": {
      "en": "Platform developer",
      "es": "Desarrolladora de plataforma"
    },
    "quote": {
      "en": "A setup worth running twice.",
      "es": "Una configuración que merece repetirse."
    },
    "title": {
      "en": "Give the worker pool a sensible ceiling",
      "es": "Poner un límite sensato al grupo de workers"
    },
    "filename": "src/platform/workers.ts",
    "branch": "worker-ceiling",
    "lines": [
      "export function workerCount(requested: number) {",
      "  const MAX_WORKERS = 8;",
      "  if (!Number.isFinite(requested)) return 1;",
      "  const count = Math.floor(requested);",
      "  return Math.max(1, Math.min(MAX_WORKERS, count));",
      "}"
    ],
    "bugLine": 5,
    "flawedLine": "  return Math.max(1, Math.max(MAX_WORKERS, count));",
    "bugKind": "performance"
  },
  {
    "id": "tessa",
    "name": "Tessa",
    "role": {
      "en": "Data developer",
      "es": "Desarrolladora de datos"
    },
    "quote": {
      "en": "The empty dataset deserves a test too.",
      "es": "El conjunto vacío también merece una prueba."
    },
    "title": {
      "en": "Count quiet days in the activity digest",
      "es": "Contar los días tranquilos en el resumen"
    },
    "filename": "src/data/digest.ts",
    "branch": "quiet-day-digest",
    "lines": [
      "export function averageActivity(counts: number[]) {",
      "  // A quiet workspace should report zero.",
      "  if (counts.length === 0) return 0;",
      "  const total = counts.reduce((sum, count) => sum + count, 0);",
      "  return total / counts.length;",
      "}"
    ],
    "bugLine": 3,
    "flawedLine": "  if (counts.length < 0) return 0;",
    "bugKind": "logic"
  },
  {
    "id": "ben",
    "name": "Ben",
    "role": {
      "en": "Design engineer",
      "es": "Ingeniero de diseño"
    },
    "quote": {
      "en": "Looks right. Now let’s check how it behaves.",
      "es": "Se ve bien. Ahora comprobemos cómo se comporta."
    },
    "title": {
      "en": "Make the command menu a keyboard regular",
      "es": "Abrir el menú de comandos con el teclado"
    },
    "filename": "src/components/CommandTrigger.tsx",
    "branch": "command-menu",
    "lines": [
      "export function CommandTrigger({ open }: Props) {",
      "  return (",
      "    <button type=\"button\" onClick={open}",
      "      aria-label=\"Open command menu\"",
      "      tabIndex={0}>",
      "      <SearchIcon aria-hidden=\"true\" />",
      "    </button>",
      "  );",
      "}"
    ],
    "bugLine": 5,
    "flawedLine": "      tabIndex={-1}>",
    "bugKind": "accessibility"
  },
  {
    "id": "jonah",
    "name": "Jonah",
    "role": {
      "en": "Junior developer",
      "es": "Desarrollador júnior"
    },
    "quote": {
      "en": "Can we add that case to the test?",
      "es": "¿Podemos añadir ese caso a la prueba?"
    },
    "title": {
      "en": "Let the last invitation take its seat",
      "es": "Dejar sitio a la última invitación"
    },
    "filename": "src/team/invitations.ts",
    "branch": "last-seat",
    "lines": [
      "export function canInvite(members: number, limit: number) {",
      "  // Each invitation needs one available seat.",
      "  const remaining = limit - members;",
      "  return remaining > 0;",
      "}"
    ],
    "bugLine": 4,
    "flawedLine": "  return remaining >= 0;",
    "bugKind": "logic"
  },
  {
    "id": "marta",
    "name": "Marta",
    "role": {
      "en": "QA automation engineer",
      "es": "Ingeniera de automatización QA"
    },
    "quote": {
      "en": "Reproduced. Keeping the regression case.",
      "es": "Reproducido. Conservo la prueba de regresión."
    },
    "title": {
      "en": "Keep retry checks from becoming forever checks",
      "es": "Evitar comprobaciones que se repiten para siempre"
    },
    "filename": "src/testing/retry.ts",
    "branch": "bounded-retries",
    "lines": [
      "export async function retryCheck(check: () => Promise<boolean>) {",
      "  for (let attempt = 0; attempt < 3; attempt += 1) {",
      "    const passed = await check();",
      "    if (passed) return true;",
      "  }",
      "  return false;",
      "}"
    ],
    "bugLine": 2,
    "flawedLine": "  for (let attempt = 0; attempt < 3; attempt -= 1) {",
    "bugKind": "logic"
  },
  {
    "id": "evan",
    "name": "Evan",
    "role": {
      "en": "Site reliability engineer",
      "es": "Ingeniero de fiabilidad"
    },
    "quote": {
      "en": "One less surprise at three in the morning.",
      "es": "Una sorpresa menos a las tres de la mañana."
    },
    "title": {
      "en": "Give sleepy connections a deadline",
      "es": "Poner plazo a las conexiones dormidas"
    },
    "filename": "src/ops/timeout.ts",
    "branch": "connection-deadline",
    "lines": [
      "export function timeoutMs(seconds: number) {",
      "  // The client expects milliseconds, not seconds.",
      "  const bounded = Math.max(1, Math.min(seconds, 30));",
      "  return bounded * 1000;",
      "}"
    ],
    "bugLine": 4,
    "flawedLine": "  return bounded / 1000;",
    "bugKind": "logic"
  },
  {
    "id": "noel",
    "name": "Noel",
    "role": {
      "en": "Security engineer",
      "es": "Ingeniero de seguridad"
    },
    "quote": {
      "en": "Who controls that input?",
      "es": "¿Quién controla esa entrada?"
    },
    "title": {
      "en": "Keep shared notes inside their own workspace",
      "es": "Mantener cada nota en su espacio de trabajo"
    },
    "filename": "src/security/notes.ts",
    "branch": "workspace-boundary",
    "lines": [
      "export function canReadNote(user: User, note: Note) {",
      "  const sameWorkspace = user.workspaceId === note.workspaceId;",
      "  const activeMember = user.status === \"active\";",
      "  return sameWorkspace && activeMember;",
      "}"
    ],
    "bugLine": 4,
    "flawedLine": "  return sameWorkspace || activeMember;",
    "bugKind": "security"
  },
  {
    "id": "riya",
    "name": "Riya",
    "role": {
      "en": "Product manager",
      "es": "Responsable de producto"
    },
    "quote": {
      "en": "Let’s ship the safe part first.",
      "es": "Publiquemos primero la parte segura."
    },
    "title": {
      "en": "Open the beta door for invited teams",
      "es": "Abrir la beta a los equipos invitados"
    },
    "filename": "src/product/beta.ts",
    "branch": "beta-guest-list",
    "lines": [
      "export function betaEnabled(team: Team, invitedIds: string[]) {",
      "  // Beta access requires both an invitation and consent.",
      "  const invited = invitedIds.includes(team.id);",
      "  return invited && team.betaConsent;",
      "}"
    ],
    "bugLine": 4,
    "flawedLine": "  return invited || team.betaConsent;",
    "bugKind": "logic"
  }
] as const;

export type StudyPerson = typeof studyTeam[number]['id'];
export function studyReview(sequence: number, locale: StudyLocale): PullRequest {
  const person = studyTeam[sequence % studyTeam.length];
  // Alternating editions ensure no coworker's identity predicts correctness.
  const flawed = (sequence % studyTeam.length + Math.floor(sequence / studyTeam.length)) % 2 === 1;
  return { id: `afterhours-${1042 + sequence}`, templateId: `study-${person.id}-${flawed ? 'flawed' : 'clean'}`,
    title: person.title[locale], author: person.name, authorId: person.id, description: '', tags: [], importance: (['low', 'normal', 'high'] as const)[sequence % studyTeam.length % 3], estimatedReviewSeconds: 30,
    files: [{ filename: person.filename, language: 'typescript', lines: person.lines.map((content, i) => ({ content: flawed && i + 1 === person.bugLine ? person.flawedLine : content, lineNumber: i + 1, isNew: true })) }],
    bugPatterns: flawed ? [{ kind: person.bugKind as BugKind, severity: person.bugKind === 'security' ? 'critical' : 'major', lineNumbers: [person.bugLine] }] : [] };
}

export interface StudyQueue {
  pending: number[];
  active: number;
  next: number;
}

export function initialStudyQueue(): StudyQueue {
  return { pending: Array.from({ length: studyTeam.length }, (_, index) => index), active: 0, next: studyTeam.length };
}

/** Consume only the reviewed request; browsing the queue never discards work. */
export function completeStudyReview(queue: StudyQueue): StudyQueue {
  const pending = [...queue.pending.filter(id => id !== queue.active), queue.next];
  return { pending, active: pending[0], next: queue.next + 1 };
}
