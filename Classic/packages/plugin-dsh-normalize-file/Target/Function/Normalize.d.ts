import type State from "../Interface/State.js";
/**
 * @module Normalize
 *
 * The read -> count -> write pipeline, the file-content normalizer's ONE
 * execution path (the tool's exec calls exactly this).
 *
 * @remarks
 *
 * The pipeline reads the target's content, applies the family's SIX transforms
 * with a per-character count, and writes ONLY when something changed. The
 * inversion of the file-hook trigger is the design: everything happens inside
 * one explicit agent tool call - there is NO event listener behind it (the
 * family's first listener-less flavor), so this function is the whole
 * behavior.
 *
 * The pipeline, stage by stage:
 *
 * 1. READ - `State.Context.fs.readText(Target, signal)` - the shared read
 *    path; a missing file, a directory, a binary or undecodable target, a
 *    permission failure or an abort all reject here and are re-thrown with the
 *    tool's context prefix (`normalize-file: cannot read <path>: ...`), so the
 *    registry turns the failure into an error result - NO write, NO ledger
 *    line, NO journal record (the mime check, tool-shaped: the backend owns
 *    binary rejection, the pipeline never sees undecodable bytes).
 * 2. COUNT - the six-fold chain (the raw-write `normalize: true` order),
 *    daisy-chaining the text and SUMMING the counts - the core's
 *    `{ text, count }` contract on every step:
 *    1. Dashes class -> the configured `replacement`
 *    2. Quotes MAP -> curly -> straight
 *    3. Ellipsis class -> "..."
 *    4. Spaces class -> " "
 *    5. Invisible class -> "" (removed)
 *    6. Fullwidth MAP -> full-width -> half-width
 *    The tables and replacers are the core's (@playform/lib-dsh-core,
 *    imported directly - the same source the six stream flavors delegate to).
 *    The chain is PURE: the core's replacers are pure and total on any string,
 *    and the per-call regex construction carries no lastIndex state.
 * 3. CONDITION - N = 0 -> NO write at all (the design's no-op no-write rule):
 *    the file is left byte-identical, no ledger line, no journal record; the
 *    result simply reports `changed: false`. N > 0 -> the write goes through
 *    the factory's ONE shared write executor (`State.Factory.Write` - factory
 *    SCHEME.md section 2.7), which owns everything after the resolve-side
 *    read: the fs/write-intent waterfall (the observation policy's single-slot
 *    guarded-write decision, with `next()` delegating to the unconditional
 *    default), the standing sandbox policy (the built-in write's no-escalation
 *    replica), `writeText` end to end (signal honored), and the
 *    `fs/observed { kind: "present", version }` emit ON THE ROOT CONTEXT with
 *    the call's exec as the actor - the governance trio's Gate requires the
 *    actor tool name to be in their `mutationTools` pin, which `normalize-file`
 *    never joins (the design's rule: never add it to any list), so these
 *    writes never trigger a chain pass.
 * 4. LEDGER - the count line `normalized N char(s) in <path>` (via
 *    `State.Factory.Append` - logger + durable file, never throws) and the P5
 *    journal record (the `normalized` event of the shared package_governance
 *    v2 domain, with the target's displayPath as the path), N > 0 only.
 *
 * Pure module: no module-level state (two concurrent calls share nothing -
 * every value is a local), so HMR reloads and parallel calls cannot interfere.
 */
/**
 * The target type is the shared write executor's own second parameter.
 */
type Target = Parameters<State["Factory"]["Write"]>[1];
/**
 * What the tool's exec returns (the tool's output schema shape).
 */
export interface Outcome {
    /**
     * The target's display path (model/UI-facing).
     */
    path: string;
    /**
     * Replaced character count across all six transforms.
     */
    count: number;
    /**
     * Whether a write happened (N > 0).
     */
    changed: boolean;
    /**
     * The file's content BEFORE the write (only when changed).
     */
    before?: string | null;
    /**
     * The file's content AFTER the write (only when changed).
     */
    after?: string;
}
/**
 * The COUNTING six-fold chain: the raw-write tool's Rewrite order, but
 * keeping the counts (the core's `{ text, count }` contract, summed) - the
 * count is the ledger line's N and the no-op condition. EXPORTED (additive,
 * the overpass arms' reuse): the tool-results and step-batch arms
 * (Function/Overpass, Function/StepBatch) run this same chain over tool
 * result text and incoming batch text - the file flavor's overpass transform
 * IS the whole six-fold chain, exactly like its tool body.
 */
export declare const Rewrite: (Content: string, Replacement: string) => {
    text: string;
    count: number;
};
export default _default;
declare function _default(State: State, Target: Target, Exec: {
    signal?: AbortSignal | undefined;
}): Promise<Outcome>;
