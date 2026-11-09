/**
 * @module Storage
 *
 * The hook's own P5-style storage-domain open and recovery.
 *
 * @remarks
 * The observe hook's exact pattern. THE DOMAIN: the hook's OWN domain, named
 * config `domain` (default workspace_journal). Version 1, layout
 * per-record, invalidRecords backup-and-skip, THREE tables:
 *   - `batches` - one record per batchId: the per-batch records;
 *   - `entries` - one record per `batchId:path`: the revert data;
 *   - `ring`    - ONE meta record `__ring`: the bounded ring of batchIds.
 *
 * Best-effort and detached, exactly like the factory's P5 arm: the open is
 * kicked off from the plugin's own effect with `void`, every failure is
 * contained here. An ABSENT facility is a SILENT SKIP at the effect's probe
 * (no log line, no record; the batches live in memory only). A PRESENT
 * facility whose open fails is LOUD: one best-effort ledger line
 * `storage open failed: <reason>` (the P5 v2 incident posture, never
 * rethrown).
 *
 * THE RECOVERY (once, on mount): the loaded `batches` records rebuild the
 * batches map, the loaded `entries` rebuild the revert data, the `__ring`
 * record rebuilds the ring. A record that fails validation is skipped,
 * never guessed.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Facility: unknown): Promise<void>;
