import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import type State from "../Interface/State.js";
/**
 * @module StepBatch
 *
 * The plugin's THIN DELEGATE over the ETS base's step-batch arm factory.
 *
 * @remarks
 *
 * The generic machinery lives in the base
 * (@playform/ets-base-dsh/Overpass/StepBatch); this file supplies only what
 * makes it THE NORMALIZE-FILE:
 * - the file transform - the six-fold Rewrite chain (dashes to the configured
 *   replacement, then quotes, ellipsis, spaces, invisible removal, fullwidth),
 *   read per call from the volatile-refreshed State;
 * - the file ledger line - byte-identical with the Classic tree's line:
 *   `overpass: normalized N char(s) in step batch (turn T step S)`;
 * - the file ledger sink - State.Factory.Append / State.Factory.Journal;
 * - the file module identity - State.Module (the Classic identity,
 *   `plugin-dsh-normalize-file`), prefixed by the factory's Append.
 *
 * The default export is the listener itself (the factory's return), so
 * Function/Apply's registration and the import path stay untouched.
 */
declare const _default: (P: {
    turn?: unknown;
    step?: unknown;
}, Next: () => Promise<PreStepDecision>, State: State) => Promise<PreStepDecision>;
export default _default;
