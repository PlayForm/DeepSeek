/**
 * @module Valuation
 *
 * The optional valuation block a cost read carries when the caller names a
 * cost basis (the research's sections 4 and 8): the recorded money, the
 * money the selected catalog revision gives the same usage, the difference
 * between the two, and the count of calls that revision could not price,
 * beside the basis, the revision, the attribution policy version and when
 * the comparison ran.
 *
 * @remarks
 * THE READER'S BLOCK, WITHOUT A READER: the Classic engine folds this block
 * into its session envelope (Function/Reader's `valuation` field). The twin
 * has not ported that envelope yet - its read family is Function/Report,
 * Function/Assess and Function/Contributions, each a plain row read with no
 * envelope - so the block is the Function those reads (and the future
 * session read) call, and nothing else about it changes: the preview reads
 * the whole session, the block is a session headline, and per-call money
 * stays as recorded.
 *
 * THE THREE ANSWERS: an absent selection, the 'as-recorded' basis and a
 * basis without a revision all answer undefined, so a recorded read keeps
 * its exact shape; a basis that names a revision while the pricing service
 * is absent is one actionable line, never a silently recorded-only answer;
 * and a basis that names a revision gets the pricing service's own preview
 * over this session - one pricing engine, never a second copy of the
 * arithmetic.
 *
 * THE POLICY VERSION is the attribution policy the ledger declares - the
 * newest Valuation row's PolicyVersion, else the newest Allocation row's
 * Method, else the v7 seed's own 'bytes/context' fallback - because this
 * lane reallocates nothing and the recorded split is the ledger's own fact.
 * The `unpriced` count is the preview's own, never the recorded summary's:
 * the two figures answer different questions, and a comparison labelled
 * with the recorded count would name the wrong revision.
 */
import type { DatabaseSync } from "node:sqlite";
import type PricingService from "../Interface/PricingService.js";
import type ValuationBlock from "../Interface/ValuationBlock.js";
import type ValuationSelection from "../Interface/ValuationSelection.js";
export default _default;
declare function _default(Database: DatabaseSync, Pricing?: PricingService): {
    Block: (SessionId: string, Selection?: ValuationSelection) => ValuationBlock | undefined;
};
