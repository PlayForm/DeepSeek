// RecoveryRule - one override of the fail-open recovery table. The DEFAULT
// table (Function/Recovery) maps every obligation to its honest failure
// behavior; a config override replaces one row. Behavior values:
//   "fail-open"   - an unevaluable check passes (with a recovery ledger line);
//   "fail-closed" - an unevaluable check denies.
export default interface RecoveryRule {
	/** The obligation the override applies to. */
	obligation: "contributes" | "scope" | "policy" | "preconditions";
	/** The failure behavior. */
	behavior: "fail-open" | "fail-closed";
}
