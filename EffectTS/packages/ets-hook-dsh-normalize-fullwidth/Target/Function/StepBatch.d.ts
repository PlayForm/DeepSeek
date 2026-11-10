/**
 * @module StepBatch
 *
 * The ets-hook-dsh-normalize-fullwidth's THIN DELEGATE over the ETS base's step-batch arm
 * factory (@playform/ets-base-dsh/Overpass/StepBatch).
 *
 * @remarks
 * The generic machinery lives in the base; this file supplies only what
 * makes it THE NORMALIZE-FULLWIDTH:
 *
 *   - the fullwidth transform - the core's Fullwidth map pinned to the ASCII
 *     counterparts (the one-argument delegate ignores State);
 *   - the fullwidth ledger line - byte-identical with the Classic tree's
 *     line: `overpass: normalized N char(s) in step batch (turn T step S)`;
 *   - the fullwidth ledger sink - State.Factory.Append /
 *     State.Factory.Journal;
 *   - the fullwidth module identity - State.Module (the Classic identity,
 *     `hook-dsh-normalize-fullwidth`), prefixed by the factory's Append.
 *
 * The default export is the listener itself (the factory's return), so
 * Function/Apply's registration and the import path stay untouched.
 */
import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import type State from "../Interface/State.js";
declare const _default: (P: {
    turn?: unknown;
    step?: unknown;
}, Next: () => Promise<PreStepDecision>, State: State) => Promise<PreStepDecision>;
export default _default;
