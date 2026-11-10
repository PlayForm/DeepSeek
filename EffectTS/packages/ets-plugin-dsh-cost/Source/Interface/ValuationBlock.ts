import type { ValuationBasis } from "@Interface/ValuationSelection.js";

/**
 * @module ValuationBlock
 *
 * The headline comparison a selected basis adds beside the recorded money
 * (the research's sections 4 and 8): which basis was asked for, the catalog
 * revision it evaluates against, the attribution policy version the ledger
 * declares, when the comparison ran, the money the ledger recorded for the
 * session, the money the selected revision gives that same usage, the
 * difference between the two, and the calls that revision could not price.
 *
 * @remarks
 * It is a comparison block, not the stored Valuation row of
 * Interface/Valuation.ts: nothing is persisted, and the per-call money
 * fields stay as recorded.
 *
 * `Recorded` and `Revised` cover the same calls - the ones the revision
 * prices in the preview's currency - so `Difference` compares like with
 * like. `Unpriced` is the preview's own count of the calls the selected
 * revision leaves unpriced, never the recorded summary's count: the two
 * figures answer different questions, and a comparison labelled with the
 * recorded count would name the wrong revision. A read that names no basis,
 * names 'as-recorded', or names a basis without a revision answers
 * undefined rather than a block of zeros, so the recorded read keeps its
 * exact bytes.
 */
/**
 * One valuation comparison block.
 */
export default interface ValuationBlock {
	/**
	 * The basis the comparison was asked for.
	 */
	readonly Basis: ValuationBasis;

	/**
	 * The catalog revision the comparison evaluates against.
	 */
	readonly RevisionId: number;

	/**
	 * The attribution policy version the ledger declares.
	 */
	readonly PolicyVersion: string;

	/**
	 * When the comparison ran (epoch ms).
	 */
	readonly CalculatedAt: number;

	/**
	 * The money the ledger recorded for the session.
	 */
	readonly Recorded: number;

	/**
	 * The money the selected revision gives the same usage.
	 */
	readonly Revised: number;

	/**
	 * The difference between the two totals.
	 */
	readonly Difference: number;

	/**
	 * The calls the selected revision could not price.
	 */
	readonly Unpriced: number;
}
