// Corpus - the read-only view of the skill corpus the judge needs.
//
// The judge is a pure function of (proposal, corpus), so it takes the corpus as
// this narrow interface rather than a path: the service implements it over the
// usage store plus one directory probe, and the smokes implement it over a
// literal map. That is what lets every rule be asserted without touching a
// filesystem.
export interface Corpus {
	/** Whether a skill directory exists (or is recorded) under this name. */
	exists(name: string): boolean;
	/** Whether the entry is pinned (pinned entries are off-limits). */
	pinned(name: string): boolean;
}
