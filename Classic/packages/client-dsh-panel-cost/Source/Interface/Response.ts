import type CostCall from "@Interface/Call.js";
import type CostFileRow from "@Interface/FileRow.js";
import type CostModelRow from "@Interface/ModelRow.js";
import type CostSession from "@Interface/Session.js";
import type CostStageRow from "@Interface/StageRow.js";
import type CostSummary from "@Interface/Summary.js";

/**
 * @module Response
 *
 * The one JSON envelope the route answers and the browser folds.
 *
 * @remarks
 *
 * The shape is the Design.md section 9.2 one: `ok` is true only when the ledger was read and the
 * session resolved, every failure code carries its one actionable line in `message`, and `path`
 * names the resolved ledger file so the unavailable copy can point at it. The row fields echo the
 * applied budget and its truncation flag; the data fields carry the resolved session, the currency
 * facts, the whole-session summary, the newest calls, and the three ranked arrays the other views
 * read (files with their lifetime split, stages, models). A null array means the read did not run;
 * an empty one means it ran and found nothing.
 *
 * `valuation` is the one field this mirror gained for lane B4d: the headline comparison the engine
 * adds when the caller selects a basis and a catalog revision - the basis, the revision, the
 * attribution policy version, when the comparison ran, the recorded, revised and difference
 * figures over the same session, and the count of calls that revision could not price. It is
 * absent when no basis is selected, so the recorded read renders exactly as before; the mirror
 * keeps the union spelled out rather than importing the engine's type, the same way every other
 * field of this package is mirrored.
 */
/**
 * Valuation - the recorded-versus-revised headline of one read. `recorded` and `revised` cover the
 * same calls, so `difference` compares like with like; `unpriced` is the count of calls the
 * selected revision could not price, not the recorded summary's count; nothing here replaces a
 * per-call money field.
 */
export interface Valuation {
	/**
	 * The basis the read was valued under.
	 */
	basis: "as-recorded" | "corrected" | "current" | "scenario";
	/**
	 * The catalog revision the comparison pinned.
	 */
	revisionId: number;
	/**
	 * The attribution policy version the ledger declared.
	 */
	policyVersion: string;
	/**
	 * When the comparison ran, in epoch milliseconds.
	 */
	calculatedAt: number;
	/**
	 * The recorded total over the session's calls.
	 */
	recorded: number;
	/**
	 * The revised total over the same calls.
	 */
	revised: number;
	/**
	 * The signed difference of the two totals.
	 */
	difference: number;
	/**
	 * The count of calls the selected revision could not price.
	 */
	unpriced: number;
}

export default interface CostResponse {
	/**
	 * True only when the ledger was read and the session resolved.
	 */
	ok: boolean;
	/**
	 * The failure code, one actionable line in `message`.
	 */
	code: "ok" | "session" | "unavailable" | "error";
	/**
	 * The one actionable line the code carries, or null.
	 */
	message: string | null;
	/**
	 * The resolved ledger file the read answered.
	 */
	path: string;
	/**
	 * The applied row budget.
	 */
	rows: number;
	/**
	 * Whether the applied budget truncated the answer.
	 */
	truncated: boolean;
	/**
	 * The resolved session, or null.
	 */
	session: CostSession | null;
	/**
	 * The session's currency.
	 */
	currency: string;
	/**
	 * Every currency the session used.
	 */
	currencies: readonly string[];
	/**
	 * The whole-session summary.
	 */
	summary: CostSummary;
	/**
	 * The newest calls the budget answered.
	 */
	calls: readonly CostCall[];
	/**
	 * The files with their lifetime split; null when the read did not run, empty when it found
	 * nothing.
	 */
	files: readonly CostFileRow[] | null;
	/**
	 * The stage rows; null when the read did not run, empty when it found nothing.
	 */
	stages: readonly CostStageRow[] | null;
	/**
	 * The model rows; null when the read did not run, empty when it found nothing.
	 */
	models: readonly CostModelRow[] | null;
	/**
	 * The headline comparison a selected basis adds, absent when no basis is selected.
	 */
	valuation?: Valuation;
}
