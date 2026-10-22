// Storage - the service's own P5-style storage-domain open and recovery (the
// factory's Function/{Open,Attach}.ts pattern, the observe hook's precedent).
//
// THE DOMAIN: the service's OWN domain, named config `domain` (default
// workspace_evidence). Version 1, layout per-record, invalidRecords
// backup-and-skip, TWO tables:
//   * `validations` - one record per claim id: the latest validation object;
//   * `meta`        - ONE record `__sequence`: the persisted sequence.
//
// Best-effort and detached, exactly like the factory's P5 arm: the open is
// kicked off from the plugin's own effect with `void`, every failure is
// contained here. An ABSENT facility is a SILENT SKIP at the effect's probe
// (no log line, no record; the store lives in memory only). A PRESENT
// facility whose open fails is LOUD: one best-effort ledger line
// `storage open failed: <reason>` (the P5 v2 incident posture, never
// rethrown).
//
// THE RECOVERY (once, on mount): the loaded `validations` records rebuild
// the store and the sequence restarts at the MAXIMUM loaded sequence - the
// counter is monotonic across restarts, never a wall clock. A record that
// fails validation is skipped, never guessed. Superseded objects are
// dropped at recovery (only live evidence is reloaded).
//
// The dynamic imports keep the optional packages off the module-load path
// (a module-level import of an unresolvable package would crash the whole
// bundle load - the factory's live-verified pitfall); the type-only devDeps
// pin them to the host-era versions.
import type State from "@Interface/State.js";
import type Validation from "@Interface/Validation.js";

/** The structural shape of one persisted validation (the validation
 *  filter). */
const Valid = (Row: unknown): Row is Validation => {
	const Record = Row as Partial<Validation> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.id === "string" &&
		Record.id.length > 0 &&
		(Record.kind === "reality" ||
			Record.kind === "observation" ||
			Record.kind === "representation" ||
			Record.kind === "intent") &&
		typeof Record.subject === "string" &&
		(Record.verdict === "verified" || Record.verdict === "unverified") &&
		typeof Record.sequence === "number" &&
		(Record.status === "fresh" ||
			Record.status === "stale" ||
			Record.status === "superseded") &&
		Array.isArray(Record.dependencies)
	);
};

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Validation = Zod.object({
			id: Zod.string(),
			kind: Zod.enum(["reality", "observation", "representation", "intent"]),
			subject: Zod.string(),
			verdict: Zod.enum(["verified", "unverified"]),
			dependencies: Zod.array(Zod.string()),
			sequence: Zod.number(),
			status: Zod.enum(["fresh", "stale", "superseded"]),
		});
		const Handle = await (
			Facility as {
				open(spec: object): Promise<{
					close(): Promise<void>;
					table(name: string): {
						put(key: string, value: unknown): Promise<void>;
						entries(): IterableIterator<[string, unknown]>;
					};
				}>;
			}
		).open(
			Domain.defineDomain({
				name: State.DomainName,
				version: 1,
				layout: "per-record",
				compatibleVersions: [],
				invalidRecords: "backup-and-skip",
				tables: {
					validations: Domain.domainTable(Validation),
					meta: Domain.domainTable(Zod.number()),
				},
			}),
		);
		// Recovery: the store from the validations table; superseded objects
		// are dropped (only live evidence is reloaded).
		for (const [, Row] of Handle.table("validations").entries()) {
			if (Valid(Row) && Row.status !== "superseded") {
				State.Store.set(Row.id, Row);
			}
		}
		// Recovery: the sequence from the meta record (monotonic, never a
		// wall clock).
		for (const [, Row] of Handle.table("meta").entries()) {
			if (typeof Row === "number" && Row > State.Sequence) {
				State.Sequence = Row;
			}
		}
		State.Handle = Handle;
	} catch (Cause) {
		// LOUD (see header): the failed open used to vanish silently in the
		// factory's P5 v1 - one best-effort ledger line, never rethrown.
		State.Factory.Append(
			State,
			`storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
	}
};
