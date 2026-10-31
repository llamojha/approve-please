# Readability and adaptive audio

Goal: readable text in the refreshed desk, quiet instrumental music that accelerates as the weakest meter falls, and an audible/visible incoming-PR notification.

## Implementation
- [x] Replace 7–13 px supporting text with a 14 px minimum reading scale; use 16 px body/code/actions, rem units and comfortable line heights in styles/DesignStudy.module.css.
- [x] Check desktop/tablet/phone, 320 px reflow, doubled root text size, increased text spacing and light/dark text contrast.
- [x] Extend hooks/useAudioCue.ts with a bounded Web Audio music scheduler, separate music/notification controls, volume, explicit gesture unlock and cleanup. Keep existing cue functions.
- [x] Add utils/adaptiveAudio.ts and tests/adaptiveAudio.test.ts. Implement before testing, following the owner's no-TDD instruction.
- [x] Add constants/audioCopy.ts, shared AudioControls and PRArrivalNotice components/styles, and hooks/usePRArrivalNotice.ts with ID-based detection.
- [x] Integrate the same audio controls/arrival detection into pages/dev/design.tsx and components/screens/WorkScreen.tsx.
- [x] Browser-verify sound starts from an explicit gesture, mute/volume, faster tempo under pressure, fresh PR cue, unchanged selection behavior, and lifecycle cleanup.
- [x] Run targeted tests, typecheck, lint/build; refresh screenshots and update preview-targeted PR12.

## Defaults and boundary
Original procedural synth music, fixed pitches with rhythmic tempo from 72 to 144 BPM based on the lowest stability/velocity/satisfaction meter. Tension changes tempo rather than loudness. Separate music and notification toggles begin off; volume starts at 25%. No external audio downloads, dependencies or licensing assumptions. The visual new-PR notice is available with audio off. The actual game's queue/timer/scoring semantics remain intact; its existing sound hook is extended rather than changing the game loop.

## Risks and rollback
Browsers may block playback without a user gesture. Only report an enabled channel after resume succeeds, show a localized error, and support unsupported browsers. Stop scheduled notes/timers on unmount and pause hidden tabs. Detect new queue IDs rather than net queue length; selecting an existing PR must not chime. Revert the audio integration/engine as one coherent change if verification fails.

## Readability basis
The 14/16 px choices are product readability targets, not a WCAG minimum font size or a full accessibility certification. Check [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Text enlargement tests set the root font size to 200% in a real browser; constrained viewports test reflow. An OS/browser-zoom and full screen-reader audit remains future work.

Audio follows [Web Audio user-control guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) and [autoplay restrictions](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).


## Verified behavior
Separate music/notification channels begin off at 25% volume. The preview and existing WorkScreen share the engine. In the browser, no AudioContext exists before opt-in; user activation starts one running context. With falling meters the preview tempo increased from 91 to 118 BPM while pitches remained fixed. An analyser measured nonzero, unclipped output. The notification-only path schedules exactly two notes for a new queue ID; selecting an existing PR is silent. The visible notice and polite announcement work with audio off.

Keyboard volume,200% text in the audio dialog, unsupported-browser fallback and live-game controls were browser-checked. Eleven audio tests cover scheduling, independent mute/volume, failed unlock, cleanup, hidden tabs and rapid visibility transitions; three arrival tests cover same-length replacement, selection/reorder silence and distinct batch counts. Channel choices currently apply to the mounted review screen and reset off when it is recreated; persistence across shifts/reloads is a future preference improvement.

Final validation: 524 tests pass with one worker; typecheck/build pass; 390 templates validate with no generated manifest changes. Lint has zero errors and five existing warnings. Screenshots include audio-settings.png and pr-arrival.png as well as the updated readable desk/team/mobile/tablet views.
