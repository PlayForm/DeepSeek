import OS from "node:os";
import Path from "node:path";

import type Configuration from "@Interface/Configuration.js";
import type { Corpus } from "@Interface/Corpus.js";
import type { Operation } from "@Interface/Operation.js";

/**
 * @module Write
 *
 * The fence: the ONLY leaf that turns a judged operation into bytes, and the home of
 * the two pieces of vocabulary the whole write side shares.
 *
 * @remarks
 *
 * THE FENCE IS THREE CHECKS IN ORDER, and each exists because the layer below it cannot
 * be trusted to make it (SKILL-LEARN-PLUGIN.md:427-445):
 *
 * - THE ROOT FENCE. The resolved target must be contained by `skillsRoot` and NOT by
 *   `archiveRoot`, and a support path must stay inside its own skill directory.
 *   `resolve` is "a resolution default, NOT a containment boundary"
 *   (dsh-fs-local/lib/index.js:719-723), so a skill whose catalog entry lives under a
 *   project root, ~/.agents/skills, or a bundled root resolves to a perfectly valid
 *   target, and the plugin's own `contains` call is the only thing that refuses it. The
 *   failure class is `foreign-root` (SKILL-LEARN-PLUGIN.md:441).
 * - THE BODY RE-FETCH. The target's current text is compared byte for byte with the
 *   body the confirm prompt carried, so a body that moved between the two model calls
 *   is refused instead of patched at the wrong offset (SKILL-LEARN-PLUGIN.md:290-297).
 *   A difference is `body-carried` with `detail: body-drifted`, and the write is never
 *   attempted.
 * - THE EXISTENCE LINE. A create writes with `createIfAbsent`, which rejects an
 *   existing path with FS_NOT_OBSERVED; a patch edits with `editText` behind the
 *   version `stat` just returned, which checks the version BEFORE it matches a
 *   character and reports FS_STALE_VERSION rather than an ambiguous match
 *   (dsh-fs/lib/types/types.d.ts:105-116, dsh-fs/lib/types/index.d.ts:222-225).
 *   Omitting the intent would be an unconditional overwrite, which this plugin never
 *   performs (dsh-fs/lib/types/types.d.ts:106-110).
 *
 * A REFUSAL IS RETURNED, NEVER THROWN: the caller records it and keeps the rest of the
 * run, and a throw here would discard every operation the judge accepted.
 *
 * WHY THE SEAM IS DECLARED HERE. Interface/Services.ts owns the harness's own shape;
 * this leaf restates the seven members the write path calls as a structural subset, for
 * three reasons: a widened service cannot widen the fence by accident, the version
 * token stays opaque so no consumer manufactures one
 * (dsh-fs/lib/types/types.d.ts:32-36), and the service passes `ctx.fs` to it
 * structurally. `Expand` lives here for the family precedent that puts it beside the
 * write (Classic/packages/plugin-dsh-lesson-review/Source/Function/Apply.ts:26-28).
 */
/**
 * The opaque freshness token; the harness brands it and the fence keeps it opaque.
 */
type Version = string;

/**
 * One path resolved into a stable identity.
 */
interface Target {
	readonly targetKey: string;
	readonly displayPath: string;
}

/**
 * What `stat` reports, narrowed to the two fields the fence reads.
 */
interface Info {
	readonly version: Version;
	readonly type: "file" | "directory" | "other";
}

/**
 * One direct child, narrowed to the fields the archive walk reads.
 */
interface Child {
	readonly name: string;
	readonly type: "file" | "directory" | "other";
	readonly target: Target;
}

/**
 * The guarded write intent; there is no third arm, because an unconditional write is the defect.
 */
type Intent =
	| { readonly kind: "createIfAbsent" }
	| { readonly kind: "replaceIfVersion"; readonly version: Version };

/**
 * What a full-file write reports; `before` is null exactly on a create.
 */
interface Written {
	readonly before: string | null;
	readonly after: string;
}

/**
 * The literal edit request; `replaceAll` is always false, which is the harness's own anchor check.
 */
interface Edit {
	readonly oldString: string;
	readonly newString: string;
	readonly replaceAll: boolean;
}

/**
 * What a literal edit reports; both sides are always present.
 */
interface Edited {
	readonly before: string;
	readonly after: string;
}

