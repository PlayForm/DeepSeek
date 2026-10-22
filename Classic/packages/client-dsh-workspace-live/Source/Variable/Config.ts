// Config - the live client's Schemastery schema (a Variable: one constant
// built once at load; the loader validates it and fills every default, so
// invalid configuration fails LOUD at load). Every knob is volatile.
import Schema from "@deepseek-ai/schemastery";

export default Schema.object({
	enabled: Schema.boolean().default(false).volatile(),
	tabOrder: Schema.number().default(25).volatile(),
	maxEvents: Schema.number().default(50).min(1).max(500).volatile(),
	maxRepresentations: Schema.number().default(100).min(1).max(1000).volatile(),
});
