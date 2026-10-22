// DefaultLens - the shipped lens catalog (DATA, not code): the attention
// projection's selectable views. A lens names the node kinds eligible as
// focus/neighbors and the edge kinds that count as neighbors; the packet
// builder filters both through the active lens. V4-1 section 3.5 leaves the
// lens set open; the smallest faithful reading ships three:
//
//   code  - Symbols, Blocks, Files; the code-carrying edges
//           (imports, calls, references, tests) - the default;
//   docs  - DocSections; the contains edges that carry them;
//   tests - Tests; the tests/contains edges that bind them.
//
// The graph's v0 edge set is contains/imports (WAVE-1-BRIEF section 4.1);
// the lens table already names the full v4-1 edge vocabulary so later waves
// need no lens change.
import type Lens from "@Interface/Lens.js";

const DEFAULT_LENS: Lens[] = [
	{
		name: "code",
		nodes: ["File", "Symbol", "Block"],
		edges: ["imports", "calls", "references", "tests", "contains"],
	},
	{ name: "docs", nodes: ["DocSection", "File"], edges: ["contains"] },
	{ name: "tests", nodes: ["Test", "File", "Symbol"], edges: ["tests", "contains"] },
];

export default DEFAULT_LENS;
