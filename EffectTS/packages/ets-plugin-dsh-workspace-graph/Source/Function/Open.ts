// Open - the optional storage-domain setup (the factory's Function/Open
// pattern): probe the facility (ctx.storage.domain, else ctx.storageDomain),
// declare the domain named Config.domain (version 1, per-record layout, the
// backup-and-skip invalid-record policy) with the single `records` table,
// open it, load the stored records into the in-memory mirror (a stored value
// failing IsRecord is skipped and counted, never guessed), restore the meta
// revision when it is ahead, and ledger the byte-exact
// `domain <domain> opened (<records> records)` line.
//
// The whole setup is best-effort and detached: the entry fires it without
// awaiting but keeps the promise on State.Opened, and the async writers
// await that promise first - so the store assertions are deterministic
// without a sleep. An absent facility is a silent skip (in-memory only); a
// present facility whose open fails is loud (one best-effort ledger line).
import type State from "@Interface/State.js";
import type { Domain } from "@Interface/State.js";

import Append from "./Append.js";
import IsRecord from "./IsRecord.js";
import Store from "./Store.js";

export default async (StateRef: State): Promise<void> => {
	try {
		const Context = StateRef.Context as {
			storage?: { domain?: { open?(spec: object): Promise<Domain> } };
			storageDomain?: { open?(spec: object): Promise<Domain> };
		};
		const Facility = Context.storage?.domain ?? Context.storageDomain;
		if (Facility?.open === undefined) {
			return; // absent facility: silent skip, in-memory only
		}
		const [DomainModule, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Handle = await Facility.open(
			DomainModule.defineDomain({
				name: StateRef.Config.domain,
				version: 1,
				layout: "per-record",
				invalidRecords: "backup-and-skip",
				tables: {
					records: DomainModule.domainTable(
						Zod.object({
							version: Zod.string().optional(),
							fingerprint: Zod.string().optional(),
							nodes: Zod.array(Zod.unknown()).optional(),
							edges: Zod.array(Zod.unknown()).optional(),
							indexRevision: Zod.number().optional(),
						}) as unknown as Parameters<typeof DomainModule.domainTable>[0],
					),
				},
			}),
		);
		StateRef.Domain = Handle;
		let Count = 0;
		for (const [Key, Value] of Store.entries(StateRef)) {
			if (Key === "__meta") {
				continue;
			}
			if (!IsRecord(Value)) {
				StateRef.Invalid += 1;
				continue;
			}
			StateRef.Records.set(Key, Value);
			Count += 1;
		}
		const Meta = Store.meta(StateRef);
		if (typeof Meta?.indexRevision === "number" && Meta.indexRevision > StateRef.Revision) {
			StateRef.Revision = Meta.indexRevision;
		}
		Append(StateRef, `domain ${StateRef.Config.domain} opened (${Count} records)`);
	} catch (Cause) {
		Append(StateRef, `storage open failed (${(Cause as Error)?.message ?? String(Cause)})`);
	}
};
