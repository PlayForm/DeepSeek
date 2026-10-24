// Workspace - the `indexWorkspace` body, the INDEXING TRIGGER the family was
// missing: resolve the root through ctx.fs.resolve (the caller's path, else
// "." - the backend's own cwd, the session working directory), walk the tree
// deterministically (Function/Walk), and index every candidate by simply
// calling the EXISTING per-file entry (Function/Index) - the gates are never
// duplicated here: enabled, exclude, include, file type, language and size
// all stay indexFile's. The counts are the per-file outcome tallies of this
// run plus the file records the graph holds afterwards.
//
// The bound: `options.maxFiles`, else Config.maxFiles. When the walk stops at
// the bound it ledgers the byte-exact `workspace capped at <n> files` line,
// so a truncated index is never silent. Every run closes with the byte-exact
// summary line `workspace indexed <n> files (<indexed> indexed, <skipped>
// skipped, <failed> failed)`.
//
// A root that cannot be listed propagates the fs error to the caller (the
// tool reports it); a failure BELOW the root is not fatal (Function/Walk).
import type IndexSummary from "@Interface/IndexSummary.js";
import type State from "@Interface/State.js";

import Append from "./Append.js";
import IndexFile from "./Index.js";
import Walk from "./Walk.js";

export default async (
	StateRef: State,
	Root?: string,
	Options?: { maxFiles?: number },
): Promise<IndexSummary> => {
	const Fs = (StateRef.Context as unknown as { fs: any }).fs;
	const Start = (await Fs.resolve(Root ?? ".")) as {
		targetKey: string;
		displayPath: string;
	};
	// The bound: a finite option >= 0 is honored (0 = index nothing); an
	// absent, negative or non-finite option falls back to the config, so the
	// walk can never run unbounded on a NaN.
	const Requested = Options?.maxFiles;
	const Maximum =
		typeof Requested === "number" && Number.isFinite(Requested) && Requested >= 0
			? Math.floor(Requested)
			: StateRef.Config.maxFiles;
	const Walked = await Walk(StateRef, Start, Maximum);
	let Indexed = 0;
	let Skipped = 0;
	let Failed = 0;
	for (const Path of Walked.candidates) {
		const Outcome = await IndexFile(StateRef, Path);
		switch (Outcome.status) {
			case "indexed":
				Indexed += 1;
				break;
			case "skipped":
				Skipped += 1;
				break;
			default:
				Failed += 1;
		}
	}
	if (Walked.capped) {
		Append(StateRef, `workspace capped at ${Maximum} files`);
	}
	Append(
		StateRef,
		`workspace indexed ${Walked.candidates.length} files (${Indexed} indexed, ${Skipped} skipped, ${Failed} failed)`,
	);
	return {
		indexed: Indexed,
		skipped: Skipped,
		failed: Failed,
		files: StateRef.Records.size,
	};
};
