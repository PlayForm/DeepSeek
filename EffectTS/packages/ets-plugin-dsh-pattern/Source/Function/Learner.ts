// Learner - the online half (Function/Learner): one outcome moves one
// pattern's confidence through Function/Confidence and stamps updatedAt.
// The offline mining (the session replays) is the end-phase's business; v1
// ships the accept/reject/applied/failed loop only (PATTERN-GRAPH-PLUGIN.md
// phase P3 lives here).
import type Knobs from "@Interface/Config.js";
import type { Outcome } from "@Interface/Outcome.js";
import type Pattern from "@Interface/Pattern.js";

import { ApplyOutcome, Touch } from "./Confidence.js";

export default (Pattern_: Pattern, Outcome: Outcome, Knobs: Knobs, Now: number): void => {
	Pattern_.confidence = ApplyOutcome(Pattern_, Outcome, Knobs);
	Touch(Pattern_, Now);
};
