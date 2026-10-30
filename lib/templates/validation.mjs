const BUG_KINDS = new Set(['logic', 'security', 'performance', 'style', 'accessibility']);
const SEVERITIES = new Set(['minor', 'major', 'critical']);
const IMPORTANCE = new Set(['low', 'normal', 'high']);
const LOCALES = new Set(['en', 'es']);

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const validateString = (value, field, diagnostics) => {
  if (typeof value[field] !== 'string') {
    diagnostics.push({ path: `${field}`, code: 'invalid_type', message: `${field} must be a string.` });
    return false;
  }
  return true;
};

const validateStringArray = (value, field, diagnostics) => {
  if (!Array.isArray(value[field])) {
    diagnostics.push({ path: `${field}`, code: 'invalid_type', message: `${field} must be an array.` });
    return false;
  }

  value[field].forEach((item, index) => {
    if (typeof item !== 'string') {
      diagnostics.push({ path: `${field}[${index}]`, code: 'invalid_type', message: `${field}[${index}] must be a string.` });
    }
  });
  return true;
};

const validateLocalized = (localized, diagnostics) => {
  if (localized === undefined) {
    return;
  }
  if (!isObject(localized)) {
    diagnostics.push({ path: 'localized', code: 'invalid_type', message: 'localized must be an object.' });
    return;
  }

  Object.entries(localized).forEach(([locale, metadata]) => {
    if (!LOCALES.has(locale)) {
      diagnostics.push({ path: `localized.${locale}`, code: 'unsupported_locale', message: `localized.${locale} is not supported; use en or es.` });
    }
    if (!isObject(metadata)) {
      diagnostics.push({ path: `localized.${locale}`, code: 'invalid_type', message: `localized.${locale} must be an object.` });
      return;
    }
    ['title', 'author', 'description'].forEach((field) => {
      if (metadata[field] !== undefined && typeof metadata[field] !== 'string') {
        diagnostics.push({ path: `localized.${locale}.${field}`, code: 'invalid_type', message: `localized.${locale}.${field} must be a string.` });
      }
    });
    if (metadata.tags !== undefined) {
      if (!Array.isArray(metadata.tags)) {
        diagnostics.push({ path: `localized.${locale}.tags`, code: 'invalid_type', message: `localized.${locale}.tags must be an array.` });
      } else {
        metadata.tags.forEach((tag, index) => {
          if (typeof tag !== 'string') {
            diagnostics.push({ path: `localized.${locale}.tags[${index}]`, code: 'invalid_type', message: `localized.${locale}.tags[${index}] must be a string.` });
          }
        });
      }
    }
  });
};

