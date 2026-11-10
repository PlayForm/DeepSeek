import type CostCall from "./Call.js";
import type CostFileRow from "./FileRow.js";
import type CostModelRow from "./ModelRow.js";
import type CostSession from "./Session.js";
import type CostStageRow from "./StageRow.js";
import type CostSummary from "./Summary.js";
import type CostTokens from "./Tokens.js";
import type { ValuationBasis } from "./ValuationSelection.js";
/**
 * @module Response
 *
 * The one JSON envelope the route answers and the browser folds: the status
 * and message, the row budget, the session and summary data, the newest calls
 * and the three view arrays, and the optional valuation block.
 *
 * @remarks
 *
 * The envelope follows Design.md section 9.2. `ok` is true only when the ledger
 * was read and the session resolved, every failure code carries its one
 * actionable line in `message`, and `path` names the resolved ledger file so
 * the unavailable copy can point at it. The row fields echo the applied budget
 * and its truncation flag; the data fields carry the resolved session, the
 * currency facts, the whole-session summary, the coverage of that summary and
 * the newest calls, plus the three view arrays the tab ranks beside the calls:
 * one row per file the session touched or allocated to, one per stage, and one
 * per provider and model. The three view arrays are null when the read did not
 * run (the session is not recorded) and empty when it ran and found no rows, so
 * a consumer reads null as "no read" and never guesses.
 *
 * `coverage` is the unpriced-usage fact the money cannot carry (research
 * section 2.2: a missing rate is unpriced, a known free rate is an explicit
 * zero): the call counts the summary already states beside the token buckets
 * the unpriced calls spent, so a zero-cost row is labelled unpriced instead of
 * free.
 *
 * `valuation` is the one optional field (lane B4d; the research's section 8):
 * the headline comparison a selected cost basis adds beside the recorded money
 * - the basis, the revision it evaluates against, the attribution policy
 * version, when it ran, the recorded, revised and difference figures over the
 * same session, and the calls that revision could not price. It is absent when
 * the caller names no basis or asks for 'as-recorded', so the recorded read is
 * byte-identical to the envelope before this lane; when present it never
 * replaces a per-call money field, which stays as recorded.
 */
/**
 * The priced-versus-unpriced facts of one read: how many calls the session
 * booked, how many of them carried a price row, how many did not, and the
 * token buckets the unpriced ones spent. `unpricedTokens.reported` stays null
 * when the log reported no total for those calls, never zero.
 */
interface Coverage {
    calls: number;
    priced: number;
    unpriced: number;
    unpricedTokens: CostTokens;
}
/**
 * Valuation - the headline comparison a selected basis adds to the envelope
 * (lane B4d; the research's sections 4 and 8): which basis was asked for, the
 * catalog revision it evaluates against, the attribution policy version the
 * ledger declares, when the comparison ran, the money the ledger recorded for
 * the session, the money the selected revision gives that same usage, the
 * difference between the two, and the calls that revision could not price. It
 * is a comparison block, not the stored Valuation row of
 * Interface/Valuation.ts: nothing is persisted, and the per-call money fields
 * stay as recorded. `recorded` and `revised` cover the same calls - the ones
 * the revision prices in the preview's currency - so `difference` compares
 * like with like. `unpriced` is the preview's own count of the calls the
 * selected revision leaves unpriced, never the recorded summary's count: the
 * two figures answer different questions, and a comparison labelled with the
 * recorded count would name the wrong revision. The field is absent, never
 * null, when no selection names a basis and a revision, so the recorded read
 * keeps the exact envelope it had before this lane.
 */
export interface Valuation {
    /**
     * The basis the caller asked for.
     */
    basis: ValuationBasis;
    /**
     * The catalog revision the basis evaluates against.
     */
    revisionId: number;
    /**
     * The attribution policy version the ledger declares.
     */
    policyVersion: string;
    /**
     * When the comparison ran, in epoch milliseconds.
     */
    calculatedAt: number;
    /**
     * The money the ledger recorded for the session.
     */
    recorded: number;
    /**
     * The money the selected revision gives the same usage.
     */
    revised: number;
    /**
     * The revised total minus the recorded total.
     */
    difference: number;
    /**
     * The calls the selected revision could not price.
     */
    unpriced: number;
}
/**
 * The route's one JSON envelope, answered once per read.
 */
export default interface CostResponse {
    /**
     * True only when the ledger was read and the session resolved.
     */
    ok: boolean;
    /**
     * The failure kind, "ok" when the read succeeded.
     */
    code: "ok" | "session" | "unavailable" | "error";
    /**
     * The one actionable line a failure carries, null on success.
     */
    message: string | null;
    /**
     * The resolved ledger file path.
     */
    path: string;
    /**
     * The applied row budget.
     */
    rows: number;
    /**
     * Whether the read truncated the calls at the budget.
     */
    truncated: boolean;
    /**
     * The resolved session, null when the ledger records none.
     */
    session: CostSession | null;
    /**
     * The session's dominant currency.
     */
    currency: string;
    /**
     * The distinct currencies the session's calls carried.
     */
    currencies: readonly string[];
    /**
     * The whole-session summary.
     */
    summary: CostSummary;
    /**
     * The summary's coverage: the priced and unpriced counts and tokens.
     */
    coverage: Coverage;
    /**
     * The newest calls within the budget, re-sorted ascending.
     */
    calls: readonly CostCall[];
    /**
     * The FILES view, null when the read did not run.
     */
    files: readonly CostFileRow[] | null;
    /**
     * The STAGES view, null when the read did not run.
     */
    stages: readonly CostStageRow[] | null;
    /**
     * The MODELS view, null when the read did not run.
     */
    models: readonly CostModelRow[] | null;
    /**
     * The optional valuation comparison, absent when no basis is selected.
     */
    valuation?: Valuation;
}
export {};
