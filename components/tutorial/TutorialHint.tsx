import { ReactNode } from 'react';
import styles from '../../styles/Desk.module.css';

interface TutorialHintProps {
  text: string;
  icon?: ReactNode;
}

const TutorialHint = ({ text, icon }: TutorialHintProps) => {
  return (
    <span className={styles.tutorialHint} tabIndex={0} aria-label={text}>
      <span aria-hidden="true">{icon ?? '?'}</span>
      <span className={styles.tutorialHintBubble} role="tooltip">
        {text}
      </span>
    </span>
  );
};

export default TutorialHint;
