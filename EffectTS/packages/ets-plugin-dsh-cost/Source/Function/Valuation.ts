import type { DatabaseSync, SQLOutputValue } from "node:sqlite";

import type PricingService from "@Interface/PricingService.js";
import type ValuationBlock from "@Interface/ValuationBlock.js";
import type ValuationSelection from "@Interface/ValuationSelection.js";

/**
 * @module Valuation
 *
 * The optional valuation block a cost read carries when the caller names a
 * cost basis (the research's sections 4 and 8): the recorded money, the
 * money the selected catalog revision gives the same usage, the difference
 * between the two, and the count of calls that revision could not price,
 * beside the basis, the revision, the attribution policy version and when
 * the comparison ran.
 *
 * @remarks
 *
 * THE READER'S BLOCK, WITHOUT A READER: the Classic engine folds this block
 * into its session envelope (Function/Reader's `valuation` field). The twin
 * has not ported that envelope yet - its read family is Function/Report,
 * Function/Assess and Function/Contributions, each a plain row read with no
 * envelope - so the block is the Function those reads (and the future
 * session read) call, and nothing else about it changes: the preview reads
 * the whole session, the block is a session headline, and per-call money
 * stays as recorded.
 *
 * THE THREE ANSWERS: an absent selection, the 'as-recorded' basis and a
 * basis without a revision all answer undefined, so a recorded read keeps
 * its exact shape; a basis that names a revision while the pricing service
 * is absent is one actionable line, never a silently recorded-only answer;
 * and a basis that names a revision gets the pricing service's own preview
 * over this session - one pricing engine, never a second copy of the
 * arithmetic.
 *
 * THE POLICY VERSION is the attribution policy the ledger declares - the
 * newest Valuation row's PolicyVersion, else the newest Allocation row's
 * Method, else the v7 seed's own 'bytes/context' fallback - because this
 * lane reallocates nothing and the recorded split is the ledger's own fact.
 * The `unpriced` count is the preview's own, never the recorded summary's:
 * the two figures answer different questions, and a comparison labelled
 * with the recorded count would name the wrong revision.
 */
/**
 * The one statement the block adds: the ledger's declared attribution
 * policy, read from the stored facts rather than from the caller - the
 * newest Valuation row names it once a valuation has been recorded, the
 * newest Allocation row names the method the recorded money was actually
 * split with, and the v7 seed's fallback answers before anything has been
 * allocated.
 */
const Query = {
	Policy: `SELECT COALESCE(
    (SELECT Valuation.PolicyVersion FROM Valuation ORDER BY Valuation.ValuationId DESC LIMIT 1),
    (SELECT Allocation.Method FROM Allocation ORDER BY Allocation.AllocationId DESC LIMIT 1),
    'bytes/context') AS PolicyVersion;`,
} as const;

/**
 * One string cell of a statement row, or null.
 */
const Text = (Row: Record<string, SQLOutputValue>, Key: string): string | null => {
	const Value = Row[Key];
	return typeof Value === "string" ? Value : null;
};

/**
 * The empty row the policy read falls back to: a statement that answers no
 * row (an empty ledger) still yields the seed's own policy word below,
 * never a throw and never a guess.
 */
const Empty: Record<string, SQLOutputValue> = {};

export default (Database: DatabaseSync, Pricing?: PricingService) => {
	const SelectPolicy = Database.prepare(Query.Policy);

	// The block builder: undefined keeps the recorded read byte-identical, and
	// only a named non-recorded basis with a revision reaches the preview.
	const Block = (
		SessionId: string,
		Selection?: ValuationSelection,
	): ValuationBlock | undefined => {
		// The two locals narrow the optional selection for the switch's later
		// arms; a switch (true) arm cannot narrow the original binding.
		const Basis = Selection?.basis ?? "as-recorded";
		const Revision = Selection?.revisionId;
		switch (true) {
			case Basis === "as-recorded":
				return undefined;
			case Revision === undefined:
				return undefined;
			case Pricing === undefined:
				throw new Error(
					`plugin-dsh-cost: the valuation basis "${Basis}" needs the pricing service, which this context did not provide - the ledger write handle was absent`,
				);
			default: {
				const Preview = Pricing.preview(Revision, SessionId);
				const Policy = SelectPolicy.get() ?? Empty;
				return {
					Basis,
					RevisionId: Revision,
					PolicyVersion: Text(Policy, "PolicyVersion") ?? "bytes/context",
					CalculatedAt: Date.now(),
					Recorded: Preview.Current,
					Revised: Preview.Revised,
					Difference: Preview.Difference,
					Unpriced: Preview.Unpriced,
				};
			}
		}
	};

	return { Block };
};
