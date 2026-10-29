// Metric - one row of a reading: the metric's name, the key it was computed
// over (a file path, a session id, a project root), the value with its unit
// (USD, lines, ratio, tokens), and the note that carries the formula or the
// caveat a reader needs to argue about the number.
export default interface Metric {
	readonly Metric: string;
	readonly Key: string;
	readonly Value: number;
	readonly Unit: string;
	readonly Note: string;
}
