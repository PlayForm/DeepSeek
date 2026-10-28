/
# README.md
Copy path
More file actions
More file actions
[Hoist power-iteration buffers and compound tick rectangles](https://github.com/romanbsd/fcose/commit/a209a9050a1054ddb50e60a4edd1588a6348d91b)
Open commit details
Sep 5, 2026
[a209a90](https://github.com/romanbsd/fcose/commit/a209a9050a1054ddb50e60a4edd1588a6348d91b) · Sep 5, 2026
[History](https://github.com/romanbsd/fcose/commits/master/README.md)
Open commit details
History
215 lines (173 loc) · 8.44 KB
# fcose
A framework-independent, pure Dart port of [`cytoscape-fcose`](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) 2.2.0 and its required `cose-base` and `layout-base` foundations.
The package accepts a typed compound graph and returns deterministic node centers and rectangles. It has no Cytoscape.js, browser, Flutter, FFI, or JavaScript runtime dependency, and no package dependencies at all. Layout hot paths use compact packing structures and reduced allocation; see [Performance versus upstream](https://github.com/romanbsd/fcose/blob/master/README.md#performance-versus-upstream) for measured comparisons against cytoscape-fcose.
Layouts are reproducible: the same graph, options, and `seed` produce the same coordinates on the Dart VM and on dart2js.
## Install

```
dart pub add fcose:^0.1.0
```

## Usage

```
import 'package:fcose/fcose.dart';

final graph = FcoseGraph(
  nodes: const [
    FcoseNode(id: 'cluster'),
    FcoseNode(id: 'api', width: 72, height: 48, parentId: 'cluster'),
    FcoseNode(id: 'database', width: 72, height: 48, parentId: 'cluster'),
    FcoseNode(id: 'client', width: 72, height: 48),
  ],
  edges: const [
    FcoseEdge(
      id: 'request',
      source: 'client',
      target: 'api',
      idealLength: 80,
    ),
    FcoseEdge(
      id: 'query',
      source: 'api',
      target: 'database',
      idealLength: 80,
    ),
  ],
);

final result = FcoseLayout(
  options: const FcoseOptions(
    quality: LayoutQuality.proof,
    seed: 7,
    idealEdgeLength: 80,
  ),
).run(graph);

final apiCenter = result.positionOf('api');
final clusterBounds = result.rectOf('cluster');
final everything = result.boundsOf(['api', 'database', 'client']);
```

`FcoseResult` carries `positions` and `rectangles` for every node, compounds included, plus the `iterations` the spring embedder actually ran. `positionOf`, `rectOf`, and `boundsOf` throw on an unknown ID rather than returning null.
### Semantics worth knowing before the first run
  * Node `width` and `height` are measured layout dimensions; the layout never resizes a node, it only places it.
  * Edge ideal lengths are boundary-to-boundary distances, as in CoSE, not center-to-center distances.
  * With `randomize: false` every leaf node must carry an initial position; the layout refines what it is given instead of inventing a start.
  * A compound node's rectangle is derived bottom-up from its children plus `compoundPadding`; giving one a width and height does not pin its size.
  * Scalar force defaults can be replaced with typed per-element resolvers: `nodeRepulsionFor`, `idealEdgeLengthFor`, `edgeElasticityFor`, and the two tiling-padding resolvers. Each is evaluated once per layout run, and an explicit value on `FcoseNode` or `FcoseEdge` wins over a resolver.


### Constraints

```
const FcoseOptions(
  fixedNodes: [FixedNodeConstraint('client', Offset(0, 0))],
  alignment: AlignmentConstraint(vertical: [['api', 'database']]),
  relativePlacements: [
    RelativePlacementConstraint.vertical('api', 'database', gap: 120),
  ],
);
```

`vertical` alignment means a shared x coordinate, `horizontal` a shared y. An omitted `gap` follows upstream and resolves to the average ideal edge length plus half of each endpoint's size on the constrained axis. As upstream does, any constraint disables zero-degree tiling and component packing for the run.
## Performance versus upstream
Wall times below compare an AOT Dart binary (`dart compile exe`) to cytoscape-fcose 2.2.0 under Node.js on the same 800-node grid (`quality: proof`, packing and tiling off, seed 7). Use AOT for this kind of comparison: `dart run` is a JIT session and understates the port on long spring runs.  
| Workload  | Dart AOT  | cytoscape-fcose 2.2.0  | Speedup  |  
| --- | --- | --- | --- |  
| Common path — `randomize: true`, ~100 spring ticks  | 31 ms  | 105 ms  | 3.3×  |  
| Long CoSE — `randomize: false`, `step: cose`, identical starts, 2900 ticks  | 1295 ms  | 2078 ms  | 1.6×  |  
The long-path row feeds both sides the same leaf coordinates so each runs the same tick count; a different start PRNG can stop early and is not comparable. Measured on macOS arm64 (Apple Silicon) with Node v26.
Reproduce:

```
dart compile exe -o /tmp/fcose_bench tool/bench_layout.dart
/tmp/fcose_bench
cd tool/oracle  npm install  node bench.js
```

`tool/bench_layout.dart` times the Dart side; `tool/oracle/bench.js` times the upstream layout. For a tick-matched long run, share one position dump between them rather than regenerating starts independently.
## Parity with upstream
Parity with cytoscape-fcose is this port's primary design constraint, and it is measured rather than asserted. The repository carries a differential harness that runs the original JavaScript under headless Cytoscape on the same fixture and diffs the coordinates:

```
cd tool/oracle  npm install
dart run tool/parity.dart tool/oracle/specs/*.json --tolerance 0.5
```

24 fixtures cover unconstrained, constrained, randomized, draft, compound, tiled, and packed runs. 23 agree with upstream to about 1e-13; the 24th is a known upstream defect, described below. The suite also pins those coordinates as expectations in `test/fcose_test.dart`, so a regression fails without Node.js installed.
### Known divergences and limits
  * `draft-disconnected` is the one fixture this port does not reproduce, because upstream is wrong there: the two-node shortcut in `spectral.js` adds the default function-valued `idealEdgeLength` to a coordinate without calling it, so every component of exactly two nodes comes back with a concatenated string and a `NaN`. This port computes the placement numerically instead.
  * Randomized differential coverage of uncommon topology, overlapping alignment, and fixed-node combinations is still thinner than the rest.
  * Component packing inherits layout-utilities' grid sizing, which scales with the square of the component count and inversely with node size. Many small components spread far apart can therefore ask for a grid too large to allocate; the packer refuses such input with an `ArgumentError` instead of attempting it. Raise `polyominoGridSizeFactor` or pack fewer components per run.
  * Browser presentation concerns — animation, viewport fitting, event emission, Cytoscape collection adaptation — are intentionally outside a renderer-independent layout engine.


## What is implemented
**Spectral start.** Sampled deterministic initialization with greedy or random sampling, power iteration, a JAMA singular value decomposition transcribed from layout-base, and dummy connections that reach disconnected root and nested-owner child components.
**Spring embedding.** Rectangle-clipped CoSE springs, overlap separation, per-node repulsion over CoSE-clamped grid neighborhoods, gravity, cooling, and convergence; same-owner leaf reduction with ten-tick staged regrowth and post-growth cooling; optional `uniformNodeDimensions` center-distance forces.
**Compound graphs.** Bottom-up bounds with per-node Cytoscape-style padding and a layout-wide fallback, live compound forces, nesting-aware edge lengths, compound gravity, and label geometry.
**Disconnected components.** Component detection, original-center relocation, layout-utilities-compatible randomized polyomino packing, and incremental POSE packing for `randomize: false`.
**Tiling.** Area-ordered or caller-sorted zero-degree tiling with randomized sibling grouping, ideal-row-width organization, bottom-up clearing and repopulation of nested compounds, and run-scoped lazy padding resolvers.
**Constraints.** Transformed and displacement-relaxed fixed, alignment, and DAG placement constraints, cose-base-compatible cross-axis alignment dummy handling including fixed groups and deeply nested compounds, and axis-aware gaps for omitted relative placements.
**Options.** Typed quality, step, sampling, force, geometry, tiling, packing, and constraint options, including the `all`, `transformed`, `enforced`, and `cose` pipeline stages and the draft-quality bypass of the CoSE pipeline.
`CHANGELOG.md` records each parity slice as it landed.
## Upstream mapping  
| Dart concern  | Upstream source  |  
| --- | --- |  
| geometry, graph validation, components  | `layout-base`  |  
| spring embedding, cooling, compound bounds  | `cose-base`  |  
| spectral start, constraints, public options  |  `cytoscape-fcose` 2.2.0  |  
| component packing  |  `cytoscape-layout-utilities` 1.1.1  |  
The public API expresses these algorithms with Dart value types and enums instead of reproducing Cytoscape.js collection and callback conventions.
The upstream projects and this port are MIT licensed.
You can’t perform that action at this time. 
