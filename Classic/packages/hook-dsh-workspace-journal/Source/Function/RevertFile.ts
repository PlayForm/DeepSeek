// RevertFile - one file's replay (Function/RevertFile): the per-file half
// of Revert. See Revert.ts for the semantics; this module holds the two
// replay arms (the pre-image write-back and the absence unlink) and their
// ledger lines.
import * as FileSystem from "node:fs";

import type EntryRecord from "@Interface/Entry.js";
import type Result from "@Interface/Result.js";
import type State from "@Interface/State.js";

export default async (
	State: State,
	BatchId: string,
	Entry: EntryRecord,
): Promise<Result["files"][number]> => {
	const { path: Path } = Entry;
	try {
		switch (Entry.state) {
			case "absent": {
				// The file did not exist before the batch: remove it. The
				// documented unlink exemption (ctx.fs has no delete seam).
				try {
					const Target = await State.Context.fs.resolve(Path);
					FileSystem.unlinkSync((Target as { absolute?: string }).absolute ?? Path);
				} catch (Cause) {
					const Code = (Cause as { code?: string }).code;
					if (Code === "ENOENT") {
						State.Factory.Append(State, `reverted ${BatchId} ${Path} (already absent)`);
						return { path: Path, action: "removed" };
					}
					throw Cause;
				}
				State.Factory.Append(State, `reverted ${BatchId} ${Path} (removed)`);
				return { path: Path, action: "removed" };
			}
			default: {
				if (Entry.truncated) {
					State.Factory.Append(
						State,
						`reverted ${BatchId} ${Path} (skipped: pre-image over maxEntryBytes)`,
					);
					return { path: Path, action: "skipped", reason: "truncated pre-image" };
				}
				// The fence: resolve and stat the CURRENT version, then replay
				// the pre-image through the factory's shared write executor with
				// replaceIfVersion against that version. A mismatch is a typed
				// conflict with the expected and observed versions.
				const Target = await State.Context.fs.resolve(Path);
				const Info = (await State.Context.fs.stat(Target)) as
					{ version: unknown } | undefined;
				const Current = Info !== undefined ? String(Info.version) : "absent";
				if (Info === undefined) {
					// The file vanished after the batch write: the honest report
					// is a conflict (the pre-image cannot restore onto absence
					// through a version-fenced replace).
					State.Factory.Append(
						State,
						`reverted ${BatchId} ${Path} (conflict: file now absent, expected content)`,
					);
					return { path: Path, action: "conflict", reason: "file now absent" };
				}
				await State.Factory.Write(State, Target, Entry.content, {
					intent: { kind: "replaceIfVersion", version: Current },
					observe: false,
				});
				State.Factory.Append(State, `reverted ${BatchId} ${Path} (fence ok)`);
				return { path: Path, action: "restored" };
			}
		}
	} catch (Cause) {
		const Message = (Cause as Error)?.message ?? String(Cause);
		// A version-fence rejection is a conflict; anything else is a skip.
		if (Message.includes("FS_STALE_VERSION")) {
			State.Factory.Append(
				State,
				`reverted ${BatchId} ${Path} (conflict: version fence failed)`,
			);
			return { path: Path, action: "conflict", reason: "version fence failed" };
		}
		State.Factory.Append(State, `reverted ${BatchId} ${Path} (skipped: ${Message})`);
		return { path: Path, action: "skipped", reason: Message };
	}
};
