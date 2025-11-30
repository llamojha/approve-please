import { RefObject, useLayoutEffect, useMemo, useState } from 'react';
import styles from '../../styles/Desk.module.css';
import TutorialGuideCard from './TutorialGuideCard';

interface TutorialOverlayProps {
  targetRef: RefObject<HTMLElement | null> | null;
  badge?: string;
  title: string;
  body: string;
  visible?: boolean;
  padding?: number;
}

interface RectSnapshot {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TutorialOverlay = ({ targetRef, badge, title, body, visible = true, padding = 16 }: TutorialOverlayProps) => {
  const [rect, setRect] = useState<RectSnapshot | null>(null);

  useLayoutEffect(() => {
    if (!visible || !targetRef?.current) {
      setRect(null);
      return;
    }
    const node = targetRef.current;
    const updateRect = () => {
      if (!node) {
        setRect(null);
        return;
      }
      const bounds = node.getBoundingClientRect();
      setRect({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height });
    };
    updateRect();
    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    const resizeObserver = new ResizeObserver(() => updateRect());
    resizeObserver.observe(node);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      resizeObserver.disconnect();
    };
  }, [targetRef, visible]);

  const highlight = useMemo(() => {
    if (!rect) {
      return null;
    }
    const top = Math.max(rect.top - padding, 8);
    const left = Math.max(rect.left - padding, 8);
    const width = rect.width + padding * 2;
    const height = rect.height + padding * 2;
    return { top, left, width, height };
  }, [rect, padding]);

  if (!visible || !rect || !highlight) {
    return null;
  }

  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const segments = [
    { top: 0, left: 0, width: '100%', height: `${Math.max(highlight.top, 0)}px` },
    {
      top: highlight.top,
      left: 0,
      width: `${Math.max(highlight.left, 0)}px`,
      height: `${highlight.height}px`
    },
    {
      top: highlight.top,
      left: `${highlight.left + highlight.width}px`,
      width: `${Math.max(viewportWidth - (highlight.left + highlight.width), 0)}px`,
      height: `${highlight.height}px`
    },
    {
      top: `${highlight.top + highlight.height}px`,
      left: 0,
      width: '100%',
      height: `${Math.max(viewportHeight - (highlight.top + highlight.height), 0)}px`
    }
  ];

  const prefersBelow = highlight.top + highlight.height + 200 <= viewportHeight;
  const calloutTop = prefersBelow
    ? highlight.top + highlight.height + 16
    : Math.max(highlight.top - 180, 16);
  const calloutLeft = Math.min(Math.max(highlight.left, 16), Math.max(viewportWidth - 320, 16));

  return (
    <div className={styles.tutorialOverlay} aria-live="assertive">
      {segments.map((segment, index) => (
        <div
          key={index}
          className={styles.tutorialOverlaySegment}
          style={{
            top: segment.top,
            left: segment.left,
            width: segment.width,
            height: segment.height
          }}
          aria-hidden="true"
        />
      ))}
      <div
        className={styles.tutorialOverlayHighlight}
        style={{
          top: highlight.top,
          left: highlight.left,
          width: highlight.width,
          height: highlight.height
        }}
      />
      <div
        className={styles.tutorialOverlayCard}
        style={{
          top: calloutTop,
          left: calloutLeft
        }}
      >
        <TutorialGuideCard badge={badge} title={title} body={body} />
      </div>
    </div>
  );
};

export default TutorialOverlay;
