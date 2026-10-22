// Rules - THE RESOLUTION RULES (Function/Rules): they decide what CAN be
// proposed, and every failure returns a typed Refusal (Interface/Refusal) -
// the REFUSAL-TO-GUESS is the rule set's other half. One entry point,
// three guard chains (one per kind), `switch (true)` arms in the frozen
// order:
//
//   1. the request shape (bad-request);
//   2. the graph availability (graph-unavailable - for rename/connect,
//      which cannot be resolved without the graph);
//   3. the graph resolution (unknown-symbol / name-collision /
//      duplicate-edge / incompatible-edge);
//   4. the version fence (missing-version - a proposal without a fence is
//      never created);
//   5. the staleness (stale-version - the fence contradicts the hook's own
//      observed version or the file's stat);
//   6. the replace span (span-beyond-file - checked against the file's
//      real line count).
//
// The version fence rule is the refusal-to-guess at its strictest: the
// fence is the caller's version when given; when absent, the hook's own
// observed version for the path is used ONLY if one was actually heard -
// a version is never invented.
import Graph from "@Function/Graph.js";
import type { GraphNode } from "@Interface/Graph.js";
import type Outcome from "@Interface/Outcome.js";
import type Proposal from "@Interface/Proposal.js";
import type Refusal from "@Interface/Refusal.js";
import type State from "@Interface/State.js";

/** The edge-kind compatibility table (the W1 graph's node/edge matrix). */
const Compatible = (
	Edge: NonNullable<Proposal["edge"]>,
	FromKind: string,
	ToKind: string,
): boolean => {
	switch (Edge) {
		case "contains":
			return (
				FromKind === "File" && ["Symbol", "Block", "DocSection", "Test"].includes(ToKind)
			);
		case "imports":
			return FromKind === "File" && ToKind === "File";
		case "references":
			return ["Symbol", "Block"].includes(FromKind) && ToKind === "Symbol";
		case "calls":
			return FromKind === "Symbol" && ToKind === "Symbol";
		case "tests":
			return FromKind === "Test" && ["Symbol", "File"].includes(ToKind);
		default:
			return false;
	}
};

/** Build a refusal (the Refused counter rides in Propose, which owns the
 *  bookkeeping; Rules returns the plain value). */
const Refuse = (Kind: Refusal["kind"], Reason: string, Detail: string): Outcome => ({
	status: "refused",
	refusal: { kind: Kind, reason: Reason, detail: Detail },
});

/** Build the proposed outcome. */
const Propose = (Proposal: Proposal): Outcome => ({ status: "proposed", proposal: Proposal });

