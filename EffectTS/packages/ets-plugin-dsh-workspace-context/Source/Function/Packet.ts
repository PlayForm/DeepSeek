// Packet - the orientation packet builder (Function/Packet): the orient
// step of V4-1 section 3.5's "orient -> drill -> act" loop. Consumes the
// sibling workspace-graph's snapshot through the structural handle
// (Interface/Graph), filters through the resolved lens (Function/LensFn),
// ranks the neighbors by edge strength (Function/Rank), composes the eight
// fixed sections, records the caller's focus (Function/Focus), and hands the
// result to the budget clamp (Function/Budget).
//
// SELF-CONTAINED: the graph handle is probed at call time (State.Graph,
// injected as "workspaceGraph" when the sibling provides it). An absent
// sibling is NOT a crash: the packet still renders with an honest OPEN line
// ("workspace graph unavailable") - the attention projection degrades, it
// never lies.
import Budget from "@Function/Budget.js";
import Focus from "@Function/Focus.js";
import LensFn from "@Function/LensFn.js";
import Rank from "@Function/Rank.js";
import type { GraphNode } from "@Interface/Graph.js";
import type Packet from "@Interface/Packet.js";
import type Query from "@Interface/Query.js";
import type State from "@Interface/State.js";
import DefaultLens from "@Variable/DefaultLens.js";
import EdgeWeight from "@Variable/EdgeWeight.js";

/** One MAP line: "<dir> (<count> files)". */
const MapLine = (Dir: string, Count: number): string => `${Dir} (${Count} files)`;

export default (State: State, Options: Query): Packet => {
	const Graph = State.Graph as
		| {
				snapshot(): {
					indexRevision: string;
					nodes: GraphNode[];
					edges: { kind: string; from: string; to: string }[];
				};
				getNode(id: string): GraphNode | undefined;
				find(query: { name?: string; limit?: number }): GraphNode[];
				expand(id: string): {
					nodes: GraphNode[];
					edges: { kind: string; from: string; to: string }[];
				};
		  }
		| undefined;
	const Snapshot = Graph?.snapshot();
	const Lens = LensFn(Options.lens, State.Lenses, State.LensDefault, DefaultLens);
	const Open: string[] = [];
	switch (true) {
		case Snapshot === undefined:
			Open.push("workspace graph unavailable (the sibling index has not been probed)");
			break;
		case !Lens.known:
			Open.push(`lens "${Lens.name}" is not in the catalog (no filtering applied)`);
			break;
		default:
	}
	// The focus resolution: by id, else by the first name match.
	const Nodes = Snapshot?.nodes ?? [];
	const Eligible = (Node: GraphNode): boolean =>
		Lens.nodes.size === 0 || Lens.nodes.has(Node.kind);
	const Focus2 =
		(Options.id !== undefined ? Graph?.getNode(Options.id) : undefined) ??
		(Options.query !== undefined
			? Graph?.find({ name: Options.query, limit: 10 }).find(Eligible)
			: undefined) ??
		(Options.query !== undefined
			? Graph?.find({ name: Options.query, limit: 10 })[0]
			: undefined);
	const FocusId = Focus2?.id ?? Options.id ?? Options.query ?? "";
	const Scope = Options.query ?? Options.id ?? "(no scope given)";
	// The MAP: the top-level directories of the eligible files, biggest first.
	const Dirs = new Map<string, number>();
	for (const Node of Nodes) {
		switch (true) {
			case Node.kind !== "File" || !Eligible(Node):
				continue;
			default:
		}
		const Dir = Node.path.includes("/") ? Node.path.split("/")[0] : ".";
		Dirs.set(Dir, (Dirs.get(Dir) ?? 0) + 1);
	}
	const MapLines = [...Dirs.entries()]
		.sort((A, B) => B[1] - A[1] || A[0].localeCompare(B[0]))
		.slice(0, State.MapLimit)
		.map(([Dir, Count]) => MapLine(Dir, Count));
	// The FOCUS line.
	const FocusLine =
		Focus2 === undefined
			? `FOCUS (none: ${Options.id ?? Options.query ?? "no scope"})`
			: `FOCUS ${Focus2.id} span ${Focus2.span?.startLine ?? 0}-${Focus2.span?.endLine ?? 0} fp ${String(Focus2.fingerprint).slice(0, 12)} v ${Focus2.version}`;
	// The NEIGHBORS: the strongest edges first, lens-filtered.
	const Raw =
		Focus2 !== undefined && Snapshot !== undefined
			? (Graph?.expand(Focus2.id).edges ?? [])
			: [];
	const Ranked = Rank(
		Raw.filter((Edge) => Lens.edges.size === 0 || Lens.edges.has(Edge.kind)) as {
			kind: string;
			from: string;
			to: string;
		}[],
		EdgeWeight,
	).slice(0, State.NeighborLimit);
	switch (true) {
		case Focus2 !== undefined && Raw.length > State.NeighborLimit:
			Open.push(`neighbors truncated (${Raw.length} edges, cap ${State.NeighborLimit})`);
			break;
		default:
	}
	const Neighbors = Ranked.map((Edge) => `${Edge.kind} ${Edge.from} -> ${Edge.to}`);
	// The EVIDENCE: the files/spans the packet is built from, focus first.
	const Evidence: string[] = [];
	if (Focus2 !== undefined) {
		Evidence.push(`${Focus2.path} ${Focus2.span?.startLine ?? 0}-${Focus2.span?.endLine ?? 0}`);
	}
	for (const Node of Nodes) {
		switch (true) {
			case Evidence.length >= State.EvidenceLimit:
			case Node.kind !== "File":
				continue;
			default:
		}
		const Touches = Ranked.some((Edge) => Edge.from === Node.id || Edge.to === Node.id);
		if (Touches && Node.path !== Focus2?.path) {
			Evidence.push(`${Node.path} -`);
		}
	}
	// The STALE contract: the caller-held version vs the focus version.
	const CallerVersion = Options.callerVersion ?? State.Focus.get(Options.caller ?? "")?.version;
	const Stale =
		Focus2 !== undefined && CallerVersion !== undefined && CallerVersion !== Focus2.version
			? `caller held ${CallerVersion}, current ${Focus2.version}`
			: undefined;
	const Item: Packet = {
		workspace: `WORKSPACE ${State.WorkspaceName} @ ${Snapshot?.indexRevision ?? "unknown"}`,
		scope: `SCOPE ${Scope}`,
		map: MapLines,
		focus: FocusLine,
		neighbors: Neighbors,
		evidence: Evidence,
		open: Open.length > 0 ? Open : ["(none)"],
		stale: Stale,
		lens: Lens.name,
		tokens: 0,
		nodeId: Focus2?.id,
		nodeVersion: Focus2?.version,
	};
	// The focus tracker and the ledger (after the budget so the token count
	// is final; the tracker records the version the caller now holds).
	const Out = Budget(State, Item);
	State.Packets += 1;
	switch (true) {
		case Focus2 !== undefined:
			Focus(State, Options.caller ?? "", Focus2.id, Focus2.version);
			if (Options.caller !== undefined && Options.caller.length > 0) {
				State.Factory.Append(State, `focus ${Options.caller} -> ${Focus2.id}`);
			}
			break;
		default:
	}
	switch (true) {
		case Stale !== undefined:
			State.Stale += 1;
			State.Factory.Append(
				State,
				`stale ${String(Focus2?.id)} (caller held ${String(CallerVersion)})`,
			);
			break;
		default:
	}
	State.Factory.Append(
		State,
		`packet ${FocusId || "(none)"} (${Out.tokens} tok, lens ${Out.lens})`,
	);
	return Out;
};
