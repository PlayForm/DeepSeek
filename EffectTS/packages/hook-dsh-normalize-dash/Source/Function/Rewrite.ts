// Rewrite - the raw-write tool's NORMALIZATION STEP: apply the normalize
// family's transforms to one text segment, in the family's FIXED order,
// daisy-chaining the text (the stream normalizers each apply ONE flavor to
// the stream; the raw-write's `normalize` applies a per-call SELECTION of
// them to the file content). The transforms are the core's tables and
// replacers, imported directly - the same source the six stream flavors
// delegate to:
//
//   1. Dashes    class  → the hook-dsh-normalize-dash's configured `replacement` (default "-")
//   2. Quotes    MAP    → curly → straight (no knob)
//   3. Ellipsis  class  → "..."
//   4. Spaces    class  → " "
//   5. Invisible class  → "" (removed)
//   6. Fullwidth MAP    → full-width → half-width (no knob)
//
// Each flavor's knob is the flavor's own config default in this profile
// (Ellipsis "...", Spaces " ", Invisible "") except Dashes, which uses the
// hook-dsh-normalize-dash's `replacement` (the caller passes it in - State.Replacement). The
// chain is PURE: the core's replacers are pure and total on any string, the
// per-call regex construction carries no lastIndex state, and the result is
// the chained text only (the counts are the core's `{ text, count }`
// contract, discarded here - the tool's ledger has no count line; a
// selection-aware count would only ever reflect the APPLIED transforms).
//
// THE SELECTION (the tool's per-call `normalize` flag):
//   * absent or false   - VERBATIM: the content returned unchanged
//     (byte-for-byte);
//   * true or "all"     - ALL SIX transforms, in the family order above -
//     the legacy behavior, byte-equivalent with the pre-selection six-fold
//     chain;
//   * an array of flavor names (or a single name) - ONLY the selected
//     flavors, applied in the family order (unknown names match nothing
//     and are ignored by construction; an empty selection is verbatim).
import {
	Replace,
	ReplaceMap,
	Dashes,
	Quotes,
	Ellipsis,
	Spaces,
	Invisible,
	Fullwidth,
} from "@playform/hook-dsh-core";

// The family's fixed order - the flavor names the tool's schema enumerates.
const Flavors = ["dash", "quotes", "ellipsis", "spaces", "invisible", "fullwidth"];

// The selection: `true`/"all" = all six; an array (or a single name) = the
// named flavors; false/null/undefined/unknown = none (verbatim).
export type Selection = boolean | string | string[] | null | undefined;

export default (Content: string, Replacement: string, Select: Selection): string => {
	// Resolve the selection to the set of flavor names to apply; `null` means
	// "all six" (the legacy boolean behavior).
	let Chosen: string[] | null;
	switch (true) {
		case Select === true || Select === "all":
			Chosen = null; // all six - byte-equivalent with the legacy chain
			break;
		case Array.isArray(Select):
			Chosen = Select.filter((Name) => Flavors.includes(Name));
			break;
		case typeof Select === "string" && Flavors.includes(Select):
			Chosen = [Select];
			break;
		default:
			return Content; // absent / false / an unknown single name - verbatim
	}
	// The chain, in the family's fixed order - ONLY the selected flavors run,
	// each daisy-chaining the text of the previous one.
	let Text = Content;
	switch (true) {
		case Chosen === null || Chosen.includes("dash"):
			Text = Replace(Text, Dashes, Replacement).text;
	}
	switch (true) {
		case Chosen === null || Chosen.includes("quotes"):
			Text = ReplaceMap(Text, Quotes).text;
	}
	switch (true) {
		case Chosen === null || Chosen.includes("ellipsis"):
			Text = Replace(Text, Ellipsis, "...").text;
	}
	switch (true) {
		case Chosen === null || Chosen.includes("spaces"):
			Text = Replace(Text, Spaces, " ").text;
	}
	switch (true) {
		case Chosen === null || Chosen.includes("invisible"):
			Text = Replace(Text, Invisible, "").text;
	}
	switch (true) {
		case Chosen === null || Chosen.includes("fullwidth"):
			Text = ReplaceMap(Text, Fullwidth).text;
	}
	return Text;
};
