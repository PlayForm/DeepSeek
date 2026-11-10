/**
 * @module Counts
 *
 * The README's declared PASS count, parsed the way the aggregate runner parses
 * it.
 *
 * @remarks
 *
 * The parse mirrors the aggregate runner (Maintain/Run/Smokes/Index.mjs)
 * exactly: the first `(<n> PASS)` occurrence after the `## Expected count`
 * heading. The parse is the runner's own rule on purpose - a count the
 * reconciliation accepts but the runner rejects would make the note lie.
 *
 * A README without the heading, or without the count line after it, has NO
 * claim: the result is `undefined`. The reconciliation names that as a drift,
 * never as a guessed zero.
 */
export default (Text: string): number | undefined => {
	const Index = Text.indexOf("## Expected count");
	if (Index < 0) {
		return undefined;
	}
	const Match = /(\d+)\s*PASS/.exec(Text.slice(Index));
	return Match === null ? undefined : Number(Match[1]);
};
