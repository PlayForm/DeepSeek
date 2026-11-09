/**
 * @module Query
 *
 * The find() query (the brief's section 4.3 FindQuery).
 *
 * @remarks
 * `name` is an exact match on the node's name; `pattern` is a case-insensitive substring over
 * the node's id and name; `kind` filters the node kind; `limit` is clamped to
 * [0, limitMaximum] with limitDefault as the unset default.
 */
import type { NodeKind } from "./Node.js";
export default interface Query {
    /** The exact node name to match. */
    name?: string;
    /** The case-insensitive substring to match against the id and the name. */
    pattern?: string;
    /** The node kind to keep. */
    kind?: NodeKind;
    /** The maximum number of results, clamped to [0, limitMaximum]. */
    limit?: number;
}
