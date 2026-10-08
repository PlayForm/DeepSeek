import { Effect } from "effect";
import type State from "@Interface/State.js";
import type { FsTarget, FsWriteIntent, FsWriteOutcome } from "@deepseek-ai/dsh-fs";
import type { SandboxExecutionPolicy } from "@deepseek-ai/dsh-sandbox";
/** The option bundle: what the caller adds on top of the shared pipeline. */
export interface Over {
    /** An explicit intent skips the waterfall; `{ waterfall: true }` (the
     *  default) runs the fs/write-intent waterfall, `next() => undefined`. */
    intent?: FsWriteIntent | {
        waterfall: true;
    };
    /** Forwarded to `writeText` end to end (never mapped onto the fiber at
     *  the shell's runPromise boundary - the seam keeps the abort path's
     *  byte parity). */
    signal?: AbortSignal | undefined;
    /** `"standing"` (default): the built-in's no-escalation replica. `"p4"`:
     *  the sandbox-mode-decided per-call fence. Or an explicit policy. */
    policy?: "standing" | "p4" | SandboxExecutionPolicy | undefined;
    /** The fs/observed and fs/write-intent actor (the tool's `exec`),
     *  passed through verbatim (the wrapped-actor marker is honored by the
     *  Gate, never mutated here). */
    actor?: object | undefined;
    /** Emit `fs/observed { kind: "present", version }` after success
     *  (default true; the guarded path delegates the re-emit to Refresh). */
    observe?: boolean;
    /** Pre-register the outcome's fresh version in State.Stash (default
     *  false - the guarded path's idempotence gate). */
    stash?: boolean;
    /** The caller's content step, applied before the write. */
    transform?: (content: string) => string;
}
export default _default;
declare function _default(State: State, Target: FsTarget, Content: string, Over?: Over): Effect.Effect<FsWriteOutcome, unknown>;
