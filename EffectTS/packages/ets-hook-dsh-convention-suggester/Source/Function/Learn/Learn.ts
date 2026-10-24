// Learn - the bootstrap step (D4): should THIS judged call propose a pack,
// and if so, write it. The gate is a short ladder, in order:
//
//   1. the root: the workspace gate's root when it resolved; otherwise the
//      learner's own anchor walk (a repo with no pack and no pack signature
//      is exactly the repo the bootstrap exists for);
//   2. the pack: the gate's resolved pack, or the layered resolution of the
//      anchored root (an UNCACHED Resolve - the learner must not populate the
//      library's process memo with the pre-proposal answer, or an installed
//      proposal could not be read until a restart);
//   3. the opt-in: the config's `learning` wins when true; a false config
//      (the default) defers to the resolved pack's `learning.propose`, so a
//      repo can opt itself in with a minimal `.dsh/pack.yml`. Both default
//      off - the user's "learning is optional";
//   4. the absence test: the BUILT-IN pack (no layer at all) may be proposed
//      over, and so may a layer that carries no families (the learning-only
//      opt-in pack). A layer with families is an installed pack - never
//      proposed over;
//   5. the once-per-process reservation, then the derivation + write.
//
// Every no is `undefined` - no scan, no file, no note, no ledger line.
import { Builtin, Resolve, type Located, type Pack as Workspace } from "@playform/ets-lib-dsh-pack";

import type Learned from "../../Interface/Learned.js";
import Find from "./Find.js";
import Propose from "./Propose.js";
import Reserve from "./Reserve.js";

export default (
	/** The config's `learning` switch (the config wins when true). */
	Enabled: boolean,
	/** The workspace gate's answer (undefined: no workspace resolved). */
	Gate: Located | undefined,
	/** The call path the judged call names. */
	CallPath: string,
	/** The session cwd, when the harness service exposes one. */
	Cwd: string | undefined,
	/** The home the proposal hangs off (the user layer's parent). */
	Home: string,
): Learned | undefined => {
	const Root = Gate?.root ?? Find(CallPath, Cwd);
	if (Root === undefined) {
		return undefined;
	}
	const Resolved: Workspace = Gate?.pack ?? Resolve(Root, { home: Home });
	switch (true) {
		case !Enabled && Resolved.learning?.propose !== true:
			return undefined;
		case Resolved !== Builtin && Object.keys(Resolved.families ?? {}).length > 0:
			return undefined;
		case !Reserve(Root):
			return undefined;
		default:
			return Propose(Root, Home);
	}
};
