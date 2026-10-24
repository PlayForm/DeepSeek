// Deepened - the semantics-driven rename (Function/Deepened): ask the
// workspace-semantics service for the scope-resolved plan of the identifier,
// keep the edits that fall inside the operation's line scope, and rewrite the
// text with them. The service's plan is a character-offset list, so the block's
// line scope is converted to a character range first.
//
// THE FALLBACK IS THE CALLER'S: `undefined` means the textual whole-word engine
// must run - the service is absent, refused, found no occurrence at or after the
// scope's start, or its plan has no edit inside the scope. The engine then
// produces its own (byte-exact) outcome, so the refusal strings never change.
//
// The rewritten text is returned, not published: the caller owns the version
// fence (Function/Publish) and the module's own ledger line.
import type Plan from "@Interface/Plan.js";
import type SemanticsHandle from "@Interface/Semantics.js";
import type State from "@Interface/State.js";

/** The character offset of the first character of one 1-based line. */
const OffsetOfLine = (Lines: string[], Line: number): number => {
	let Found = 0;
	for (let Index = 0; Index < Line - 1; Index += 1) {
		Found += (Lines[Index] ?? "").length + 1;
	}
	return Found;
};

export default async (
	State: State,
	Service: SemanticsHandle,
	Path: string,
	Lines: string[],
	From: number,
	To: number,
	Old: string,
	New: string,
): Promise<{ Text: string; Edits: number } | undefined> => {
	const Text = Lines.join("\n");
	const Start = OffsetOfLine(Lines, From);
	const End = OffsetOfLine(Lines, To) + (Lines[To - 1] ?? "").length;
	const At = Text.indexOf(Old, Start);
	switch (true) {
		case At < 0 || At >= End:
			// The identifier is not inside the scope: the textual engine's own
			// "no occurrences in scope" refusal is the honest outcome.
			return undefined;
		default:
	}
	let Plan: Plan | undefined;
	try {
		Plan = await Service.rename(Path, { start: At, end: At + Old.length }, New);
	} catch {
		return undefined;
	}
	switch (true) {
		case Plan === undefined:
			return undefined;
		default:
	}
	const Edits = Plan.edits
		.filter((Edit) => Edit.start >= Start && Edit.end <= End)
		.sort((Left, Right) => Right.start - Left.start);
	switch (true) {
		case Edits.length === 0:
			return undefined;
		default:
	}
	let Output = Text;
	for (const Edit of Edits) {
		Output = Output.slice(0, Edit.start) + New + Output.slice(Edit.end);
	}
	State.Factory.Append(State, `deepened ${Path} (${Edits.length} edits via semantics)`);
	return { Text: Output, Edits: Edits.length };
};
