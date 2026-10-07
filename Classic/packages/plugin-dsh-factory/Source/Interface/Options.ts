// Options — the setup object Function/State (the State builder) consumes:
// `State(ctx, config, options)`.
//
//   module — REQUIRED. The module identity ("hook-dsh-governor-package",
//            "hook-dsh-pinner-package", "hook-dsh-governor-cargo", …). It is stored on
//            State.Module AND doubles as the logger/ledger prefix the
//            factory's own suppressed-error lines compose — picking the
//            module identity ("hook-dsh-governor-package") keeps every factory-composed
//            line byte-identical with the pre-refactor trio.
//   fields — OPTIONAL. A `StateKey → configKey` map of MODULE-SPECIFIC fields
//            to copy from the (cell-unwrapped) config onto the state object —
//            e.g. `{ Section: "sections" }` (pinner) or
//            `{ Strict: "strict", Wait: "updateCooldownMs", Limit:
//            "maxUpdateFailures", Binary: "ncuBin", Mode: "updateMode" }`
//            (governor). The SHARED mappings are fixed and never repeated
//            here: Tool←mutationTools, Policy←policyFile, Ledger←logFile,
//            Enabled←log, List←exclude.
//   policyFileName — OPTIONAL. The module's policy sidecar file name for the
//            union keep-list discovery ("pin-policy.json" for the pinner and
//            the cargo governor, "update-policy.json" for the governor's
//            policy machinery) — stored as State.PolicyName. When falsy,
//            ResolvePolicy only consults the configured global policy file
//            and the chain keys.
export default interface Options {
	/** The module identity — doubles as the logger/ledger prefix. */
	module: string;
	/** StateKey → configKey map of module-specific fields to copy. */
	fields?: Record<string, string> | undefined;
	/** The policy sidecar file name for union discovery (State.PolicyName). */
	policyFileName?: string | undefined;
}
