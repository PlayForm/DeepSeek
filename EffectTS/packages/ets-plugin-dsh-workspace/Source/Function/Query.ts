// Query - the four navigation operations (V4-1 §3.4), the query layer
// between the tools and the graph service. Each operation returns ONE
// canonical value (the defineTool rule), each answer carries the index
// revision (stale views are detectable in every answer), and pagination is
// by CURSOR, never by offset (the cursor is the id of the last returned
// node - the next call resumes strictly after it, so results can't shuffle
// between pages). No full file bodies: only ids, paths, spans, kinds.
import Packet, { Row } from "@Function/Packet.js";
import RenderPacket from "@Function/Render.js";
import type { Node, WorkspaceGraph } from "@Interface/Graph.js";
import type {
	ContextResult,
	ExpandResult,
	FindResult,
	MapResult,
	NodeRow,
} from "@Interface/Query.js";
import type State from "@Interface/State.js";

/** Compact one node into the row shape the tools print (the packet module's
 * Row, aliased locally for the three map/filter call sites). */
const RowOf = Row;

/** Filter by the configured kinds (empty = all). */
const KindOk = (State_: State, Node_: Node): boolean =>
	State_.Kinds.length === 0 || State_.Kinds.includes(Node_.kind);

/** Resume-after-cursor: keep only the nodes strictly after the cursor id. */
const After = (Nodes: NodeRow[], Cursor?: string): NodeRow[] =>
	Cursor === undefined ? Nodes : Nodes.slice(Nodes.findIndex((Row_) => Row_.id === Cursor) + 1);

/** The workspace_map operation (V4-1 §3.4): the top-level modules, the file
 * count, the entry points, the hot symbols. HOTNESS (the honest W1 proxy):
 * the graph has no reference counts (W2+), so a symbol is "hot" when its
 * file is imported by other files - the imports-edge in-degree. */
export const Map = (
	State_: State,
	Graph_: WorkspaceGraph,
	Request: { path?: string; depth?: number; cursor?: string },
): MapResult => {
	const Snapshot = Graph_.snapshot();
	const Files = Graph_.find({ kind: "File", limit: State_.FindLimitMax });
	const Root = Request.path ?? "";
	const InRoot = Files.filter((File_) => Root === "" || File_.path.startsWith(Root));
	const Modules = InRoot.slice(0, State_.MapMaxModules).map((File_) => ({
		id: File_.id,
		path: File_.path,
		role:
			Graph_.find({ kind: "DocSection", pattern: `${File_.path}*`, limit: 1 })[0]?.name ??
			"module",
	}));
	const Imported = new Set<string>();
	for (const Edge_ of Snapshot.edges) {
		if (Edge_.kind === "imports") {
			Imported.add(Edge_.to);
		}
	}
	const EntryPoints = InRoot.filter((File_) => !Imported.has(File_.id)).map((File_) => File_.id);
	const Hot = Graph_.find({ kind: "Symbol", limit: State_.FindLimitMax })
		.filter((Symbol_) => Imported.has(`File:${Symbol_.path}`) && KindOk(State_, Symbol_))
		.map(RowOf)
		.slice(0, State_.MapMaxModules);
	const Truncated = InRoot.length > Modules.length;
	const Cursor = Hot.at(-1)?.id;
	return {
		indexRevision: Snapshot.indexRevision,
		modules: Modules,
		files: InRoot.length,
		entryPoints: EntryPoints.slice(0, State_.MapMaxModules),
		hotSymbols: Hot,
		truncated: Truncated,
		...(Cursor !== undefined ? { cursor: Cursor } : {}),
	};
};

/** The workspace_find operation (V4-1 §3.4): the matching nodes with id,
 * path, span, kind. Cursor pagination: resume strictly after the cursor id. */
export const Find = (
	State_: State,
	Graph_: WorkspaceGraph,
	Request: {
		name?: string;
		pattern?: string;
		kind?: Node["kind"];
		limit?: number;
		cursor?: string;
	},
): FindResult => {
	const Snapshot = Graph_.snapshot();
	const Limit = Math.min(Request.limit ?? State_.FindLimit, State_.FindLimitMax);
	const Found = Graph_.find({
		name: Request.name,
		pattern: Request.pattern,
		kind: Request.kind,
		limit: Limit * 2 + 1,
	})
		.filter((Node_) => KindOk(State_, Node_))
		.map(RowOf);
	const Paged = After(Found, Request.cursor).slice(0, Limit);
	const Cursor = Paged.at(-1)?.id;
	return {
		indexRevision: Snapshot.indexRevision,
		nodes: Paged,
		truncated: After(Found, Request.cursor).length > Limit,
		...(Cursor !== undefined ? { cursor: Cursor } : {}),
	};
};

/** The workspace_expand operation (V4-1 §3.4): the neighbors (references,
 * calls, imports, tests) around the focus node. The W1 graph serves the
 * contains/imports kinds it parses; requesting a deferred kind yields an
 * honest empty set, never a fake edge. */
export const Expand = (
	State_: State,
	Graph_: WorkspaceGraph,
	Request: { id: string; kinds?: string[]; depth?: number },
): ExpandResult => {
	const Snapshot = Graph_.snapshot();
	const FocusNode = Graph_.getNode(Request.id);
	const Expansion = FocusNode
		? Graph_.expand(Request.id, {
				kinds: Request.kinds as never,
				depth: Math.min(Request.depth ?? State_.ExpandDepth, 3),
			})
		: { nodes: [], edges: [] };
	const Nodes = Expansion.nodes
		.filter((Node_) => KindOk(State_, Node_))
		.map(RowOf)
		.slice(0, State_.ExpandMaxNeighbors);
	return {
		indexRevision: Snapshot.indexRevision,
		...(FocusNode ? { node: RowOf(FocusNode) } : {}),
		nodes: Nodes,
		edges: Expansion.edges.map((Edge_) => ({
			kind: Edge_.kind,
			from: Edge_.from,
			to: Edge_.to,
			...(Edge_.span !== undefined ? { startLine: Edge_.span.startLine } : {}),
		})),
		truncated: Expansion.nodes.length > Nodes.length,
	};
};

/** The workspace_context operation (V4-1 §3.4/§3.5): the orientation packet,
 * token-estimated against the budget. Budget overrun sets truncated - the
 * caller narrows the scope, the packet never silently exceeds the cap. */
export const Context = (
	State_: State,
	Graph_: WorkspaceGraph,
	Request: { id?: string; query?: string; budget?: number; version?: string },
): ContextResult => {
	const Snapshot = Graph_.snapshot();
	const Budget = Math.min(Request.budget ?? State_.PacketTokenBudget, State_.PacketTokenMax);
	const Built = Packet(State_, Graph_, Request);
	const Text = RenderPacket(Built.view);
	const Tokens = Math.ceil(Text.length / State_.TokenCharsPerToken);
	return {
		indexRevision: Snapshot.indexRevision,
		packet: Built.view,
		text: Tokens > Budget ? Text.slice(0, Budget * State_.TokenCharsPerToken) : Text,
		tokens: Tokens,
		budget: Budget,
		truncated: Tokens > Budget,
	};
};