export default async (State: State, Kind: Proposal["kind"], Input: unknown): Promise<Outcome> => {
	const Raw = (Input ?? {}) as Record<string, unknown>;
	const Str = (Key: string): string => {
		const Value = Raw[Key];
		return typeof Value === "string" ? Value : "";
	};
	const Path = Str("path");
	// The version fence: the caller's token, else the hook's own observed
	// version for the path (only if one was actually heard).
	const Fence = (FencePath: string): string | undefined => {
		const Given = Str("version");
		if (Given.length > 0) {
			return Given;
		}
		const Heard = State.Observed.get(FencePath);
		return Heard !== undefined && Heard !== "absent" ? Heard : undefined;
	};
	const Stale = async (FencePath: string, Version: string): Promise<string | undefined> => {
		const Heard = State.Observed.get(FencePath);
		if (Heard !== undefined && Heard !== Version) {
			return `the fence ${Version} contradicts the observed version ${Heard}`;
		}
		try {
			const Target = await State.Context.fs.resolve(FencePath);
			const Info = (await State.Context.fs.stat(Target)) as { version: string } | undefined;
			const Observed = Info !== undefined ? String(Info.version) : "absent";
			if (Observed !== Version) {
				return `the fence ${Version} contradicts the file version ${Observed}`;
			}
		} catch {
			/* the stat is best-effort; the fence stands unverified */
		}
		return undefined;
	};
	switch (Kind) {
		case "rename": {
			const Name = Str("name");
			const To = Str("to");
			switch (true) {
				case Path.length === 0 || Name.length === 0 || To.length === 0:
					return Refuse("rename", "bad-request", "rename needs path, name and to");
				default:
			}
			const Version = Fence(Path);
			if (Version === undefined) {
				return Refuse("rename", "missing-version", `no version fence for ${Path}`);
			}
			const Handle = Graph(State);
			if (Handle === undefined) {
				return Refuse("rename", "graph-unavailable", "workspaceGraph is not mounted");
			}
			const Symbol = Handle.find({ kind: "Symbol", name: Name, limit: 100 }).find(
				(Node: GraphNode) => Node.path === Path,
			);
			if (Symbol === undefined) {
				return Refuse(
					"rename",
					"unknown-symbol",
					`symbol ${Name} is not in the graph for ${Path}`,
				);
			}
			const Collides = Handle.find({ kind: "Symbol", name: To, limit: 100 }).some(
				(Node: GraphNode) => Node.path === Path,
			);
			if (Collides) {
				return Refuse("rename", "name-collision", `${To} already exists in ${Path}`);
			}
			const StaleReason = await Stale(Path, Version);
			if (StaleReason !== undefined) {
				return Refuse("rename", "stale-version", StaleReason);
			}
			return Propose({
				id: "",
				kind: "rename",
				status: "proposed",
				path: Path,
				version: Version,
				sequence: 0,
				name: Name,
				to: To,
			});
		}
		case "connect": {
			const From = (Raw["from"] ?? null) as { path?: unknown; symbol?: unknown } | null;
			const Target = (Raw["target"] ?? null) as { path?: unknown; symbol?: unknown } | null;
			const Edge = typeof Raw["edge"] === "string" ? Raw["edge"] : "";
			const FromPath = typeof From?.path === "string" ? From.path : "";
			const ToPath = typeof Target?.path === "string" ? Target.path : "";
			switch (true) {
				case FromPath.length === 0 || ToPath.length === 0:
					return Refuse(
						"connect",
						"bad-request",
						"connect needs from.path and target.path",
					);
				case !["contains", "imports", "references", "calls", "tests"].includes(Edge):
					return Refuse("connect", "bad-request", `unknown edge kind ${Edge}`);
				default:
			}
			const Version = Fence(FromPath);
			if (Version === undefined) {
				return Refuse("connect", "missing-version", `no version fence for ${FromPath}`);
			}
			const Handle = Graph(State);
			if (Handle === undefined) {
				return Refuse("connect", "graph-unavailable", "workspaceGraph is not mounted");
			}
			const End = (EndpointPath: string, EndpointSymbol: unknown): GraphNode | undefined => {
				const Symbol = typeof EndpointSymbol === "string" ? EndpointSymbol : "";
				if (Symbol.length > 0) {
					return Handle.find({ kind: "Symbol", name: Symbol, limit: 100 }).find(
						(Node: GraphNode) => Node.path === EndpointPath,
					);
				}
				return Handle.find({ kind: "File", limit: 100 }).find(
					(Node: GraphNode) => Node.path === EndpointPath,
				);
			};
			const FromNode = End(FromPath, From?.symbol);
			const ToNode = End(ToPath, Target?.symbol);
			switch (true) {
				case FromNode === undefined || ToNode === undefined:
					return Refuse(
						"connect",
						"unknown-symbol",
						`an endpoint is not in the graph: ${FromPath} -> ${ToPath}`,
					);
				default:
			}
			if (!Compatible(Edge as NonNullable<Proposal["edge"]>, FromNode.kind, ToNode.kind)) {
				return Refuse(
					"connect",
					"incompatible-edge",
					`${Edge} cannot connect ${FromNode.kind} to ${ToNode.kind}`,
				);
			}
			const Duplicate = Handle.expand(FromNode.id).edges.some(
				(EdgeRecord: { kind: string; to: string }) =>
					EdgeRecord.kind === Edge && EdgeRecord.to === ToNode.id,
			);
			if (Duplicate) {
				return Refuse(
					"connect",
					"duplicate-edge",
					`${Edge} ${FromNode.id} -> ${ToNode.id} exists`,
				);
			}
			const StaleReason = await Stale(FromPath, Version);
			if (StaleReason !== undefined) {
				return Refuse("connect", "stale-version", StaleReason);
			}
			const FromSymbol = typeof From?.symbol === "string" ? From.symbol : undefined;
			const ToSymbol = typeof Target?.symbol === "string" ? Target.symbol : undefined;
			return Propose({
				id: "",
				kind: "connect",
				status: "proposed",
				path: FromPath,
				version: Version,
				sequence: 0,
				from: {
					path: FromPath,
					...(FromSymbol === undefined ? {} : { symbol: FromSymbol }),
				},
				target: {
					path: ToPath,
					...(ToSymbol === undefined ? {} : { symbol: ToSymbol }),
				},
				edge: Edge as NonNullable<Proposal["edge"]>,
			});
		}
		case "replace": {
			const Span = (Raw["span"] ?? null) as { startLine?: unknown; endLine?: unknown } | null;
			const StartLine = Number(Span?.startLine);
			const EndLine = Number(Span?.endLine);
			const Content = Raw["content"];
			switch (true) {
				case Path.length === 0:
					return Refuse("replace", "bad-request", "replace needs path");
				case !Number.isInteger(StartLine) || StartLine < 1:
					return Refuse(
						"replace",
						"bad-request",
						"span.startLine must be an integer >= 1",
					);
				case !Number.isInteger(EndLine) || EndLine < StartLine:
					return Refuse(
						"replace",
						"bad-request",
						"span.endLine must be >= span.startLine",
					);
				case typeof Content !== "string":
					return Refuse("replace", "bad-request", "content must be a string");
				default:
			}
			const Version = Fence(Path);
			if (Version === undefined) {
				return Refuse("replace", "missing-version", `no version fence for ${Path}`);
			}
			const StaleReason = await Stale(Path, Version);
			if (StaleReason !== undefined) {
				return Refuse("replace", "stale-version", StaleReason);
			}
			try {
				const Target = await State.Context.fs.resolve(Path);
				const Text = await State.Context.fs.readText(Target);
				const Lines = Text.split("\n").length;
				if (EndLine > Lines) {
					return Refuse(
						"replace",
						"span-beyond-file",
						`the span ends at ${EndLine} but the file has ${Lines} lines`,
					);
				}
			} catch (Cause) {
				return Refuse(
					"replace",
					"span-beyond-file",
					`the file is unreadable: ${(Cause as Error)?.message ?? String(Cause)}`,
				);
			}
			return Propose({
				id: "",
				kind: "replace",
				status: "proposed",
				path: Path,
				version: Version,
				sequence: 0,
				span: { startLine: StartLine, endLine: EndLine },
				content: Content as string,
			});
		}
		default:
			return Refuse("unknown", "bad-request", "kind must be rename, connect or replace");
	}
};
