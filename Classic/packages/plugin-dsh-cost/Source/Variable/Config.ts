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
// row's own `effectiveFrom`/`currency` defaults fill in at validation. The
// factor layer's arrays (section 17): `modifiers` ships the four mode
// multipliers and `priceWindows` the time-of-day windows (empty by default).
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

// One modifier row's schema (section 17.2): an effective-dated multiplier
// for one pricing mode, optionally scoped to one model. The multiplier
// scales the priced total; a model-specific row beats a provider-wide one
// of the same kind.
const Modifier = () =>
	Schema.object({
		provider: Schema.string()
			.required()
			.description("Provider id the modifier discounts or uplifts."),
		model: Schema.string().description(
			"Model id the modifier is scoped to; absent means every model of the provider.",
		),
		kind: Schema.string()
			.required()
			.description("Pricing mode the modifier applies to, for example batch or flex."),
		value: Schema.string()
			.required()
			.description("Short label naming the modifier row, kept in the ledger for the audit."),
		multiplier: Schema.number()
			.required()
			.description("Factor the priced total is multiplied by whenever the modifier applies."),
		effectiveFrom: Schema.string()
			.required()
			.description("First date the modifier is in force."),
		effectiveTo: Schema.string().description(
			"Last date the modifier is in force; absent means it never ends.",
		),
	});

// One time-of-day window's schema: the label a price row's Window column
// resolves against and the UTC hours it covers.
const PriceWindow = () =>
	Schema.object({
		label: Schema.string()
			.required()
			.description("Window name a price row's Window column is matched against, for example peak."),
		startUtcHour: Schema.number()
			.required()
			.description("First whole UTC hour the window covers."),
		endUtcHour: Schema.number()
			.required()
			.description("UTC hour the window ends at; a value past 24 wraps into the next day."),
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
	modifiers: Schema.array(Modifier())
		.default([
			{
				provider: "cloudflare-workers-ai",
				kind: "batch",
				value: "shipped-batch",
				multiplier: 0.5,
				effectiveFrom: "2026-01-01",
			},
			{
				provider: "cloudflare-workers-ai",
				kind: "flex",
				value: "shipped-flex",
				multiplier: 0.5,
				effectiveFrom: "2026-01-01",
			},
			{
				provider: "cloudflare-workers-ai",
				kind: "priority",
				value: "shipped-priority",
				multiplier: 2,
				effectiveFrom: "2026-01-01",
			},
			{
				provider: "cloudflare-workers-ai",
				kind: "ultrafast",
				value: "shipped-ultrafast",
				multiplier: 6,
				effectiveFrom: "2026-01-01",
			},
		])
		.description(
			"The effective-dated modifier rows (section 17.2); a row multiplies the priced total of a call in its pricing mode.",
		),
	priceWindows: Schema.array(PriceWindow())
		.default([])
		.description(
			"The time-of-day windows a price row's Window column resolves against; empty means every call is any-window.",
		),
	log: Schema.boolean().default(true).description("Write the plugin's own diagnostic log file."),
	logFile: Schema.string()
		.default("~/.dsh/cost/cost.log")
		.description("Path of the diagnostic log; a leading tilde expands to the home directory."),
});
