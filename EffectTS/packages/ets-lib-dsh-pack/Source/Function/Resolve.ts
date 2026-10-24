// Resolve - the layered resolution (D2), the heart of the library:
//
//   1. read the repo layer (`<root>/.dsh/pack.yml`) to discover a declared
//      `slug` (the user layer is keyed by it);
//   2. read the user layer (`<home>/.dsh/playform/workspaces/<slug>.yml`);
//   3. no layer at all -> the BUILT-IN pack (this monorepo's default);
//   4. resolve the union of both layers' `extends:` chains as the BASE
//      (cycle-guarded; the named bases live in the user layer);
//   5. merge: the base packs first (deepest first), then the user layer,
//      then the repo layer - so the repo overrides the user, and both
//      override their bases.
//
// The merge rules live in Function/Merge; the parser decision in
// Function/Parse. The result is a normalized Pack (Function/Normalize).
import type Options from "../Interface/Options.js";
import type Pack from "../Interface/Pack.js";
import Builtin from "../Variable/Builtin.js";
import Chain from "./Chain.js";
import Extends from "./Extends.js";
import Home from "./Home.js";
import Merge from "./Merge.js";
import Normalize from "./Normalize.js";
import Pick from "./Pick.js";
import Read from "./Read.js";
import Repository from "./Repository.js";
import Slug from "./Slug.js";
import User from "./User.js";

export default (Root: string, Options?: Options): Pack => {
	const Home_ = Home(Options);
	const RepoPath = Pick(Repository(Root));
	const RepoRaw = RepoPath === undefined ? undefined : Read(RepoPath);
	const Declared = RepoRaw?.slug;
	const Name = typeof Declared === "string" && Declared.length > 0 ? Declared : Slug(Root);
	const UserPath = Pick(User(Name, Home_));
	const UserRaw = UserPath === undefined ? undefined : Read(UserPath);
	if (RepoRaw === undefined && UserRaw === undefined) {
		return Builtin;
	}
	const Names = [...Extends(RepoRaw ?? {}), ...Extends(UserRaw ?? {})];
	const Layers: Pack[] = [...Chain(Names, Home_, new Set([Name]))];
	if (UserRaw !== undefined) {
		Layers.push(UserRaw);
	}
	if (RepoRaw !== undefined) {
		Layers.push(RepoRaw);
	}
	const Merged = Layers.reduce<Pack>((Result, Layer) => Merge(Result, Layer), {});
	return Normalize(Merged);
};
