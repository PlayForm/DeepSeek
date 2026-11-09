/**
 * @module Ledger
 *
 * The audit ledger: one row per mutation, the content-addressed blobs the row points
 * at, and the delta manifests that make a revert possible.
 *
 * @remarks
 * TELEMETRY, NOT A GATE (tools/skill_ledger.py:8, Hermes-Curator-Pass.md:274-282).
 * Every public write path here swallows its failure and returns why: the write it
 * describes has already happened, so refusing the write because the record failed would
 * trade a durable change for a missing note. The one caller that treats a ledger
 * failure as fatal is a revert, and it fails closed on the SNAPSHOT it takes, not on
 * this row.
 *
 * THE BLOBS ARE THE CONTENT, and the row is a set of addresses. `before` and `after`
 * are DELTAS: a path whose hash is identical on both sides is dropped, and a path
 * present on one side only is kept, which is how a creation stays visible while an
 * unchanged sibling disappears (tools/skill_ledger.py:286-295,
 * SKILL-LEARN-PLUGIN.md:468). The bytes are stored before the row is appended, so a row
 * never names a blob that does not exist yet.
 *
 * THIS IS THE ONE SANCTIONED USE OF `node:fs` for the plugin's own bookkeeping, bounded
 * to `<stateRoot>` and `<blobRoot>`: the harness offers an append and a prune that
 * `ctx.fs` does not, and the family's sibling already writes its corpus that way
 * (Classic/packages/plugin-dsh-lesson-review/Source/Function/Apply.ts:19,
 * SKILL-LEARN-PLUGIN.md:401-406). It never touches a skill path; every skill mutation
 * goes through the fence in `Function/Write.ts`.
 */
import { createHash, randomBytes } from "node:crypto";
import FileSystem from "node:fs/promises";
import Path from "node:path";

import { Expand } from "@Function/Write.js";
import type Configuration from "@Interface/Configuration.js";
import type { LedgerEvidence, LedgerFile, LedgerRow } from "@Interface/Ledger.js";

/** The six mutation kinds a row may name (Interface/Ledger.ts:38). */
const Actions: readonly string[] = ["create", "patch", "support", "archive", "restore", "revert"];

/** One file a mutation touched, with the text it held; null text means it did not exist. */
export interface Touched {
	/** The absolute path the bytes belong to. */
	readonly path: string;

	/** The file's text, or null when the file did not exist on that side of the mutation. */
	readonly text: string | null;
}

/** One mutation to record: what it did, to which skill, and the texts on both sides. */
export interface Mutation {
	readonly actor: "curator" | "agent" | "user";
	readonly action: "create" | "patch" | "support" | "archive" | "restore" | "revert";
	readonly skill: string;
	readonly evidence: LedgerEvidence;

	/** The files as they were, with their text. */
	readonly before: readonly Touched[];

	/** The files as they are, with their text. */
	readonly after: readonly Touched[];
}

/** The append's answer: the row id, or why there is none. */
export interface Appended {
	/** The twelve hex characters that name the row, or "" when the append failed. */
	readonly id: string;

	/** Why the append failed, for the one log line; absent on success. */
	readonly error?: string;
}

/** The one pair of fields a row entry carries (Interface/Ledger.ts:13-18). */
const Files = (Raw: readonly unknown[]): LedgerFile[] => {
	const Listed: LedgerFile[] = [];
	for (const Entry of Raw) {
		const Value = (Entry ?? {}) as Record<string, unknown>;
		const Path_ = Value["path"];
		const Digest = Value["sha256"];
		if (typeof Path_ !== "string" || typeof Digest !== "string") {
			continue;
		}
		Listed.push({ path: Path_, sha256: Digest });
	}
	return Listed;
};

/** One ledger row read back from the JSONL, or undefined when the line is not a row. */
const Read = (Raw: unknown): LedgerRow | undefined => {
	const Value = (Raw ?? {}) as Record<string, unknown>;
	const Id = Value["id"];
	const Skill = Value["skill"];
	const Before = Value["before"];
	const After = Value["after"];
	const Actor = Value["actor"];
	const Action = Value["action"];
	const Evidence = (Value["evidence"] ?? {}) as Record<string, unknown>;
	switch (true) {
		case typeof Id !== "string" || Id === "":
			return undefined;
		case typeof Skill !== "string":
			return undefined;
		case !Array.isArray(Before) || !Array.isArray(After):
			return undefined;
		default:
			break;
	}
	const Stamp = Value["ts"];
	const Rule = Evidence["rule"];
	const Session = Evidence["session"];
	const Reason = Evidence["reason"];
	return {
		id: Id as string,
		ts: typeof Stamp === "string" ? Stamp : "",
		actor: Actor === "curator" || Actor === "user" ? Actor : "agent",
		action:
			typeof Action === "string" && Actions.includes(Action)
				? (Action as LedgerRow["action"])
				: "patch",
		skill: Skill as string,
		evidence: {
			session: typeof Session === "string" ? Session : "",
			reason: typeof Reason === "string" ? Reason : "",
			rule: typeof Rule === "string" ? Rule : "",
		},
		before: Files(Before as readonly unknown[]),
		after: Files(After as readonly unknown[]),
	};
};

