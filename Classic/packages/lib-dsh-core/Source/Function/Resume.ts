/**
 * @module Resume
 *
 * The monotonic resume: the recovery rule for a sequence or revision counter.
 *
 * @remarks
 *
 * A counter restored from storage must never move backwards: the module's own
 * in-memory value is the floor, and a recovered value only raises it. The
 * packages' recovery clauses re-derived that rule by hand over five different
 * sources - a stamp ring, a binding map, two meta records and a by-id map - so
 * a new storage shape had to remember the comparison. This helper owns it.
 *
 * The caller keeps its own recovery source and its own expression; the helper
 * only decides which of the two numbers wins.
 *
 * Pure: two numbers in, one number out.
 */
export default (Current: number, Recovered: number): number =>
	Recovered > Current ? Recovered : Current;
