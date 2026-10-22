// Observe - the fs/observed listener (Function/Observe): the SYNCHRONOUS
// RECORDER. Registered on the ROOT context through the factory's Wire.
// Discipline: NO awaits, NO I/O, NO throws, no file content ever read.
//
// Every observed write is an OutcomeEvidence line (the traceability
// graph's outcome node): the operation is the path, the parent is the
// actor's tag when the event carries one (the recursion-prevention law:
// every event carries the operation identifier, the parent identifier,
// and the event category), the category is "outcome-evidence", the
// outcome is "success" for a present observation and "failure" for an
// absent one (an observed absence of a previously-present path is the
// deletion evidence).
//
// Guard chain: own actor → excluded → non-empty include. A malformed
// event is caught and ledgered "failed <path> (<reason>)".
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import Write from "@Function/Write.js";
import type State from "@Interface/State.js";

export default (
	State: State,
	Target: FsTarget | undefined,
	Observation: FsObservation | undefined,
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
		const Present = (Observation as { kind?: unknown } | null)?.kind === "present";
		// NOTE: no sequence increment here - Write (Function/Write) is the
		// ONE path every line takes and the only owner of the monotonic
		// counter; a second increment here skipped every other sequence
		// number (a2, a4, ...).
		// The parent pointer: the actor's tag when the event carries one,
		// "" otherwise (top of the chain).
		const Parent =
			typeof (Actor as { tag?: unknown } | null)?.tag === "string"
				? String((Actor as { tag: string }).tag)
				: "";
		Write(State, {
			operation: Path,
			parent: Parent,
			category: "outcome-evidence",
			path: Path,
			outcome: Present ? "success" : "failure",
			assessment: "",
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
