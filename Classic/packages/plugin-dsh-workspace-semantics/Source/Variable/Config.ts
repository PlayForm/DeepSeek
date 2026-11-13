import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The service's Schemastery Config schema: one constant built once at load.
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load, and `apply` receives a
 * validated plain config object. The shape this schema produces is
 * Interface/Config.ts; the contract is SEMANTICS.md (the distribution law: its
 * own Config + ledger strings).
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
 * uses `shared: false` - the MINIMAL shared block, ONLY the two universal
 * volatile cells (`log`, `logFile`). The service's own `logFile` default (its
 * SEPARATE ledger, one log per module) is supplied through its own fields,
 * which override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits commit
 * WITHOUT remounting the plugin via the loader's loader/volatile-update event;
 * the factory's State builder refreshes the mapped State fields IN PLACE, so a
 * flip (enabled, domain, maxEntries, exclude, root, lsp, adapters) takes effect
 * on the next resolve or event.
 *
 * `enabled` defaults to FALSE - the IDLE-forever posture: the service ships
 * disabled, never appears in the profile's bundles, and enables only by an
 * explicit ACTIVATE.
 *
 * `adapters` defaults to EMPTY - the default registration stays the seven
 * TypeScript/JavaScript extensions (the byte-exact
 * `adapters registered (7 extensions)` line). The any-file adapters are OPT-IN
 * by name; the names are validated against the catalog (Variable/Adapters) at
 * load.
 *
 * `lsp` defaults to TRUE: the harness LSP seam is probed at use time, and an
 * absent seam (or no provider for the extension) falls back to the lexical
 * adapter - the switch exists so a deployment can keep the model purely
 * lexical.
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-workspace-semantics.log";
// The KV domain name (the service's own domain, not a shared one).
const DefaultDomain = "workspace_semantics";
// The index bound: the last maxEntries built models survive in memory (and in the
// domain's models table).
const DefaultMaxEntries = 256;
// The excluded path patterns (the factory's segment match; the default is the same glob
// triple the observe hook ships).
const DefaultExclude: string[] = ["node_modules/**", "**/Target/**", "**/.git/**"];
// The workspace root the deepener's LSP queries resolve against; the empty string means
// the process working directory (the harness's session workspace).
const DefaultRoot = "";
// The harness LSP deepener (the primary TypeScript reference answer); an absent seam or
// an unhandled extension falls back to the lexical adapter.
const DefaultLsp = true;
// The opt-in any-file adapters, by catalog name (Variable/Adapters): `json` (.json keys),
// `yaml` (.yml/.yaml keys), `markdown` (.md/.markdown link targets), `package`
// (package.json dependency names). Empty = the TypeScript/JavaScript adapter only.
const DefaultAdapters: string[] = [];

export default Compose(false, {
	// The MASTER SWITCH (volatile: a flip is read on the very next call): false =
	// the cold mount logs `disabled (enabled=false)` and every surface - the
	// service, the fs/observed listener and the storage effect - still wires,
	// answering at call time (the listener does nothing while disabled).
	// Distinct from the shared `log` cell, which governs only the durable
	// ledger file.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile).
	log: Schema.boolean().default(DefaultLog).volatile(),
	// Ledger file - the service's SEPARATE ledger, one log per module -
	// volatile: hot-editable without remounting (overrides the minimal
	// shared block's empty default).
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	domain: Schema.string().default(DefaultDomain).volatile(),
	maxEntries: Schema.number().default(DefaultMaxEntries).volatile(),
	exclude: Schema.array(Schema.string()).default(DefaultExclude).volatile(),
	root: Schema.string().default(DefaultRoot).volatile(),
	lsp: Schema.boolean().default(DefaultLsp).volatile(),
	adapters: Schema.array(Schema.string()).default(DefaultAdapters).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist. This package's action class is
	// read-only - resolve, symbol, references and the rename PLAN are AUTOMATIC, and the
	// plan goes to the operate proposals (the service never writes a file), so this
	// package has NO gated action: it never writes a file, commits a batch or spawns an
	// agent, and no verdict can refuse it. read/index/record/suggest/message are
	// automatic; write/commit/spawn wait for approval for the family's write paths
	// (declared here for uniformity - this package never takes them). Volatile as one
	// object; a resolved pack's `policy` section overrides the defaults per action (the
	// wiring is the next refinement; the type already exists).
	policy: Policy(),
});
