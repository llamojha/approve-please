import { designStudyCopy } from "./designStudyCopy";
import { audioCopy } from "./audioCopy";
import { landingPageCopy } from "./landingPageCopy";
import { BugKind, Locale } from "../types";
export type GameOverReasonKey = "stability" | "satisfaction" | "velocity" | "generic";

export const LOCALE_OPTIONS = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
] as const;

const bugKindLabels: Record<Locale, Record<BugKind, string>> = {
  en: {
    logic: "logic",
    security: "security",
    performance: "performance",
    style: "style",
    accessibility: "accessibility",
  },
  es: {
    logic: "lógica",
    security: "seguridad",
    performance: "rendimiento",
    style: "estilo",
    accessibility: "accesibilidad",
  },
};

const severityLabels: Record<
  Locale,
  Record<"minor" | "major" | "critical", string>
> = {
  en: {
    minor: "minor",
    major: "major",
    critical: "critical",
  },
  es: {
    minor: "menor",
    major: "mayor",
    critical: "crítico",
  },
};

const importanceLabels: Record<
  Locale,
  Record<"low" | "normal" | "high", string>
> = {
  en: {
    low: "Low",
    normal: "Medium",
    high: "High",
  },
  es: {
    low: "Baja",
    normal: "Media",
    high: "Alta",
  },
};

const languagePreferenceLabels: Record<Locale, Record<string, string>> = {
  en: {
    generic: "Generic",
    typescript: "TypeScript",
    javascript: "JavaScript",
    python: "Python",
    java: "Java",
    rust: "Rust",
    css: "CSS",
  },
  es: {
    generic: "Genérico",
    typescript: "TypeScript",
    javascript: "JavaScript",
    python: "Python",
    java: "Java",
    rust: "Rust",
    css: "CSS",
  },
};

const difficultyLabels: Record<Locale, Record<string, string>> = {
  en: {
    normal: "Normal",
    learning: "Learning",
  },
  es: {
    normal: "Normal",
    learning: "Aprendizaje",
  },
};

