import type State from "../Interface/State.js";
import type { BoardState, Suggestion } from "../Interface/Events.js";
import type { Log } from "./Render.js";
/** The suggestion id grammar (I6 3.3): `sug-<4 hex>`, per-agent-keyed. */
export declare const NewId: () => string;
/** The gate (I6 6.1, conjunctive): first user message of a turn AND length
 * >= suggestGateMinChars AND no skip word AND the rate cap allows it AND at
 * most one suggestion per user turn. */
export declare const Gate: (Agent: State, AgentId: string, Text: string, FirstOfTurn: boolean) => boolean;
/** The request excerpt (I6 section 2): "redact" sends the first 200 chars
 * plus the total length; "verbatim" forwards the whole excerpt capped at
 * maxPromptBytes. */
export declare const Excerpt: (Agent: State, Text: string) => string;
/** The composed prompt (I6 section 2): the excerpt + the compressed catalog +
 * the task facts the plugin already holds. */
export declare const Compose: (Agent: State, AgentId: string, Text: string) => string;
/** Parse the mini-model's answer (I6 section 2): strict JSON; a parse
 * failure, a missing field, or an unknown templateId -> no suggestion. */
export interface ParsedSuggestion {
    fit: "yes" | "no" | "unknown";
    templateId: string;
    rationale: string;
    tokens?: {
        expectAgents?: number;
        steps?: string[];
    } | undefined;
}
export declare const Parse: (Output: unknown) => ParsedSuggestion | undefined;
/** Clamp the tokens to legal bounds (I6 3.2): the plugin never trusts the
 * mini-model; out-of-range or malformed tokens clamp to the nearest legal
 * value and each clamp is ledgered. Returns the clamped tokens. */
export declare const Clamp: (Id: string, TemplateId: string, Tokens: {
    expectAgents?: number;
    steps?: string[];
} | undefined, Append: Log) => {
    expectAgents?: number;
    steps?: string[];
};
/** Store a suggestion (the parse success path); the id is assigned by the
 * caller before the clamping. */
export declare const Store: (Agent: State, AgentId: string, Id: string, Parsed: ParsedSuggestion, Clamped: {
    expectAgents?: number;
    steps?: string[];
}, Append: Log) => Suggestion;
/** The board module's Open, bound at registration (avoids a top-level import
 * cycle: Board imports nothing from Suggester). */
type BoardOpenFn = (Agent: State, AgentId: string, Id: string, PlantType: "agent-board" | "todo-fill" | "aggregate" | "custom", Expect: number, MemberIds: string[] | undefined, Template: string | undefined, Append: Log) => BoardState;
/** Bind the board module's Open (called once from Apply). */
export declare const BindBoard: (Open_: BoardOpenFn) => void;
/** The spawn (I6 1.1): one detached one-shot subagent per qualifying turn on
 * the exploration strain's route. Failures produce ONLY a ledger line. */
export declare const Spawn: (Agent: State, AgentId: string, Text: string, Parent: {
    id: string;
}, Append: Log) => void;
/** The pre-step hook (the I6 6.1 trigger): evaluate the gate on a new user
 * message and spawn when it passes. Called from the L8 listener. */
export declare const OnUserMessage: (Agent: State, AgentId: string, Text: string, Parent: {
    id: string;
} | undefined, Append: Log) => void;
/** The configured-block suggestion frame (I6 section 4, byte-exact). */
export declare const Frame: (Agent: State, Suggestion_: Suggestion, Separator: string) => string;
/** The plain note (D2 4.5 verbatim, the "section" tier). */
export declare const PlainFrame: (Suggestion_: Suggestion, Separator: string) => string;
/** The standing-section contribution for the suggestions of one agent (the
 * one-assembly window: render once, then withdraw with the expiry line). */
export declare const SectionBody: (Agent: State, AgentId: string, Separator: string, Append: Log) => string;
/** Accept one suggestion (I6 5.1): instantiate the stored, clamped
 * configuration verbatim. Returns the ledger line. */
export declare const Accept: (Agent: State, AgentId: string, Id: string, Append: Log) => string;
/** Dismiss one suggestion (I6 5.2/5.3/5.5): the frame or dormant block
 * withdraws with the distinct ledger line. */
export declare const Dismiss: (Agent: State, AgentId: string, Id: string, Reason: string | undefined, Append: Log) => string;
export {};
