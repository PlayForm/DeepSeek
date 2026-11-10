import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import type State from "../Interface/State.js";
/**
 * @module StepBatch
 *
 * The quotes hook's THIN DELEGATE over the core's step-batch arm factory
 * (@playform/lib-dsh-core/Overpass/StepBatch).
 *
 * @remarks
 *
 * The generic machinery (next() first, the continuous scope gate, the one-shot
 * `Overpass` flag and its consumption, the text-only block rewrite, the CCR
 * marker guard, the fail-open, the identity-preserving no-op) lives in the
 * core; this file supplies only what makes it THE NORMALIZE-QUOTES:
 *
 * - the quotes transform - the core's Quotes map pinned to the straight ASCII
 *   counterparts (the one-argument delegate ignores State: the map has no
 *   replacement knob);
 * - the quotes ledger line - the module's own string, byte-identical with the
 *   pre-delegate arm:
 *   `overpass: normalized N char(s) in step batch (turn T step S)`;
 * - the quotes ledger sink - State.Factory.Append / State.Factory.Journal;
 * - the quotes module identity - State.Module, which the factory's Append
 *   prefixes (the delegate never hardcodes the identity).
 *
 * The default export is the listener itself (the factory's return), so
 * Function/Apply's registration and the import path stay untouched.
 */
declare const _default: (P: {
    turn?: unknown;
    step?: unknown;
}, Next: () => Promise<PreStepDecision>, State: State) => Promise<PreStepDecision>;
export default _default;
