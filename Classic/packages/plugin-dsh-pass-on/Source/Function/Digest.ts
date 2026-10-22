// Digest - the content-derived id and fence (plan section 2): sha256 over
// the targets (path + version) and the operations (find + replace). The
// ingester applies only the proposal whose digest still matches.
import { createHash as Hash } from "node:crypto";

import type Operation from "../Interface/Operation.js";
import type Target from "../Interface/Target.js";

export default (Targets: Target[], Operations: Omit<Operation, "path">[]): string =>
	Hash("sha256")
		.update(JSON.stringify({ targets: Targets, operations: Operations }))
		.digest("hex");
