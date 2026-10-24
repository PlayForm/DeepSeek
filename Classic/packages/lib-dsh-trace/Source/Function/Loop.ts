// Loop - the detached-loop helper (the "daemon trace"): a coalescing queue
// keyed by path, ONE in-flight task per key, no timers in the hot path,
// fail-open, and a Flush promise for deterministic smokes.
//
//   * Schedule(key) starts Run(key) when no task for that key is in flight and
//     DROPS the schedule otherwise - a coalesced pair produces ONE run;
//   * Run's rejection is swallowed (fail-open): the loop never rejects and
//     never throws into the caller (the caller is a synchronous listener);
//   * Flush is the promise of every task currently in flight; a smoke awaits
//     it instead of sleeping. It re-checks until the in-flight set is empty,
//     so a run that schedules further work still settles before Flush
//     resolves;
//   * Dispose stops future scheduling and clears the queue; an in-flight task
//     is allowed to finish (a running re-index is never torn mid-write).
//
// No setTimeout, no interval, no wall clock: the loop is a microtask chain the
// caller can await.
import type Queue from "@Interface/Queue.js";

export default (Run: (Key: string) => Promise<void> | void): Queue => {
	const Inflight = new Map<string, Promise<void>>();
	let Disposed = false;
	const Flush = async (): Promise<void> => {
		while (Inflight.size > 0) {
			await Promise.all([...Inflight.values()]);
		}
	};
	const Schedule = (Key: string): void => {
		switch (true) {
			case Disposed:
			case Inflight.has(Key):
				return;
			default:
		}
		const Task = (async (): Promise<void> => {
			try {
				await Run(Key);
			} catch {
				/* fail-open: a failed run never rejects the loop */
			} finally {
				Inflight.delete(Key);
			}
		})();
		Inflight.set(Key, Task);
	};
	const Dispose = (): void => {
		Disposed = true;
		Inflight.clear();
	};
	return {
		Schedule,
		get Flush(): Promise<void> {
			return Flush();
		},
		Dispose,
	};
};
