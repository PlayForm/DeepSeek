/**
 * @module Edit
 *
 * The edit grain parser: one tool call's name and arguments string become the
 * hunks the call produces.
 *
 * @remarks
 * The parser follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 17.3.
 * It yields one row per edit entry of an "edit" or "multi_edit" call (a single
 * entry object or an "edits" array), one row from the written content of a
 * "write" call, one row from the added and removed lines of an "apply_patch"
 * call's patch body, and one row summing the operations a "batch_edit" or
 * "batch_edit_commit" call carries - with the line counts read as newline
 * counts (counted with a split, never a regex) and the byte counts as the
 * UTF-8 encoded lengths (Buffer.byteLength), never the UTF-16 code units of the
 * string. The ordinal is the entry's array index, or 0 for a call-wide row.
 *
 * A tool the grain does not map, a malformed or alien arguments string, an
 * unknown shape, and a patch or operation table the parser cannot read yield no
 * rows; the parser never throws. A write records its whole content as added and
 * marks the row's Basis "removal-unknown", because the arguments never carry
 * the before content, so the removed side is unknown rather than zero; a patch
 * that deletes a file and a batch operation that replaces or removes a match
 * carry the same marker for the same reason.
 */
import type Hunk from "../Interface/Edit.js";

// The line count of one side of a hunk, counted with a split: a non-empty
// string is its newline count plus one, so a one-line replacement reads as
// +1/-1 rather than +0/-0; a non-string field counts as no lines and no
// bytes, never a guess.
const Lines = (Text: unknown): number =>
	typeof Text === "string" && Text.length > 0 ? Text.split("\n").length : 0;

// The UTF-8 encoded byte count of one string: a JavaScript string length is
// its UTF-16 code unit count, which undercounts every non-ASCII character,
// so the count is the encoded length for added and removed content alike.
const Bytes = (Text: unknown): number =>
	typeof Text === "string" ? Buffer.byteLength(Text, "utf8") : 0;

// The basis marker a row carries when the arguments carry one side only:
// the removal side is unknown, not empty.
const UnknownRemoval = "removal-unknown";

// One edit entry's hunk: the removed side read from the old string, the
// added side from the new one.
const HunkOf = (Entry: Record<string, unknown>, Ordinal: number, At: number): Hunk => ({
	Ordinal,
	LinesAdded: Lines(Entry["new_string"]),
	LinesRemoved: Lines(Entry["old_string"]),
	BytesAdded: Bytes(Entry["new_string"]),
	BytesRemoved: Bytes(Entry["old_string"]),
	At,
});

// The write's single hunk: the line count is the content's own line count,
// the byte count the content's encoded length; a write removes nothing the
// arguments can see, so the removed side is 0 and the row says why.
const Written = (Entry: Record<string, unknown>, At: number): Hunk => {
	const Content = Entry["content"];
	const Text = typeof Content === "string" ? Content : "";
	return {
		Ordinal: 0,
		LinesAdded: Lines(Text),
		LinesRemoved: 0,
		BytesAdded: Bytes(Text),
		BytesRemoved: 0,
		At,
		Basis: UnknownRemoval,
	};
};

// The edit entries of one call: the arguments' own "edits" key when it is an
// array of objects (multi_edit) or a single object, else the arguments
// object itself when the tool carries its edit inline (edit).
const Entries = (
	Tool: string,
	Fields: Record<string, unknown>,
): readonly Record<string, unknown>[] => {
	const Raw = Fields["edits"];
	switch (true) {
		case Array.isArray(Raw):
			return Raw.filter(
				(One): One is Record<string, unknown> =>
					One !== null && typeof One === "object" && !Array.isArray(One),
			);
		case Raw !== null && typeof Raw === "object" && !Array.isArray(Raw):
			return [Raw as Record<string, unknown>];
		case Tool === "edit":
			return [Fields];
		default:
			return [];
	}
};

// The argument keys an apply_patch call may carry its patch text under, in
// the order they are tried; a string under one of them counts only when it
// reads as a patch, so an unrelated string is never summed.
const PatchKeys = ["patch", "input", "diff"] as const;

// Whether a string reads as a patch body: the marker lines the patch
// dialects use, or a unified diff's hunk header.
const PatchLike = (Text: string): boolean =>
	Text.includes("*** Begin Patch") ||
	Text.includes("*** Update File:") ||
	Text.includes("*** Add File:") ||
	Text.split("\n").some((Line) => Line.startsWith("@@"));

// The patch text of an apply_patch call, or undefined when no string reads as
// a patch: the known keys are tried first, then every other string value, so
// a dialect whose key is not listed still counts while an unrelated string
// (a path, a mode, a message) never does.
const PatchText = (Fields: Record<string, unknown>): string | undefined => {
	for (const Key of PatchKeys) {
		const Value = Fields[Key];
		if (typeof Value === "string" && PatchLike(Value)) {
			return Value;
		}
	}
	for (const Value of Object.values(Fields)) {
		if (typeof Value === "string" && PatchLike(Value)) {
			return Value;
		}
	}
	return undefined;
};

