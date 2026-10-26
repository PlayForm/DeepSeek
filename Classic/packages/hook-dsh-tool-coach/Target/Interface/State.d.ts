import type { AgentState, CoachNotes, CoachRow } from "./Execution.js";
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
