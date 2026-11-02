import type UsageRecord from "../Interface/Record.js";
/** What a load found, and why it found nothing. */
export interface LoadResult {
    /** How many records the store held. */
    readonly loaded: number;
    /** How many entries were dropped because they were not records. */
    readonly dropped: number;
    /** Why the store could not be read, when it could not. */
    readonly error?: string;
    /** Where the unreadable store was moved, when the quarantine succeeded. */
    readonly quarantined?: string;
}
/** What a save did. */
export interface SaveResult {
    readonly ok: boolean;
    /** Why the save failed, when it did. */
    readonly error?: string;
}
/** One store entry: the name is the key, so the record does not carry it. */
export interface Stored {
    /** The skill name, which is the store's key. */
    readonly name: string;
    /** The record itself. */
    readonly record: UsageRecord;
}
/** What one use did, so the report can say whether the skill was reused after a patch. */
export interface Reused {
    readonly record: UsageRecord;
    /** Whether this was not the first use. */
    readonly reused: boolean;
    /** Whether the skill was used again after a patch landed since the last reuse. */
    readonly reuseAfterPatch: boolean;
}
export default class Usage {
    /** The store path, already expanded by the caller. */
    private Path;
    /** The live records, keyed by skill name. */
    private Rows;
    /**
     * The curator's clock: the epoch milliseconds of the last pass, or null when
     * the store holds none. It is a field of the STORE and not of the service,
     * because a clock in the service resets on every restart and a machine that
     * restarts often would then never curate - every pass would be the seeding
     * pass that transitions nothing (SKILL-LEARN-PLUGIN.md:146).
     */
    private Clock;
    /** The one load, so a save always follows a load and a second call is free. */
    private Ready;
    /** The write chain, so two saves cannot interleave. */
    private Chain;
    /** Whether the store is unreadable AND could not be quarantined. */
    private Poisoned;
    constructor(Path_: string);
    /** Load the store once; never throws. */
    Load(): Promise<LoadResult>;
    /** Read the file, quarantining it when it cannot be trusted. */
    private Read;
    /** Move an unreadable store aside and start empty; a failed move poisons the store. */
    private Quarantine;
    /** One record, or undefined when the store holds none. */
    Get(Name: string): UsageRecord | undefined;
    /** Every record, sorted by name, which is the report's stable order. */
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
    /** Store one record and recompute the derived activity stamp. */
    private Settle;
    /**
     * One observed load through the `skill` tool. A use is not a plain increment:
     * the patch-generation watermark moves only when the skill is reused after a
     * patch landed (tools/skill_usage.py:499-508).
     */
    Use(Name: string, Now: Date): Reused;
    /** One successful `patch` or `support` write: the count and the generation move together. */
    Patched(Name: string, Now: Date): UsageRecord;
    /**
     * One created skill. The record is rewritten from the zero value because a
     * create is a new logical skill: any surviving record belonged to a skill of the
     * same name that no longer exists (tools/skill_usage.py:530-533). `createdBy:
     * "agent"` is the curation opt-in, not an authorship claim
     * (tools/skill_usage.py:290-297).
     */
    Created(Name: string, Now: Date): UsageRecord;
    /** Anchor a record's inactivity clock on first sight, without transitioning it (R3). */
    Seeded(Name: string, Now: Date): UsageRecord;
    /** Move one record's lifecycle state; `archivedAt` is set on archive and cleared otherwise. */
    State(Name: string, Next: UsageRecord["state"], Now: Date): UsageRecord | undefined;
    /** Exempt one record from every transition, or lift the exemption. */
    Pinned(Name: string, Pinned_: boolean): UsageRecord | undefined;
    /** Persist the store: one chain, one temporary file, one rename. Never throws. */
    Save(): Promise<SaveResult>;
}
