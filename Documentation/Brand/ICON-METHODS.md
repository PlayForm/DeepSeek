---
title: The icon methods
category: Brand
kind: living-record
date: 2026-10-25
status: active
registry: Documentation/Brand/ICON-METHODS.md
index: Documentation/INDEX.md
statuses:
    - name: the 29 motifs broken down to construction method
      state: implemented
      evidence: sections 2 and 3 of this file
    - name: the method taxonomy and its parameters
      state: implemented
      evidence: section 4
    - name: the dispersal rule (method pool per zone)
      state: implemented
      evidence: section 5, Maintain/Icon/Method.mjs
---

# ICON-METHODS.md - the construction methods behind the 29 motifs

`ICON-GRAMMAR.md` records what the motifs ARE (class, order, zones). `ICON-REFERENCE.md` records
what each one looks like. This file records HOW each one is DRAWN - the minuscule construction
decisions that make the sheet read as a hand-inked collage rather than a generated rosette: closure,
terminals, junctions, taper, double lines, fills, bead strings, cusps.

The generator uses this as a METHOD POOL: each package draws 3-5 methods from it (gated by its
features, chosen by its seed, dispersed across zones), instead of drawing one grammar shape for
every package of a kind.

## 1. The dimensions of a method

Every motif is a point in this space. The values are read from the cutouts at 4x
(`Temporary/Icon-Reference/Motifs/`) and the measurements in `Analysis.json`.

| Dimension      | Values observed                                                                             |
| -------------- | ------------------------------------------------------------------------------------------- |
| Closure        | closed ring, closed tile, open stroke, mixed (closed body + open tips)                      |
| Stroke count   | 1 (single line), 2 (outline + inner line), 2 (double outline), 3+ (line + fill + line)      |
| Terminals      | butt (cut), round, pointed (the stroke tapers to a tip), curled (the stroke ends in a hook) |
| Junctions      | crossing, tangent, cusp (two arcs meet at a point), T, none (open)                          |
| Taper          | none, one end, both ends                                                                    |
| Fill           | none, tint (light accent), solid accent, cream (paper)                                      |
| Line weight    | fine (~1.5 px), medium (~2 px), bold (~3 px), mixed (bold outline + fine inner)             |
| Symmetry       | 4-fold, 8-fold, 12-fold; 1 or 2 mirror axes; a few with a broken detail                     |
| Ornament       | bead string, single dots, cusps, hooks, teardrops, crescents, quadrants, lattice, chevrons  |
| Negative space | open centre, void diamond, void teardrop, paper between double lines                        |

## 2. The 29 motifs, method by method

"Construction" names the drawing method, not the class. Two motifs of the same class can be built by
different methods (R1C2 vs R3C4 are both stars, one is an arc cusp star, the other a needle star).

