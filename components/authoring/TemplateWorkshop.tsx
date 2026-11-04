import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeDiff from '../work/CodeDiff';
import { instantiatePullRequest } from '../../utils/pr';
import { evaluateDecision } from '../../utils/decision';
import { normalizePullRequest } from '../../utils/templateNormalization';
import type { BugKind, BugPattern, LineReference, PullRequestTemplate } from '../../types';
import {
  createTemplateDraft,
  loadTemplateDraft,
  parseTemplateDraft,
  saveTemplateDraft,
  serializeTemplateDraft,
  validateTemplateDraft
} from '../../utils/templateDraft';
import styles from '../../styles/DevTemplates.module.css';

const BUG_KINDS: BugKind[] = ['logic', 'security', 'performance', 'style', 'accessibility'];
const SEVERITIES: BugPattern['severity'][] = ['minor', 'major', 'critical'];

const parseLines = (source: string) => source.split('\n').filter(Boolean).map((entry, index) => {
  const [numberText, marker, ...content] = entry.split('|');
  const lineNumber = Number.parseInt(numberText, 10);
  const isNew = (marker ?? '').trim() === '+';
  return {
    rowId: `line-${Number.isInteger(lineNumber) ? lineNumber : index + 1}`,
    kind: isNew ? 'addition' as const : 'context' as const,
    lineNumber: Number.isInteger(lineNumber) ? lineNumber : index + 1,
    content: content.join('|'),
    isNew
  };
});

const formatLines = (lines: PullRequestTemplate['files'][number]['lines']) =>
  lines.map(line => `${line.lineNumber}|${line.isNew ? '+' : ' '}|${line.content}`).join('\n');

const FileLinesEditor = ({ file, onChange }: {
  file: PullRequestTemplate['files'][number];
  onChange: (lines: PullRequestTemplate['files'][number]['lines']) => void;
}) => {
  const [source, setSource] = useState(() => formatLines(file.lines));
  const emittedLines = useRef(file.lines);
  useEffect(() => {
    if (file.lines !== emittedLines.current) setSource(formatLines(file.lines));
  }, [file.lines]);
  return <label className={styles.wideField}>Lines: number | + for addition or blank for context | code<textarea className={styles.codeInput} value={source} onChange={event => {
    setSource(event.target.value);
    const lines = parseLines(event.target.value);
    emittedLines.current = lines;
    onChange(lines);
  }} /></label>;
};

const TagEditor = ({ label, tags, onChange, className }: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}) => {
  const [source, setSource] = useState(() => tags.join(', '));
  const emittedTags = useRef(tags);
  useEffect(() => {
    if (tags !== emittedTags.current) setSource(tags.join(', '));
  }, [tags]);
  return <label className={className}>{label}<input value={source} onChange={event => {
    setSource(event.target.value);
    const next = event.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    emittedTags.current = next;
    onChange(next);
  }} /></label>;
};

