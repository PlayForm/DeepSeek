# The pictogram language

Source: `Reference/Assets/medical-pictograms.webp` (the pixel-art medical icon sheet the user
supplied as a second reference). This note extracts the traits the generator should borrow.

## What the sheet does

| Trait                      | What it looks like                                                                                     | What it means for us                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Pictogram silhouette       | every tile is a recognisable object: lungs, brain, eye, ear, hand, leg, a figure, a drop, a chair, Zzz | the silhouette must name the thing before any ornament          |
| Internal structure         | the lungs carry bronchi, the brain carries gyri, the eye carries a pupil and lids                      | the detail is INSIDE the silhouette, not around it              |
| Square plate               | every icon sits in a thin square frame on a dark ground                                                | a frame plate and a ground are part of the language             |
| Limited palette            | two or three inks per tile: red, white, yellow, green on near-black                                    | few tones, high contrast, no gradients                          |
| Offset echo                | edges show a red/cyan fringing, as if the channels are displaced                                       | a small translated echo of the body reads as a chromatic fringe |
| Filled shapes, no outlines | the forms are solid blocks of ink                                                                      | matches the solid-plane renderer: no contour pass               |
| Pixel grid                 | shapes are quantised to a coarse grid                                                                  | an optional finish, not a geometry requirement                  |

## What the generator takes from it

1. **A semantic pictogram in the core.** Each harness feature gets a small filled pictogram (chip,
   stacked layers, brackets, clock, magnifier, grid, shield, gear, window, book, target, chat, key)
   drawn with cutouts, placed as the core plane. The motif supplies the body; the pictogram supplies
   the meaning.
2. **Internal detail, not external outline.** Detail is drawn inside the silhouette (beads, rings,
   ribs, cutouts), never as a stroke around it.
3. **A limited tone set.** Three tones per icon: the body ink, the frame accent, the core accent,
   with a cream tint for the lightest plane. No gradients.
4. **An offset echo.** The Effect-TS trace already translates the body by 1.2 units; the colour
   render can use a small echo in the accent tone as the chromatic fringe.
5. **A plate and a ground.** The frame plane gives the plate; the site supplies the ground (light or
   dark), so the mono render stays `currentColor`.

## What it does not take

- The pixel grid and the medical subject matter are the sheet's own; the generator keeps vector
  geometry and the package's own semantics.
- The glitch treatment is a finish, not a construction rule.

## Relationship to the other references

`GENERATIVE-EXAMPLES.md` supplies the construction (division raster, isometric tiles);
`COMPOSITION-MODEL.md` supplies the relationships and voids; this note supplies the legibility rule:
a silhouette that names the thing, with its structure inside it.
