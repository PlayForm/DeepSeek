// Packet - the orientation packet builder (V4-1 §3.5): resolve the focus
// (a node id or a query), assemble the PacketView from the graph snapshot,
// rank the neighbors, and estimate the tokens against the budget. The
// packet is the orient step of the orient -> drill -> act loop; it carries
// the version always, so a stale view is detectable.
//
// HONESTY RULES (the smallest faithful readings, recorded in the SCHEME):
// - Rank order is edge-kind strength: "imports" beats "contains" (V4-1 §3.5:
//   a call beats a reference, a test beats a mention - the W1 graph has
//   neither calls nor references, so only imports and contains are ranked).
// - The OPEN lines name exactly what the W1 graph cannot answer (the
//   references/calls/tests edges are deferred to W2+ and are NOT faked).
// - The token estimate is characters / tokenCharsPerToken - no token counter
//   is injected in v0; the budget enforcement is honest about being an
//   estimate.
import type { Edge, Node, WorkspaceGraph } from "@Interface/Graph.js";
import type { PacketView } from "@Interface/Packet.js";
import type { NodeRow } from "@Interface/Query.js";
import type State from "@Interface/State.js";

/** The edge-kind strength rank (higher wins; W1 has these two kinds). */
const Strength: Record<Edge["kind"], number> = { imports: 2, contains: 1 };

/** Compact one node into the row shape the tools print. */
export const Row = (Node_: Node): NodeRow => ({
	id: Node_.id,
	kind: Node_.kind,
	path: Node_.path,
	...(Node_.name !== undefined ? { name: Node_.name } : {}),
	...(Node_.span !== undefined
		? { startLine: Node_.span.startLine, endLine: Node_.span.endLine }
		: {}),
	fingerprint: Node_.fingerprint,
	version: Node_.version,
});

/** The one-line role of a module: its first DocSection title, else "module". */
const Role = (Graph_: WorkspaceGraph, Path: string): string => {
	const Sections = Graph_.find({ kind: "DocSection", pattern: `${Path}*`, limit: 1 });
	const First = Sections[0];
	return First?.name ?? "module";
};

/** Resolve the focus node: an exact id first, else the first find hit. */
const Focus = (Graph_: WorkspaceGraph, IdOrQuery: string): Node | undefined => {
	const Direct = Graph_.getNode(IdOrQuery);
	if (Direct !== undefined) {
		return Direct;
	}
	return Graph_.find({ pattern: IdOrQuery, limit: 1 })[0];
};

export default (
	State_: State,
	Graph_: WorkspaceGraph,
	Request: { id?: string; query?: string; version?: string },
): { view: PacketView; rows: NodeRow[]; truncated: boolean } => {
	const Snapshot = Graph_.snapshot();
	const Scope = Request.id ?? Request.query ?? "workspace overview";
	const FocusNode = Request.id === undefined ? undefined : Focus(Graph_, Request.id);
	// The top modules: the File nodes under the focus path (or all files),
	// capped at the config's mapMaxModules.
	const Files = Graph_.find({ kind: "File", limit: State_.MapMaxModules });
	const MapLines = Files.map((File_) => `${File_.path} (${Role(Graph_, File_.path)})`);
	// The neighbors: expanded from the focus, ranked by edge strength.
	const Expansion = FocusNode
		? Graph_.expand(FocusNode.id, { depth: State_.ExpandDepth })
		: { nodes: [], edges: [] };
	const Ranked = [...Expansion.edges].sort(
		(Left, Right) => (Strength[Right.kind] ?? 0) - (Strength[Left.kind] ?? 0),
	);
	const NeighborLines = Ranked.map((Edge_) => `${Edge_.from} -${Edge_.kind}-> ${Edge_.to}`);
	// The evidence: the focus node's own file and span.
	const EvidenceLines =
		FocusNode === undefined
			? Files.map((File_) => `${File_.path} (whole file)`)
			: [
					`${FocusNode.path}:${FocusNode.span?.startLine ?? 1}-${FocusNode.span?.endLine ?? "?"}`,
				];
	// The open questions: the deferred W1 edge kinds, honestly.
	const OpenLines = [
		"references edges are deferred to W2+ - call/reference counts are unavailable",
		"calls edges are deferred to W2+ - call ranking is unavailable",
		"tests edges are deferred to W2+ - test coverage ranking is unavailable",
	];
	// The stale marker: only when the caller's version differs.
	const Stale =
		Request.version !== undefined && Request.version !== Snapshot.indexRevision
			? Request.version
			: undefined;
	const View: PacketView = {
		workspace: "workspace",
		indexRevision: Snapshot.indexRevision,
		scope: Scope,
		map: MapLines,
		...(FocusNode === undefined
			? {}
			: {
					focus: `${FocusNode.id} (${FocusNode.span?.startLine ?? 1}-${FocusNode.span?.endLine ?? "?"}, ${FocusNode.fingerprint.slice(0, 12)}, v${FocusNode.version})`,
				}),
		neighbors: NeighborLines,
		evidence: EvidenceLines,
		open: OpenLines,
		...(Stale === undefined ? {} : { stale: Stale }),
	};
	const Rows = Expansion.nodes.map(Row);
	return { view: View, rows: Rows, truncated: false };
};
