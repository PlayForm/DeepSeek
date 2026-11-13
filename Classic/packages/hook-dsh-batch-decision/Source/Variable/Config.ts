import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The hook's Schemastery schema (one constant built once at load).
 *
 * @remarks
 *
 * Composed with the factory's standalone Schema helper (`shared: false` - the minimal block,
 * only the universal log/logFile volatile cells; the hook hooks no fs/observed machinery). Every
 * knob is a volatile cell so a hot edit lands on the next decision without a remount.
 *
 * `enabled` defaults to TRUE - the LIVE DISABLED posture: every listener, the tool and every
 * effect registers unconditionally on every mount (a disabled mount writes only the byte-exact
 * `disabled (enabled=false)` ledger line instead of the activation proof), and every registered
 * surface reads the volatile `On` cell at CALL time, so a flip lands on the next decision with no
 * remount. `autoApprove`
 * defaults to "off" - the second explicit flip (the conservative
 * policy, PASS-ON-AND-INGESTER.md section 5: the write path is never auto-approved by default).
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/hook-dsh-batch-decision.log";
const DefaultAutoApprove = "off";
const DefaultAllowlist: string[] = [];
const DefaultMaxAutoTargets = 5;
const DefaultMinConfidence = 0.8;
const DefaultPendingTTLMs = 3600000;

export default Compose(false, {
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile).
	log: Schema.boolean().default(DefaultLog).volatile(),
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	autoApprove: Schema.union(["off", "on"]).default(DefaultAutoApprove).volatile(),
	allowlist: Schema.array(Schema.string()).default(DefaultAllowlist).volatile(),
	maxAutoTargets: Schema.number().default(DefaultMaxAutoTargets).volatile(),
	minConfidence: Schema.number().default(DefaultMinConfidence).volatile(),
	pendingTtlMs: Schema.number().default(DefaultPendingTTLMs).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the OUTER gate in front
	// of `autoApprove` - `commit` defaults to `approve`, so a policy
	// auto-approval waits for the user until the pack/config opens it (the
	// documented `decision held` line). Composed from the factory's shared
	// block: read/index/record/suggest/message = auto, write/commit/spawn =
	// approve. Volatile as one object; a resolved pack's `policy` section
	// overrides the defaults per action (the wiring is the next refinement).
	policy: Policy(),
});
