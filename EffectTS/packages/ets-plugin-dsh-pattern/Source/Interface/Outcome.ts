/**
 * @module Outcome
 *
 * The feedback vocabulary Record accepts.
 *
 * @remarks
 *
 * PATTERN-GRAPH-PLUGIN.md section 3, items 4 and 5: the confidence moves with
 * the outcome - did the edit succeed and verify - and with the acceptance -
 * did the model use the suggestion.
 */
export type Outcome = "accepted" | "rejected" | "applied" | "failed";
