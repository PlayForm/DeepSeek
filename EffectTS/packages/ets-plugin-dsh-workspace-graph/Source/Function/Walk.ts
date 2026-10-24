// Walk - the deterministic directory walk behind `indexWorkspace`: a
// breadth-first descent from the resolved root that yields the CANDIDATE
// file display paths, in a stable order. The rules, in the frozen order:
//
//   1. every listing is sorted by entry name (the backend already returns a
//      stable order; sorting again makes the walk independent of it);
//   2. an entry the backend does not report as inside the root is NEVER
//      followed (`ctx.fs.contains` compares canonical target identities, so
//      a symlink pointing out of the root - or a `..` escape - is rejected
//      before anything is read). Such an entry is not a candidate and is not
//      counted as skipped: it was never part of the workspace;
//   3. a directory whose path matches an EXCLUDE pattern is not descended
//      (its files are never candidates - the walk bound, not a per-file
//      gate). Every candidate that IS yielded still passes indexFile's own
//      per-file gates (enabled, exclude, include, type, language, size);
//   4. the walk stops after `Maximum` candidates; `capped` reports that a
//      further candidate existed, so the caller can ledger the bound.
//
// A listing error BELOW the root is tolerated (an unreadable directory is
// skipped, never fatal); a listing error AT the root propagates, because a
// typo'd root must fail loud instead of reporting an honest-looking zero.
import type State from "@Interface/State.js";

import Glob from "./Glob.js";

/** The minimal structural view of one directory entry (ctx.fs.listDir). */
interface Entry {
	name: string;
	type: "file" | "directory" | "other";
	target: { targetKey: string; displayPath: string };
}

/** The minimal structural view of a resolved directory target. */
interface Target {
	targetKey: string;
	displayPath: string;
}

export default async (
	StateRef: State,
	Root: Target,
	Maximum: number,
): Promise<{ candidates: string[]; capped: boolean }> => {
	const Fs = (StateRef.Context as unknown as { fs: any }).fs;
	const Candidates: string[] = [];
	const Queue: Target[] = [{ targetKey: Root.targetKey, displayPath: Root.displayPath }];
	let Capped = false;
	let AtRoot = true;
	while (Queue.length > 0 && !Capped) {
		const Current = Queue.shift();
		if (Current === undefined) {
			break;
		}
		let Entries: Entry[];
		try {
			Entries = (await Fs.listDir(Current)) as Entry[];
		} catch (Cause) {
			if (AtRoot) {
				throw Cause;
			}
			continue;
		}
		AtRoot = false;
		Entries.sort((Left, Right) => Left.name.localeCompare(Right.name));
		for (const EntryItem of Entries) {
			if (!Fs.contains(Root, EntryItem.target)) {
				continue;
			}
			switch (true) {
				case EntryItem.type === "directory":
					if (
						StateRef.Config.exclude.some((Pattern) =>
							Glob(Pattern, `${EntryItem.target.displayPath}/`),
						)
					) {
						continue;
					}
					Queue.push({
						targetKey: EntryItem.target.targetKey,
						displayPath: EntryItem.target.displayPath,
					});
					continue;
				case EntryItem.type !== "file":
					continue;
				case Candidates.length >= Maximum:
					Capped = true;
					break;
				default:
					Candidates.push(EntryItem.target.displayPath);
			}
			if (Capped) {
				break;
			}
		}
	}
	return { candidates: Candidates, capped: Capped };
};
