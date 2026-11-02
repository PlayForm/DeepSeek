import type { Operation } from "./Operation.js";
/** The phase-1 plan: the bodies to load, then the operations that want them. */
export interface PlanReply {
    /** The skills whose current body the caller must load before phase 2. */
    readonly views: readonly string[];
    /** The operations the model wants to perform, before it has seen the bodies. */
    readonly operations: readonly Operation[];
}
/** The phase-2 confirmation: the final list, with every body already carried. */
export interface ConfirmReply {
    /** The final operation list; the caller applies it without a third call. */
    readonly operations: readonly Operation[];
}
/** The nine ids the strict parse can stop on, one id per rule. */
export type ParseFailure = "empty" | "fence" | "json" | "shape" | "unknown-key" | "field" | "kind" | "count" | "name";
/** The parse result: the reply, or the id and detail that stopped it. */
export type ParseResult<Shape> = {
    readonly ok: true;
    readonly reply: Shape;
} | {
    readonly ok: false;
    readonly id: ParseFailure;
    readonly detail: string;
};
