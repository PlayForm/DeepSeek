// Config - the host package's Schemastery schema (a Variable: one constant
// built once at load; the loader validates it and fills every default, so
// invalid configuration fails LOUD at load). Every knob is volatile - hot
// edits commit without remounting - and every reader unwraps a cell through
// Function/Cell, so a volatile field is safe here.
import Schema from "@deepseek-ai/schemastery";

// The named defaults: one spelling per value, so a caller that needs the
// fallback (the tail's own line budget, a test fixture) imports the constant
// instead of restating the literal.
const DefaultEnabled = false;
const DefaultLogRoot = "~/.dsh";
const DefaultMaxLines = 200;
const DefaultMinLines = 1;
const DefaultMaxLinesCap = 2000;
const DefaultCcrLog = "~/.dsh/playform/hook-dsh-ccr.log";

export default Schema.object({
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	logRoot: Schema.string().default(DefaultLogRoot).volatile(),
	maxLines: Schema.number()
		.default(DefaultMaxLines)
		.min(DefaultMinLines)
		.max(DefaultMaxLinesCap)
		.volatile(),
	ccrLog: Schema.string().default(DefaultCcrLog).volatile(),
});
