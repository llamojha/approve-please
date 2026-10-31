import type { ArrivalNotice } from '../../hooks/usePRArrivalNotice';
import { useTranslations } from '../../hooks/useTranslations';
import styles from '../../styles/AudioControls.module.css';

export default function PRArrivalNotice({ notice }: { notice: ArrivalNotice | null }) {
  const t = useTranslations().audio;
  return <>
    <div role="status" aria-atomic="true" className={styles.live}>
      {notice && <span key={notice.serial}>{t.arrival(notice.count)}</span>}
    </div>
    {notice && <div className={styles.notice} aria-hidden="true"><span>✦</span>{t.arrival(notice.count)}</div>}
  </>;
}
