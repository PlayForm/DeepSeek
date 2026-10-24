// Kinds - the graph node kinds each search intent EXPECTS to find at its
// candidates (the P2 projection's kind test). The order is the preference:
// Measure picks the first expected kind present at a path, so a suite file
// answers a Test intent with its `Test` node (not its `File` node) and a
// definition answers a Symbol intent with its `Symbol` node.
//
// The node kinds are the graph's frozen vocabulary (Interface/Node of
// plugin-dsh-workspace-graph): File, Symbol, Block, Test, DocSection. An
// intent absent here expects nothing in particular, and every hit counts as
// an unexpected kind (the lower literal tier).
export default {
	Version: ["File", "Symbol", "Block"],
	Path: ["File", "Symbol", "Block"],
	Ledger: ["File", "Symbol", "Block"],
	Config: ["File", "Symbol", "Block"],
	Dependency: ["File"],
	Test: ["Test", "File"],
	Symbol: ["Symbol", "Block", "File"],
	Doc: ["DocSection", "File"],
	Usage: ["File", "DocSection"],
	Owner: ["File", "DocSection"],
} as Record<string, string[]>;
