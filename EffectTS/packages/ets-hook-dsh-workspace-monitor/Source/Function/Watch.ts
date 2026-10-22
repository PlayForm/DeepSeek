// Watch - the fs/observed listener (Function/Watch): the SYNCHRONOUS
// RECORDER. Registered on the ROOT context through the factory's Wire (the
// exact `Context.root.on("fs/observed", ...)` posture). The watch form of
// the monitor role: the listener records the observation into the watch map
// with a debounce deadline computed from the module's Clock, and then runs
// the sweep's deadline scan (the event IS the checkpoint - no real timers).
//
//   * NO awaits and NO subprocess work on the listener path; the ledger
//     Append rides the family's synchronous Append (logger + appendFileSync);
//   * the guard chain, in order:
//       1. an event whose `actor` is the hook's OWN actor object is ignored
//          (the identity check) - ledger `ignored <path> (own actor)`;
//       2. a path matching config `exclude` is ignored - ledger
//          `ignored <path> (excluded)`;
//       3. a non-empty config `include` that the path does not match is
//          ignored - ledger `ignored <path> (not included)`;
//   * a present observation records the event's version verbatim; an absent
//     observation records version "absent" (honest, never a fabricated
//     version);
//   * the listener NEVER THROWS: the whole body is one try/catch - a
//     malformed event is caught and ledgered as `failed <path> (<reason>)`.
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Classify from "@Function/Classify.js";
import Clock from "@Function/Clock.js";
import Sweep from "@Function/Sweep.js";
import type State from "@Interface/State.js";
import type WatchEntry from "@Interface/WatchEntry.js";

export default (
	State: State,
	Target: FsTarget | undefined,
	Observation: FsObservation | undefined,
	Actor: object | undefined,
): void => {
	// The path is read defensively BEFORE the guarded body so even a malformed
	// event can be ledgered with whatever identity it carried.
	const Path =
		typeof (Target as { displayPath?: unknown } | null)?.displayPath === "string"
			? (Target as { displayPath: string }).displayPath
			: "unknown";
	try {
		switch (true) {
			case typeof (Target as { displayPath?: unknown } | null)?.displayPath !== "string":
				throw new Error("malformed event: displayPath is not a string");
			default:
		}
		const Version =
			(Observation as { kind?: unknown } | null)?.kind === "present"
				? String((Observation as { version: unknown }).version)
				: "absent";
		switch (true) {
			case Actor === State.Self:
				State.Factory.Append(State, `ignored ${Path} (own actor)`);
				return;
			case State.Factory.Match(Path, State.List):
				State.Factory.Append(State, `ignored ${Path} (excluded)`);
				return;
			case State.Include.length > 0 && !State.Factory.Match(Path, State.Include):
				State.Factory.Append(State, `ignored ${Path} (not included)`);
				return;
			default:
		}
		const Now = Clock(State);
		const Sets = Classify(Path, State.CheckSets);
		const Existing = State.Watch.get(Path);
		// The previous version must be read BEFORE the overwrite below: when
		// an entry exists, `Entry` IS the stored object, and writing
		// `Entry.version` first would make the change check always equal.
		const Previous = Existing?.version;
		const Entry: WatchEntry = Existing ?? {
			path: Path,
			version: Version,
			sets: Sets,
			lastEventAt: Now,
			lastSweepAt: undefined,
			nextSweepAt: Now + State.DebounceMs,
			sweeps: 0,
			versions: 0,
		};
		Entry.version = Version;
		Entry.sets = Sets;
		Entry.lastEventAt = Now;
		Entry.nextSweepAt = Now + State.DebounceMs;
		switch (true) {
			case Previous !== Version:
				Entry.versions += 1;
				break;
			default:
		}
		State.Watch.delete(Path);
		State.Watch.set(Path, Entry);
		State.Events += 1;
		State.Factory.Append(
			State,
			`watch ${Path} version ${Version} (${Sets.join(",") || "none"})`,
		);
		// The watch bound: drop the OLDEST entry (the map head) when over.
		while (State.Watch.size > State.MaxWatch) {
			const Oldest = State.Watch.keys().next().value;
			switch (true) {
				case Oldest === undefined:
					break;
				default:
					State.Watch.delete(Oldest);
					State.Factory.Append(State, `capped ${Oldest} (maxWatch ${State.MaxWatch})`);
			}
		}
		// The sweep's deadline scan: this event is the checkpoint.
		Sweep(State);
	} catch (Cause) {
		try {
			State.Factory.Append(
				State,
				`failed ${Path} (${Cause instanceof Error ? Cause.message : String(Cause)})`,
			);
		} catch {
			/* even the failure ledger is best-effort */
		}
	}
};
