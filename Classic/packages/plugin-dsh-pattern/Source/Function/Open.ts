import type Handle from "@Interface/Handle.js";
import type State from "@Interface/State.js";

/**
 * @module Open
 *
 * The pattern registry's storage-domain open: the PRIMARY store.
 *
 * @remarks
 *
 * THE OPEN routes through the factory's shared `OpenDomain` (the P5 posture
 * the storage consumers hand-copied): the dynamic import of the optional
 * storage package, the `defineDomain` declaration and the open itself live in
 * `plugin-dsh-factory` (`Function/Domain`); this module keeps what is its own
 * - the domain name and version, the TWO table schemas (zod), the restore
 * hook and the loud failure line. zod is still dynamically imported here,
 * because the table SCHEMAS are built at call time; the optional storage
 * package is no longer imported in this package at all.
 *
 * THE DOMAIN: the service's OWN domain, named by the config `domain` (default
 * `pattern`). Version 1, per-record layout, backup-and-skip invalid records,
 * and NO `compatibleVersions` - the library rejects an entry that is not
 * strictly BELOW the declared version, so `[1]` against version 1 throws at
 * load (the family's learned rule; the shared method omits the key for a
 * version-1 domain). TWO tables:
 * - `patterns` - one record per pattern id: the pattern as last written;
 * - `meta` - ONE record `__savedAt`: the snapshot timestamp.
 *
 * The loud line is the module's OWN string, byte-identical (the factory only
 * appends it through the State's logger, prefixing `pattern: `):
 * `storage open failed: <reason> (logFile <config logFile>)` - the
 * `(logFile ...)` suffix is the service's ledger framing, composed HERE so
 * the appended line stays byte-exact. On any throw (the open itself or a
 * throw inside the restore hook) the shared method resolves `undefined`, and
 * the service's JSON fallback (Function/Snapshot) is the degraded store -
 * the recovery never rethrows onto a caller path.
 */
export default async (
	State: State,
	Facility: unknown,
	Restore?: (Handle: unknown) => void,
): Promise<Handle | undefined> => {
	const Zod = await import("zod");
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
	return (await State.Factory.OpenDomain(State, Facility, {
		Name: State.DomainName,
		Version: 1,
		// The module's own raw zod schemas (see header) - the shared method
		// wraps them with domainTable inside its dynamic-import scope.
		Tables: {
			patterns: Shape,
			meta: Zod.number(),
		},
		// The module's own loud line, byte-identical (the factory only appends
		// it - see header).
		Line: (Cause) =>
			`storage open failed: ${(Cause as Error)?.message ?? String(Cause)} (logFile ${State.LogFile})`,
		// The recovery (the service's per-record overlay) runs once, inside
		// the shared method's try: a throw here is the same loud line and the
		// same JSON fallback as a failed open.
		Restore: Restore,
	})) as Handle | undefined;
};
