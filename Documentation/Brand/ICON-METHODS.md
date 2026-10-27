---
title: The icon methods
category: Brand
kind: living-record
date: 2026-10-25
status: active
registry: Documentation/Brand/ICON-METHODS.md
index: Documentation/INDEX.md
statuses:
    - name: the 14 motif families and their construction primitives
      state: implemented
      evidence: sections 2 and 3, Maintain/Icon/Motif.mjs
    - name: the layered slab model (one path per layer, top view)
      state: implemented
      evidence: section 4, Maintain/Icon/RenderScene.mjs
    - name: the composition matrix (profile -> form, symmetry, density, void, accent)
      state: implemented
      evidence: section 5, Maintain/Icon/Composition.mjs
    - name: the compatibility rules and the semantic layers
      state: implemented
      evidence: sections 6 and 7, Maintain/Icon/Transliterate.mjs
    - name: the six arbiters (check, topology, interventions, diversity, profiles, composition)
      state: implemented
      evidence: section 8, Test/Icons/
---

# ICON-METHODS.md - the motif library and the composition matrix

`ICON-GRAMMAR.md` records what the reference motifs ARE and how the package genome is read. This
file records HOW the generated icon is built: the motif families, the primitives, the slab model,
and the matrix that turns a package's functional profile into design decisions.

The old method pool (`Method.mjs`) and the layer cube (`Matrix.mjs`, `Compose.mjs`) are retired.

The generator no longer samples a method per layer; it infers a FUNCTIONAL PROFILE from the package
source, passes the profile through a COMPOSITION MATRIX, and draws the resulting motif as a stack of
slabs.

## 1. The pipeline

```text
package source
  -> structureOf()      modules, import graph, semantic tokens      Infer.mjs
  -> profileOf()        role, flow, stateful, streaming, branching,
                        containment, weight, evidence, confidence   Infer.mjs
  -> compositionOf()    form, family, symmetry, phase, density,
                        void, accent, applied rules                 Composition.mjs
  -> sceneOf()          motif parts + semantic layers               Transliterate.mjs
  -> buildComponent()   stroke envelope per part                    Component.mjs
  -> renderMono/Colour  one path per layer, painted bottom to top   RenderScene.mjs
```

## 2. The 14 motif families

A family is a construction grammar.

`Order` is the symmetry the family receives; a family that does not use it is marked "fixed".

| Family           | Form    | Construction                                                        | Order |
| ---------------- | ------- | ------------------------------------------------------------------- | ----- |
| `spikeStar`      | star    | a closed star ring with concave bowed edges, beads and mid diamonds | used  |
| `crossStar`      | star    | four tapered arms plus four short diagonal rays, square core        | fixed |
| `chevronRing`    | chevron | a zigzag ring with an inner ring and a diamond core                 | used  |
| `crescentRing`   | ring    | a ring body with a crescent moon orbit                              | used  |
| `teardropOrbit`  | ring    | a ring body with teardrops pointing outward                         | used  |
| `rosette`        | rosette | petal ellipses around a dot core, a thin halo ring                  | used  |
| `quatrefoil`     | rosette | four lobes in a square frame with a diamond core                    | fixed |
| `diamondLattice` | diamond | nested diamonds, spokes from the inner diamond to the frame         | fixed |
| `knotSquare`     | diamond | a square frame with corner loops, an inner square, a diamond core   | fixed |
| `trellisKnot`    | trellis | a square frame with an inner square and crossing diagonals          | fixed |
| `scallopRing`    | scallop | a scalloped frame with a square inner and square core               | used  |
| `octagonStar`    | trellis | an octagon frame with an inner star and a ring core                 | used  |
| `divisionTile`   | chevron | recursive subdivision of the interior into cells with seeds         | fixed |
| `isometricTiles` | hexagon | a hexagonal isometric cube split into three rhombi plus inner hex   | fixed |

## 3. The primitives

`Motif.mjs` builds every family from a small primitive set, all sampled as point lists.

| Primitive     | Shape                                                        |
| ------------- | ------------------------------------------------------------ |
| `ring`        | a circle at a radius, sampled                                |
| `polygon`     | an n-gon at a radius and phase (4 = square/diamond by phase) |
| `star`        | a 2n-point ring with an optional inward bow on every edge    |
| `scallop`     | a circle whose radius oscillates with the lobe count         |
| `petal`       | an ellipse oriented along a radius                           |
| `teardrop`    | a round base with a point at the outer radius                |
| `crescent`    | two arcs, the inner one shifted toward the centre            |
| `spike`       | a tapered triangle from an inner base to a point             |
| `zigzagRing`  | a closed ring alternating between two radii                  |
| `hexagon`     | a flat-top hexagon, the isometric cube's outline             |
| `diamondAt`   | a small diamond at a polar position                          |
| `cellsOf`     | recursive subdivision of a rectangle (division raster)       |
| `tick`/`loop` | the rim detail marks and the gate loops                      |

## 4. The solid planes

An icon is a stack of solid planes, not a pile of strokes and not an outline drawing.

1. **The filled path.**

    Every component is a FILLED path: a closed component fills its polygon (a solid face), an open
    component fills its stroke envelope (a ribbon).

2. **The depth.**

    Each component carries a depth; the scene paints in depth order, so an icon can have as many
    layers as it has components (20-60 in the current set).

3. **The occlusion.**

    An upper plane covers the lower one.

    There is no contour pass: the drawing is carried by the planes, their tones, and their
    occlusion.