// One patch body's added and removed sides: a "+" line adds its remainder, a
// "-" line removes its remainder, a "---" line paired with the "+++" line
// after it is a file header and not content, and every other line (a context
// line, an "@@" header, a "***" marker, the no-newline note) counts on
// neither side. A patch that deletes a file carries no removed lines, so the
// row says the removal side is unknown rather than empty.
const PatchHunk = (Text: string, At: number): Hunk => {
	const Added: string[] = [];
	const Removed: string[] = [];
	const Body = Text.split("\n");
	for (let Index = 0; Index < Body.length; Index += 1) {
		const Line = Body[Index] ?? "";
		switch (true) {
			case Line.startsWith("--- ") && (Body[Index + 1] ?? "").startsWith("+++ "):
				Index += 1;
				break;
			case Line.startsWith("+"):
				Added.push(Line.slice(1));
				break;
			case Line.startsWith("-"):
				Removed.push(Line.slice(1));
				break;
			default:
		}
	}
	const Row: Hunk = {
		Ordinal: 0,
		LinesAdded: Added.length,
		LinesRemoved: Removed.length,
		BytesAdded: Bytes(Added.join("\n")),
		BytesRemoved: Bytes(Removed.join("\n")),
		At,
	};
	return Text.includes("*** Delete File:") ? { ...Row, Basis: UnknownRemoval } : Row;
};

// The patch's single call-wide row, or no rows when no known key carries a
// patch body.
const Patched = (Fields: Record<string, unknown>, At: number): readonly Hunk[] => {
	const Text = PatchText(Fields);
	return Text === undefined ? [] : [PatchHunk(Text, At)];
};

// Whether an op line names one of the machine's six transition modes.
const KnownMode = (Mode: string): boolean => {
	switch (true) {
		case Mode === "replace":
		case Mode === "insert-after":
		case Mode === "insert-before":
		case Mode === "remove-line":
		case Mode === "append":
		case Mode === "prepend":
			return true;
		default:
			return false;
	}
};

// Whether an op mode consumes a matched text: a replace or a remove-line
// does, and the four insertion modes remove nothing.
const Removing = (Mode: string): boolean => Mode === "replace" || Mode === "remove-line";

// The op mode of one line, read from the "op=" token the grammar puts after
// file and search and before with: a line whose "with=" starts before any
// "op=" token is not the machine's grammar, so it yields no mode.
const ModeOf = (Text: string): string | undefined => {
	for (const Token of Text.split(" ")) {
		switch (true) {
			case Token.startsWith("with="):
				return undefined;
			case Token.startsWith("op="):
				return Token.slice(3);
			default:
		}
	}
	return undefined;
};

// The content one op line writes: the text after "with=" runs to the end of
// the line except a trailing " mode=" token (the machine's own grammar); a
// line with no with key writes nothing.
const WithOf = (Text: string): string => {
	const At = Text.indexOf(" with=");
	if (At === -1) {
		return "";
	}
	const Body = Text.slice(At + 6);
	const Tail = Body.lastIndexOf(" mode=");
	return Tail === -1 ? Body : Body.slice(0, Tail);
};

// One op line's content, or undefined when the line is blank, a comment, or
// outside the machine's grammar.
type Operation = { With: string; Removes: boolean };

const OperationOf = (Line: string): Operation | undefined => {
	const Text = Line.trim();
	if (Text.length === 0 || Text.startsWith("#")) {
		return undefined;
	}
	const Mode = ModeOf(Text);
	if (Mode === undefined || !KnownMode(Mode)) {
		return undefined;
	}
	return { With: WithOf(Text), Removes: Removing(Mode) };
};

// The call-wide row of a batch's operations: the content each operation
// writes is added; a replace or a remove-line consumes a matched text the
// arguments do not carry, so its removed side stays 0 and the row carries
// the marker. A call with no readable operation yields no rows.
const Operated = (Fields: Record<string, unknown>, At: number): readonly Hunk[] => {
	const Raw = Fields["ops"];
	if (!Array.isArray(Raw)) {
		return [];
	}
	let LinesAdded = 0;
	let BytesAdded = 0;
	let Removes = false;
	let Seen = false;
	for (const One of Raw) {
		if (typeof One !== "string") {
			continue;
		}
		const Op = OperationOf(One);
		if (Op === undefined) {
			continue;
		}
		Seen = true;
		LinesAdded += Lines(Op.With);
		BytesAdded += Bytes(Op.With);
		Removes = Removes || Op.Removes;
	}
	if (!Seen) {
		return [];
	}
	const Row: Hunk = {
		Ordinal: 0,
		LinesAdded,
		LinesRemoved: 0,
		BytesAdded,
		BytesRemoved: 0,
		At,
	};
	return [Removes ? { ...Row, Basis: UnknownRemoval } : Row];
};

export default (Tool: string, Arguments: string, At: number): readonly Hunk[] => {
	let Parsed: unknown;
	try {
		Parsed = JSON.parse(Arguments);
	} catch {
		return [];
	}
	if (Parsed === null || typeof Parsed !== "object" || Array.isArray(Parsed)) {
		return [];
	}
	const Fields = Parsed as Record<string, unknown>;
	switch (true) {
		case Tool === "write":
			return [Written(Fields, At)];
		case Tool === "edit" || Tool === "multi_edit":
			return Entries(Tool, Fields).map((One, Index) => HunkOf(One, Index, At));
		case Tool === "apply_patch":
			return Patched(Fields, At);
		case Tool === "batch_edit" || Tool === "batch_edit_commit":
			return Operated(Fields, At);
		default:
			return [];
	}
};
