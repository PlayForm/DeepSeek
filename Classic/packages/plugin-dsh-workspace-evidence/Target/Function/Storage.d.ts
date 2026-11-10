/**
 * @module Storage
 *
 * The service's own P5-style storage-domain open and recovery for the
 * evidence store.
 *
 * @remarks
 * The factory's Function/{Open,Attach}.ts pattern, the observe hook's
 * precedent.
 *
 * THE DOMAIN: the service's OWN domain, named config `domain` (default
 * workspace_evidence). Version 1, layout per-record, invalidRecords
 * backup-and-skip, TWO tables:
 * - `validations` - one record per claim id: the latest validation object;
 * - `meta` - ONE record `__sequence`: the persisted sequence.
 *
 * Best-effort and detached, exactly like the factory's P5 arm: the open is
 * kicked off from the plugin's own effect with `void`, every failure is
 * contained here. An ABSENT facility is a SILENT SKIP at the effect's probe
 * (no log line, no record; the store lives in memory only). A PRESENT facility
 * whose open fails is LOUD: one best-effort ledger line
 * `storage open failed: <reason>` (the P5 v2 incident posture, never rethrown).
 *
 * THE RECOVERY (once, on mount): the loaded `validations` records rebuild the
 * store and the sequence restarts at the MAXIMUM loaded sequence - the counter
 * is monotonic across restarts, never a wall clock. A record that fails
 * validation is skipped, never guessed. Superseded objects are dropped at
 * recovery (only live evidence is reloaded).
 *
 * The dynamic imports keep the optional packages off the module-load path (a
 * module-level import of an unresolvable package would crash the whole bundle
 * load - the factory's live-verified pitfall); the type-only devDeps pin them
 * to the host-era versions.
 */
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Facility: unknown): Promise<void>;
