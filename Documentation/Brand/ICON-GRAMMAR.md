---
title: The icon grammar
category: Brand
kind: living-record
date: 2026-10-25
status: active
registry: Documentation/Brand/ICON-GRAMMAR.md
index: Documentation/INDEX.md
statuses:
    - name: the reference sheet measured and catalogued
      state: implemented
      evidence: Temporary/Icon-Reference/Analysis.json + Contact-Sheet.png
    - name: the component vocabulary and composition rules
      state: implemented
      evidence: sections 3 and 4 of this file
    - name: the generator contract (feature -> gate -> geometry -> seed)
      state: implemented
      evidence: Maintain/Icon/ + Maintain/Generate-Icons.mjs
---

# ICON-GRAMMAR.md - the family's generated icon language

One icon per package, generated from the package's own functionality. The reference sheet
(`Temporary/Icon-Reference/Reference.jpg`, 29 motifs) is the visual source: this file measures it,
extracts its component vocabulary, and maps that vocabulary onto the two release trees and the four
package kinds.

Nothing here is drawn by hand. Every icon is a pure function of a genome (the package's identity +
features + changelog digest), so a package change regenerates its icon and the same package content
always regenerates the same bytes.

## 1. The sheet, measured

The sheet is a 6 x 5 lattice of 29 motifs on cream paper (the last row carries four). Measurements
come from `Temporary/Icon-Reference/Analyze.py`, which writes `Analysis.json` and the labelled
`Contact-Sheet.png`.

| Fact                 | Measured value                                                  |
| -------------------- | --------------------------------------------------------------- |
| Canvas               | 730 x 975 px, portrait                                          |
| Paper                | #F8F8E8 (warm cream), visible fibre texture, no vignette        |
| Lattice              | 5 columns x 6 rows, 137 px pitch, 29 occupied slots             |
| Motif box            | 100-125 px (0.73-0.91 of the pitch), always centred             |
| Whitespace           | 25-40 px between boxes; no frames, captions, or rules           |
| Stroke               | uniform 1.5-3 px at this scale; no gradient, shadow, or texture |
| Ink share of the box | 0.07-0.41 (median 0.21): line-first, the paper shows through    |
| Radial mass          | peaks in bands 2-3 (mid radius); the rim band is nearly empty   |
| Ink colour           | near-black, always tinted: navy, maroon, brown, green, purple   |
| Accent               | one hue per motif, as ink or as a light tint fill               |
| Mirror axes          | present in every motif that was checked by hand                 |

The radial profile matters: the motifs breathe at the edge. A generated icon that fills its outer
band stops reading as one of these.

## 2. The catalogue (29 motifs)

Classes are the vocabulary of section 3. "Body" is the repeated element, "core" the centre, "rim"
the frame, "orbit" the satellites.

| Id   | Class             | Sym | Body                   | Core             | Rim             | Orbit            |
| ---- | ----------------- | --- | ---------------------- | ---------------- | --------------- | ---------------- |
| R1C1 | scroll-cross      | 4   | S-scroll hook + square | cross of squares | none            | none             |
| R1C2 | concave-star      | 4   | pinched arc spike      | small leaf       | none            | tip spikes       |
| R1C3 | leaf-pinwheel     | 4   | leaf with vein         | pinwheel         | none            | none             |
| R1C4 | teardrop-cross    | 4   | teardrop + scroll      | cross            | none            | dots (diagonal)  |
| R1C5 | petal-star        | 8   | pointed petal          | diamond          | none            | leaf pairs       |
| R2C1 | rosette           | 4   | petal cluster          | dot              | none            | dot ring         |
| R2C2 | spike-star        | 8   | long thin spike        | ring             | none            | dots             |
| R2C3 | quatrefoil        | 4   | teardrop               | ring             | none            | dots (diagonal)  |
| R2C4 | wavy-tile         | 4   | wavy edge              | 4-point star     | wavy square     | dots             |
| R2C5 | framed-tile       | 4   | fine scroll            | small tile       | double square   | corner dots      |
| R3C1 | scroll-tile       | 4   | fine scroll            | cross            | none            | corner teardrops |
| R3C2 | scalloped-tile    | 4   | scallop                | square + star    | double, scallop | corner dots      |
| R3C3 | quadrant-tile     | 4   | quadrant block         | pinwheel         | square          | none             |
| R3C4 | spike-star        | 8   | long thin spike        | star polygon     | none            | none             |
| R3C5 | quatrefoil        | 4   | teardrop               | dot              | none            | dots (diagonal)  |
| R4C1 | leaf-quatrefoil   | 4   | leaf lobe              | cross            | none            | inner dots       |
| R4C2 | crescent-ring     | 4   | crescent               | ring             | none            | spirals + dots   |
| R4C3 | long-star         | 4   | needle point           | diamond          | none            | tiny dots        |
| R4C4 | bicolor-star      | 8   | spike, two hues        | circle + dot     | none            | none             |
| R4C5 | interlace-square  | 4   | woven band             | square           | woven square    | corner loops     |
| R5C1 | double-star       | 8   | spike + inner star     | diamond          | none            | none             |
| R5C2 | needle-star       | 4   | needle point           | cross            | none            | four dots        |
| R5C3 | interlace-tile    | 4   | woven band             | scroll           | woven square    | corner knots     |
| R5C4 | floral-knot       | 4   | floral scroll          | cross            | none            | dots             |
| R5C5 | interlace-diamond | 4   | woven band             | diamond          | pointed diamond | none             |
| R6C1 | diamond-void      | 4   | teardrop void          | inner line       | rhombus         | none             |
| R6C2 | scroll-tile       | 4   | scroll                 | 4-point star     | square          | corner dots      |
| R6C3 | quadrant-tile     | 4   | quadrant block         | square + dots    | square          | dots             |
| R6C4 | web-star          | 8   | web spoke              | star             | none            | concentric arcs  |

