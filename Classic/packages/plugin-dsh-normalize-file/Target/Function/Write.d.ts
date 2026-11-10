/**
 * @module Write
 *
 * The `normalize-file` TOOL (`defineTool` from @deepseek-ai/dsh-tools): the
 * family's explicit, visible, opt-in door to files ALREADY on disk.
 *
 * @remarks
 * The stream normalizers (normalize-dash + the five flavors) rewrite model
 * output by name-exempting `edit`, `raw-write` and THIS tool's calls (the
 * core's Stream/Chunk + Stream/Block): the arguments carry a FILE PATH, and a
 * stream flavor normalizing a dash inside a filename would corrupt the target
 * - so a call to this tool carries its arguments through the stream untouched,
 * and the tool decides everything at execution time.
 *
 * The exec keeps only what is legitimately caller-side:
 *
 * 1. `ctx.fs.resolve` - the model-supplied path becomes a stable target (cwd
 *    semantics are the caller's, exactly like raw-write);
 * 2. ONE call to the shared pipeline (Function/Normalize), which owns the
 *    rest: the read (`ctx.fs.readText`), the counting six-fold chain, the
 *    N = 0 no-op no-write rule, and - only when N > 0 - the write through the
 *    factory's ONE shared write executor (`State.Factory.Write`), so the
 *    fs/write-intent waterfall and the fs/observed present emit are handled BY
 *    the shared executor, byte-identical with raw-write's posture (the emit on
 *    the ROOT context, the call's exec as the actor).
 *
 * The exec returns the pipeline's outcome; the registry projects it through
 * the output schema (path/count/changed, plus before/after when changed) and
 * through `presentationMeta`, which the pure `presentResult` narrows back into
 * the diff card (the read-tool pattern: the structured before/after cannot be
 * reconstructed from the rendered text alone, so they are projected through the
 * output declaration and read back from `result.meta`). The presenters are
 * PURE functions of the args and the outcome metadata - no I/O, no session
 * state, no clock.
 *
 * The registration is READONLY after registration (the skill's rule): the
 * definition object is never mutated - this file only BUILDS it; the
 * registration call itself lives in Function/Apply.
 */
import type { Context } from "@deepseek-ai/cordis";
import type State from "../Interface/State.js";
export default _default;
declare function _default(Context: Context, State: State): import("@deepseek-ai/dsh-tools").ToolDefinition;
