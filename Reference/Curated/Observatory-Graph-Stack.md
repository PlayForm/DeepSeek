# Graph stack: fCoSE constraints, ELK layered, and the worker bridge

> Statement: The graph-stack sources establish two layout engines the site can adopt: fCoSE, a
> compound-spring embedder for Cytoscape.js whose quality, randomize, constraint, and packComponents
> options are documented defaults, and ELK layered, a Sugiyama-style layerer whose direction,
> layering, crossing, placement, and routing options are documented defaults. They also establish
> that ELK computes positions and nothing else, so time, rendering, and rendered edge routes are the
> integrator's responsibilities.

## fCoSE options that matter

- quality: "draft" only applies the spectral layout; "default" improves quality with incremental
  layout at a fast cooling rate; "proof" with a slow cooling rate. Adopt "proof" for anything that
  must be reproducible.
- randomize: "Use random node positions at beginning of layout / if this is set to false, then
  quality option must be 'proof'". Adopt randomize: false with quality: "proof" wherever a fixed
  recorded layout must survive a reload, such as the story pages' static frames.
- fixedNodeConstraint pins exact positions: "fixedNodeConstraint: [{nodeId: 'n1', position: {x: 100,
  y: 200}}, {...}]". Adopt it to anchor the nodes a captured layout depends on.
- packComponents packs disconnected components, but "cytoscape-layout-utilities extension should
  also be registered in the application". Adopt: register cytoscape-layout-utilities first or leave
  the option unset.
- The constraint set has three forms, fixed node, alignment, and relative placement, and the 2.0.0
  release note adds per-element values for nodeRepulsion, idealEdgeLength, and edgeElasticity.

## The compound-graph caveat

- fCoSE "supports user-defined placement constraints as well as its full support for compound
  graphs", and "These constraints may be defined for simple nodes." The two capabilities are
  separate: the ten group containers can be laid out as compounds, but fixed, alignment, and
  relative placement constraints bind to simple nodes only. The site must not constrain a group
  container.

## ELK layered for a left-to-right progression

- Adapter wiring: "The main field to set is `algorithm`, which controls which particular layout
  algorithm is used.", with the example "'algorithm': 'layered', 'elk.direction': 'DOWN'". For a
  left-to-right reading set 'elk.direction': 'RIGHT'.
- Documented defaults in the ELK layered reference: layering strategy NETWORK_SIMPLEX, crossing
  minimization LAYER_SWEEP, cycle breaking GREEDY, node placement BRANDES_KOEPF, and edge routing
  ORTHOGONAL. The site may rely on them without restating the values.
- Version floors: cytoscape-elk needs Cytoscape.js >= 3.2.0 and elkjs >= 0.9.2; fCoSE needs
  Cytoscape.js ^3.2.0 and cose-base ^2.0.0, with cytoscape-layout-utilities ^1.0.0 optional for
  packing.

## ELK computes positions and not time

- "Note that elkjs is not a diagramming framework itself - it computes positions for the elements of
  a diagram." And "elkjs itself is a graph layout engine _only_. In other words, no rendering,
  styling, etc. is provided."
- The site's rule: a layered layout's left-to-right direction expresses graph order; the timeline's
  left-to-right axis expresses recorded time. They are two different projections and must not share
  one engine's output: a layered layout must never be read as a time axis.

## The worker bridge and cancellation

- "Since laying out diagrams can be a time-consuming job (even for the computer), and since we don't
  want to freeze your UI, Web Workers are supported out of the box." The ELK constructor takes
  workerUrl, "a path to the `elk-worker.js` script. As a consequence the `ELK` will use a Web Worker
  to execute the layout."
- layout() "returns a `Promise`, which passes either the laid out graph on success or a (hopefully
  helpful) error on failure", and terminateWorker() calls "the worker's `terminate()` method".
- Adopt: run the layout in a worker and terminate it on dispose. The only documented stop is
  terminateWorker(); there is no documented per-layout cancellation, so the site must treat an
  in-flight layout as uninterruptible and design re-projections around it.

## The edge-routing gap in cytoscape-elk

- The adapter README documents per-node handling ("A function that applies a transform to the final
  node position") and the elk option block; it documents nothing about carrying ELK's computed edge
  bend points back into Cytoscape edge rendering.
- Adopt: treat edge routing as the site's own drawing concern. Do not claim that cytoscape-elk
  renders orthogonal or spline ELK routes; verify in a specimen before promising routed edges.

## What we reject

- Constraints on compound nodes, or randomize: false without quality: "proof".
- That ELK knows about time, renders anything, or animates anything.
- Per-layout cancellation of an elk.layout() call.
- packComponents without cytoscape-layout-utilities registered.
- Any fCoSE or ELK option value not listed above without a fresh source.

## Sources

- https://github.com/iVis-at-Bilkent/cytoscape.js-fcose - Reference/Raw/cytoscape-fcose.md
- Cytoscape.js news post "Cytoscape.js-fcose 2.0.0 released" (URL not recorded in the capture) -
  Reference/Raw/fcose-release.md
- https://github.com/cytoscape/cytoscape.js-elk - Reference/Raw/cytoscape-elk.md
- https://github.com/kieler/elkjs - Reference/Raw/elkjs.md
- https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html -
  Reference/Raw/elk-layered.md
