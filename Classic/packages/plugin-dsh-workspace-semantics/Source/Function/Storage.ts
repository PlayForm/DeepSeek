// Storage - the service's own P5-style storage-domain open and recovery (the
// factory's Function/{Open,Attach}.ts pattern, the observe hook's precedent).
//
// THE DOMAIN: the service's OWN domain, named config `domain` (default
// workspace_semantics). Version 1, layout per-record, invalidRecords
// backup-and-skip, TWO tables:
//   * `models` - one record per path: the latest built model, keyed by path;
//   * `meta`   - ONE record `__revision`: the persisted index revision.
//
// Best-effort and detached, exactly like the factory's P5 arm: the open is
// kicked off from the plugin's own effect with `void`, every failure is
// contained here. An ABSENT facility is a SILENT SKIP at the effect's probe
// (no log line, no record; the index lives in memory only). A PRESENT
// facility whose open fails is LOUD: one best-effort ledger line
// `storage open failed: <reason>` (the P5 v2 incident posture, never
// rethrown).
//
// THE RECOVERY (once, on mount): the loaded `models` records rebuild the
// index and the revision restarts at the MAXIMUM loaded revision - the
// counter is monotonic across restarts, never a wall clock. A record that
// fails validation is skipped, never guessed.
//
// The dynamic imports keep the optional packages off the module-load path
// (a module-level import of an unresolvable package would crash the whole
// bundle load - the factory's live-verified pitfall); the type-only devDeps
// pin them to the host-era versions.
import type State from "@Interface/State.js";
import type SymbolNode from "@Interface/SymbolNode.js";

/** The structural shape of one persisted symbol (the validation filter). */
const ValidSymbol = (Row: unknown): Row is SymbolNode => {
	const Record = Row as Partial<SymbolNode> | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.qualifiedName === "string" &&
		typeof Record.span?.start === "number" &&
		typeof Record.span?.end === "number"
	);
};

/** The structural shape of one persisted model. */
const ValidModel = (Row: unknown): boolean => {
	const Record = Row as {
		path?: unknown;
		version?: unknown;
		indexRevision?: unknown;
		symbols?: unknown;
		references?: unknown;
		dependencies?: unknown;
		freshness?: unknown;
	} | null;
	return (
		Record !== null &&
		typeof Record === "object" &&
		typeof Record.path === "string" &&
		typeof Record.version === "string" &&
		typeof Record.indexRevision === "number" &&
		typeof Record.freshness === "string" &&
		typeof Record.symbols === "object" &&
		typeof Record.references === "object" &&
		typeof Record.dependencies === "object"
	);
};

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Model = Zod.object({
			path: Zod.string(),
			version: Zod.string(),
			indexRevision: Zod.number(),
			symbols: Zod.array(Zod.unknown()),
			references: Zod.array(Zod.unknown()),
			dependencies: Zod.array(Zod.string()),
			freshness: Zod.enum(["fresh", "stale"]),
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
					models: Domain.domainTable(Model),
					meta: Domain.domainTable(Zod.number()),
				},
			}),
		);
		// Recovery: the index from the models table.
		for (const [Path, Row] of Handle.table("models").entries()) {
			if (ValidModel(Row)) {
				State.Index.set(Path, Row as never);
			}
		}
		// Recovery: the revision from the meta record (monotonic, never a
		// wall clock). A record failing the symbol validation is skipped.
		for (const [, Row] of Handle.table("meta").entries()) {
			if (typeof Row === "number" && Row > State.Revision) {
				State.Revision = Row;
			}
		}
		for (const Model of State.Index.values()) {
			Model.symbols = Model.symbols.filter(ValidSymbol);
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
