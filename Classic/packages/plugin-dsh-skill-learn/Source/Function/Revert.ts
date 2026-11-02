// Revert - one ledger row back to files, fail-closed.
//
// THE ROW NAMES THE BLOBS AND THE BLOBS ARE THE CONTENT, so a revert never has to
// guess what a file looked like before (SKILL-LEARN-PLUGIN.md:470-484). It is the
// same mechanism as the backup, which is why the ledger is the only durable
// record this plugin needs.
//
// THE ORDER IS THE SAFETY. Every referenced blob is pre-checked BEFORE anything
// changes: a missing blob aborts the whole revert, because restoring four of five
// files would leave a package nobody asked for (curator_backup.py:409-427,
// Hermes-Consolidation.md:390-392). Then a whole-tree snapshot and a
// `pre-rollback` row are written; if either fails, nothing changes. Only then do
// the files move.
//
// THIS IS THE ONE PATH THAT FAILS CLOSED. The ledger is telemetry everywhere else
// and a mutation still lands when an append fails (tools/skill_ledger.py:8); here
// a failed safety capture stops the run, because the run's whole purpose is to
// make the previous state recoverable.
//
// THE DELIBERATE DIVERGENCE FROM HERMES: an undone `create` is ARCHIVED, never
// removed (SKILL-LEARN-PLUGIN.md:484). Hermes' rollback deletes files it created
// (`curator.md:166-169`); this plugin's "never delete" is absolute, so the bytes
// stay in the archive where the user can still reach them. A single support file
// has no archive form, so it is left in place and reported as retained.
import Archive from "@Function/Archive.js";
import Append, { Blob, Rows, type Touched } from "@Function/Ledger.js";
import Snapshot from "@Function/Snapshot.js";
import { Text, type Seam } from "@Function/Write.js";
import type Configuration from "@Interface/Configuration.js";
import type { LedgerRow } from "@Interface/Ledger.js";

/** What one revert produced. */
export interface Reverted {
	/** Whether every file the row named was put back. */
	readonly ok: boolean;
	/** `reverted` is the only success; the rest name why nothing was put back. */
	readonly outcome:
		"reverted" | "missing" | "blob-missing" | "stale" | "staging-retained" | "failed";
	/** How many files were written from their blob. */
	readonly restored: number;
	/** How many files were deliberately left in place. */
	readonly retained: number;
	/** One clause of detail: the missing blob, the stale path, the safety failure. */
	readonly detail?: string;
}

/** The typed code of a harness failure, or the message when it carries none. */
const Failure = (Cause: unknown): string => {
	const Code = (Cause as { readonly code?: unknown } | undefined)?.code;
	switch (true) {
		case typeof Code === "string":
			return Code;
		case Cause instanceof Error:
			return Cause.message;
		default:
			return String(Cause);
	}
};

/** The row whose id is the identifier; the newest match wins, because ids are unique. */
const Find = (Rows_: readonly LedgerRow[], Identifier: string): LedgerRow | undefined => {
	let Found: LedgerRow | undefined;
	for (const Row of Rows_) {
		switch (true) {
			case Row.id === Identifier:
				Found = Row;
				break;
			default:
				break;
		}
	}
	return Found;
};

/**
 * Put one ledger row's files back. Fails closed on a missing blob or a failed
 * safety capture, and reports rather than throws on everything else.
 */
export default async (
	Identifier: string,
	Seam_: Seam,
	Configuration_: Configuration,
): Promise<Reverted> => {
	try {
		const Row = Find(await Rows(Configuration_), Identifier);
		if (Row === undefined) {
			return { ok: false, outcome: "missing", restored: 0, retained: 0 };
		}
		// 1. The fail-closed pre-check: every blob this revert would write.
		const Bodies = new Map<string, string>();
		for (const File of Row.before) {
			const Body = await Blob(File.sha256, Configuration_);
			if (Body === null) {
				return {
					ok: false,
					outcome: "blob-missing",
					restored: 0,
					retained: 0,
					detail: File.sha256,
				};
			}
			Bodies.set(File.path, Body);
		}
		// 2. The safety capture, before anything changes.
		const Safety = await Snapshot(`pre-rollback to ${Row.id}`, Seam_, Configuration_);
		switch (true) {
			case Safety.id === "":
				// Nothing was touched, so the corpus IS the retained copy.
				return {
					ok: false,
					outcome: "staging-retained",
					restored: 0,
					retained: 0,
					detail: Safety.error ?? "snapshot",
				};
			default:
				break;
		}
		const Current: Touched[] = [];
		for (const Absolute of new Set([...Row.before, ...Row.after].map((File) => File.path))) {
			Current.push({ path: Absolute, text: await Text(Seam_, Absolute) });
		}
		// The safety row records the state a second revert would restore; its after
		// side is empty on purpose, because nothing has been written yet.
		await Append(
			{
				actor: "user",
				action: "revert",
				skill: Row.skill,
				evidence: {
					session: "",
					reason: `safety capture before reverting ${Row.id}`,
					rule: "pre-rollback",
				},
				before: Current,
				after: [],
			},
			Configuration_,
		);
		// 3. The files, each behind a guard that matches the side of the existence
		// line it is on: a file that is back is replaced at its fresh version, and a
		// file that is gone is created rather than overwritten.
		let Restored = 0;
		for (const [Absolute, Body] of Bodies) {
			const Target_ = await Seam_.resolve(Absolute);
			const Info_ = await Seam_.stat(Target_);
			if (Info_ === undefined) {
				await Seam_.writeText(Target_, Body, { kind: "createIfAbsent" });
			} else {
				await Seam_.writeText(Target_, Body, {
					kind: "replaceIfVersion",
					version: Info_.version,
				});
			}
			Restored += 1;
		}
		// 4. An undone create has no file to put back, so it is archived instead:
		// the plugin never deletes, and the archive is the user's copy.
		let Retained = 0;
		switch (true) {
			case Row.action === "create": {
				const Undone = await Archive(Row.skill, Seam_, Configuration_);
				switch (true) {
					case Undone.ok:
						Retained += 1;
						break;
					default:
						return {
							ok: false,
							outcome: "failed",
							restored: Restored,
							retained: 0,
							detail: `archive ${Undone.outcome}`,
						};
				}
				break;
			}
			// A support file that did not exist before has no archive form, so it stays
			// and the row says so (SKILL-LEARN-PLUGIN.md:481).
			case Row.action === "support" && Row.before.length === 0:
				Retained += 1;
				break;
			default:
				break;
		}
		// 5. The revert's own row: what was there, and what the restore put back.
		const After: Touched[] = [];
		for (const [Absolute, Body] of Bodies) {
			After.push({ path: Absolute, text: Body });
		}
		const Written = await Append(
			{
				actor: "user",
				action: "revert",
				skill: Row.skill,
				evidence: {
					session: "",
					reason: `revert ${Row.id}`,
					rule: "revert",
				},
				before: Current,
				after: After,
			},
			Configuration_,
		);
		switch (true) {
			case Written.id === "":
				return {
					ok: true,
					outcome: "reverted",
					restored: Restored,
					retained: Retained,
					detail: `ledger ${Written.error ?? "append failed"}`,
				};
			default:
				return { ok: true, outcome: "reverted", restored: Restored, retained: Retained };
		}
	} catch (Cause) {
		const Detail = Failure(Cause);
		switch (true) {
			case Detail === "FS_STALE_VERSION":
				return { ok: false, outcome: "stale", restored: 0, retained: 0, detail: Detail };
			default:
				return { ok: false, outcome: "failed", restored: 0, retained: 0, detail: Detail };
		}
	}
};
