// Snapshot - the best-effort JSON persistence (Function/Snapshot), the
// DEGRADED FALLBACK store. The PRIMARY store is the storage-domain KV domain
// (Function/Open, the config `domain`); this file is written and read ONLY
// when the harness provides no storage facility (or its open fails) - the
// documented fallback, never the primary. The local store under ~/.dsh
// (PATTERN-GRAPH-PLUGIN.md open decision 2): the memory is local, never the
// repo; the schema is versioned; a stale or unreadable file is a silent miss
// (the registry keeps the cold-start catalog) - persistence failure must
// never reach any caller path.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import { dirname, join, resolve } from "node:path";

import type Snapshot from "@Interface/Snapshot.js";

/** Expand a leading ~ to the user's home directory. The remainder after the
 *  tilde is joined (not resolved) so it stays RELATIVE to the home - the
 *  `/.dsh/...` remainder is absolute and `resolve` would discard the home. */
export const Expand = (Path: string): string =>
	Path.startsWith("~") ? join(os.homedir(), Path.slice(1)) : resolve(Path);

/** Write the snapshot; never throws. */
export const Save = async (Path: string, Snapshot_: Snapshot): Promise<void> => {
	try {
		const Target = Expand(Path);
		await mkdir(dirname(Target), { recursive: true });
		await writeFile(Target, JSON.stringify(Snapshot_, null, "\t"), "utf8");
	} catch {
		/* persistence optional */
	}
};

/** Read the snapshot; null on any failure or version mismatch. */
export const Load = async (Path: string): Promise<Snapshot | null> => {
	try {
		const Raw: unknown = JSON.parse(await readFile(Expand(Path), "utf8"));
		const Parsed = Raw as { version?: unknown; savedAt?: unknown; patterns?: unknown };
		if (Parsed.version !== 1 || !Array.isArray(Parsed.patterns)) {
			return null;
		}
		return {
			version: 1,
			savedAt: typeof Parsed.savedAt === "number" ? Parsed.savedAt : 0,
			patterns: Parsed.patterns as Snapshot["patterns"],
		};
	} catch {
		return null;
	}
};
