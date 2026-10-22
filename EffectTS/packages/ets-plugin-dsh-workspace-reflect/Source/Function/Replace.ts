// Replace - the reflective replace op (Function/Replace): ONE call bundling
// the replacement of a block's span with new text. The span is 1-based and
// inclusive; the replacement text replaces the span's lines exactly (an empty
// text deletes the span). The span guard: the span must be within the file
// and no wider than config `maxBlockLines` - a whole-file replacement
// smuggled in as a "block" op is rejected, never applied. The publish goes
// through Function/Publish (the version fence).
import Carry from "@Function/Carry.js";
import Observe from "@Function/Observe.js";
import Publish from "@Function/Publish.js";
import type { Operation } from "@Interface/Operation.js";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";

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
	};
	const Path = String(Replace.path ?? "");
	const Start = Number(Replace.startLine);
	const End = Number(Replace.endLine);
	const Text = String(Replace.text ?? "");
	switch (true) {
		case !State.On:
			// The cold mount: every operation answers denied, never a write.
			State.Factory.Append(State, "denied (enabled=false)");
			return { status: "denied", detail: "enabled=false", version: undefined };
		case Path.length === 0:
			return Refuse(State, Path, "replace identity incomplete");
		case !Number.isInteger(Start) || !Number.isInteger(End):
			return Refuse(State, Path, "span is not integral");
		default:
	}
	const Read = await Observe(State, Path);
	if (!Read.Ok) {
		State.Factory.Append(State, `rejected ${Path} (${Read.Reply.detail})`);
		return Read.Reply;
	}
	const { Observed } = Read;
	const Last = Observed.lines.length;
	switch (true) {
		case Start < 1 || End < Start || End > Last:
			return Refuse(State, Path, "span is outside the file");
		case End - Start + 1 > State.MaxBlockLines:
			return Refuse(State, Path, "span too large");
		default:
	}
	// An empty text DELETES the span ("".split("\n") would splice one empty
	// line back in - never what "deletes the span" promises).
	const Parts = Text === "" ? [] : Text.split("\n");
	Observed.lines.splice(Start - 1, End - Start + 1, ...Parts);
	const Reply = await Publish(State, Path, Observed.version, Observed.lines.join("\n"));
	switch (true) {
		case Reply.status === "conflict":
			State.Factory.Append(State, `conflict ${Path} (expected ${Observed.version})`);
			break;
		case Reply.status === "outcome-unknown":
			State.Factory.Append(State, `failed ${Path} (${Reply.detail})`);
			break;
		default:
			State.Factory.Append(State, `replace ${Path} lines ${Start}-${End} (${Reply.status})`);
	}
	if (Reply.status === "applied") {
		await Carry(State, Path);
	}
	return Reply;
};
