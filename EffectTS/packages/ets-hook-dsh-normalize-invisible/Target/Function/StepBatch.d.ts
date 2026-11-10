/**
 * @module StepBatch
 *
 * The ets-hook-dsh-normalize-invisible's THIN DELEGATE over the ETS base's step-batch arm
 * factory (@playform/ets-base-dsh/Overpass/StepBatch).
 *
 * @remarks
 * The generic machinery lives in the base; this file supplies only what
 * makes it THE NORMALIZE-INVISIBLE:
 *
 *   - the invisible transform - the core's Invisible class pinned to the
 *     configured replacement (default removal), read per call from the
 *     volatile-refreshed State;
 *   - the invisible ledger line - byte-identical with the Classic tree's
 *     line: `overpass: normalized N char(s) in step batch (turn T step S)`;
 *   - the invisible ledger sink - State.Factory.Append /
 *     State.Factory.Journal;
 *   - the invisible module identity - State.Module (the Classic identity,
 *     `hook-dsh-normalize-invisible`), prefixed by the factory's Append.
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
