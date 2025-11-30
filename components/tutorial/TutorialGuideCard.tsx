import styles from '../../styles/Desk.module.css';

interface TutorialGuideCardProps {
  badge?: string;
  title: string;
  body: string;
}

const TutorialGuideCard = ({ badge, title, body }: TutorialGuideCardProps) => {
  return (
    <article className={styles.tutorialGuideCard}>
      {badge && <span className={styles.tutorialGuideBadge}>{badge}</span>}
      <h4 className={styles.tutorialGuideTitle}>{title}</h4>
      <p className={styles.tutorialGuideBody}>{body}</p>
    </article>
  );
};

export default TutorialGuideCard;
