# Desk readability review — 31 October 2026

The previous preview used 7–13 px text for several meter labels, roles, filenames, controls and code. The refreshed scale uses relative rem units and does not shrink on phones.

| Content | Default size |
| --- | --- |
| Code, body copy, action buttons, navigation, team quotes, handbook | 16 px |
| Supporting labels, author roles, line numbers, expression captions | 14 px |
| Review title | 24–26 px |
| Interactive controls | At least 44 px high |
| Selectable code rows | At least 32 px high |

Body copy uses a 1.5 line height; code uses 28 px line boxes with padding. The diff keeps whitespace and scrolls horizontally within its own region. Text, labels and controls outside the diff reflow. Phone action labels can wrap instead of shrinking. On enlarged text, the page can grow vertically rather than clipping content. Theme changes update foreground/background together to avoid a transient low-contrast flash.

## Browser checks

- Desktop 1280×720, tablet 768×1024, phone 390×844, narrow 320×740, and constrained 640×360.
- Computed text sizes: minimum 14 px at default settings; minimum 28 px when the root font is doubled. Code/action labels scale from 16 to 32 px.
- No document horizontal overflow at the tested sizes. Code is independently scrollable.
- Doubled text checked on the desk, the full team gallery, and audio settings, including320 px width. These are real-browser CSS text-enlargement tests, not an OS/browser-zoom audit.
- Increased text spacing: line height 1.5, letter spacing 0.12em, word spacing 0.16em and paragraph spacing 2em. Desk controls remain reachable at desktop,390 px and 320 px widths.
- Normal-state text contrast measured from rendered foreground/background colors: minimum 5.177:1 in light and 5.774:1 in dark, excluding decorative art/glyphs. These exceed the 4.5:1 normal-text target in the tested desk states.
- Spanish phone approve/reject and keyboard line tagging still advance correctly. Dialogs retain Escape/focus-return behavior.
- Updated desktop light/dark, phone, tablet and team screenshots are in docs/design-study/.

The 14/16 px scale is a readability choice, not a WCAG minimum font size or complete accessibility certification. Full screen-reader, OS/browser-zoom, forced-colors and observed low-vision usability checks remain future work.

References: [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