| Id   | Construction              | Closure                            | Terminals       | Junctions           | Taper     | Fill                | Weight                   | Symmetry   |
| ---- | ------------------------- | ---------------------------------- | --------------- | ------------------- | --------- | ------------------- | ------------------------ | ---------- |
| R1C1 | scroll-cross              | open hooks on a closed cross       | curled          | T (hook meets bar)  | one end   | solid red           | bold                     | 4 + mirror |
| R1C2 | cusp star                 | open arc pair per point            | pointed         | cusp at each tip    | both ends | none                | fine                     | 8 (4+4)    |
| R1C3 | leaf fan                  | closed leaves                      | pointed         | tangent at the base | both ends | cream + dark line   | bold outline + fine vein | 4 + mirror |
| R1C4 | teardrop-cross            | closed teardrops + open hooks      | curled, pointed | tangent             | one end   | none                | fine                     | 4 + mirror |
| R1C5 | double-outline petal star | closed petals, double line         | pointed         | none                | none      | paper between lines | medium                   | 8          |
| R2C1 | rosette + bead string     | closed petals + open scrolls       | curled          | tangent             | one end   | none                | fine                     | 4 + mirror |
| R2C2 | long cusp star + beads    | open arc pairs + closed inner star | pointed         | cusp                | both ends | light green tint    | fine                     | 8 + mirror |
| R2C3 | minimal quatrefoil        | closed teardrops, open centre      | round           | none                | none      | none                | medium                   | 4 + mirror |
| R2C4 | wavy tile + inner star    | closed tile, open star             | pointed         | tangent             | one end   | orange tint         | bold                     | 4 + mirror |
| R2C5 | framed tile + scrollwork  | closed double frame + open inner   | butt            | T                   | none      | red + navy          | mixed                    | 4 + mirror |
| R3C1 | scroll tile               | closed tile, open scrolls          | curled          | tangent             | one end   | none                | fine                     | 4 + mirror |
| R3C2 | scalloped tile            | closed double frame + scallop      | round           | tangent             | none      | magenta line only   | medium                   | 4 + mirror |
| R3C3 | quadrant tile             | closed quadrants + open pinwheel   | butt            | T                   | none      | dark line only      | bold                     | 4 + mirror |
| R3C4 | needle star               | open needles + closed polygon      | pointed         | crossing            | both ends | none                | fine                     | 8 + mirror |
| R3C5 | quatrefoil + orbit dots   | closed teardrops + closed dots     | round           | none                | none      | none                | medium                   | 4 + mirror |
| R4C1 | leaf quatrefoil           | closed leaves + open inner         | pointed         | tangent             | both ends | green line only     | medium                   | 4 + mirror |
| R4C2 | crescent ring             | closed ring + closed crescents     | round           | tangent             | none      | none                | fine                     | 4 + mirror |
| R4C3 | long star                 | open needles                       | pointed         | crossing            | both ends | gold tint           | fine                     | 4 + mirror |
| R4C4 | bicolor star              | closed spikes, two fills           | pointed         | tangent             | none      | solid navy + orange | bold                     | 8 + mirror |
| R4C5 | interlace square          | open woven bands                   | butt            | over/under          | none      | none                | medium                   | 4 + mirror |
| R5C1 | double star               | closed spikes + closed inner star  | pointed         | tangent             | both ends | dark line only      | bold                     | 8 + mirror |
| R5C2 | needle star + dots        | open needles + closed dots         | pointed         | crossing            | both ends | none                | fine                     | 4 + mirror |
| R5C3 | interlace tile            | open bands + closed scroll         | butt            | over/under          | none      | rust line only      | bold                     | 4 + mirror |
| R5C4 | floral knot               | open scroll lattice                | curled          | tangent             | one end   | none                | fine                     | 4 + mirror |
| R5C5 | interlace diamond         | open woven bands                   | butt            | over/under          | none      | none                | medium                   | 4 + mirror |
| R6C1 | void diamond              | closed thick diamond, inner void   | butt            | none                | none      | dark solid          | bold                     | 4 + mirror |
| R6C2 | scroll tile               | closed tile + open scrolls         | curled          | tangent             | one end   | orange tint         | medium                   | 4 + mirror |
| R6C3 | quadrant tile + beads     | closed quadrants + closed beads    | round           | T                   | none      | yellow tint         | medium                   | 4 + mirror |
| R6C4 | web star                  | open web + closed star             | pointed         | crossing            | none      | none                | fine                     | 8 + mirror |

## 3. What the sheet is made of, counted

| Element            | Occurrences                        | Notes                                             |
| ------------------ | ---------------------------------- | ------------------------------------------------- |
| Open strokes       | 17 of 29 motifs carry at least one | hooks, needles, rays, woven bands, scroll lattice |
| Closed-only motifs | 8 of 29                            | the framed tiles and the minimal quatrefoils      |
| Pointed terminals  | 14 motifs                          | the star and needle families                      |
| Curled terminals   | 6 motifs                           | the scroll families                               |
| Butt terminals     | 5 motifs                           | the interlace and tile families                   |
| Double outline     | 5 motifs                           | R1C5, R2C1, R2C5, R3C2, R5C4                      |
| Tint fill          | 6 motifs                           | R1C3, R2C2, R2C4, R6C2, R6C3, R4C3                |
| Solid fill         | 3 motifs                           | R1C1, R4C4, R6C1                                  |
| Bead string        | 5 motifs                           | R2C1, R2C2, R2C5, R3C2, R6C3                      |
| Cusp               | 6 motifs                           | the star families                                 |
| Interlace          | 3 motifs                           | R4C5, R5C3, R5C5                                  |
| Broken symmetry    | 4 motifs                           | one ornament differs (a dot, a scroll, a tip)     |

The headline: **17 of 29 motifs contain an open stroke**, and the generated set had zero. That is
the largest single stylistic gap, and the reason every generated icon read as the same closed
rosette.

## 4. The method taxonomy (the pool)

Each method is a function in `Maintain/Icon/Method.mjs` returning parts with a closure flag, a tone
and an optional fill. The parameters are the measured ones.

