/**
 * @module Learner
 *
 * The online half: one outcome moves one pattern's confidence and stamps its
 * update time.
 *
 * @remarks
 * One outcome moves one pattern's confidence through Function/Confidence and
 * stamps `updatedAt`. The offline mining (the session replays) is the
 * end-phase's business; v1 ships the accept/reject/applied/failed loop only
 * (PATTERN-GRAPH-PLUGIN.md phase P3 lives here).
 */
import type Knobs from "../Interface/Config.js";
import type { Outcome } from "../Interface/Outcome.js";
import type Pattern from "../Interface/Pattern.js";
export default _default;
declare function _default(Pattern_: Pattern, Outcome: Outcome, Knobs: Knobs, Now: number): void;
