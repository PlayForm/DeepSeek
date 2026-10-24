// Config - the service's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is SEMANTICS.md (the
// distribution law: its own Config + ledger strings).
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
// MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The service's own `logFile` default (its
// SEPARATE ledger, one log per module) is supplied through its own fields,
// which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, domain, maxEntries, exclude, root, lsp, adapters)
// takes effect on the next resolve or event.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the service ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// `adapters` defaults to EMPTY - the default registration stays the seven
// TypeScript/JavaScript extensions (the byte-exact `adapters registered (7
// extensions)` line). The any-file adapters are OPT-IN by name; the names are
// validated against the catalog (Variable/Adapters) at load.
//
// `lsp` defaults to TRUE: the harness LSP seam is probed at use time, and an
// absent seam (or no provider for the extension) falls back to the lexical
// adapter - the switch exists so a deployment can keep the model purely
// lexical.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string()
		.default("~/.dsh/playform/ets-plugin-dsh-workspace-semantics.log")
		.volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name (the service's own domain, not a shared one).
	domain: Schema.string().default("workspace_semantics").volatile(),
	// The index bound: the last maxEntries built models survive in memory
	// (and in the domain's models table).
	maxEntries: Schema.number().default(256).volatile(),
	// The excluded path patterns (the factory's segment match; the default is
	// the same glob triple the observe hook ships).
	exclude: Schema.array(Schema.string())
		.default(["node_modules/**", "**/Target/**", "**/.git/**"])
		.volatile(),
	// The workspace root the deepener's LSP queries resolve against; the
	// empty string means the process working directory (the harness's session
	// workspace).
	root: Schema.string().default("").volatile(),
	// The harness LSP deepener (the primary TypeScript reference answer); an
	// absent seam or an unhandled extension falls back to the lexical adapter.
	lsp: Schema.boolean().default(true).volatile(),
	// The opt-in any-file adapters, by catalog name (Variable/Adapters):
	// `json` (.json keys), `yaml` (.yml/.yaml keys), `markdown` (.md/.markdown
	// link targets), `package` (package.json dependency names). Empty = the
	// TypeScript/JavaScript adapter only.
	adapters: Schema.array(Schema.string()).default([]).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. This package's action
	// class is read-only - resolve, symbol, references and the rename PLAN
	// are AUTOMATIC, and the plan goes to the operate proposals (the service
	// never writes a file), so this package has NO gated action: it never
	// writes a file, commits a batch or spawns an agent, and no verdict can
	// refuse it. read/index/record/suggest/message are automatic;
	// write/commit/spawn wait for approval for the family's write paths
	// (declared here for uniformity - this package never takes them).
	// Volatile as one object; a resolved pack's `policy` section overrides
	// the defaults per action (the wiring is the next refinement; the type
	// already exists).
	policy: Policy(),
});