/**
 * The seven filesystem members the write path calls, in the harness's own order
 * and with every optional trailing argument dropped. A real `ctx.fs` satisfies
 * this shape structurally.
 */
export interface Seam {
	resolve(path: string): Promise<Target>;
	stat(target: Target): Promise<Info | undefined>;
	readText(target: Target): Promise<string>;
	listDir(target: Target): Promise<readonly Child[]>;
	writeText(target: Target, content: string, expected?: Intent): Promise<Written>;
	editText(target: Target, edit: Edit, expected?: { readonly version: Version }): Promise<Edited>;
	contains(parent: Target, child: Target): boolean;
}

/**
 * One operation's carried body, the corpus view, and the seams it needs.
 */
export interface Attempt {
	/**
	 * The judged operation to land.
	 */
	readonly operation: Operation;

	/**
	 * The text the confirm prompt carried for the file this operation writes: the
	 * `SKILL.md` for a create or a patch, the support file for a support write,
	 * and null when that file did not exist or was not carried.
	 */
	readonly carried: string | null;
	readonly corpus: Corpus;
	readonly seam: Seam;
	readonly configuration: Configuration;
}

/**
 * One write that landed, with both texts, which is exactly what the ledger row needs.
 */
export interface Applied {
	/**
	 * The absolute path the bytes landed at.
	 */
	readonly path: string;

	/**
	 * The skill the write belongs to, by frontmatter name.
	 */
	readonly skill: string;

	/**
	 * The text before the write, or null for a creation.
	 */
	readonly before: string | null;

	/**
	 * The text after the write.
	 */
	readonly after: string;
}

/**
 * The fence's answer: the applied write, or the class and clause that refused it.
 */
export type Fenced =
	| { readonly ok: true; readonly applied: Applied }
	| {
			readonly ok: false;
			readonly outcome: "foreign-root" | "body-carried" | "failed";
			readonly detail: string;
	  };

/**
 * One operation's paths: the file it writes and the skill directory that must hold it.
 */
export interface Located {
	/**
	 * The absolute path the operation writes.
	 */
	readonly path: string;

	/**
	 * The skill directory the path may not leave.
	 */
	readonly base: string;
}

/**
 * Expand a leading `~`, the family's path convention for every knob. Every path
 * in the Configuration is written that way, so the leaf that touches one expands
 * it rather than trusting the caller to have done it.
 */
export const Expand = (Given: string): string =>
	Given.startsWith("~") ? Path.join(OS.homedir(), Given.slice(1)) : Given;

/**
 * The absolute paths an operation names, before any containment test. The judge
 * and the fence both call this, so the file a rule refuses is the file the write
 * would have touched: one computation, never two that can drift.
 */
export const Locate = (
	Operation_: Operation,
	Corpus_: Corpus,
	Configuration_: Configuration,
): Located => {
	const Root = Expand(Configuration_.skillsRoot);
	switch (Operation_.kind) {
		case "create":
			return {
				path: Path.join(Root, Operation_.skill, "SKILL.md"),
				base: Path.join(Root, Operation_.skill),
			};
		case "patch": {
			const Resolved = Corpus_.resolve(Operation_.skill);
			const Base =
				Resolved === null ? Path.join(Root, Operation_.skill) : Path.dirname(Resolved);
			return { path: Resolved ?? Path.join(Base, "SKILL.md"), base: Base };
		}
		default: {
			const Resolved = Corpus_.resolve(Operation_.skill);
			const Base =
				Resolved === null ? Path.join(Root, Operation_.skill) : Path.dirname(Resolved);
			return { path: Path.join(Base, Operation_.filePath), base: Base };
		}
	}
};

/**
 * One path's text, or null when the target is absent.
 */
export const Text = async (Seam_: Seam, Absolute: string): Promise<string | null> => {
	const Target_ = await Seam_.resolve(Absolute);
	switch (true) {
		case (await Seam_.stat(Target_)) === undefined:
			return null;
		default:
			return Seam_.readText(Target_);
	}
};

/**
 * The typed code of a harness failure, or the message when it carries none.
 */
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

/**
 * The target's text and the version `stat` just returned, or undefined when it is absent.
 */
const Read = async (
	Seam_: Seam,
	Absolute: string,
): Promise<
	{ readonly target: Target; readonly text: string; readonly version: Version } | undefined
