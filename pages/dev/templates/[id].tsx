import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PRViewer from '../../../components/work/PRViewer';
import { useLocale } from '../../../context/LocaleContext';
import { eagerTemplates, templateLoaders } from '../../../data/prs';
import styles from '../../../styles/DevTemplates.module.css';
import type { PullRequestTemplate } from '../../../types';
import { instantiatePullRequest } from '../../../utils/pr';

interface TemplateCatalogEntry {
  language: string;
  template: PullRequestTemplate;
}

const loadTemplateCatalog = async (): Promise<TemplateCatalogEntry[]> => {
  const lazyPacks = await Promise.all(
    Object.entries(templateLoaders).map(async ([language, loader]) => ({
      language,
      templates: await loader()
    }))
  );

  return [
    ...eagerTemplates.map((template) => ({ language: 'generic', template })),
    ...lazyPacks.flatMap(({ language, templates }) =>
      templates.map((template) => ({ language, template }))
    )
  ];
};

interface TemplatePreviewPageProps {
  templateId: string;
}

export const getServerSideProps: GetServerSideProps<TemplatePreviewPageProps> = async (context) => {
  if (process.env.NODE_ENV === 'production') {
    return { notFound: true };
  }

  const templateId = context.params?.id;
  if (typeof templateId !== 'string') {
    return { notFound: true };
  }

  return { props: { templateId } };
};

interface TemplatePreviewProps {
  template: PullRequestTemplate;
  language: string;
}

const TemplatePreview = ({ template, language }: TemplatePreviewProps) => {
  const { locale, setLocale } = useLocale();
  const highlightedBugLines = useMemo(
    () =>
      [...new Set(template.bugPatterns.flatMap((bug) => bug.lineNumbers))].sort(
        (left, right) => left - right
      ),
    [template]
  );
  const [selectedLines, setSelectedLines] = useState(highlightedBugLines);
  const previewPR = useMemo(
    () => instantiatePullRequest(template, 1, 0, locale),
    [template, locale]
  );

  useEffect(() => {
    setSelectedLines(highlightedBugLines);
  }, [highlightedBugLines]);

  const toggleLine = useCallback((lineNumber: number) => {
    setSelectedLines((current) => {
      if (current.includes(lineNumber)) {
        return current.filter((line) => line !== lineNumber);
      }
      return [...current, lineNumber].sort((left, right) => left - right);
    });
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="template-preview-title">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Development only · {language}</p>
            <h1 id="template-preview-title">{template.templateId}</h1>
            <p className={styles.intro}>
              Bug lines start highlighted. Click a diff row to toggle its review highlight.
            </p>
          </div>
          <Link className={styles.backLink} href="/dev/templates">
            Back to gallery
          </Link>
        </header>

        <fieldset className={styles.localeToggle}>
          <legend>Preview locale</legend>
          <button
            type="button"
            className={locale === 'en' ? styles.localeButtonActive : styles.localeButton}
            aria-pressed={locale === 'en'}
            onClick={() => setLocale('en')}
          >
            English
          </button>
          <button
            type="button"
            className={locale === 'es' ? styles.localeButtonActive : styles.localeButton}
            aria-pressed={locale === 'es'}
            onClick={() => setLocale('es')}
          >
            Español
          </button>
        </fieldset>

        <div className={styles.previewLayout}>
          <div className={styles.viewerColumn}>
            <PRViewer
              pr={previewPR}
              selectedLines={selectedLines}
              onToggleLine={toggleLine}
              actionSlot={<p className={styles.selectionNote}>Selected lines: {selectedLines.join(', ') || 'none'}</p>}
            />
          </div>
          <aside className={styles.bugDetails} aria-labelledby="bug-details-title">
            <h2 id="bug-details-title">Bug details</h2>
            {previewPR.bugPatterns.length === 0 ? (
              <p className={styles.empty}>This is a clean PR template.</p>
            ) : (
              <ul>
                {previewPR.bugPatterns.map((bug, index) => (
                  <li key={`${bug.kind}-${bug.severity}-${index}`}>
                    <p>
                      <strong>{bug.kind}</strong> · {bug.severity} · lines {bug.lineNumbers.join(', ')}
                    </p>
                    <p>{bug.description ?? 'No description supplied.'}</p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
};

const TemplatePreviewPage = ({ templateId }: TemplatePreviewPageProps) => {
  const [template, setTemplate] = useState<TemplatePreviewProps | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);

    loadTemplateCatalog()
      .then((catalog) => {
        if (!active) {
          return;
        }
        const entry = catalog.find((candidate) => candidate.template.templateId === templateId);
        setTemplate(entry ? { template: entry.template, language: entry.language } : null);
        setIsLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadError('The template packs could not be loaded. Check the browser console and reload.');
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [templateId]);

  if (loadError) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <p className={styles.error} role="alert">
            {loadError}
          </p>
          <Link className={styles.backLink} href="/dev/templates">
            Back to gallery
          </Link>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <p className={styles.status} role="status">
            Loading template preview…
          </p>
        </section>
      </main>
    );
  }

  if (!template) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <p className={styles.empty} role="status">
            Template “{templateId}” was not found in the loaded manifest packs.
          </p>
          <Link className={styles.backLink} href="/dev/templates">
            Back to gallery
          </Link>
        </section>
      </main>
    );
  }

  return <TemplatePreview key={template.template.templateId} {...template} />;
};

export default TemplatePreviewPage;
