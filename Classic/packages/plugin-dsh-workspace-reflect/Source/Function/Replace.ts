// Replace - the reflective replace op (Function/Replace): ONE call bundling
// the replacement of a block's span with new text.
//
// TWO TARGET FORMS:
//   * a NODE TARGET (`node` + `fingerprint`): the span is resolved through the
//     GRAPH's node (Function/Locate - the AST source), the node's path must be
//     the operation's path, and the content-derived fingerprint of the span is
//     VERIFIED against the current text before anything is written. A mismatch
//     refuses with `rejected <path> (fingerprint mismatch)` - the file changed
//     under the caller's node and the operation never guesses. When the graph
//     is absent (or does not know the node) the caller's explicit span is the
//     fallback, and the fingerprint is still verified.
//   * a TEXTUAL SPAN (`startLine`/`endLine` only): the pre-AST form, unchanged.
//
// The span is 1-based and inclusive; the replacement text replaces the span's
// lines exactly (an empty text deletes the span). The span guard: the span must
// be within the file and no wider than config `maxBlockLines` - a whole-file
// replacement smuggled in as a "block" op is rejected, never applied. The
// publish goes through Function/Publish (the version fence).
import Carry from "@Function/Carry.js";
import Fingerprint from "@Function/Fingerprint.js";
import Locate from "@Function/Locate.js";
import Observe from "@Function/Observe.js";
import Publish from "@Function/Publish.js";
import type { Operation } from "@Interface/Operation.js";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";
import { Decide } from "@playform/plugin-dsh-factory";

const Refuse = (State: State, Path: string, Reason: string): Reply => {
	State.Factory.Append(State, `rejected ${Path} (${Reason})`);
	return { status: "rejected", detail: Reason, version: undefined };
};

export default async (State: State, Operation: Operation): Promise<Reply> => {
	if (Operation.kind !== "replace") {
		return Refuse(State, "", "operation is not a replace");
	}
	const Replace = Operation as {
		kind: "replace";
		path?: unknown;
		startLine?: unknown;
		endLine?: unknown;
		text?: unknown;
		node?: unknown;
		fingerprint?: unknown;
	};
	const Path = String(Replace.path ?? "");
	const Start = Number(Replace.startLine);
	const End = Number(Replace.endLine);
	const Text = String(Replace.text ?? "");
	const NodeId = typeof Replace.node === "string" ? Replace.node : "";
	const Expected = typeof Replace.fingerprint === "string" ? Replace.fingerprint : "";
	switch (true) {
		case !State.On:
			// The cold mount: every operation answers denied, never a write.
			State.Factory.Append(State, "denied (enabled=false)");
			return { status: "denied", detail: "enabled=false", version: undefined };
		case Path.length === 0:
			return Refuse(State, Path, "replace identity incomplete");
		case NodeId.length > 0 && Expected.length === 0:
			return Refuse(State, Path, "fingerprint required for a node target");
		case NodeId.length === 0 && Expected.length > 0:
			return Refuse(State, Path, "fingerprint without a node target");
		case NodeId.length === 0 && (!Number.isInteger(Start) || !Number.isInteger(End)):
			return Refuse(State, Path, "span is not integral");
		default:
	}
	// THE POLICY GATE (D6): a replace WRITES the file, so it is the
	// plugin's gated action. An `approve` verdict for `write` refuses the
	// operation before the file is read or written - the documented line and
	// ZERO writes. The fingerprint targeting below stays exactly as it is:
	// the gate is the OUTER check, the fingerprint verification the inner
	// one.
	switch (Decide(State.Allow, "write")) {
		case "auto":
			break;
		default:
			State.Factory.Append(State, `replace held ${Path} (policy write=approve)`);
			return {
				status: "rejected",
				detail: "the policy holds the replace (write=approve)",
				version: undefined,
			};
	}
	const Read = await Observe(State, Path);
	if (!Read.Ok) {
		State.Factory.Append(State, `rejected ${Path} (${Read.Reply.detail})`);
		return Read.Reply;
	}
	const { Observed } = Read;
	let From = Start;
	let To = End;
	let Kind = "";
	let Name = "";
	if (NodeId.length > 0) {
		const Fallback =
			Number.isInteger(Start) && Number.isInteger(End)
				? { startLine: Start, endLine: End }
				: undefined;
		const Located = await Locate(State, NodeId, Path, Fallback);
		if (!Located.ok) {
			return Refuse(State, Path, Located.reason);
		}
		From = Located.span.startLine;
		To = Located.span.endLine;
		Kind = Located.kind;
		Name = Located.name;
	}
	const Last = Observed.lines.length;
	switch (true) {
		case From < 1 || To < From || To > Last:
			return Refuse(State, Path, "span is outside the file");
		case To - From + 1 > State.MaxBlockLines:
			return Refuse(State, Path, "span too large");
		default:
	}
	if (Expected.length > 0) {
		const Actual = Fingerprint(Observed.lines.slice(From - 1, To).join("\n"), Kind, Name);
		switch (true) {
			case Actual !== Expected:
				// The span moved or changed under the caller's node: refuse.
				return Refuse(State, Path, "fingerprint mismatch");
			default:
		}
	}
	// An empty text DELETES the span ("".split("\n") would splice one empty
	// line back in - never what "deletes the span" promises).
	const Parts = Text === "" ? [] : Text.split("\n");
	Observed.lines.splice(From - 1, To - From + 1, ...Parts);
	const Reply = await Publish(State, Path, Observed.version, Observed.lines.join("\n"));
	switch (true) {
		case Reply.status === "conflict":
			State.Factory.Append(State, `conflict ${Path} (expected ${Observed.version})`);
			break;
		case Reply.status === "outcome-unknown":
			State.Factory.Append(State, `failed ${Path} (${Reply.detail})`);
			break;
		default:
			State.Factory.Append(State, `replace ${Path} lines ${From}-${To} (${Reply.status})`);
	}
	if (Reply.status === "applied") {
		await Carry(State, Path);
	}
	return Reply;
};
