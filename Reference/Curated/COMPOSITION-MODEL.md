# The composition model - relationships, voids, detail profiles

Source: the second and third procedural-rendering briefs (the component/relationship brief and the
"relationships not shapes" brief). This note is the DESIGN layer above `TOOLCHAIN.md`: how an icon
is described before it is drawn. Claims whose source could not be fetched are marked [unverified];
the sources are listed in `README.md` and the failures in `fetch-errors.log`.

## 1. The shift: relationships, not shapes

A layer stack says where things are drawn. A relationship graph says why they belong together, and
it must survive a change of colour, stroke width, or rendering backend.

The relation vocabulary the brief proposes:

| Kind             | Meaning                                                        |
| ---------------- | -------------------------------------------------------------- |
| `faces`          | two components point at each other                             |
| `aligned-gap`    | a set of components shares one gap and one axis                |
| `frames`         | an outer set encloses an inner one                             |
| `continues`      | two strokes read as one interrupted stroke, with a gap width   |
| `balances`       | two groups carry equal visual mass                             |
| `repeats`        | a rhythm: a component set with a spacing pattern               |
| `subtracts`      | a cutter removes material from a target                        |
| `shares-feature` | components belong to one idea despite different layers         |

This is consistent with graph-grammar work that separates a pattern's node-edge structure from its
geometric layout [unverified: mgv.sggw.pl timed out].

Practical consequence for the generator: a streaming feature may produce several disconnected
strokes that still share a direction; they must not be merged into one squiggle.

## 2. Negative space is specified, not left over

A void region has an id, a role (`central-window`, `breathing-space`, `directional-channel`,
`separation-seam`), a geometry, a minimum width, and a behaviour:

- `keep-clear` - components may not enter the region.
- `subtract` - the region removes material from components that cross it.

A separation seam may cross several layers; the shared empty channel is what makes the result read
as assembled. SVG represents holes with compound paths and the `evenodd` or `nonzero` fill rules,
which are not interchangeable for every contour arrangement [fetched: `Raw/svg-fill-rule.md`].

## 3. Detail profiles replace complexity levels

One number cannot distinguish a complex outline from a simple outline with elaborate cuts. A layer
carries a profile instead:

```text
componentCount, turnsPerComponent, curvatureChanges, internalCuts,
terminalDiversity, repetitionRegularity, colorGroups
```

| Dimension        | Simple                    | Complex                         |
| ---------------- | ------------------------- | ------------------------------- |
| Component count  | two large pieces          | many small pieces               |
| Direction change | straight or one bend      | multiple bends                  |
| Curvature        | one smooth arc            | alternating curvature           |
| Interior         | solid stroke              | slots, holes, nested contours   |
| Rhythm           | uniform repetition        | alternating lengths/spacing     |
| Terminals        | one ending throughout     | selected contrasting endings    |
| Colour grouping  | one ink                   | several purposeful groups       |

A layer may be geometrically simple and compositionally rich, or the reverse. "More functionality"
must not always mean "more tiny marks".

## 4. A sparse cube, not a dense voxel array

The vector scene stays authoritative. Other views are derived from it and must not become separate
implementations:

| View                  | Purpose                              |
| --------------------- | ------------------------------------ |
| Vector scene          | editing and final rendering          |
| Relationship graph    | composition rules                    |
| Spatial occupancy grid| fast approximate placement checks    |
| Layer-isolation render| debugging                            |
| Semantic map          | which feature generated what         |

A coarse occupancy grid rejects bad placements quickly; the final decision still uses the visible
geometry.

## 5. An operation grammar, not a motif menu

A method library lists `hook, diamond, needle, arc`. An operation grammar lists
`split -> rotate -> separate -> taper -> subtract -> outline`. The second is what "cut out, shape
shift, deepen, broaden" means operationally:

```js
const recipe = {
	source: { method: "angular-open-stroke", parameters: { turns: 2 } },
	operations: [
		{ type: "split", at: [0.35, 0.72] },
		{ type: "spread", distance: 1.2 },
		{ type: "alternate-terminal", styles: ["butt", "pointed"] },
		{ type: "repeat", count: 4, transform: "quarter-turn" },
		{ type: "reserve-void", region: "central-window" },
	],
};
```

The grammar must constrain combinations; unrestricted rule application is not automatically good
design [unverified: ACM 10.1145/3757377.3764004 is bot-walled; the PDF at
`Raw/shape-grammar-generative-design.md` is the fetched shape-grammar source]. Paper.js exposes the
building blocks: curve splitting, intersections, path operations, tolerance-controlled flattening
[fetched: `Raw/paperjs-pathitem.md`, `Raw/paperjs-deepwiki-path-creation.md`].

