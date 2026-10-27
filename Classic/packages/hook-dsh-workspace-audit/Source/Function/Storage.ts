// Storage - the hook's own P5-style storage-domain open and recovery (the
// observe hook's exact pattern). THE DOMAIN: the hook's OWN domain, named
// config `domain` (default workspace_audit). Version 1, layout per-record,
// invalidRecords backup-and-skip, TWO tables:
//   * `lines` - one record per line id: the accountability records;
//   * `ring`  - ONE meta record `__ring`: the bounded ring snapshot.
//
// Best-effort and detached: an ABSENT facility is a SILENT SKIP at the
// effect's probe (the lines live in memory only). A PRESENT facility whose
// open fails is LOUD: one best-effort ledger line `storage open failed:
// <reason>` (never rethrown).
//
// THE RECOVERY (once, on mount): the loaded `lines` records rebuild the
// chains and the ring, and the sequence restarts at the MAXIMUM loaded
// sequence - the counter is monotonic across restarts, never a wall clock.
// A record that fails validation is skipped, never guessed.
import type Line from "@Interface/Line.js";
import type State from "@Interface/State.js";

/** The structural validation filter for a persisted line. */
const ValidLine = (Row: unknown): Row is Line => {
	const Record = Row as Partial<Line> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.id === "string" &&
		typeof Record.operation === "string" &&
		typeof Record.parent === "string" &&
		typeof Record.category === "string" &&
		typeof Record.path === "string" &&
		typeof Record.outcome === "string" &&
		typeof Record.sequence === "number"
	);
};

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Line = Zod.object({
			id: Zod.string(),
			operation: Zod.string(),
			parent: Zod.string(),
			category: Zod.enum([
				"announcement",
				"interpretation",
				"intent-revision",
				"commitment",
				"plan-revision",
				"proposed-change",
				"authorization",
				"execution-attempt",
				"outcome-evidence",
				"intent-assessment",
			]),
			path: Zod.string(),
			outcome: Zod.enum(["success", "failure", "conflict", "pending", "refused"]),
			assessment: Zod.string(),
			sequence: Zod.number(),
			at: Zod.number(),
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
				// NOTE: no `compatibleVersions` - the real library rejects a
				// compatibleVersions entry not below the declared version, and
				// version 1 declares no compatible predecessors (the observe
				// hook's precedent).
				invalidRecords: "backup-and-skip",
				tables: {
					lines: Domain.domainTable(
						Line as unknown as Parameters<typeof Domain.domainTable>[0],
					),
					ring: Domain.domainTable(
						Zod.array(Line) as unknown as Parameters<typeof Domain.domainTable>[0],
					),
				},
			}),
		);
		// Recovery: the chains and the ring from the lines table.
		const Loaded: Line[] = [];
		for (const [, Row] of Handle.table("lines").entries()) {
			if (ValidLine(Row)) {
				const Chain = State.Chains.get(Row.operation) ?? [];
				Chain.push(Row);
				State.Chains.set(Row.operation, Chain);
				Loaded.push(Row);
			}
		}
		// The ring rebuilds from the meta record, falling back to the loaded
		// set (both validated; the meta record is authoritative when present).
		for (const [, Row] of Handle.table("ring").entries()) {
			if (Array.isArray(Row)) {
				State.Ring = Row.filter(ValidLine);
			}
		}
		if (State.Ring.length === 0 && Loaded.length > 0) {
			State.Ring = Loaded;
		}
		// Recovery: the sequence restarts at the maximum loaded sequence.
		State.Sequence = Math.max(0, ...State.Ring.map((Entry) => Entry.sequence));
		State.Handle = Handle;
	} catch (Cause) {
		// LOUD (see header): one best-effort ledger line, never rethrown.
		State.Factory.Append(
			State,
			`storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
	}
};
