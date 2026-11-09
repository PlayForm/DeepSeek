/**
 * @module Snapshot
 *
 * The whole-tree manifest, its rotation, and the blob sweep.
 *
 * @remarks
 * A SNAPSHOT NAMES CONTENT INSTEAD OF COPYING IT. Every file's bytes already live in
 * the blob store, so a snapshot of an unchanged corpus costs one small JSON file, and a
 * rotation can drop a manifest without losing a byte that a retained ledger row still
 * references (SKILL-LEARN-PLUGIN.md:596-609, Interface/Snapshot.ts:1-12).
 *
 * THE CORPUS IS READ THROUGH `ctx.fs`, never through `node:fs`: the walk is a read of
 * skill paths, and the sanctioned `node:fs` use is bounded to the state root and the
 * blob root (SKILL-LEARN-PLUGIN.md:401-406). The manifests and the blobs are the
 * plugin's own bookkeeping and are written with `node:fs`.
 *
 * THE ROTATION DELETES THE PLUGIN'S OWN SNAPSHOTS AND BLOBS, NEVER A SKILL. That is the
 * one place the word delete appears in this design, and it is bounded to
 * `<snapshotRoot>` and `<blobRoot>` (SKILL-LEARN-PLUGIN.md:609).
 *
 * A BLOB YOUNGER THAN ONE HOUR SURVIVES THE SWEEP even when nothing references it,
 * because a capture may be in flight before its row exists
 * (tools/skill_ledger.py:485-497).
 */
import FileSystem from "node:fs/promises";
import Path from "node:path";

import { Capture, Rows } from "@Function/Ledger.js";
import { Expand, type Seam } from "@Function/Write.js";
import type Configuration from "@Interface/Configuration.js";
import type { SnapshotFile, SnapshotManifest } from "@Interface/Snapshot.js";

/** How deep the corpus walk descends: `SKILL.md`, `references/<file>`, and one more level. */
const Depth = 3;

/** The one-hour grace a blob gets before the sweep may delete it. */
const Grace = 3_600_000;

/** The snapshot id: `<YYYY-MM-DD>T<HH-MM-SSZ>`, with `-NN` on a same-second collision. */
const Shape = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z(?:-\d{2})?$/;

/** What one capture produced. */
export interface Taken {
	/** The snapshot id, or "" when the capture failed. */
	readonly id: string;

	/** The manifest that was written, or null when the capture failed. */
	readonly manifest: SnapshotManifest | null;

	/** Why the capture failed, for the one log line. */
	readonly error?: string;
}

/** What one rotation did. */
export interface Rotated {
	/** The snapshot ids the rotation pruned. */
	readonly pruned: readonly string[];

	/** How many unreferenced blobs the sweep deleted. */
	readonly swept: number;

	/** Why the rotation stopped early, when it did. */
	readonly error?: string;
}

/** The id for one instant, with the milliseconds and the colons removed. */
const Identify = (At: Date): string =>
	At.toISOString()
		.replace(/\.\d{3}Z$/, "Z")
		.replace(/:/g, "-");

/** Every regular file under one directory, skipping dot entries such as the archive. */
const Walk = async (
	Seam_: Seam,
	Directory: string,
	Depth_: number,
	Files: string[],
): Promise<void> => {
	const Children = await Seam_.listDir(await Seam_.resolve(Directory));
	for (const Child of Children) {
		const Absolute = Path.join(Directory, Child.name);
		switch (true) {
			case Child.name.startsWith("."):
				// The archive root is `.archive`, two levels below the corpus root and
				// never discovered as a skill (dsh-skill-filesystem/lib/index.js:589-595).
				continue;
			case Child.type === "file":
				Files.push(Absolute);
				break;
			case Child.type === "directory" && Depth_ > 0:
				await Walk(Seam_, Absolute, Depth_ - 1, Files);
				break;
			default:
				break;
		}
	}
};

/** Write one manifest through a temporary file and a rename. */
const Publish = async (File: string, Manifest_: SnapshotManifest): Promise<void> => {
	const Temporary = `${File}.${String(process.pid)}.tmp`;
	await FileSystem.mkdir(Path.dirname(File), { recursive: true });
	await FileSystem.writeFile(Temporary, `${JSON.stringify(Manifest_, null, "\t")}\n`, "utf8");
	await FileSystem.rename(Temporary, File);
};

/**
 * Capture the whole corpus into one manifest. Best-effort except where a caller
 * makes it a precondition: a revert fails closed on this result, a curator pass
 * logs it and continues (SKILL-LEARN-PLUGIN.md:604-607).
 */
