# Reference - the procedural-rendering toolchain

The external sources behind the icon generator's rendering pipeline: the libraries that implement
stroke geometry, offsetting, boolean operations, clearance, colour and export. Fetched from the
links in the procedural-rendering brief (`~/Downloads/dddddd.md`) on 2026-10-25 with the local
Crawl4AI server (v0.9.5, `read_url.py`, 40000-character cap), one Markdown file per URL.

Structure, matching the `Client/Hector/Reference` convention:

```text
Reference/
  README.md          this index: library -> link -> local file -> role
  Raw/               the fetched pages, one .md per URL, unedited
  Curated/           our distilled decisions (TOOLCHAIN.md)
  fetch-errors.log   any URL that failed to fetch, with the crawler's message
```

## The libraries

"Role" is where the library would sit in our pipeline; "Now" says what the generator does today.

| Library                  | Link                                                                  | Raw file                          | Role                                                            | Now                                                                    |
| ------------------------ | --------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Paper.js                 | https://github.com/paperjs/paper.js                                   | `Raw/paperjs.md`                  | precision Bezier geometry: split, boolean, trim, preserve cusps | not adopted (dependency-free envelope in `Maintain/Icon/Envelope.mjs`) |
| Paper.js path API        | https://paperjs.org/reference/path/                                   | `Raw/paperjs-path.md`             | the path API used for the precision backend                     | reference only                                                         |
| Paper.js flattening      | https://paperjs.org/tutorials/paths/smoothing-simplifying-flattening/ | `Raw/paperjs-flatten.md`          | curve-to-polyline tolerance control                             | reference only                                                         |
| paperjs-offset           | https://github.com/glenzli/paperjs-offset                             | `Raw/paperjs-offset.md`           | open/closed path offset, join/cap, stroke envelopes             | candidate for exact envelopes                                          |
| Clipper2                 | https://github.com/AngusJohnson/Clipper2                              | `Raw/clipper2.md`                 | polygon boolean + offset with joins/ends                        | candidate for cutouts and clearance polygons                           |
| Clipper2 docs            | https://www.angusj.com/clipper2/Docs/Overview.htm                     | `Raw/clipper2-docs.md`            | the offset and boolean semantics                                | reference only                                                         |
| clipper2-wasm            | https://www.npmjs.com/package/clipper2-wasm                           | `Raw/clipper2-wasm.md`            | Clipper2 in the browser/node via WASM                           | candidate                                                              |
| clipper2-ts              | https://github.com/countertype/clipper2-ts                            | `Raw/clipper2-ts.md`              | Clipper2 as TypeScript                                          | alternative to the WASM wrapper                                        |
| perfect-freehand         | https://github.com/steveruizok/perfect-freehand                       | `Raw/perfect-freehand.md`         | pressure/taper stroke envelopes from sampled points             | candidate for tapered ribbons                                          |
| polygon-clipping         | https://github.com/mfogel/polygon-clipping                            | `Raw/polygon-clipping.md`         | polygon union/difference; cleaning self-crossing envelopes      | candidate                                                              |
| svg-path-outline         | https://github.com/danmarshall/svg-path-outline                       | `Raw/svg-path-outline.md`         | centerline to outline path                                      | candidate                                                              |
| svg-path-outline demo    | https://danmarshall.github.io/svg-path-outline/browser/               | `Raw/svg-path-outline-demo.md`    | the behaviour, visually                                         | reference only                                                         |
| flatten-js               | https://github.com/alexbol99/flatten-js                               | `Raw/flatten-js.md`               | analytic intersections, inclusion, distance                     | candidate for exact clearance                                          |
| svg-path-properties      | https://github.com/rveciana/svg-path-properties                       | `Raw/svg-path-properties.md`      | length, point-at-length, tangent-at-length                      | candidate for beads/ticks on curves                                    |
| svg-path-properties docs | https://geoexamples.com/svg-path-properties/                          | `Raw/svg-path-properties-docs.md` | the API in prose                                                | reference only                                                         |
| svg-path-intersections   | https://github.com/herrstrietzel/svg-path-intersections               | `Raw/svg-path-intersections.md`   | path/shape intersections                                        | diagnostics only                                                       |
| seedrandom               | https://github.com/davidbau/seedrandom                                | `Raw/seedrandom.md`               | seeded PRNG, independent streams                                | not adopted (own xorshift32 in `Prng.mjs`)                             |
| simplex-noise            | https://github.com/jwagner/simplex-noise.js                           | `Raw/simplex-noise.md`            | coherent noise with a seeded RNG                                | optional modulation                                                    |
| Culori                   | https://culorijs.org/                                                 | `Raw/culori.md`                   | colour manipulation, perceptual spaces                          | candidate for palette generation                                       |
| Color.js                 | https://colorjs.io/                                                   | `Raw/colorjs.md`                  | OKLab/OKLCH colour                                              | alternative to Culori                                                  |
| SVG.js                   | https://svgjs.dev/                                                    | `Raw/svgjs.md`                    | SVG manipulation/animation, editor surface                      | optional editor                                                        |
| SVG.js repo              | https://github.com/svgdotjs/svg.js                                    | `Raw/svgjs-repo.md`               | the source                                                      | reference only                                                         |
| Rough.js                 | https://roughjs.com/                                                  | `Raw/roughjs.md`                  | sketch-style finish                                             | optional finish, not geometry                                          |
| SVGO                     | https://github.com/svg/svgo                                           | `Raw/svgo.md`                     | SVG optimisation after visual regression                        | optional export step                                                   |
| resvg-js                 | https://github.com/thx/resvg-js                                       | `Raw/resvg-js.md`                 | SVG to PNG rasterisation                                        | candidate for contact sheets/fixtures                                  |

## Licensing

Paper.js, paperjs-offset and perfect-freehand document MIT; Clipper2 uses the Boost Software
License. Verify the exact package and release before adopting any of them, especially the
third-party ports and wrappers.

## Fetch status (2026-10-25)

26 files for 25 URLs: all fetched through Crawl4AI v0.9.5 with a 40000-character cap. Two need a
note:

- `clipper2-wasm` publishes no npm README (the package page says so). The jsDelivr package page is
  fetched instead: `Raw/clipper2-wasm-jsdelivr.md`; the npm stub stays as `Raw/clipper2-wasm.md`.
- `svg-path-outline-demo` is a canvas demo: its text is three labels, so the file is a stub by
  nature. `Raw/svg-path-outline-demo.md` records that; the library's own page
  (`Raw/svg-path-outline.md`) carries the real content.

## The correction this reference exists for

Drawing the same centerline twice with two stroke widths is not a mini-outline: an SVG stroke is
centred on its path. The correct pipeline is centerline -> stroke envelope (the area the stroke
occupies) -> a fine contour around that envelope -> clearance measured on the envelopes.
`Maintain/Icon/Envelope.mjs` implements that in-house today; `Curated/TOOLCHAIN.md` records which
library replaces each in-house step when the dependency budget allows it.
