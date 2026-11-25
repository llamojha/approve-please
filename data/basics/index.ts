import { characters } from '../characters';
import { copy as c, type BasicsLesson, type ExerciseDraft } from './types';
import { firstReviews } from './first-reviews';
import { followTheBrief } from './follow-the-brief';
import { accidentalEdits } from './accidental-edits';
import { completeness } from './completeness';
import { multipleFiles } from './multiple-files';
import { mixedPractice } from './mixed-practice';

const lesson = (id: string, title: BasicsLesson['title'], focus: BasicsLesson['focus'], tip: BasicsLesson['tip'], drafts: ExerciseDraft[], rotation: number): BasicsLesson => ({
  id, title, focus, tip,
  // Stable lesson rotation gives every coworker clean and flawed work. Identity never determines the answer.
  exercises: drafts.map((exercise, index) => ({ ...exercise, authorId: characters[(index + rotation) % characters.length].id }))
    // Keep the opening addition first, then mix verdicts without randomizing saved progress.
    .sort((a, b) => {
      if (id === 'first-reviews' && (a.id === 'add-member' || b.id === 'add-member')) return a.id === 'add-member' ? -1 : 1;
      return a.id.localeCompare(b.id);
    })
});
export const basicsLessons = [
  lesson('first-reviews', c('Your first reviews', 'Tus primeras revisiones'), c('Read additions, removals and replacements.', 'Lee lo añadido, eliminado y sustituido.'), c('A pull request proposes changes from a working branch into a target branch. Read its brief, then compare the old and new text. + adds, − removes; unmarked lines stay unchanged.', 'Una pull request propone cambios desde una rama de trabajo a una rama de destino. Lee el encargo y compara el texto anterior y el nuevo. + añade, − elimina; las líneas sin marca no cambian.'), firstReviews, 0),
  lesson('follow-the-brief', c('Follow the brief', 'Sigue el encargo'), c('Compare the proposed change with explicit requirements.', 'Compara el cambio propuesto con los requisitos.'), c('The brief is your source of truth. The author’s description explains intent, but the diff shows what would actually change. Approve only when all requirements are met.', 'El encargo es tu referencia. La descripción explica la intención, pero el diff muestra lo que cambiaría realmente. Aprueba solo si se cumplen todos los requisitos.'), followTheBrief, 1),
  lesson('accidental-edits', c('Catch accidental edits', 'Detecta cambios accidentales'), c('Check what must stay unchanged.', 'Comprueba lo que debe mantenerse.'), c('A PR can make the requested change and still damage something else. Read removed lines and check the boundaries of the task. Give feedback about the change, not the person.', 'Una PR puede hacer lo solicitado y aun así estropear otra cosa. Lee las líneas eliminadas y comprueba el alcance. Comenta el cambio, no a la persona.'), accidentalEdits, 2),
  lesson('completeness', c('Check completeness', 'Comprueba que no falte nada'), c('Check required information and the order of steps.', 'Comprueba la información necesaria y el orden de los pasos.'), c('Count requirements, not green lines. A list can contain all the right words in the wrong order. Flag the line that needs changing or the removed line that must be restored.', 'Cuenta requisitos, no líneas verdes. Una lista puede tener las palabras correctas en el orden equivocado. Marca la línea que deba cambiar o la eliminada que deba restaurarse.'), completeness, 3),
  lesson('multiple-files', c('Review multiple files', 'Revisa varios archivos'), c('Follow one change across related documents.', 'Sigue un cambio entre documentos relacionados.'), c('A PR can change more than one file. Review them all. Two documents can agree with each other and still both contradict the brief.', 'Una PR puede cambiar varios archivos. Revísalos todos. Dos documentos pueden coincidir entre sí y aun así contradecir el encargo.'), multipleFiles, 4),
  lesson('mixed-practice', c('Put it together', 'Ponlo en práctica'), c('Apply the full review process without a timer.', 'Aplica la revisión completa sin reloj.'), c('Read the brief, inspect every file, check additions and removals, then decide. Approve a correct PR; reject one that needs a fix. A rejection asks for a revision, not for the author to abandon the work.', 'Lee el encargo, revisa todos los archivos, comprueba lo añadido y eliminado, y decide. Aprueba una PR correcta; rechaza la que necesite arreglo. Rechazar pide una revisión, no abandonar el trabajo.'), mixedPractice, 5),
];
export const basicsExercises = basicsLessons.flatMap(item => item.exercises);
