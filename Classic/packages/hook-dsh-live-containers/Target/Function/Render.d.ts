import { type AgentState, type BlockSpecification, type Variables } from "@Interface/Execution.js";
import type State from "@Interface/State.js";
/** The ledger sink Apply passes down (Factory.Append with the State bound). */
export type Log = (Message: string) => void;
/** Substitute {{token}} groups from the variable table. A token the table
 * does not resolve stays literal and logs `render unknown <id> <token>`
 * (once per token per pass). */
export declare const Substitute: (Template: string, Vars: Variables, ID: string, Append: Log) => string;
/** The fixed frame around one block body (the model-facing contract). */
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
