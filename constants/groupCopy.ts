export const groupCopy = {
  en: {
    title:'One queue. Your whole team.', eyebrow:'GROUP REVIEW SHIFT', intro:'Review the same pull requests, make your own calls, then compare what everyone caught.',
    nav:'Play as a group', home:'Back to the desk', create:'Host a session', join:'Join a session', code:'Room code', name:'Your nickname', enter:'Take a seat',
    track:'What will you review?', basics:'PR basics · text changes', codeTrack:'Code review · TypeScript & docs', day:'Beginner shift', duration:'Time to review', minutes:'minutes', contentLanguage:'PR language: English. Use the language button above to change it before creating the room.',
    mode:'Practice rules: waiting PRs do not drain your bars. Decisions still have consequences. Everyone gets the same ten PRs; results stay hidden until the session ends.',
    room:'ROOM', lobby:'The review team is gathering.', lobbyBody:'Share this code or the room link. Players can join until you start.', copy:'Copy invite link', copied:'Invite link copied',
    players:'Reviewers', ready:'Ready', start:'Start the shared shift', waiting:'Waiting for the host to start.', host:'Host view', empty:'No reviewers yet. Invite your first teammate.',
    progress:'Room progress', reviewed:'reviewed', completed:'Finished', playing:'Reviewing', finish:'End shift & reveal results', confirmFinish:'End the shift now? Remaining PRs will count as unreviewed.',
    done:'Your queue is clear.', doneBody:'Your decisions are saved. Results will appear when everyone finishes or the shared clock runs out.',
    results:'The shift, together.', resultsBody:'Ranked by correct decisions, then precise issue tags. Equal results share a rank. Unreviewed PRs earn no credit.',
    leaderboard:'Room leaderboard', rank:'Rank', correct:'Correct', approvals:'Safe approvals', rejections:'Bugs caught', missed:'Bugs shipped', safeRejected:'Safe PRs rejected', unreviewed:'Unreviewed',
    recap:'What did the room catch?', recapBody:'Compare the group’s decisions and discuss the changes that split the room.', expectedApprove:'Approve', expectedReject:'Reject',
    personal:'Your review notes', good:'Good call', revisit:'To revisit', youApproved:'You approved', youRejected:'You rejected', description:'PR description', explanation:'Why it matters',
    loading:'Connecting to the room…', reconnect:'Connection interrupted. Retrying…', retry:'Try again', submitting:'Saving your decision…', saved:'Decision saved',
    sound:'Sound', close:'Close', guide:'How group reviews work', guideBody:'Read the PR description and check every file. Approve safe changes; reject changes with an issue. Tagging the exact issue is optional and breaks leaderboard ties. Alt+A approves; Alt+R rejects. Each decision swipes to the next PR. The shared clock keeps running while this guide is open.',
    countdown:'Time remaining', accuracy:'correct decisions', share:'Same PRs. Independent decisions.', joined:'You have a seat. Stay here for the start.',
    errors: {
      sessions_unavailable:'Group sessions are not configured yet. The host needs the Supabase migration and server connection before rooms can be created.',
      room_not_found:'That room does not exist. Check the code with your host.', room_expired:'This room has expired. Ask the host to create another session.',
      invalid_code:'Enter the six-character room code.', invalid_name:'Choose a nickname of 1–32 characters.', name_taken:'That nickname is already in use. Try another.',
      already_started:'This shift has already started. New reviewers cannot join.', room_full:'This room has reached its 40-reviewer limit.',
      join_required:'This room is already playing or finished. Reopen it in the browser where you joined.', host_only:'Only the host can do that.',
      empty_room:'At least one reviewer needs to join before you start.', shift_finished:'The shared shift has ended. Your results are ready.',
      already_reviewed:'Your first decision for this PR is already saved.', room_busy:'The room is busy. Please retry.',
      invalid_settings:'Choose a content track, shift and duration.', invalid_review:'That review could not be saved. Refresh the room and try again.',
      session_error:'The room could not be reached. Please try again.', invalid_origin:'The request could not be verified. Reopen the room on this site.'
    }
  },
  es: {
    title:'Una cola. Todo tu equipo.', eyebrow:'TURNO DE REVISIÓN EN GRUPO', intro:'Revisad las mismas pull requests, tomad vuestras propias decisiones y comparad lo que detectasteis.',
    nav:'Jugar en grupo', home:'Volver al escritorio', create:'Crear una sesión', join:'Unirse a una sesión', code:'Código de sala', name:'Tu apodo', enter:'Tomar asiento',
    track:'¿Qué vais a revisar?', basics:'Fundamentos de PR · cambios de texto', codeTrack:'Revisión de código · TypeScript y docs', day:'Turno inicial', duration:'Tiempo para revisar', minutes:'minutos', contentLanguage:'Idioma de las PR: español. Usa el botón de idioma de arriba para cambiarlo antes de crear la sala.',
    mode:'Reglas de práctica: las PR en espera no desgastan las barras. Las decisiones sí tienen consecuencias. Todos reciben las mismas diez PR; los resultados se ocultan hasta el final.',
    room:'SALA', lobby:'El equipo se está reuniendo.', lobbyBody:'Comparte el código o el enlace. Se puede entrar hasta que empieces.', copy:'Copiar enlace de invitación', copied:'Enlace de invitación copiado',
    players:'Revisores', ready:'Listo', start:'Empezar el turno compartido', waiting:'Esperando a que empiece el anfitrión.', host:'Vista del anfitrión', empty:'Aún no hay revisores. Invita al primer compañero.',
    progress:'Progreso de la sala', reviewed:'revisadas', completed:'Terminado', playing:'Revisando', finish:'Terminar y mostrar resultados', confirmFinish:'¿Terminar el turno ahora? Las PR pendientes quedarán sin revisar.',
    done:'Tu bandeja está vacía.', doneBody:'Tus decisiones están guardadas. Los resultados aparecerán cuando todos terminen o se agote el reloj compartido.',
    results:'El turno, juntos.', resultsBody:'Ordenado por decisiones correctas y después por líneas precisas. Los empates comparten puesto. Las PR sin revisar no dan puntos.',
    leaderboard:'Clasificación de la sala', rank:'Puesto', correct:'Correctas', approvals:'Aprobaciones seguras', rejections:'Errores detectados', missed:'Errores integrados', safeRejected:'PR seguras rechazadas', unreviewed:'Sin revisar',
    recap:'¿Qué detectó el grupo?', recapBody:'Comparad las decisiones y comentad los cambios que dividieron a la sala.', expectedApprove:'Aprobar', expectedReject:'Rechazar',
    personal:'Tus notas de revisión', good:'Buena decisión', revisit:'Para repasar', youApproved:'Aprobaste', youRejected:'Rechazaste', description:'Descripción de la PR', explanation:'Por qué importa',
    loading:'Conectando con la sala…', reconnect:'Se interrumpió la conexión. Reintentando…', retry:'Reintentar', submitting:'Guardando tu decisión…', saved:'Decisión guardada',
    sound:'Sonido', close:'Cerrar', guide:'Cómo revisar en grupo', guideBody:'Lee la descripción de la PR y revisa todos los archivos. Aprueba los cambios seguros y rechaza los que tengan problemas. Marcar la línea exacta es opcional y desempata en la clasificación. Alt+A aprueba; Alt+R rechaza. Cada decisión pasa a la siguiente PR. El reloj compartido sigue avanzando mientras esta guía está abierta.',
    countdown:'Tiempo restante', accuracy:'decisiones correctas', share:'Las mismas PR. Decisiones independientes.', joined:'Ya tienes asiento. Espera aquí al comienzo.',
    errors: {
      sessions_unavailable:'Las sesiones de grupo aún no están configuradas. Hace falta aplicar la migración de Supabase y conectar el servidor antes de crear salas.',
      room_not_found:'Esa sala no existe. Confirma el código con el anfitrión.', room_expired:'Esta sala ha caducado. Pide al anfitrión que cree otra sesión.',
      invalid_code:'Introduce el código de sala de seis caracteres.', invalid_name:'Elige un apodo de entre 1 y 32 caracteres.', name_taken:'Ese apodo ya está en uso. Prueba otro.',
      already_started:'El turno ya empezó. No se admiten nuevos revisores.', room_full:'La sala ha alcanzado el límite de 40 revisores.',
      join_required:'La sala ya está jugando o ha terminado. Ábrela en el navegador con el que te uniste.', host_only:'Solo el anfitrión puede hacerlo.',
      empty_room:'Debe unirse al menos un revisor antes de empezar.', shift_finished:'El turno compartido ha terminado. Tus resultados están listos.',
      already_reviewed:'Tu primera decisión para esta PR ya está guardada.', room_busy:'La sala está ocupada. Reinténtalo.',
      invalid_settings:'Elige el contenido, el turno y la duración.', invalid_review:'No se pudo guardar la revisión. Recarga la sala e inténtalo de nuevo.',
      session_error:'No se pudo conectar con la sala. Inténtalo de nuevo.', invalid_origin:'No se pudo verificar la petición. Vuelve a abrir la sala en este sitio.'
    }
  }
};
export const groupErrorMessage = (locale:'en'|'es',code:string) => {
  const errors=groupCopy[locale].errors;
  return errors[code as keyof typeof errors] ?? errors.session_error;
};
