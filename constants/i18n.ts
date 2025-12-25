import { BugKind, Locale } from "../types";
export type GameOverReasonKey = "stability" | "satisfaction" | "generic";

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
  },
  es: {
    logic: "lógica",
    security: "seguridad",
    performance: "rendimiento",
    style: "estilo",
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
    normal: "Normal",
    high: "High",
  },
  es: {
    low: "Baja",
    normal: "Normal",
    high: "Alta",
  },
};

const languagePreferenceLabels: Record<Locale, Record<string, string>> = {
  en: {
    generic: "Generic",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    rust: "Rust",
    css: "CSS",
  },
  es: {
    generic: "Genérico",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    rust: "Rust",
    css: "CSS",
  },
};

export const TRANSLATIONS = {
  en: {
    localeToggleLabel: "Select language",
    landing: {
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
          title: "Satisfaction",
          description:
            "Tracks leadership patience. Smart calls earn grace; needless delays or outages tank morale.",
        },
      },
      languageHeader: "Preferred Language",
      languageSubtitle: "Pick one or more. Add Generic for docs/config PRs.",
      tutorialCta: "HOW TO PLAY",
      startCta: "Start Your Day",
      comingSoon: "(soon)",
      languageOptions: languagePreferenceLabels.en,
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
        satisfaction: "Satisfaction",
      },
      queueAwaiting: (count: number) => `${count} awaiting review`,
      bugKinds: bugKindLabels.en,
      severity: severityLabels.en,
      importance: importanceLabels.en,
      actualNone: "none",
    },
    briefing: {
      startButton: "START DAY",
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
          `Tip: click a line number to highlight a suspicious row. Tagging the right line boosts satisfaction when you ${requestLabel}.`,
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
          "Bonus: tag the exact offending line to boost satisfaction.",
        legendApprove: "Approve immediately when the diff looks clean.",
        legendRequest:
          "Request changes; tagging the right line grants a bonus.",
        hotkeyHint:
          "Tag a line for bonus satisfaction, then press R — or request changes directly.",
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
      generic: "Leadership pulled you aside.",
    },
  },
  es: {
    localeToggleLabel: "Seleccionar idioma",
    landing: {
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
          title: "Satisfacción",
          description:
            "Mide la paciencia del liderazgo. Las decisiones acertadas dan margen; los retrasos u outages innecesarios hunden la moral.",
        },
      },
      languageHeader: "Lenguaje preferido",
      languageSubtitle: "Elige uno o más. Agrega Genérico para PRs de docs/config.",
      tutorialCta: "Cómo jugar",
      startCta: "Comienza tu día",
      comingSoon: "(pronto)",
      languageOptions: languagePreferenceLabels.es,
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
        satisfaction: "Satisfacción",
      },
      queueAwaiting: (count: number) => `${count} en espera de revisión`,
      bugKinds: bugKindLabels.es,
      severity: severityLabels.es,
      importance: importanceLabels.es,
      actualNone: "ninguno",
    },
    briefing: {
      startButton: "Comenzar el día",
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
          `Tip: haz clic en un número de línea para resaltar una fila sospechosa. Etiquetar la línea correcta sube satisfacción cuando ${requestLabel}.`,
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
          "Bonus: etiqueta la línea exacta para subir satisfacción.",
        legendApprove: "Aprueba de inmediato cuando el diff se vea limpio.",
        legendRequest:
          "Solicita cambios; etiquetar la línea correcta da bonus.",
        hotkeyHint:
          "Etiqueta una línea para el bonus de satisfacción y presiona R — o pide cambios directo.",
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
      generic: "La dirección te llamó aparte.",
    },
  },
} as const;

export const LANGUAGE_PREFERENCE_LABELS = languagePreferenceLabels;

export type Translation = (typeof TRANSLATIONS)[Locale];
export type { Locale };
