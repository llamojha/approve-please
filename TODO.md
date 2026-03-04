# Future Ideas

## 1. Framework Options

Add framework-specific PR templates (e.g., React, Next.js, Express, Django, Spring Boot) as selectable options alongside the current language preference.

## 2. Diff Context Lines

Add surrounding context to diffs—show lines before/after the changed code, not just the change itself. This enables new bug patterns like:

- Function defined outside its expected scope
- Missing imports that would be visible in context
- Variable used before declaration (visible with preceding lines)
- Orphaned code blocks (closing brace without opening)

### Implementation Notes

- Extend `files[].lines[]` to include `isContext: boolean` for unchanged surrounding lines
- Update `PRViewer` to render context lines with distinct styling (dimmed/gray)
- New bug types: `scope`, `import`, `declaration-order`
