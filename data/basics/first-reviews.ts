import { copy as c, textFile as f, issue as at, type ExerciseDraft } from './types';

export const firstReviews: ExerciseDraft[] = [
  {
    id: 'add-member',
    title: c('Add Lucía to the team', 'Añadir a Lucía al equipo'),
    brief: c('Add Lucía. Keep everyone already on the team.', 'Añade a Lucía. Conserva a todas las personas del equipo.'),
    files: [f('team.txt', ['Diego', 'Inés'], ['Diego', 'Inés', 'Lucía'], ['Diego', 'Inés'], ['Diego', 'Inés', 'Lucía'])],
    issues: [],
    explanation: c('Lucía was added and both existing members remain. A green + line adds content; unchanged lines provide context.', 'Se añadió a Lucía y siguen los dos miembros anteriores. Una línea verde con + añade contenido; las líneas sin cambios dan contexto.')
  },
  {
    id: 'workshop-room',
    title: c('Move the workshop', 'Cambiar el aula del taller'),
    brief: c('Move the workshop to room 204. Keep the 10:00 start.', 'Traslada el taller al aula 204. Mantén el inicio a las 10:00.'),
    files: [f('workshop.txt', ['Room: 102', 'Starts: 10:00'], ['Room: 204', 'Starts: 11:00'], ['Aula: 102', 'Inicio: 10:00'], ['Aula: 204', 'Inicio: 11:00'])],
    issues: [at('workshop.txt', 'after', 2)],
    explanation: c('The room is correct, but 11:00 changes a time that must stay at 10:00. Read every changed line, not just the requested one.', 'El aula es correcta, pero las 11:00 cambian una hora que debía seguir a las 10:00. Revisa todas las líneas modificadas, no solo la solicitada.')
  },
  {
    id: 'remove-duplicate',
    title: c('Tidy the equipment list', 'Ordenar la lista de material'),
    brief: c('Remove the duplicate projector entry. Keep one projector and the speakers.', 'Elimina el proyector duplicado. Conserva un proyector y los altavoces.'),
    files: [f('equipment.txt', ['Projector', 'Projector', 'Speakers'], ['Projector', 'Speakers'], ['Proyector', 'Proyector', 'Altavoces'], ['Proyector', 'Altavoces'])],
    issues: [],
    explanation: c('One duplicate is removed and the required equipment remains. A red − line is a removal, which can be an intentional, correct change.', 'Se elimina un duplicado y se conserva el material requerido. Una línea roja con − es una eliminación, que puede ser intencionada y correcta.')
  },
  {
    id: 'contact-update',
    title: c('Update the study-group contact', 'Actualizar el contacto del grupo'),
    brief: c('Replace the old contact with study@campus.example. Leave the group name alone.', 'Sustituye el contacto antiguo por study@campus.example. No cambies el nombre del grupo.'),
    files: [f('contact.txt', ['Group: Study Circle', 'Email: old@campus.example'], ['Group: Study Circle', 'Email: stduy@campus.example'], ['Grupo: Círculo de estudio', 'Correo: old@campus.example'], ['Grupo: Círculo de estudio', 'Correo: stduy@campus.example'])],
    issues: [at('contact.txt', 'after', 2)],
    explanation: c('The new address says “stduy”, not “study”. The intended value is in the brief; no technical knowledge is needed to catch the mismatch.', 'La dirección nueva dice «stduy», no «study». El valor correcto está en el encargo; no hace falta conocimiento técnico para detectar la diferencia.')
  },
  {
    id: 'add-break',
    title: c('Add the afternoon break', 'Añadir el descanso de la tarde'),
    brief: c('Add a break at 15:00 between the two sessions. Keep both sessions.', 'Añade un descanso a las 15:00 entre las dos sesiones. Conserva ambas sesiones.'),
    files: [f('agenda.txt', ['14:00 Discussion', '15:15 Practice'], ['14:00 Discussion', '15:00 Break', '15:15 Practice'], ['14:00 Debate', '15:15 Práctica'], ['14:00 Debate', '15:00 Descanso', '15:15 Práctica'])],
    issues: [],
    explanation: c('The break is in the requested place and neither session was removed. This PR satisfies the whole brief.', 'El descanso está en el lugar indicado y no se eliminó ninguna sesión. Esta PR cumple todo el encargo.')
  },
  {
    id: 'replace-roster',
    title: c('Welcome Marta', 'Dar la bienvenida a Marta'),
    brief: c('Add Marta to the roster without removing Inés or Ben.', 'Añade a Marta a la lista sin eliminar a Inés ni a Ben.'),
    files: [f('roster.txt', ['Inés', 'Ben'], ['Marta', 'Ben'], ['Inés', 'Ben'], ['Marta', 'Ben'])],
    issues: [at('roster.txt', 'before', 1)],
    explanation: c('Inés was removed. Adding a member is different from replacing one; the removed line is the evidence to flag.', 'Se eliminó a Inés. Añadir a una persona no es sustituir a otra; la línea eliminada es la prueba que debes marcar.')
  },
  {
    id: 'opening-hours',
    title: c('Extend library hours', 'Ampliar el horario de biblioteca'),
    brief: c('Change closing time to 19:00. Opening time stays 08:00.', 'Cambia el cierre a las 19:00. La apertura sigue a las 08:00.'),
    files: [f('library.txt', ['Opens: 08:00', 'Closes: 18:00'], ['Opens: 08:00', 'Closes: 19:00'], ['Apertura: 08:00', 'Cierre: 18:00'], ['Apertura: 08:00', 'Cierre: 19:00'])],
    issues: [],
    explanation: c('Only closing time changes. The red old value and green new value together show a replacement.', 'Solo cambia el cierre. El valor antiguo en rojo y el nuevo en verde muestran una sustitución.')
  },
  {
    id: 'returned-camera',
    title: c('Record the returned camera', 'Registrar la cámara devuelta'),
    brief: c('Mark the camera as available. Its storage location remains shelf B.', 'Marca la cámara como disponible. Su ubicación sigue siendo la estantería B.'),
    files: [f('camera.txt', ['Status: borrowed', 'Location: shelf B'], ['Status: available', 'Location: shelf D'], ['Estado: prestada', 'Ubicación: estantería B'], ['Estado: disponible', 'Ubicación: estantería D'])],
    issues: [at('camera.txt', 'after', 2)],
    explanation: c('Availability is correct, but shelf D is an unintended edit. Check unchanged requirements as well as the requested update.', 'La disponibilidad es correcta, pero la estantería D es un cambio no solicitado. Comprueba también lo que debía mantenerse.')
  },
  {
    id: 'meeting-title',
    title: c('Rename the weekly meeting', 'Renombrar la reunión semanal'),
    brief: c('Rename “Weekly meeting” to “Student check-in”. Keep Monday.', 'Cambia «Reunión semanal» por «Encuentro del alumnado». Mantén el lunes.'),
    files: [f('meeting.txt', ['Weekly meeting', 'Monday'], ['Student check-in', 'Monday'], ['Reunión semanal', 'Lunes'], ['Encuentro del alumnado', 'Lunes'])],
    issues: [],
    explanation: c('The title matches the brief and Monday is unchanged. Approving is the right choice when all requirements are met.', 'El título coincide con el encargo y el lunes no cambia. Aprobar es lo correcto cuando se cumplen todos los requisitos.')
  },
  {
    id: 'delivery-count',
    title: c('Log the new keyboards', 'Registrar los teclados nuevos'),
    brief: c('The delivery note lists 12 keyboards. Replace the previous quantity of 8 with 12.', 'El albarán indica 12 teclados. Sustituye la cantidad anterior de 8 por 12.'),
    files: [f('delivery.txt', ['Keyboards: 8'], ['Keyboards: 21'], ['Teclados: 8'], ['Teclados: 21'])],
    issues: [at('delivery.txt', 'after', 1)],
    explanation: c('21 does not match the delivery note’s 12. Use the requirement as the source of truth, not the PR author’s confidence.', '21 no coincide con los 12 del albarán. La referencia es el requisito, no la seguridad con la que se presenta la PR.')
  }
];
