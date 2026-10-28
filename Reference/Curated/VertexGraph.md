# Vertex - how the graph is assembled

> Decision: https://vertex.degree/ is not a cooperating-node runtime; it is "Start Doing Graph
> Theory", an introductory graph theory textbook by Mikhail Lavrov (CC BY-SA 4.0). What it
> establishes is the mathematical skeleton of a graph: vertices are a set of arbitrary objects,
> edges are unordered pairs of vertices, and walks are what move along edges. It is a useful
> vocabulary reference for how a graph of cooperating parts is _described_ - identity, adjacency,
> reachability, connected components - but it says nothing about nodes declaring needs or offers, or
> about a node reading another node's state. For a plugin family whose plugins must share each
> other's information, it supplies the structure words, not the data-flow contract: our family still
> needs its own rules (the trace bus, ctx.trace, the no-import rule) to get the cooperation the
> textbook models only abstractly.

## Sources

- Start Doing Graph Theory (home), https://vertex.degree/, Reference/Raw/vertex-degree.md, 882
  bytes, fetched OK (exit 0).
- Modeling Problems with Graphs (Chapter 1), https://vertex.degree/beginning/examples,
  Reference/Raw/vertex-degree-beginning-examples.md, 36289 bytes, fetched OK.
- Are These the Same? (Chapter 2, isomorphism), https://vertex.degree/beginning/isomorphism,
  Reference/Raw/vertex-degree-beginning-isomorphism.md, 36656 bytes, OK.
- Walks, Paths, and Cycles (Chapter 3), https://vertex.degree/beginning/walks,
  Reference/Raw/vertex-degree-beginning-walks.md, 34540 bytes, OK.
- Vertex Degrees (Chapter 4), https://vertex.degree/beginning/degrees,
  Reference/Raw/vertex-degree-beginning-degrees.md, 27190 bytes, OK.
- Header note: the crawl4ai output files carry no `via:` / `http:` / `markdown:` header lines; each
  file begins directly at the chapter title (e.g. "# Modeling Problems with Graphs"). The fetcher's
  stdout reported "via crawl4ai:fit" for all five pages.
- The beginning guide has exactly four chapters. The examples page links only one further
  /beginning/ page (walks, Ch 3); isomorphism and degrees were reached through walks' links. The "up
  to eight" cap was therefore not reachable; nothing under /beginning/ remains unfetched.

## The graph model

1. A graph is "a pair" of a vertex set and an edge set: the vertices are "a set of arbitrary objects
   called **vertices**", and each edge is "an unordered pair of vertices, or just a set of two
   vertices" (Definition 1.1, https://vertex.degree/beginning/examples). The objects' names and
   positions do not matter: "it doesn't matter at all which names we give them".
