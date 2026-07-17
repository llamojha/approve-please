export interface TemplateDiagnostic {
  file: string;
  message: string;
}

export interface TemplateRecord {
  file: string;
  language: string;
  template: unknown;
}

export interface PipelineResult {
  diagnostics: TemplateDiagnostic[];
  templates: TemplateRecord[];
}

export function readTemplates(dir: string): Promise<string[]>;
export function listLanguageFolders(root?: string): Promise<string[]>;
export function validateTemplate(
  template: unknown,
  file: string,
  diagnostics: TemplateDiagnostic[]
): void;
export function discoverAndValidateTemplates(
  languages: string[],
  root?: string
): Promise<PipelineResult>;
export function buildManifest(options?: {
  root?: string;
  reportOnly?: boolean;
  log?: ((message: string) => void) | null;
}): Promise<PipelineResult>;
