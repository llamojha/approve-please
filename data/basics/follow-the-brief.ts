import { copy as c, textFile as f, issue as at, type ExerciseDraft } from './types';
export const followTheBrief: ExerciseDraft[] = [
  {
    id: 'guest-entry',
    title: c('Update visitor instructions', 'Actualizar las instrucciones de visita'),
    brief: c('Visitors now enter through the east gate. They must still collect a badge at reception.', 'Las visitas entran ahora por la puerta este. Deben seguir recogiendo una acreditación en recepción.'),
    files: [f('visitors.txt', ['Use the west gate.', 'Collect a badge at reception.'], ['Use the east gate.', 'Collect a badge at reception.'], ['Usa la puerta oeste.', 'Recoge una acreditación en recepción.'], ['Usa la puerta este.', 'Recoge una acreditación en recepción.'])],
    issues: [],
    explanation: c('The entrance changes and the badge instruction is preserved. A narrowly scoped PR can be approved.', 'Cambia la entrada y se conserva la instrucción de acreditación. Una PR que cumple el alcance se puede aprobar.')
  },
  {
    id: 'lunch-budget',
    title: c('Adjust the lunch budget', 'Ajustar el presupuesto de comida'),
    brief: c('Set lunch to €8 per person. There are still 20 attendees.', 'Fija la comida en 8 € por persona. Siguen siendo 20 asistentes.'),
    files: [f('budget.txt', ['Lunch per person: €6', 'Attendees: 20'], ['Lunch per person: €8', 'Attendees: 25'], ['Comida por persona: 6 €', 'Asistentes: 20'], ['Comida por persona: 8 €', 'Asistentes: 25'])],
    issues: [at('budget.txt','after',2)],
    explanation: c('The price is right, but the attendee count changed without authorization. Ask for that edit to be removed.', 'El precio es correcto, pero se cambió el número de asistentes sin solicitarlo. Pide que se retire ese cambio.')
  },
  {
    id: 'checkout-deadline',
    title: c('Extend equipment checkout', 'Ampliar el préstamo de material'),
    brief: c('Extend the return deadline from Tuesday to Thursday. Keep the desk location.', 'Amplía la devolución del martes al jueves. Mantén el lugar de entrega.'),
    files: [f('checkout.txt', ['Return by Tuesday.', 'Desk: ground floor'], ['Return by Thursday.', 'Desk: ground floor'], ['Devuelve el martes como máximo.', 'Mostrador: planta baja'], ['Devuelve el jueves como máximo.', 'Mostrador: planta baja'])],
    issues: [],
    explanation: c('The deadline moves to Thursday and the location remains unchanged. A changed date is safe when it is explicitly requested.', 'El plazo pasa al jueves y la ubicación no cambia. Cambiar una fecha es correcto cuando se pide expresamente.')
  },
  {
    id: 'quiet-room',
    title: c('Update quiet-room guidance', 'Actualizar las normas de la sala tranquila'),
    brief: c('Allow silent laptops. Calls and group conversations must remain prohibited.', 'Permite portátiles en silencio. Las llamadas y conversaciones en grupo siguen prohibidas.'),
    files: [f('quiet-room.txt', ['No laptops.', 'No calls.', 'No group conversations.'], ['Silent laptops allowed.', 'Calls allowed.', 'No group conversations.'], ['No se permiten portátiles.', 'No se permiten llamadas.', 'No se permiten conversaciones en grupo.'], ['Se permiten portátiles en silencio.', 'Se permiten llamadas.', 'No se permiten conversaciones en grupo.'])],
    issues: [at('quiet-room.txt','after',2)],
    explanation: c('Allowing calls contradicts the brief. One correct change does not make every other change acceptable.', 'Permitir llamadas contradice el encargo. Un cambio correcto no hace aceptables todos los demás.')
  },
  {
    id: 'rename-folder-label',
    title: c('Clarify the hand-in instructions', 'Aclarar las instrucciones de entrega'),
    brief: c('Replace “Final stuff” with “Final submission”. Keep the deadline of 16:00.', 'Sustituye «Cosas finales» por «Entrega final». Mantén el plazo de las 16:00.'),
    files: [f('hand-in.txt', ['Label: Final stuff', 'Deadline: 16:00'], ['Label: Final submission', 'Deadline: 16:00'], ['Etiqueta: Cosas finales', 'Plazo: 16:00'], ['Etiqueta: Entrega final', 'Plazo: 16:00'])],
    issues: [],
    explanation: c('The wording is clearer and the deadline is intact. Review what the brief asks for, not your personal naming preference.', 'El texto es más claro y el plazo se conserva. Revisa lo que pide el encargo, no tus preferencias personales de nombres.')
  },
  {
    id: 'workshop-capacity',
    title: c('Publish the workshop capacity', 'Publicar el aforo del taller'),
    brief: c('The room has 24 seats, including the 2 reserved for tutors. State a total capacity of 24.', 'El aula tiene 24 plazas, incluidas las 2 reservadas para tutores. Indica un aforo total de 24.'),
    files: [f('capacity.txt', ['Total capacity: 20'], ['Total capacity: 26'], ['Aforo total: 20'], ['Aforo total: 26'])],
    issues: [at('capacity.txt','after',1)],
    explanation: c('The two tutor seats are already included in 24. Adding them again produces an incorrect capacity of 26.', 'Las dos plazas de tutores ya están incluidas en las 24. Sumarlas otra vez produce un aforo incorrecto de 26.')
  },
  {
    id: 'weekend-contact',
    title: c('Add a weekend contact', 'Añadir un contacto de fin de semana'),
    brief: c('Add Marta as the weekend contact. Keep Diego for weekdays.', 'Añade a Marta como contacto de fin de semana. Mantén a Diego entre semana.'),
    files: [f('support.txt', ['Weekdays: Diego'], ['Weekdays: Diego', 'Weekend: Marta'], ['Entre semana: Diego'], ['Entre semana: Diego', 'Fin de semana: Marta'])],
    issues: [],
    explanation: c('Both responsibilities are present and correct. Adding information should not erase information still needed.', 'Ambas responsabilidades están presentes y son correctas. Añadir información no debe borrar la que sigue siendo necesaria.')
  },
  {
    id: 'booking-date',
    title: c('Move the room booking', 'Cambiar la reserva del aula'),
    brief: c('Move the booking from 12 May to 14 May. Keep room 3 and the 90-minute duration.', 'Mueve la reserva del 12 al 14 de mayo. Mantén el aula 3 y la duración de 90 minutos.'),
    files: [f('booking.txt', ['Date: 12 May', 'Room: 3', 'Duration: 90 minutes'], ['Date: 14 June', 'Room: 3', 'Duration: 90 minutes'], ['Fecha: 12 de mayo', 'Aula: 3', 'Duración: 90 minutos'], ['Fecha: 14 de junio', 'Aula: 3', 'Duración: 90 minutos'])],
    issues: [at('booking.txt','after',1)],
    explanation: c('The day number is right but the month is wrong. Compare the complete value, not only the part that catches your eye.', 'El número del día es correcto, pero el mes no. Compara el valor completo, no solo la parte que llama la atención.')
  },
  {
    id: 'poster-language',
    title: c('Make the welcome text bilingual', 'Hacer bilingüe la bienvenida'),
    brief: c('Keep “Welcome” and add “Bienvenidos” below it.', 'Conserva «Welcome» y añade «Bienvenidos» debajo.'),
    files: [f('welcome.txt', ['Welcome'], ['Welcome', 'Bienvenidos'], ['Welcome'], ['Welcome', 'Bienvenidos'])],
    issues: [],
    explanation: c('Both greetings are present in the requested order. Bilingual content requires adding the translation, not replacing the original.', 'Están los dos saludos en el orden solicitado. El contenido bilingüe requiere añadir la traducción, no sustituir el original.')
  },
  {
    id: 'attendance-rule',
    title: c('Clarify attendance', 'Aclarar la asistencia'),
    brief: c('Attendance is optional. Add that a recording will be available; do not change attendance policy.', 'La asistencia es opcional. Añade que habrá una grabación; no cambies la política de asistencia.'),
    files: [f('session.txt', ['Attendance is optional.'], ['Attendance is mandatory.', 'A recording will be available.'], ['La asistencia es opcional.'], ['La asistencia es obligatoria.', 'Habrá una grabación.'])],
    issues: [at('session.txt','after',1)],
    explanation: c('The recording note is useful, but mandatory attendance changes the policy. Descriptions do not excuse unrelated edits.', 'La nota sobre la grabación es útil, pero la asistencia obligatoria cambia la política. La descripción no justifica cambios ajenos al encargo.')
  }
];
