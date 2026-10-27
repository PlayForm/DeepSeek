// Edit - the edit grain parser (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 17.3): one tool call's name and arguments string become the hunks
// the call produces - one row per edit entry of an "edit" or "multi_edit"
// call (a single entry object or an "edits" array), one row from the written
// content of a "write" call - with the line counts read as newline counts
// (counted with a split, never a regex) and the byte counts as the string
// lengths. The ordinal is the entry's array index. A tool the grain does not
// map, a malformed or alien arguments string and an unknown shape yield no
// rows; the parser never throws.
type Hunk = {
	Ordinal: number;
	LinesAdded: number;
	LinesRemoved: number;
	BytesAdded: number;
	BytesRemoved: number;
	At: number;
};

// The newline count of one string, counted with a split; a non-string field
// counts as no lines and no bytes, never a guess.
const Newlines = (Text: unknown): number =>
	typeof Text === "string" ? Text.split("\n").length - 1 : 0;

// The byte count of one string.
const Bytes = (Text: unknown): number => (typeof Text === "string" ? Text.length : 0);

// One edit entry's hunk: the removed side read from the old string, the
// added side from the new one.
const HunkOf = (Entry: Record<string, unknown>, Ordinal: number, At: number): Hunk => ({
	Ordinal,
	LinesAdded: Newlines(Entry["new_string"]),
	LinesRemoved: Newlines(Entry["old_string"]),
	BytesAdded: Bytes(Entry["new_string"]),
	BytesRemoved: Bytes(Entry["old_string"]),
	At,
});

// The write's single hunk: the line count is the content's newline count
// plus one when the content is non-empty, the byte count the content's own
// length; a write removes nothing.
const Written = (Entry: Record<string, unknown>, At: number): Hunk => {
	const Content = Entry["content"];
	const Text = typeof Content === "string" ? Content : "";
	return {
		Ordinal: 0,
		LinesAdded: Text.length > 0 ? Newlines(Text) + 1 : 0,
		LinesRemoved: 0,
		BytesAdded: Text.length,
		BytesRemoved: 0,
		At,
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
		default:
			return [];
	}
};
