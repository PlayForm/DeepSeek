/**
 * @module Storage
 *
 * The service's own P5-style storage-domain open and recovery, following the
 * factory's Function/{Open,Attach}.ts pattern and the observe hook's precedent.
 *
 * @remarks
 * THE DOMAIN: the service's OWN domain, named config `domain` (default
 * workspace_semantics). Version 1, layout per-record, invalidRecords
 * backup-and-skip, TWO tables:
 *
 * ```
 * `models` - one record per path: the latest built model, keyed by path;
 * `meta`   - ONE record `__revision`: the persisted index revision.
 * ```
 *
 * Best-effort and detached, exactly like the factory's P5 arm: the open is
 * kicked off from the plugin's own effect with `void`, every failure is
 * contained here. An ABSENT facility is a SILENT SKIP at the effect's probe (no
 * log line, no record; the index lives in memory only). A PRESENT facility
 * whose open fails is LOUD: one best-effort ledger line
 * `storage open failed: <reason>` (the P5 v2 incident posture, never rethrown).
 *
 * THE RECOVERY (once, on mount): the loaded `models` records rebuild the index
 * and the revision restarts at the MAXIMUM loaded revision - the counter is
 * monotonic across restarts, never a wall clock. A record that fails validation
 * is skipped, never guessed.
 *
 * The dynamic imports keep the optional packages off the module-load path (a
 * module-level import of an unresolvable package would crash the whole bundle
 * load - the factory's live-verified pitfall); the type-only devDeps pin them
 * to the host-era versions.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Facility: unknown): Promise<void>;
