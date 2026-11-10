import type UsageRecord from "../Interface/Record.js";
/**
 * @module Usage
 *
 * The usage store: one JSON object keyed by skill name, never inside a `SKILL.md`, and
 * the curator's whole input.
 *
 * @remarks
 *
 * THE STORE IS A SIDECAR, never the corpus: the corpus is directories of markdown a
 * person reads and edits, so bookkeeping lives beside it where a bad write cannot
 * corrupt a skill (tools/skill_usage.py:1-2, :51-52).
 *
 * ONE TOP-LEVEL KEY IS NOT A RECORD: the curator's clock is persisted under `curatedAt`
 * beside the skill keys, because the clock has to survive a restart and this store is
 * the one thing the plugin already writes atomically (SKILL-LEARN-PLUGIN.md:146). A
 * skill name can never collide with it, since the corpus grammar is
 * `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, so the reader recognises the key by name and never
 * coerces it into a record - and a second store would be a second failure mode for one
 * number.
 *
 * A CORRUPT STORE IS QUARANTINED, NOT OVERWRITTEN. Hermes reads a corrupt or unreadable
 * store as `{}` and the next successful bump rewrites the whole file with a map holding
 * one record, which silently loses every other record (tools/skill_usage.py:369-377,
 * :406, Hermes-Curator-Pass.md:406). That behaviour is not copied: a read failure moves
 * the file to `<storagePath>.corrupt-<YYYYMMDDHHMMSS>` and starts from an empty store,
 * one ledger line names the error and the quarantine path, and the quarantined bytes
 * stay on disk for inspection (SKILL-LEARN-PLUGIN.md:647-657). When the move itself
 * fails, the store REFUSES to save, so the next write cannot destroy the only copy.
 *
 * TWO FIELDS ARE DERIVED AND NEVER PERSISTED: `lastActivityAt` is the maximum of the
 * two activity stamps with `createdAt` deliberately excluded, so a skill that was never
 * active stays distinguishable from one that was (tools/skill_usage.py:123-127), and it
 * is recomputed on every mutation rather than stored, so a read never sees a stale
 * value (Interface/Record.ts:42-43).
 *
 * WRITES ARE ATOMIC AND ORDERED: one promise chain, so a load always precedes a write
 * and two saves cannot interleave, and each save lands through a temporary file and a
 * rename (tools/skill_usage.py:384, SKILL-LEARN-PLUGIN.md:657).
 */
/**
 * What a load found, and why it found nothing.
 */
export interface LoadResult {
    /**
     * How many records the store held.
     */
    readonly loaded: number;
    /**
     * How many entries were dropped because they were not records.
     */
    readonly dropped: number;
    /**
     * Why the store could not be read, when it could not.
     */
    readonly error?: string;
    /**
     * Where the unreadable store was moved, when the quarantine succeeded.
     */
    readonly quarantined?: string;
}
/**
 * What a save did.
 */
export interface SaveResult {
    readonly ok: boolean;
    /**
     * Why the save failed, when it did.
     */
    readonly error?: string;
}
/**
 * One store entry: the name is the key, so the record does not carry it.
 */
export interface Stored {
    /**
     * The skill name, which is the store's key.
     */
    readonly name: string;
    /**
     * The record itself.
     */
    readonly record: UsageRecord;
}
/**
 * What one use did, so the report can say whether the skill was reused after a patch.
 */
export interface Reused {
    readonly record: UsageRecord;
    /**
     * Whether this was not the first use.
     */
    readonly reused: boolean;
    /**
     * Whether the skill was used again after a patch landed since the last reuse.
     */
    readonly reuseAfterPatch: boolean;
}
export default class Usage {
    /**
     * The store path, already expanded by the caller.
     */
    private Path;
    /**
     * The live records, keyed by skill name.
     */
    private Rows;
    /**
     * The curator's clock: the epoch milliseconds of the last pass, or null when
     * the store holds none. It is a field of the STORE and not of the service,
     * because a clock in the service resets on every restart and a machine that
     * restarts often would then never curate - every pass would be the seeding
     * pass that transitions nothing (SKILL-LEARN-PLUGIN.md:146).
     */
    private Clock;
    /**
     * The one load, so a save always follows a load and a second call is free.
     */
    private Ready;
    /**
     * The write chain, so two saves cannot interleave.
     */
    private Chain;
    /**
     * Whether the store is unreadable AND could not be quarantined.
     */
    private Poisoned;
    constructor(Path_: string);
    /**
     * Load the store once; never throws.
     */
    Load(): Promise<LoadResult>;
    /**
     * Read the file, quarantining it when it cannot be trusted.
     */
    private Read;
    /**
     * Move an unreadable store aside and start empty; a failed move poisons the store.
     */
    private Quarantine;
    /**
     * One record, or undefined when the store holds none.
     */
    Get(Name: string): UsageRecord | undefined;
    /**
     * Every record, sorted by name, which is the report's stable order.
     */
    All(): readonly Stored[];
    /**
     * The curator's clock: the persisted epoch milliseconds of the last pass, or
     * null when the store holds none. It is read from the store rather than from
     * the service so a restart keeps the interval; null is the first-run case,
     * which the caller anchors by running the pass (SKILL-LEARN-PLUGIN.md:146).
     */
    CuratedAt(): number | null;
    /**
     * Record one curation pass. The value is written by `Save` beside the records,
     * under the one reserved top-level key, so the clock and the transitions it
     * justifies land in the same atomic write.
     */
    Curated(Now: Date): void;
    /**
     * Store one record and recompute the derived activity stamp.
     */
    private Settle;
    /**
     * One observed load through the `skill` tool. A use is not a plain increment:
     * the patch-generation watermark moves only when the skill is reused after a
     * patch landed (tools/skill_usage.py:499-508).
     */
    Use(Name: string, Now: Date): Reused;
    /**
     * One successful `patch` or `support` write: the count and the generation move together.
     */
    Patched(Name: string, Now: Date): UsageRecord;
    /**
     * One created skill. The record is rewritten from the zero value because a
     * create is a new logical skill: any surviving record belonged to a skill of the
     * same name that no longer exists (tools/skill_usage.py:530-533). `createdBy:
     * "agent"` is the curation opt-in, not an authorship claim
     * (tools/skill_usage.py:290-297).
     */
    Created(Name: string, Now: Date): UsageRecord;
    /**
     * Anchor a record's inactivity clock on first sight, without transitioning it (R3).
     */
    Seeded(Name: string, Now: Date): UsageRecord;
    /**
     * Move one record's lifecycle state; `archivedAt` is set on archive and cleared otherwise.
     */
    State(Name: string, Next: UsageRecord["state"], Now: Date): UsageRecord | undefined;
    /**
     * Exempt one record from every transition, or lift the exemption.
     */
    Pinned(Name: string, Pinned_: boolean): UsageRecord | undefined;
    /**
     * Persist the store: one chain, one temporary file, one rename. Never throws.
     */
    Save(): Promise<SaveResult>;
}
