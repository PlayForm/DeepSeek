// Storage - the hook's own P5-style storage-domain open and recovery (the
// observe hook's Function/Storage pattern). THE DOMAIN: the hook's OWN
// domain, named config `domain` (default workspace_merge). Version 1,
// layout per-record, invalidRecords backup-and-skip, TWO tables:
//   * `batches` - one record per batch, keyed by the batch id;
//   * `meta`    - ONE record `__meta`: { sequence }.
//
// Best-effort and detached: an ABSENT facility is a SILENT SKIP; a PRESENT
// facility whose open fails is LOUD (one best-effort ledger line
// `storage open failed: <reason>`, never rethrown).
//
// THE RECOVERY (once, on mount): the batches table rebuilds the record
// map, the `__meta` record restores the sequence - monotonic across
// restarts, never a wall clock. A record that fails validation is
// skipped, never guessed.
//
// The dynamic imports keep the optional packages off the module-load path.
import type Record from "@Interface/Record.js";
import type State from "@Interface/State.js";

/** The structural shape of one persisted batch record (the validation
 *  filter). */
const Valid = (Row: unknown): Row is Record => {
	const Data = Row as Partial<Record> | null;
	return (
		Data !== null &&
		typeof Data === "object" &&
		typeof Data.id === "string" &&
		Data.id.length > 0 &&
		(Data.status === "applied" || Data.status === "partial" || Data.status === "rejected") &&
		typeof Data.sequence === "number" &&
		Array.isArray(Data.replies)
	);
};

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Reply = Zod.object({
			path: Zod.string(),
			status: Zod.string(),
		}).passthrough();
		const Batch = Zod.object({
			id: Zod.string(),
			status: Zod.string(),
			sequence: Zod.number(),
			replies: Zod.array(Reply),
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
				compatibleVersions: [1],
				invalidRecords: "backup-and-skip",
				tables: {
					batches: Domain.domainTable(Batch),
					meta: Domain.domainTable(Zod.unknown()),
				},
			}),
		);
		// Recovery: the batch records.
		for (const [, Row] of Handle.table("batches").entries()) {
			if (Valid(Row)) {
				State.Batches.set(Row.id, Row);
			}
		}
		// Recovery: the meta record (the sequence restarts at the maximum).
		for (const [, Row] of Handle.table("meta").entries()) {
			const Meta = Row as { sequence?: unknown } | null;
			if (Meta !== null && typeof Meta === "object" && typeof Meta.sequence === "number") {
				State.Sequence = Math.max(State.Sequence, Meta.sequence);
			}
		}
		State.Handle = Handle;
	} catch (Cause) {
		State.Factory.Append(
			State,
			`storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
	}
};
