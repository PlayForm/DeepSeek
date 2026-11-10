import type { FsTarget, FsWriteIntent, FsWriteOutcome } from "@deepseek-ai/dsh-fs";
import type { SandboxExecutionPolicy } from "@deepseek-ai/dsh-sandbox";
import type State from "../Interface/State.js";
import { Effect } from "effect";
/**
 * @module Write
 *
 * The family's one shared write executor: the effect body behind the
 * WriteService, exposed as the Library's `Write` method.
 *
 * @remarks
 *
 * SCHEME.md section 2.7's `GuardedWrite` is its guarded alias. Re-expressed
 * from the Classic promise chain as a typed effect: same semantics, every
 * step identical, the orchestration now composable with other Effect
 * transformers and wrapped in the service's `dsh.write` span. It owns the
 * shared tail of the harness's built-in `write` pipeline
 * (subsystems/filesystem.md: resolve -> fs/write-intent waterfall -> sandbox
 * policy -> writeText -> fs/observed) for every family-side write: the
 * raw-write tool, the chain pass (Function/Continue) and any update stage.
 * Resolve stays caller-side on purpose - cwd semantics differ legitimately
 * (the tool resolves the model-supplied path, the continuation receives the
 * target from the fs/observed event) - so the target arrives pre-resolved.
 *
 * The `Over` bundle is "what the caller adds on top" of the shared pipeline:
 *
 * - `intent` - an explicit `FsWriteIntent` skips the waterfall (the guarded
 *   path's inline `{ kind: "replaceIfVersion", version }`); the default
 *   `{ waterfall: true }` runs the `fs/write-intent` waterfall with the
 *   unconditional `next() => undefined` delegate (the built-in's and
 *   raw-write's exact shape).
 * - `policy` - `"standing"` (the default) is the exact no-escalation replica
 *   of the built-in's FsSandboxController resolution: a bare backend
 *   (`fs.sandboxMode === undefined`) writes unconditionally, a confining
 *   backend requires the `sandboxPolicy` service and stamps the
 *   session-resolved policy onto the call (the byte-identical missing-policy
 *   error is kept - see below). `"p4"` is the sandbox-mode-decided fence
 *   (identical to the trio's Govern/Rewrite): the fence mirrors the fs
 *   backend's own default (`fs.sandboxMode`); when a mode is configured the
 *   caller declares a per-call `workspace-write` policy rooted at the
 *   target's own directory - the write target lives inside that root, so a
 *   confined execution succeeds without widening anything beyond the one
 *   directory being rewritten. An explicit `SandboxExecutionPolicy` object is
 *   stamped onto the call verbatim (a caller that resolved already).
 * - `observe` (default true) - emit `fs/observed`
 *   `{ kind: "present", version }` after success, byte-identical to the
 *   built-in's step 5 - emitted on the root context (`ctx.root.emit`, the
 *   built-in write's own posture: its ctx IS the root): cordis scoping lets a
 *   listener hear the root and its own scope but not sibling plugin scopes,
 *   so a plugin-scope emit from the tool's ctx would never reach the
 *   governance hooks; the guarded path passes `false` and delegates the
 *   re-emit to Function/Refresh (the same-actor U2 semantics, module scope -
 *   the module's own listeners hear it).
 * - `stash` (default false) - pre-register the outcome's fresh version in
 *   `State.Stash` before any re-emit, so a re-entrant listener call hits the
 *   idempotence gate (the guarded path's behavior).
 * - `transform` - the caller's content step, applied before the write
 *   (raw-write's six-fold Rewrite chain).
 * - `signal` - forwarded to `writeText` end to end; not mapped onto the fiber
 *   at the shell's runPromise boundary (a fiber interruption would replace
 *   the seam's own rejection with "All fibers interrupted without error" -
 *   the abort path's byte parity lives with the seam, see Library's Write).
 * - `actor` - the fs/observed actor and the fs/write-intent waterfall's actor
 *   (the tool's `exec`; `undefined` for family-internal writes). Passed
 *   through verbatim - the executor never mutates an actor; the raw-write's
 *   wrapped-actor marker (`govern`) is honored downstream by the Gate's
 *   second check, not here.
 *
 * The built-in `write` tool stays out of scope (harness-owned dsh-tool-fs);
 * this executor mirrors its mechanics so the fs/observed chains stay
 * identical. Accepted harness-side divergences remain: the escalation schema
 * fields, the session-cwd resolve options, the `[sandbox: ...]` denial marker
 * and the presentationMeta hunk diffs. The factory logs nothing here - the
 * caller composes its own ledger line from the outcome.
 *
 * The error channel is the underlying seam's error (unknown), preserved
 * identity via `Effect.tryPromise({ try, catch: (error) => error })`: a
 * failed write rejects the caller's promise exactly like the Classic
 * (`Effect.runPromise` at the shell boundary), while the continuation path
 * (Function/Continue) contains it - and its suppression line must carry the
 * original message ("...continuation error (suppressed): boom"), not a
 * wrapper's.
 */
/**
 * The option bundle: what the caller adds on top of the shared pipeline.
 */
export interface Over {
    /**
     * An explicit intent skips the waterfall; `{ waterfall: true }` (the
     * default) runs the fs/write-intent waterfall, `next() => undefined`.
     */
    intent?: FsWriteIntent | {
        waterfall: true;
    };
    /**
     * Forwarded to `writeText` end to end (never mapped onto the fiber at
     * the shell's runPromise boundary - the seam keeps the abort path's
     * byte parity).
     */
    signal?: AbortSignal | undefined;
    /**
     * `"standing"` (default): the built-in's no-escalation replica. `"p4"`:
     * the sandbox-mode-decided per-call fence. Or an explicit policy.
     */
    policy?: "standing" | "p4" | SandboxExecutionPolicy | undefined;
    /**
     * The fs/observed and fs/write-intent actor (the tool's `exec`), passed
     * through verbatim (the wrapped-actor marker is honored by the Gate,
     * never mutated here).
     */
    actor?: object | undefined;
    /**
     * Emit `fs/observed { kind: "present", version }` after success (default
     * true; the guarded path delegates the re-emit to Refresh).
     */
    observe?: boolean;
    /**
     * Pre-register the outcome's fresh version in State.Stash (default false
     * - the guarded path's idempotence gate).
     */
    stash?: boolean;
    /**
     * The caller's content step, applied before the write.
     */
    transform?: (content: string) => string;
}
export default _default;
declare function _default(State: State, Target: FsTarget, Content: string, Over?: Over): Effect.Effect<FsWriteOutcome, unknown>;
