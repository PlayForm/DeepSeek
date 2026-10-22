import type RenamePlan from "@Interface/RenamePlan.js";
import type Span from "@Interface/Span.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Path: string, Range: Span, To: string): Promise<RenamePlan | undefined>;
