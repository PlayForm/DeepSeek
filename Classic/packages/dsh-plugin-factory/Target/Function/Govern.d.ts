import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
/** One registered step: the module's name plus its run closure. The closure
 *  captures the module's own State (built in that module's apply), so the
 *  chain pass, the update stage and every ledger line stay module-owned. The
 *  run may return a promise (the sequential fold awaits it — the step's
 *  chain completes before the next step starts) or nothing (a synchronous
 *  step). */
export interface Step {
    name: string;
    run: (Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
}
/** The registry: basename → the registered steps in registration order. */
export type Registry = {
    [basename: string]: Step[];
};
/** The selection: `true`/`"all"` = every registered step; an array (or a
 *  single name) = only the named steps; `false`/`null`/absent = none. */
export type Selection = boolean | string | string[] | null | undefined;
export default _default;
declare function _default(Steps: Registry, Target: FsTarget, Select: Selection, Actor: object | undefined, Version: FsVersion): Promise<void>;
