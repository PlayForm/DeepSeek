// Locate - the node-targeted span resolution (Function/Locate): turn the
// graph's frozen node id into the span a reflective Replace rewrites, and the
// kind/name the fingerprint needs.
//
// THE GRAPH IS THE AST SOURCE: `workspaceGraph.getNode(id)` carries the node's
// 1-based inclusive span and its content-derived fingerprint. The graph is
// PROBED (`ctx.get`), never injected - an absent graph is the textual
// fallback: the caller's explicit span is used when it supplied one, and the
// kind/name still come from the id grammar (so the fingerprint is verified
// either way). A node whose span the graph does not know, a node for another
// path, and a node kind the reflective ops do not target are all REFUSALS with
// their documented reason, never a guessed span.
import type GraphHandle from "@Interface/Graph.js";
import type State from "@Interface/State.js";

/** The resolved target of a node-targeted operation. */
export interface Located {
	ok: true;
	/** The 1-based inclusive span to rewrite. */
	span: { startLine: number; endLine: number };
	/** The fingerprint's kind component (Symbol / Block). */
	kind: string;
	/** The fingerprint's name component (a Block hashes the empty name). */
	name: string;
}

/** A refusal with its documented reason. */
export interface Refused {
	ok: false;
	reason: string;
}

/**
 * The frozen id grammar, parsed into the fingerprint's kind/name and the
 * node's path. Only the two targetable kinds are parsed: `Symbol:<path>:<name>`
 * (the LAST segment is the name) and `Block:<path>:<startLine>:<kind>` (the
 * last two segments are the line and the block kind, and the fingerprint's
 * name is empty). The path may itself contain a colon (a Windows drive), so the
 * split always takes from the LEFT of the trailing segments.
 */
const Parse = (Id: string): { kind: string; path: string; name: string } | undefined => {
	const Parts = Id.split(":");
	switch (Parts[0]) {
		case "Symbol":
			return {
				kind: "Symbol",
				path: Parts.slice(1, -1).join(":"),
				name: Parts.at(-1) ?? "",
			};
		case "Block":
			return {
				kind: "Block",
				path: Parts.slice(1, -2).join(":"),
				name: "",
			};
		default:
			return undefined;
	}
};

export default async (
	State: State,
	Id: string,
	Path: string,
	Fallback?: { startLine: number; endLine: number },
): Promise<Located | Refused> => {
	const Identity = Parse(Id);
	if (Identity === undefined) {
		// File/Test/DocSection ids carry no fingerprint the ops can verify.
		return { ok: false, reason: "node not targetable" };
	}
	switch (true) {
		case Identity.path !== Path:
			return { ok: false, reason: "node path mismatch" };
		default:
	}
	const Graph = (State.Context as { get?: (Name: string) => unknown }).get?.("workspaceGraph") as
		GraphHandle | undefined;
	switch (true) {
		case Graph === undefined || typeof Graph.getNode !== "function":
			// The textual fallback: the caller's explicit span, verified with
			// the id's kind/name.
			switch (true) {
				case Fallback === undefined:
					return { ok: false, reason: "graph absent" };
				default:
					return {
						ok: true,
						span: Fallback,
						kind: Identity.kind,
						name: Identity.name,
					};
			}
		default:
	}
	const Node = Graph.getNode(Id);
	switch (true) {
		case Node === undefined || Node.span === undefined:
			switch (true) {
				case Fallback === undefined:
					return { ok: false, reason: "node not found" };
				default:
					return {
						ok: true,
						span: Fallback,
						kind: Identity.kind,
						name: Identity.name,
					};
			}
		default:
			return {
				ok: true,
				span: {
					startLine: Node.span.startLine,
					endLine: Node.span.endLine,
				},
				kind: Identity.kind,
				name: Node.name ?? Identity.name,
			};
	}
};
