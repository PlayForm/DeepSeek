// Observe - the fs/observed listener (Function/Observe): the SYNCHRONOUS
// RECORDER. Registered on the ROOT context through the factory's Wire (the
// exact `Context.root.on("fs/observed", ...)` registration). Discipline:
// NO awaits, NO I/O, NO throws, no file content ever read.
//
// The listener is the RECOVERY CHECKPOINT: a write observed on a path that
// belongs to a batch still in the `applying` state bumps that batch's
// progress counter (how far the crash got, persisted as an updated batch
// record) and ledger lines "observed <path> in <batchId> (progress <n>)".
// Events outside any open batch are not the journal's concern (the observe
// hook owns those stamps) - they are silently passed through, no line.
//
// Guard chain: own actor → excluded. A malformed event is caught and
// ledgered "failed <path> (<reason>)" (never thrown into the emitter).
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Record from "@Function/Record.js";
import type State from "@Interface/State.js";

export default (
	State: State,
	Target: FsTarget | undefined,
	_Observation: FsObservation | undefined,
	Actor: object | undefined,
): void => {
	const Path =
		typeof (Target as { displayPath?: unknown } | null)?.displayPath === "string"
			? (Target as { displayPath: string }).displayPath
			: "unknown";
	try {
		switch (true) {
			case typeof (Target as { displayPath?: unknown } | null)?.displayPath !== "string":
				throw new Error("malformed event: displayPath is not a string");
			case Actor === State.Self:
				State.Factory.Append(State, `ignored ${Path} (own actor)`);
				return;
			case State.Factory.Match(Path, State.List):
				State.Factory.Append(State, `ignored ${Path} (excluded)`);
				return;
			default:
		}
		// The recovery checkpoint: only a batch still in `applying` counts.
		for (const Batch of State.Batches.values()) {
			if (Batch.state !== "applying") {
				continue;
			}
			if (!Batch.files.includes(Path)) {
				continue;
			}
			Batch.progress += 1;
			State.Factory.Append(
				State,
				`observed ${Path} in ${Batch.batchId} (progress ${Batch.progress})`,
			);
			void Record(State, Batch);
		}
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