/**
 * Store one text as a content-addressed blob and return its sha256. Identical
 * bytes cost one file, so a hundred rows touching the same unchanged file cost
 * one blob (tools/skill_ledger.py:137-146). The write lands through a temporary
 * file and a rename, so a crash mid-capture cannot leave a half blob under the
 * hash of its whole content.
 */
export const Capture = async (Text: string, Configuration_: Configuration): Promise<string> => {
	const Digest = createHash("sha256").update(Text, "utf8").digest("hex");
	const Root = Expand(Configuration_.blobRoot);
	const File = Path.join(Root, Digest);
	await FileSystem.mkdir(Root, { recursive: true });
	try {
		await FileSystem.access(File);
		return Digest;
	} catch {
		/* absent: capture it */
	}
	const Temporary = `${File}.${randomBytes(4).toString("hex")}.tmp`;
	await FileSystem.writeFile(Temporary, Text, "utf8");
	await FileSystem.rename(Temporary, File);
	return Digest;
};

/** One blob's text, or null when the store does not hold it or the key is not a digest. */
export const Blob = async (
	Digest: string,
	Configuration_: Configuration,
): Promise<string | null> => {
	// Only a lowercase sha256 names a blob: the store refuses any other key, so a
	// hand-edited ledger row cannot read a path of its own choosing
	// (tools/skill_ledger.py:149-155).
	switch (true) {
		case !/^[0-9a-f]{64}$/.test(Digest):
			return null;
		default:
			break;
	}
	try {
		return await FileSystem.readFile(
			Path.join(Expand(Configuration_.blobRoot), Digest),
			"utf8",
		);
	} catch {
		return null;
	}
};

/** The delta of two manifests: unchanged paths are dropped, one-sided paths survive. */
const Delta = (
	Before: readonly LedgerFile[],
	After: readonly LedgerFile[],
): { readonly before: readonly LedgerFile[]; readonly after: readonly LedgerFile[] } => {
	const Left = new Map(Before.map((File) => [File.path, File.sha256]));
	const Right = new Map(After.map((File) => [File.path, File.sha256]));
	return {
		before: Before.filter((File) => Right.get(File.path) !== File.sha256),
		after: After.filter((File) => Left.get(File.path) !== File.sha256),
	};
};

/** Capture one side of a mutation: every touched file that held text becomes a blob. */
const Manifest = async (
	Files_: readonly Touched[],
	Configuration_: Configuration,
): Promise<LedgerFile[]> => {
	const Listed: LedgerFile[] = [];
	for (const File of Files_) {
		if (File.text === null) {
			continue;
		}
		Listed.push({ path: File.path, sha256: await Capture(File.text, Configuration_) });
	}
	return Listed;
};

/**
 * Every row the ledger holds, oldest first. A line that does not parse is skipped
 * rather than fatal: a crash mid-append leaves a partial tail, and losing the
 * audit tail must not cost the revert path its whole history.
 */
export const Rows = async (Configuration_: Configuration): Promise<readonly LedgerRow[]> => {
	let Text: string;
	try {
		Text = await FileSystem.readFile(Expand(Configuration_.ledgerPath), "utf8");
	} catch {
		return [];
	}
	const Listed: LedgerRow[] = [];
	for (const Line of Text.split("\n")) {
		if (Line.trim() === "") {
			continue;
		}
		let Raw: unknown;
		try {
			Raw = JSON.parse(Line);
		} catch {
			continue;
		}
		const Row = Read(Raw);
		if (Row === undefined) {
			continue;
		}
		Listed.push(Row);
	}
	return Listed;
};

/** Append one row, capturing its blobs first. Never throws, and never blocks a write. */
export default async (Mutation_: Mutation, Configuration_: Configuration): Promise<Appended> => {
	try {
		const Before = await Manifest(Mutation_.before, Configuration_);
		const After = await Manifest(Mutation_.after, Configuration_);
		const Change = Delta(Before, After);
		const Row: LedgerRow = {
			id: randomBytes(6).toString("hex"),
			ts: new Date().toISOString(),
			actor: Mutation_.actor,
			action: Mutation_.action,
			skill: Mutation_.skill,
			evidence: Mutation_.evidence,
			before: Change.before,
			after: Change.after,
		};
		const File = Expand(Configuration_.ledgerPath);
		await FileSystem.mkdir(Path.dirname(File), { recursive: true });
		await FileSystem.appendFile(File, `${JSON.stringify(Row)}\n`, "utf8");
		return { id: Row.id };
	} catch (Cause) {
		return { id: "", error: Cause instanceof Error ? Cause.message : String(Cause) };
	}
};
