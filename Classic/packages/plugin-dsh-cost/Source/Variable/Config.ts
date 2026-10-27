// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load
// instead of silently falling back per-field, and `apply` receives a
// validated plain config object. The shape this schema produces is
// Interface/Config.ts.
//
// The required price-row columns use `.required()` so a malformed row fails
// at load (schemastery's "missing required value"); the three optional rates
// stay optional - an absent rate is an unpriced bucket (charged at zero), not
// an error. The shipped `prices` default is the three-row price book; each
// row's own `effectiveFrom`/`currency` defaults fill in at validation.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";

// One price row's schema: the rate columns are per million tokens, in the
// row's own currency.
const Rate = () =>
	Schema.object({
		provider: Schema.string()
			.required()
			.description("Provider id of the priced model, for example cloudflare-workers-ai."),
		model: Schema.string()
			.required()
			.description("Model id exactly as the session log reports it."),
		input: Schema.number().required().description("Price per million uncached input tokens."),
		output: Schema.number().required().description("Price per million output tokens."),
		cacheRead: Schema.number().description(
			"Price per million cache-read tokens; absent means that bucket is unpriced.",
		),
		cacheWrite: Schema.number().description(
			"Price per million cache-write tokens; absent means that bucket is unpriced.",
		),
		reasoning: Schema.number().description(
			"Price per million reasoning tokens; absent means that bucket is unpriced.",
		),
		effectiveFrom: Schema.string()
			.default("2026-01-01")
			.description("First date the row is in force; the newest row in force prices a call."),
		currency: Schema.string().default("USD").description("Currency of this row's rates."),
	});

export default Schema.object({
	enabled: Schema.boolean()
		.default(true)
		.description("Master switch: when false the plugin records nothing."),
	databasePath: Schema.string()
		.default("~/.dsh/cost/ledger.db")
		.description("SQLite ledger file; a leading tilde expands to the home directory."),
	currency: Schema.string()
		.default("USD")
		.description("Fallback currency for rows priced without their own."),
	client: Schema.string()
		.default("default")
		.description("Name of the paying party new projects are billed to."),
	capture: Schema.object({
		sessions: Schema.boolean()
			.default(true)
			.description("Record live sessions into the ledger."),
		subagents: Schema.boolean()
			.default(true)
			.description("Record delegated subagent sessions and roll them into their parent."),
		backfill: Schema.boolean()
			.default(false)
			.description(
				"Replay sessions that predate the plugin into the ledger as a background job.",
			),
	}).description("What the ledger records from the session log."),
	attribution: Schema.object({
		direct: Schema.union(["bytes", "equal"])
			.default("bytes")
			.description(
				"Direct split rule: output cost weighted by changed bytes, or shared equally by written files.",
			),
		amortized: Schema.union(["context", "none"])
			.default("context")
			.description(
				"Amortized split rule: input cost weighted by per-file context mass, or dropped.",
			),
	}).description("The two split rules that divide one call's price across files."),
	annotate: Schema.object({
		enabled: Schema.boolean()
			.default(false)
			.description(
				"Allow writing the accumulated cost into files as a marker-delimited comment.",
			),
		marker: Schema.string()
			.default("dsh-cost")
			.description("Marker word that delimits the cost comment block."),
		maxLines: Schema.number()
			.default(8)
			.description("Maximum lines of one cost comment block."),
	}).description("The comment writer (off by default; the one toggle the user asked for)."),
	export: Schema.object({
		format: Schema.union(["csv", "json", "markdown"])
			.default("csv")
			.description("Bundle format for the export command: csv, json or markdown."),
		directory: Schema.string()
			.default("")
			.description("Directory exports are written to; empty means beside the project root."),
	}).description("The export shape for a client invoice."),
	prices: Schema.array(Rate())
		.default([
			{
				provider: "cloudflare-workers-ai",
				model: "@cf/zai-org/glm-5.3-flash",
				input: 0.15,
				output: 0.5,
				cacheRead: 0.03,
			},
			{
				provider: "cloudflare-workers-ai",
				model: "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
				input: 0.3,
				output: 1.2,
				cacheRead: 0.006,
			},
			{
				provider: "cloudflare-workers-ai",
				model: "@cf/deepseek-ai/deepseek-v4-flash-0731",
				input: 0.44,
				output: 1.32,
				cacheRead: 0.044,
			},
		])
		.description("The effective-dated price book, per million tokens; a change appends a row."),
	log: Schema.boolean().default(true).description("Write the plugin's own diagnostic log file."),
	logFile: Schema.string()
		.default("~/.dsh/cost/cost.log")
		.description("Path of the diagnostic log; a leading tilde expands to the home directory."),
});
