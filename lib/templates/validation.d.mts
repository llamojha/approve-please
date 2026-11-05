export interface TemplateDiagnostic {
  path: string;
  code: string;
  message: string;
}

export function validateTemplate(template: unknown): TemplateDiagnostic[];
