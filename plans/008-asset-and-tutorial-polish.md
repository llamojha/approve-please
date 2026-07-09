# Plan 008: Compress oversized social-card assets

> **Correction (2026-07-09)**: this plan originally also claimed
> `public/tutorial-slide-6-placeholder.png` was missing and had `pages/index.tsx`
> drop its reference. That claim was wrong — the file exists (164 KB, added in
> commit `18f2cb2`, present at the audit commit `93d5370`) and slide 6 renders
> fine. The slide-6 step was removed; only the social-card compression remains.

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- public/ pages/index.tsx constants/siteMetadata.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

`public/` carries 4.6 MB of social-card PNGs (`social-card.png` 2.76 MB, `social-card-no-title.png` 1.87 MB); the OG image is fetched by every link unfurler (Slack, Twitter, Discord) and some truncate or skip images this large — 1200×630 OG images compress to well under 300 KB.

## Current state

- `public/` listing (relevant files): `social-card.png` (2,759,836 B), `social-card-no-title.png` (1,869,922 B). Tutorial slides 1–6 all exist and are reasonably sized (29–292 KB) — leave them alone.
- `constants/siteMetadata.ts:23` — `image: '/social-card.png'` (the OG image).
- `pages/index.tsx:335` — `social-card-no-title.png` is referenced as a CSS `url()` inside the landing page's `<style jsx>` block, so it is **in use**; compress it, don't delete it. If you rename it (e.g. to `.jpg`), this reference must be updated too.

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
- `constants/siteMetadata.ts` (only if `social-card.png`'s filename/extension changes)
- `pages/index.tsx` (only the `url()` reference at line 335, and only if `social-card-no-title.png`'s filename/extension changes)
- `plans/README.md` (status row)

**Out of scope**:
- The tutorial slide images and copy — all six slides exist and work (see Correction note above).
- Everything else in `public/` (favicons and tutorial slides are reasonably sized).

## Git workflow

- Branch: `advisor/008-asset-tutorial-polish`
- Conventional commits, e.g. `perf(assets): compress social cards`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Compress the social cards

Recompress both PNGs (keep ≥1200×630). If converting to JPEG gives a much better size (likely for photographic gradients), rename accordingly (`social-card.jpg`), update `constants/siteMetadata.ts`'s `image` field and any `og:image:type` implications (none set today), delete the old PNG — and do the same for the `url()` reference at `pages/index.tsx:335` if `social-card-no-title.png` is renamed. Both files are referenced (grep confirms: `siteMetadata.ts` and `pages/index.tsx:335`), so compress both; delete neither.

**Verify**: both social image files < 300 KB (`ls -l`); `grep -rn "social-card" --include='*.ts*' .` resolves only to files that exist; `npm run build` → exit 0. Manual: `npm run dev`, landing page hero background (the no-title card) still renders.

## Test plan

Manual only (visual assets): the landing-page background check above, plus validating the OG image with a local `curl -sI localhost:3000/social-card.png` (or the renamed file) → 200 with the new smaller `Content-Length`.

## Done criteria

- [ ] Both social cards < 300 KB
- [ ] `grep -rn "social-card" --include='*.ts*' .` resolves only to files that exist
- [ ] Landing page background still renders (manual)
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` all exit 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- No lossless-ish compression path exists in the environment (no `sips`, no `npx sharp-cli`).
- `siteMetadata` image handling is more entangled than a filename swap.

## Maintenance notes

- Consider (deferred): a CI check that every `imageSrcs`/`SITE_METADATA.image` path exists in `public/`.
