// Config — the plugin's Schemastery Config schema for the CARGO MODULE (a
// Variable: one constant built once at load), now produced by the FACTORY's
// schema factory (`factory.Schema(shared?, module?)` — SCHEME.md §2.14): the
// SHARED block (log / logFile / updateCooldownMs / mutationTools volatile —
// the P8 hot-editable cells — plus policyFile and exclude, whose built-in
// default is the factory's own Variable/Default list, identical to this
// module's historical one) followed by the module's OWN fields verbatim.
//
// Defaults mirror the package.json governor except for the module-specific
// fields: the SEPARATE ledger (hook-dsh-governor-cargo.log — never the package
// governor's log, passed as the `shared.logFile` default), `cargoBin` (bare
// name resolved by the subprocess seam; set an absolute path when the host
// PATH lacks cargo), and `updateMode: "cargo"` — the only implemented mode
// (the Rust-side CLI; Rust does not co-opt into the TypeScript ecosystem).
//
// CONTRACT NOTE: the loader contract requires `Config` as a static named
// export — built at MODULE LOAD, before any service exists. The factory's
// Schema is an instance method, so the schema is produced through the
// STANDALONE named export (factory v0.1.1, P1 — the pre-v0.1.1 workaround,
// invoking the class prototype with `call(null, …)`, is gone; the schema
// factory never reads `this`). The module's own fields are real Schemastery
// fields built with the same @deepseek-ai/schemastery import the loader
// consumes (the schema must be a real schemastery instance — the Standard
// Schema `~standard` interface).
import { Schema as Compose } from "@playform/ets-dsh-plugin-factory";
import Schema from "@deepseek-ai/schemastery";

export default Compose(
	{
		// Ledger file — the CARGO MODULE's OWN ledger (separate from
		// the package governor's).
		logFile: "~/.dsh/hook-dsh-governor-cargo.log",
	},
	{
		// Strict chain pass: strip unknown deps (the whole `name = "…"` entry) in
		// a governed workspace — the documented Cargo-specific decision.
		strict: Schema.boolean().default(false),
		// Circuit breaker: consecutive update-stage failures per directory
		// before pause.
		maxUpdateFailures: Schema.number().default(3),
		// cargo binary for the update stage (bare name resolved through the
		// subprocess seam's resolveExecutable, or an absolute path — the host
		// PATH is not the user's shell PATH).
		cargoBin: Schema.string().default("cargo"),
		// Global pin-policy.json (the keep-list of the FULL-VERSION
		// NORMALIZATION directive: kept packages stay byte-identical); empty
		// means discovery — the file's own directory, then the directory
		// co-located with the nearest registry.json, then the built-in empty
		// default (the union of the readable sources, mirroring the pinner;
		// the sidecars and the P3 chain keys come from the factory's
		// ResolvePolicy, the global keepFile source from the transform).
		keepFile: Schema.string().default(""),
		// Update stage mode: "cargo" (the Rust-side CLI through ctx.subprocess)
		// is the only implemented mode — kept open for future modes.
		updateMode: Schema.string().default("cargo"),
	},
);
