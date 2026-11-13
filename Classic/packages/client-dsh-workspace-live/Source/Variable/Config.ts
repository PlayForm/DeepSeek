import Schema from "@deepseek-ai/schemastery";

/**
 * @module Config
 *
 * The live client's Schemastery schema.
 *
 * @remarks
 *
 * A Variable: one constant built once at load; the loader validates it and
 * fills every default, so invalid configuration fails LOUD at load. Every
 * knob is volatile. The Config base leads the field list - `enabled` first,
 * the base every cost-and-panel package carries; the package is a pure
 * browser module and writes no ledger file, so the base's `log`/`logFile`
 * cells are absent by design.
 */
export default Schema.object({
	enabled: Schema.boolean().default(true).volatile(),
	tabOrder: Schema.number().default(25).volatile(),
	maxEvents: Schema.number().default(50).min(1).max(500).volatile(),
	maxRepresentations: Schema.number().default(100).min(1).max(1000).volatile(),
});
