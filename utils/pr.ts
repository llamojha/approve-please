import { PullRequest } from '../types';
import { PullRequestTemplate } from '../data/prs';
import { uniqueId } from './helpers';

export const instantiatePullRequest = (
  template: PullRequestTemplate,
  day: number,
  index: number
): PullRequest => {
  const estimatedReviewSeconds = estimateReviewSeconds(template);

  return {
    ...template,
    id: `${template.templateId}-d${day}-${index}-${uniqueId('pr')}`,
    templateId: template.templateId,
    files: template.files.map((file) => ({
      ...file,
      lines: file.lines.map((line) => ({ ...line }))
    })),
    bugPatterns: template.bugPatterns.map((pattern) => ({
      ...pattern,
      lineNumbers: [...pattern.lineNumbers]
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
