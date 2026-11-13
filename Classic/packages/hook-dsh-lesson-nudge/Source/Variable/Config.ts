import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The lesson-nudge hook's Schemastery schema.
 *
 * @remarks
 *
 * Composed with the factory's standalone Schema helper (`shared: false`), every knob volatile,
 * and `enabled` defaulting to TRUE - the shipped posture is ON, and a profile turns it off with
 * `enabled: false` (the LIVE disabled posture: a disabled mount still registers everything and
 * writes only the `disabled (enabled=false)` ledger line).
 *
 * The four knobs are the hook's whole surface. It deliberately has NO interval and NO prompt:
 * those belong to the review service, and duplicating them here would let a profile configure a
 * cadence the counter does not honour.
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/hook-dsh-lesson-nudge.log";
const DefaultMaxReviewsPerSession = 3;

export default Compose(false, {
	// The MASTER SWITCH (volatile: a flip is read at the next status
	// transition with no remount): false = the hook appends
	// `disabled (enabled=false)` to the ledger while the listener stays
	// registered and passes every transition through silently.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile).
	log: Schema.boolean().default(DefaultLog).volatile(),
	// Ledger file - the hook-dsh-lesson-nudge ledger (one log per module) -
	// volatile: hot-editable without remounting.
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	maxReviewsPerSession: Schema.number().default(DefaultMaxReviewsPerSession).volatile(),
	// THE POLICY BLOCK (D6): the shared factory block. The nudge reads the
	// agent's status and spawns a maintenance task; `spawn` stays the shipped
	// `approve` because a maintenance task is not a subagent, and this hook
	// never creates one.
	policy: Policy(),
});
