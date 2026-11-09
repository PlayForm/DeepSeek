// CostTurn - one turn row of the table: the group of steps the ledger
// stored under one Turn number, with every aggregate the eleven columns and
// the markers read. A turn is never a ledger row; the fold builds it.
import type CostBuckets from "@Interface/Buckets";
import type CostStep from "@Interface/Step";
import type CostTally from "@Interface/Tally";
import type CostTokens from "@Interface/Tokens";

export default interface CostTurn {
	turn: number;
	at: number;
	endedAt: number;
	steps: readonly CostStep[];
	cost: CostBuckets;
	tokens: CostTokens;
	cacheHit: number | null;
	provider: string;
	model: string;
	files: readonly CostTally[];
	tools: readonly CostTally[];
	direct: number;
	amortized: number;
	saving: number;
	retries: number;
	errors: number;
	unpriced: number;
	currency: string;
	mixed: boolean;
}