2. An edge is a symmetric, undirected relation between exactly two vertices: vertices are "adjacent"
   when they share an edge, and each is the other's "**neighbor**"; an edge's two vertices are its
   "**endpoints**" and the edge is "**incident**" to them (Definitions 1.2-1.3,
   https://vertex.degree/beginning/examples). The site warns to avoid the word "connect" informally
   because it has a technical meaning.
3. What flows along edges is not data but position: a "walk" is "a sequence of vertices ... such
   that ... consecutive vertices are adjacent"; a walk whose vertices are all distinct "represents"
   a path, and reachability is an equivalence relation whose classes are the "connected components"
   (Definitions 3.1-3.3, https://vertex.degree/beginning/walks). Components "basically do not
   interact with each other": a question about the graph can be answered per component (Chapter 3).
4. A node declares nothing. There is no notion of a vertex stating what it needs or offers; edges
   are chosen by the modeler to capture exactly the relationship the problem needs (Switzerland:
   border pairs; Hanoi: pairs of states one move apart; tiling: "an edge between two vertices if the
   tile placements they represent are incompatible", https://vertex.degree/beginning/examples).
5. The graph is assembled by _modeling choice_, not by an order: pick what the vertices are, then
   pick the edge rule. The book's own rule of thumb for Hanoi: build a graph "that will know
   everything about the rules of this puzzle, so that when we try to use graph theory to solve it,
   we will not need to know anything" (https://vertex.degree/beginning/examples). Chapter order runs
   examples -> isomorphism -> walks -> degrees, but that is exposition order, not an assembly
   procedure.
6. On reading another node's state: the closest the site comes is that a vertex's neighborhood is
   all it can "see" - reachability is defined purely by walking edges, and a vertex is characterized
   by its neighbors (the isomorphism check "for each vertex, you can check that its neighbors are
   the same", https://vertex.degree/beginning/isomorphism). Vertex degree, "the number of edges
   incident to it", is the first local statistic (https://vertex.degree/beginning/degrees). There is
   no shared store; two vertices exchange nothing, edges merely say the pair is related.
7. Composition operations exist at the graph level, not the node level: union ("all vertices and
   edges appearing in at least one of the two graphs"), disjoint union, and complement ("two
   vertices ... are adjacent in exactly ... when they are not adjacent" in the other), Definitions
   1.4-1.5, https://vertex.degree/beginning/examples. The dwarfs example shows two game graphs
   unioned into one status graph, sharing a vertex (dwarf 4) without sharing an edge.

## The worked examples

- Coloring Switzerland: map regions as vertices, shared borders as edges; asks the chromatic number
  question; defines the graph by stripping away everything but adjacency
  (https://vertex.degree/beginning/examples).
- The seven dwarfs: two card games' pair-graphs unioned, then complemented to get the missing
  matchups; counting edges gives a lower bound on rounds (https://vertex.degree/beginning/examples).
- Towers of Hanoi: vertices are "the set of all possible states of the puzzle", edges are single
  legal moves; a solution is a walk from start state to goal state
  (https://vertex.degree/beginning/examples).
- Zigzag tiling: vertices are single-tile placements, edges are overlaps; a solution is an
  independent set (or a clique in the complement) (https://vertex.degree/beginning/examples).
- Robot-arm photography: positions as vertices, motion times as edge weights; a weighted graph turns
  "visit efficiently" into a shortest/total-cost walk (https://vertex.degree/beginning/examples).
- Cars and drivers: a logic grid puzzle as a bipartite graph, people on one side, colors on the
  other; the solution is a perfect matching (https://vertex.degree/beginning/examples).
- Circulant graphs and isomorphism: two differently-built graphs turn out isomorphic by renaming
  vertices, showing identity is shape, not naming (https://vertex.degree/beginning/isomorphism).
- Three cups / cube graph: a state graph that is disconnected (an invariant parity split proves no
  solution), and BFS distances on the cube graph (https://vertex.degree/beginning/walks).

## What maps onto our family

- Vertices ~ plugins. Each plugin is one object with a name and a local function, like a vertex with
  a degree; adjacency is not identity, so the isomorphism chapter's lesson (same shape under
  renaming) supports the family's rule that identity lives in the package, not in another plugin's
  import.
- Edges ~ the trace bus, roughly. On this site an edge carries only the fact of a relationship; in
  the family, `lib-dsh-trace` vocabulary events flow on one shared bus, and each plugin's thin
  `Source/Trace/` adapter emits them through `ctx.trace` provided by `plugin-dsh-factory`. The bus
  is thus doing more than an edge does: it is the only channel, as edges are here, but it carries
  typed events rather than adjacency alone.
- Walks ~ a trace, roughly. A trace is a sequence of hops like a walk is a sequence of vertices; but
  the site's walker needs no carrier, while our hops must be attributable to a specific plugin via
  its adapter.
- Connected components ~ bundle scope, weakly. The site's components "do not interact"; in the
  family, plugins in a bundle cooperate through the bus while the no-import rule keeps
  plugin-to-plugin edges at zero - so our family is deliberately one connected component through the
  bus, with direct edges forbidden. The site has no rule like that.
- Differences, named as differences: the site has (a) no declaration of needs or offers per vertex,
  (b) no shared state any vertex can read, (c) no assembly order or manifest, (d) no vocabulary or
  schema for what moves. The family supplies all four (factory-provided `ctx.trace`, the trace
  vocabulary, the bundle build, the Source/Trace adapter contract). The site does not describe the
  family; the family is an engineering commitment the site's vocabulary happens to describe
  structurally.

## Open questions

- Nothing on the site addresses data flow: what content moves along an edge, who reads whose state,
  or how a node announces what it needs or offers. Those are the family's own contracts, not this
  site's.
- No notion of ordering or lifecycle: the site never says vertices or edges must be created in a
  sequence, so it cannot arbitrate when a plugin's trace adapter must exist relative to the factory.
- Directed or asymmetric relations are dismissed in one line ("puzzles where we cannot always
  reverse a move ... are more difficult to model"); a family with a one-way event bus would need
  more than this site offers.
- Weighted edges appear only as an aside (the robot arm); nothing about routing, filtering, or
  fan-out along edges.
- The site's assembly is a human modeling act; there is no automated assembler, so the plugin
  family's deterministic build has no counterpart here.
