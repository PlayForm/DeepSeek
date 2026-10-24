// Textual - the FALLBACK rename engine (Function/Textual): the scope-honest
// whole-word rewrite the plugin shipped before the AST targeting - a
// word-boundary regex (never a substring replace), applied to the block's line
// range. It runs when the semantics service is absent, refused, or its plan has
// no edit inside the scope.
//
// The engine returns the new text, never a mutation: the caller owns the
// version fence (Function/Publish) and the module's own ledger line. `undefined`
// is "no occurrences in scope" - the caller's byte-exact refusal.
export default (
	Lines: string[],
	From: number,
	To: number,
	Old: string,
	New: string,
): string | undefined => {
	const Pattern = new RegExp(`\\b${Old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
	const Output = [...Lines];
	let Count = 0;
	for (let Index = From; Index <= To; Index += 1) {
		const Line = Output[Index - 1];
		if (Line === undefined) {
			continue;
		}
		const Hits = Line.match(Pattern);
		if (Hits !== null && Hits !== undefined) {
			Count += Hits.length;
			Output[Index - 1] = Line.replace(Pattern, New);
		}
	}
	switch (true) {
		case Count === 0:
			return undefined;
		default:
			return Output.join("\n");
	}
};
