// Config - the host package's Schemastery schema (a Variable: one constant
// built once at load; the loader validates it and fills every default, so
// invalid configuration fails LOUD at load). Every knob is volatile - hot
// edits commit without remounting.
import Schema from "@deepseek-ai/schemastery";

export default Schema.object({
	enabled: Schema.boolean().default(false).volatile(),
	logRoot: Schema.string().default("~/.dsh").volatile(),
	maxLines: Schema.number().default(200).min(1).max(2000).volatile(),
	ccrLog: Schema.string().default("~/.dsh/playform/ets-hook-dsh-ccr.log").volatile(),
});
