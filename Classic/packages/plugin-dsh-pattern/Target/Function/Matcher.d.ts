import type Knobs from "@Interface/Config.js";
import type { MatchResult } from "@Interface/Match.js";
import type Pattern from "@Interface/Pattern.js";
export default _default;
declare function _default(Candidates: Pattern[], Context: {
    tool?: string | undefined;
    text?: string | undefined;
}, Knobs: Knobs): MatchResult[];
