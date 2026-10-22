// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Every tunable is a field; the shape this schema
// produces is Interface/Config.ts.
//
// The class plugin (`export default class Feedback extends Service`) carries
// this schema as a static `Config` (the registry applies a plugin's standard
// schema to the config before the class is constructed - registry.d.ts
// Plugin.Base). No volatile cells here: the class form has no factory State
// to hot-refresh, so a config edit reloads the plugin (the PO C decision is
// recorded in SCHEME.md).
//
// `enabled` defaults to true once the plugin is ACTIVATED: the feedback
// member is a passive collector - it writes only its own ledger and never
// touches the waterfall - so its idle risk is the ledger size, capped by
// maxSessions. The bundle patch still ships `enabled: true` explicit so the
// activation is visible in the patch.
import Schema from "@deepseek-ai/schemastery";

export default Schema.object({
	enabled: Schema.boolean().default(true),
	logFile: Schema.string().default("~/.dsh/feedback/feedback.log"),
	maxBlockBytes: Schema.number().default(4096),
	maxChain: Schema.number().default(8),
	maxSessions: Schema.number().default(128),
	summaryTerms: Schema.number().default(10),
});
