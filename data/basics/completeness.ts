import { copy as c, textFile as f, issue as at, type ExerciseDraft } from './types';
export const completeness: ExerciseDraft[] = [
  {
    id: 'arrival-checklist',
    title: c('Add the arrival checklist', 'Añadir la lista de llegada'),
    brief: c('Add these steps in order: collect badge, find room, sign attendance.', 'Añade estos pasos en orden: recoger acreditación, encontrar el aula, firmar asistencia.'),
    files: [f('arrival.txt', ['Arrival checklist'], ['Arrival checklist', '1. Collect badge', '2. Find room', '3. Sign attendance'], ['Lista de llegada'], ['Lista de llegada', '1. Recoger acreditación', '2. Encontrar el aula', '3. Firmar asistencia'])],
    issues: [],
    explanation: c('All three steps are present in the required order. Review completeness as well as individual wording.', 'Los tres pasos están presentes y en el orden requerido. Revisa que esté todo, además de cada frase.')
  },
  {
    id: 'upload-order',
    title: c('Write the hand-in checklist', 'Escribir los pasos de entrega'),
    brief: c('The order must be: save the document, upload it, then check the confirmation.', 'El orden debe ser: guardar el documento, subirlo y comprobar la confirmación.'),
    files: [f('submission.txt', ['Hand-in steps'], ['Hand-in steps', '1. Upload the document', '2. Save the document', '3. Check the confirmation'], ['Pasos de entrega'], ['Pasos de entrega', '1. Subir el documento', '2. Guardar el documento', '3. Comprobar la confirmación'])],
    issues: [at('submission.txt','after',2),at('submission.txt','after',3)],
    explanation: c('Save must come before upload. All steps exist, but their order would make someone upload an older version.', 'Guardar debe ir antes de subir. Están todos los pasos, pero ese orden podría hacer que se entregue una versión antigua.')
  },
  {
    id: 'packing-list',
    title: c('Complete the trip packing list', 'Completar el material de la excursión'),
    brief: c('Keep the notebook and add a water bottle and student ID.', 'Conserva el cuaderno y añade una botella de agua y el carné de estudiante.'),
    files: [f('packing.txt', ['Notebook'], ['Notebook', 'Water bottle', 'Student ID'], ['Cuaderno'], ['Cuaderno', 'Botella de agua', 'Carné de estudiante'])],
    issues: [],
    explanation: c('Both additions are present and the notebook remains. There is no missing requirement.', 'Están las dos incorporaciones y se conserva el cuaderno. No falta ningún requisito.')
  },
  {
    id: 'emergency-card',
    title: c('Simplify the emergency card', 'Simplificar la tarjeta de emergencia'),
    brief: c('Remove the decorative heading. Keep both the assembly point and the emergency contact.', 'Elimina el título decorativo. Conserva el punto de encuentro y el contacto de emergencia.'),
    files: [f('emergency.txt', ['*** Important ***', 'Assembly point: courtyard', 'Emergency contact: reception'], ['Assembly point: courtyard'], ['*** Importante ***', 'Punto de encuentro: patio', 'Contacto de emergencia: recepción'], ['Punto de encuentro: patio'])],
    issues: [at('emergency.txt','before',3)],
    explanation: c('The contact was removed along with the heading. A shorter document is not complete if it drops required information.', 'Se eliminó el contacto junto con el título. Un documento más corto no está completo si pierde información necesaria.')
  },
  {
    id: 'loan-checklist',
    title: c('Add the equipment return steps', 'Añadir los pasos de devolución'),
    brief: c('Add: return the charger, return the laptop, and ask for a receipt. Keep that order.', 'Añade: devolver el cargador, devolver el portátil y pedir un recibo. Mantén ese orden.'),
    files: [f('returns.txt', ['Return checklist'], ['Return checklist', '1. Return charger', '2. Return laptop', '3. Ask for receipt'], ['Lista de devolución'], ['Lista de devolución', '1. Devolver cargador', '2. Devolver portátil', '3. Pedir recibo'])],
    issues: [],
    explanation: c('The list includes every requested item and the final confirmation step. This is ready to merge.', 'La lista incluye todo lo solicitado y el paso final de confirmación. Está lista para integrar.')
  },
  {
    id: 'signup-fields',
    title: c('Shorten the signup instructions', 'Acortar las instrucciones de inscripción'),
    brief: c('Remove the nickname field. Keep name, contact email and accessibility needs.', 'Elimina el apodo. Conserva nombre, correo de contacto y necesidades de accesibilidad.'),
    files: [f('signup.txt', ['Name', 'Nickname', 'Contact email', 'Accessibility needs'], ['Name', 'Contact email'], ['Nombre', 'Apodo', 'Correo de contacto', 'Necesidades de accesibilidad'], ['Nombre', 'Correo de contacto'])],
    issues: [at('signup.txt','before',4)],
    explanation: c('Accessibility needs were also removed. The request to simplify one field does not permit deleting another required field.', 'También se eliminaron las necesidades de accesibilidad. Simplificar un campo no permite borrar otro campo requerido.')
  },
  {
    id: 'meeting-agenda',
    title: c('Add time for questions', 'Añadir tiempo para preguntas'),
    brief: c('Add a ten-minute Q&A after the demonstration. The existing welcome and demo stay.', 'Añade diez minutos de preguntas después de la demostración. Conserva la bienvenida y la demostración.'),
    files: [f('agenda.txt', ['09:00 Welcome', '09:10 Demonstration'], ['09:00 Welcome', '09:10 Demonstration', '09:40 Q&A (10 minutes)'], ['09:00 Bienvenida', '09:10 Demostración'], ['09:00 Bienvenida', '09:10 Demostración', '09:40 Preguntas (10 minutos)'])],
    issues: [],
    explanation: c('The Q&A has the requested duration and follows the demo. Existing activities remain present.', 'Las preguntas duran lo solicitado y van después de la demostración. Se conservan las actividades anteriores.')
  },
  {
    id: 'lunch-options',
    title: c('Publish the lunch choices', 'Publicar las opciones de comida'),
    brief: c('Add vegetarian and nut-free options. The standard option must remain.', 'Añade opciones vegetariana y sin frutos secos. Debe mantenerse la opción estándar.'),
    files: [f('menu.txt', ['Standard lunch'], ['Standard lunch', 'Vegetarian lunch', 'Lunch with nuts'], ['Comida estándar'], ['Comida estándar', 'Comida vegetariana', 'Comida con frutos secos'])],
    issues: [at('menu.txt','after',3)],
    explanation: c('“With nuts” is the opposite of “nut-free”. Counting three options is not enough; each must meet the requirement.', '«Con frutos secos» es lo contrario de «sin frutos secos». No basta con contar tres opciones; cada una debe cumplir el requisito.')
  },
  {
    id: 'closing-checklist',
    title: c('Add the closing routine', 'Añadir la rutina de cierre'),
    brief: c('Add a reminder to switch off lights and return the room key. Keep the window check.', 'Añade un recordatorio para apagar las luces y devolver la llave. Conserva la revisión de ventanas.'),
    files: [f('closing.txt', ['Check windows.'], ['Check windows.', 'Switch off lights.', 'Return room key.'], ['Revisar ventanas.'], ['Revisar ventanas.', 'Apagar luces.', 'Devolver llave.'])],
    issues: [],
    explanation: c('The existing check and both new steps are present. Additions can complete a workflow without replacing it.', 'Se conserva la revisión anterior y se añaden los dos pasos nuevos. Es posible completar un proceso sin sustituirlo.')
  },
  {
    id: 'feedback-anonymity',
    title: c('Update the feedback instructions', 'Actualizar las instrucciones de opinión'),
    brief: c('Make the comment optional. Keep the rating required and responses anonymous.', 'Haz opcional el comentario. La valoración sigue siendo obligatoria y las respuestas anónimas.'),
    files: [f('feedback.txt', ['Rating: required', 'Comment: required', 'Responses: anonymous'], ['Rating: required', 'Comment: optional'], ['Valoración: obligatoria', 'Comentario: obligatorio', 'Respuestas: anónimas'], ['Valoración: obligatoria', 'Comentario: opcional'])],
    issues: [at('feedback.txt','before',3)],
    explanation: c('The anonymity statement is missing. A correct field change does not compensate for removing a required guarantee.', 'Falta la indicación de anonimato. Cambiar un campo correctamente no compensa eliminar una garantía requerida.')
  }
];
