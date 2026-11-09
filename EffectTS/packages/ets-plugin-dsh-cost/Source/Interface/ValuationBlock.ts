// ValuationBlock - the headline comparison a selected basis adds beside the
// recorded money (the research's sections 4 and 8): which basis was asked
// for, the catalog revision it evaluates against, the attribution policy
// version the ledger declares, when the comparison ran, the money the ledger
// recorded for the session, the money the selected revision gives that same
// usage, the difference between the two, and the calls that revision could
// not price. It is a comparison block, not the stored Valuation row of
// Interface/Valuation.ts: nothing is persisted, and the per-call money fields
// stay as recorded.
//
// `Recorded` and `Revised` cover the same calls - the ones the revision
// prices in the preview's currency - so `Difference` compares like with like.
// `Unpriced` is the preview's own count of the calls the selected revision
// leaves unpriced, never the recorded summary's count: the two figures answer
// different questions, and a comparison labelled with the recorded count
// would name the wrong revision. A read that names no basis, names
// 'as-recorded', or names a basis without a revision answers undefined rather
// than a block of zeros, so the recorded read keeps its exact bytes.
import type { ValuationBasis } from "@Interface/ValuationSelection.js";

export default interface ValuationBlock {
	readonly Basis: ValuationBasis;
	readonly RevisionId: number;
	readonly PolicyVersion: string;
	readonly CalculatedAt: number;
	readonly Recorded: number;
	readonly Revised: number;
	readonly Difference: number;
	readonly Unpriced: number;
}
