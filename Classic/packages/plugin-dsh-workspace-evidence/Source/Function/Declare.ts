// Declare - the validation recorder (Function/Declare), the service's
// validate(): one claim becomes one validation object with its truth kind,
// its honest verdict (the service records what the caller asserted - it
// never invents a verdict), its declared dependencies, and a fresh status.
// A revalidation of the same id SUPERSEDES the previous object (never
// resurrected to fresh implicitly; the new object is the only fresh one).
// The store cap: when the store exceeds `maxValidations`, the oldest objects
// by sequence drop first (the observe ring's cap pattern). The sequence is
// the service's own monotonic counter - never a wall clock.
import type State from "@Interface/State.js";
import type { TruthKind } from "@Interface/TruthKind.js";
import type Validation from "@Interface/Validation.js";

/** The four kinds of truth (the Representation-First taxonomy). */
const Kinds: readonly string[] = ["reality", "observation", "representation", "intent"];

export default (
	State: State,
	Id: string,
	Kind: TruthKind,
	Subject: string,
	Dependencies: string[],
	Verdict: "verified" | "unverified",
): Validation => {
	switch (true) {
		case !State.On:
			throw new Error("evidence: service is disabled (enabled=false)");
		case typeof Id !== "string" || Id.length === 0:
			throw new Error("evidence: id must be a non-empty string");
		case !Kinds.includes(Kind):
			throw new Error(`evidence: kind must be one of ${Kinds.join(", ")}`);
		case typeof Subject !== "string" || Subject.length === 0:
			throw new Error("evidence: subject must be a non-empty string");
		case !Array.isArray(Dependencies):
			throw new Error("evidence: dependencies must be an array");
		default:
	}
	const Previous = State.Store.get(Id);
	switch (true) {
		case !!Previous:
			Previous.status = "superseded";
			State.Factory.Append(State, `superseded ${Id} (sequence ${Previous.sequence})`);
			break;
		default:
	}
	State.Sequence += 1;
	const Validation: Validation = {
		id: Id,
		kind: Kind,
		subject: Subject,
		verdict: Verdict,
		dependencies: [...Dependencies],
		sequence: State.Sequence,
		status: "fresh",
	};
	State.Store.set(Id, Validation);
	State.Factory.Append(
		State,
		`validated ${Id} (${Kind}, ${Subject}, ${Validation.dependencies.length} dependencies, ${Verdict}, sequence ${State.Sequence})`,
	);
	try {
		void State.Handle?.table("validations")
			.put(Id, Validation)
			.catch(() => {
				/* persistence best-effort */
			});
		void State.Handle?.table("meta")
			.put("__sequence", State.Sequence)
			.catch(() => {
				/* persistence best-effort */
			});
	} catch {
		/* persistence best-effort */
	}
	// The store cap, after the put: the oldest by sequence drop first, and
	// the superseded are evicted before the fresh (the freshest evidence
	// survives the longest).
	while (State.Store.size > State.MaxValidations) {
		let Oldest: string | undefined;
		for (const [Key, Object] of State.Store) {
			if (Object.status === "superseded") {
				Oldest = Key;
				break;
			}
			if (
				Oldest === undefined ||
				Object.sequence < (State.Store.get(Oldest)?.sequence ?? Infinity)
			) {
				Oldest = Key;
			}
		}
		if (Oldest === undefined) {
			break;
		}
		State.Store.delete(Oldest);
	}
	return Validation;
};