## 3. The component vocabulary

Ten components. Each is a pure geometry function in `Maintain/Icon/Geometry.mjs` and takes only
numbers, so a genome can drive it.

| Component   | Geometry                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| `core`      | centre glyph at r < 8: dot, ring, cross, diamond, square, star, pinwheel |
| `spike`     | a point with concave sides: outer r, waist ratio, tip half-width         |
| `petal`     | a pointed leaf: two arcs meeting at the tip, base on the inner ring      |
| `teardrop`  | a circle tangent to a point: bulb radius, neck length                    |
| `scroll`    | an S or C hook: two arcs of opposite curvature, open at the tail         |
| `band`      | a straight run between two angles with an over/under break               |
| `interlace` | two bands crossing: the under-band is broken, the over-band is whole     |
| `quadrant`  | a square quarter with one inset corner and one inset scroll              |
| `web`       | radial spokes plus concentric arcs between them                          |
| `orbit`     | satellites on a circle: dot, teardrop, crescent, tick, spark             |

Every component is stroke-first. A fill is allowed only as a tint of the accent (opacity <= 0.18)
and never on the core.

## 4. Composition rules

1. One motif, centred, in a 100 x 100 box with a 46-unit outer radius.
2. n-fold rotation with n in {2, 4, 6, 8, 12}, plus at least one mirror axis.
3. Concentric zones: core (r < 8), body (8 < r < 30), rim (30 < r < 40, optional), orbit (r ~ 42). A
   zone may be empty; the order of zones never changes.
4. The rim band stays mostly empty: the silhouette breathes at the edge.
5. Ink is a line: stroke only, tint fill at most; no gradient, shadow, or texture.
6. One accent hue, carried either by the whole ink or by alternating arms.
7. Detail at two scales: the silhouette plus a fine inner repeat.
8. Negative space is part of the motif; the paper colour is never painted over.

## 5. The mapping to the family

### 5.1 Kind -> grammar (the body)

| Kind     | Grammar          | Why                                                                                 |
| -------- | ---------------- | ----------------------------------------------------------------------------------- |
| `hook`   | `spike-star`     | a hook intercepts a flow at a seam: arms are the taps, the body is the flow         |
| `plugin` | `interlace-tile` | the service owns machinery that other modules weave through: bands cross over-under |
| `client` | `quatrefoil`     | the panel has four child slots: four lobes and an orbit of fields                   |
| `lib`    | `crescent-ring`  | a pure library is concentric: rings of pure functions, orbit of transforms          |

### 5.2 Tree -> stroke mode (Classic vs Effect-TS)

| Tree       | Mode     | Rendering                                                                                           |
| ---------- | -------- | --------------------------------------------------------------------------------------------------- |
| `Classic`  | `single` | one stroke weight, solid core dot, no echo                                                          |
| `EffectTS` | `traced` | a second stroke offset 1.6 units (the effect trace), hollow core ring, one trace tick at 45 degrees |

The two trees share the grammar, the order, and the palette; the mode is the only difference, so a
twin pair reads as the same design with and without tracing. The ledger strings are byte-identical
across trees; the icons are deliberately not.

### 5.3 Domain -> core glyph

The domain segment of the package name picks the core: `normalize-*` a diamond with a bar,
`governor` a square with a chevron, `pinner` a pin triangle, `factory` a hexagon with a dot, `core`
a circle with a cross, `trace` a spiral, `panel` a quadrant square, `workspace` a grid, anything
else a small diamond.

## 6. The genome (what is extracted from a package)

`Maintain/Icon/Feature.mjs` reads only the package directory:

| Field                  | Source                                                      |
| ---------------------- | ----------------------------------------------------------- |
| `package`, `version`   | `package.json`                                              |
| `kind`, `tree`, `twin` | the directory name and the tree it lives in                 |
| `domain`               | the name segments after `dsh-`                              |
| `bundle`               | `dsh.bundle` present in `package.json`                      |
| `functions`            | count of `Source/Function/*.ts`                             |
| `injections`           | length of the `inject` array in `Source/Library.ts`         |
| `events`               | count of event gates the source subscribes to               |
| `tools`                | count of tool registrations in the source                   |
| `seams`                | count of order markers (`prepend` / `append`) in the source |
| `services`             | count of `ctx.provide` / service registrations              |
| `changelogVersions`    | `##` version headings in `CHANGELOG.md`                     |
| `changelogEntries`     | bullet lines in `CHANGELOG.md`                              |
| `changelogDigest`      | sha256 of `CHANGELOG.md`                                    |

