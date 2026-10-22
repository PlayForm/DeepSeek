// Rename - the reflective rename op (Function/Rename): ONE call bundling the
// whole transformation - the AST-aware rename across the affected references.
// The v0 transformation is textual but SCOPE-HONEST: whole-word matches only
// (a regex with word boundaries, never a substring replace), applied to the
// block's span (scope "block", the default from config `propagate`) or to the
// whole file (scope "file"). Zero occurrences is a rejected reply - never an
// applied write of an unchanged file. The publish goes through
// Function/Publish (the version fence; a file that moved under the op yields
// a conflict).
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
	if (Operation.kind !== "rename") {
		return Refuse(State, "", "operation is not a rename");
	}
	const Path = String((Operation as { path?: unknown }).path ?? "");
	const Old = String((Operation as { oldName?: unknown }).oldName ?? "");
	const New = String((Operation as { newName?: unknown }).newName ?? "");
	const Start = Number((Operation as { startLine?: unknown }).startLine);
	const End = Number((Operation as { endLine?: unknown }).endLine);
	const Scope =
		(Operation as { scope?: unknown }).scope === "file"
			? "file"
			: (Operation as { scope?: unknown }).scope === "block"
				? "block"
				: State.Propagate;
	switch (true) {
		case !State.On:
			// The cold mount: every operation answers denied, never a write.
			State.Factory.Append(State, "denied (enabled=false)");
			return { status: "denied", detail: "enabled=false", version: undefined };
		case Path.length === 0 || Old.length === 0 || New.length === 0:
			return Refuse(State, Path, "rename identity incomplete");
		case Old === New:
			return Refuse(State, Path, "rename is a no-op");
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
	const From = Scope === "block" ? Math.max(1, Start) : 1;
	const To = Scope === "block" ? Math.min(End, Last) : Last;
	switch (true) {
		case From > To:
			return Refuse(State, Path, "span is empty after clamping");
		case To - From + 1 > State.MaxBlockLines:
			return Refuse(State, Path, "span too large");
		default:
	}
	const Pattern = new RegExp(`\\b${Old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
	let Count = 0;
	for (let Index = From; Index <= To; Index += 1) {
		const Line = Observed.lines[Index - 1];
		if (Line === undefined) {
			continue;
		}
		const Hits = Line.match(Pattern);
		if (Hits !== null && Hits !== undefined) {
			Count += Hits.length;
			Observed.lines[Index - 1] = Line.replace(Pattern, New);
		}
	}
	switch (true) {
		case Count === 0:
			return Refuse(State, Path, "no occurrences in scope");
		default:
	}
	const Reply = await Publish(State, Path, Observed.version, Observed.lines.join("\n"));
	switch (true) {
		case Reply.status === "conflict":
			State.Factory.Append(State, `conflict ${Path} (expected ${Observed.version})`);
			break;
		case Reply.status === "outcome-unknown":
			State.Factory.Append(State, `failed ${Path} (${Reply.detail})`);
			break;
		default:
			State.Factory.Append(State, `rename ${Path} ${Old} -> ${New} (${Reply.status})`);
	}
	if (Reply.status === "applied") {
		await Carry(State, Path);
	}
	return Reply;
};
