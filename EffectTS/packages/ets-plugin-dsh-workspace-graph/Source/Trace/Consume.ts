// Consume - the graph's trace consumer: the INCREMENTAL wiring that keeps a
// populated graph current, now driven by the family's bus instead of a direct
// `ctx.root.on("fs/observed")` registration (D5). It consumes `observe/stamp`
// and applies the same filter chain the fs/observed listener applied:
//
//   * a disabled graph (enabled=false) does nothing - the IDLE-forever
//     posture (the adapter is not even wired when disabled);
//   * a foreign envelope or a malformed payload is caught and ledgered with
//     the module's existing `failed <path> (<reason>)` line;
//   * a path matching an EXCLUDE pattern is ignored before any work;
//   * an ABSENT stamp (version "absent") has no file to index: the stale
//     record stays until removeFile, but the graph tells the consumers the
//     path's record is no longer trustworthy (`graph/invalidated`, reason
//     "absent") - never a guessed re-index;
//   * every accepted stamp is coalesced into the detached loop keyed by the
//     library's coalescing key (the payload's path): N rapid stamps for one
//     path produce ONE re-index, no timer, and `State.Flush` is the loop's
//     flush promise so a smoke can await it deterministically.
//
// Only a real re-index ledgers a line, and that line is the re-index's own
// (`reindexed <path> (<status>)`).
import Append from "@Function/Append.js";
import Glob from "@Function/Glob.js";
import type State from "@Interface/State.js";
import { Key, type Envelope } from "@playform/ets-lib-dsh-trace";

import Contract from "./Contract.js";
import Emit from "./Emit.js";
import Invalidated from "./Invalidated.js";

export default (StateRef: State, Envelope: Envelope): void => {
	const Stamp = Contract(Envelope);
	const Path = Stamp?.path ?? "unknown";
	try {
		switch (true) {
			case StateRef.Config.enabled === false:
				return;
			case Stamp === undefined:
				throw new Error("malformed event: displayPath is not a string");
			case StateRef.Config.exclude.some((Pattern) => Glob(Pattern, Path)):
				return;
			case Stamp?.version === "absent":
				Emit(StateRef, Invalidated(Path, "absent"));
				return;
			default:
		}
		StateRef.Loop?.Schedule(Key(Envelope));
		StateRef.Flush = StateRef.Loop?.Flush ?? Promise.resolve();
	} catch (Cause) {
		try {
			Append(
				StateRef,
				`failed ${Path} (${Cause instanceof Error ? Cause.message : String(Cause)})`,
			);
		} catch {
			/* even the failure ledger is best-effort */
		}
	}
};
