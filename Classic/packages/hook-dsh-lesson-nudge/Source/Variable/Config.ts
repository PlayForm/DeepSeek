// Config - the lesson-nudge hook's Schemastery schema. Composed with the
// factory's standalone Schema helper (`shared: false`), every knob volatile, and
// `enabled` defaulting to FALSE - the idle-forever posture the family ships.
//
// The three knobs are the hook's whole surface. It deliberately has NO interval
// and NO prompt: those belong to the review service, and duplicating them here
// would let a profile configure a cadence the counter does not honour.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	enabled: Schema.boolean().default(false).volatile(),
	logFile: Schema.string().default("~/.dsh/playform/hook-dsh-lesson-nudge.log").volatile(),
	maxReviewsPerSession: Schema.number().default(3).volatile(),
	// THE POLICY BLOCK (D6): the shared factory block. The nudge reads the
	// agent's status and spawns a maintenance task; `spawn` stays the shipped
	// `approve` because a maintenance task is not a subagent, and this hook
	// never creates one.
	policy: Policy(),
});
