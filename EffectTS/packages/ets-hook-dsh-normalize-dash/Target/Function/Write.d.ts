/**
 * @module Write
 *
 * The RAW-WRITE tool (`raw-write`): the plugin-registered sibling of the
 * harness's built-in `write` tool with an EXPLICIT `normalize` parameter.
 *
 * @remarks
 * The stream normalizers (hook-dsh-normalize-dash + the five flavors) rewrite model
 * output by name-exempting only `edit` and `raw-write` tool calls (the core's
 * Stream/Chunk + Stream/Block), so a call to THIS tool carries its content
 * through the stream untouched and decides at execution time:
 *
 *   - `normalize` absent or false (the DEFAULT) - the content is written
 *     VERBATIM, byte-for-byte;
 *   - `normalize: true` or `"all"` - the family's SIX transforms are applied
 *     to the content first (the legacy behavior, byte-equivalent);
 *   - `normalize: ["dash", ...]` - ONLY the selected flavors, applied in the
 *     family's fixed order (Function/Rewrite: Dashes with the module's
 *     configured `replacement`, Quotes, Ellipsis, Spaces, Invisible,
 *     Fullwidth). The parameter is declared as a UNION (boolean | "all" |
 *     the flavor-name array) - the harness tools reject unknown keys, so the
 *     schema must declare the whole selection shape.
 *
 *   - `govern` absent or false (the DEFAULT) - NO governance chain (the
 *     "skip everything" escape hatch: NO steps run, through either path);
 *   - `govern: true` or `"all"` - ALL registered governance steps for the
 *     target's basename;
 *   - `govern: ["canonicalize", ...]` - ONLY the named steps. After a
 *     SUCCESSFUL write the exec AWAITS the factory's direct-govern entry
 *     (`await State.Factory.Govern(target, selection, Wrapped,
 *     outcome.version)`) inside the existing try/catch - the SEQUENTIAL FOLD
 *     (factory v0.2.1): the registered steps run one at a time, each step's
 *     chain completing (its guarded write + its ledger line) before the next
 *     step reads the file, so the tool's result returns AFTER the governance
 *     completes and the steps' version-guarded writes can never race. The
 *     update step's awaited promise is fast - its dispatch resolves when the
 *     stage is dispatched, not when the background job finishes - so the
 *     ledger still shows the progress as today. Best-effort, contained: the
 *     registered steps can never affect the write's outcome (the catch below
 *     keeps it intact). With no steps registered for the basename the call
 *     is a contained no-op.
 *
 * The DIRECT path is this tool's ONLY governance channel: the exec passes
 * its actor to the shared executor WRAPPED as `{ ...exec, govern: <mapped
 * selection> }` (absent/false -> `false`, true/"all" -> `true`, an array ->
 * the array itself - the value is informational, the factory's gate checks
 * only PRESENCE). The marker makes the event path skip the write's
 * fs/observed emit entirely (the gate's "govern" reason), so a governed
 * manifest never fires the chain twice - the steps run once, from the direct
 * call above. The spread preserves every exec field (name, callId, agent,
 * signal...), so the harness's own listeners (the observation policy's owner
 * derivation, the skill-filesystem's `"name" in actor` narrowing) and the
 * direct steps' handlers keep working unchanged; the GuardedWrite and
 * Refresh re-emits inside the chain pass carry the SAME wrapped actor, so
 * they are skipped too (no double processing - the Stash idempotence stays
 * as the second guard).
 *
 * The fs path is the factory's ONE shared write executor
 * (`State.Factory.Write` - factory SCHEME.md §2.7), which mirrors the
 * built-in write's fs path EXACTLY (so the fs/observed chain still fires for
 * these writes the same way it fires for built-in writes - only the
 * governance listeners now skip the event via the `govern` marker above).
 * The exec keeps only what is legitimately caller-side:
 *
 *   1. `ctx.fs.resolve` - the model-supplied path becomes a stable target;
 *   2. ONE `Factory.Write(State, target, content, { signal, actor, policy:
 *      "standing", transform })` call, which runs the rest of the pipeline:
 *      the `fs/write-intent` waterfall (the observation policy's single-slot
 *      guarded-write decision, with `next()` delegating to the unconditional
 *      default), the standing sandbox policy (the same resolution the
 *      built-in's FsSandboxController performs when no escalation is
 *      requested - raw-write advertises NO escalation of its own), the
 *      `writeText(target, content, intent, exec.signal, policy)` call, and
 *      the `fs/observed { kind: "present", version }` emit - ON THE ROOT
 *      CONTEXT, the built-in write's own posture (the built-in's ctx IS the
 *      root; a plugin-scope emit would never be heard by the governance
 *      hooks' sibling scopes);
 *   3. the optional `Govern` call (see above), AWAITED inside its own
 *      try/catch (the sequential fold: the tool's result returns after the
 *      governance completes; the contained catch keeps the write's outcome
 *      intact even for a registry-level surprise).
 *
 * `exec.signal` is honored end to end: it cancels the resolve and the write,
 * and the registry rejects a pre-aborted invocation before the body runs.
 *
 * The registration is READONLY after registration (the skill's rule): the
 * definition object is never mutated - this file only BUILDS it; the
 * registration call itself lives in Function/Apply (the wire-up, after the
 * llm/stream Wire). The presenters are PURE functions of the args (the
 * normalization they show is recomputed through the same Function/Rewrite
 * chain the exec uses - no I/O, no session state, no clock).
 */
import type { Context } from "@deepseek-ai/cordis";
import type State from "../Interface/State.js";
export default _default;
declare function _default(Context: Context, State: State): import("@deepseek-ai/dsh-tools").ToolDefinition;
