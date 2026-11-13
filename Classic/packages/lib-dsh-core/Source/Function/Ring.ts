/**
 * @module Ring
 *
 * The bounded ring: append one entry to the caller's array and drop the oldest
 * entries until the cap is honoured.
 *
 * @remarks
 *
 * The ring is the family's bounded-collection machine: every module that keeps
 * a recent set (stamps, bindings, audit lines, batches, watches) pushes one
 * entry per event and drops from the FRONT when the cap is exceeded, so the
 * array always holds the newest `Cap` entries and the oldest one is the one the
 * module ledgers.
 *
 * The array is the CALLER's State field, so the machine is born and dies with
 * the mount. The cap is read at call time (a volatile config field may change
 * between events), which is why the loop runs until the bound holds rather than
 * dropping once: a cap that shrank by five drops five and returns the last one
 * dropped, which is the entry the module's one `capped` line names.
 *
 * Pure: no I/O, no clock, no allocation beyond the caller's own array.
 */
export default <T>(Entries: T[], Entry: T, Cap: number): T | undefined => {
	Entries.push(Entry);
	let Dropped: T | undefined;
	while (Entries.length > Cap) {
		Dropped = Entries.shift();
	}
	return Dropped;
};
