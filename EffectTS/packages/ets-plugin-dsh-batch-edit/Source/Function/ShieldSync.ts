// ShieldSync - the clock shield around the factory's synchronous ledger
// seam (the Shield counterpart for code without an await point).
//
// The factory's Append runs a spanned Effect whose tracer samples the global
// Date.now internally; those INTERNAL samples must not consume the caller's
// deadline budget (the commit deadline counts only the plugin's own wall
// clock reads). The shield temporarily reinstates the wall clock captured at
// module load - a no-op in production (the captured reference IS the real
// clock) - and because the guarded body is fully synchronous, no other task
// can run between the save and the restore, which makes the swap provably
// invisible to the rest of the runtime.
const WallClock = Date.now;

export default <T>(Work: () => T): T => {
	const Current = Date.now;
	Date.now = WallClock;
	try {
		return Work();
	} finally {
		Date.now = Current;
	}
};
