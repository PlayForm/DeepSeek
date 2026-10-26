# Reference - the procedural-rendering toolchain

The external sources behind the icon generator's rendering pipeline: the libraries that
implement stroke geometry, offsetting, boolean operations, clearance, colour and export.

Rebuilt on 2026-10-26 through the `source-pipeline` skill: every page is archived as a
rendered DOM under `Archive/HTML/` and converted with pandoc from the full DOM, so the
Markdown keeps its headings, tables and code fences. The index below is generated from the
run's own slug plan and status table.

```text
Reference/
  README.md          this index: source -> link -> local file -> status
  Archive/HTML/      the rendered DOM of every fetched page (the source of record)
  Raw/               the converted Markdown, one .md per fetched URL
  Curated/           our distilled decisions
  Specimens/         rendered specimen sheets
  Assets/            source imagery
  fetch-errors.log   every URL that failed, with its exit code and message
```

## Libraries

| Source | Link | Raw file | Status |
| --- | --- | --- | --- |
| Paper.js - The Swiss Army Knife of Vector Graphics Scripting [![CI](ht | https://github.com/paperjs/paper.js | `Raw/paperjs-paper-js.md` | fetched |
| Path | https://paperjs.org/reference/path/ | `Raw/reference-path.md` | fetched |
| Smoothing, Simplifying & Flattening | https://paperjs.org/tutorials/paths/smoothing-simplifying-flattening/ | `Raw/paths-smoothing-simplifying-flattening.md` | fetched |
| paperjs-offset | https://github.com/glenzli/paperjs-offset | `Raw/glenzli-paperjs-offset.md` | fetched |
| Clipper2 | https://github.com/AngusJohnson/Clipper2 | `Raw/angusjohnson-clipper2.md` | fetched |
| Clipper2 - Polygon Clipping Offsetting & Triangulating | https://www.angusj.com/clipper2/Docs/Overview.htm | `Raw/docs-overview.md` | fetched |
| clipper2-wasm![TypeScript icon, indicating that this package has built | https://www.npmjs.com/package/clipper2-wasm | `Raw/package-clipper2-wasm.md` | fetched |
| clipper2-ts | https://github.com/countertype/clipper2-ts | `Raw/countertype-clipper2-ts.md` | fetched |
| [!Screenshot](/steveruizok/perfect-freehand/blob/main/assets/perfect-f | https://github.com/steveruizok/perfect-freehand | `Raw/steveruizok-perfect-freehand.md` | fetched |
| polygon-clipping | https://github.com/mfogel/polygon-clipping | `Raw/mfogel-polygon-clipping.md` | fetched |
| svg-path-outline | https://github.com/danmarshall/svg-path-outline | `Raw/danmarshall-svg-path-outline.md` | fetched |
| svg-path-outline | https://danmarshall.github.io/svg-path-outline/browser/ | `Raw/svg-path-outline-browser.md` | fetched |
| Javascript library for 2d geometry | https://github.com/alexbol99/flatten-js | `Raw/alexbol99-flatten-js.md` | fetched |
| svg-path-properties | https://github.com/rveciana/svg-path-properties | `Raw/rveciana-svg-path-properties.md` | fetched |
| svg-path-properties | https://geoexamples.com/svg-path-properties/ | `Raw/svg-path-properties.md` | fetched |
| svg-path-intersections | https://github.com/herrstrietzel/svg-path-intersections | `Raw/herrstrietzel-svg-path-intersections.md` | fetched |
| seedrandom.js | https://github.com/davidbau/seedrandom | `Raw/davidbau-seedrandom.md` | fetched |
| jwagner-simplex-noise-js | https://github.com/jwagner/simplex-noise.js | `Raw/jwagner-simplex-noise-js.md` | fetched |
| Color functions for JavaScript | https://culorijs.org/ | `Raw/culorijs-org.md` | fetched |
| Color.js [v0.7.1](https://github.com/LeaVerou/color.js/releases/) | https://colorjs.io/ | `Raw/colorjs-io.md` | fetched |
| SVG.js | https://svgjs.dev/ | `Raw/svgjs-dev.md` | fetched |
| SVG.js | https://github.com/svgdotjs/svg.js | `Raw/svgdotjs-svg-js.md` | fetched |
| Rough.js | https://roughjs.com/ | `Raw/roughjs-com.md` | fetched |
| SVGO [![npm](https://camo.githubusercontent.com/eb8988f721887a88d75c97 | https://github.com/svg/svgo | `Raw/svg-svgo.md` | fetched |
| resvg-js | https://github.com/thx/resvg-js | `Raw/thx-resvg-js.md` | fetched |

## Generative examples (both paperjs.org pages were bot-walled; fetch the repository source instead)

| Source | Link | Raw file | Status |
| --- | --- | --- | --- |
| examples-division-raster | https://paperjs.org/examples/division-raster/ | - | blocked |
| examples-q-bertify | https://paperjs.org/examples/q-bertify/ | - | blocked |

## Composition model

| Source | Link | Raw file | Status |
| --- | --- | --- | --- |
| view-9131 | https://mgv.sggw.pl/article/view/9131 | - | blocked |
| Tdesigners and (or) automate parts of the design process. The ability | https://fab.cba.mit.edu/classes/865.18/design/generative/shapeAlgorithms.pdf | `Raw/generative-shapealgorithms-pdf.md` | fetched |
| 10-1145-3757377-3764004 | https://dl.acm.org/doi/full/10.1145/3757377.3764004 | - | blocked |
| svg2-painting | https://www.w3.org/TR/SVG2/painting.html | - | blocked |
| fill-rule | https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill-rule | `Raw/attribute-fill-rule.md` | fetched |
| stroke-miterlimit | https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-miterlimit | `Raw/attribute-stroke-miterlimit.md` | fetched |
| SVG Strokes | https://svgwg.org/specs/strokes/ | `Raw/specs-strokes.md` | fetched |
| wd-svg-20000629-painting | https://www.w3.org/TR/2000/WD-SVG-20000629/painting.html | - | blocked |
| Fills and Strokes in SVG – Attributes and Examples | https://docs.aspose.com/svg/tutorial/fills-and-strokes/ | `Raw/tutorial-fills-and-strokes.md` | fetched |
| SVG Stroke Attributes | https://www.w3schools.com/graphics/svg_stroking.asp | `Raw/graphics-svg-stroking.md` | fetched |
| Paths | https://paperjs.org/tutorials/paths/ | `Raw/tutorials-paths.md` | fetched |
| PathItem | https://paperjs.typogram.co/paths/pathitem | `Raw/paths-pathitem.md` | fetched |
| Path Creation and Manipulation | https://deepwiki.com/paperjs/paper.js/3.1-path-creation-and-manipulation | `Raw/paper-js-3-1-path-creation-and-manipulation.md` | fetched |
| Path System | https://deepwiki.com/paperjs/paper.js/3-path-system | `Raw/paper-js-3-path-system.md` | fetched |

## Analysis sources

| Source | Link | Raw file | Status |
| --- | --- | --- | --- |
| Skeletonize[\#](#skeletonize) | https://scikit-image.org/docs/stable/auto_examples/edges/plot_skeleton.html | `Raw/edges-plot-skeleton.md` | fetched |
| Goal | https://docs.opencv.org/4.13.0/d2/dbd/tutorial_distance_transform.html | `Raw/dbd-tutorial-distance-transform.md` | fetched |
| project-svgpathtools | https://pypi.org/project/svgpathtools/ | `Raw/project-svgpathtools.md` | fetched |
| svgpathtools | https://github.com/mathandy/svgpathtools | `Raw/mathandy-svgpathtools.md` | fetched |
| svg2-paths | https://www.w3.org/TR/SVG2/paths.html | - | blocked |
| Paths | https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Paths | `Raw/svg-from-scratch-paths.md` | fetched |
| An Interactive Guide to SVG Paths | https://www.joshwcomeau.com/svg/interactive-guide-to-paths/ | `Raw/svg-interactive-guide-to-paths.md` | fetched |
| signed_distance.h | https://github.com/libigl/libigl/blob/main/include/igl/signed_distance.h | `Raw/igl-signed-distance-h.md` | fetched |
| libigl tutorial | https://libigl.github.io/tutorial/ | `Raw/tutorial.md` | fetched |
| Geometry Processing Functions[¶](#geometry-processing-functions) | https://pymesh.readthedocs.io/en/latest/api_geometry_processing.html | `Raw/latest-api-geometry-processing.md` | fetched |
| Python library for working with SVG paths | https://github.com/vistuleB/svgpathsio | `Raw/vistuleb-svgpathsio.md` | fetched |

## Fetch status (2026-10-26)

45 pages fetched of 52 URLs; 7 blocked, all retried once and recorded in
`fetch-errors.log` with their exit codes: two Paper.js example pages are bot-walled,
and five sources answer with a Cloudflare JS challenge or time out. The SVG2 paths
page is represented by the MDN tutorial instead.

## Licensing

Paper.js, paperjs-offset and perfect-freehand document MIT; Clipper2 uses the Boost
Software License. Verify the exact package and release before adopting any of them,
especially the third-party ports and wrappers.
