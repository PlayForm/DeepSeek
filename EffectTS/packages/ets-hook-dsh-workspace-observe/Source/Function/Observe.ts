// Observe - the fs/observed listener (Function/Observe): the SYNCHRONOUS
// RECORDER. Registered on the ROOT context through the factory's Wire (the
// exact `Context.root.on("fs/observed", ...)` registration, Function/Wire.ts
// of the factory - root registration is the posture that hears ALL
// fs/observed emissions). The discipline, per the frozen contract:
//
//   * NO awaits, NO I/O on the listener path, and NO file content is ever
//     read - the event already carries the version token;
//   * the sequence is the plugin's own monotonic counter
//     (`State.Sequence`), never a wall clock;
//   * the guard chain, in order:
//       1. an event whose `actor` is the hook's OWN actor object is ignored
//          (the identity check) - ledger `ignored <path> (own actor)`;
//       2. a path matching config `exclude` is ignored - ledger
//          `ignored <path> (excluded)`;
//       3. a non-empty config `include` that the path does not match is
//          ignored - ledger `ignored <path> (not included)`;
//       4. a REPEAT event - the same path carrying the same version within
//          the coalescing window (Function/Duplicate) - is dropped silently:
//          that file state was already recorded, and the last distinct
//          version always wins;
//   * a present observation records the event's version verbatim; an absent
//     observation records version "absent" (honest, never a fabricated
//     version);
//   * the listener NEVER THROWS: the whole body is one try/catch - a
//     malformed event is caught and ledgered as `failed <path> (<reason>)`
//     (the logger line rides the same Append).
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Duplicate from "@Function/Duplicate.js";
import Match from "@Function/Match.js";
import Record from "@Function/Record.js";
import type State from "@Interface/State.js";

export default (
	State: State,
	Target: FsTarget | undefined,
	Observation: FsObservation | undefined,
	Actor: object | undefined,
): void => {
	// The path is read defensively BEFORE the guarded body so even a malformed
	// event can be ledgered with whatever identity it carried; a missing
	// displayPath is a MALFORMED event: it throws into the guarded body and
	// is caught below (a stamp with a made-up path is never recorded).
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
			case Match(Path, State.List):
				State.Factory.Append(State, `ignored ${Path} (excluded)`);
				return;
			case State.Include.length > 0 && !Match(Path, State.Include):
				State.Factory.Append(State, `ignored ${Path} (not included)`);
				return;
			default:
		}
		switch (true) {
			case Duplicate(State, Path, Version):
				return;
			default:
		}
		State.Sequence += 1;
		State.Factory.Append(State, `stamped ${Path} version ${Version} (fs/observed)`);
		// The record write happens AFTER the ledger line: the line is the
		// proof, the stamp is the state (the ring cap runs inside the record
		// module - the capped line is the drop's ledger, byte-exact).
		Record(State, {
			path: Path,
			version: Version,
			origin: "fs/observed",
			sequence: State.Sequence,
		});
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
