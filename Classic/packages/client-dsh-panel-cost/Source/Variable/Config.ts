// Config - the plugin's one Variable: the Schemastery schema the loader
// validates at boot, where a mismatch fails loud rather than silently
// disabling the tab. Every knob is volatile, following the family
// convention: the values live in the profile row (cordis.patch.yml) and the
// client half receives only what it needs (the tab order and the row
// budget), never the whole schema object.
import Schema from "@deepseek-ai/schemastery";

export default Schema.object({
	enabled: Schema.boolean().default(true).volatile(),
	tabOrder: Schema.number().default(30).volatile(),
	rows: Schema.number().default(200).volatile(),
	locale: Schema.union(["en", "zh"] as const)
		.default("en")
		.volatile(),
});
