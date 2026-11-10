import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Passage from "../Interface/Passage.js";
import type Registry from "../Interface/Registry.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Follow
 *
 * The update-stage trigger that follows the factory's continuation
 * (Function/Continue).
 *
 * @remarks
 *
 * The factory owns the chain pass's scaffolding (read, union keep-list, guarded
 * write, message, P3 refresh), so the update stage - which the pre-refactor
 * Function/Continue ran inline after the rewrite - now runs OFF the settled
 * continuation: Function/Observe chains this follow-up onto the Continue
 * promise, and this module reproduces the old g4 preamble byte-identically:
 * - the passage gate - a refused rewrite, a failed guarded write or an
 *   undecodable manifest left `Passage.Proceed` false (the transform only opens
 *   the passage on the no-change path or inside the post-write message
 *   callback): no update stage;
 * - the Filter gate - nothing public for ncu to do: no update stage;
 * - the FIRST-WINS update-policy path pick (Function/Resolve - the governor's
 *   ENGINE INPUT, deliberately NOT the factory's union keep-list discovery: the
 *   update policy selects how ncu runs, it never strips chain pins);
 * - the dispatch (Function/Dispatch - the jobs envelope + gates).
 *
 * Contained like the factory's continuation: a bug-level throw here is
 * logger-only
 * (`hook-dsh-governor-package: continuation error (suppressed): ...`), never
 * the ledger, never a rethrow, never an unhandled rejection - the silence
 * invariant.
 */
declare function _default(State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Found: string | null, Registry: Registry | null, Passage: Passage): Promise<void>;
