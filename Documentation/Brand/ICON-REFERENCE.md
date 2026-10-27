---
title: The icon reference sheet
category: Brand
kind: living-record
date: 2026-10-25
status: active
registry: Documentation/Brand/ICON-REFERENCE.md
index: Documentation/INDEX.md
statuses:
    - name: the sheet measured (lattice, sizes, stroke, palette, radial mass)
      state: implemented
      evidence: Temporary/Icon-Reference/Analysis.json, Contact-Sheet.png
    - name: all 29 motifs cut out and described
      state: implemented
      evidence: Temporary/Icon-Reference/Motifs/ (29 PNG, 4x), Rows/ (6 row sheets)
    - name: the component vocabulary derived from the cutouts
      state: implemented
      evidence: Documentation/Brand/ICON-GRAMMAR.md section 3
---

# ICON-REFERENCE.md - the 29 motifs, cut out and read

The sheet (`Temporary/Icon-Reference/Reference.jpg`, 730 x 975, cream paper) is a 6 x 5 lattice of
29 motifs.

This file is the per-motif reading behind `ICON-GRAMMAR.md`: each motif was cut out at 4x
(`Motifs/<id>.png`), the row sheets (`Rows/Row-<n>.png`) were read at 3x, and the measurements come
from `Temporary/Icon-Reference/Analyze.py`, which writes `Analysis.json`.

## The sheet's constants

| Property    | Value                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------ |
| Lattice     | 5 columns x 6 rows, 137 px pitch, 29 occupied slots (row 6 has 4)                          |
| Motif box   | 100-125 px, always centred, 25-40 px of paper between boxes                                |
| Stroke      | uniform 1.5-3 px, single weight per motif, no gradient or texture                          |
| Ink share   | 0.07-0.41 of the box (median 0.21): line-first, paper shows through                        |
| Radial mass | peaks in bands 2-3 of 6; the outer band is nearly empty                                    |
| Ink         | near-black, always hue-tinted (navy, maroon, brown, green, purple, grey)                   |
| Accent      | one hue per motif, as ink or as a light tint fill; two-hue motifs exist (R2C4, R2C5, R4C4) |
| Symmetry    | 4-fold dominant (19 motifs), 8-fold stars (6), 12-fold web (1), plus two 4-fold diamonds   |
| Mirror      | every motif read at 3x carries at least one mirror axis                                    |

## The motifs

The columns are the class (the body type), the order, the centre, the frame, the satellites, the
accent, and the stroke width.

"None" means the zone is empty.

