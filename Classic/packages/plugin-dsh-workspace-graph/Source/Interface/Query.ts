// Query - the find() query (the brief's section 4.3 FindQuery). `name` is an
// exact match on the node's name; `pattern` is a case-insensitive substring
// over the node's id and name; `kind` filters the node kind; `limit` is
// clamped to [0, limitMaximum] with limitDefault as the unset default.
import type { NodeKind } from "@Interface/Node.js";

export default interface Query {
	name?: string;
	pattern?: string;
	kind?: NodeKind;
	limit?: number;
}
