import type { Log } from "./Render.js";
import type State from "../Interface/State.js";
/** The drift thresholds the failsafe layer owns (the validator template's
 * automatic twin; 04 scenario 4 - thresholds are constants of the layer, the
 * session-stats block's own vars are the user-facing twin). */
export declare const DRIFT_MESSAGES = 200;
export declare const DRIFT_SINCE_LAST_TOOL_MS = 300000;
/** The drift guard (scenario 4): while a live board is open, session shape
 * crossing a threshold gains a WARN line (channel 4). Returns the WARN line
 * or "" - the caller appends it to the wave-2 section body. */
export declare const Drift: (Agent: State, AgentID: string, Scope: {
    messages: number;
    lastToolAt: number | undefined;
}, Append: Log) => string;
/** The one-line summary a collapsed wave-2 frame leaves behind (never
 * silent - the ledger records the collapse). */
export declare const WaveSummary: (Separator: string, Head: string, Length: number) => string;
/** The wave-2 section-collapse pass (scenario 8): when the combined section
 * body exceeds sectionBudgetBytes, the OLDEST wave-2 parts collapse to
 * one-line summaries. The phase-1 frames have their own collapse (Render);
 * this pass covers the wave-2 parts. Returns the collapsed body. */
export declare const Collapse: (Agent: State, Parts: string[], Append: Log) => string;