export default async (
	Reason: string,
	Seam_: Seam,
	Configuration_: Configuration,
): Promise<Taken> => {
	const Root = Expand(Configuration_.snapshotRoot);
	try {
		const Paths: string[] = [];
		await Walk(Seam_, Expand(Configuration_.skillsRoot), Depth, Paths);
		const Files: SnapshotFile[] = [];
		let Bytes = 0;
		let SkillFiles = 0;
		for (const Absolute of Paths) {
			let Text: string;
			try {
				Text = await Seam_.readText(await Seam_.resolve(Absolute));
			} catch {
				// A file the seam cannot read as text (a binary asset under `scripts/`)
				// is left out of the manifest rather than failing the whole capture: a
				// snapshot is a safety net, and a net with a hole beats no net.
				continue;
			}
			Files.push({ path: Absolute, sha256: await Capture(Text, Configuration_) });
			Bytes += Buffer.byteLength(Text, "utf8");
			switch (true) {
				case Path.basename(Absolute) === "SKILL.md":
					SkillFiles += 1;
					break;
				default:
					break;
			}
		}
		const At = new Date();
		let Id = Identify(At);
		let Attempt = 0;
		// A same-second collision takes the next suffix, so two captures in one
		// second never share a manifest (curator_backup.py:167-168).
		while (Attempt < 100) {
			try {
				await FileSystem.access(Path.join(Root, `${Id}.json`));
			} catch {
				break;
			}
			Attempt += 1;
			Id = `${Identify(At)}-${String(Attempt).padStart(2, "0")}`;
		}
		const Manifest_: SnapshotManifest = {
			id: Id,
			reason: Reason,
			createdAt: At.toISOString(),
			files: Files,
			skillFiles: SkillFiles,
			bytes: Bytes,
		};
		await Publish(Path.join(Root, `${Id}.json`), Manifest_);
		return { id: Id, manifest: Manifest_ };
	} catch (Cause) {
		return {
			id: "",
			manifest: null,
			error: Cause instanceof Error ? Cause.message : String(Cause),
		};
	}
};

/**
 * Keep the newest `snapshotKeep` manifests, prune the rest except the protected
 * ones, and then delete every blob that no retained manifest and no retained
 * ledger row references. The manifest just written is always protected from its
 * own prune, because a same-second id reuse would otherwise sort below its
 * surviving sibling (curator_backup.py:188-190).
 */
export const Rotate = async (
	Protect: readonly string[],
	Configuration_: Configuration,
): Promise<Rotated> => {
	const Root = Expand(Configuration_.snapshotRoot);
	const Blobs = Expand(Configuration_.blobRoot);
	try {
		let Names: string[] = [];
		try {
			Names = await FileSystem.readdir(Root);
		} catch {
			return { pruned: [], swept: 0 };
		}
		const Ids = Names.filter((Name) => Name.endsWith(".json"))
			.map((Name) => Name.slice(0, -".json".length))
			.filter((Id) => Shape.test(Id))
			.sort()
			.reverse();
		const Keep = Math.max(1, Configuration_.snapshotKeep);
		// A protected id survives even when it sorts past the keep window, so its
		// blobs must count as referenced too.
		const Retained = Ids.filter((Id, Index) => Index < Keep || Protect.includes(Id));
		const Pruned = Ids.slice(Keep).filter((Id) => !Protect.includes(Id));
		for (const Id of Pruned) {
			await FileSystem.unlink(Path.join(Root, `${Id}.json`));
		}
		const Referenced = new Set<string>();
		for (const Id of Retained) {
			try {
				const Raw: unknown = JSON.parse(
					await FileSystem.readFile(Path.join(Root, `${Id}.json`), "utf8"),
				);
				const Listed = (
					Raw as { readonly files?: readonly { readonly sha256?: unknown }[] }
				).files;
				for (const File of Listed ?? []) {
					const Digest = File.sha256;
					if (typeof Digest === "string") {
						Referenced.add(Digest);
					}
				}
			} catch {
				continue;
			}
		}
		for (const Row of await Rows(Configuration_)) {
			for (const File of [...Row.before, ...Row.after]) {
				Referenced.add(File.sha256);
			}
		}
		let Swept = 0;
		let Stored: string[] = [];
		try {
			Stored = await FileSystem.readdir(Blobs);
		} catch {
			return { pruned: Pruned, swept: 0 };
		}
		for (const Name of Stored) {
			if (Referenced.has(Name)) {
				continue;
			}
			try {
				const Info = await FileSystem.stat(Path.join(Blobs, Name));
				if (Date.now() - Info.mtimeMs < Grace) {
					// A capture may be in flight before its row exists, so a young blob
					// survives even when nothing references it yet
					// (tools/skill_ledger.py:485-497).
					continue;
				}
				await FileSystem.unlink(Path.join(Blobs, Name));
				Swept += 1;
			} catch {
				continue;
			}
		}
		return { pruned: Pruned, swept: Swept };
	} catch (Cause) {
		return {
			pruned: [],
			swept: 0,
			error: Cause instanceof Error ? Cause.message : String(Cause),
		};
	}
};
