import type State from "@Interface/State.js";
/** The target type is the shared write executor's own second parameter. */
type Target = Parameters<State["Factory"]["Write"]>[1];
/** What the tool's exec returns (the tool's output schema shape). */
export interface Outcome {
    /** The target's display path (model/UI-facing). */
    path: string;
    /** Replaced character count across all six transforms. */
    count: number;
    /** Whether a write happened (N > 0). */
    changed: boolean;
    /** The file's content BEFORE the write (only when changed). */
    before?: string | null;
    /** The file's content AFTER the write (only when changed). */
    after?: string;
}
export default _default;
declare function _default(State: State, Target: Target, Exec: {
    signal?: AbortSignal | undefined;
}): Promise<Outcome>;
