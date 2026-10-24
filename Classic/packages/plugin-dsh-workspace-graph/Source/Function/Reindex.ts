// Reindex - the DETACHED run behind the trace adapter's loop: index the
// observed file through the existing per-file entry (Function/Index, the gates
// included), ledger the byte-exact `reindexed <path> (<status>)` line with the
// status indexFile reported. The per-path in-flight bookkeeping belongs to the
// library's loop (the coalescing queue keyed by path) - this run never touches
// it, so a throw can never wedge a path as permanently pending.
//
// The path in the line is the OUTCOME's resolved display path, not the raw
// event path: the record is keyed by the resolved path, so the ledger and the
// store agree byte for byte.
//
// THE PROMISE NEVER REJECTS: the loop schedules this detached and Node
// terminates on an unhandled rejection - so the body is one try/catch and a
// defensive failure is ledgered with the module's existing `failed` line,
// never thrown into the bus.
import type State from "@Interface/State.js";

import Append from "./Append.js";
import IndexFile from "./Index.js";

export default async (StateRef: State, Path: string): Promise<void> => {
	try {
		const Outcome = await IndexFile(StateRef, Path);
		Append(StateRef, `reindexed ${Outcome.path} (${Outcome.status})`);
	} catch (Cause) {
		try {
			Append(
				StateRef,
				`failed ${Path} (${Cause instanceof Error ? Cause.message : String(Cause)})`,
			);
		} catch {
			/* even the failure ledger is best-effort */
		}
	}
};
