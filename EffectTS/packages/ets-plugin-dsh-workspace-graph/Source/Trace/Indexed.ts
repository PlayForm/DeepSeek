// Indexed - the `graph/indexed` draft: a record was stored (a new file or a
// replaced one). The payload carries the resolved display path, the record's
// version and the indexRevision the store reached.
import { Names, type Draft } from "@playform/ets-lib-dsh-trace";

export default (Path: string, Version: string, Revision: number): Draft => ({
	kind: Names.indexed,
	payload: { path: Path, version: Version, revision: Revision },
});
