// Config — the validated plugin-config shape the loader hands to `apply`
// (CARGO MODULE). Cordis validates the exported Schemastery schema while the
// plugin loads and fills every default (docs/user/develop/basic/config.md:45),
// so `apply` receives a plain object of exactly this shape. The schema that
// produces it lives in Variable/Config.ts; every field here is a config field
// (the cordis.yml test — no hardcoded tunables).
//
// `updateMode` stays a plain `string` (the schema field is Schema.string()).
// For the CARGO MODULE the ONLY mode is "cargo" — the Rust-side CLI
// (`cargo upgrade`, cargo-edit): Rust does not co-opt into the TypeScript
// ecosystem and there is no npm-library equivalent for cargo manifest
// updates, so the update stage operates at the exclusionary level through
// the cargo CLI. The field is kept open (like the parent governor's) so a
// future mode can be added without a schema change; anything other than
// "cargo" still runs the cargo CLI today (the only implemented path).
export default interface Config {
	/** Ledger enabled — write the durable log file. */
	log: boolean;
	/** Ledger file (one SEPARATE ledger for the cargo module — never the
	 *  package.json governor's log). */
	logFile: string;
	/** Cooldown between update-stage dispatches, per directory (epoch ms). */
	updateCooldownMs: number;
	/** Strict chain pass: strip unknown deps (the whole `name = "…"` entry) in
	 *  a governed workspace — the documented Cargo-specific decision. */
	strict: boolean;
	/** Actor tool names whose fs/observed events trigger governing. */
	mutationTools: string[];
	/** Circuit breaker: consecutive update-stage failures per directory before pause. */
	maxUpdateFailures: number;
	/** cargo binary (bare name resolved by the subprocess seam, or an absolute
	 *  path — the host PATH is not the user's shell PATH). */
	cargoBin: string;
	/** Global update-policy.json; empty means discovery + built-in default. */
	policyFile: string;
	/** Global pin-policy.json (the keep-list of the FULL-VERSION NORMALIZATION
	 *  directive); empty means discovery (the file's own directory →
	 *  registry-adjacent → built-in empty default). */
	keepFile: string;
	/** Update stage mode: "cargo" is the only implemented mode (the Rust-side
	 *  CLI through ctx.subprocess). Kept as an open string for future modes. */
	updateMode: string;
	/** Excluded path segments (anywhere mode, exclusion-first). */
	exclude: string[];
}