The seed is `sha256(name | tree | version | features | changelogDigest)`. The PRNG is xorshift32
seeded from the first 8 hex digits and is used only for micro-variation (arm length, orbit radius,
scroll phase), quantized to 0.25 units so bytes stay stable.

## 7. Gated design (the feature gates the geometry)

A component exists only when its feature does. This is the rule that makes each icon specific to the
package's harness behaviour rather than decorative.

| Gate                    | Effect on the plan                              |
| ----------------------- | ----------------------------------------------- |
| `events > 0`            | arms = 4 + 2 * (events mod 3)                   |
| `events == 0`           | arms = 4 (the closed body)                      |
| `tools > 0`             | orbit gains 4 dots at the diagonals             |
| `injections > 0`        | inner ring count = min(3, injections)           |
| `seams > 0`             | the rim carries a gap at the seam angle         |
| `services > 0`          | the core becomes a hexagon                      |
| `bundle`                | the rim carries a patch notch                   |
| `functions > 3`         | inner detail strokes = functions                |
| `changelogVersions > 1` | evolution rings = versions - 1                  |
| `changelogEntries > 0`  | evolution ticks on the outermost ring = entries |

## 8. Evolution (the changelog reconstructs the icon)

The icon is append-only in history and live in behaviour:

- `changelogVersions - 1` concentric evolution rings, each at a fixed radius, so a new release
  visibly adds a ring.
- `changelogEntries` ticks distributed on the outermost ring, so entries thicken the rim.
- Live features (arms, orbit, detail) follow the current source, so a feature change reshapes the
  body without erasing the rings.

Because the seed includes the changelog digest, the icon is reconstructed from the seed alone:
`node Maintain/Generate-Icons.mjs` after a changelog edit produces the next icon, and `--check`
fails until the asset is regenerated. That is the whole update loop.

## 9. The rendering contract

| Render   | Path                                | Rules                                                                                     |
| -------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `mono`   | `Site/Public/Icons/<dir>.svg`       | `stroke="currentColor"`, accent at `stroke-opacity="0.45"`, tint at `fill-opacity="0.08"` |
| `colour` | `Site/Public/Icons/Color/<dir>.svg` | ink + accent + tint from the kind palette                                                 |

- `viewBox="0 0 100 100"`, coordinates quantized to 0.01.
- No `<style>`, no script, no external reference; each file is self-contained and under 8 KiB.
- `<title>` carries the package name and the grammar; `role="img"` and `aria-label` are set.
- The marketplace index carries the colour render as a relative reference, `Icons/Color/<dir>.svg`,
  which resolves against the index URL to the same origin the site serves.
- The site renders the mono file inlined, so it inherits the page ink and flips with the dark theme.

## 10. Code contract

```text
Maintain/Icon/
  Prng.mjs      seedOf(identity) -> hex, stream(seed) -> { next, jitter, pick }
  Palette.mjs   paletteOf(kind, tree) -> { ink, accent, tint }
  Geometry.mjs  polar(), spike(), petal(), teardrop(), scroll(), band(),
                interlace(), quadrant(), web(), ring(), orbit(), core()
  Grammar.mjs   planOf(genome) -> { grammar, order, arms, rings, orbit, rim,
                core, detail, mode, mutations }
  Feature.mjs   featuresOf(dir) -> the section 6 fields
  Mutation.mjs  mutationsOf(changelogText) -> [{ version, entries }]
  Render.mjs    renderMono(genome, plan), renderColour(genome, plan)
  Index.mjs     packages(), genomeOf(dir), build(), write(), check()
Maintain/Generate-Icons.mjs   the CLI: no flag writes, --check verifies,
                              --report prints the table
Maintain/Icon/Ledger.json     the generated genome ledger (committed)
```

Acceptance: `node Maintain/Generate-Icons.mjs --check` exits 0 on a clean tree; two consecutive
writes are byte-identical; all 102 icons are distinct;
`node Maintain/Generate-Marketplace.mjs --check` passes with the icons wired; the site builds.

## 11. Palette (kind x tree)

| Kind     | Ink       | Accent    | Tint      |
| -------- | --------- | --------- | --------- |
| `hook`   | `#0B1B3A` | `#3D6BFF` | `#DCE6FF` |
| `plugin` | `#101010` | `#C67424` | `#F9DCAE` |
| `client` | `#2F0E24` | `#B5179E` | `#F2D7EA` |
| `lib`    | `#0C2F0A` | `#2F9E44` | `#D8EEDB` |

The mono render carries no hue at all; the colour render is the marketplace asset. The site stays
blue and white: it inlines the mono file, whose `currentColor` is the page ink.

---

_The reference sheet supplies the vocabulary; the package supplies the sentence._
