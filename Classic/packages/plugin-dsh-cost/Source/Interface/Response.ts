// Response - the one JSON envelope the route answers and the browser folds
// (Design.md section 9.2): `ok` is true only when the ledger was read and
// the session resolved, every failure code carries its one actionable line
// in `message`, and `path` names the resolved ledger file so the
// unavailable copy can point at it. The row fields echo the applied budget
// and its truncation flag; the data fields carry the resolved session, the
// currency facts, the whole-session summary, the coverage of that summary and
// the newest calls, plus the three view arrays the tab ranks beside the
// calls: one row per file the session touched or allocated to, one per stage,
// and one per provider and model. The three view arrays are null when the
// read did not run (the session is not recorded) and empty when it ran and
// found no rows, so a consumer reads null as "no read" and never guesses.
//
// `coverage` is the unpriced-usage fact the money cannot carry (research
// section 2.2: a missing rate is unpriced, a known free rate is an explicit
// zero): the call counts the summary already states beside the token buckets
// the unpriced calls spent, so a zero-cost row is labelled unpriced instead
// of free.
//
// `valuation` is the one optional field (lane B4d; the research's section 8):
// the headline comparison a selected cost basis adds beside the recorded
// money - the basis, the revision it evaluates against, the attribution policy
// version, when it ran, and the recorded, revised and difference figures over
// the same session. It is absent when the caller names no basis or asks for
// 'as-recorded', so the recorded read is byte-identical to the envelope before
// this lane; when present it never replaces a per-call money field, which
// stays as recorded.
import type CostCall from "@Interface/Call.js";
import type CostFileRow from "@Interface/FileRow.js";
import type CostModelRow from "@Interface/ModelRow.js";
import type CostSession from "@Interface/Session.js";
import type CostStageRow from "@Interface/StageRow.js";
import type CostSummary from "@Interface/Summary.js";
import type CostTokens from "@Interface/Tokens.js";
import type { ValuationBasis } from "@Interface/ValuationSelection.js";

// The priced-versus-unpriced facts of one read: how many calls the session
// booked, how many of them carried a price row, how many did not, and the
// token buckets the unpriced ones spent. `unpricedTokens.reported` stays null
// when the log reported no total for those calls, never zero.
interface Coverage {
	calls: number;
	priced: number;
	unpriced: number;
	unpricedTokens: CostTokens;
}

// Valuation - the headline comparison a selected basis adds to the envelope
// (lane B4d; the research's sections 4 and 8): which basis was asked for, the
// catalog revision it evaluates against, the attribution policy version the
// ledger declares, when the comparison ran, the money the ledger recorded for
// the session, the money the selected revision gives that same usage, and the
// difference between the two. It is a comparison block, not the stored
// Valuation row of Interface/Valuation.ts: nothing is persisted, and the
// per-call money fields stay as recorded. `recorded` and `revised` cover the
// same calls - the ones the revision prices in the preview's currency - so
// `difference` compares like with like. The field is absent, never null, when
// no selection names a basis and a revision, so the recorded read keeps the
// exact envelope it had before this lane.
export interface Valuation {
	basis: ValuationBasis;
	revisionId: number;
	policyVersion: string;
	calculatedAt: number;
	recorded: number;
	revised: number;
	difference: number;
}

export default interface CostResponse {
	ok: boolean;
	code: "ok" | "session" | "unavailable" | "error";
	message: string | null;
	path: string;
	rows: number;
	truncated: boolean;
	session: CostSession | null;
	currency: string;
	currencies: readonly string[];
	summary: CostSummary;
	coverage: Coverage;
	calls: readonly CostCall[];
	files: readonly CostFileRow[] | null;
	stages: readonly CostStageRow[] | null;
	models: readonly CostModelRow[] | null;
	valuation?: Valuation;
}
