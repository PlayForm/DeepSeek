import type { HeuristicValues } from "../Interface/Decision.js";
export default _default;
/**
 * @module Table
 *
 * The one formatter for a six-value heuristic table: the decision record's
 * stored lines and the `decided` ledger line print the same `name=value`
 * pairs in the canonical order, so the two can be diffed.
 *
 * @remarks
 *
 * The rendered line is
 * `scope=1.00,graph=0.50,prior=1.00,literal=0.50,history=0.33,accept=0.33`.
 *
 * Two decimals: the values are scores, and a two-decimal ledger keeps the
 * lines short and stable (the kappa's own precision in the note).
 */
declare function _default(Values: HeuristicValues): string;
