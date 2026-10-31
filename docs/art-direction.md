# Coworker portrait study brief

Status: Phase 1 art study produced and verified in the rendered desk/team views. Owner visual acceptance remains pending before expanding the cast.

Proposed treatment: warm editorial illustrations, crisp silhouettes, restrained textured shading and simple clothing. A shared camera height, bust crop, light direction and background treatment tie the cast together. Avoid logos, tiny props and exaggerated emotional stereotypes. The UI supplies borders/backgrounds rather than baking them into portraits.

First study: Lucía Navarro in a cobalt overshirt with short wavy hair and a geometric pin; Diego Martín in a rust sweater with round glasses and dark curls. Each needs neutral, pleased and concerned expressions with consistent facial identity, crop and clothing. Concern should be thoughtful, not humiliating. Before decisions always use neutral.

Built-in generation returned 1254×1254 transparent masters. Six optimized 256×256 alpha PNGs are saved under `public/characters/studies/`, each 31–33 KB, below the 80 KB budget. Show at 32/48 px avatars and 160 px briefing size on light/dark. Reserve explicit dimensions to avoid layout shift. Missing/unknown identity uses initials and an accessible author name; decorative portraits can have empty alt when adjacent text names the person.

Used the imagegen skill and built-in image_gen tool. Record prompt, generation date/tool, output provenance, any supplied reference rights and final optimized dimensions/bytes in an asset manifest. These are original generated fictional characters, with no supplied third-party reference artwork or real-person likeness; no third-party license is asserted. Keep existing assets until the replacement is accepted.

## TODO

- [x] Produce the six-image Lucía/Diego expression study.
- [x] Verify crop consistency, 32/48 px avatars and 160 px study portraits in the rendered concept; light/dark and byte budgets checked.
- [ ] Owner reviews this concrete treatment before the remaining cast is produced.

Asset provenance and measured sizes: `public/characters/studies/manifest.json`. Prompt set: `docs/design-study/prompts.md`. The master files remain in the original Codex generated_images location; every application reference uses a committed project asset.