const validateContent = (template, diagnostics) => {
  if (!isObject(template)) {
    diagnostics.push({ path: '$', code: 'invalid_type', message: 'Template root must be an object.' });
    return;
  }

  validateString(template, 'templateId', diagnostics);
  ['title', 'author', 'description'].forEach((field) => validateString(template, field, diagnostics));
  validateStringArray(template, 'tags', diagnostics);
  validateLocalized(template.localized, diagnostics);

  if (typeof template.importance !== 'string') {
    diagnostics.push({ path: 'importance', code: 'invalid_type', message: 'importance must be a string.' });
  } else if (!IMPORTANCE.has(template.importance)) {
    diagnostics.push({ path: 'importance', code: 'invalid_enum', message: `importance must be one of: ${[...IMPORTANCE].join(', ')}.` });
  }

  const allLineNumbers = new Set();
  const newLineNumbers = new Set();
  if (!Array.isArray(template.files)) {
    diagnostics.push({ path: 'files', code: 'invalid_type', message: 'files must be an array.' });
  } else if (template.files.length === 0) {
    diagnostics.push({ path: 'files', code: 'empty_array', message: 'files must not be empty.' });
  } else {
    template.files.forEach((diff, fileIndex) => {
      const prefix = `files[${fileIndex}]`;
      if (!isObject(diff)) {
        diagnostics.push({ path: `${prefix}`, code: 'invalid_type', message: `${prefix} must be an object.` });
        return;
      }
      if (typeof diff.filename !== 'string') {
        diagnostics.push({ path: `${prefix}.filename`, code: 'invalid_type', message: `${prefix}.filename must be a string.` });
      }
      if (typeof diff.language !== 'string') {
        diagnostics.push({ path: `${prefix}.language`, code: 'invalid_type', message: `${prefix}.language must be a string.` });
      }
      if (!Array.isArray(diff.lines)) {
        diagnostics.push({ path: `${prefix}.lines`, code: 'invalid_type', message: `${prefix}.lines must be an array.` });
        return;
      }
      if (diff.lines.length === 0) {
        diagnostics.push({ path: `${prefix}.lines`, code: 'empty_array', message: `${prefix}.lines must not be empty.` });
      }
      diff.lines.forEach((line, lineIndex) => {
        const linePrefix = `${prefix}.lines[${lineIndex}]`;
        if (!isObject(line)) {
          diagnostics.push({ path: `${linePrefix}`, code: 'invalid_type', message: `${linePrefix} must be an object.` });
          return;
        }
        const validNumber = Number.isInteger(line.lineNumber) && line.lineNumber >= 1;
        if (!validNumber) {
          diagnostics.push({ path: `${linePrefix}.lineNumber`, code: 'invalid_line_number', message: `${linePrefix}.lineNumber must be an integer of at least 1.` });
        } else {
          allLineNumbers.add(line.lineNumber);
          if (line.isNew === true) {
            newLineNumbers.add(line.lineNumber);
          }
        }
        if (typeof line.content !== 'string') {
          diagnostics.push({ path: `${linePrefix}.content`, code: 'invalid_type', message: `${linePrefix}.content must be a string.` });
        }
        if (typeof line.isNew !== 'boolean') {
          diagnostics.push({ path: `${linePrefix}.isNew`, code: 'invalid_type', message: `${linePrefix}.isNew must be a boolean.` });
        }
      });
    });
  }

  if (!Array.isArray(template.bugPatterns)) {
    diagnostics.push({ path: 'bugPatterns', code: 'invalid_type', message: 'bugPatterns must be an array.' });
    return;
  }

  template.bugPatterns.forEach((bug, bugIndex) => {
    const prefix = `bugPatterns[${bugIndex}]`;
    if (!isObject(bug)) {
      diagnostics.push({ path: `${prefix}`, code: 'invalid_type', message: `${prefix} must be an object.` });
      return;
    }
    if (typeof bug.kind !== 'string') {
      diagnostics.push({ path: `${prefix}.kind`, code: 'invalid_type', message: `${prefix}.kind must be a string.` });
    } else if (!BUG_KINDS.has(bug.kind)) {
      diagnostics.push({ path: `${prefix}.kind`, code: 'invalid_enum', message: `${prefix}.kind must be one of: ${[...BUG_KINDS].join(', ')}.` });
    }
    if (typeof bug.severity !== 'string') {
      diagnostics.push({ path: `${prefix}.severity`, code: 'invalid_type', message: `${prefix}.severity must be a string.` });
    } else if (!SEVERITIES.has(bug.severity)) {
      diagnostics.push({ path: `${prefix}.severity`, code: 'invalid_enum', message: `${prefix}.severity must be one of: ${[...SEVERITIES].join(', ')}.` });
    }
    if (bug.description !== undefined && typeof bug.description !== 'string') {
      diagnostics.push({ path: `${prefix}.description`, code: 'invalid_type', message: `${prefix}.description must be a string.` });
    }
    if (bug.localizedDescription !== undefined) {
      if (!isObject(bug.localizedDescription)) {
        diagnostics.push({ path: `${prefix}.localizedDescription`, code: 'invalid_type', message: `${prefix}.localizedDescription must be an object.` });
      } else {
        Object.entries(bug.localizedDescription).forEach(([locale, description]) => {
          if (!LOCALES.has(locale)) {
            diagnostics.push({ path: `${prefix}.localizedDescription.${locale}`, code: 'unsupported_locale', message: `${prefix}.localizedDescription.${locale} is not supported; use en or es.` });
          }
          if (typeof description !== 'string') {
            diagnostics.push({ path: `${prefix}.localizedDescription.${locale}`, code: 'invalid_type', message: `${prefix}.localizedDescription.${locale} must be a string.` });
          }
        });
      }
    }
    if (!Array.isArray(bug.lineNumbers)) {
      diagnostics.push({ path: `${prefix}.lineNumbers`, code: 'invalid_type', message: `${prefix}.lineNumbers must be an array.` });
      return;
    }
    if (bug.lineNumbers.length === 0) {
      diagnostics.push({ path: `${prefix}.lineNumbers`, code: 'empty_array', message: `${prefix}.lineNumbers must not be empty.` });
    }
    bug.lineNumbers.forEach((lineNumber, lineIndex) => {
      const linePrefix = `${prefix}.lineNumbers[${lineIndex}]`;
      if (!Number.isInteger(lineNumber) || lineNumber < 1) {
        diagnostics.push({ path: `${linePrefix}`, code: 'invalid_line_number', message: `${linePrefix} must be an integer of at least 1.` });
      } else if (!allLineNumbers.has(lineNumber)) {
        diagnostics.push({ path: `${linePrefix}`, code: 'missing_line', message: `${linePrefix} references missing line ${lineNumber}.` });
      } else if (!newLineNumbers.has(lineNumber)) {
        diagnostics.push({ path: `${linePrefix}`, code: 'unchanged_line', message: `${linePrefix} references unchanged line ${lineNumber}; bug lines must be new.` });
      }
    });
  });
};

