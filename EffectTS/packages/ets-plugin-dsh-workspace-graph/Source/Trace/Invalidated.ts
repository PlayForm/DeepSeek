// Invalidated - the `graph/invalidated` draft: the record the graph held for a
// path is no longer valid. Three reasons:
//
//   * "replaced" - a re-index replaced an existing record (the version the
//     previous record carried is included);
//   * "removed" - removeFile deleted the record;
//   * "absent" - the observation reported the file absent (the stale record
//     stays until removeFile, but the consumers must not trust it).
//
// The consumers (the context packet cache) drop what they cached for the path;
// no ledger line is added by this event (the module's strings stay byte-exact).
import { Names, type Draft } from "@playform/ets-lib-dsh-trace";

export default (Path: string, Reason: string, Version?: string): Draft => ({
	kind: Names.invalidated,
	payload: {
		path: Path,
		reason: Reason,
		...(Version === undefined ? {} : { version: Version }),
	},
});
