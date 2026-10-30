export type TemplateValidationCode =
  | 'invalid_type'
  | 'invalid_enum'
  | 'empty_array'
  | 'invalid_line_number'
  | 'unsupported_locale'
  | 'missing_line'
  | 'unchanged_line'
  | 'invalid_identity'
  | 'duplicate_identity'
  | 'inconsistent_kind'
  | 'ambiguous_line'
  | 'inconsistent_projection';

export interface TemplateDiagnostic {
  /** Field path in the JSON document, with $ identifying the root. */
  path: string;
  code: TemplateValidationCode;
  message: string;
}

/** Content checks only; does not check folder names or repository-wide uniqueness. */
export function validateTemplate(template: unknown): TemplateDiagnostic[];
