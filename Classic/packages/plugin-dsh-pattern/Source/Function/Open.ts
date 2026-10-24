// Open - the storage-domain open (Function/Open), the PRIMARY store. THE
// DOMAIN: the service's OWN domain, named by the config `domain` (default
// `pattern`). Version 1, per-record layout, backup-and-skip invalid records,
// and NO `compatibleVersions` - the library rejects an entry that is not
// strictly BELOW the declared version, so `[1]` against version 1 throws at
// load (the family's learned rule: a version-1 domain declares no compatible
// predecessor). TWO tables:
//   * `patterns` - one record per pattern id: the pattern as last written;
//   * `meta`     - ONE record `__savedAt`: the snapshot timestamp.
//
// The dynamic imports keep the optional storage packages off the module-load
// path (a module-level import of an unresolvable package would crash the
// whole bundle load - the factory's live-verified pitfall); the type-only
// devDeps pin them to the host-era versions.
import type Handle from "@Interface/Handle.js";

export default async (Name: string, Facility: unknown): Promise<Handle> => {
	const [Domain, Zod] = await Promise.all([
		import("@deepseek-ai/dsh-storage-domain"),
		import("zod"),
	]);
	const Shape = Zod.object({
		id: Zod.string(),
		intent: Zod.string(),
		trigger: Zod.object({
			tool: Zod.string().optional(),
			keywords: Zod.array(Zod.string()),
		}),
		targets: Zod.array(Zod.string()),
		transform: Zod.array(Zod.string()),
		arbiter: Zod.string(),
		confidence: Zod.number(),
		allowlist: Zod.boolean(),
		updatedAt: Zod.number(),
	});
	return (
		Facility as {
			open(spec: object): Promise<Handle>;
		}
	).open(
		Domain.defineDomain({
			name: Name,
			version: 1,
			layout: "per-record",
			invalidRecords: "backup-and-skip",
			tables: {
				patterns: Domain.domainTable(Shape),
				meta: Domain.domainTable(Zod.number()),
			},
		}),
	);
};
