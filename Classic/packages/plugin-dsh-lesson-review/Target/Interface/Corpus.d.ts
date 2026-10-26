export interface Corpus {
    /** Whether a skill directory exists (or is recorded) under this name. */
    exists(name: string): boolean;
    /** Whether the entry is pinned (pinned entries are off-limits). */
    pinned(name: string): boolean;
}
