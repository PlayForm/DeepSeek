/**
 * @module StepBatch
 *
 * The spaces hook's THIN DELEGATE over the core's step-batch arm factory
 * (@playform/lib-dsh-core/Overpass/StepBatch).
 *
 * @remarks
 * The generic machinery (next() first, the continuous scope gate, the one-shot
 * `Overpass` flag and its consumption, the text-only block rewrite, the CCR
 * marker guard, the fail-open, the identity-preserving no-op) lives in the
 * core; this file supplies only what makes it THE NORMALIZE-SPACES:
 *
 * - the spaces transform - the core's Spaces class pinned to the configured
 *   replacement, read per call from the volatile-refreshed State;
 * - the spaces ledger line - the module's own string, byte-identical with the
 *   pre-delegate arm:
 *   `overpass: normalized N char(s) in step batch (turn T step S)`;
 * - the spaces ledger sink - State.Factory.Append / State.Factory.Journal;
 * - the spaces module identity - State.Module, which the factory's Append
 *   prefixes (the delegate never hardcodes the identity).
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