4. **The top view.**

    The SVG is the TOP VIEW of that stack.

A frame or body plane is projected as a 3D solid seen from above: its silhouette, the ribs from the
silhouette to the top face, and the top face itself, at a shrinking scale and an optional twist.

The projection parameters come from the composition (`solid: { shrink, twist, ribs }`), and a
released changelog version adds one further nested face (the "age" face), so history deepens the
solid.

Tones are per layer: frame `accent2`, body `ink`, detail `tint`, core `accent`.

Mono uses one ink with per-layer opacity (frame 0.55, body 0.85, detail 0.3, core 0.7) plus
per-feature opacity for the top face (0.55) and ribs (0.4); overlaps darken, so the stack reads as
an embossed solid.

## 5. The composition matrix

`Composition.mjs` maps a profile to design decisions. It is pure and deterministic.

### 5.1 Role -> form -> candidate families

| Role           | Form    | Families                    | Why                                                 |
| -------------- | ------- | --------------------------- | --------------------------------------------------- |
| `interceptor`  | star    | spikeStar, crossStar        | a hook intercepts a flow: arms and rays             |
| `transformer`  | chevron | chevronRing, divisionTile   | transformation: a folded edge or a subdivided field |
| `router`       | trellis | trellisKnot, octagonStar    | routing: a lattice of paths                         |
| `store`        | diamond | diamondLattice, knotSquare  | storage: nested closed cells                        |
| `renderer`     | rosette | rosette, quatrefoil         | rendering: a radial bloom                           |
| `governor`     | scallop | scallopRing, knotSquare     | a rule boundary: a scalloped wall                   |
| `orchestrator` | hexagon | isometricTiles, octagonStar | orchestration: stacked volumes                      |
| `analyzer`     | ring    | crescentRing, teardropOrbit | analysis: an orbit of observations                  |

### 5.2 The other axes

| Axis     | Source                                     | Values                                     |
| -------- | ------------------------------------------ | ------------------------------------------ |
| symmetry | branching = events + services              | 4, 6, 8, 12 (bidirectional bumps one step) |
| phase    | streaming pins 0; otherwise the seed       | 0, 15, 30, 45, 60, 90                      |
| density  | weight (functions quartile) + role bump    | 0-3                                        |
| void     | containment (injections, services, bundle) | 0-2                                        |
| accent   | role group                                 | interruption, core, orbit, balance         |

## 6. The compatibility rules

The matrix does not randomise attributes independently; it applies rules and records them.

| Rule                           | Trigger                           | Effect                   |
| ------------------------------ | --------------------------------- | ------------------------ |
| `dense-body-sparse-rim`        | density >= 2                      | seam ticks are dropped   |
| `large-void-restrained-detail` | void >= 1                         | ledger beads are dropped |
| `framed-rim-restrained`        | a family that draws its own frame | ledger beads are dropped |
| `high-symmetry-restraint`      | symmetry 12                       | detail beads capped at 3 |
| `streaming-direction`          | streaming profile                 | phase fixed to 0         |
| `stateful-core`                | stateful profile                  | core void +1             |

## 7. The semantic layers

The profile chooses the form; the package's own tokens attach the layers, so a visual feature exists
only when the code fact does.

| Token       | Layer  | Drawn as                                         |
| ----------- | ------ | ------------------------------------------------ |
| `gate`      | detail | one loop on the rim per subscribed event         |
| `tool`      | detail | one bead per registered tool                     |
| `service`   | core   | the medallion (only when the family has no core) |
| `injection` | core   | up to two inner rings                            |
| `seam`      | detail | ticks on the rim                                 |
| `ledger`    | detail | beads on the inner ring                          |
| `stream`    | body   | a spiral at the centre                           |
| `state`     | core   | two nested rings                                 |
| `trace`     | frame  | an echo of the body silhouette, scaled 1.06      |
| `transform` | detail | a cusp pair on the rim                           |
| changelog   | detail | one evolution ring per released version          |

## 8. Verification

Six arbiters, all deterministic and dependency-free.

| Arbiter                        | Proves                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `Test/Icons/Check.mjs`         | determinism, coverage, size, uniqueness, twins, ledger, tree                    |
| `Test/Icons/Topology.mjs`      | finite geometry, frame present, component floors/ceilings, no self-intersection |
| `Test/Icons/Interventions.mjs` | one feature changes its own components and leaves identity                      |
| `Test/Icons/Diversity.mjs`     | collection-level spread: families, silhouettes, symmetry, tuples                |
| `Test/Icons/Profiles.mjs`      | every profile field, evidence, and at least two packages per role               |
| `Test/Icons/Composition.mjs`   | the matrix, the rules, and determinism                                          |

Current result: 14/14, 1/1, 17/17, 11/11, 4/4, 19/19; 102 unique icons; 14 families; 12 silhouettes.

## 9. What is not implemented

The relationship graph between components, explicit void regions with `keep-clear`/`subtract`, the
boundary-driven stroke class, the raster analysis pipeline that proposes constructions from the
reference sheet, candidate generation with constraint selection, small-size render profiles, and the
local repair loop.

They are recorded in `Reference/Curated/COMPOSITION-MODEL.md` and
`Reference/Curated/REVERSE-ENGINEERING.md`.

---

_The profile supplies the sentence; the matrix supplies the grammar; the slab stack is the icon._
