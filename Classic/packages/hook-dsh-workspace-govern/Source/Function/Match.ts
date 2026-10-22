// Match - the exclusion-first check (Function/Match): the target matches any
// configured exclusion glob. Excluded targets are never gated (the family's
// internals - node_modules, Target, .git - pass through in silence, no
// decision, no ledger line), exactly the observe hook's exclusion-first
// posture.
import Glob from "./Glob.js";

export default (Path: string, Exclude: string[]): boolean =>
	Exclude.some((Pattern) => Glob(Path, Pattern));
