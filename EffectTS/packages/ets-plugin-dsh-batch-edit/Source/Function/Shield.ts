// Shield - the clock shield around the factory's awaited Effect seams.
//
// The ETS factory's service seams (Write, Govern) each run a spanned Effect
// whose tracer samples the global Date.now internally (span start + span
// end). Those INTERNAL samples must not consume the caller's deadline
// budget: the commit deadline counts only the plugin's own wall clock reads
// (StartedAt and the per-file scan), everything the machinery samples in
// between is bookkeeping, not elapsed work time. The shield temporarily
// reinstates the wall clock captured at module load - a no-op in production
// (the captured reference IS the real clock) and it only changes behavior
// while a test harness has swapped the global with a counting mock. The
// restore runs in a finally, so a mock swapped mid-await is picked up again.
//
// The sync counterpart (the ledger append seam) lives in ShieldSync.ts: with
// no await point no other task can run between the save and the restore,
// which makes the sync swap provably invisible to the rest of the runtime.
const WallClock = Date.now;

export default async <T>(Work: () => Promise<T>): Promise<T> => {
	const Current = Date.now;
	Date.now = WallClock;
	try {
		return await Work();
	} finally {
		Date.now = Current;
	}
};
