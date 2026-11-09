// Service - the engine surface the UI package resolves through ctx.get("cost"):
// the session read that fills the panel's envelope, the file-scoped
// contribution read that answers which conversations paid for one file and
// what share each one carried, the file-scoped call read that answers which
// calls of one conversation allocated money to that file and what evidence
// each one carries, and the file-scoped version read that answers which
// content versions the ledger recorded for that same file and which touches
// are bound to each. All four read the same ledger read-only; the three
// file-scoped reads return plain rows, so they carry no envelope.
//
// THE SESSION READ accepts an optional valuation selection (lane B4d): the
// basis and the catalog revision the caller wants the recorded usage
// interpreted under. Absent, or the 'as-recorded' basis, answers exactly the
// recorded envelope; a selection that names a non-recorded basis and a
// revision adds the `valuation` block - the stored money, the repriced total
// and their difference over the same session - while every per-call money
// field stays as recorded.
//
// THE PRICING CONTRACT is re-exported here because package.json exposes one
// types entry (`./service`) and the panel's settings surface must list
// catalogs, revisions and rate rows without reaching into Target paths. The
// re-exports are type-only: the host half imports no engine code at runtime.
import type CostContributionRow from "./ContributionRow.js";
import type CostFileCallRow from "./FileCallRow.js";
import type CostResponse from "./Response.js";
import type ValuationSelection from "./ValuationSelection.js";
import type CostVersionRow from "./VersionRow.js";

export type { default as Catalog } from "./Catalog.js";
export type { default as CostFileCallRow } from "./FileCallRow.js";
export type { default as CostVersionRow } from "./VersionRow.js";
export type { default as PricingService } from "./PricingService.js";
export type { default as RateRow } from "./RateRow.js";
export type { default as Revision } from "./Revision.js";
export type { ValuationBasis } from "./ValuationSelection.js";
export type { ValuationSelection };

export default interface CostService {
	session(SessionId: string, Rows: number, Selection?: ValuationSelection): CostResponse;
	contributions(Path: string): readonly CostContributionRow[];
	fileCalls(Path: string, SessionId: string): readonly CostFileCallRow[];
	history(Path: string): readonly CostVersionRow[];
}
