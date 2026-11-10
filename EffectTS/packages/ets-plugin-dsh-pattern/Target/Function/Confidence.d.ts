/**
 * @module Confidence
 *
 * The arithmetic on one pattern's confidence: outcome deltas and the
 * half-life decay.
 *
 * @remarks
 * Function/Confidence. Record deltas per outcome (clamped to 0..1) and the
 * half-life decay for the stale-pattern rule (PATTERN-GRAPH-PLUGIN.md risk 8):
 * a pattern not updated for n half-lives decays halfway toward the neutral
 * 0.5 floor each half-life, never below it.
 */
import type Knobs from "../Interface/Config.js";
import type { Outcome } from "../Interface/Outcome.js";
import type Pattern from "../Interface/Pattern.js";
export declare const ApplyOutcome: (Pattern_: Pattern, Outcome: Outcome, Knobs: Knobs) => number;
/**
 * The decayed confidence toward the neutral 0.5 floor.
 */
export declare const Decay: (Pattern_: Pattern, Now: number, HalfLifeDays: number) => number;
export declare const Touch: (Pattern_: Pattern, Now: number) => void;
