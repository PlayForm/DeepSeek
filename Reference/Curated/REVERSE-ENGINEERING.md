# Reverse engineering - from reference motif to construction hypothesis

Source: the fourth procedural-rendering brief (the reverse-engineering workflow). This note is the
ANALYSIS layer: how a reference motif becomes an inspectable construction hypothesis, and how the
generator proves that a visual feature is driven by function. Sources are in `Raw/`; the ones that
could not be fetched are marked [unverified].

## 1. Three systems, kept separate

| System             | Job                                                  | Where it lives here                     |
| ------------------ | ---------------------------------------------------- | --------------------------------------- |
| Reference analysis | propose constructions from the reference raster      | pending (this note)                     |
| Grammar            | assemble a meaningful design from the manifest       | `Maintain/Icon/Motif.mjs`, `Transliterate.mjs` |
| Geometry backend   | realise the design as an SVG                         | `Maintain/Icon/Envelope.mjs`, `Component.mjs` |

Keeping them separate is what makes a disappointing icon diagnosable: a bad interpretation, a weak
composition rule, or a rendering defect are three different failures.

## 2. The construction dossier

For each reference cutout (`Temporary/Icon-Reference/Motifs/<id>.png`):

| View                        | Reveals                                                     |
| --------------------------- | ----------------------------------------------------------- |
| Original crop               | the visual evidence                                         |
| Foreground mask             | occupied regions without paper texture                      |
| Colour-separated masks      | which strokes and fills share one colour                    |
| Boundary contours           | outer edges, holes, slots, cutouts                          |
| Skeleton + width map        | likely stroke paths and local thickness                     |
| Endpoint/junction annotation| open terminals, branching, possible crossings               |
| Layer decomposition         | one or more explanations of how the icon could be assembled |
| Reconstructed render        | whether the explanation reproduces the important features   |

Skeletonisation and the medial axis return a skeleton plus a distance transform; the transform gives
a local foreground width estimate. That is evidence about the raster, not proof of the artist's
original centerline [fetched: `Raw/skimage-skeletonize.md`; distance transform:
`Raw/opencv-distance-transform.md`].

## 3. Observations are not hypotheses

A flattened image does not uniquely reveal its layers. Two boundaries converging on a point can be
two strokes touching, one bent stroke, a filled polygon, a wider stroke with a subtractive cut, or
two overlapping strokes with a hidden intersection. Keep the ambiguity:

```js
{
  observation: { region: "upper-right", appearance: "two boundaries converge to a pointed terminal" },
  hypotheses: [
    { construction: "tapered-open-stroke", confidence: "medium" },
    { construction: "filled-wedge-with-cutout", confidence: "medium" },
  ],
  selectedForReconstruction: "filled-wedge-with-cutout",
  selectionReason: "preserves the corner under width changes",
}
```

No invented numeric confidence unless there is a calibration method. The goal is a controllable
construction that explains the design and generalises, not a perfect recovery of an unknowable
source file.

## 4. Stroke signature: behaviour, not position

```text
where it travels, how it turns, how its width changes,
how it begins, how it ends, how its boundaries relate, what void it defines
```

A record: topology (open/closed/branched), curvature sequence (straight, left, right, cusp), width
profile sampled at distance fractions, start/end terminal, boundary treatment (solid,
double-contour, outlined-fill, interrupted), semantic role (frame, connector, accent, divider).

Measurements should be taken at equal DISTANCES along the path, not at equal Bezier parameter steps.
svgpathtools provides curvature, intersections, arc length, and inverse arc length [fetched:
`Raw/svgpathtools.md`].

## 5. Centerline-driven and boundary-driven strokes

Two construction classes, because not every stroke is a centerline plus width:

| Class               | Representation                                        | Examples                                  |
| ------------------- | ----------------------------------------------------- | ----------------------------------------- |
| Centerline-driven   | centerline + width profile + joins + terminals        | uniform arcs, needles, ribbons, short marks |
| Boundary-driven     | left boundary + right boundary + terminal connections | chiselled wedges, asymmetric hooks, carved notches |

An inner boundary with a sharp notch is awkward as a symmetric offset of one centerline. SVG paths
mix line, quadratic, cubic, and arc segments, so the two boundaries need not share a primitive type
[fetched: `Raw/svg2-paths.md`, `Raw/mdn-svg-paths.md`].

