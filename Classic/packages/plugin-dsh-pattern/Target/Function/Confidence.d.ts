import type Knobs from "@Interface/Config.js";
import type { Outcome } from "@Interface/Outcome.js";
import type Pattern from "@Interface/Pattern.js";
export declare const ApplyOutcome: (Pattern_: Pattern, Outcome: Outcome, Knobs: Knobs) => number;
/** The decayed confidence toward the neutral 0.5 floor. */
export declare const Decay: (Pattern_: Pattern, Now: number, HalfLifeDays: number) => number;
export declare const Touch: (Pattern_: Pattern, Now: number) => void;
