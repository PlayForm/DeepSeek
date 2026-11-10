// Metric - one row of a reading: the metric's name, the key it was computed
// over (a file path, a session id, a project root), the value with its unit
// (USD, lines, ratio, tokens), and the note that carries the formula or the
// caveat a reader needs to argue about the number.
/**
 * @module Metric
 *
 * One row of a reading: the metric's name, the key it was computed over (a
 * file path, a session id, a project root), the value with its unit (USD,
 * lines, ratio, tokens), and the note that carries the formula or the
 * caveat a reader needs to argue about the number.
 */

/**
 * One metric row of a reading.
 */
export default interface Metric {
	/**
	 * The metric's name.
	 */
	readonly Metric: string;

	/**
	 * The key it was computed over (a file path, a session id, a project
	 * root).
	 */
	readonly Key: string;

	/**
	 * The value.
	 */
	readonly Value: number;

	/**
	 * The unit (USD, lines, ratio, tokens).
	 */
	readonly Unit: string;

	/**
	 * The note that carries the formula or the caveat a reader needs to
	 * argue about the number.
	 */
	readonly Note: string;
}
