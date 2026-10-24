// References - the `references` edge's consumer wiring (the plan's missing
// half): after a file is parsed, the graph ASKS the workspace-semantics
// service for the file's reference list and turns each reference into one
// honest edge.
//
// THE SERVICE IS PROBED, NEVER INJECTED (`ctx.get`), exactly like the trace
// bus: the loader contract's `inject` stays ["fs", "storage"], so a bare
// fixture or a direct construction is unchanged. The registered name is
// `workspaceSemantics`; the plan's short alias `semantics` is accepted too, so
// a deployment that registers the service under either name is served.
//
// THE HONESTY RULES (never a faked edge):
//   * no service, or a service whose resolve answers `undefined` (disabled, an
//     excluded path, no adapter) -> NO references edges at all;
//   * a reference whose target head matches no Symbol node of THIS file is
//     dropped - the target is unresolved, and an edge to a node that does not
//     exist would be a lie;
//   * the edge points FROM the node that uses the symbol (the first Symbol
//     node whose span contains the use site, else the File node) TO the used
//     Symbol node, carrying the use site's line span.
//
// The service reads the file through its own fs seam (the model is the
// service's), so this module never reads a file: it is handed the text the
// graph already read, and only converts the service's character offsets to
// the graph's 1-based line spans.
import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";
import type State from "@Interface/State.js";

/** The service names the consumer probes: the registered name, then the plan's alias. */
const Names = ["workspaceSemantics", "semantics"];

/** The structural slice of the semantics service the graph consumes. */
interface Semantics {
	resolve(Path: string): Promise<{ references?: unknown } | undefined>;
}

/** The structural slice of one reference the consumer reads. */
interface Reference {
	target?: unknown;
	span?: { start?: unknown; end?: unknown };
}

/** Probe the optional service through ctx.get (never an inject accessor). */
const Probe = (StateRef: State): Semantics | undefined => {
	for (const Name of Names) {
		const Service = (StateRef.Context as { get?: (Name: string) => unknown }).get?.(Name);
		switch (true) {
			case typeof (Service as { resolve?: unknown } | null)?.resolve === "function":
				return Service as Semantics;
			default:
		}
	}
	return undefined;
};

/** The 1-based line of one character offset. */
const Line = (Text: string, Offset: number): number => {
	let Found = 1;
	for (let Index = 0; Index < Offset && Index < Text.length; Index += 1) {
		switch (Text[Index]) {
			case "\n":
				Found += 1;
				break;
			default:
		}
	}
	return Found;
};

export default async (
	StateRef: State,
	Path: string,
	Text: string,
	Nodes: Node[],
): Promise<Edge[]> => {
	const Service = Probe(StateRef);
	switch (true) {
		case Service === undefined:
			// No service: no references edges. Silence, never a guess.
			return [];
		default:
	}
	let Model: { references?: unknown } | undefined;
	try {
		Model = await Service.resolve(Path);
	} catch {
		return [];
	}
	switch (true) {
		case Model === undefined || !Array.isArray(Model.references):
			return [];
		default:
	}
	const FileId = `File:${Path}`;
	const Symbols = Nodes.filter(
		(Node_) => Node_.kind === "Symbol" && typeof Node_.name === "string",
	);
	const Edges: Edge[] = [];
	for (const Reference of Model.references as Reference[]) {
		const Target = typeof Reference?.target === "string" ? Reference.target : "";
		const Head = Target.split(".")[0] ?? "";
		if (Head.length === 0) {
			continue;
		}
		const Start = Reference?.span?.start;
		const End = Reference?.span?.end;
		if (typeof Start !== "number" || typeof End !== "number") {
			continue;
		}
		const Used = Symbols.find((Symbol) => Symbol.name === Head);
		if (Used === undefined) {
			// Unresolved: the target is not a node of this file.
			continue;
		}
		const StartLine = Line(Text, Start);
		const EndLine = Line(Text, End);
		const Owner = Symbols.find(
			(Symbol) =>
				(Symbol.span?.startLine ?? 0) <= StartLine &&
				StartLine <= (Symbol.span?.endLine ?? 0),
		);
		Edges.push({
			kind: "references",
			from: Owner?.id ?? FileId,
			to: Used.id,
			span: { startLine: StartLine, endLine: EndLine },
		});
	}
	return Edges;
};
