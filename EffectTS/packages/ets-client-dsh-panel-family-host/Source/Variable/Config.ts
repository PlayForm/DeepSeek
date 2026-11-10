import Schema from "@deepseek-ai/schemastery";

/**
 * @module Config
 *
 * The host package's Schemastery schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * The loader validates it and fills every default, so invalid configuration
 * fails loud at load. Every knob is volatile - hot edits commit without
 * remounting.
 */
export default Schema.object({
	enabled: Schema.boolean().default(false).volatile(),
	logRoot: Schema.string().default("~/.dsh").volatile(),
	maxLines: Schema.number().default(200).min(1).max(2000).volatile(),
	ccrLog: Schema.string().default("~/.dsh/playform/ets-hook-dsh-ccr.log").volatile(),
});
