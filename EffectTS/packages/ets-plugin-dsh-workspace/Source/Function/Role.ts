// Role - the one-line role of a module file: the title of the FIRST
// DocSection in that file, else "module".
//
// THE LOOKUP USES THE GRAPH'S DECLARED `find` SEMANTICS - a case-insensitive
// SUBSTRING over the node id and name - never a glob. The earlier
// `<path>*` form only worked against the FakeGraph's glob matcher and never
// matched the real service (a live finding from the real-graph smoke). The
// candidate list is bounded (limit 50) and re-checked by exact path, so a
// substring collision (`core.ts` inside `core.tsx`) never picks the wrong
// file; a file with more than 50 matching DocSections honestly falls back to
// "module".
import type { WorkspaceGraph } from "@Interface/Graph.js";

export default (Graph_: WorkspaceGraph, Path: string): string => {
	const Sections = Graph_.find({ kind: "DocSection", pattern: Path, limit: 50 });
	return Sections.find((Section) => Section.path === Path)?.name ?? "module";
};
