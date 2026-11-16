# Coworker portrait study brief

Status: the owner requested the full cast after reviewing the initial study. Expansion retains the warm editorial style and adds the remaining eight coworkers, each with neutral, pleased and concerned expressions.

Proposed treatment: warm editorial illustrations, crisp silhouettes, restrained textured shading and simple clothing. A shared camera height, bust crop, light direction and background treatment tie the cast together. Avoid logos, tiny props and exaggerated emotional stereotypes. The UI supplies borders/backgrounds rather than baking them into portraits.

First study: Lucía Navarro in a cobalt overshirt with short wavy hair and a geometric pin; Diego Martín in a rust sweater with round glasses and dark curls. Each needs neutral, pleased and concerned expressions with consistent facial identity, crop and clothing. Concern should be thoughtful, not humiliating. Before decisions always use neutral.

Thirty optimized 256×256 alpha PNGs are saved under `public/characters/studies/`, totaling 948,846 bytes. The largest is 33,757 bytes, below the 80 KB per-asset budget. Original generated masters are retained separately. Show at 32/48 px avatars and 160 px briefing size on light/dark. Reserve explicit dimensions to avoid layout shift. Missing/unknown identity uses initials and an accessible author name; decorative portraits can have empty alt when adjacent text names the person.

Used the imagegen skill and built-in image_gen tool. Record prompt, generation date/tool, output provenance, any supplied reference rights and final optimized dimensions/bytes in an asset manifest. These are original generated fictional characters, with no supplied third-party reference artwork or real-person likeness; no third-party license is asserted. Keep existing assets until the replacement is accepted.

## TODO

- [x] Produce the six-image Lucía/Diego expression study.
- [x] Verify crop consistency, 32/48 px avatars and 160 px study portraits in the rendered concept; light/dark and byte budgets checked.
- [x] Owner requested the remaining cast after reviewing the initial treatment.
- [x] Verify the full thirty-portrait set, source manifest, alpha and byte budgets.

Asset provenance and measured sizes: `public/characters/studies/manifest.json`. Prompt set: `docs/design-study/prompts.md`. The master files remain in the original Codex generated_images location; every application reference uses a committed project asset.
