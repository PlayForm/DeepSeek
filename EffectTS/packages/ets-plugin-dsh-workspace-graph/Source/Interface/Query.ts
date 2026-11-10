import type { NodeKind } from "@Interface/Node.js";

/**
 * @module Query
 *
 * The find() query, per the brief's section 4.3 FindQuery.
 *
 * @remarks
 *
 * `name` is an exact match on the node's name; `pattern` is a
 * case-insensitive substring over the node's id and name; `kind` filters the
 * node kind; `limit` is clamped to [0, limitMaximum] with limitDefault as the
 * unset default.
 */
export default interface Query {
	/**
	 * The exact node-name match.
	 */
	name?: string;

	/**
	 * The case-insensitive substring over the node's id and name.
	 */
	pattern?: string;

	/**
	 * The node-kind filter.
	 */
	kind?: NodeKind;

	/**
	 * The result-limit clamp, defaulting to limitDefault.
	 */
	limit?: number;
}
