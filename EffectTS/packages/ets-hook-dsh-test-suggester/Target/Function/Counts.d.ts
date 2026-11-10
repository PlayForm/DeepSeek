export default _default;
/**
 * @module Counts
 *
 * The README's declared PASS count, parsed EXACTLY the way the aggregate
 * runner parses it (Maintain/Run/Smokes/Index.mjs): the first `(<n> PASS)`
 * occurrence after the `## Expected count` heading.
 *
 * @remarks
 *
 * The parse is the runner's own rule on purpose - a count the reconciliation
 * accepts but the runner rejects would make the note lie.
 *
 * A README without the heading, or without the count line after it, has NO
 * claim: `undefined`. The reconciliation names that as a drift, never as a
 * guessed zero.
 */
declare function _default(Text: string): number | undefined;
