import { createHash as Hash } from "node:crypto";

import type Operation from "../Interface/Operation.js";
import type Target from "../Interface/Target.js";

/**
 * @module Digest
 *
 * The content-derived id and fence: sha256 over the targets and the
 * operations.
 *
 * @remarks
 *
 * Plan section 2: the digest hashes the targets (path + version) and the
 * operations (find + replace). The ingester applies only the proposal whose
 * digest still matches.
 */
export default (Targets: Target[], Operations: Omit<Operation, "path">[]): string =>
	Hash("sha256")
		.update(JSON.stringify({ targets: Targets, operations: Operations }))
		.digest("hex");
