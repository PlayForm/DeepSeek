// Archive - the neutralize-and-copy archive, and its restore.
//
// THERE IS NO MOVE AND NO DELETE IN THE SEAM (dsh-fs/lib/types/index.d.ts:61-240),
// so an archive is a COPY PLUS A NEUTRALIZATION, and together they preserve the
// bytes and take the skill out of the model's catalog
// (SKILL-LEARN-PLUGIN.md:552-572):
//
//   1. COPY every file of the skill package into `<archiveRoot>/<name>/` with
//      `createIfAbsent`, so an existing archive is never overwritten and a
//      collision takes the `<name>-<YYYYMMDDHHMMSS>` suffix.
//   2. NEUTRALIZE the live `SKILL.md` with `replaceIfVersion`, adding
//      `disable-model-invocation: true` to the frontmatter: the loader honors the
//      key and the `skill` tool filters on it, so the catalog stops offering the
//      skill while the bytes stay where they are.
//
// The live package never moves, and that is the honest reading of a seam that
// cannot move a file: the corpus keeps the bytes, the catalog stops offering
// them, and `Restore` puts the frontmatter back. Reaching for `node:fs.rename`
// instead would put a skill move outside the governed seam the rest of this
// design is built on, and an interrupted move would leave two copies with no
// record of which is live (SKILL-LEARN-PLUGIN.md:568-572).
//
// RESTORE REVERSES IT: read the archived `SKILL.md`, drop the
// `disable-model-invocation` line, and write the live path with
// `replaceIfVersion`. It refuses a name outside `skillsRoot`, and it refuses a
// live file that is not the neutralized copy, because overwriting a live skill
// would clobber bytes this pass never took (tools/skill_usage.py:647-671).
//
// THE COPY IS TEXT ONLY, AND THAT IS A LIMIT OF THE SEAM, NOT A CHOICE: `ctx.fs`
// writes text, so a package that carries a binary asset cannot be copied at all.
// Such a package is left unarchived with a reported failure rather than copied
// with a hole in it, because an archive that silently drops a file is worse than
// a skill the curator cannot age.
import Path from "node:path";

import type { Touched } from "@Function/Ledger.js";
import { Expand, Text, type Seam } from "@Function/Write.js";
import type Configuration from "@Interface/Configuration.js";

/** The flag that takes a skill out of the model's catalog (dsh-skill-filesystem/lib/index.js:852-881). */
const Flag = /^disable-model-invocation\s*:/;

/** How deep the package walk descends below one skill directory. */
const Depth = 3;

/** What one archive produced. */
export interface Archived {
	/** Whether the copy landed and the live file was neutralized. */
	readonly ok: boolean;
	/** `archived` is the only success; the rest name why nothing was archived. */
	readonly outcome: "archived" | "absent" | "foreign-root" | "failed";
	/** The archive directory the copy landed in, or "" when nothing was copied. */
	readonly path: string;
	/** The live package as it was, for the ledger row's before side. */
	readonly before: readonly Touched[];
	/** The archive copy as it is, for the ledger row's after side. */
	readonly after: readonly Touched[];
	/** One clause of detail when the outcome is not `archived`. */
	readonly detail?: string;
}

