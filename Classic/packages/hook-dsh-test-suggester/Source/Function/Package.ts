// Package - the package root of a call: the nearest ancestor of the RESOLVED
// call path that carries `package.json`, at or below the workspace root. The
// embedded packs mix three path bases (repo-relative, package-relative,
// sibling-relative), so the existence filter and the reconciliation both need
// this answer before they can read anything.
//
// The walk starts at the call path's directory (or its nearest existing
// ancestor: a judged call often names a file that does not exist yet) and
// stops AT the workspace root - a package above the root is a different
// workspace's business. `undefined` means the call is not inside a package;
// the existence filter then checks the repo base only, and the reconciliation
// stays silent (there is no smoke tree to reconcile).
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

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
	/** The resolved call path (absolute). */
	Resolved: string,
	/** The resolved workspace root (the walk's floor). */
	Root: string,
): string | undefined => {
	let Current = Begin(Resolved);
	while (true) {
		if (existsSync(join(Current, "package.json"))) {
			return Current;
		}
		if (Current === Root) {
			return undefined;
		}
		const Parent = dirname(Current);
		if (Parent === Current) {
			return undefined;
		}
		Current = Parent;
	}
};
