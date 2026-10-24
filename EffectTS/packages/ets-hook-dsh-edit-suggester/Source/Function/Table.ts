// Table - the one formatter for a six-value heuristic table: the decision
// record's stored lines and the `decided` ledger line print the same
// `name=value` pairs in the canonical order, so the two can be diffed.
//
//   scope=1.00,graph=0.50,prior=1.00,literal=0.50,history=0.33,accept=0.33
//
// Two decimals: the values are scores, and a two-decimal ledger keeps the
// lines short and stable (the kappa's own precision in the note).
import type { HeuristicValues } from "../Interface/Decision.js";

export default (Values: HeuristicValues): string =>
	[
		`scope=${Values.scope.toFixed(2)}`,
		`graph=${Values.graph.toFixed(2)}`,
		`prior=${Values.prior.toFixed(2)}`,
		`literal=${Values.literal.toFixed(2)}`,
		`history=${Values.history.toFixed(2)}`,
		`accept=${Values.accept.toFixed(2)}`,
	].join(",");
