import templateManifest from './prTemplates/templateManifest';
import type { PullRequestTemplate } from '../types';

export type { PullRequestTemplate };

export const prTemplates: PullRequestTemplate[] = templateManifest as PullRequestTemplate[];
