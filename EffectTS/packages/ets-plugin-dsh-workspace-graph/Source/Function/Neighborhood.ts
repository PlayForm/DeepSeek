// Neighborhood - the connected component around an anchor file, the read
// query the graph-suggester's declared contract consumes
// (`ctx.workspaceGraph.neighborhood(path, limit)`). Synchronous and derived
// ONLY from the W1 graph: the anchor (definition), the files with an
// `imports` edge into it (importers, split into tests by the test-path
// pattern), the files the anchor imports (dependencies), and the
// DocSections in the anchor's own file (the doc block).
//
// The anchor is matched by exact display path first, then by path SUFFIX -
// the caller (a tool probe) usually carries a repo-relative path while the
// graph stores resolved display paths. No anchor, no entries: an unknown
// path is an empty component, never a guessed one. Entries are deduplicated
// by path (the strongest role wins), ordered by role rank and then by path,
// and sliced to `limit` (default 7 - the suggester's maxCandidates default).
//
// NOT FAKED: callers and references need the deferred `calls`/`references`
// edges; W1 serves importers only, and says so in SCHEME.md.
import type Neighborhood from "@Interface/Neighborhood.js";
import type Node from "@Interface/Node.js";
import type State from "@Interface/State.js";

import Expand from "./Expand.js";

const TestPath = /(^|\/)([^/]+\.test\.(ts|tsx|js)|Test\.tsx?)$/;

const Rank = new Map<string, number>([
	["definition", 4],
	["test", 3],
	["importer", 2],
	["dependency", 1],
	["doc", 0],
]);

const Reason = new Map<string, string>([
	["definition", "the definition"],
	["test", "the tests"],
	["importer", "the importers"],
	["dependency", "the dependencies"],
	["doc", "the doc block"],
]);

export default (StateRef: State, Path: string, Limit?: number): Neighborhood[] => {
	const Nodes = new Map<string, Node>();
	for (const Record of StateRef.Records.values()) {
		for (const NodeItem of Record.nodes) {
			Nodes.set(NodeItem.id, NodeItem);
		}
	}
	const Normal = Path.replace(/\\/g, "/").replace(/^\.\//, "");
	const Files = [...Nodes.values()].filter((NodeItem) => NodeItem.kind === "File");
	const Anchor =
		Files.find((File) => File.path === Normal) ??
		Files.find((File) => File.path.endsWith(`/${Normal}`));
	if (Anchor === undefined) {
		return [];
	}
	const Found = new Map<string, Neighborhood>();
	const Add = (EntryPath: string, Role: string): void => {
		const Existing = Found.get(EntryPath);
		if (Existing === undefined || (Rank.get(Role) ?? 0) > (Rank.get(Existing.role) ?? 0)) {
			Found.set(EntryPath, {
				path: EntryPath,
				role: Role,
				reason: Reason.get(Role) ?? Role,
			});
		}
	};
	Add(Anchor.path, "definition");
	for (const Record of StateRef.Records.values()) {
		for (const Edge of Record.edges) {
			if (Edge.kind !== "imports" || Edge.to !== Anchor.id) {
				continue;
			}
			const Source = Nodes.get(Edge.from);
			if (Source !== undefined && Source.kind === "File") {
				Add(Source.path, TestPath.test(Source.path) ? "test" : "importer");
			}
		}
	}
	for (const Edge of Expand(StateRef, Anchor.id, { kinds: ["imports"], depth: 1 }).edges) {
		const Target = Nodes.get(Edge.to);
		if (Target !== undefined && Target.kind === "File") {
			Add(Target.path, "dependency");
		}
	}
	for (const NodeItem of Nodes.values()) {
		if (NodeItem.kind === "DocSection" && NodeItem.path === Anchor.path) {
			Add(NodeItem.path, "doc");
		}
	}
	return [...Found.values()]
		.sort(
			(Left, Right) =>
				(Rank.get(Right.role) ?? 0) - (Rank.get(Left.role) ?? 0) ||
				Left.path.localeCompare(Right.path),
		)
		.slice(0, Math.max(0, Limit ?? 7));
};
