// Watch - the fs/observed listener (Function/Watch): the invalidation seam.
// Registered on the ROOT context through the factory's Wire (the exact
// `Context.root.on("fs/observed", ...)` registration, the factory's
// Function/Wire.ts - root registration is the posture that hears ALL
// fs/observed emissions). The discipline, per the observe hook's frozen
// contract:
//
//   * NO awaits and NO file content is ever read - the event already
//     carries the version token; the listener only INVALIDATES;
//   * the sequence is the service's own monotonic counter, never a wall
//     clock (the listener advances it only through the invalidation writes);
//   * the guard chain, in order:
//       1. an event whose `actor` is the service's OWN actor object is
//          ignored - ledger `ignored <path> (own actor)`;
//       2. a path matching config `exclude` is ignored - ledger
//          `ignored <path> (excluded)`;
//       3. an absent observation does not invalidate (a missing file is
//          not a dependency change) - ledger
//          `ignored <path> (absent observation)`;
//       4. a REPEAT event - the same path carrying the same version within
//          the coalescing window (Function/Duplicate) - is dropped silently:
//          the invalidation for that file state already ran, and any
//          validation created since is fresh against the same state;
//   * a present observation invalidates with the path as the key - the
//     Function/Invalidate pass marks every dependent validation stale;
//   * the listener NEVER THROWS: the whole body is one try/catch - a
//     malformed event is caught and ledgered as `failed <path> (<reason>)`.
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Duplicate from "@Function/Duplicate.js";
import Invalidate from "@Function/Invalidate.js";
import type State from "@Interface/State.js";

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
		const Present = (Observation as { kind?: unknown } | null)?.kind === "present";
		switch (true) {
			case Actor === State.Self:
				State.Factory.Append(State, `ignored ${Path} (own actor)`);
				return;
			case State.Factory.Match(Path, State.List):
				State.Factory.Append(State, `ignored ${Path} (excluded)`);
				return;
			case !Present:
				State.Factory.Append(State, `ignored ${Path} (absent observation)`);
				return;
			default:
		}
		const Version =
			Present === true ? String((Observation as { version: unknown }).version) : "absent";
		switch (true) {
			case Duplicate(State, Path, Version):
				return;
			default:
		}
		Invalidate(State, Path);
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
