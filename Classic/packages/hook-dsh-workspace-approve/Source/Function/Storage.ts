// Storage - the hook's own P5-style storage-domain open and recovery (the
// factory's Function/{Open,Attach}.ts pattern, the observe hook precedent).
//
// THE DOMAIN: the hook's OWN domain, named config `domain` (default
// workspace_approve) - NOT extension records in the shared
// package_governance domain. Version 1, layout per-record,
// invalidRecords backup-and-skip, TWO tables:
//   * `bindings` - one record per binding, keyed by the binding id;
//   * `ring`     - ONE meta record `__ring`: the bounded ring snapshot.
//
// Best-effort and detached: the open is kicked off from the plugin's own
// effect with `void`, every failure is contained here. An ABSENT facility is
// a SILENT SKIP at the effect's probe (no log line, no record; the bindings
// live in memory only). A PRESENT facility whose open fails is LOUD: one
// best-effort ledger line `storage open failed: <reason>` (the P5 v2
// incident posture, never rethrown).
//
// THE RECOVERY (once, on mount): the loaded `bindings` records rebuild the
// by-id map, the `__ring` record rebuilds the ring, and the sequence
// restarts at the MAXIMUM loaded sequence - the counter is monotonic across
// restarts, never a wall clock. A record that fails validation is skipped,
// never guessed.
//
// The dynamic imports keep the optional packages off the module-load path
// (a module-level import of an unresolvable package would crash the whole
// bundle load - the factory's live-verified pitfall); the type-only devDeps
// pin them to the host-era versions.
import type Binding from "@Interface/Binding.js";
import type State from "@Interface/State.js";

/** The structural shape of one persisted binding (the validation filter). */
const Valid = (Row: unknown): Row is Binding => {
	const Record = Row as Partial<Binding> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.id === "string" &&
		typeof Record.path === "string" &&
		typeof Record.fingerprint === "string" &&
		typeof Record.version === "string" &&
		Array.isArray(Record.constraints) &&
		typeof Record.decision === "string" &&
		typeof Record.sequence === "number"
	);
};

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Binding = Zod.object({
			id: Zod.string(),
			path: Zod.string(),
			fingerprint: Zod.string(),
			version: Zod.string(),
			constraints: Zod.array(Zod.string()),
			summary: Zod.string(),
			decision: Zod.enum([
				"pending",
				"approved",
				"denied",
				"rejected",
				"revoked",
				"invalidated",
			]),
			committedBy: Zod.string().optional(),
			sequence: Zod.number(),
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
				// NOTE: no `compatibleVersions` - the real domain requires every
				// entry to be BELOW the declared version, so `[1]` rejects the
				// spec and every open would fail loud (the observe hook's
				// precedent).
				invalidRecords: "backup-and-skip",
				tables: {
					bindings: Domain.domainTable(Binding),
					ring: Domain.domainTable(Zod.array(Binding)),
				},
			}),
		);
		// Recovery: the by-id map from the bindings table.
		for (const [, Row] of Handle.table("bindings").entries()) {
			if (Valid(Row)) {
				State.ById.set(Row.id, Row);
			}
		}
		// Recovery: the ring from the meta record.
		for (const [, Row] of Handle.table("ring").entries()) {
			if (Array.isArray(Row)) {
				State.Ring = Row.filter(Valid);
			}
		}
		// Recovery: the sequence restarts at the maximum loaded sequence.
		State.Sequence = Math.max(0, ...[...State.ById.values()].map((Entry) => Entry.sequence));
		State.Handle = Handle;
	} catch (Cause) {
		// LOUD (see header): one best-effort ledger line, never rethrown.
		State.Factory.Append(
			State,
			`storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
	}
};
