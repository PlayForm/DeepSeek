// Projection - the P2 GRAPH PROJECTION builder (the re-spec: the plan's
// generated repo index becomes a projection of ctx.workspaceGraph; the
// graph supersedes the hand-generated index, Completion-Spec 00-OVERVIEW
// section 6 and 03-SUGGESTERS section 3).
//
// The service is OPTIONAL and is PROBED through `ctx.get`, never injected: a
// repo without the graph plugin must still emit (the neutral fallback), and
// a graph mounted after this plugin's apply must still be found. One
// `snapshot()` read produces the whole projection:
//
//   * the node facts: the normalized path, its kinds, its depth below the
//     snapshot's common root, and its version-token rank;
//   * the root: the common directory prefix of every node path (the
//     workspace root for a full index), so a partial index still measures
//     depth from its own base;
//   * the revision: the graph's indexRevision, carried for the docs and the
//     refresh test.
//
// The recency rank is the graph's own order - the version token the graph
// stores per node (the fs version it indexed at) ranked across the snapshot,
// NEVER a wall clock. A snapshot with no nodes, a missing service, a service
// without `snapshot`, or a throwing read all yield `undefined`: the caller
// then scores every candidate with the documented neutral literal 0.5 and
// renders the static pack list (the PoC behavior, byte-identical).
import type { Context } from "@deepseek-ai/cordis";

import type Projection from "../Interface/Projection.js";
import type { Fact } from "../Interface/Projection.js";

/** Normalize a path to the graph's forward-slash form. */
const Normalize = (Path: string): string =>
	Path.split("\\")
		.join("/")
		.replace(/\/{2,}/g, "/");

/** The path's segments. */
const Segments = (Path: string): string[] => Normalize(Path).split("/");

/**
 * The common directory prefix's segment count: the depth is measured below
 * it, so an absolute-path snapshot and a repo-relative snapshot agree. The
 * last segment (the file name) is never part of the root.
 */
const Root = (Paths: string[]): number => {
	const All = Paths.map(Segments);
	let Common = 0;
	while (Common < Math.min(...All.map((Segments_) => Segments_.length)) - 1) {
		const First = All[0]?.[Common];
		if (First === undefined) {
			break;
		}
		if (!All.every((Segments_) => Segments_[Common] === First)) {
			break;
		}
		Common += 1;
	}
	return Common;
};

/** A locale-free version-token comparison (numeric tokens compare numerically). */
const Compare = (Left: string, Right: string): number => {
	const LeftNumber = Number(Left);
	const RightNumber = Number(Right);
	if (
		Left !== "" &&
		Right !== "" &&
		Number.isFinite(LeftNumber) &&
		Number.isFinite(RightNumber)
	) {
		return LeftNumber - RightNumber;
	}
	return Left < Right ? -1 : Left > Right ? 1 : 0;
};

/** The version-token rank map: the snapshot's own recency order, no clock. */
const Versions = (Tokens: string[]): Map<string, number> => {
	const Unique = [...new Set(Tokens)].sort(Compare);
	const Ranks = new Map<string, number>();
	Unique.forEach((Token, Index) => {
		Ranks.set(Token, Unique.length <= 1 ? 1 : Index / (Unique.length - 1));
	});
	return Ranks;
};

/** One node reduced to what the projection reads (a malformed node is skipped). */
const Read = (Entry: unknown): { path: string; kind: string; version: string } | undefined => {
	const Node = Entry as { path?: unknown; kind?: unknown; version?: unknown } | undefined;
	if (typeof Node?.path !== "string" || Node.path.length === 0) {
		return undefined;
	}
	if (typeof Node.kind !== "string" || Node.kind.length === 0) {
		return undefined;
	}
	return { path: Node.path, kind: Node.kind, version: String(Node.version ?? "") };
};

export default (
	/** The plugin context (the optional-service probe). */
	Context: Context,
): Projection | undefined => {
	try {
		const Service = Context.get?.("workspaceGraph") as { snapshot?: () => unknown } | undefined;
		if (Service === undefined || typeof Service.snapshot !== "function") {
			return undefined;
		}
		const Snapshot = Service.snapshot() as
			{ indexRevision?: unknown; nodes?: unknown } | undefined;
		if (Snapshot === null || typeof Snapshot !== "object" || !Array.isArray(Snapshot.nodes)) {
			return undefined;
		}
		const Nodes = Snapshot.nodes.flatMap((Entry) => {
			const Read_ = Read(Entry);
			return Read_ === undefined ? [] : [Read_];
		});
		if (Nodes.length === 0) {
			return undefined;
		}
		const Root_ = Root(Nodes.map((Node) => Node.path));
		const Ranks = Versions(Nodes.map((Node) => Node.version));
		const Facts = new Map<string, Fact>();
		for (const Node of Nodes) {
			const Path = Normalize(Node.path);
			const Existing = Facts.get(Path);
			if (Existing === undefined) {
				Facts.set(Path, {
					kinds: [Node.kind],
					depth: Math.max(1, Segments(Path).length - Root_),
					recency: Ranks.get(Node.version) ?? 1,
				});
				continue;
			}
			if (!Existing.kinds.includes(Node.kind)) {
				Existing.kinds.push(Node.kind);
			}
		}
		return {
			revision: String(Snapshot.indexRevision ?? ""),
			nodes: Nodes.length,
			root: Root_,
			facts: Facts,
		};
	} catch {
		// A throwing graph is "no graph": the neutral fallback, never an error.
		return undefined;
	}
};
