// Apply - the guarded corpus write: the ONLY module that touches the skill
// tree, and the place where the judge's acceptance becomes a file.
//
// THE FENCE IS THE EXISTENCE CHECK, not a version number. Every operation
// declares which side of the existence line it lives on, and the write refuses
// the other side:
//
//   create  -> the SKILL.md must NOT exist   (a create never overwrites)
//   patch   -> the SKILL.md must exist       (a patch never invents a skill)
//   support -> the skill directory must exist (a file never creates a skill)
//   archive -> the directory must exist and the archive target must NOT
//
// A refusal is returned, never thrown: the caller records it as a rejection and
// keeps the rest of the run. A throw here would discard every operation the
// judge already accepted.
//
// AGREEMENT OPERATIONS NEVER REACH THIS MODULE. `~/.dsh/AGENTS.md` is the
// user's file; the service queues those proposals and says so in the ledger.
import FileSystem from "node:fs/promises";
import OS from "node:os";
import Path from "node:path";

import type Configuration from "@Interface/Config.js";
import type { Op } from "@Interface/Proposal.js";

/** Expand a leading `~` (the family's path convention for every knob). */
export const Expand = (Path_: string): string =>
	Path_.startsWith("~") ? Path.join(OS.homedir(), Path_.slice(1)) : Path_;

/** The apply result: where it landed, or why it did not. */
export type ApplyResult = { ok: true; path: string } | { ok: false; error: string };

/** Whether a path exists (any type). */
const Exists = async (Target: string): Promise<boolean> => {
	try {
		await FileSystem.stat(Target);
		return true;
	} catch {
		return false;
	}
};

/** Write one file, creating its directory (never the skill root's parents). */
const Write = async (Target: string, Body: string): Promise<void> => {
	await FileSystem.mkdir(Path.dirname(Target), { recursive: true });
	await FileSystem.writeFile(Target, Body.endsWith("\n") ? Body : `${Body}\n`, "utf8");
};

export default async (Op: Op, Knobs: Configuration): Promise<ApplyResult> => {
	const Root = Expand(Knobs.skillsRoot);
	const Archive = Expand(Knobs.archiveRoot);
	const Directory = Path.join(Root, Op.name);
	const Skill = Path.join(Directory, "SKILL.md");
	try {
		switch (Op.op) {
			case "create": {
				switch (true) {
					case await Exists(Skill):
						return { ok: false, error: "exists" };
					default:
						await Write(Skill, Op.body ?? "");
						return { ok: true, path: Skill };
				}
			}
			case "patch": {
				switch (true) {
					case !(await Exists(Skill)):
						return { ok: false, error: "missing" };
					default:
						await Write(Skill, Op.body ?? "");
						return { ok: true, path: Skill };
				}
			}
			case "support": {
				switch (true) {
					case !(await Exists(Directory)):
						return { ok: false, error: "missing" };
					default: {
						const Target = Path.join(Directory, Op.file ?? "");
						// A support path may not escape the skill directory.
						switch (true) {
							case !Target.startsWith(`${Directory}${Path.sep}`):
								return { ok: false, error: "support-path" };
							default:
								await Write(Target, Op.body ?? "");
								return { ok: true, path: Target };
						}
					}
				}
			}
			case "archive": {
				const Target = Path.join(Archive, Op.name);
				switch (true) {
					case !(await Exists(Directory)):
						return { ok: false, error: "missing" };
					case await Exists(Target):
						return { ok: false, error: "archive-exists" };
					default:
						await FileSystem.mkdir(Archive, { recursive: true });
						await FileSystem.rename(Directory, Target);
						return { ok: true, path: Target };
				}
			}
			default:
				return { ok: false, error: "not-appliable" };
		}
	} catch (Cause) {
		return { ok: false, error: (Cause as Error)?.message ?? String(Cause) };
	}
};
