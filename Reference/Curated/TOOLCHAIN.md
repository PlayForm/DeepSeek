# TOOLCHAIN.md - the distilled rendering-toolchain decision

Source: the procedural-rendering brief (`~/Downloads/dddddd.md`) and the 25
fetched pages in `Reference/Raw/`. This file is the DECISION layer: what the
generator uses today, what is a candidate, and what would replace what.

## 1. The pipeline, stage by stage

```text
plugin functionality
   -> semantic feature manifest        Maintain/Icon/Feature.mjs        (in-house)
   -> design grammar / method choice   Maintain/Icon/Matrix.mjs         (in-house)
   -> centerlines, polygons, cutouts   Maintain/Icon/Curve.mjs          (in-house)
   -> stroke-envelope construction     Maintain/Icon/Envelope.mjs       (in-house)
   -> clearance-aware composition      Maintain/Icon/Envelope.mjs       (in-house)
   -> colour and surface treatment     Maintain/Icon/Palette.mjs        (in-house)
   -> SVG / PNG / marketplace output   Maintain/Icon/Render.mjs, Index.mjs
```

The repository is dependency-free today and the generator is deterministic
because of it. The table below is the upgrade path, not an installation list.

| Stage | Today | Library that replaces it | Why the upgrade is worth it | Priority |
| ----- | ----- | ------------------------ | --------------------------- | -------- |
| Stroke envelope | `Envelope.mjs`: miter offset of the sampled centerline | paperjs-offset (offset an open/closed path with join/cap control) | exact joins at acute angles and tight curves; the in-house miter offset degrades there | 1 |
| Envelope cleanup | none (the samplers are star-shaped, so self-crossing is rare) | polygon-clipping or Clipper2 | a generated envelope can self-cross; a union pass removes the crossing before the contour | 2 |
| Mini contour | `contourOf`: the envelope grown by a hairline | paperjs-offset + Clipper2 difference | a true gap between stroke and contour needs offset + difference, not a wider stroke | 2 |
| Tapered strokes | `taperSpike` (filled triangle) | perfect-freehand | pressure/taper ribbons with real curvature | 3 |
| Beads/ticks on curves | `dotRing`/`tickRing` (even spacing on a circle) | svg-path-properties (point-at-length, tangent-at-length) | even spacing and orientation along ANY curve, not just a circle | 3 |
| Clearance | `Envelope.tooClose`: sampled centerline distance vs half-widths | flatten-js (analytic distance) or Clipper2 | exact envelope-vs-envelope clearance, including closed rings | 4 |
| Colour | `Palette.mjs`: fixed family lists + cream tint | Culori (OKLCH) | perceptual spacing and generated tints instead of hand lists | 5 |
| PRNG | `Prng.mjs`: xorshift32 | seedrandom (optional) | no need: ours is deterministic and dependency-free | - |
| Export/raster | rsvg-convert on the host | resvg-js | in-process PNG fixtures and contact sheets | 6 |
| SVG size | none | SVGO | after visual regression, never before | 7 |
| Editor | none | SVG.js | only if an interactive editor is ever wanted | - |
| Finish | none | Rough.js | an optional hand-drawn finish; not geometry | - |

## 2. The two corrections the brief makes that we adopted

1. **Open topology is preserved.** An open stroke may have a closed OUTLINE (a
   filled envelope) and still be an open motif: its terminals stay separate. The
   generator therefore never forces a `Z` onto a centerline; `Method.mjs` marks
   open parts and `Envelope.mjs` closes only the envelope around them.
2. **The mini-outline follows the envelope.** The contour is the envelope grown
   by a hairline and drawn UNDER the body, so it adds visible extent outside the
   stroke boundary - which is what the reference sheet does. Drawing the same
   centerline twice (the previous implementation) is retired.

## 3. What we deliberately do NOT adopt yet

- **Paper.js / Clipper2 / perfect-freehand as runtime dependencies.** They would
   make the icon set non-reproducible without a lockfile-installed node_modules,
   and the current pipeline is deterministic byte-for-byte. The upgrade is worth
   doing only with a visual-regression harness in place (see 4).
- **Rough.js as the default engine.** The sheet is inked, not sketched.
- **SVG.js.** No editor surface is requested.

## 4. Verification plan if a library is adopted

1. Generate the 102 icons with the in-house envelope, hash the tree.
2. Install the candidate behind a flag, generate again, diff the tree.
3. Render both sets with rsvg-convert at 40 px and 128 px; compare visually.
4. Only then replace the in-house step and re-baseline `Test/Icons/Check.mjs`.

## 5. Links

Every library in section 1 has its fetched page under `Reference/Raw/` and its
canonical link in `Reference/README.md`. Licensing: Paper.js, paperjs-offset and
perfect-freehand document MIT; Clipper2 uses the Boost Software License; verify
the exact package and release before adopting.
