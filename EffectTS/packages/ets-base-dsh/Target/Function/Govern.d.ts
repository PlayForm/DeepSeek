import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import { Effect } from "effect";
/**
 * @module Govern
 *
 * The direct-govern entry: the registered steps for a target's basename, run
 * in registered order with every step contained.
 *
 * @remarks
 *
 * The factory's raw-write companion. The steps are filtered by the caller's
 * selection and each step is contained (`Effect.exit` per step - the family's
 * silence invariant: never throws, never affects the caller, so a failing step
 * can never turn a successful write into a tool error).
 *
 * The sequential fold (v0.2.1) is re-expressed as
 * `Effect.forEach(..., { concurrency: 1, discard: true })`: the steps run one
 * at a time - each step's chain completes (its guarded write plus its ledger
 * line) before the next step reads the file, so the compositional loop is
 * deterministic. With several steps registered for one basename (e.g. the
 * governor's canonicalize + update), the later step always reads the file as
 * the earlier step left it, and the version-guarded `replaceIfVersion` writes
 * can never race each other (the pre-fold detached/concurrent version let the
 * chains race - the first write won, later ones failed `FS_STALE_VERSION`, and
 * the file's final state plus the ledger lines were nondeterministic). The
 * async signature is why the raw-write exec awaits the Govern call: the tool's
 * result returns after the fold completes.
 *
 * The #14 parallel marker (designed in from the start, the service's
 * documented toggle): the Selection gains an object form alongside the legacy
 * boolean/string/array form - `{ steps, parallel }`. The marker is a single
 * switch here:
 *
 * - sequential (the default - the live-verified race fix; no parallel hooks
 *   exist in the Classic code):
 *   `Effect.forEach(steps, run, { concurrency: 1, discard: true })`.
 * - parallel (opt-in only):
 *   `Effect.all(steps.map(run), { concurrency: "unbounded", mode: "default",
 *   discard: true })` - Effect's fiber scheduling replaces `Promise.all`.
 *   Documented safety condition (unchanged from #14): disjoint targets only;
 *   same-file steps race.
 *
 * In both modes every step keeps its own contained error: a throwing run never
 * propagates, and the steps after a throwing one still run.
 *
 * The registry is the SharedJournal pattern at the instance level: the
 * governance modules register their steps at apply time
 * (`RegisterGovern(basename, name, run)` - Library.ts), and each run closure
 * captures its own State, so every ledger string stays the module's own,
 * byte-identical (the factory never owns ledger strings). One basename maps to
 * one ordered step list; unknown steps in a selection match nothing and are
 * ignored by construction.
 *
 * Selection semantics (the per-call `govern` flag the raw-write tool passes):
 *
 * - `true` or `"all"` - every registered step for the basename.
 * - An array of names (or a single name) - only the named steps, in the
 *   registered order.
 * - `{ steps, parallel }` - the marker form: the inner selection resolved
 *   exactly as above, `parallel: true` switching the fold to unbounded.
 * - `false`, `null` or absent - no governance at all (the escape hatch; the
 *   raw-write tool omits the Govern call entirely for these).
 */
/**
 * One registered step: the module's name plus its run closure.
 *
 * @remarks
 * The closure captures the module's own State (built in that module's apply),
 * so the chain pass, the update stage and every ledger line stay module-owned.
 * The run may return a promise (the sequential fold awaits it - the step's
 * chain completes before the next step starts) or nothing (a synchronous
 * step).
 */
export interface Step {
    name: string;
    run: (Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
}
/**
 * The registry: basename -> the registered steps in registration order.
 */
export type Registry = {
    [basename: string]: Step[];
};
/**
 * The selection.
 *
 * @remarks
 * `true` or `"all"` selects every registered step; an array (or a single
 * name) selects only the named steps; the #14 marker form `{ steps, parallel
 * }` selects the inner selection with the fold's concurrency switched;
 * `false`, `null` or absent selects none.
 */
export type Selection = boolean | string | string[] | null | undefined | {
    steps: boolean | string | string[] | null | undefined;
    parallel?: boolean;
};
export default _default;
declare function _default(Steps: Registry, Target: FsTarget, Select: Selection, Actor: object | undefined, Version: FsVersion): Effect.Effect<void>;
