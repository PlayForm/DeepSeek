import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Passage from "@Interface/Passage.js";
import type Registry from "@Interface/Registry.js";
import type State from "@Interface/State.js";
import type { Transform } from "@Interface/Transform.js";
export default _default;
/**
 * @module Transform
 *
 * The MODULE LEAF of the factory continuation: the chain pass of the
 * fs/observed pipeline as a factory transform.
 *
 * @remarks
 *
 * Shape: `(current, section, keep) => { next, count, message? } | null`. The
 * factory's Continue (Function/Continue - SCHEME.md §2.9) owns everything
 * around it: the Inflight registration, the `ctx.fs.readText`, the union
 * keep-list (Factory.ResolvePolicy with the P3 chain keys - irrelevant to the
 * governor's chain semantics and deliberately ignored here), the serialization
 * (`JSON.stringify(next, null, 2) + "\n"` - the exact pre-refactor form), the
 * version-guarded write (Factory.GuardedWrite: the P4 sandbox fence + Stash
 * pre-registration), the message Append and the P3 same-actor re-emit.
 *
 * This leaf keeps only what is governor-owned, byte-identically with the
 * pre-refactor Function/Decode + Function/Satisfy + Function/Govern:
 * - DECODE - `current` arrives as the RAW text (null when the read failed); an
 *   undecodable package.json logs
 *   `observed non-JSON package.json <path> - skipped` and returns null.
 * - SATISFY - chain-governed pins (dep in registry.effectiveLatest) are
 *   canonicalized to `^<resolved>`; with `strict: true` unknown deps are
 *   stripped; public deps are left for the update stage. Without a registry
 *   (none found, or an unparsable one) the pass is skipped.
 * - THE REFUSAL GUARD - only dependency sections (Variable/Section) may differ
 *   from the author's manifest; anything else refuses the rewrite outright:
 *   `REFUSED rewrite of <path>: non-dependency section "<name>" would change`,
 *   and the update stage never runs (the guard's contract).
 *
 * On change the transform returns the governed manifest with the MODULE'S
 * success line `governed <path> -> <version>` as the message - composed inside
 * the factory's post-write callback, which ALSO journals the `governed` storage
 * record and marks the passage Proceed (a failed write never invokes the
 * message, so the update stage is skipped exactly as the pre-refactor
 * Function/Govern's false return did). The count is the change marker the
 * factory's no-op gate needs (0 would suppress the write).
 *
 * The registry is passed in by Function/Observe - the SAME parsed object the
 * listener's g2 stage checked for the `unreadable registry.json ...` line - so
 * the transform never re-reads it.
 */
declare function _default(State: State, Target: FsTarget, Registry: Registry | null, Passage: Passage): Transform;
