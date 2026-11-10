/**
 * @module StepBatch
 *
 * The ets-hook-dsh-normalize-dash's THIN DELEGATE over the ETS base's step-batch arm factory
 * (@playform/ets-base-dsh/Overpass/StepBatch).
 *
 * @remarks
 * The generic machinery (next() first, the continuous scope gate, the
 * one-shot `Overpass` flag and its consumption, the text-only block rewrite,
 * the CCR marker guard, the fail-open, the identity-preserving no-op) lives
 * in the base; this file supplies only what makes it THE NORMALIZE-DASH:
 *
 *   - the dash transform - the core's Dashes class pinned to the configured
 *     replacement, read per call from the volatile-refreshed State;
 *   - the dash ledger line - the module's own string, byte-identical with the
 *     Classic tree's line:
 *     `overpass: normalized N char(s) in step batch (turn T step S)`;
 *   - the dash ledger sink - State.Factory.Append / State.Factory.Journal;
 *   - the dash module identity - State.Module (the Classic identity,
 *     `hook-dsh-normalize-dash`, which keeps every ledger string
 *     byte-identical), prefixed by the factory's Append.
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
