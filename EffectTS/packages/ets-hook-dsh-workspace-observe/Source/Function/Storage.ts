// Storage - the hook's own P5-style storage-domain open and recovery (the
// factory's Function/{Open,Attach}.ts pattern, the live-containers monitor
// domain precedent).
//
// THE DOMAIN: the hook's OWN domain, named config `domain` (default
// workspace_observe) - NOT extension records in the shared
// package_governance domain (the v2 open contract would force a version bump
// whose blast radius is the whole governance family). Version 1, layout
// per-record, invalidRecords backup-and-skip, TWO tables:
//   * `stamps` - one record per path: the latest stamp, keyed by the path;
//   * `ring`   - ONE meta record `__ring`: the bounded ring snapshot.
//
// Best-effort and detached, exactly like the factory's P5 arm: the open is
// kicked off from the plugin's own effect with `void`, every failure is
// contained here. An ABSENT facility is a SILENT SKIP at the effect's probe
// (no log line, no record; the stamps live in memory only). A PRESENT
// facility whose open fails is LOUD: one best-effort ledger line
// `storage open failed: <reason>` (the P5 v2 incident posture, never
// rethrown).
//
// THE RECOVERY (once, on mount): the loaded `stamps` records rebuild the
// latest map, the `__ring` record rebuilds the ring, and the sequence
// restarts at the MAXIMUM loaded sequence - the counter is monotonic across
// restarts, never a wall clock. A record that fails validation is skipped,
// never guessed.
//
// The dynamic imports keep the optional packages off the module-load path
// (a module-level import of an unresolvable package would crash the whole
// bundle load - the factory's live-verified pitfall); the type-only devDeps
// pin them to the host-era versions. NOTE: no `compatibleVersions` - the
// single-layout unit parser enforces EXACT version equality, and a
// `compatibleVersions` entry must be BELOW the declared version (the real
// library rejects [1] against version 1 at validation time), so version 1
// declares no compatible predecessors.
import type Stamp from "@Interface/Stamp.js";
import type State from "@Interface/State.js";

/** The structural shape of one persisted stamp (the validation filter). */
const Valid = (Row: unknown): Row is Stamp => {
	const Record = Row as Partial<Stamp> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.path === "string" &&
		typeof Record.version === "string" &&
		(Record.origin === "fs/observed" || Record.origin === "manual") &&
		typeof Record.sequence === "number"
	);
};

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Stamp = Zod.object({
			path: Zod.string(),
			version: Zod.string(),
			origin: Zod.enum(["fs/observed", "manual"]),
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
				invalidRecords: "backup-and-skip",
				tables: {
					stamps: Domain.domainTable(Stamp),
					ring: Domain.domainTable(Zod.array(Stamp)),
				},
			}),
		);
		// Recovery: the latest map from the stamps table.
		for (const [, Row] of Handle.table("stamps").entries()) {
			if (Valid(Row)) {
				State.Latest.set(Row.path, Row);
			}
		}
		// Recovery: the ring from the meta record.
		for (const [, Row] of Handle.table("ring").entries()) {
			if (Array.isArray(Row)) {
				State.Ring = Row.filter(Valid);
			}
		}
		// Recovery: the sequence restarts at the maximum loaded sequence.
		State.Sequence = Math.max(0, ...State.Ring.map((Entry) => Entry.sequence));
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
