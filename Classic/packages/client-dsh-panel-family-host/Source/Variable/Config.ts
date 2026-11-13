import Schema from "@deepseek-ai/schemastery";

/**
 * @module Config
 *
 * The host package's Schemastery schema: one Variable, a single constant built once at load.
 *
 * @remarks
 *
 * The loader validates the schema and fills every default, so invalid configuration fails LOUD
 * at load. Every knob is volatile - hot edits commit without remounting - and every reader
 * unwraps a cell through `Function/Cell`, so a volatile field is safe here.
 */
/**
 * The named defaults: one spelling per value, so a caller that needs the fallback (the tail's
 * own line budget, a test fixture) imports the constant instead of restating the literal.
 * The Config base leads the field list - `enabled` first, the base every cost-and-panel
 * package carries; the package writes no ledger file of its own (its lines go through the
 * logger), so the base's `log`/`logFile` cells are absent by design and `logRoot` is the
 * READ root of the family ledgers, not this package's own ledger path.
 */
const DefaultEnabled = true;
const DefaultLogRoot = "~/.dsh";
const DefaultMaxLines = 200;
const DefaultMinLines = 1;
const DefaultMaxLinesCap = 2000;
const DefaultCcrLog = "~/.dsh/playform/hook-dsh-ccr.log";

export default Schema.object({
	/**
	 * The enabled switch of the endpoint (ships enabled; a disabled endpoint
	 * refuses every method).
	 */
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	/**
	 * The log root; every family ledger lives here as `<namespace>.log`.
	 */
	logRoot: Schema.string().default(DefaultLogRoot).volatile(),
	/**
	 * The cap on any single `tail()` request, in lines.
	 */
	maxLines: Schema.number()
		.default(DefaultMaxLines)
		.min(DefaultMinLines)
		.max(DefaultMaxLinesCap)
		.volatile(),
	/**
	 * The ccr log path for `stats()`.
	 */
	ccrLog: Schema.string().default(DefaultCcrLog).volatile(),
});
