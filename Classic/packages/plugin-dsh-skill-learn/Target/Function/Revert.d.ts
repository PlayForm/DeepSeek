import { type Seam } from "./Write.js";
import type Configuration from "../Interface/Configuration.js";
/**
 * @module Revert
 *
 * One ledger row back to files, fail-closed.
 *
 * @remarks
 *
 * THE ROW NAMES THE BLOBS AND THE BLOBS ARE THE CONTENT, so a revert never has to guess
 * what a file looked like before (SKILL-LEARN-PLUGIN.md:470-484). It is the same
 * mechanism as the backup, which is why the ledger is the only durable record this
 * plugin needs.
 *
 * THE ORDER IS THE SAFETY. Every referenced blob is pre-checked BEFORE anything
 * changes: a missing blob aborts the whole revert, because restoring four of five files
 * would leave a package nobody asked for (curator_backup.py:409-427,
 * Hermes-Consolidation.md:390-392). Then a whole-tree snapshot and a `pre-rollback` row
 * are written; if either fails, nothing changes. Only then do the files move.
 *
 * THIS IS THE ONE PATH THAT FAILS CLOSED. The ledger is telemetry everywhere else and a
 * mutation still lands when an append fails (tools/skill_ledger.py:8); here a failed
 * safety capture stops the run, because the run's whole purpose is to make the previous
 * state recoverable.
 *
 * THE DELIBERATE DIVERGENCE FROM HERMES: an undone `create` is ARCHIVED, never removed
 * (SKILL-LEARN-PLUGIN.md:484). Hermes' rollback deletes files it created
 * (`curator.md:166-169`); this plugin's "never delete" is absolute, so the bytes stay
 * in the archive where the user can still reach them. A single support file has no
 * archive form, so it is left in place and reported as retained.
 */
/**
 * What one revert produced.
 */
export interface Reverted {
    /**
     * Whether every file the row named was put back.
     */
    readonly ok: boolean;
    /**
     * `reverted` is the only success; the rest name why nothing was put back.
     */
    readonly outcome: "reverted" | "missing" | "blob-missing" | "stale" | "staging-retained" | "failed";
    /**
     * How many files were written from their blob.
     */
    readonly restored: number;
    /**
     * How many files were deliberately left in place.
     */
    readonly retained: number;
    /**
     * One clause of detail: the missing blob, the stale path, the safety failure.
     */
    readonly detail?: string;
}
export default _default;
/**
 * Put one ledger row's files back. Fails closed on a missing blob or a failed
 * safety capture, and reports rather than throws on everything else.
 */
declare function _default(Identifier: string, Seam_: Seam, Configuration_: Configuration): Promise<Reverted>;
