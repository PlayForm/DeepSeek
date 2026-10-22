// Sweep - the sweep form (Function/Sweep): the CLOCK-BASED SCHEDULE. The
// sweep is a deadline scan over the watch map, run inside the event-driven
// checkpoints (every fs/observed event calls it from Function/Watch; nothing
// else ever calls it) - there is NO setTimeout and NO setInterval anywhere in
// the module: the next event is the bound, exactly the live-containers
// monitor precedent ("no real timers, the event-driven deadlines").
//
// An entry whose `nextSweepAt` deadline has passed on the Clock is swept: it
// gets one `sweep <path> (<age>ms)` ledger line, its `lastSweepAt` stamp and
// `sweeps` counter advance, and its next deadline is recomputed as
// `now + sweepIntervalMs` (0 sweeps at every checkpoint). The pass itself
// counts once (`LastSweepAt`, `Sweeps`) only when at least one entry was due,
// so an all-quiet tree costs one Clock read and a loop - the quiet-ledger
// discipline.
import Clock from "@Function/Clock.js";
import type State from "@Interface/State.js";

export default (State: State): void => {
	const Now = Clock(State);
	let Swept = 0;
	for (const [Path, Entry] of [...State.Watch]) {
		switch (true) {
			case Now < Entry.nextSweepAt:
				continue;
			default:
		}
		const Age = Now - Entry.lastEventAt;
		Entry.lastSweepAt = Now;
		Entry.sweeps += 1;
		Entry.nextSweepAt = Now + State.SweepIntervalMs;
		// Re-insert at the tail so the map head stays the oldest.
		State.Watch.delete(Path);
		State.Watch.set(Path, Entry);
		State.Factory.Append(State, `sweep ${Path} (${Age}ms)`);
		Swept += 1;
	}
	switch (true) {
		case Swept === 0:
			break;
		default:
			State.Sweeps += 1;
			State.LastSweepAt = Now;
	}
};
