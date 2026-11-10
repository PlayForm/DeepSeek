import Path from "node:path";

import Archive from "@Function/Archive.js";
import Append from "@Function/Ledger.js";
import type Usage from "@Function/Usage.js";
import { Expand, Text, type Seam } from "@Function/Write.js";
import type Configuration from "@Interface/Configuration.js";
import type { Curation } from "@Interface/Curation.js";
import type UsageRecord from "@Interface/Record.js";

/**
 * @module Curate
 *
 * The deterministic lifecycle pass: the always-on half of the Hermes curator, with
 * the model-gated consolidation pass left opt-in and out of this module
 * (`Function/Consolidate.ts`).
 *
 * @remarks
 *
 * IT RUNS ON THE USAGE STORE ALONE AND COSTS NO TOKENS, which is why it is the default
 * posture: a corpus that only ever grows is a corpus nobody loads, and ageing it needs
 * no model's opinion.
 *
 * THE RULES ARE R1-R10 OF SECTION 7.1 (SKILL-LEARN-PLUGIN.md:523-542), and two of the
 * ten do not survive:
 *
 * - R1 - pinned -> continue, no write and no seeding
 * - R2 - ABSENT: Hermes protects a skill a cron job names (cron/jobs.py:3385-3400);
 *   this harness exposes no skill-reference store, so `Pin` is the protection and the
 *   absence is stated rather than faked (SKILL-LEARN-PLUGIN.md:530)
 * - R3 - no clock yet -> seed `firstSeenAt`, count `seeded`, continue
 * - R4 - ABSENT: the bundled zero-use re-anchor has no subject, because bundled roots
 *   are out of jurisdiction in v1 (SKILL-LEARN-PLUGIN.md:532)
 * - R5 - the anchor is `lastActivityAt` or `createdAt`, never `now`
 * - R6 - zero use inside the grace floor -> force `active`, then continue
 * - R7 - archive at `archiveAfterDays`
 * - R8 - stale at `staleAfterDays`
 * - R9 - reactivate a stale skill whose anchor moved back inside the cutoff
 * - R10 - archived is terminal: no arm reaches it, and only `Restore` leaves it
 *
 * R1-R6 ARE CONTINUE GUARDS AND R7-R9 ARE ONE CHAIN, so at most one transition happens
 * per skill per pass (Hermes-Curator-Pass.md:109). The order is semantic: the pin must
 * precede seeding, and the archive must precede the stale.
 *
 * THE THRESHOLDS ARE FLOORED AT ONE DAY: a cutoff at or past now would transition the
 * whole corpus on one bad config (agent/curator.py:122-135).
 *
 * EVERY WRITE RE-CHECKS THE PREDICATE, which is the second gate: the report is a view
 * and the predicate is the contract (tools/skill_usage.py:433-445), and the archive
 * re-checks a third time before it copies anything (tools/skill_usage.py:620-632).
 */
/**
 * The day in milliseconds, the unit both thresholds are stated in.
 */
const Day = 86_400_000;

/**
 * One stamp as epoch milliseconds, with a naive value forced to UTC (tools/skill_usage.py:115-120).
 */
const Moment = (Stamp: string | null): number => {
	switch (true) {
		case Stamp === null:
			return 0;
		default: {
			const Qualified = /(?:Z|[+-]\d{2}:?\d{2})$/.test(Stamp) ? Stamp : `${Stamp}Z`;
			const Value = Date.parse(Qualified);
			return Number.isNaN(Value) ? 0 : Value;
		}
	}
};

/**
 * Whether the record is in the pass's jurisdiction: the plugin's own create, or a pin.
 */
const Eligible = (Record_: UsageRecord): boolean => Record_.createdBy === "agent" || Record_.pinned;

/**
 * Whether the skill still resolves under the writable root, which a ghost record does not.
 */
const Present = async (
	Name: string,
	Seam_: Seam,
	Configuration_: Configuration,
): Promise<boolean> =>
	(await Text(Seam_, Path.join(Expand(Configuration_.skillsRoot), Name, "SKILL.md"))) !== null;

/**
 * One pass over the store: the transitions it applied, or would apply on a dry run.
 */
