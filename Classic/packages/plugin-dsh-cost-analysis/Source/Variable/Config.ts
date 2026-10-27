// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load
// instead of silently falling back per-field, and `apply` receives a
// validated plain config object. The shape this schema produces is
// Interface/Config.ts.
//
// The schema is small by charter (section 13): the plugin reads the ledger
// the cost plugin wrote, so it configures only WHERE to read, WHICH metric
// families render, and WHERE its own diagnostic log goes - no price book, no
// capture gates, no annotate toggle, because those belong to the writer.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";

export default Schema.object({
	enabled: Schema.boolean()
		.default(true)
		.description("Master switch: when false the analysis command answers nothing."),
	databasePath: Schema.string()
		.default("~/.dsh/cost/ledger.db")
		.description(
			"SQLite ledger file to read, opened read-only; a leading tilde expands to the home directory.",
		),
	client: Schema.string()
		.default("")
		.description("Client name the readings are filtered to; empty means every client."),
	window: Schema.number()
		.default(30)
		.description("Day window the readings cover, counted back from today."),
	metrics: Schema.object({
		credit: Schema.boolean()
			.default(true)
			.description("Include the read-credit metric (Ring C, section 11)."),
		effectiveness: Schema.boolean()
			.default(true)
			.description("Include the read-before-edit effectiveness metric."),
		lines: Schema.boolean()
			.default(true)
			.description("Include the per-hunk lines metric from the Edit table."),
		overhead: Schema.boolean()
			.default(true)
			.description("Include the unattributed allocation overhead metric."),
		cache: Schema.boolean()
			.default(true)
			.description("Include the per-file cache-efficiency metric."),
	}).description("Which metric families the analysis command renders."),
	log: Schema.boolean().default(true).description("Write the plugin's own diagnostic log file."),
	logFile: Schema.string()
		.default("~/.dsh/cost/analysis.log")
		.description("Path of the diagnostic log; a leading tilde expands to the home directory."),
});
