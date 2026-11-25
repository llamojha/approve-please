import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import TemplateWorkshop from '../../../components/authoring/TemplateWorkshop';
import { eagerTemplates, templateLoaders } from '../../../data/prs';
import type { PullRequestTemplate } from '../../../types';
import { cloneTemplateDraft } from '../../../utils/templateDraft';
import styles from '../../../styles/DevTemplates.module.css';

export const getServerSideProps: GetServerSideProps = async () => {
  if (process.env.NODE_ENV === 'production') return { notFound: true };
  return { props: {} };
};

const loadSource = async (templateId: string): Promise<PullRequestTemplate | undefined> => {
  const packs = await Promise.all(Object.values(templateLoaders).map(loader => loader()));
  return [...eagerTemplates, ...packs.flat()].find(template => template.templateId === templateId);
};

export default function NewTemplatePage() {
  const router = useRouter();
  const source = typeof router.query.duplicate === 'string' ? router.query.duplicate : null;
  const [initialTemplate, setInitialTemplate] = useState<PullRequestTemplate | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    if (!source) {
      setInitialTemplate(null);
      return () => { active = false; };
    }
    loadSource(source).then(template => {
      if (active) setInitialTemplate(template ? cloneTemplateDraft(template) : null);
    }).catch(() => {
      if (active) setInitialTemplate(null);
    });
    return () => { active = false; };
  }, [source]);

  return <main className={styles.page}>
    <section className={styles.shell} aria-labelledby="template-workshop-title">
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>Development only</p><h1 id="template-workshop-title">Contributor PR workshop</h1><p className={styles.intro}>Create, validate, simulate and export a playable pull request without editing manifests by hand.</p></div>
        <Link className={styles.backLink} href="/dev/templates">Back to gallery</Link>
      </header>
      {initialTemplate === undefined ? <p className={styles.status}>Loading source template…</p> : <TemplateWorkshop key={source ?? 'new'} initialTemplate={initialTemplate ?? undefined} />}
    </section>
  </main>;
}
