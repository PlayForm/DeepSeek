// Service - the engine surface the UI package resolves through ctx.get("cost"):
// the session read that fills the panel's envelope and the file-scoped
// contribution read that answers which conversations paid for one file and
// what share each one carried. Both read the same ledger read-only; the
// contribution read returns plain rows, so it carries no envelope.
import type CostContributionRow from "./ContributionRow.js";
import type CostResponse from "./Response.js";

export default interface CostService {
	session(SessionId: string, Rows: number): CostResponse;
	contributions(Path: string): readonly CostContributionRow[];
}
