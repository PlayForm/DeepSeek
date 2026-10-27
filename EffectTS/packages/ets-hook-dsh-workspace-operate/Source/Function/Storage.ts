// Storage - the hook's own P5-style storage-domain open and recovery (the
// observe hook's Function/Storage pattern, the factory's {Open,Attach}
// precedent).
//
// THE DOMAIN: the hook's OWN domain, named config `domain` (default
// workspace_operate) - NOT extension records in the shared
// package_governance domain. Version 1, layout per-record,
// invalidRecords backup-and-skip, TWO tables:
//   * `proposals` - one record per proposal, keyed by the id;
//   * `meta`      - ONE record `__meta`: { sequence, refused }.
//
// Best-effort and detached, exactly like the observe hook: the open is
// kicked off with `void` from the plugin's effect; an ABSENT facility is a
// SILENT SKIP (the proposals live in memory only); a PRESENT facility
// whose open fails is LOUD: one best-effort ledger line
// `storage open failed: <reason>`, never rethrown.
//
// THE RECOVERY (once, on mount): the proposals table rebuilds the live
// map, the `__meta` record restores the sequence and refusal counters -
// both monotonic across restarts, never wall clocks. A record that fails
// validation is skipped, never guessed.
//
// The dynamic imports keep the optional packages off the module-load path
// (the factory's live-verified pitfall); the type-only devDeps pin them.
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";

/** The structural shape of one persisted proposal (the validation filter). */
const Valid = (Row: unknown): Row is Proposal => {
	const Record = Row as Partial<Proposal> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.id === "string" &&
		Record.id.length > 0 &&
		(Record.kind === "rename" || Record.kind === "connect" || Record.kind === "replace") &&
		(Record.status === "proposed" || Record.status === "withdrawn") &&
		typeof Record.path === "string" &&
		typeof Record.version === "string" &&
		typeof Record.sequence === "number"
	);
};

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Proposal = Zod.object({
			id: Zod.string(),
			kind: Zod.enum(["rename", "connect", "replace"]),
			status: Zod.enum(["proposed", "withdrawn"]),
			path: Zod.string(),
			version: Zod.string(),
			sequence: Zod.number(),
		}).passthrough();
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
				compatibleVersions: [1],
				invalidRecords: "backup-and-skip",
				tables: {
					proposals: Domain.domainTable(
						Proposal as unknown as Parameters<typeof Domain.domainTable>[0],
					),
					meta: Domain.domainTable(
						Zod.unknown() as unknown as Parameters<typeof Domain.domainTable>[0],
					),
				},
			}),
		);
		// Recovery: the proposal table.
		for (const [, Row] of Handle.table("proposals").entries()) {
			if (Valid(Row)) {
				State.Proposals.set(Row.id, Row);
			}
		}
		// Recovery: the meta record (the counters restart at the maximum).
		for (const [, Row] of Handle.table("meta").entries()) {
			const Meta = Row as { sequence?: unknown; refused?: unknown } | null;
			if (Meta !== null && typeof Meta === "object" && typeof Meta.sequence === "number") {
				State.Sequence = Math.max(State.Sequence, Meta.sequence);
				State.Refused = typeof Meta.refused === "number" ? Meta.refused : State.Refused;
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
