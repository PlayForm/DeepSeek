// Config - the hook's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is
// Documentation/Plans/Workspace-Family/MONITOR.md.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
// MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The hook's own `logFile` default (its
// SEPARATE ledger, one log per module) is supplied through its own fields,
// which override the minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, domain, debounceMs, sweepIntervalMs, maxWatch,
// include, exclude, checksets) takes effect on the next event.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";
import DefaultCheckSets from "@Variable/DefaultCheckSets.js";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/monitor.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The KV domain name reserved for the hook (its own domain name, no
	// collision, the hook owns its record schema).
	domain: Schema.string().default("workspace_monitor").volatile(),
	// The watch-to-sweep debounce window (clock-based; the deadline scan
	// runs at the event-driven checkpoints, never a real timer).
	debounceMs: Schema.number().default(250).volatile(),
	// The sweep cadence: how long an entry waits after a sweep before it
	// becomes sweepable again. 0 sweeps at every checkpoint.
	sweepIntervalMs: Schema.number().default(60000).volatile(),
	// The watch bound: the newest maxWatch entries survive (the oldest is
	// dropped and the drop ledgered).
	maxWatch: Schema.number().default(500).volatile(),
	// The optional allowlist. Default EMPTY - every path watches; a
	// non-empty list restricts watching to matching paths
	// (reason `not included`).
	include: Schema.array(Schema.string()).default([]).volatile(),
	// The excluded path patterns (the hook's own match via the factory's
	// segment match).
	exclude: Schema.array(Schema.string())
		.default(["node_modules/**", "**/Target/**", "**/.git/**"])
		.volatile(),
	// The check-set classification table: the shipped catalog is the
	// default, so classification works out of the box; an override replaces
	// the whole table (the dict is a volatile cell - the table is the
	// refresh unit).
	checksets: Schema.dict(Schema.any()).default(DefaultCheckSets).volatile(),
});