const downloadTemplate = (template: PullRequestTemplate) => {
  const blob = new Blob([serializeTemplateDraft(template)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'template.json';
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function TemplateWorkshop({ initialTemplate }: { initialTemplate?: PullRequestTemplate }) {
  const [template, setTemplate] = useState<PullRequestTemplate>(() => initialTemplate ?? createTemplateDraft());
  const [selected, setSelected] = useState<LineReference[]>([]);
  const [importSource, setImportSource] = useState('');
  const [importErrors, setImportErrors] = useState<ReturnType<typeof validateTemplateDraft>>([]);
  const [status, setStatus] = useState('Drafts save locally in this browser.');
  const [bugKind, setBugKind] = useState<BugKind>('logic');
  const [severity, setSeverity] = useState<BugPattern['severity']>('major');
  const [bugDescription, setBugDescription] = useState('');
  const [bugDescriptionEs, setBugDescriptionEs] = useState('');
  const [previewLocale, setPreviewLocale] = useState<'en' | 'es'>('en');
  const hydrated = useRef(false);

  useEffect(() => {
    if (!initialTemplate) {
      const saved = loadTemplateDraft(window.localStorage);
      if (saved) {
        setTemplate(saved.template);
        setStatus(`Recovered local draft saved ${new Date(saved.updatedAt).toLocaleString()}.`);
      }
    }
    hydrated.current = true;
  }, [initialTemplate]);

  useEffect(() => {
    if (!hydrated.current) return;
    const timeout = window.setTimeout(() => {
      if (validateTemplateDraft(template).length > 0) {
        setStatus('Fix the validation errors. Your last valid draft remains saved.');
        return;
      }
      saveTemplateDraft(window.localStorage, template);
      setStatus('Draft saved locally.');
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [template]);

  const diagnostics = useMemo(() => validateTemplateDraft(template), [template]);
  const preview = useMemo(() => {
    if (diagnostics.length > 0) return null;
    try {
      return normalizePullRequest(instantiatePullRequest(template, 1, 0, previewLocale));
    } catch {
      return null;
    }
  }, [diagnostics.length, previewLocale, template]);
  const outcomes = useMemo(() => {
    if (!preview) return null;
    const meters = { stability: 100, velocity: 100, satisfaction: 100 };
    return {
      approve: evaluateDecision(preview, 'approve', [], meters),
      reject: evaluateDecision(preview, 'request-changes', selected, meters)
    };
  }, [preview, selected]);

  const update = <Key extends keyof PullRequestTemplate>(key: Key, value: PullRequestTemplate[Key]) =>
    setTemplate(current => ({ ...current, [key]: value }));

  const updateFile = (index: number, patch: Partial<PullRequestTemplate['files'][number]>) => {
    setTemplate(current => ({
      ...current,
      files: current.files.map((file, fileIndex) => fileIndex === index ? { ...file, ...patch } : file)
    }));
    setSelected([]);
  };

  const updateSpanish = (patch: NonNullable<PullRequestTemplate['localized']>['es']) => {
    setTemplate(current => ({
      ...current,
      localized: { ...current.localized, es: { ...current.localized?.es, ...patch } }
    }));
  };

  const toggleSelected = useCallback((reference: LineReference) => {
    setSelected(current => current.some(item => item.filename === reference.filename && item.rowId === reference.rowId)
      ? current.filter(item => item.filename !== reference.filename || item.rowId !== reference.rowId)
      : [...current, reference]);
  }, []);

  const annotateBug = () => {
    if (selected.length === 0 || !preview) return;
    const lineNumbers = selected.flatMap(ref => preview.files
      .find(file => file.filename === ref.filename)?.lines
      .filter(line => line.rowId === ref.rowId)
      .map(line => line.lineNumber) ?? []);
    update('bugPatterns', [...template.bugPatterns, {
      kind: bugKind,
      severity,
      description: bugDescription || undefined,
      localizedDescription: bugDescriptionEs ? { es: bugDescriptionEs } : undefined,
      lineNumbers: [...new Set(lineNumbers)],
      lineRefs: selected.map(reference => ({ ...reference }))
    }]);
    setSelected([]);
    setBugDescription('');
    setBugDescriptionEs('');
  };

  const importJson = () => {
    const result = parseTemplateDraft(importSource);
    setImportErrors(result.diagnostics);
    if (result.template) {
      setTemplate(result.template);
      setSelected([]);
      setStatus('Imported template. The previous draft was kept until validation succeeded.');
    }
  };

  return <div className={styles.workshopLayout}>
    <section className={styles.editor} aria-labelledby="workshop-editor-title">
      <h2 id="workshop-editor-title">Scenario editor</h2>
      <div className={styles.fieldGrid}>
        <label>Template ID<input value={template.templateId} onChange={event => update('templateId', event.target.value)} /></label>
        <label>Priority<select value={template.importance} onChange={event => update('importance', event.target.value as PullRequestTemplate['importance'])}><option value="low">Low</option><option value="normal">Medium</option><option value="high">High</option></select></label>
        <label className={styles.wideField}>Title<input value={template.title} onChange={event => update('title', event.target.value)} /></label>
        <label>Author<input value={template.author} onChange={event => update('author', event.target.value)} /></label>
        <label>Cast ID (optional)<input value={template.authorId ?? ''} onChange={event => update('authorId', event.target.value || undefined)} /></label>
        <label className={styles.wideField}>Description<textarea value={template.description} onChange={event => update('description', event.target.value)} /></label>
        <TagEditor className={styles.wideField} label="Tags, comma separated" tags={template.tags} onChange={tags => update('tags', tags)} />
      </div>

      <details className={styles.localeEditor} open><summary>Spanish metadata</summary><div className={styles.fieldGrid}>
        <label className={styles.wideField}>Spanish title<input value={template.localized?.es?.title ?? ''} onChange={event => updateSpanish({ title: event.target.value })} /></label>
        <label>Spanish author<input value={template.localized?.es?.author ?? ''} onChange={event => updateSpanish({ author: event.target.value })} /></label>
        <TagEditor label="Spanish tags" tags={template.localized?.es?.tags ?? []} onChange={tags => updateSpanish({ tags })} />
        <label className={styles.wideField}>Spanish description<textarea value={template.localized?.es?.description ?? ''} onChange={event => updateSpanish({ description: event.target.value })} /></label>
      </div></details>

      <div className={styles.sectionHeading}><h3>Files and diff</h3><button type="button" onClick={() => update('files', [...template.files, { filename: `src/file-${template.files.length + 1}.ts`, language: 'typescript', lines: [{ rowId: 'line-1', kind: 'addition', lineNumber: 1, content: '', isNew: true }] }])}>Add file</button></div>
      {template.files.map((file, index) => <fieldset className={styles.fileEditor} key={index}>
        <legend>File {index + 1}</legend>
        <label>Filename<input value={file.filename} onChange={event => updateFile(index, { filename: event.target.value })} /></label>
        <label>Language<input value={file.language} onChange={event => updateFile(index, { language: event.target.value })} /></label>
        <FileLinesEditor key={`${index}-${template.templateId}`} file={file} onChange={lines => updateFile(index, { lines })} />
        {template.files.length > 1 && <button type="button" className={styles.dangerButton} onClick={() => update('files', template.files.filter((_, fileIndex) => fileIndex !== index))}>Remove file</button>}
      </fieldset>)}

      <div className={styles.annotationPanel}>
        <h3>Bug annotation</h3>
        <p>Select one or more added rows in the preview, then describe the bug.</p>
        <label>Kind<select value={bugKind} onChange={event => setBugKind(event.target.value as BugKind)}>{BUG_KINDS.map(kind => <option key={kind}>{kind}</option>)}</select></label>
        <label>Severity<select value={severity} onChange={event => setSeverity(event.target.value as BugPattern['severity'])}>{SEVERITIES.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Description<input value={bugDescription} onChange={event => setBugDescription(event.target.value)} /></label>
        <label>Spanish description<input value={bugDescriptionEs} onChange={event => setBugDescriptionEs(event.target.value)} /></label>
        <button type="button" disabled={selected.length === 0} onClick={annotateBug}>Mark {selected.length || ''} selected row{selected.length === 1 ? '' : 's'} as bug</button>
        {template.bugPatterns.map((bug, index) => <div className={styles.annotation} key={`${bug.kind}-${index}`}><span>{bug.kind} · {bug.severity} · {bug.lineRefs?.map(ref => `${ref.filename}:${ref.rowId}`).join(', ') || bug.lineNumbers.join(', ')}</span><button type="button" onClick={() => update('bugPatterns', template.bugPatterns.filter((_, bugIndex) => bugIndex !== index))}>Remove</button></div>)}
      </div>

      <details className={styles.importPanel}><summary>Import validated JSON</summary><textarea value={importSource} onChange={event => setImportSource(event.target.value)} placeholder="Paste a complete template.json here" /><button type="button" onClick={importJson}>Validate and import</button>{importErrors.length > 0 && <ul className={styles.diagnostics} role="alert">{importErrors.map((error, index) => <li key={`${error.path}-${index}`}><strong>{error.path}</strong>: {error.message}</li>)}</ul>}</details>
    </section>

    <aside className={styles.workshopPreview} aria-labelledby="workshop-preview-title">
      <div className={styles.sectionHeading}><h2 id="workshop-preview-title">Player preview</h2><div className={styles.previewActions}><div role="group" aria-label="Preview language"><button type="button" aria-pressed={previewLocale === 'en'} onClick={() => setPreviewLocale('en')}>EN</button><button type="button" aria-pressed={previewLocale === 'es'} onClick={() => setPreviewLocale('es')}>ES</button></div><button type="button" disabled={diagnostics.length > 0} onClick={() => downloadTemplate(template)}>Export JSON</button></div></div>
      <p className={styles.status} role="status">{status}</p>
      {diagnostics.length > 0 ? <ul className={styles.diagnostics} role="alert">{diagnostics.map((error, index) => <li key={`${error.path}-${index}`}><strong>{error.path}</strong>: {error.message}</li>)}</ul> : preview && <>
        <article className={styles.previewMeta}><span>{template.importance} priority</span><h3>{preview.title}</h3><p>{preview.author}</p><p>{preview.description}</p></article>
        <CodeDiff files={preview.files} selected={selected} onToggle={toggleSelected} labels={{ codeLabel: 'Code changes', select: 'Select row', additions: 'additions' }} />
        {outcomes && <div className={styles.outcomeGrid}><div><strong>Approve</strong><span>{outcomes.approve.outcome}</span><small>Stability {outcomes.approve.appliedMeterDelta.stability >= 0 ? '+' : ''}{outcomes.approve.appliedMeterDelta.stability}</small></div><div><strong>Request changes</strong><span>{outcomes.reject.outcome} · {outcomes.reject.precision}</span><small>Selected rows: {selected.length}</small></div></div>}
        <p className={styles.directoryNote}>Export to <code>data/prTemplates/&lt;language&gt;/{template.templateId}/template.json</code>, then run the repository template generator.</p>
      </>}
    </aside>
  </div>;
}