/** What one restore produced. */
export interface Restored {
	/** Whether the live file was written back. */
	readonly ok: boolean;
	/** `restored` is the only success; the rest name why nothing was written. */
	readonly outcome:
		"restored" | "not-archived" | "destination-exists" | "foreign-root" | "failed";
	/** The live path that was written, or "" when nothing was written. */
	readonly path: string;
	/** One clause of detail when the outcome is not `restored`. */
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

/** The collision suffix: the directory name plus a 14-digit UTC stamp (tools/skill_usage.py:640-641). */
const Stamp = (): string => new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

/**
 * The live text with `disable-model-invocation: true` in its frontmatter, or null
 * when the file carries no frontmatter fence at all (a file the loader would skip
 * anyway). An existing value is replaced rather than duplicated, and a missing
 * line is appended to the block, so the transformation is a function of the text
 * and `Restore` can reverse it by dropping the line.
 */
const Neutral = (Given: string): string | null => {
	const Lines = Given.split("\n");
	const First = Lines[0] ?? "";
	switch (true) {
		case First.trim() !== "---":
			return null;
		default:
			break;
	}
	const End = Lines.findIndex((Line, Index) => Index > 0 && Line.trim() === "---");
	switch (true) {
		case End < 0:
			return null;
		default:
			break;
	}
	const Block = Lines.slice(1, End);
	const At = Block.findIndex((Line) => Flag.test(Line));
	switch (true) {
		case At >= 0:
			Block[At] = "disable-model-invocation: true";
			break;
		default:
			Block.push("disable-model-invocation: true");
	}
	return [First, ...Block, ...Lines.slice(End)].join("\n");
};

/** The text with every `disable-model-invocation` line dropped, which is the restore's whole edit. */
const Plain = (Given: string): string =>
	Given.split("\n")
		.filter((Line) => !Flag.test(Line))
		.join("\n");

/** Whether the frontmatter already carries the neutralization flag. */
const Flagged = (Given: string): boolean => Given.split("\n").some((Line) => Flag.test(Line));

/** Every support file of one skill package, as paths relative to the skill directory. */
const Gather = async (
	Seam_: Seam,
	Directory: string,
	Depth_: number,
	Relative: string,
	Files: string[],
): Promise<void> => {
	const Children = await Seam_.listDir(await Seam_.resolve(Directory));
	for (const Child of Children) {
		const Named = Relative === "" ? Child.name : `${Relative}/${Child.name}`;
		switch (true) {
			case Child.name.startsWith("."):
				continue;
			case Child.name === "SKILL.md" && Relative === "":
				continue;
			case Child.type === "file":
				Files.push(Named);
				break;
			case Child.type === "directory" && Depth_ > 0:
				await Gather(Seam_, Path.join(Directory, Child.name), Depth_ - 1, Named, Files);
				break;
			default:
				break;
		}
	}
};

/**
 * Copy one skill package into the archive and neutralize the live `SKILL.md`.
 * The worst outcome any pass in this plugin may produce, and it removes nothing.
 */
export default async (
	Name: string,
	Seam_: Seam,
	Configuration_: Configuration,
): Promise<Archived> => {
	const Root = Expand(Configuration_.skillsRoot);
	const Archive = Expand(Configuration_.archiveRoot);
	const Live = Path.join(Root, Name, "SKILL.md");
	try {
		const Target_ = await Seam_.resolve(Live);
		switch (true) {
			case !Seam_.contains(await Seam_.resolve(Root), Target_):
				return {
					ok: false,
					outcome: "foreign-root",
					path: "",
					before: [],
					after: [],
					detail: `${Live} is outside ${Root}`,
				};
			case Seam_.contains(await Seam_.resolve(Archive), Target_):
				return {
					ok: false,
					outcome: "foreign-root",
					path: "",
					before: [],
					after: [],
					detail: `${Live} is inside the archive`,
				};
			default:
				break;
		}
		const Info_ = await Seam_.stat(Target_);
		if (Info_ === undefined) {
			return { ok: false, outcome: "absent", path: "", before: [], after: [] };
		}
		const Body = await Seam_.readText(Target_);
		const Relative: string[] = [];
		await Gather(Seam_, Path.join(Root, Name), Depth, "", Relative);
		// The destination is keyed by the frontmatter name, which is the name every
		// restore, list, and purge looks up (tools/skill_usage.py:633-635).
		let Destination = Path.join(Archive, Name);
		switch (true) {
			case (await Text(Seam_, Path.join(Destination, "SKILL.md"))) !== null:
				// An existing archive is never overwritten: the collision takes the
				// stamped name, and the arm stops here rather than reading on.
				Destination = Path.join(Archive, `${Name}-${Stamp()}`);
				break;
			default:
				break;
		}
		const Before: Touched[] = [{ path: Live, text: Body }];
		const After: Touched[] = [];
		await Seam_.writeText(await Seam_.resolve(Path.join(Destination, "SKILL.md")), Body, {
			kind: "createIfAbsent",
		});
		After.push({ path: Path.join(Destination, "SKILL.md"), text: Body });
		for (const Named of Relative) {
			const Source = Path.join(Root, Name, Named);
			const Copied = await Text(Seam_, Source);
			if (Copied === null) {
				continue;
			}
			await Seam_.writeText(await Seam_.resolve(Path.join(Destination, Named)), Copied, {
				kind: "createIfAbsent",
			});
			Before.push({ path: Source, text: Copied });
			After.push({ path: Path.join(Destination, Named), text: Copied });
		}
		const Neutralized = Neutral(Body);
		if (Neutralized === null) {
			return {
				ok: false,
				outcome: "failed",
				path: Destination,
				before: Before,
				after: After,
				detail: "no-frontmatter",
			};
		}
		if (Neutralized === Body) {
			// Already neutralized: the catalog already omits it, so the live file needs
			// no write and the archive is complete.
			return {
				ok: true,
				outcome: "archived",
				path: Destination,
				before: Before,
				after: After,
			};
		}
		await Seam_.writeText(Target_, Neutralized, {
			kind: "replaceIfVersion",
			version: Info_.version,
		});
		return { ok: true, outcome: "archived", path: Destination, before: Before, after: After };
	} catch (Cause) {
		return {
			ok: false,
			outcome: "failed",
			path: "",
			before: [],
			after: [],
			detail: Failure(Cause),
		};
	}
};

/**
 * Write one archived skill back to its live path and drop the neutralization
 * line. The live package never moved, so the destination always exists: the
 * guarded write replaces the neutralized copy and the archive keeps the bytes.
 */
export const Restore = async (
	Name: string,
	Seam_: Seam,
	Configuration_: Configuration,
): Promise<Restored> => {
	const Root = Expand(Configuration_.skillsRoot);
	const Archive = Expand(Configuration_.archiveRoot);
	const Live = Path.join(Root, Name, "SKILL.md");
	try {
		switch (true) {
			case !Seam_.contains(await Seam_.resolve(Root), await Seam_.resolve(Live)):
				return {
					ok: false,
					outcome: "foreign-root",
					path: "",
					detail: `${Live} is outside ${Root}`,
				};
			default:
				break;
		}
		let Source = Path.join(Archive, Name, "SKILL.md");
		switch (true) {
			case (await Text(Seam_, Source)) === null: {
				// The collision suffix: the newest `<name>-<14 digits>` archive wins
				// (tools/skill_usage.py:657-666). An absent archive root is an empty
				// listing, not a failure.
				const Prefix = `${Name}-`;
				let Children: readonly { readonly name: string }[] = [];
				try {
					Children = await Seam_.listDir(await Seam_.resolve(Archive));
				} catch {
					Children = [];
				}
				const Names = Children.map((Child) => Child.name)
					.filter(
						(Child) =>
							Child.startsWith(Prefix) && /^\d{14}$/.test(Child.slice(Prefix.length)),
					)
					.sort()
					.reverse();
				const Newest = Names[0];
				if (Newest === undefined) {
					return { ok: false, outcome: "not-archived", path: "" };
				}
				Source = Path.join(Archive, Newest, "SKILL.md");
				break;
			}
			default:
				break;
		}
		const Stored = await Text(Seam_, Source);
		if (Stored === null) {
			return { ok: false, outcome: "not-archived", path: "" };
		}
		const Target_ = await Seam_.resolve(Live);
		const Info_ = await Seam_.stat(Target_);
		if (Info_ === undefined) {
			await Seam_.writeText(Target_, Plain(Stored), { kind: "createIfAbsent" });
			return { ok: true, outcome: "restored", path: Live };
		}
		if (!Flagged(await Seam_.readText(Target_))) {
			// A live skill that is not the neutralized copy: restoring would clobber
			// bytes this pass never took.
			return { ok: false, outcome: "destination-exists", path: "" };
		}
		await Seam_.writeText(Target_, Plain(Stored), {
			kind: "replaceIfVersion",
			version: Info_.version,
		});
		return { ok: true, outcome: "restored", path: Live };
	} catch (Cause) {
		return { ok: false, outcome: "failed", path: "", detail: Failure(Cause) };
	}
};
