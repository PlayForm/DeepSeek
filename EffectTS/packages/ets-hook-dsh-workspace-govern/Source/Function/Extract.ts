// Extract - the proposal extraction (Function/Extract): from one tool
// execution to the proposal record the gate evaluates. When the operate
// family attached its record (arguments.proposal) the record is used as-is
// (validated field by field, never guessed); otherwise a MINIMAL proposal is
// synthesized from the call itself - kind = tool name, target = the first of
// the path-ish argument keys, holder = the agent identity, operation /
// parent / category from the call's identifiers (the recursion-prevention
// fields are NEVER left empty), declared = false (the lenient reading: the
// contributes obligation evaluates "n/a").
import type Proposal from "@Interface/Proposal.js";

const TARGET_KEYS = ["path", "target", "file", "filePath", "notePath"];

export default (Exec: {
	name?: string;
	callId?: string;
	rootCallId?: string;
	arguments?: unknown;
	agent?: unknown;
}): Proposal => {
	const Args = (Exec.arguments ?? {}) as Record<string, unknown>;
	const Attached = Args["proposal"];
	if (Attached !== null && typeof Attached === "object" && !Array.isArray(Attached)) {
		const Record = Attached as Partial<Proposal>;
		const Operation =
			typeof Record.operation === "string" && Record.operation.length > 0
				? Record.operation
				: `op:${String(Exec.callId ?? Exec.rootCallId ?? "(unknown)")}`;
		return {
			operation: Operation,
			parent: typeof Record.parent === "string" ? Record.parent : "(root)",
			category: typeof Record.category === "string" ? Record.category : "tool",
			kind: typeof Record.kind === "string" ? Record.kind : String(Exec.name ?? "(tool)"),
			target: typeof Record.target === "string" ? Record.target : "(none)",
			contribution: typeof Record.contribution === "string" ? Record.contribution : "",
			scope: Array.isArray(Record.scope)
				? Record.scope.filter((Item): Item is string => typeof Item === "string")
				: [],
			preconditions: Array.isArray(Record.preconditions)
				? (Record.preconditions as Proposal["preconditions"])
				: undefined,
			holder:
				typeof Record.holder === "string"
					? Record.holder
					: String((Exec.agent as { id?: string } | undefined)?.id ?? "(unowned)"),
			declared: true,
		};
	}
	const TargetKey = TARGET_KEYS.find((Key) => typeof Args[Key] === "string");
	return {
		operation: `op:${String(Exec.callId ?? Exec.rootCallId ?? "(unknown)")}`,
		parent:
			Exec.rootCallId === undefined || Exec.rootCallId === Exec.callId
				? "(root)"
				: `op:${Exec.rootCallId}`,
		category: "tool",
		kind: String(Exec.name ?? "(tool)"),
		target:
			typeof Args[TargetKey as string] === "string"
				? String(Args[TargetKey as string])
				: "(none)",
		contribution: typeof Args["instruction"] === "string" ? String(Args["instruction"]) : "",
		scope: Array.isArray(Args["scope"])
			? (Args["scope"] as unknown[]).filter(
					(Item): Item is string => typeof Item === "string",
				)
			: [],
		preconditions: undefined,
		holder: String((Exec.agent as { id?: string } | undefined)?.id ?? "(unowned)"),
		declared: false,
	};
};
