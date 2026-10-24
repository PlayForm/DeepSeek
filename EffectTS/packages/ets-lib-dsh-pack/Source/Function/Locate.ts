// Locate - the workspace gate: which workspace root does this call belong
// to, and which pack governs it? The answer is the first ancestor directory
// (starting at the call path's directory, or its nearest existing ancestor)
// that is a workspace CANDIDATE (a repo layer, a user layer for its slug, or
// the default signature) AND whose resolved pack signature matches.
//
// A foreign workspace with a pack resolves (its pack declares its own
// signature); a foreign workspace without one resolves to undefined and the
// suggester abstains `foreign-workspace` - the honest silence (D2). The walk
// is the pre-pack resolver's walk, with the signature now read from the pack
// (default: Documentation/ARCHIVE-STYLE.md).
import { existsSync, statSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

import type Located from "../Interface/Located.js";
import type Options from "../Interface/Options.js";
import Home from "./Home.js";
import Load from "./Load.js";
import Present from "./Present.js";
import Signature from "./Signature.js";

/** The nearest existing ancestor of a path (the path itself when it exists). */
const Anchor = (Start: string): string => {
	let Current = Start;
	while (!existsSync(Current)) {
		const Parent = dirname(Current);
		if (Parent === Current) {
			return Current;
		}
		Current = Parent;
	}
	return Current;
};

/** The directory the upward walk starts from. */
const Begin = (Resolved: string): string => {
	const Stat = statSync(Resolved, { throwIfNoEntry: false });
	if (Stat === undefined) {
		return Anchor(Resolved);
	}
	return Stat.isDirectory() ? Resolved : dirname(Resolved);
};

export default (
	/** The call path (absolute or workspace-relative). */
	Path: string,
	/** The session cwd, when the harness service exposes one. */
	Cwd?: string,
	/** The resolution seam (a smoke's temporary home). */
	Options?: Options,
): Located | undefined => {
	const Home_ = Home(Options);
	const Resolved = isAbsolute(Path) ? Path : resolve(Cwd ?? process.cwd(), Path);
	let Current = Begin(Resolved);
	while (true) {
		if (Present(Current, Home_)) {
			const Pack = Load(Current, Options);
			if (Signature(Pack, Current)) {
				return { root: Current, pack: Pack };
			}
		}
		const Parent = dirname(Current);
		if (Parent === Current) {
			return undefined;
		}
		Current = Parent;
	}
};
