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
      evidence: Maintain/Icon/ + Maintain/Generate/Icons/Index.mjs
    - name: the 102 generated icons (mono + colour) and the ledger
      state: implemented
      evidence: Site/Public/Icons/**, Maintain/Icon/Ledger.json, Test/Icons/Check.mjs (14 checks)
    - name: the marketplace icon field and the site rendering
      state: implemented
      evidence: marketplace.json (102 icons), PluginIcon.astro, the built site (104 pages)
---

# ICON-GRAMMAR.md - the family's generated icon language

One icon per package, generated from the package's own functionality. The reference sheet
(`Temporary/Icon-Reference/Reference.jpg`, 29 motifs) is the visual source: this file measures it,
extracts its component vocabulary, and maps that vocabulary onto the two release trees and the four
package kinds.

Nothing here is drawn by hand. Every icon is a pure function of a genome (the package's identity +
features + changelog digest), so a package change regenerates its icon and the same package content
always regenerates the same bytes.

## 0. Current pipeline (2026-10-25) - supersedes sections 3, 4, 5.1, 7 and 9

The generator now runs four stages, each with its own owner file:

1. **Profile.** `Infer.mjs` reads the package source into a structure (modules, import graph,
   semantic tokens) and a functional profile: role (interceptor, transformer, router, store,
   renderer, governor, orchestrator, analyzer), flow, stateful, streaming, branching, containment,
   weight, evidence, confidence.
2. **Composition.** `Composition.mjs` maps the profile to a design: form and motif family, symmetry
   (4/6/8/12 from branching), phase (0 when streaming), density (weight), void (containment), accent
   placement, and the applied compatibility rules.
3. **Transliteration.** `Transliterate.mjs` draws the chosen family and attaches one layer per
   semantic token the package actually has (gate loops, tool beads, seam ticks, ledger beads,
   injection rings, medallion, stream spiral, state nest, trace echo, transform cusps, evolution
   rings).
4. **Solid render.** `RenderScene.mjs` fills every component (a closed component fills its polygon,
   an open one its envelope) and paints the planes in depth order. There is no contour pass: the
   drawing is carried by the planes, their tones, and their occlusion. A frame or body plane is
   projected as a 3D solid seen from above (silhouette, ribs, top face, optional age face), and the
   SVG is the top view of that stack.

`ICON-METHODS.md` carries the family table, the matrix, the rules, and the arbiters. Sections 3-5
and 7 below describe the retired first-generation vocabulary (the method pool and the annulus
collage); they are kept because their measurements of the reference sheet still hold, not because
the generator uses them.

## 1. The sheet, measured

The sheet is a 6 x 5 lattice of 29 motifs on cream paper (the last row carries four). Measurements
come from `Temporary/Icon-Reference/Analyze.py`, which writes `Analysis.json` and the labelled
`Contact-Sheet.png`.

All 29 motifs are cut out at 4x (`Temporary/Icon-Reference/Motifs/<id>.png`, with six row sheets in
`Rows/`) and read one by one in `ICON-REFERENCE.md` - the per-motif companion to this file: the
class, the order, the body, the core, the rim, the orbit, the accent and the stroke of every motif.

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

The vocabulary is FUNCTIONAL: every stroke is sampled from a parametric curve in
`Maintain/Icon/Curve.mjs`, never assembled from fixed primitives. A sampler returns a quantized
point list, and every closed sampler is star-shaped about the centre, so a single curve can never
self-intersect.

| Sampler        | Function                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `superellipse` | x = r sign(cos t) abs(cos t)^(2/p), y = r sign(sin t) abs(sin t)^(2/p): p=2 circle, p=4 squircle, p=1 diamond |
| `lobedRing`    | r = inner + amplitude abs(cos(lobes t / 2))^power: the body, star-shaped, never reaching the centre           |
| `waveRing`     | r = radius + amplitude cos(lobes t): the rim and the woven frame                                              |
| `circle`       | the same angle convention as every other sampler, so the outline pass is uniform                              |
| `arc`          | an open partial ring, as a polyline                                                                           |
| `dotRing`      | n small closed circles on one radius: the orbit                                                               |
| `tickRing`     | n two-point strokes on one radius: the seam ticks                                                             |
| `phyllotaxis`  | the golden-angle spiral of dots, confined to an annulus: the detail zone                                      |

The old assembled primitives (spike, petal, teardrop, scroll, band, interlace, quadrant, web, orbit,
core, the frames) are retired: they placed shapes that crossed each other, which the collage rule
now forbids.

## 4. Composition rules

1. One motif, centred, in a 100 x 100 box with a 46-unit outer radius.
2. n-fold rotation with n in {2, 4, 6, 8, 12}, plus at least one mirror axis.
3. **The collage rule.** The icon is packed from DISJOINT annuli and never interlaced: core (r <=
   7), body (9-31), evolution (33-38), orbit (40-44), rim (45-47). No element may cross another
   element's band, so no stroke of one piece overlaps a stroke of another; overlap inside one
   sampled curve is impossible by construction. The composer (`Maintain/Icon/Compose.mjs`) enforces
   the bands.
4. The rim band stays mostly empty: the silhouette breathes at the edge.
5. **The outline rule.** Every stroke is drawn twice from ONE path definition: a wider faint outline
   pass (the mini stroke outline) and the body pass, shared through `<defs>`/`<use>`. The outline is
   what gives the line its drawn edge; no second element is used to create contrast.
6. Ink is a line: stroke only; no gradient, shadow, or texture.
7. One accent hue, carried by the evolution rings, the orbit and the rim.
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

| Gate                    | Effect on the plan                             |
| ----------------------- | ---------------------------------------------- |
| `events > 0`            | arms = 4 + 2 * (events mod 3)                  |
| `events == 0`           | arms = 4 (the closed body)                     |
| `tools > 0`             | orbit level 3 (12 satellites)                  |
| `injections > 1`        | orbit level 2 (8 satellites)                   |
| `seams > 0`             | rim level 2 (the double wave)                  |
| `bundle`                | rim level 3 (the woven pair plus ticks)        |
| `functions > 3`         | body level 2; `functions > 8` body level 3     |
| `functions > 2`         | detail level 1; `functions > 5` detail level 2 |
| `changelogVersions > 1` | evolution level = versions - 1 (max 3)         |
| `changelogEntries > 0`  | evolution ticks on the outermost ring          |

### 7.1 The per-zone complexity vector (the sheet's "levels of separation")

The reference sheet does not vary complexity per motif; it varies it PER LEVEL - one icon has a rich
core over a plain body, another a plain core inside a dense rim. The generator encodes that as a
`levels` vector, one 0-3 score per zone:

| Zone        | Gate (base)                                     | Rendered at 0 / 1 / 2 / 3                         |
| ----------- | ----------------------------------------------- | ------------------------------------------------- |
| `core`      | role richness (grid/hexagon roles score higher) | - / one medallion / two nested / three nested     |
| `body`      | `functions`                                     | - / one curve / two concentric / three concentric |
| `detail`    | `functions`                                     | none / 6 dots / 10 dots / 14 dots                 |
| `evolution` | `changelogVersions - 1`                         | 0 / 1 / 2 / 3 rings                               |
| `orbit`     | `tools`, `injections`                           | - / 4 / 8 / 12 satellites                         |
| `rim`       | `bundle`, `seams`                               | none / single / double / woven + ticks            |

Each base is nudged by the seed (`-1, 0, 0, 0, +1`), so two packages with identical features still
differ in WHICH level is rich. The stroke weight (`functions`, `bundle`, `tools` -> 1.3-2.0) and the
fill treatment (`variant`: tint body, solid core, or none) are per-package too, like the sheet's
bold and filled motifs.

## 8. Evolution (the changelog reconstructs the icon)

The icon is append-only in history and live in behaviour:

- `changelogVersions - 1` concentric evolution rings, each at a fixed radius, so a new release
  visibly adds a ring.
- `changelogEntries` ticks distributed on the outermost ring, so entries thicken the rim.
- Live features (arms, orbit, detail) follow the current source, so a feature change reshapes the
  body without erasing the rings.

Because the seed includes the changelog digest, the icon is reconstructed from the seed alone:
`node Maintain/Generate/Icons/Index.mjs` after a changelog edit produces the next icon, and
`--check` fails until the asset is regenerated. That is the whole update loop.

## 9. The rendering contract

| Render   | Path                                | Rules                                                                      |
| -------- | ----------------------------------- | -------------------------------------------------------------------------- |
| `mono`   | `Site/Public/Icons/<dir>.svg`       | `fill="currentColor"`, per-layer opacity, no stroke                        |
| `colour` | `Site/Public/Icons/Color/<dir>.svg` | per-layer palette tone (frame accent2, body ink, detail tint, core accent) |

- `viewBox="0 0 100 100"`, coordinates quantized to whole units (the canvas is 100 wide, so one unit
  is 0.4 px at the 40 px site size).
- **Filled planes, no contour.** Every component is a filled path: a closed component fills its
  centerline polygon, an open one fills its stroke envelope (`Maintain/Icon/Envelope.mjs`). The
  contour stroke pass is removed - separation comes from the tones and the occlusion order.
- **Depth order.** Each component carries a depth; the renderer sorts by depth and groups runs with
  the same tone and opacity into one `<path>`. A frame or body plane contributes three features -
  silhouette, ribs, top face - at different opacities, and a changelog release adds an age face.
- **One path per run.** Each run is written once into `<defs>` as `<path id="<dir>-<n>">` and
  painted with `<use>`; the Effect-TS echo reuses the body run. The ids carry the package directory,
  so several inlined icons on one page never collide.
- No `<style>`, no script, no external reference; each file is self-contained and under 16 KiB (the
  market index's inline limit is 32 KiB decoded, so there is room; the cap is the family's own).
- `<title>` carries the package name and the grammar; `role="img"` and `aria-label` are set.
- The marketplace index carries the colour render as a relative reference, `Icons/Color/<dir>.svg`,
  which resolves against the index URL to the same origin the site serves.
- The site renders the mono file inlined, so it inherits the page ink and flips with the dark theme.

## 10. Code contract

```text
Maintain/Icon/
  Prng.mjs          digest(), seedOf(parts), stream(seed)
  Palette.mjs       palettesOf(kind) -> { ink, accent, accent2, tint }
  Curve.mjs         pathOf() and the legacy samplers
  Motif.mjs         the 14 families + the primitives + Ornament
  Infer.mjs         structureOf(root, dir), profileOf(structure, entry)
  Composition.mjs   compositionOf(profile, seed) -> the design decision
  Transliterate.mjs sceneOf(genome, plan) -> the layered scene
  Component.mjs     buildComponent(), clearanceReport()
  Envelope.mjs      envelopeOf(), offsetPolyline(), clearanceOf()
  RenderScene.mjs   renderMono(), renderColour() - the slab stack
  Grammar.mjs       planOf(genome) -> { family, form, role, phase, density, void,
                    accent, rules, order, fill, mode, mutations, ... }
  Feature.mjs       featuresOf(root, dir) -> the package facts
  Mutation.mjs      mutationsOf(changelogText), evolutionOf(mutations)
  Index.mjs         packages(root), genomeOf(root, entry), build(root), write(root), check(root)
Maintain/Generate/Icons/Index.mjs   the CLI: no flag writes, --check verifies, --report prints the table
Maintain/Icon/Ledger.json     the generated genome ledger (committed)
Test/Icons/Check.mjs          determinism, coverage, size, uniqueness, twins, ledger, tree
Test/Icons/Topology.mjs       per-family topology contracts
Test/Icons/Interventions.mjs  one-feature-at-a-time scene changes
Test/Icons/Diversity.mjs      collection-level descriptor distribution
Test/Icons/Profiles.mjs       the functional profile pass
Test/Icons/Composition.mjs    the composition matrix and its rules
```

The ledger records, per package: package, dir, kind, tree, version, seed, grammar, family, order,
arms, `rings`, orbit, rim, mode, the two hashes, and the two paths.

Acceptance: `node Maintain/Generate/Icons/Index.mjs --check` exits 0 on a clean tree; two
consecutive writes are byte-identical; all 102 icons are distinct; `node Test/Icons/Check.mjs`
reports 14 of 14; `node Test/Icons/Topology.mjs`, `Interventions.mjs`, `Diversity.mjs`,
`Profiles.mjs` and `Composition.mjs` all pass;
`node Maintain/Generate/Marketplace/Index.mjs --check` passes with the icons wired; the site builds.

## 11. Palette (per package, from the dusk banner)

SOURCE: `Temporary/Icon-Reference/Banner.png` (the "Beautiful Rust" pixel-art banner the user
supplied). Its k-means extraction supplies the family's whole vocabulary:

| Name       | Hex       | Name  | Hex       |
| ---------- | --------- | ----- | --------- |
| indigo     | `#364085` | coral | `#F67D55` |
| navy       | `#183566` | amber | `#FBBA5B` |
| periwinkle | `#9499CB` | rust  | `#B04523` |
| plum       | `#261223` | rose  | `#CF637E` |
| dark plum  | `#4D2D42` | mauve | `#97568B` |
| cream      | `#F8E3B7` | rock  | `#2A1823` |

The four kinds are mapped onto the banner's hue zones, and the SEED picks the exact ink, accent and
second accent inside the zone:

| Kind     | Zone        | Ink choices                             | Accent choices                          |
| -------- | ----------- | --------------------------------------- | --------------------------------------- |
| `hook`   | indigo      | `#1E3768` `#183566` `#26305E` `#223A6E` | `#40548D` `#6F7FC0` `#9499CB` `#5B6BC0` |
| `plugin` | coral/amber | `#4D2D42` `#3A2018` `#2A1823` `#46281F` | `#F67D55` `#E97E3B` `#FBBA5B` `#B04523` |
| `client` | rose        | `#261223` `#341630` `#3D1B33` `#2E1229` | `#CF637E` `#C86BA8` `#9E5970` `#D76A9A` |
| `lib`    | violet      | `#2A1B3D` `#33204A` `#2B1D4A` `#35233F` | `#97568B` `#B07CC6` `#A66BB8` `#8A5A9E` |

Tints mix the accent toward the banner cream (`#F8E3B7`), not toward white, so a filled icon sits on
the same paper as the reference sheet. The result is 16 distinct inks, 19 accents and 28 fills
across the 102 packages - the reference sheet's 29/29 spread, reached from one source palette.

The mono render carries no hue at all; the colour render is the marketplace asset. The site stays
blue and white: it inlines the mono file, whose `currentColor` is the page ink.

---

_The reference sheet supplies the vocabulary; the package supplies the sentence._
