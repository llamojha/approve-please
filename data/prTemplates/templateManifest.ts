// Auto-generated manifest of pull-request templates
// Aggregates the per-language packs in this folder: the generic pack is
// imported eagerly (the day-1 tutorial PRs live there and must exist before
// the first wave at minute 0); every other pack is lazy-loaded on demand.
import type { PullRequestTemplate } from '../../types';
import genericTemplates from './manifest.generic';

export const eagerTemplates: PullRequestTemplate[] = genericTemplates;

export const templateLoaders: Record<string, () => Promise<PullRequestTemplate[]>> = {
  css: () => import('./manifest.css').then((m) => m.default),
  java: () => import('./manifest.java').then((m) => m.default),
  javascript: () => import('./manifest.javascript').then((m) => m.default),
  python: () => import('./manifest.python').then((m) => m.default),
  rust: () => import('./manifest.rust').then((m) => m.default),
  typescript: () => import('./manifest.typescript').then((m) => m.default),
};
