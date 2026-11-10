/**
 * @module Reader
 *
 * The engine's one ledger read that fills a CostResponse: the row budget
 * clamped to the tab's limits, the session row joined through Project and
 * Client, the newest calls with their touches and allocations folded into one
 * CostFile per FileId, and the whole-session summary.
 *
 * @remarks
 * The first touch in Seq order supplies the touch fields, the single
 * allocation row supplies the money, and the unattributed allocation row stays
 * out of `files` but keeps its money in `direct` and `amortized`. Beside
 * those, three view statements ride the same envelope: the per-file rows (this
 * session's money for a file beside the file's all-sessions total, the
 * carry-in before this conversation, this session's last turn's share and the
 * change the conversation produced), the stage ranking and the model ranking.
 * Each is its own statement joined on FileId - the money is never joined from
 * Allocation to Touch in one FROM clause, so a call that touched one file twice
 * cannot fan its allocation out. Beside the summary the envelope carries
 * `coverage`: the priced and unpriced call counts and the token buckets the
 * unpriced calls spent, because a call whose rate card the book does not carry
 * stores zero money and must be read as unpriced, never as free (research
 * section 2.2 - a missing rate is unpriced, a known free rate is an explicit
 * zero row). Every statement runs through the Query table below and reads
 * only; a session the ledger does not record answers ok false with code
 * "session" and the zero summary; every nullable column stays null when the
 * ledger stores no value. The read-only open lives in `Function/Provide` (the
 * package's own `Function/Open` is the write path - it migrates the schema - so
 * it is never reused here), which is why the reader sees only the open handle
 * and the service overwrites `path` with the resolved ledger path.
 *
 * The valuation selection (lane B4d; the research's sections 4 and 8): the
 * caller may carry the basis it wants the read interpreted under and the
 * catalog revision that basis evaluates against. An absent selection and the
 * 'as-recorded' basis leave every byte of the envelope as it was - the
 * recorded read is the default and the block is never added to it. A selection
 * that names both a non-recorded basis and a revision asks the pricing service
 * for its preview over this same session and appends the `valuation` block: the
 * money the ledger recorded, the money that revision gives the same usage, the
 * difference between the two, and the count of calls the revision could not
 * price, beside the basis, the revision, the attribution policy version and
 * when the comparison ran. The preview reads the whole session, not the page
 * budget, so the block is a session headline; per-call money stays as recorded
 * in this lane. A session the ledger does not record answers the failure
 * envelope without a block, because no read happened to compare.
 */
import type { DatabaseSync } from "node:sqlite";
import type PricingService from "../Interface/PricingService.js";
import type CostResponse from "../Interface/Response.js";
import type ValuationSelection from "../Interface/ValuationSelection.js";
export default function Reader(Database: DatabaseSync, SessionId: string, Rows: number, Selection?: ValuationSelection, Pricing?: PricingService): CostResponse;
