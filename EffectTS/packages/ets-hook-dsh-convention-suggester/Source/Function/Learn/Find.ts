// Find - the learner's own root anchor, used ONLY when the workspace gate
// found nothing (`Locate` returned undefined: a repo with no pack layer and
// no marker from the pack signature). The gate cannot see such a repo - it is
// not a workspace candidate yet - but the learner must, or the bootstrap
// could never propose the FIRST pack for it.
//
// The walk mirrors the gate's: start at the call path's directory (or its
// nearest existing ancestor) and walk UP; the first ancestor carrying a doc
// or package anchor is the root. Three anchors, not the full marker table:
// this runs on the hot path and only needs a root, while the derivation's
// own scan (Function/Learn/Scan) decides the families.
//
// No anchor anywhere -> undefined -> no proposal (the honest silence for a
// call outside any repo).
import { existsSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

/** The root anchors: the doc graph's index/style, or the package manifest. */
const Anchors = ["Documentation/INDEX.md", "Documentation/ARCHIVE-STYLE.md", "package.json"];

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

export default (Path: string, Cwd?: string): string | undefined => {
	const Resolved = isAbsolute(Path) ? Path : resolve(Cwd ?? process.cwd(), Path);
	let Current = Begin(Resolved);
	while (true) {
		if (Anchors.some((Marker) => existsSync(join(Current, Marker)))) {
			return Current;
		}
		const Parent = dirname(Current);
		if (Parent === Current) {
			return undefined;
		}
		Current = Parent;
	}
};