export default async (
	Now: Date,
	Store: Usage,
	Seam_: Seam,
	Configuration_: Configuration,
	DryRun = false,
): Promise<Curation> => {
	const Counts: Curation = {
		checked: 0,
		seeded: 0,
		markedStale: 0,
		archived: 0,
		reactivated: 0,
		dryRun: DryRun,
	};
	const StaleCutoff = Now.getTime() - Math.max(1, Configuration_.staleAfterDays) * Day;
	const ArchiveCutoff = Now.getTime() - Math.max(1, Configuration_.archiveAfterDays) * Day;
	for (const Stored of Store.All()) {
		const Record_ = Stored.record;
		const Name = Stored.name;
		// The candidate set: a record the plugin created or the user pinned, whose
		// directory still resolves under the writable root
		// (tools/skill_usage.py:699-704).
		switch (true) {
			case !Eligible(Record_):
				continue;
			case !(await Present(Name, Seam_, Configuration_)):
				continue;
			default:
				break;
		}
		Counts.checked += 1;
		// R1: the pin is absolute, and it skips the seeding too.
		switch (true) {
			case Record_.pinned:
				continue;
			default:
				break;
		}
		// R3: a record with no clock gets one full window, never an age from epoch.
		switch (true) {
			case Record_.firstSeenAt === null:
				switch (true) {
					case DryRun:
						Counts.seeded += 1;
						break;
					default:
						Store.Seeded(Name, Now);
						Counts.seeded += 1;
				}
				continue;
			default:
				break;
		}
		// R5: the anchor excludes `createdAt` from the activity stamps, so the
		// fallback is explicit.
		const Anchor = Moment(Record_.lastActivityAt ?? Record_.createdAt);
		// R6: zero use inside the grace floor suppresses EVERY transition, including
		// the un-staling, because zero uses is absence of evidence, not proof
		// (agent/curator.py:248-253).
		switch (true) {
			case Record_.useCount === 0 && Anchor > StaleCutoff:
				switch (true) {
					case Record_.state !== "stale":
						break;
					case DryRun:
						Counts.reactivated += 1;
						break;
					default:
						Store.State(Name, "active", Now);
						Counts.reactivated += 1;
				}
				continue;
			default:
				break;
		}
		switch (true) {
			// R7: archive, and count it only when the copy landed.
			case Anchor <= ArchiveCutoff && Record_.state !== "archived":
				switch (true) {
					case DryRun:
						Counts.archived += 1;
						break;
					default: {
						// The third gate: the predicate again, immediately before the copy.
						switch (true) {
							case !Eligible(Store.Get(Name) ?? Record_):
								break;
							default: {
								const Undone = await Archive(Name, Seam_, Configuration_);
								switch (true) {
									case !Undone.ok:
										break;
									default:
										Store.State(Name, "archived", Now);
										await Append(
											{
												actor: "curator",
												action: "archive",
												skill: Name,
												evidence: {
													session: "",
													reason: `inactive since ${Record_.lastActivityAt ?? Record_.createdAt}`,
													rule: "archive",
												},
												before: Undone.before,
												after: Undone.after,
											},
											Configuration_,
										);
										Counts.archived += 1;
								}
							}
						}
					}
				}
				break;
			// R8: stale, which is the only state this pass may set from `active`.
			case Anchor <= StaleCutoff && Record_.state === "active":
				switch (true) {
					case DryRun:
						Counts.markedStale += 1;
						break;
					default:
						Store.State(Name, "stale", Now);
						Counts.markedStale += 1;
				}
				break;
			// R9: the anchor moved back inside the cutoff, so the skill is in use again.
			case Anchor > StaleCutoff && Record_.state === "stale":
				switch (true) {
					case DryRun:
						Counts.reactivated += 1;
						break;
					default:
						Store.State(Name, "active", Now);
						Counts.reactivated += 1;
				}
				break;
			// R10: an archived record matches no arm above, so the state is terminal
			// here and only `Restore` leaves it.
			default:
				break;
		}
	}
	switch (true) {
		case DryRun:
			break;
		default:
			await Store.Save();
	}
	return Counts;
};
