import { copy as c, textFile as f, issue as at, type ExerciseDraft } from './types';
export const accidentalEdits: ExerciseDraft[] = [
  {
    id: 'bus-stop',
    title: c('Change the bus pickup point', 'Cambiar la parada del autobús'),
    brief: c('Change pickup to the north entrance. Keep departure at 08:30 and return at 17:00.', 'Cambia la recogida a la entrada norte. Mantén la salida a las 08:30 y el regreso a las 17:00.'),
    files: [f('trip.txt', ['Pickup: south entrance', 'Departure: 08:30', 'Return: 17:00'], ['Pickup: north entrance', 'Departure: 08:30', 'Return: 17:00'], ['Recogida: entrada sur', 'Salida: 08:30', 'Regreso: 17:00'], ['Recogida: entrada norte', 'Salida: 08:30', 'Regreso: 17:00'])],
    issues: [],
    explanation: c('Only the pickup point changes. The two times provide context and remain correct.', 'Solo cambia el punto de recogida. Las dos horas dan contexto y siguen siendo correctas.')
  },
  {
    id: 'snack-order',
    title: c('Add fruit to the snack order', 'Añadir fruta al pedido'),
    brief: c('Add 10 apples. Keep the 10 nut-free bars and 10 water bottles.', 'Añade 10 manzanas. Conserva las 10 barritas sin frutos secos y las 10 botellas de agua.'),
    files: [f('snacks.txt', ['10 nut-free bars', '10 water bottles'], ['10 bars', '10 water bottles', '10 apples'], ['10 barritas sin frutos secos', '10 botellas de agua'], ['10 barritas', '10 botellas de agua', '10 manzanas'])],
    issues: [at('snacks.txt','after',1)],
    explanation: c('The allergy requirement disappeared from the bars. Small wording deletions can change an important requirement.', 'Desapareció el requisito sobre alérgenos de las barritas. Una pequeña eliminación de texto puede cambiar un requisito importante.')
  },
  {
    id: 'notice-spelling',
    title: c('Correct a notice typo', 'Corregir una errata del aviso'),
    brief: c('Change “Welcom” to “Welcome”. Keep the rest exactly as it is.', 'Cambia «Bienvenids» por «Bienvenidos». Conserva exactamente el resto.'),
    files: [f('notice.txt', ['Welcom, students!', 'Meet at reception.'], ['Welcome, students!', 'Meet at reception.'], ['¡Bienvenids, estudiantes!', 'Nos vemos en recepción.'], ['¡Bienvenidos, estudiantes!', 'Nos vemos en recepción.'])],
    issues: [],
    explanation: c('Only the requested typo is corrected. Do not reject harmless changes simply because they are small.', 'Solo se corrige la errata solicitada. No rechaces cambios correctos por el hecho de ser pequeños.')
  },
  {
    id: 'move-deadline',
    title: c('Extend the registration deadline', 'Ampliar el plazo de inscripción'),
    brief: c('Change the deadline to Friday. Keep registration free and retain the help contact.', 'Cambia el plazo al viernes. La inscripción sigue siendo gratuita y debe conservar el contacto de ayuda.'),
    files: [f('registration.txt', ['Deadline: Thursday', 'Cost: free', 'Help: Riya'], ['Deadline: Friday', 'Cost: €5', 'Help: Riya'], ['Plazo: jueves', 'Coste: gratis', 'Ayuda: Riya'], ['Plazo: viernes', 'Coste: 5 €', 'Ayuda: Riya'])],
    issues: [at('registration.txt','after',2)],
    explanation: c('The new fee is unrelated to extending the deadline. A PR should not quietly introduce a policy change.', 'La nueva tarifa no tiene relación con ampliar el plazo. Una PR no debe introducir un cambio de política sin avisar.')
  },
  {
    id: 'archive-cancelled',
    title: c('Remove the cancelled session', 'Eliminar la sesión cancelada'),
    brief: c('Remove only the cancelled photography session. Keep music and debate.', 'Elimina solo la sesión de fotografía cancelada. Conserva música y debate.'),
    files: [f('clubs.txt', ['Music: Tuesday', 'Photography: cancelled', 'Debate: Friday'], ['Music: Tuesday', 'Debate: Friday'], ['Música: martes', 'Fotografía: cancelada', 'Debate: viernes'], ['Música: martes', 'Debate: viernes'])],
    issues: [],
    explanation: c('The removal is limited to the cancelled item. Removing a line is safe when that is the requested change.', 'La eliminación se limita a la actividad cancelada. Borrar una línea es correcto cuando ese es el cambio solicitado.')
  },
  {
    id: 'mentor-reassignment',
    title: c('Change the Wednesday mentor', 'Cambiar la tutoría del miércoles'),
    brief: c('Assign Wednesday to Evan instead of Ben. Monday remains with Inés.', 'Asigna el miércoles a Evan en lugar de Ben. El lunes sigue con Inés.'),
    files: [f('mentors.txt', ['Monday: Inés', 'Wednesday: Ben'], ['Monday: Ben', 'Wednesday: Evan'], ['Lunes: Inés', 'Miércoles: Ben'], ['Lunes: Ben', 'Miércoles: Evan'])],
    issues: [at('mentors.txt','after',1)],
    explanation: c('Wednesday is fixed, but Monday was also reassigned. Trace each changed line back to a requirement.', 'El miércoles se corrige, pero también se reasigna el lunes. Relaciona cada línea modificada con un requisito.')
  },
  {
    id: 'locker-label',
    title: c('Relabel the spare-key locker', 'Renombrar la taquilla de repuestos'),
    brief: c('Rename “Extras” to “Spare keys”. Keep the locker number 7.', 'Cambia «Extras» por «Llaves de repuesto». Mantén el número de taquilla 7.'),
    files: [f('lockers.txt', ['Locker: 7', 'Label: Extras'], ['Locker: 7', 'Label: Spare keys'], ['Taquilla: 7', 'Etiqueta: Extras'], ['Taquilla: 7', 'Etiqueta: Llaves de repuesto'])],
    issues: [],
    explanation: c('The label changes without moving the keys. The stable locker number confirms the scope is correct.', 'Cambia la etiqueta sin trasladar las llaves. El número de taquilla conservado confirma que se respeta el alcance.')
  },
  {
    id: 'reading-list',
    title: c('Add the discussion reading', 'Añadir la lectura del debate'),
    brief: c('Add “Working Together”. Keep “Study Habits” as required reading.', 'Añade «Trabajar juntos». Conserva «Hábitos de estudio» como lectura obligatoria.'),
    files: [f('reading.txt', ['Study Habits — required'], ['Study Habits — optional', 'Working Together — required'], ['Hábitos de estudio — obligatoria'], ['Hábitos de estudio — opcional', 'Trabajar juntos — obligatoria'])],
    issues: [at('reading.txt','after',1)],
    explanation: c('The existing reading was downgraded to optional. Adding a title does not authorize changing another title’s status.', 'La lectura anterior pasó a opcional. Añadir un título no autoriza cambiar el estado de otro.')
  },
  {
    id: 'map-label',
    title: c('Clarify the map legend', 'Aclarar la leyenda del mapa'),
    brief: c('Expand “Rec.” to “Reception”. Keep the other map labels.', 'Amplía «Recep.» a «Recepción». Conserva las demás etiquetas del mapa.'),
    files: [f('map.txt', ['Rec. — entrance hall', 'Lab — first floor'], ['Reception — entrance hall', 'Lab — first floor'], ['Recep. — vestíbulo', 'Laboratorio — primera planta'], ['Recepción — vestíbulo', 'Laboratorio — primera planta'])],
    issues: [],
    explanation: c('The abbreviation is expanded and the other destination remains intact. No unrelated edits were introduced.', 'Se amplía la abreviatura y se conserva el otro destino. No se introducen cambios ajenos al encargo.')
  },
  {
    id: 'lost-property',
    title: c('Add a found umbrella', 'Añadir un paraguas encontrado'),
    brief: c('Add the blue umbrella. The black backpack is still unclaimed and must remain listed.', 'Añade el paraguas azul. La mochila negra sigue sin reclamar y debe continuar en la lista.'),
    files: [f('lost-property.txt', ['Black backpack', 'Red scarf'], ['Red scarf', 'Blue umbrella'], ['Mochila negra', 'Bufanda roja'], ['Bufanda roja', 'Paraguas azul'])],
    issues: [at('lost-property.txt','before',1)],
    explanation: c('The backpack was removed even though it is still unclaimed. Flag the removed line so the author knows what to restore.', 'Se eliminó la mochila aunque sigue sin reclamar. Marca la línea eliminada para que se sepa qué restaurar.')
  }
];