## 6. Corners and terminals are authored geometry

Four separate decisions: centerline direction changes, join construction, terminal construction, and
the width profile approaching the terminal. A miter join projects beyond the nominal stroke width at
acute angles; SVG's miter limit bounds that projection and can force a bevel [fetched:
`Raw/svg-stroke-miterlimit.md`, `Raw/svg-strokes-spec.md`].

Two strokes with the same centerline and width can therefore have different silhouettes and
different collision footprints. The geometry compiler must return the actual footprint, not an
estimate from stroke width.

## 7. Small-size variants are designed, not shrunk

Rendering profiles:

```text
small:  no micro cuts, simplified outline, detail tier 1
medium: micro cuts, standard outline, detail tier 2
large:  micro cuts, full outline, detail tier 3
```

Simplification preserves identity: keep the major silhouette, the principal opening or cutout, and
the main directional relationship; remove secondary detail before primary structure; never let an
open motif read as closed.

Curve approximation follows a tolerance, not a universal sample count. For a uniformly scaled icon:

```text
icon-space tolerance = pixel-error budget / pixels per icon unit
```

Paper.js `flatten(flatness)` subdivides to a maximum geometric error [fetched:
`Raw/paperjs-pathitem.md`]. This is more defensible than "eight samples per curve".

## 8. Three channels: function, identity, history

| Channel  | Influence                                                          |
| -------- | ------------------------------------------------------------------ |
| Function | branching, direction, repeated groups, relationship structure      |
| Identity | palette, preferred terminal family, asymmetry bias                 |
| History  | reserved revision marks or one localized secondary detail          |

Do not hash the entire manifest into one seed: adding one capability must not change every colour,
position, and method at once. Record provenance next to each decision:

```js
{ decision: "body.relationship", value: "directional-sequence",
  because: { feature: "streaming", source: "reviewed-manifest" },
  rule: "streaming-direction-v2" }
```

## 9. Generate candidates, then select under constraints

```text
semantic manifest -> candidate seeds 0..N -> hard-constraint rejection
-> soft-preference ranking -> selected composition + diagnostics
```

Hard constraints: no unintended visible overlap, required semantic components present, reserved gaps
open, valid geometry, decorations in bounds. Soft preferences: balanced mass, variation between
major and minor strokes, a clear dominant structure, no accidental near-tangencies, similarity to
the intended family without duplicating another icon. The ranking is a design heuristic, not a
measure of beauty; keep the candidate sheet for human review.

## 10. Measure diversity across the collection

SVG hashes prove nothing about visual identity. Record a descriptor per icon - layout, dominant
topology, symmetry, silhouette class, method families, void pattern, weight contrast, colour
grouping - and inspect the distribution. If nearly every icon is a radial layout with a closed body,
one central opening, and a repeated outer ring, the generator is narrow no matter how many methods
its source lists.

`Test/Icons/Diversity.mjs` implements the measurement for this repository: 14 motif families, 12
silhouette classes, 4 symmetry orders, component buckets, tone patterns, stroke contrast, ink length,
and descriptor-tuple uniqueness over package scenes (twins collapse on purpose). It fails when one
family or silhouette dominates, when a descriptor dimension collapses, or when fewer than 90% of
package scenes are unique.

## 11. What is implemented today, and what is not

Implemented:

- The 14-family motif library (`Maintain/Icon/Motif.mjs`): twelve ornamental constructions plus the
  two generative ones borrowed from Division Raster and Q*bertify.
- The transliteration (`Maintain/Icon/Transliterate.mjs`): semantic tokens attach layers (halo rings,
  gate loops, seam ticks, ledger beads, medallion, trace echo) to the motif, and the plan chooses the
  family, symmetry, rotation, and fill.
- The component model (`Maintain/Icon/Component.mjs`): per-component method, topology, stroke
  (width, profile, terminals, join, contour), composition (operation, collision group, minimum
  clearance), and material. Components stay separate until the renderer groups them per tone.
- The collection-level diversity arbiter (`Test/Icons/Diversity.mjs`).

Not implemented yet: the relationship graph, explicit void regions, detail profiles per layer, the
operation grammar, candidate generation with constraint selection, small-size render profiles, and
the provenance record. Those are the next milestone, not a claim of this one.
