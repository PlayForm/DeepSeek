import type { AgentState, Variables } from "@Interface/Execution.js";
import type State from "@Interface/State.js";
/** The module's default scope key (a dispatch without a scope shares it). */
export declare const DefaultKey: object;
export default _default;
/** A fresh per-scope state (Apply's Agent() seeds WeakMap entries from it). */
declare function _default(): AgentState;
/** The stable per-scope label (the {{sessionId}} source: the harness exposes
 * no session id to an assemble listener - the opaque scope key must never be
 * parsed (the family's capability rule) - so the plugin assigns its own
 * stable label from State.Labels, first come first served per WeakMap key). */
export declare const ScopeLabel: (Agent: State, Key: unknown) => string;
/** Count the user messages of one pre-step payload and advance the turn
 * (the per-turn counter reset: the tool-coach precedent, Apply.ts:456-490). */
export declare const RecordTurn: (Agent: AgentState, Messages: number) => void;
/** Record one finished tool call (the L4 observer). */
export declare const RecordTool: (Agent: AgentState, Name: string, At: number) => void;
/** Elapsed seconds since the last tool call, as the gauge formats them. */
export declare const SinceLastTool: (Agent: AgentState, At: number) => string;
/** The IANA zone of the host ({{tz}}); failure degrades to UTC. */
export declare const Zone: () => string;
/** The variable table one render pass resolves (the union of all built-in
 * tokens; Render.ts narrows per kind). {{time}} is the local wall clock
 * (HH:MM:SS), {{date}} the local ISO date (YYYY-MM-DD), both computed from
 * the clock value with the host's zone - deterministic under the fake
 * clock. */
export declare const Table: (Scope: AgentState, At: number, Label: string) => Variables;
