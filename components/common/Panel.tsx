import { ReactNode } from 'react';
import styles from '../../styles/Desk.module.css';

interface PanelProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  titleHint?: ReactNode;
}

const Panel = ({ title, children, footer, className, titleHint }: PanelProps) => {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(' ')}>
      {title && (
        <header className={styles.panelHeader}>
          <div className={styles.panelTitleRow}>
            <h3>{title}</h3>
            {titleHint && <div className={styles.panelHintSlot}>{titleHint}</div>}
          </div>
        </header>
      )}
      <div className={styles.panelBody}>{children}</div>
      {footer && <footer className={styles.panelFooter}>{footer}</footer>}
    </section>
  );
};

export default Panel;
