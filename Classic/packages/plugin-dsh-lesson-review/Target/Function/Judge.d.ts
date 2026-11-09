/**
 * @module Judge
 *
 * The deterministic acceptance rules between the model's reply and the corpus.
 *
 * @remarks
 * This module is the reason the review can run unattended: the model
 * proposes, the judge disposes, and every refusal names the rule that
 * refused it so the ledger and the report can say WHY.
 *
 * THE RULES ARE MECHANICAL ON PURPOSE. Every one of them is a rule the
 * Hermes review states in prose (`_DO_NOT_CAPTURE_BLOCK`, the class-level
 * naming rule, read-before-write) and that a prompt alone cannot enforce: a
 * model that ignores an instruction produces a plausible artifact, and a
 * plausible artifact in the corpus is worse than no artifact. Each rule
 * below is a shape the corpus must never contain, expressed as a test.
 *
 * WHAT THE JUDGE DOES NOT DO: it never edits an operation into
 * acceptability. A refused operation is reported, not repaired - a repaired
 * write is a write nobody proposed.
 */
import type { Corpus } from "@Interface/Corpus.js";
import type { Proposal, Verdict } from "@Interface/Proposal.js";
export default _default;
declare function _default(Proposal_: Proposal, Corpus: Corpus): Verdict;
