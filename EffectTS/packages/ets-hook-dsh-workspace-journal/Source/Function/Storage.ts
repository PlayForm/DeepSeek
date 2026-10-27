// Storage - the hook's own P5-style storage-domain open and recovery (the
// observe hook's exact pattern). THE DOMAIN: the hook's OWN domain, named
// config `domain` (default workspace_journal). Version 1, layout
// per-record, invalidRecords backup-and-skip, THREE tables:
//   * `batches` - one record per batchId: the per-batch records;
//   * `entries` - one record per `batchId:path`: the revert data;
//   * `ring`    - ONE meta record `__ring`: the bounded ring of batchIds.
//
// Best-effort and detached, exactly like the factory's P5 arm: the open is
// kicked off from the plugin's own effect with `void`, every failure is
// contained here. An ABSENT facility is a SILENT SKIP at the effect's probe
// (no log line, no record; the batches live in memory only). A PRESENT
// facility whose open fails is LOUD: one best-effort ledger line
// `storage open failed: <reason>` (the P5 v2 incident posture, never
// rethrown).
//
// THE RECOVERY (once, on mount): the loaded `batches` records rebuild the
// batches map, the loaded `entries` rebuild the revert data, the `__ring`
// record rebuilds the ring. A record that fails validation is skipped,
// never guessed.
import type BatchRecord from "@Interface/Batch.js";
import type EntryRecord from "@Interface/Entry.js";
import type State from "@Interface/State.js";

/** The structural validation filter for a persisted batch record. */
const ValidBatch = (Row: unknown): Row is BatchRecord => {
	const Record = Row as Partial<BatchRecord> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.batchId === "string" &&
		typeof Record.operation === "string" &&
		typeof Record.parent === "string" &&
		typeof Record.state === "string" &&
		["applying", "verified", "recovery-required", "reverted"].includes(Record.state) &&
		Array.isArray(Record.files)
	);
};

/** The structural validation filter for a persisted entry record. */
const ValidEntry = (Row: unknown): Row is EntryRecord => {
	const Record = Row as Partial<EntryRecord> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.batchId === "string" &&
		typeof Record.path === "string" &&
		(Record.state === "present" || Record.state === "absent") &&
		typeof Record.content === "string"
	);
};

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Batch = Zod.object({
			batchId: Zod.string(),
			operation: Zod.string(),
			parent: Zod.string(),
			state: Zod.enum(["applying", "verified", "recovery-required", "reverted"]),
			files: Zod.array(Zod.string()),
			progress: Zod.number(),
			reason: Zod.string(),
			at: Zod.number(),
		});
		const Entry = Zod.object({
			batchId: Zod.string(),
			path: Zod.string(),
			state: Zod.enum(["present", "absent"]),
			version: Zod.string(),
			content: Zod.string(),
			truncated: Zod.boolean(),
			at: Zod.number(),
		});
		const Handle = await (
			Facility as {
				open(spec: object): Promise<{
					close(): Promise<void>;
					table(name: string): {
						put(key: string, value: unknown): Promise<void>;
						delete(key: string): Promise<void>;
						entries(): IterableIterator<[string, unknown]>;
					};
				}>;
			}
		).open(
			Domain.defineDomain({
				name: State.DomainName,
				version: 1,
				layout: "per-record",
				// NOTE: no `compatibleVersions` - the real library rejects a
				// compatibleVersions entry not below the declared version, and
				// version 1 declares no compatible predecessors (the observe
				// hook's precedent).
				invalidRecords: "backup-and-skip",
				tables: {
					batches: Domain.domainTable(
						Batch as unknown as Parameters<typeof Domain.domainTable>[0],
					),
					entries: Domain.domainTable(
						Entry as unknown as Parameters<typeof Domain.domainTable>[0],
					),
					ring: Domain.domainTable(
						Zod.array(Zod.string()) as unknown as Parameters<
							typeof Domain.domainTable
						>[0],
					),
				},
			}),
		);
		// Recovery: the batches map from the batches table.
		for (const [, Row] of Handle.table("batches").entries()) {
			if (ValidBatch(Row)) {
				State.Batches.set(Row.batchId, Row);
			}
		}
		// Recovery: the revert data from the entries table.
		for (const [Key, Row] of Handle.table("entries").entries()) {
			if (ValidEntry(Row)) {
				State.Entries.set(Key, Row);
			}
		}
		// Recovery: the ring from the meta record.
		for (const [, Row] of Handle.table("ring").entries()) {
			if (Array.isArray(Row)) {
				State.Ring = Row.filter(
					(Id): Id is string => typeof Id === "string" && State.Batches.has(Id),
				);
			}
		}
		State.Handle = Handle;
	} catch (Cause) {
		// LOUD (see header): one best-effort ledger line, never rethrown.
		State.Factory.Append(
			State,
			`storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
	}
};
