import type State from "../Interface/State.js";
import type { TruthKind } from "../Interface/TruthKind.js";
import type Validation from "../Interface/Validation.js";
export default _default;
declare function _default(State: State, Id: string, Kind: TruthKind, Subject: string, Dependencies: string[], Verdict: "verified" | "unverified"): Validation;