// Optional identity fields are validated without resolving any filesystem paths.
const validateIdentities = (template, diagnostics) => {
  if (!isObject(template)) return;
  const issue = (path, code, message) => diagnostics.push({ path, code, message });
  const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
  if (template.authorId !== undefined && !nonempty(template.authorId)) {
    issue('authorId', 'invalid_identity', 'authorId must be a nonempty string.');
  }
  if (template.reactions !== undefined) {
    if (!isObject(template.reactions)) {
      issue('reactions', 'invalid_type', 'reactions must be an object.');
    } else {
      const outcomes = new Set(['clean-approval', 'buggy-approval', 'correct-rejection', 'false-positive']);
      Object.entries(template.reactions).forEach(([outcome, translations]) => {
        const field = `reactions.${outcome}`;
        if (!outcomes.has(outcome)) issue(field, 'invalid_enum', `${field} is not a supported outcome.`);
        if (!isObject(translations)) {
          issue(field, 'invalid_type', `${field} must be an object.`);
          return;
        }
        Object.entries(translations).forEach(([locale, text]) => {
          if (!LOCALES.has(locale)) issue(`${field}.${locale}`, 'unsupported_locale', `${field}.${locale} is not supported; use en or es.`);
          if (typeof text !== 'string') issue(`${field}.${locale}`, 'invalid_type', `${field}.${locale} must be a string.`);
        });
      });
    }
  }
  const files = new Map();
  const numbered = new Map();
  if (Array.isArray(template.files)) template.files.forEach((file, fileIndex) => {
    if (!isObject(file)) return;
    const field = `files[${fileIndex}]`;
    if (typeof file.filename === 'string' && !nonempty(file.filename)) issue(`${field}.filename`, 'invalid_identity', `${field}.filename must be nonempty.`);
    if (files.has(file.filename)) issue(`${field}.filename`, 'duplicate_identity', `${field}.filename duplicates another file.`);
    const rows = new Map();
    const fileNumbers = new Set();
    files.set(file.filename, rows);
    if (!Array.isArray(file.lines)) return;
    file.lines.forEach((line, index) => {
      if (!isObject(line)) return;
      const rowField = `${field}.lines[${index}]`;
      if (fileNumbers.has(line.lineNumber)) issue(`${rowField}.lineNumber`, 'duplicate_identity', `${rowField}.lineNumber duplicates another row in this file; the live viewer requires unique line numbers.`);
      fileNumbers.add(line.lineNumber);
      const rowId = line.rowId ?? `line-${line.lineNumber}`;
      if (line.rowId !== undefined && !nonempty(line.rowId)) issue(`${rowField}.rowId`, 'invalid_identity', `${rowField}.rowId must be a nonempty string.`);
      if (rows.has(rowId)) issue(`${rowField}.rowId`, 'duplicate_identity', `${rowField}.rowId duplicates another row in this file.`);
      rows.set(rowId, line);
      const matches = numbered.get(line.lineNumber) ?? [];
      matches.push(line);
      numbered.set(line.lineNumber, matches);
      if (line.kind !== undefined) {
        if (line.kind !== 'addition' && line.kind !== 'context') issue(`${rowField}.kind`, 'invalid_enum', `${rowField}.kind must be addition or context; removal is not supported yet.`);
        else if ((line.kind === 'addition') !== line.isNew) issue(`${rowField}.kind`, 'inconsistent_kind', `${rowField}.kind must agree with isNew.`);
      }
    });
  });
  if (!Array.isArray(template.bugPatterns)) return;
  template.bugPatterns.forEach((bug, index) => {
    if (!isObject(bug)) return;
    const field = `bugPatterns[${index}]`;
    // The live game still selects by number. Keep catalog content safe until its migration.
    if (Array.isArray(bug.lineNumbers)) bug.lineNumbers.forEach((number, i) => {
      if ((numbered.get(number)?.length ?? 0) > 1) issue(`${field}.lineNumbers[${i}]`, 'ambiguous_line', `${field}.lineNumbers[${i}] matches multiple rows; catalog annotations must remain unambiguous until the live viewer uses file/row references.`);
    });
    if (bug.lineRefs === undefined) return;
    if (!Array.isArray(bug.lineRefs)) {
      issue(`${field}.lineRefs`, 'invalid_type', `${field}.lineRefs must be an array.`);
      return;
    }
    if (bug.lineRefs.length === 0) issue(`${field}.lineRefs`, 'empty_array', `${field}.lineRefs must not be empty.`);
    const projected = [];
    const seen = new Set();
    bug.lineRefs.forEach((ref, refIndex) => {
      const refField = `${field}.lineRefs[${refIndex}]`;
      if (!isObject(ref)) {
        issue(refField, 'invalid_type', `${refField} must be an object.`);
        return;
      }
      ['filename', 'rowId'].forEach((key) => {
        if (!nonempty(ref[key])) issue(`${refField}.${key}`, 'invalid_identity', `${refField}.${key} must be a nonempty string.`);
      });
      const key = JSON.stringify([ref.filename, ref.rowId]);
      if (seen.has(key)) issue(refField, 'duplicate_identity', `${refField} duplicates another reference.`);
      seen.add(key);
      const row = files.get(ref.filename)?.get(ref.rowId);
      if (!row) issue(refField, 'missing_line', `${refField} references a missing file or row.`);
      else {
        projected.push(row.lineNumber);
        if (row.isNew !== true) issue(refField, 'unchanged_line', `${refField} references unchanged code; bug lines must be new.`);
      }
    });
    if (Array.isArray(bug.lineNumbers)) {
      const actual = [...new Set(projected)].sort((a, b) => a - b);
      const legacy = [...new Set(bug.lineNumbers)].sort((a, b) => a - b);
      if (JSON.stringify(actual) !== JSON.stringify(legacy)) issue(`${field}.lineNumbers`, 'inconsistent_projection', `${field}.lineNumbers must match the line numbers referenced by lineRefs.`);
    }
  });
};

/** Validate JSON content only. Folder names and catalog-wide IDs belong to the caller. */
export const validateTemplate = (template) => {
  const diagnostics = [];
  validateContent(template, diagnostics);
  validateIdentities(template, diagnostics);
  return diagnostics;
};