| Method          | What it draws                             | Key parameters                          |
| --------------- | ----------------------------------------- | --------------------------------------- |
| `closedRing`    | a closed superellipse or lobed ring       | radius, power, lobes, inner/amplitude   |
| `doubleRing`    | a closed ring plus an inset second line   | radius, inset (3-4 units)               |
| `openRay`       | an open stroke to a sharp tip             | inner r, outer r, bend, cap butt        |
| `openNeedle`    | a straight open stroke through the motif  | inner r, outer r, cap butt              |
| `openHook`      | an S that curls inward and stops          | start angle, radius, curl 0.55, 120 deg |
| `openSpiral`    | a spiral winding inward, open             | turns 1.4, radius, direction            |
| `cuspPair`      | two arcs meeting at a sharp point         | spread 26 deg, rise 4                   |
| `taperSpike`    | a filled tapered spike (wide base, point) | half-width 4-7 deg, length 18-30        |
| `filledWedge`   | a filled quadrant wedge                   | angle, inner, outer                     |
| `beadString`    | dots along an arc                         | count 5-12, dot 0.5-1.5, radius         |
| `quadrantBlock` | an open square quadrant with an inset     | angle, inner, outer, inset              |
| `interlaceBand` | two bands crossing over/under             | count 4-8, width 4-6                    |
| `webLattice`    | open spokes plus arcs                     | spokes 8-12, radii 3-4                  |
| `scallopEdge`   | open scallop arcs on a rim                | lobes = order, radius                   |
| `squareFrame`   | a closed square or diamond frame          | half 42-46, double or single            |
| `voidDiamond`   | a thick closed diamond with an inner void | half 40, thickness 8                    |
| `bicolorSplit`  | alternating fills on a closed body        | two tones, split by index               |
| `dotOrbit`      | dots on a common radius                   | count 4-12, radius 42                   |

## 5. The dispersal rule (how the methods reach the packages)

1. **A method pool per zone.** Core: closedRing, voidDiamond, filledWedge. Body: closedRing,
   cuspPair, taperSpike, openRay, openHook, openSpiral, interlaceBand, webLattice, quadrantBlock.
   Ornament: beadString, openNeedle, dotOrbit. Rim: squareFrame, scallopEdge, interlaceBand,
   doubleRing.
2. **Gates pick the candidates**, the seed picks inside them. `events` and `seams` bias the OPEN
   methods (the interception reading), `bundle` and `services` bias the CLOSED methods (the
   containment reading), `functions` biases the detail methods, `changelogVersions` biases the
   evolution rings.
3. **Zone disjointness still holds.** Open strokes live inside their own annulus and stop before the
   next one; the interlace and web methods are confined to their band, so the collage rule of
   `ICON-GRAMMAR.md` is not violated.
4. **Closure mix is a per-package property.** A package's closure ratio (open / closed methods) is
   derived from its features and seed, so the family spans the sheet's 17-open / 8-closed spread
   instead of sitting at one end.
5. **Terminals and joins follow the method**, not a global constant: pointed (butt cap + miter
   join), curled (round cap), cut (butt cap). The renderer reads `plan.stroke.cap` and
   `plan.stroke.join`.

## 6. The layer matrix cube

An icon is a STACK OF LAYER CELLS, and the whole generator is a cube with three axes:

| Axis                            | Values                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| LAYER (spatial, outer -> inner) | `rim`, `evolution`, `detail`, `body`, `orbit`, `core`                                                             |
| METHOD (construction)           | the 18 methods of section 4                                                                                       |
| STYLE                           | tone (ink/accent/accent2), cap (butt/round), join (miter/round), fill (none/tint/solid/ink), weight, phase, order |

`Maintain/Icon/Matrix.mjs` selects **one cell per layer** for each package: the seed picks inside
the layer's method list, the closure bias and the layer level gate the candidates, and the style
axes come from the plan. `Compose.mjs` then stacks the cells in layer order - the icon is the
CONGREGATION of its cells.

Two properties the sheet shows and the cube makes explicit:

- **A layer may be empty.** A plain rim over a rich body and the reverse are both cells of the same
  cube (the layer's level is 0), which is how the sheet varies complexity per level rather than per
  motif.
- **A method may repeat across layers.** The same cusp in the body and in the rim is a family
  resemblance inside one motif; the cube allows it without a special case, because the method list
  is shared and only the annulus differs.

The consequence for the generator: an icon's identity is DISPERSED across its layers (no single
shape carries it), and two packages of the same kind converge on different visual features in
different spaces - which is what the reference sheet does across its 29 motifs.

---

_The sheet is a method library; the package picks its sentence from it._
