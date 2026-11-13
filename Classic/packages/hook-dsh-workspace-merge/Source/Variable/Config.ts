import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The hook's Schemastery Config schema (a Variable: one constant
 * built once at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin
 * loads and fills every default, so invalid configuration fails LOUD at load.
 * The shape this schema produces is Interface/Config.ts; the contract is
 * MERGE.md.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
 * a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
 * uses `shared: false` - the MINIMAL shared block, ONLY the two universal
 * volatile cells (`log`, `logFile`).
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin.
 *
 * `enabled` defaults to TRUE - the plugin ships enabled; the profile may
 * turn it off with `enabled: false`.
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/hook-dsh-workspace-merge.log";
const DefaultDomain = "workspace_merge";
const DefaultMode = "all-or-nothing";
const DefaultMaxFiles = 50;
const DefaultMaxTotalBytes = 1000000;

export default Compose(false, {
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile).
	log: Schema.boolean().default(DefaultLog).volatile(),
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The KV domain name (the hook's own domain, NOT the shared
	// package_governance one - the hook owns its record schema).
	domain: Schema.string().default(DefaultDomain).volatile(),
	// The atomicity mode: all-or-nothing (default) or survivors.
	mode: Schema.union(["all-or-nothing", "survivors"]).default(DefaultMode).volatile(),
	// The batch gates.
	maxFiles: Schema.number().default(DefaultMaxFiles).volatile(),
	maxTotalBytes: Schema.number().default(DefaultMaxTotalBytes).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. The merge's ONE gated
	// action is the commit - `commit` defaults to `approve`, so a batch waits
	// for the user and writes nothing (the documented `merge held (<n> files)
	// (policy commit=approve)` line). Read/index/record/suggest/message are
	// automatic; write/commit/spawn wait for approval. Volatile as one
	// object; a resolved pack's `policy` section overrides the defaults per
	// action (the wiring is the next refinement; the type already exists).
	policy: Policy(),
});
