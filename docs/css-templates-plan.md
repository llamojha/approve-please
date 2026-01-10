# CSS PR Templates Plan - 50 New Templates

## Overview
Plan for 50 new CSS PR templates to improve game variety and challenge.

## Bug Categories Distribution
- Logic (syntax errors, typos): 15 templates
- Performance: 10 templates  
- Style (maintainability): 10 templates
- Accessibility: 10 templates
- Clean PRs (no bugs): 5 templates

---

## Logic Bugs (15)

### Missing Units
1. `css-051-missing-px-width` - `width: 100` instead of `width: 100px`
2. `css-052-missing-px-margin` - `margin: 20` instead of `margin: 20px`
3. `css-053-missing-px-padding` - `padding-left: 15` missing unit
4. `css-054-missing-em-font` - `font-size: 1.5` missing em/rem

### Property Typos
5. `css-055-typo-backgroud` - `backgroud-color` typo
6. `css-056-typo-font-wieght` - `font-wieght` typo
7. `css-057-typo-trasition` - `trasition` typo
8. `css-058-typo-postion` - `postion: absolute` typo

### Invalid Values
9. `css-059-invalid-display-flexbox` - `display: flexbox` (should be `flex`)
10. `css-060-invalid-position-centre` - `text-align: centre` (should be `center`)
11. `css-061-invalid-color-format` - `color: #GGG` invalid hex
12. `css-062-invalid-flex-direction` - `flex-direction: columns` (should be `column`)

### Syntax Errors
13. `css-063-missing-semicolon` - Missing semicolon in multi-property rule
14. `css-064-missing-colon` - `color red` missing colon
15. `css-065-unclosed-brace` - Unclosed curly brace in nested rule

---

## Performance Bugs (10)

16. `css-066-expensive-box-shadow` - Multiple heavy box-shadows on hover
17. `css-067-will-change-abuse` - `will-change: all` on many elements
18. `css-068-filter-on-scroll` - Heavy filter effects on scrollable content
19. `css-069-large-border-radius` - Excessive border-radius causing repaints
20. `css-070-animation-all-properties` - Animating layout properties (width/height)
21. `css-071-deep-selector-nesting` - `.a .b .c .d .e .f` overly specific selector
22. `css-072-redundant-resets` - Resetting properties that inherit naturally
23. `css-073-expensive-gradient` - Complex gradient recalculated on resize
24. `css-074-transform-origin-repaint` - Changing transform-origin during animation
25. `css-075-contain-none` - Missing `contain` property on isolated components

---

## Style/Maintainability Bugs (10)

26. `css-076-magic-number-spacing` - `margin-top: 37px` unexplained value
27. `css-077-hardcoded-colors` - Inline colors instead of variables
28. `css-078-duplicate-properties` - Same property declared twice
29. `css-079-vendor-prefix-only` - Only `-webkit-` without standard property
30. `css-080-commented-code-block` - Large commented-out CSS block
31. `css-081-todo-in-production` - `/* TODO: fix this hack */`
32. `css-082-overly-specific-id` - `#header #nav #menu .item` over-specificity
33. `css-083-inline-style-override` - Using `!important` to fight inline styles
34. `css-084-inconsistent-units` - Mixing px, em, rem inconsistently
35. `css-085-empty-ruleset` - `.class { }` empty rule

---

## Accessibility Bugs (10)

36. `css-086-hidden-focus-ring` - `:focus { outline: 0; box-shadow: none; }`
37. `css-087-tiny-tap-target` - Button with `width: 20px; height: 20px`
38. `css-088-text-too-small` - `font-size: 10px` below readable threshold
39. `css-089-low-contrast-link` - Link color too similar to text
40. `css-090-motion-no-reduce` - Animation without `prefers-reduced-motion`
41. `css-091-hidden-overflow-text` - `overflow: hidden` cutting off text
42. `css-092-fixed-font-size` - Using px for all fonts (no scaling)
43. `css-093-color-only-indicator` - Error state using only color change
44. `css-094-invisible-focus` - Focus style same as unfocused state
45. `css-095-line-height-cramped` - `line-height: 1` on body text

---

## Clean PRs (5)

46. `css-096-clean-button-variant` - Well-structured button styles
47. `css-097-clean-card-component` - Proper card with good spacing
48. `css-098-clean-responsive-grid` - Correct responsive grid implementation
49. `css-099-clean-dark-mode` - Proper dark mode with CSS variables
50. `css-100-clean-animation` - Well-optimized keyframe animation

---

## Implementation Notes

### Difficulty Levels
- **Easy** (Day 1-2): Obvious typos, missing units
- **Medium** (Day 3-4): Performance issues, style problems
- **Hard** (Day 5+): Subtle accessibility issues, complex performance bugs

### Template Structure
Each template should include:
- Realistic file path (e.g., `styles/components/button.css`)
- 8-15 lines of code (enough context, not overwhelming)
- Clear bug description with educational value
- Spanish localization for title/description

### Subtle Bug Patterns
To increase challenge, some bugs should be:
- Buried in otherwise correct code
- Require understanding CSS specificity
- Need knowledge of browser rendering
- Involve understanding accessibility guidelines

---

## Future Improvements

### Realistic Diffs with `isNew: false`
Currently all PR templates show only new additions (`isNew: true`). Real PRs often modify existing code.

**TODO**: Implement support for `isNew: false` lines to show:
- Removed lines (red/strikethrough in diff view)
- Context lines (unchanged code around changes)
- Modified lines (old line removed, new line added)

This would make diffs more realistic and challenging, as bugs could be:
- Introduced by changing existing correct code
- Hidden among legitimate refactoring
- Caused by removing important lines

Example template structure:
```json
{
  "lines": [
    { "lineNumber": 1, "content": ".button {", "isNew": false },
    { "lineNumber": 2, "content": "  padding: 10px;", "isNew": false },
    { "lineNumber": 3, "content": "  color: blue;", "isNew": false, "isRemoved": true },
    { "lineNumber": 3, "content": "  color: #0000ff;", "isNew": true },
    { "lineNumber": 4, "content": "}", "isNew": false }
  ]
}
```
