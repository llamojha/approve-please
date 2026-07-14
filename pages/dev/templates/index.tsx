import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { eagerTemplates, templateLoaders, type PullRequestTemplate } from '../../../data/prs';
import type { BugKind, BugPattern } from '../../../types';
import styles from '../../../styles/DevTemplates.module.css';

interface TemplateCatalogEntry {
  language: string;
  template: PullRequestTemplate;
}

type BugKindFilter = 'all' | BugKind;
type SeverityFilter = 'all' | BugPattern['severity'];
type CleanFilter = 'all' | 'clean';
type LocalizationFilter = 'all' | 'missing-es';

const BUG_KINDS: BugKind[] = ['logic', 'security', 'performance', 'style', 'accessibility'];
const SEVERITIES: BugPattern['severity'][] = ['minor', 'major', 'critical'];

const compareEntries = (left: TemplateCatalogEntry, right: TemplateCatalogEntry): number => {
  if (left.language < right.language) return -1;
  if (left.language > right.language) return 1;
  if (left.template.templateId < right.template.templateId) return -1;
  if (left.template.templateId > right.template.templateId) return 1;
  return 0;
};

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
  ].sort(compareEntries);
};

const getCatalogLanguages = (catalog: TemplateCatalogEntry[]): string[] =>
  [...new Set(catalog.map(({ language }) => language))].sort();

const filterTemplateCatalog = (
  catalog: TemplateCatalogEntry[],
  filters: GalleryFilters
): TemplateCatalogEntry[] =>
  catalog.filter(({ language, template }) => {
    const bugs = template.bugPatterns;
    const matchesKind = filters.bugKind === 'all' || bugs.some((bug) => bug.kind === filters.bugKind);
    const matchesSeverity =
      filters.severity === 'all' || bugs.some((bug) => bug.severity === filters.severity);
    const matchesClean = filters.clean === 'all' || bugs.length === 0;
    const matchesLocalization =
      filters.localization === 'all' || template.localized?.es === undefined;

    return (
      (filters.language === 'all' || language === filters.language) &&
      matchesKind &&
      matchesSeverity &&
      matchesClean &&
      matchesLocalization
    );
  });

interface GalleryFilters {
  language: string;
  bugKind: BugKindFilter;
  severity: SeverityFilter;
  clean: CleanFilter;
  localization: LocalizationFilter;
}

const INITIAL_FILTERS: GalleryFilters = {
  language: 'all',
  bugKind: 'all',
  severity: 'all',
  clean: 'all',
  localization: 'all'
};

export const getServerSideProps: GetServerSideProps = async () => {
  if (process.env.NODE_ENV === 'production') {
    return { notFound: true };
  }

  return { props: {} };
};

const GalleryPage = () => {
  const [catalog, setCatalog] = useState<TemplateCatalogEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GalleryFilters>(INITIAL_FILTERS);

  useEffect(() => {
    let active = true;

    loadTemplateCatalog()
      .then((templates) => {
        if (active) {
          setCatalog(templates);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError('The template packs could not be loaded. Check the browser console and reload.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const languages = useMemo(() => (catalog ? getCatalogLanguages(catalog) : []), [catalog]);
  const visibleTemplates = useMemo(
    () => (catalog ? filterTemplateCatalog(catalog, filters) : []),
    [catalog, filters]
  );

  const updateFilter = <Key extends keyof GalleryFilters>(
    key: Key,
    value: GalleryFilters[Key]
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilter('language', event.target.value);
  };

  const handleBugKindChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilter('bugKind', event.target.value as BugKindFilter);
  };

  const handleSeverityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilter('severity', event.target.value as SeverityFilter);
  };

  const handleCleanChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilter('clean', event.target.value as CleanFilter);
  };

  const handleLocalizationChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilter('localization', event.target.value as LocalizationFilter);
  };

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="template-gallery-title">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Development only</p>
            <h1 id="template-gallery-title">PR template gallery</h1>
            <p className={styles.intro}>
              Inspect manifest content, coverage gaps, and the exact game preview for every template.
            </p>
          </div>
          <Link className={styles.backLink} href="/">
            Back to home
          </Link>
        </header>

        {loadError && (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        )}

        {!catalog && !loadError && (
          <p className={styles.status} role="status">
            Loading template packs…
          </p>
        )}

        {catalog && !loadError && (
          <>
            <section className={styles.filters} aria-label="Template filters">
              <label>
                Language
                <select value={filters.language} onChange={handleLanguageChange}>
                  <option value="all">All languages</option>
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Bug kind
                <select value={filters.bugKind} onChange={handleBugKindChange}>
                  <option value="all">All bug kinds</option>
                  {BUG_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Severity
                <select value={filters.severity} onChange={handleSeverityChange}>
                  <option value="all">All severities</option>
                  {SEVERITIES.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Review state
                <select value={filters.clean} onChange={handleCleanChange}>
                  <option value="all">All templates</option>
                  <option value="clean">Clean PRs only</option>
                </select>
              </label>
              <label>
                Spanish metadata
                <select value={filters.localization} onChange={handleLocalizationChange}>
                  <option value="all">All templates</option>
                  <option value="missing-es">Missing localized.es</option>
                </select>
              </label>
            </section>

            <p className={styles.resultCount} aria-live="polite">
              Showing {visibleTemplates.length} of {catalog.length} templates
            </p>

            {visibleTemplates.length === 0 ? (
              <p className={styles.empty}>No templates match these filters.</p>
            ) : (
              <ul className={styles.templateList}>
                {visibleTemplates.map(({ language, template }) => (
                  <li key={`${language}-${template.templateId}`} className={styles.templateCard}>
                    <div className={styles.templateCardHeader}>
                      <div>
                        <p className={styles.templateId}>{template.templateId}</p>
                        <h2>{template.title}</h2>
                      </div>
                      <span className={styles.languageBadge}>{language}</span>
                    </div>
                    <p className={styles.description}>{template.description}</p>
                    <div className={styles.badgeList} aria-label="Template metadata">
                      {template.bugPatterns.length === 0 ? (
                        <span className={styles.cleanBadge}>clean</span>
                      ) : (
                        template.bugPatterns.map((bug, index) => (
                          <span key={`${bug.kind}-${bug.severity}-${index}`} className={styles.bugBadge}>
                            {bug.kind} · {bug.severity}
                          </span>
                        ))
                      )}
                      {template.localized?.es === undefined && (
                        <span className={styles.missingBadge}>missing ES</span>
                      )}
                    </div>
                    <Link
                      className={styles.previewLink}
                      href={`/dev/templates/${template.templateId}`}
                    >
                      Preview {template.templateId}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default GalleryPage;
