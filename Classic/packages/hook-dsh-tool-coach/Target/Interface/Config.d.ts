import type { CoachNotes, CoachRow } from "./Execution.js";
export default interface Config {
    /** Ledger enabled - write the durable log file (the shared `log` cell). */
    log: boolean;
    /** Ledger file - the coach's own ledger, separate from the family's logs (volatile). */
    logFile: string;
    /** Master switch - every listener no-ops to a passthrough when false (volatile). */
    enabled: boolean;
    /** The terminal tools that are judged; dedicated tools are never judged (volatile). */
    judgeTools: string[];
    /** The tools denied on EVERY call, before and independent of the strikes ladder (volatile). */
    denyTools: string[];
    /** Strikes within the window that trigger a tier-1 note (volatile). */
    threshold: number;
    /** Sliding window of judged calls (volatile). */
    window: number;
    /** Minimum judged calls between tier-1 notes (volatile). */
    cooldown: number;
    /** Offenses since the last note that turn the tier-2 section on (volatile). */
    escalateThreshold: number;
    /** Clean judged calls that turn the tier-2 section off again (volatile). */
    cleanWindow: number;
    /** Tier-3 mode: off, write-class only, or all deniable classes (volatile). */
    enforce: "off" | "write" | "all";
    /** Per-class offenses since the last note that arm the tier-3 deny (volatile). */
    enforceThreshold: number;
    /** Legitimate-bash exemption regexes, appended to the built-in defaults (volatile). */
    exemptPatterns: string[];
    /** User pattern rows, appended after the built-in defaults (volatile). */
    patternTable: CoachRow[];
    /** The three note templates (volatile). */
    notes: CoachNotes;
    /** Fetch tool descriptions live from the registry; false = static table only (volatile). */
    fetchLive: boolean;
    /** Maximum rows in the tier-2 tool table (volatile). */
    maxSectionTools: number;
    /** Judged calls between tier-2 section rebuilds (volatile). */
    sectionTtl: number;
}