| Id   | Class              | Order               | Body                                             | Core                        | Rim                            | Orbit                         | Accent                  | Stroke |
| ---- | ------------------ | ------------------- | ------------------------------------------------ | --------------------------- | ------------------------------ | ----------------------------- | ----------------------- | ------ |
| R1C1 | scroll-cross       | 4                   | four shield lobes + four C-scroll hooks          | cross of four small squares | none                           | none                          | `#57100D` red           | 2 px   |
| R1C2 | pinched star       | 8 (4 long, 4 short) | concave cusp arcs; leaf tips at the diagonals    | empty                       | none                           | tip leaves                    | `#070D1F` navy          | 2 px   |
| R1C3 | leaf fan           | 4                   | eight veined leaves, two per quadrant            | 4-point void                | scalloped square edge          | none                          | `#271A08` brown         | 2 px   |
| R1C4 | teardrop cross     | 4                   | four outward teardrops + four spiral hooks       | thin X                      | none                           | dots on the axes              | `#1A0807` maroon        | 2 px   |
| R1C5 | petal star         | 8                   | four pointed petals + four leaf pairs            | diamond outline             | none                           | none                          | `#080E1F` navy          | 2 px   |
| R2C1 | floral rosette     | 4                   | four petal clusters + four scrolls               | small circle                | none                           | bead-string dots              | `#1F0D08` black         | 2 px   |
| R2C2 | long spike star    | 8                   | four long cardinal spikes + four short diagonals | inner 4-point star          | none                           | eight dots between the points | `#0C2F0A` green         | 2 px   |
| R2C3 | minimal quatrefoil | 4                   | four outward teardrops                           | 4-lobed blob                | none                           | four diagonal dots            | `#5D0E09` red           | 2 px   |
| R2C4 | wavy tile          | 4                   | wavy square border                               | 4-point star + centre dot   | wavy square                    | four axis dots                | `#C67323` orange + navy | 3 px   |
| R2C5 | framed tile        | 4                   | fine scroll tile                                 | small star                  | thick red square + edge spikes | corner dots                   | `#56101B` red + navy    | 2 px   |
| R3C1 | scroll tile        | 4                   | dense fine scrollwork                            | cross                       | none                           | corner teardrops              | `#1A1307` black         | 2 px   |
| R3C2 | scalloped tile     | 4                   | scalloped inner border                           | square + small star         | double square frame            | corner dots                   | `#300C25` magenta       | 2 px   |
| R3C3 | quadrant tile      | 4                   | four swirl quadrants                             | pinwheel                    | square                         | none                          | `#180B05` black         | 2 px   |
| R3C4 | spiky star polygon | 8                   | long thin spikes                                 | star polygon + circle       | none                           | none                          | `#09111A` blue          | 2 px   |
| R3C5 | quatrefoil orbit   | 4                   | four cardinal teardrops                          | dot                         | none                           | four diagonal dots            | `#140928` navy          | 2 px   |
| R4C1 | leaf quatrefoil    | 4                   | four big leaf lobes                              | cross                       | none                           | inner dots                    | `#0C2C0C` green         | 2 px   |
| R4C2 | crescent ring      | 4                   | four crescents + four spirals                    | ring                        | none                           | dots                          | `#0A111C` navy          | 2 px   |
| R4C3 | long star          | 4                   | four needle points                               | diamond                     | none                           | tiny dots                     | `#F7E4B1` gold          | 2 px   |
| R4C4 | bicolor star       | 8                   | eight spikes, alternating navy/orange            | circle + dot                | none                           | none                          | `#140F53` navy + orange | 3 px   |
| R4C5 | interlace square   | 4                   | woven band square                                | inner square                | woven square                   | corner loops                  | `#240E1E` purple        | 2 px   |
| R5C1 | double star        | 8                   | eight thin spikes + inner 4-point star           | diamond                     | none                           | none                          | `#280A1A` maroon        | 3 px   |
| R5C2 | needle star        | 4                   | four needle spikes                               | small cross                 | none                           | four dots                     | `#240807` black         | 2 px   |
| R5C3 | interlace tile     | 4                   | woven knot frame                                 | scroll                      | woven square                   | corner knots                  | `#340E0A` red-brown     | 3 px   |
| R5C4 | floral knot        | 4                   | dense floral scroll                              | cross                       | none                           | dots                          | `#081021` grey-navy     | 2 px   |
| R5C5 | interlace diamond  | 4                   | woven 4-fold knot                                | diamond                     | pointed diamond                | none                          | `#160B06` black-brown   | 2 px   |
| R6C1 | diamond void       | 4                   | four teardrop voids                              | inner line                  | thick rhombus                  | none                          | `#1B0905` black         | 3 px   |
| R6C2 | warm scroll tile   | 4                   | four-fold scrollwork                             | 4-point star                | square                         | corner dots                   | `#F5D8AC` orange-cream  | 2 px   |
| R6C3 | quadrant dot tile  | 4                   | four quadrant blocks with dots                   | square + four dots          | square                         | dots                          | `#F9E5A3` yellow        | 2 px   |
| R6C4 | web star           | 8                   | radial web spokes + concentric arcs              | star                        | none                           | concentric arcs               | `#140A1E` black         | 2 px   |

## The five classes, read together

1. **Spike stars.**

    (R1C2, R2C2, R3C4, R4C3, R4C4, R5C1, R5C2, R6C4): a point is a triangle with concave sides, the
    body is n of them, the centre is small, and the orbit is dots or nothing.

    This is the hook grammar, where an arm intercepts the flow.

2. **Scroll and petal bodies.**

    (R1C1, R1C3, R1C4, R1C5, R2C1, R2C3, R3C1, R4C1, R4C2, R5C4): curved hooks, leaves, teardrops,
    and crescents, with the detail in the curvature and not in the count.

    This is the client and library grammar.

3. **Tiles.**

    (R2C4, R2C5, R3C2, R3C3, R6C2, R6C3, R6C1): a square or diamond frame with a repeat inside,
    where the frame is the contract and the repeat is the machinery.

    This is the plugin grammar.

4. **Interlace.**

    (R4C5, R5C3, R5C5): bands that cross over and under, with the under-band broken at the crossing.

    This is the seam reading of the plugin grammar.

5. **Webs.**

    (R6C4): spokes plus concentric arcs, and the only motif with a 12-fold repetition.

    This is the tracing reading of the library.

## What the generator took from the sheet

- The zone order (core, body, rim, and orbit) and the rule that a zone may be empty.
- The empty outer band: the orbit of the generator sits at r 43 and the rim at r 41-44, never a
  solid outer ring.
- The line-first rule: every generated document is stroke-only, and the only fill is a tint at 0.08
  (mono) or the palette tint (colour).
- The one-accent rule: each kind has exactly one accent hue, carried by the rim, the orbit, and the
  evolution rings.
- The two-scale rule: the silhouette plus a fine inner repeat (`detail` in the plan), never a single
  uniform texture.
