import { type AgentState, type BlockSpecification, type Variables } from "../Interface/Execution.js";
import type State from "../Interface/State.js";
/**
 * @module Render
 *
 * The substitution engine and the section builder (research section 3 +
 * IMPLEMENTATION-DESIGN.md section 3.1, phase 1).
 *
 * @remarks
 *
 * `{{token}}` replace ONLY - no eval, no expressions, no `new Function`
 * (research section 5: the programmable stage routes evaluation through the
 * ptc-runtime later; v1 has no evaluation path at all, provable by grep in
 * the smoke suite). An unknown token renders LITERALLY and logs
 * `render unknown <id> <token>` - never a failure (the harness's own
 * unresolved-variable failure must never be inherited; this section is
 * contributed with `interpolate: false`, so only this engine touches its
 * tokens).
 *
 * Every enabled block renders inside the FIXED frame so the model cannot
 * mistake it for harness state:
 *
 *     --- LIVE CONTAINER <id> (recomputed each request; not harness state) ---
 *     <rendered body>
 *     --- END LIVE CONTAINER <id> ---
 *
 * (the dashes come from config `separator`, default `---`). The section body
 * is one frame per rendered block, joined with newlines; when it exceeds
 * config `sectionBudgetBytes`, the OLDEST frames collapse to one-line
 * summaries - never silently dropped (ledger `failsafe section-collapse <n>`).
 *
 * Fail-open: a render failure skips the block and logs
 * `render failed <id> -> skipped`; the assembly still resolves.
 */
/**
 * The ledger sink Apply passes down (Factory.Append with the State bound).
 */
export type Log = (Message: string) => void;
/** Substitute {{token}} groups from the variable table. A token the table
 * does not resolve stays literal and logs `render unknown <id> <token>`
 * (once per token per pass). */
export declare const Substitute: (Template: string, Vars: Variables, ID: string, Append: Log) => string;
/**
 * The fixed frame around one block body (the model-facing contract).
 */
export declare const Frame: (Separator: string, ID: string, Body: string) => string;
/** Render one block to its frame, or null when the kind is not renderable
 * in phase 1 (the wave-2 kinds skip - reason "unknown kind"). */
export declare const RenderBlock: (Agent: State, Block: BlockSpecification, Scope: AgentState, At: number, Label: string, Append: Log) => string | null;
export default _default;
/** Build the section body for one assembly (research section 3: "the
 * system-prompt/assemble 'live section'"). Returns the body text, or ""
 * when nothing renders (Apply then appends NO section at all). */
declare function _default(Agent: State, Scope: AgentState, Label: string, Append: Log): string;
/** The fresh-check the assemble listener runs BEFORE building (the global
 * cache hit: nothing is dirty, the TTL has not expired - return the cached
 * body unchanged, no ledger line). */
export declare const Cached: (Agent: State, Scope: AgentState) => string | null;
