// Config — the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default (docs/user/develop/basic/config.md:45), so
// invalid configuration fails LOUD at load instead of silently falling back
// per-field, and `apply` receives a validated plain config object. Defaults
// mirror the previous Access/* fallbacks; the load-crash lesson of the
// deprecated dev.1 build is covered by the runtime resolution rule — the
// schema import resolves from the running dsh's own copy
// (docs/user/develop/basic/publish.md:103).
//
// COMPOSED BY THE FACTORY (SCHEME.md §2.14): the shared block (log, logFile,
// updateCooldownMs, mutationTools, policyFile, exclude) followed by the
// module's own fields — via the STANDALONE named export (factory v0.1.1, P1):
// the loader needs `Config` at MODULE-EVALUATION time, before any context
// (and therefore any service instance) exists, so the module-level
// `Schema(shared?, module?)` is the module-load use (the pre-v0.1.1
// hand-restated block — shape parity by restatement — is gone). The built-in
// `exclude` default is NOT restated here: Variable/Default owns that list (it
// is also the governor's fence — see Function/Transform).
//
// The shape this schema produces is Interface/Config.ts; every default below
// is the schema-level home of that shape's field values.
//
// P8 — VOLATILE CELLS: `log`, `logFile`, `updateCooldownMs` and
// `mutationTools` are `.volatile()` — hot edits to them commit WITHOUT
// remounting the plugin (the fiber, and with it the ledger file handle state,
// the in-flight map and the circuit breaker, stay alive). The loader hands
// volatile fields to apply as stable references (`{ get() }` cells, not raw
// values) — the FACTORY'S State builder already unwraps them defensively
// (SCHEME.md §2.10), so the State still sees the same plain config shape (the
// smoke's defaults hold).
//
// This is the ONLY module in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance —
// the loader consumes it through the Standard Schema `~standard` interface).
import { Schema as Compose } from "@playform/plugin-dsh-factory";
import Schema from "@deepseek-ai/schemastery";
import Default from "./Default.js";

export default Compose(
	{
		// Ledger file (one global log; defaults to the active profile's DSH_HOME).
		logFile: "~/.dsh/hook-dsh-governor-package.log",
		// Actor tool names whose fs/observed events trigger governing.
		mutationTools: ["write", "edit", "str_replace_editor", "raw-write"],
		// Excluded path segments (anywhere mode, exclusion-first) — Variable/Default.
		exclude: Default,
	},
	{
		// Strict chain pass: strip unknown deps in a governed workspace.
		strict: Schema.boolean().default(false),
		// Circuit breaker: consecutive update-stage failures per directory before pause.
		maxUpdateFailures: Schema.number().default(3),
		// Update stage mode: "programmatic" (ncu library in-process) or "bin".
		updateMode: Schema.string().default("programmatic"),
		// ncu binary for bin mode (absolute path — the host PATH is not the user's shell PATH).
		ncuBin: Schema.string().default("/Volumes/CORSAIR/Tool/macOS/pnpm/global/bin/ncu"),
	},
);
