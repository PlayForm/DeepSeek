// Invalidate - the fs/observed listener (Function/Invalidate): the
// SYNCHRONOUS RECORDER that keeps the exact-approval contract honest over
// time. When the file a binding covers is observed at a DIFFERENT version
// than the one bound in the approval, the candidate changed after the
// approval - the binding is invalidated (decision `invalidated`).
//
// The discipline, per the family contract:
//   * NO awaits, NO I/O on the listener path;
//   * an event whose `actor` is the hook's OWN actor object is ignored (the
//     identity check);
//   * a `present` observation with an unchanged version is a no-op (the
//     common case: nothing to invalidate);
//   * the listener NEVER THROWS: the whole body is one try/catch - a
//     malformed event is caught and ledgered as `failed <path> (<reason>)`.
import Record from "@Function/Record.js";
import type Binding from "@Interface/Binding.js";
import type State from "@Interface/State.js";

export default (
	State: State,
	Target: unknown,
	Observation: unknown,
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
			default:
		}
		switch (true) {
			case Actor === State.Self:
				return;
			default:
		}
		if ((Observation as { kind?: unknown } | null)?.kind !== "present") {
			return;
		}
		const Version = String((Observation as { version: unknown }).version);
		const Stale = State.Ring.filter(
			(Binding: Binding) =>
				Binding.path === Path &&
				Binding.version !== Version &&
				(Binding.decision === "pending" || Binding.decision === "approved"),
		);
		for (const Binding of Stale) {
			Binding.decision = "invalidated";
			State.Factory.Append(State, `invalidated ${Binding.id} (version changed)`);
			Record(State, Binding);
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
