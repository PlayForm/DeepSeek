// Response - the one JSON envelope the route answers and the browser folds
// (Design.md section 9.2): `ok` is true only when the ledger was read and
// the session resolved, every failure code carries its one actionable line
// in `message`, and `path` names the resolved ledger file so the
// unavailable copy can point at it. The row fields echo the applied budget
// and its truncation flag; the data fields carry the resolved session, the
// currency facts, the whole-session summary, the newest calls, and the three
// ranked arrays the other views read (files with their lifetime split,
// stages, models). A null array means the read did not run; an empty one
// means it ran and found nothing.
//
// `valuation` is the one field this mirror gained for lane B4d: the headline
// comparison the engine adds when the caller selects a basis and a catalog
// revision - the basis, the revision, the attribution policy version, when
// the comparison ran, and the recorded, revised and difference figures over
// the same session. It is absent when no basis is selected, so the recorded
// read renders exactly as before; the mirror keeps the union spelled out
// rather than importing the engine's type, the same way every other field of
// this package is mirrored.
import type CostCall from "@Interface/Call.js";
import type CostFileRow from "@Interface/FileRow.js";
import type CostModelRow from "@Interface/ModelRow.js";
import type CostSession from "@Interface/Session.js";
import type CostStageRow from "@Interface/StageRow.js";
import type CostSummary from "@Interface/Summary.js";

// Valuation - the recorded-versus-revised headline of one read. `recorded`
// and `revised` cover the same calls, so `difference` compares like with like;
// nothing here replaces a per-call money field.
export interface Valuation {
	basis: "as-recorded" | "corrected" | "current" | "scenario";
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
	calls: readonly CostCall[];
	files: readonly CostFileRow[] | null;
	stages: readonly CostStageRow[] | null;
	models: readonly CostModelRow[] | null;
	valuation?: Valuation;
}
