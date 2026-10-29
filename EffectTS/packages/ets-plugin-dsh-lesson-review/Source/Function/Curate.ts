// Curate - the deterministic lifecycle pass: the ALWAYS-ON half of the Hermes
// curator, with the LLM consolidation pass left opt-in and out of this module.
//
// It runs on the usage store alone and costs no tokens, which is why it is the
// default posture: a corpus that only ever grows is a corpus nobody loads,
// and pruning it needs no model's opinion.
//
// THE FOUR PROTECTIONS, each one a lesson from the original:
//
//   1. PINNED entries never move (the user said so).
//   2. ONLY `createdBy: "agent"` entries move. A hand-written skill, a
//      foreground lesson, and a record that predates the flag are all
//      permanently out of the lifecycle's jurisdiction - telemetry cannot
//      establish authorship, so the policy flag decides, not a heuristic.
//   3. ZERO-USE entries get a grace floor: never archived before they are
//      `neverUsedGraceDays` old. Zero uses is absence of evidence, not proof
//      the skill is disposable.
//   4. ARCHIVE, never delete. The move is a rename into `.archive/`, which is
//      its own undo (`Restore`).
//
// The inactivity clock is `lastUsedAt`, falling back to `createdAt` for a
// record that has never been used - so an entry cannot be immortal by being
// ignored.
import type Configuration from "@Interface/Config.js";
import type Entry from "@Interface/Entry.js";

/** The day in ms (the knob's unit). */
const Day = 86_400_000;

/** What one pass moved. */
export interface Curation {
	/** Entries that went `active -> stale`. */
	stale: string[];
	/** Entries that were archived (a rename into the archive root). */
	archived: string[];
}

/** The idle age of one entry, in days. */
export const Idle = (Entry_: Entry, Now: number): number =>
	Math.max(0, Now - (Entry_.useCount > 0 ? Entry_.lastUsedAt : Entry_.createdAt)) / Day;

export default (Entries: readonly Entry[], Knobs: Configuration, Now: number): Curation => {
	const Stale: string[] = [];
	const Archived: string[] = [];
	for (const Entry_ of Entries) {
		switch (true) {
			case Entry_.pinned:
			case Entry_.createdBy !== "agent":
			case Entry_.state === "archived":
				continue;
			default:
				break;
		}
		const Days = Idle(Entry_, Now);
		const Age = Math.max(0, Now - Entry_.createdAt) / Day;
		switch (true) {
			case Days >= Knobs.archiveAfterDays && Age >= Knobs.neverUsedGraceDays: {
				Entry_.state = "archived";
				Entry_.archivedAt = Now;
				Archived.push(Entry_.name);
				break;
			}
			case Days >= Knobs.staleAfterDays: {
				Entry_.state = "stale";
				Stale.push(Entry_.name);
				break;
			}
			default:
				break;
		}
	}
	return { stale: Stale, archived: Archived };
};
