// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads and
// fills every default (docs/user/develop/basic/config.md:45), so `apply`
// receives a plain object of exactly this shape. The schema that produces it
// lives in Variable/Config.ts; every field here is a config field (the
// cordis.yml test - no hardcoded tunables).
//
// VOLATILE CELLS: `logFile`, `enabled`, `intent`, `intentKeywords` and
// `notice` are `.volatile()` in the schema - the loader hands them to apply
// as stable `{ get() }` references, and the FACTORY'S State builder unwraps
// them defensively (factory SCHEME.md section 2.10), so this interface stays
// the plain shape. A hot edit to a volatile field commits WITHOUT remounting
// the plugin: the next tools/post-execute dispatch reads the refreshed
// State. `targets` and `exempt` are plain (structural): editing them changes
// which tool names the filter may EVER touch, so the loader remounts - the
// honest posture for a decision surface.
//
// THE `enabled` FLAG IS NOT THE LEDGER GATE: the factory's shared `log` cell
// lands on `State.Enabled` (the durable-ledger switch), while this module's
// `enabled` lands on the DISTINCT `State.Active` cell. A filter switched off
// still writes its activation line and its refusals to the ledger - the
// family's "did it activate is answerable from the ledger alone" contract.
export default interface Config {
	/** Ledger enabled - write the durable log file (the shared minimal cell). */
	log: boolean;
	/** Ledger file - the comment-filter ledger, separate from the family's
	 *  logs (volatile: hot-editable without a remount). */
	logFile: string;
	/** The whole filter on/off - the per-call Gate's first arm (volatile). */
	enabled: boolean;
	/** The tool names the filter may touch (structural). `read` is HERE,
	 *  unlike the normalize flavors, which exempt it as byte-contracted. */
	targets: string[];
	/** The tool names that always pass by identity (structural). `read` and
	 *  `ccr_retrieve` are ABSENT by design - the deliberate opposite. */
	exempt: string[];
	/** Consult the per-task intent gate stashed at agent/pre-step
	 *  (volatile). */
	intent: boolean;
	/** The intent keywords (volatile): a task text containing one means the
	 *  task is ABOUT comments, so the read result must stay untouched. */
	intentKeywords: string[];
	/** Append the omission notice line to a stripped result (volatile). */
	notice: boolean;
}
