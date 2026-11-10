import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import type State from "../Interface/State.js";
/**
 * @module StepBatch
 *
 * The ets-hook-dsh-normalize-spaces's THIN DELEGATE over the ETS base's step-batch arm
 * factory (@playform/ets-base-dsh/Overpass/StepBatch).
 *
 * @remarks
 *
 * The generic machinery lives in the base; this file supplies only what
 * makes it THE NORMALIZE-SPACES:
 *
 *   - the spaces transform - the core's Spaces class pinned to the
 *     configured replacement, read per call from the volatile-refreshed
 *     State;
 *   - the spaces ledger line - byte-identical with the Classic tree's line:
 *     `overpass: normalized N char(s) in step batch (turn T step S)`;
 *   - the spaces ledger sink - State.Factory.Append / State.Factory.Journal;
 *   - the spaces module identity - State.Module (the Classic identity,
 *     `hook-dsh-normalize-spaces`), prefixed by the factory's Append.
 *
 * The default export is the listener itself (the factory's return), so
 * Function/Apply's registration and the import path stay untouched.
 */
declare const _default: (P: {
    turn?: unknown;
    step?: unknown;
}, Next: () => Promise<PreStepDecision>, State: State) => Promise<PreStepDecision>;
export default _default;
