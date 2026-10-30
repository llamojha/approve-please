# Coworker portrait study brief

Status: specifications only; raster generation and in-context approval are pending. No generated artwork is represented as complete.

Proposed treatment: warm editorial illustrations, crisp silhouettes, restrained textured shading and simple clothing. A shared camera height, bust crop, light direction and background treatment tie the cast together. Avoid logos, tiny props and exaggerated emotional stereotypes. The UI supplies borders/backgrounds rather than baking them into portraits.

First study: Lucía Navarro in a cobalt overshirt with short wavy hair and a geometric pin; Diego Martín in a rust sweater with round glasses and dark curls. Each needs neutral, pleased and concerned expressions with consistent facial identity, crop and clothing. Concern should be thoughtful, not humiliating. Before decisions always use neutral.

Generate masters at 1024×1024 with transparent backgrounds, then export optimized 256×256 portraits, targeting at most 80 KB each. Treat this as a budget to verify, not a promise of generated size. Show at 32/48 px avatars and 160 px briefing size on light/dark. Reserve explicit dimensions to avoid layout shift. Missing/unknown identity uses initials and an accessible author name; decorative portraits can have empty alt when adjacent text names the person.

Use the imagegen skill when generation starts. Record prompt, generation date/tool, output provenance, any supplied reference rights and final optimized dimensions/bytes in an asset manifest. No production artwork or asset license has been chosen yet. Keep existing assets until the replacement is accepted.

## TODO

- [ ] Produce the six-image Lucía/Diego expression study.
- [ ] Verify recognizability, crop consistency, contrast and bytes in the actual desk.
- [ ] Owner reviews this concrete treatment before the remaining cast is produced.