> => {
	const Target_ = await Seam_.resolve(Absolute);
	const Info_ = await Seam_.stat(Target_);
	if (Info_ === undefined) {
		return undefined;
	}
	return { target: Target_, text: await Seam_.readText(Target_), version: Info_.version };
};

/**
 * One landed write, built from either a full-file write or a literal edit.
 */
const Landed = (Path_: string, Skill: string, Written_: Written): Applied => ({
	path: Path_,
	skill: Skill,
	before: Written_.before,
	after: Written_.after,
});

export default async (Attempt_: Attempt): Promise<Fenced> => {
	const Operation_ = Attempt_.operation;
	const Seam_ = Attempt_.seam;
	const Knobs = Attempt_.configuration;
	const Located_ = Locate(Operation_, Attempt_.corpus, Knobs);
	try {
		const Root = await Seam_.resolve(Expand(Knobs.skillsRoot));
		const Archive = await Seam_.resolve(Expand(Knobs.archiveRoot));
		const Target_ = await Seam_.resolve(Located_.path);
		switch (true) {
			case !Seam_.contains(Root, Target_):
				return {
					ok: false,
					outcome: "foreign-root",
					detail: `${Located_.path} is outside ${Expand(Knobs.skillsRoot)}`,
				};
			case Seam_.contains(Archive, Target_):
				return {
					ok: false,
					outcome: "foreign-root",
					detail: `${Located_.path} is inside the archive`,
				};
			case !Seam_.contains(await Seam_.resolve(Located_.base), Target_):
				return {
					ok: false,
					outcome: "foreign-root",
					detail: `${Located_.path} is outside ${Located_.base}`,
				};
			default:
				break;
		}
		switch (Operation_.kind) {
			case "create": {
				// The provider's createIfAbsent IS the existence check, and its
				// publication step is a hard link, so a concurrent creator wins the
				// race and this call reports it instead of overwriting a file it never
				// read (dsh-fs-local/lib/index.js:497-511, :871).
				const Written_ = await Seam_.writeText(Target_, Operation_.content, {
					kind: "createIfAbsent",
				});
				return { ok: true, applied: Landed(Located_.path, Operation_.skill, Written_) };
			}
			case "patch": {
				const Current = await Read(Seam_, Located_.path);
				if (Current === undefined) {
					// The body the model was shown is gone: a drift, not a missing skill.
					return { ok: false, outcome: "body-carried", detail: "body-drifted" };
				}
				switch (true) {
					case Attempt_.carried === null:
						return { ok: false, outcome: "body-carried", detail: "body-uncarried" };
					case Attempt_.carried !== Current.text:
						return { ok: false, outcome: "body-carried", detail: "body-drifted" };
					default:
						break;
				}
				// replaceAll is false so the harness itself enforces anchor-unique
				// (dsh-fs/lib/types/index.d.ts:222-237).
				const Edited_ = await Seam_.editText(
					Target_,
					{
						oldString: Operation_.oldString,
						newString: Operation_.newString,
						replaceAll: false,
					},
					{ version: Current.version },
				);
				return { ok: true, applied: Landed(Located_.path, Operation_.skill, Edited_) };
			}
			default: {
				const Current = await Read(Seam_, Located_.path);
				if (Current === undefined) {
					// A new support file: the skill's body was carried, and there is
					// nothing at the destination to clobber.
					const Written_ = await Seam_.writeText(Target_, Operation_.newString, {
						kind: "createIfAbsent",
					});
					return { ok: true, applied: Landed(Located_.path, Operation_.skill, Written_) };
				}
				switch (true) {
					case Attempt_.carried === null:
						return { ok: false, outcome: "body-carried", detail: "body-uncarried" };
					case Attempt_.carried !== Current.text:
						return { ok: false, outcome: "body-carried", detail: "body-drifted" };
					default:
						break;
				}
				// An overwrite is allowed, and it is safe because the version comes from
				// the stat immediately above (SKILL-LEARN-PLUGIN.md:841-844).
				const Written_ = await Seam_.writeText(Target_, Operation_.newString, {
					kind: "replaceIfVersion",
					version: Current.version,
				});
				return { ok: true, applied: Landed(Located_.path, Operation_.skill, Written_) };
			}
		}
	} catch (Cause) {
		return { ok: false, outcome: "failed", detail: Failure(Cause) };
	}
};
