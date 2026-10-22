// Observe - the operate hook's fs/observed listener (Function/Observe),
// registered on the ROOT context through the factory's Wire. NOT a stamp
// recorder (that is the observe hook's role): this listener only maintains
// the hook's own fence tracker - path -> the latest heard version - which
// the staleness rule reads to refuse a proposal made against a version the
// workspace has already moved past.
//
// The discipline is the observe hook's: NO awaits, NO I/O, no file content
// is ever read, the listener NEVER THROWS, and the identity check ignores
// the hook's own actor. Silent by design - the ledger line for every
// observed write already comes from the observe hook; a second line would
// be noise.
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "@Interface/State.js";

export default (
	State: State,
	Target: FsTarget | undefined,
	Observation: FsObservation | undefined,
	Actor: object | undefined,
): void => {
	try {
		switch (true) {
			case Actor === State.Self:
				return;
			case typeof (Target as { displayPath?: unknown } | null)?.displayPath !== "string":
				return;
			default:
		}
		const Path = (Target as { displayPath: string }).displayPath;
		const Version =
			(Observation as { kind?: unknown } | null)?.kind === "present"
				? String((Observation as { version: unknown }).version)
				: "absent";
		State.Observed.set(Path, Version);
	} catch {
		/* the listener never throws */
	}
};
