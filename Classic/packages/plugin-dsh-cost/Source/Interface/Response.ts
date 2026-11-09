// Response - the one JSON envelope the route answers and the browser folds
// (Design.md section 9.2): `ok` is true only when the ledger was read and
// the session resolved, every failure code carries its one actionable line
// in `message`, and `path` names the resolved ledger file so the
// unavailable copy can point at it. The row fields echo the applied budget
// and its truncation flag; the data fields carry the resolved session, the
// currency facts, the whole-session summary and the newest calls, plus the
// three view arrays the tab ranks beside the calls: one row per file the
// session touched or allocated to, one per stage, and one per provider and
// model. The three view arrays are null when the read did not run (the
// session is not recorded) and empty when it ran and found no rows, so a
// consumer reads null as "no read" and never guesses.
import type CostCall from "@Interface/Call.js";
import type CostFileRow from "@Interface/FileRow.js";
import type CostModelRow from "@Interface/ModelRow.js";
import type CostSession from "@Interface/Session.js";
import type CostStageRow from "@Interface/StageRow.js";
import type CostSummary from "@Interface/Summary.js";

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
}
