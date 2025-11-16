import { Locale, PullRequest, PRLocalizedMetadata } from '../types';
import { PullRequestTemplate } from '../data/prs';
import { uniqueId } from './helpers';

const pickLocalizedField = <T>(
  key: keyof PRLocalizedMetadata,
  localizedMeta: PRLocalizedMetadata | undefined,
  fallbackMeta: PRLocalizedMetadata | undefined,
  baseValue: T
): T => {
  const localizedValue = localizedMeta?.[key] as T | undefined;
  const fallbackValue = fallbackMeta?.[key] as T | undefined;
  return localizedValue ?? fallbackValue ?? baseValue;
};

export const instantiatePullRequest = (
  template: PullRequestTemplate,
  day: number,
  index: number,
  locale: Locale
): PullRequest => {
  const estimatedReviewSeconds = estimateReviewSeconds(template);
  const localizedMeta = template.localized?.[locale];
  const fallbackMeta = locale === 'en' ? undefined : template.localized?.en;

  const title = pickLocalizedField('title', localizedMeta, fallbackMeta, template.title);
  const description = pickLocalizedField('description', localizedMeta, fallbackMeta, template.description);
  const tags = pickLocalizedField('tags', localizedMeta, fallbackMeta, template.tags);
  const author = pickLocalizedField('author', localizedMeta, fallbackMeta, template.author);

  return {
    id: `${template.templateId}-d${day}-${index}-${uniqueId('pr')}`,
    templateId: template.templateId,
    importance: template.importance,
    title,
    description,
    tags: [...tags],
    author,
    files: template.files.map((file) => ({
      ...file,
      lines: file.lines.map((line) => ({ ...line }))
    })),
    bugPatterns: template.bugPatterns.map((pattern) => ({
      kind: pattern.kind,
      lineNumbers: [...pattern.lineNumbers],
      severity: pattern.severity,
      description: pattern.localizedDescription?.[locale] ?? pattern.localizedDescription?.en ?? pattern.description
    })),
    estimatedReviewSeconds
  };
};

const estimateReviewSeconds = (template: PullRequestTemplate): number => {
  const lineCount = template.files.reduce((total, file) => total + file.lines.length, 0);
  const bugFactor = template.bugPatterns.length > 0 ? 1.35 : 1;
  const baseSeconds = 15;
  const perLineSeconds = 1.2;
  const estimate = (baseSeconds + lineCount * perLineSeconds) * bugFactor;
  return Math.max(10, Math.round(estimate));
};
