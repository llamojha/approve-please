# Approve Please brand mark

Approved direction: **A — Review flow**. The branch and check represent reviewing and merging a pull request. Preserve the existing wordmark typography.

The canonical artwork is `public/brand-mark.svg`, using a lavender tile (#b9a7ff) and dark ink (#20172e). Its colours remain consistent in light and dark themes. `components/common/BrandMark.tsx` renders the same asset in landing, game and design-preview headers; the decorative mark is hidden from assistive technology because the adjacent wordmark names the product.

Derived assets: `favicon.svg` (same artwork), `favicon.png` (32 px), `favicon.ico` (16/32/48 px), `apple-touch-icon.png` (180 px), `icon-192.png` (192 px), `icon-512.png` (512 px). Re-export these whenever the canonical artwork changes. Keep transparency outside the rounded tile.

## Rollout

- [x] Select review-flow direction.
- [x] Apply to shared header mark and browser/app icons.
- [ ] Optional future work: refresh social-card artwork when the trailer and social campaign are finalized.
