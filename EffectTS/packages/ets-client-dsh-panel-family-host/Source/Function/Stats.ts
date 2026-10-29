// Stats - the stats() method: the ccr store summary. The LRU internals are
// not exposed by any existing remote, so v1 returns the ccr log summary
// (path, byte size, line count) from the Config ccrLog file. Read-only.
import { readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";

export type StatsResult =
	| { ok: true; ccrLog: string; bytes: number; lines: number }
	| { ok: false; code: "not-found"; message: string };

export default async function Stats(ccrLog: string): Promise<StatsResult> {
	const path = ccrLog.replace(/^~/, homedir());
	try {
		const info = await stat(path);
		const text = await readFile(path, "utf8");
		const all = text.split("\n");
		if (all.length > 0 && all[all.length - 1] === "") all.pop();
		return { ok: true, ccrLog: path, bytes: info.size, lines: all.length };
	} catch (error) {
		return { ok: false, code: "not-found", message: `ccr log is unreadable: ${String(error)}` };
	}
}
