// Config - the panel package's Schemastery schema (a Variable: one constant
// built once at load; the loader validates it and fills every default, so
// invalid configuration fails LOUD at load). Every knob is volatile - hot
// edits commit without remounting (the package is a pure client module, so
// the client half re-reads the fields on the next render pass).
import Schema from "@deepseek-ai/schemastery";

export default Schema.object({
	enabled: Schema.boolean().default(true).volatile(),
	tabOrder: Schema.number().default(20).volatile(),
	overlayMaxWidth: Schema.number().default(720).volatile(),
	locale: Schema.union(["en", "zh"] as const)
		.default("en")
		.volatile(),
});
