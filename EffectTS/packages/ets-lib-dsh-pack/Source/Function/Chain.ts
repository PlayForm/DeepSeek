// Chain - resolve an `extends:` chain into its base packs, deepest base
// first. A named pack is looked up in the USER layer
// (`<home>/.dsh/playform/workspaces/<name>.yml`) - the base-workspace pack
// the D2 deep-link override inherits. A missing name is skipped (a stale
// link must not silence a repo), and a name already visited in the chain is
// skipped too (the cycle guard; the pack is merged once).
import type Pack from "../Interface/Pack.js";
import Extends from "./Extends.js";
import Pick from "./Pick.js";
import Read from "./Read.js";
import User from "./User.js";

/** Load one named base pack from the user layer, or undefined. */
const Base = (Name: string, Home: string): Pack | undefined => {
	const Path = Pick(User(Name, Home));
	return Path === undefined ? undefined : Read(Path);
};

/** Walk one name: its own bases first, then itself. */
const Walk = (Name: string, Home: string, Seen: Set<string>): Pack[] => {
	if (Seen.has(Name)) {
		return [];
	}
	Seen.add(Name);
	const Found = Base(Name, Home);
	if (Found === undefined) {
		return [];
	}
	const Parents = Extends(Found).flatMap((Parent) => Walk(Parent, Home, Seen));
	return [...Parents, Found];
};

export default (Names: string[], Home: string, Seen: Set<string>): Pack[] =>
	Names.flatMap((Name) => Walk(Name, Home, Seen));
