import type { Reconciliation } from "@Interface/Drift.js";
export default _default;
declare function _default(
/** The package root (already resolved by Function/Package). */
PackageRoot: string, 
/** The resolved workspace root (the display base). */
Root: string, 
/** The graph's Test node paths for the package (empty when absent). */
Nodes: string[]): Reconciliation | undefined;
