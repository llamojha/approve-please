# Plan 008: Compress oversized public assets and fix the missing tutorial slide-6 image

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- public/ pages/index.tsx constants/i18n.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf / bug
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

Two small, user-visible problems. First, `public/` carries 4.6 MB of social-card PNGs (`social-card.png` 2.76 MB, `social-card-no-title.png` 1.87 MB); the OG image is fetched by every link unfurler (Slack, Twitter, Discord) and some truncate or skip images this large — 1200×630 OG images compress to well under 300 KB. Second, the landing-page tutorial defines **six** slides of copy in `constants/i18n.ts` (both locales) but `public/` contains only `tutorial-slide-1..5-placeholder.png`; `pages/index.tsx` hardcodes a sixth path (`/tutorial-slide-6-placeholder.png`) that 404s, so the last tutorial slide renders a broken image.

## Current state

- `public/` listing (relevant files): `social-card.png` (2,759,836 B), `social-card-no-title.png` (1,869,922 B), `tutorial-slide-1-placeholder.png` … `tutorial-slide-5-placeholder.png` (29–292 KB each). **No slide 6 file.**
- `pages/index.tsx:38–45`:
  ```ts
  const imageSrcs = [
    "/tutorial-slide-1-placeholder.png",
    ...
    "/tutorial-slide-6-placeholder.png",   // ← file does not exist
  ];
  ```
  and lines 47–54 map i18n slides to `imageSrc: imageSrcs[idx] ?? ""`.
- `constants/i18n.ts:124` (en) and `:382` (es) — `tutorialSlides` arrays with **6** entries each.
- `constants/siteMetadata.ts` — references `/social-card.png` (or similar) as `SITE_METADATA.image`; check which of the two social PNGs is actually referenced and whether the other is used at all (`grep -rn "social-card" --include='*.ts*' .`).
- The tutorial modal markup lives further down `pages/index.tsx`; find how `slide.imageSrc` is rendered (plain `<img>`) and whether an empty `imageSrc` is guarded.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Install   | `npm ci` | exit 0 |
| Compress (macOS, no new deps) | `sips -s format jpeg -s formatOptions 70 public/social-card.png --out /tmp/social-card.jpg` then compare; **or** `npx --yes sharp-cli resize 1200 630 --input public/social-card.png --output public/social-card.png --withoutEnlargement` | output file < 300 KB |
| Size check| `ls -l public/social-card.png` | < 300000 bytes |
| Build     | `npm run build` | exit 0 |

(If neither `sips` nor `npx sharp-cli` is available in your environment, STOP — do not hand-roll image code.)

## Scope

**In scope**:
- `public/social-card.png`, `public/social-card-no-title.png` (recompress in place, same dimensions ≥1200×630, same format or switch to JPEG with metadata update)
- `constants/siteMetadata.ts` (only if the image filename/extension changes)
- `pages/index.tsx` (the `imageSrcs` array and, if needed, an `imageSrc &&` render guard)
- `plans/README.md` (status row)

**Out of scope**:
- Writing new slide-6 artwork — executors don't produce art. The fix below reuses the guard/empty-string path.
- The tutorial slide copy in `constants/i18n.ts` — 6 slides of copy is intentional content; don't delete the 6th slide's text.
- Everything else in `public/` (favicons and slides 1–5 are reasonably sized).

## Git workflow

- Branch: `advisor/008-asset-tutorial-polish`
- Conventional commits, e.g. `perf(assets): compress social cards`, `fix(tutorial): stop referencing missing slide-6 image`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Compress the social cards

Recompress both PNGs (keep ≥1200×630). If converting to JPEG gives a much better size (likely for photographic gradients), name it `social-card.jpg`, update `constants/siteMetadata.ts`'s `image` field and any `og:image:type` implications (none set today), and delete the old PNG. If `social-card-no-title.png` has **no references** (grep first), delete it instead of compressing and say so in the commit message.

**Verify**: referenced social image file < 300 KB (`ls -l`); `grep -rn "social-card" --include='*.ts*' .` resolves only to files that exist; `npm run build` → exit 0.

### Step 2: Fix slide 6

In `pages/index.tsx`, change the `imageSrcs` array to list only the five files that exist (drop the slide-6 entry — the existing `?? ""` mapping then yields `""` for slide 6). Locate the modal's `<img src={slide.imageSrc} ...>` and guard it: render the image element only when `slide.imageSrc` is truthy, so slide 6 shows its text full-width instead of a broken image.

**Verify**: `npm run dev`, open the tutorial on the landing page, advance to slide 6 → text renders, no broken-image icon, no 404 in the network tab. Slides 1–5 still show images.

## Test plan

Manual only (visual assets): step 2's dev-server check in both locales (EN/ES toggle on the landing page).

## Done criteria

- [ ] Referenced social card < 300 KB; unreferenced one deleted or also < 300 KB
- [ ] `grep -n "tutorial-slide-6" pages/index.tsx` → no matches
- [ ] Tutorial slide 6 renders without a broken image (manual)
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` all exit 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- No lossless-ish compression path exists in the environment (no `sips`, no `npx sharp-cli`).
- The tutorial modal's rendering makes an imageless slide look broken (layout collapses) — that needs a small design call; report with a screenshot description.
- `siteMetadata` image handling is more entangled than a filename swap.

## Maintenance notes

- When real slide-6 art is added, drop the file into `public/` and re-add the array entry — the guard from step 2 keeps working.
- Consider (deferred): a CI check that every `imageSrcs`/`SITE_METADATA.image` path exists in `public/`.