export const TRANSLATIONS = {
  en: {
    designStudy: designStudyCopy.en,
    audio: audioCopy.en,
    localeToggleLabel: "Select language",
    landing: {
      refresh: landingPageCopy.en,
      title: "Approve Please",
      blurb:
        "Step into Release Ops. Review PRs, hold the line on stability, and try not to get fired.",
      missionHeading: "Mission Brief",
      missionTagline:
        "Ship fast, stop bugs, and don’t lose leadership’s trust.",
      primer:
        "Every day you triage a queue of PRs from 9–17h. Approve clean diffs to keep features moving, but catch the risky ones before they reach prod. Keep all three meters above zero to survive the week.",
      stats: {
        stability: {
          title: "Stability",
          description:
            "Shows prod health. Drops when buggy PRs sneak through, rises when you block real issues.",
        },
        velocity: {
          title: "Velocity",
          description:
            "Measures throughput. Approvals and quick reviews boost it, but false alarms drag it down.",
        },
        satisfaction: {
          title: "Team trust",
          description:
            "Tracks the team's confidence in your judgment. Smart calls earn trust; needless delays or outages lose it.",
        },
      },
      languageHeader: "Preferred Language",
      languageSubtitle: "Pick one or more. Add Generic for docs/config PRs.",
      difficultyHeader: "Difficulty",
      difficultySubtitle: "Learning mode disables queue penalties.",
      tutorialCta: "HOW TO PLAY",
      tutorialSlides: [
        {
          title: "Pick a PR",
          description: [
            "Choose a PR from the queue to load it into the review desk.",
            "Priority controls how much a waiting PR drains the team; it does not reveal whether the code is safe.",
          ],
          imageAlt: "Queue and PR selection",
        },
        {
          title: "Inspect the Diff",
          description: [
            "Read the description, branch, tags and changed code before deciding.",
            "Tag suspect lines for a precision bonus. Tags are optional and do not replace your verdict.",
          ],
          imageAlt: "Pull request description and code diff",
        },
        {
          title: "Approve vs Request Changes",
          description: [
            "Approve safe changes or request changes when you find a bug.",
            "The next PR arrives automatically after a short swipe. Use Alt+A or Alt+R to move faster.",
          ],
          imageAlt: "Action buttons for approve and request changes",
        },
        {
          title: "Meters & Consequences",
          description: [
            "Shipped bugs hurt Stability. Waiting PRs drain Velocity and Team trust at the rate shown by Queue pressure.",
            "High-priority work creates more pressure. Learning mode keeps the clock but disables queue drain.",
          ],
          imageAlt: "Meter HUD showing stability, velocity, team trust and queue pressure",
        },
        {
          title: "Sound & Arrivals",
          description: [
            "New PRs appear in the queue with a visible notice; optional notification sounds can call them out.",
            "Background music is optional and increases its tempo as your weakest meter falls.",
          ],
          imageAlt: "Sound controls for music and pull request notifications",
        },
        {
          title: "Review the Day",
          description: [
            "The day summary records escaped bugs and unnecessary rejections with the relevant lines.",
            "Continue to the next shift, or restart when a meter reaches zero.",
          ],
          imageAlt: "End-of-day summary showing review outcomes",
        },
      ],
      tutorialNav: {
        prev: "← Prev",
        next: "Next →",
        slideOf: (current: number, total: number) =>
          `Slide ${current} of ${total}`,
      },
      startCta: "Start Your Day",
      comingSoon: "(soon)",
      languageOptions: languagePreferenceLabels.en,
      difficultyOptions: difficultyLabels.en,
    },
    shared: {
      operationsFallback: "Operations",
      dayHeading: (day: number, descriptor: string) =>
        `Day ${day} – ${descriptor}`,
      daySummary: (day: number) => `Day ${day} Summary`,
      counters: {
        prsApproved: "PRs Approved",
        prsRejected: "Changes Requested",
        bugsToProd: "Bugs to Prod",
        truePositives: "Bugs Blocked",
        falsePositives: "False Positives",
        cleanApprovals: "Clean Approvals",
      },
      meters: {
        stability: "Stability",
        velocity: "Velocity",
        satisfaction: "Team trust",
      },
      queueAwaiting: (count: number) => `${count} awaiting review`,
      bugKinds: bugKindLabels.en,
      severity: severityLabels.en,
      importance: importanceLabels.en,
      actualNone: "none",
    },
    briefing: {
      startButton: "START DAY",
      eyebrow: "AFTERHOURS · SHIFT BRIEFING",
      body: "The queue opens at 09:00. Keep stability, velocity and team trust above zero until 17:00.",
      savedHeading: "A saved shift is waiting",
      savedBody: "Resume exactly where you stopped. The game clock did not advance while you were away.",
      resumeButton: "RESUME SHIFT",
      newButton: "START A NEW RUN",
    },
    summary: {
      endOfDay: "End of Day",
      heading: (day: number) => `Day ${day} Summary`,
      continueButton: (nextDay: number) => `Continue to Day ${nextDay}`,
      restartButton: "Restart Game",
      deployedHeading: "Deployed Bugs",
      deployedBody:
        "These PRs shipped issues. Study the culprit lines before tomorrow.",
      falseHeading: "False Positives",
      falseBody:
        "Calls that slowed velocity. Compare your suspicion to what the PR actually contained.",
    },
    gameOver: {
      tag: "Game Over",
      heading: (day: number) => `Terminated on Day ${day}`,
      defaultReason: "Something terrible happened in prod.",
      restartButton: "Restart Campaign",
      homeButton: "Back to Title",
      deployedHeading: "Deployed Bugs",
      deployedBody: "Final day incidents that melted prod.",
      falseHeading: "False Positives",
      falseBody: "Where you slowed velocity on the final day.",
      leaderboard: {
        heading: "Save this run to the leaderboard",
        score: (score: number) => `Your score: ${score} (clean approvals + bugs blocked + days played × 5)`,
        namePlaceholder: "Your name (optional)",
        saving: "Saving…",
        saved: "Saved",
        submit: "Submit score",
        view: "View leaderboard",
        success: "Saved! Your run is on the leaderboard.",
        error: "Failed to submit score.",
        resumedRun: "Resumed runs stay in practice mode and are not submitted to the leaderboard.",
      },
    },
    incidents: {
      byline: (author: string, bugKindLabel: string) =>
        `by ${author} · ${bugKindLabel} bug`,
      authorOnly: (author: string) => `by ${author}`,
      falseBadge: (bugKindLabel: string) => `${bugKindLabel} suspicion`,
      falseNote: (bugKindLabel: string, actualList: string) =>
        `You flagged a ${bugKindLabel} issue. Actual bugs: ${actualList}.`,
      none: "none",
      reasonClean: "not a bug",
      reasonMixed: "mixed bugs",
      rejectedWithoutCause: "Rejected without cause.",
    },
    work: {
      clock: {
        label: "Current Time",
      },
      queue: {
        title: "PR Queue",
        hint: "Pick a PR to load it into the diff view. New submissions show up automatically.",
        empty: "No incoming PRs. Await the next wave.",
      },
      prViewer: {
        title: "PR Details",
        placeholder: "Load a PR from the queue to begin review.",
        hintSelect:
          "Select a PR from the queue to inspect its summary and diff here.",
        hintLines:
          "Click any line number to tag suspected bugs (optional, but earns bonus if correct).",
        authorLabel: "Author",
        diffTip: (requestLabel: string) =>
          `Tip: click a line number to highlight a suspicious row. Tagging the right line boosts team trust when you ${requestLabel}.`,
      },
      actions: {
        reviewLabel: "Review Actions",
        selectedLines: (count: number) => `Selected lines: ${count}`,
        tutorial:
          "Wrap up reviews here. Use keyboard shortcuts to move faster once you're confident.",
        approve: "Approve & Deploy",
        approveSubcopy: "Greenlight it when the diff feels rock solid.",
        request: "Request Changes",
        requestTitle:
          "Tag the line for a bonus, or just request changes directly.",
        requestLabel: "",
        requestHelper: "",
        requestHelperBonus:
          "Bonus: tag the exact offending line to boost team trust.",
        legendApprove: "Approve immediately when the diff looks clean.",
        legendRequest:
          "Request changes; tagging the right line grants a bonus.",
        hotkeyHint:
          "Tag a line for bonus team trust, then press R — or request changes directly.",
      },
      rulebook: {
        empty: "No directives today. Trust your instincts.",
      },
      stats: {
        title: "Metrics",
        labels: {
          approved: "Approved",
          rejected: "Changes Requested",
          bugsToProd: "Bugs to Prod",
          truePositives: "Bugs Blocked",
          falsePositives: "False Positives",
          cleanApprovals: "Clean Approvals",
        },
        tooltips: {
          approved:
            "PRs you merged today. These keep features flowing but risky ones can hurt stability.",
          rejected: "PRs you blocked by requesting changes.",
          bugsToProd:
            "Bugs that escaped to production from approved PRs. Too many will tank stability.",
          truePositives:
            "Requests where you tagged a real bug line and earned the bonus.",
          falsePositives:
            "False alarms where you flagged a bug that wasn’t there, costing time and goodwill.",
          cleanApprovals:
            "Bug-free approvals that kept features moving without hurting stability.",
        },
      },
      accessibility: {
        title: "Theme",
        hint: "Swap between GitHob Light and GitHob Dark palettes.",
        label: (isLight: boolean) => `GitHob ${isLight ? "Light" : "Dark"}`,
        copy: "Match the UI to the familiar GitHob aesthetic you prefer.",
        button: (isLight: boolean) =>
          `Switch to GitHob ${isLight ? "Dark" : "Light"}`,
        status: (isLight: boolean) => (isLight ? "Light" : "Dark"),
        footnote:
          "Colors and spacing track GitHob’s Primer tokens (canvas, borders, accent blues) for a native feel.",
      },
    },
    meterTrend: (label: string) => `${label} dropping`,
    hydration: {
      refreshing: "Refreshing your session…",
      crashed: "Something went wrong. Reload the page to continue.",
      reloadButton: "Reload page",
    },
    decisions: {
      noPR: "No PR loaded.",
      bugSlip: "Bug slipped to prod! Stability took a hit.",
      cleanMerge: "PR merged cleanly. Velocity is happy.",
      niceCatch: "Nice catch. You kept prod safe.",
      requestBonus:
        "Changes requested with bonus — great catch on the exact line.",
      requestNoBonus:
        "Changes requested. Tag the exact line next time for a bonus.",
      noMatching: "No matching bug found. Velocity groans.",
    },
    gameOverReasons: {
      stability: "Production melted down. The board needed a scapegoat.",
      satisfaction: "Management lost confidence in your judgment.",
      velocity: "Delivery ground to a halt. The team moved on without you.",
      generic: "Leadership pulled you aside.",
    },
  },
  es: {
    designStudy: designStudyCopy.es,
    audio: audioCopy.es,
    localeToggleLabel: "Seleccionar idioma",
    landing: {
      refresh: landingPageCopy.es,
      title: "Aprueba Por Favor",
      blurb:
        "Entra en Operaciones de Lanzamiento. Revisa PRs, protege la estabilidad y procura no ser despedido.",
      missionHeading: "Brief de Misión",
      missionTagline:
        "Lanza rápido, detén los bugs y no pierdas la confianza del liderazgo.",
      primer:
        "Cada día gestionas una cola de PRs de 9 a 17 h. Aprueba diffs limpios para mantener el avance de las funciones, pero detecta los arriesgados antes de que lleguen a producción. Mantén los tres medidores por encima de cero para sobrevivir la semana.",
      stats: {
        stability: {
          title: "Estabilidad",
          description:
            "Muestra la salud de prod. Baja cuando se cuelan PRs con bugs, sube cuando bloqueas problemas reales.",
        },
        velocity: {
          title: "Velocidad",
          description:
            "Mide el ritmo de entrega. Las aprobaciones y revisiones rápidas lo suben, pero las falsas alarmas lo frenan.",
        },
        satisfaction: {
          title: "Confianza del equipo",
          description:
            "Mide la confianza del equipo en tu criterio. Las decisiones acertadas la refuerzan; los retrasos o incidentes innecesarios la reducen.",
        },
      },
      languageHeader: "Lenguaje preferido",
      languageSubtitle:
        "Elige uno o más. Agrega Genérico para PRs de docs/config.",
      difficultyHeader: "Dificultad",
      difficultySubtitle:
        "El modo aprendizaje desactiva las penalizaciones por cola.",
      tutorialCta: "Cómo jugar",
      tutorialSlides: [
        {
          title: "Elige una PR",
          description: [
            "Elige una PR de la cola para cargarla en la mesa de revisión.",
            "La prioridad determina cuánto desgasta al equipo mientras espera; no revela si el código es seguro.",
          ],
          imageAlt: "Cola y selección de PR",
        },
        {
          title: "Inspecciona el diff",
          description: [
            "Lee la descripción, la rama, las etiquetas y el código modificado antes de decidir.",
            "Marca líneas sospechosas para obtener una bonificación de precisión. Las marcas son opcionales y no sustituyen tu decisión.",
          ],
          imageAlt: "Descripción de la PR y diff de código",
        },
        {
          title: "Aprobar o solicitar cambios",
          description: [
            "Aprueba los cambios seguros o solicita cambios cuando encuentres un error.",
            "La siguiente PR aparece automáticamente tras un deslizamiento breve. Usa Alt+A o Alt+R para avanzar más rápido.",
          ],
          imageAlt: "Botones de acción para aprobar y solicitar cambios",
        },
        {
          title: "Medidores y consecuencias",
          description: [
            "Los errores desplegados reducen la Estabilidad. Las PR en espera reducen la Velocidad y la Confianza al ritmo indicado por la presión de cola.",
            "Las PR de prioridad alta generan más presión. El modo aprendizaje mantiene el reloj, pero desactiva el desgaste de la cola.",
          ],
          imageAlt:
            "HUD con estabilidad, velocidad, confianza del equipo y presión de cola",
        },
        {
          title: "Sonido y nuevas PR",
          description: [
            "Las nuevas PR aparecen con un aviso visible; puedes activar sonidos opcionales para recibir la notificación.",
            "La música de fondo es opcional y acelera el ritmo cuando baja el medidor más débil.",
          ],
          imageAlt: "Controles de música y notificaciones de nuevas pull requests",
        },
        {
          title: "Revisa el día",
          description: [
            "El resumen registra los errores desplegados y los rechazos innecesarios junto a las líneas relevantes.",
            "Continúa con el siguiente turno o reinicia cuando un medidor llegue a cero.",
          ],
          imageAlt: "Resumen de fin de día con los resultados de las revisiones",
        },
      ],
      tutorialNav: {
        prev: "← Anterior",
        next: "Siguiente →",
        slideOf: (current: number, total: number) =>
          `Diapositiva ${current} de ${total}`,
      },
      startCta: "Comienza tu día",
      comingSoon: "(pronto)",
      languageOptions: languagePreferenceLabels.es,
      difficultyOptions: difficultyLabels.es,
    },
    shared: {
      operationsFallback: "Operaciones",
      dayHeading: (day: number, descriptor: string) =>
        `Día ${day} – ${descriptor}`,
      daySummary: (day: number) => `Resumen del Día ${day}`,
      counters: {
        prsApproved: "PRs aprobados",
        prsRejected: "Cambios solicitados",
        bugsToProd: "Bugs a prod",
        truePositives: "Bugs bloqueados",
        falsePositives: "Falsos positivos",
        cleanApprovals: "Aprobaciones limpias",
      },
      meters: {
        stability: "Estabilidad",
        velocity: "Velocidad",
        satisfaction: "Confianza del equipo",
      },
      queueAwaiting: (count: number) => `${count} en espera de revisión`,
      bugKinds: bugKindLabels.es,
      severity: severityLabels.es,
      importance: importanceLabels.es,
      actualNone: "ninguno",
    },
    briefing: {
      startButton: "Comenzar el día",
      eyebrow: "AFTERHOURS · INICIO DEL TURNO",
      body: "La cola abre a las 09:00. Mantén la estabilidad, la velocidad y la confianza por encima de cero hasta las 17:00.",
      savedHeading: "Hay un turno guardado",
      savedBody: "Continúa exactamente donde lo dejaste. El reloj no avanzó mientras estabas fuera.",
      resumeButton: "CONTINUAR TURNO",
      newButton: "EMPEZAR PARTIDA NUEVA",
    },
    summary: {
      endOfDay: "Fin del día",
      heading: (day: number) => `Resumen del Día ${day}`,
      continueButton: (nextDay: number) => `Continuar al día ${nextDay}`,
      restartButton: "Reiniciar partida",
      deployedHeading: "Bugs desplegados",
      deployedBody:
        "Estos PRs enviaron bugs. Estudia las líneas culpables antes de mañana.",
      falseHeading: "Falsos positivos",
      falseBody:
        "Decisiones que frenaron la velocidad. Compara tu sospecha con el contenido real del PR.",
    },
    gameOver: {
      tag: "Juego terminado",
      heading: (day: number) => `Despedido en el día ${day}`,
      defaultReason: "Algo terrible pasó en prod.",
      restartButton: "Reiniciar campaña",
      homeButton: "Volver al inicio",
      deployedHeading: "Bugs desplegados",
      deployedBody: "Incidentes del último día que derritieron prod.",
      falseHeading: "Falsos positivos",
      falseBody: "Dónde bajaste la velocidad en el último día.",
      leaderboard: {
        heading: "Guarda esta partida en la clasificación",
        score: (score: number) => `Tu puntuación: ${score} (aprobaciones limpias + errores bloqueados + días jugados × 5)`,
        namePlaceholder: "Tu nombre (opcional)",
        saving: "Guardando…",
        saved: "Guardada",
        submit: "Enviar puntuación",
        view: "Ver clasificación",
        success: "Guardada. Tu partida ya aparece en la clasificación.",
        error: "No se pudo enviar la puntuación.",
        resumedRun: "Las partidas reanudadas permanecen en modo práctica y no se envían a la clasificación.",
      },
    },
    incidents: {
      byline: (author: string, bugKindLabel: string) =>
        `por ${author} · bug de ${bugKindLabel}`,
      authorOnly: (author: string) => `por ${author}`,
      falseBadge: (bugKindLabel: string) => `Sospecha de ${bugKindLabel}`,
      falseNote: (bugKindLabel: string, actualList: string) =>
        `Marcaste un problema de ${bugKindLabel}. Bugs reales: ${actualList}.`,
      none: "ninguno",
      reasonClean: "sin bug real",
      reasonMixed: "bugs mixtos",
      rejectedWithoutCause: "Rechazado sin motivo.",
    },
    work: {
      clock: {
        label: "Hora actual",
      },
      queue: {
        title: "Cola de PRs",
        hint: "Elige un PR para cargarlo en la vista diff. Las nuevas entregas aparecen automáticamente.",
        empty: "No hay PRs nuevos. Espera la siguiente ola.",
      },
      prViewer: {
        title: "Detalles del PR",
        placeholder: "Carga un PR de la cola para empezar la revisión.",
        hintSelect:
          "Selecciona un PR de la cola para ver aquí su resumen y diff.",
        hintLines:
          "Haz clic en cualquier número de línea para marcar bugs sospechosos (opcional, pero da bonus si aciertas).",
        authorLabel: "Autor",
        diffTip: (requestLabel: string) =>
          `Consejo: haz clic en un número de línea para resaltar una fila sospechosa. Marcar la línea correcta aumenta la confianza del equipo cuando ${requestLabel}.`,
      },
      actions: {
        reviewLabel: "Acciones de revisión",
        selectedLines: (count: number) => `Líneas seleccionadas: ${count}`,
        tutorial:
          "Cierra revisiones aquí. Usa atajos cuando ya tengas confianza.",
        approve: "Aprobar y desplegar",
        approveSubcopy: "Dale luz verde cuando el diff se sienta sólido.",
        request: "Solicitar cambios",
        requestTitle:
          "Etiqueta la línea para un bonus, o solo solicita cambios.",
        requestLabel: "",
        requestHelper: "",
        requestHelperBonus:
          "Bonificación: marca la línea exacta para aumentar la confianza del equipo.",
        legendApprove: "Aprueba de inmediato cuando el diff se vea limpio.",
        legendRequest:
          "Solicita cambios; etiquetar la línea correcta da bonus.",
        hotkeyHint:
          "Marca una línea para obtener confianza adicional y pulsa R, o solicita cambios directamente.",
      },
      rulebook: {
        empty: "Sin directrices hoy. Confía en tu instinto.",
      },
      stats: {
        title: "Métricas",
        labels: {
          approved: "Aprobados",
          rejected: "Cambios solicitados",
          bugsToProd: "Bugs a prod",
          truePositives: "Bugs bloqueados",
          falsePositives: "Falsos positivos",
          cleanApprovals: "Aprobaciones limpias",
        },
        tooltips: {
          approved:
            "PRs que aprobaste hoy. Mantienen el flujo de features pero los arriesgados dañan la estabilidad.",
          rejected: "PRs que bloqueaste solicitando cambios.",
          bugsToProd:
            "Bugs que se escaparon a producción desde PRs aprobados. Demasiados hunden la estabilidad.",
          truePositives:
            "Solicitudes donde marcaste la línea correcta y obtuviste el bonus.",
          falsePositives:
            "Falsas alarmas donde marcaste un bug inexistente, perdiendo tiempo y confianza.",
          cleanApprovals:
            "Aprobaciones sin bugs que mantuvieron el flujo sin dañar la estabilidad.",
        },
      },
      accessibility: {
        title: "Tema",
        hint: "Alterna entre las paletas GitHob Light y Dark.",
        label: (isLight: boolean) => `GitHob ${isLight ? "Claro" : "Oscuro"}`,
        copy: "Haz que la UI coincida con la estética de GitHob que prefieres.",
        button: (isLight: boolean) =>
          `Cambiar a GitHob ${isLight ? "Oscuro" : "Claro"}`,
        status: (isLight: boolean) => (isLight ? "Claro" : "Oscuro"),
        footnote:
          "Los colores y espacios siguen los tokens Primer de GitHob (canvas, bordes, azules) para sentirse nativo.",
      },
    },
    meterTrend: (label: string) => `${label} en caída`,
    hydration: {
      refreshing: "Actualizando tu sesión…",
      crashed: "Algo salió mal. Recarga la página para continuar.",
      reloadButton: "Recargar página",
    },
    decisions: {
      noPR: "No hay PR cargado.",
      bugSlip: "¡Se coló un bug a prod! La estabilidad recibió un golpe.",
      cleanMerge: "PR fusionado sin problemas. La velocidad está feliz.",
      niceCatch: "Buen hallazgo. Mantuviste prod a salvo.",
      requestBonus: "Cambios solicitados con bonus: acertaste la línea exacta.",
      requestNoBonus:
        "Cambios solicitados. Etiqueta la línea exacta para obtener el bonus.",
      noMatching: "No se encontró un bug coincidente. La velocidad se queja.",
    },
    gameOverReasons: {
      stability: "La producción colapsó. El directorio necesitaba un culpable.",
      satisfaction: "La dirección perdió confianza en tu criterio.",
      velocity: "Las entregas se detuvieron. El equipo siguió sin ti.",
      generic: "La dirección te llamó aparte.",
    },
  },
} as const;

export const LANGUAGE_PREFERENCE_LABELS = languagePreferenceLabels;

export type Translation = (typeof TRANSLATIONS)[Locale];
export type { Locale };
