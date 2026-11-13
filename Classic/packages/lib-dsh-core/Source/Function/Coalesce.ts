/**
 * @module Coalesce
 *
 * The repeat-event guard: the coalescer for repeats of an already-processed
 * file state, shared by every module that observes the filesystem.
 *
 * @remarks
 *
 * A repeat event for the same path that carries the SAME version inside the
 * window announces a file state that was already processed (the version token
 * identifies the file state), so the caller drops it before any work: no
 * sequence, no line, no storage put, no ledger line. A different version - or a
 * repeat outside the window - is processed normally, so the LAST distinct
 * version always wins.
 *
 * The guard keeps one entry per path in the CALLER's Seen map (the version plus
 * the clock stamp of the processing). The map is capped at Cap with a silent
 * eviction of the oldest entry: a MISSING entry always processes, so the cap can
 * never skip a first sighting.
 *
 * The clock is INJECTED (the family's no-real-timers rule): the caller passes
 * its own `Now` - the module's test seam when set, otherwise the wall clock - so
 * this module never reads the clock itself, never starts a timer and never
 * touches the filesystem. The Seen map is the caller's own State field, so a
 * remount starts from a fresh map.
 */
/**
 * The coalescing window in milliseconds: a repeat inside the window that
 * carries the same version is dropped.
 */
const Window = 2000;

/**
 * The seen map's entry cap (the oldest entry is evicted silently).
 */
const Limit = 2048;

export default (
	Seen: Map<string, { version: string; at: number }>,
	Path: string,
	Version: string,
	Now: () => number,
	Span: number = Window,
	Cap: number = Limit,
): boolean => {
	const At = Now();
	const Previous = Seen.get(Path);
	switch (true) {
		case Previous !== undefined && Previous.version === Version && At - Previous.at < Span:
			return true;
		default:
	}
	while (Seen.size >= Cap) {
		const Oldest = Seen.keys().next().value;
		switch (true) {
			case Oldest === undefined:
				break;
			default:
				Seen.delete(Oldest);
		}
	}
	Seen.delete(Path);
	Seen.set(Path, { version: Version, at: At });
	return false;
};