## 6. Parameter compatibility rules

Isolated parameters do not carry a design; their relationships do. Encode compatibility, not just
values:

```js
const rules = [
  { when: { bodyWeight: "heavy" }, prefer: { centralVoid: "large" } },
  { when: { bodyDetail: "dense" }, prefer: { rimDetail: "sparse" } },
  { when: { terminalFamily: "pointed" }, avoid: { microDecoration: "round-beads-everywhere" } },
  { when: { accentRole: "interruption" }, require: { accentPlacement: "at-breaks" } },
];
```

These are proposed design rules, not observations [unverified]. The shift is from independently
randomising attributes to selecting compatible combinations.

## 7. Topology contracts per method

Each method declares what must stay true under parameter changes:

```js
{
  method: "split-hook",
  invariants: {
    openComponents: 2,
    enclosedHoles: 0,
    minimumTerminalSeparation: 1.4,
    preserveInnerNotch: true,
    allowSelfIntersection: false,
  },
}
```

This catches what bounds checks miss: a gap closing after thickening, a hook folding over itself, a
cutout disappearing, two fragments fusing, a pointed terminal blunting after simplification.

The trap: a filled envelope is closed even when its source centerline is open, so "count Z commands"
is not a valid test for open-stroke variety. Test the representation the invariant is about.

`Test/Icons/Topology.mjs` implements this for the generated set: finite coordinates, in-bounds
geometry, no self-intersecting centerline, a required frame method per family, and minimum closed /
maximum total component counts per family.

## 8. Ablation sheets

For a candidate icon render: full, without core, without body, without edge details, without accent,
without mini-outline, without revision marks, without variant decoration. Then ask: does removing the
body destroy identity; is the core meaningful or a hole-filler; does colour communicate grouping;
does the mini-outline help separation; does the Effect decoration keep the silhouette; are history
marks subordinate.

If an icon only works with every layer present, its hierarchy is weak. If removing a layer changes
nothing useful, the layer is unnecessary.

## 9. Controlled interventions

Change exactly one functional feature, keep identity fixed: streaming off/on, validation off/on, one
tool/four tools, two transforms/three, Classic/Effect, revision zero/one. Declare allowed changes and
protected properties:

```js
{
  intervention: "validation:false->true",
  allowedChanges: ["validation-associated components", "local spacing repairs"],
  protectedProperties: ["base palette", "dominant orientation", "unrelated feature components"],
}
```

When constraints make a protected property impossible, report the conflict instead of quietly
redrawing everything. `Test/Icons/Interventions.mjs` implements the scene-level version: events add
gate loops, tools add tool beads, injections add rings, changelog versions add evolution rings, and
the Classic/Effect switch changes the render but not the scene.

## 10. Local repair before reseeding

When a candidate collides: move the offending detail inside its region, rotate it, shrink a
secondary dimension, substitute a compatible method with the same semantic role, remove optional
decoration, and only then reject the candidate. Record each repair (component, problem, repair,
before, after, preserved). This distinguishes bad grammar from a bad geometric implementation.

## 11. The next evidence pack

Not another full-family render: a compact pack with a few real reference cutouts, observations and
alternative hypotheses, vector reconstructions, layer-isolation and negative-space views, parameter
sweeps, topology and clearance checks, one-feature-at-a-time comparisons, small-size renders, and a
list of unresolved ambiguities.

Analysis tooling that would support it: scikit-image skeletonisation and medial axis
[`Raw/skimage-skeletonize.md`], OpenCV distance transform
[`Raw/opencv-distance-transform.md`], svgpathtools [`Raw/svgpathtools.md`], and the SVG path
grammar [`Raw/svg2-paths.md`].

## 12. State in this repository

Implemented: the three-system split at the code level (Motif, Transliterate, Envelope), topology
contracts for the generated families (`Test/Icons/Topology.mjs`), controlled-intervention tests
(`Test/Icons/Interventions.mjs`), and the collection-level diversity report
(`Test/Icons/Diversity.mjs`).

Pending: the raster analysis pipeline itself (masks, skeleton, width map, hypotheses), the
boundary-driven stroke class, compatibility rules beyond the current family parameters, ablation
sheets as a generated artefact, and the local repair loop.
