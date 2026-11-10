import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
/**
 * @module Govern
 *
 * The direct-govern entry (`Function/Govern` in the service API, the
 * factory's raw-write companion): the registered steps for the target's
 * basename, filtered by the caller's selection and run in REGISTERED order,
 * each step CONTAINED (a try/catch per step - the family's silence invariant:
 * never throws, never affects the caller, so a failing step can never turn a
 * successful write into a tool error).
 *
 * @remarks
 *
 * THE SEQUENTIAL FOLD (v0.2.1): the steps are AWAITED, one at a time -
 * `for (const Step of Listed) { await Step.run(...) }`. Each step's chain
 * completes (its guarded write + its ledger line) BEFORE the next step reads
 * the file, so the compositional loop is deterministic: with several steps
 * registered for one basename (e.g. the governor's canonicalize + update),
 * the later step always reads the file as the earlier step left it, and the
 * version-guarded `replaceIfVersion` writes can never race each other (the
 * pre-fold detached/concurrent version let the chains race - the first write
 * won, later ones failed FS_STALE_VERSION, and the file's final state plus
 * the ledger lines were nondeterministic). The async signature is why the
 * raw-write exec awaits the Govern call: the tool's result returns AFTER the
 * fold completes.
 *
 * The registry is the SharedJournal pattern at the instance level: the
 * governance modules register their steps at apply time
 * (`RegisterGovern(basename, name, run)` - `Library.ts`), and each run closure
 * captures its own State, so every ledger string stays the MODULE'S OWN,
 * byte-identical (the factory never owns ledger strings). One basename maps
 * to one ordered step list; unknown steps in a selection match nothing and
 * are ignored by construction.
 *
 * Selection semantics (the per-call `govern` flag the raw-write tool passes):
 *
 * - `true` or `"all"` - every registered step for the basename;
 * - an array of names (or a single name) - ONLY the named steps, in the
 *   registered order;
 * - `false`, `null` or absent - no governance at all (the escape hatch;
 *   the raw-write tool omits the Govern call entirely for these).
 */
/** One registered step: the module's name plus its run closure. The closure
 * captures the module's own State (built in that module's apply), so the
 * chain pass, the update stage and every ledger line stay module-owned. The
 * run may return a promise (the sequential fold awaits it - the step's
 * chain completes before the next step starts) or nothing (a synchronous
 * step). */
export interface Step {
    /**
     * The module's step name (the selection key).
     */
    name: string;
    /**
     * The run closure (the step's own chain pass).
     */
    run: (Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
}
/**
 * The registry: basename -> the registered steps in registration order.
 */
export type Registry = {
    [basename: string]: Step[];
};
/** The selection: `true`/`"all"` = every registered step; an array (or a
 * single name) = only the named steps; `false`/`null`/absent = none. */
export type Selection = boolean | string | string[] | null | undefined;
export default _default;
declare function _default(Steps: Registry, Target: FsTarget, Select: Selection, Actor: object | undefined, Version: FsVersion): Promise<void>;
