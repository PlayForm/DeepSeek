// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended
// with the coach's own fields.
//
// The shared half comes from the factory's NAMED type export (`State`). The
// shared machinery that stays inert here: Tool/Policy/PolicyName/List (no
// fs/observed machinery - the coach is a NON-MANIFEST module), Stash/
// Inflight/Subprocess/Seams/Queue/Journal (no governance traffic; the only
// journal-domain line is the activation record, best-effort). The shared
// `Enabled` field stays bound to the config's `log` cell (the DURABLE ledger
// toggle); the coach's MASTER SWITCH is the `On` field below (config
// `enabled`).
//
// Every config-derived field below is refreshed IN PLACE by the factory's
// P10 loader/volatile-update listener (every cell in the schema is volatile),
// so a flip takes effect on the next judged call without a remount.
//
// Test probes read the state through the `ctx.__hookDshToolCoachState`
// attachment (never a return value from `apply` - the loader treats apply
// returns specially, a live-verified lesson recorded in the plugin-
// development skill).
import type { AgentState, CoachNotes, CoachRow } from "@Interface/Execution.js";
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";

export default interface State extends Shared {
	/** Master switch (config `enabled`, volatile) - false = full passthrough. */
	On: boolean;
	/** The judged terminal tools (config `judgeTools`, volatile). */
	Judge: string[];
	/** The tools denied on every call regardless of the ladder (config `denyTools`, volatile). */
	Deny: string[];
	/** Strikes within the window that trigger a tier-1 note (volatile). */
	Threshold: number;
	/** Sliding window of judged calls (volatile). */
	Window: number;
	/** Minimum judged calls between tier-1 notes (volatile). */
	Cooldown: number;
	/** Offenses since the last note that arm the tier-2 section (volatile). */
	Escalate: number;
	/** Clean judged calls that clear the tier-2 section (volatile). */
	Clean: number;
	/** Tier-3 mode (config `enforce`, volatile). */
	Enforce: "off" | "write" | "all";
	/** Per-class strikes since the last note that arm the tier-3 deny (volatile). */
	EnforceThreshold: number;
	/** User exemption regexes (config `exemptPatterns`, volatile). */
	Exempt: string[];
	/** User pattern rows (config `patternTable`, volatile). */
	Patterns: CoachRow[];
	/** The three note templates (config `notes`, volatile). */
	Notes: CoachNotes;
	/** Live-fetch toggle (config `fetchLive`, volatile). */
	FetchLive: boolean;
	/** Maximum tier-2 tool-table rows (config `maxSectionTools`, volatile). */
	MaximumSectionTools: number;
	/** Judged calls between tier-2 rebuilds (config `sectionTtl`, volatile). */
	SectionTtl: number;
	/** The injected factory service itself (the ledger) - set once in Apply. */
	Factory: Factory;
	/** The per-agent coaching states (WeakMap keyed on the Agent object). */
	Agents: WeakMap<object, AgentState>;
	/** Every live agent state (so tools/change can invalidate all caches). */
	Registry: Set<AgentState>;
}
