// Config - the hook's Schemastery schema (one constant built once at load).
// Composed with the factory's standalone Schema helper (`shared: false` -
// the minimal block, only the universal log/logFile volatile cells; the
// hook hooks no fs/observed machinery). Every knob is a volatile cell so a
// hot edit lands on the next decision without a remount.
//
// `enabled` defaults to FALSE - the idle-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE. `autoApprove` defaults to "off" - the second explicit
// flip after the plugin's own enable (the conservative policy, PASS-ON-AND-
// INGESTER.md section 5: the write path is never auto-approved by default).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	enabled: Schema.boolean().default(false).volatile(),
	logFile: Schema.string().default("~/.dsh/batch-decision.log").volatile(),
	autoApprove: Schema.union(["off", "on"]).default("off").volatile(),
	allowlist: Schema.array(Schema.string()).default([]).volatile(),
	maxAutoTargets: Schema.number().default(5).volatile(),
	minConfidence: Schema.number().default(0.8).volatile(),
	pendingTtlMs: Schema.number().default(3600000).volatile(),
});
