// Snapshot - the JSON FALLBACK store (Function/Snapshot), the DEGRADED tier.
// The PRIMARY store is the storage-domain KV domain `replay_history`
// (Function/Storage); this file is written and read ONLY when the harness
// provides no storage facility (or its open fails) - the documented fallback,
// never the primary.
//
// The read is SYNCHRONOUS because it runs once at apply, before the first
// judged call (the boot path, the same posture as the seeded history store's
// reader). The write is asynchronous and serialised on the store chain
// (Function/Record), so the smokes' Flush seam is deterministic without a
// sleep. A stale, unreadable or wrong-version file is a silent miss - the
// store starts fresh, never a throw.
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type Entry from "@Interface/Entry.js";
import type Store from "@Interface/Store.js";
import { Expand } from "@playform/lib-dsh-core";

/** Read the fallback snapshot; null on any failure or version mismatch. */
export const Load = (Path: string): Store | null => {
	try {
		const Raw: unknown = JSON.parse(readFileSync(Expand(Path), "utf8"));
		const Parsed = Raw as { version?: unknown; savedAt?: unknown; entries?: unknown };
		switch (true) {
			case Parsed.version !== 1 || !Array.isArray(Parsed.entries):
				return null;
			default:
				return {
					version: 1,
					savedAt: typeof Parsed.savedAt === "number" ? Parsed.savedAt : 0,
					entries: Parsed.entries as Entry[],
				};
		}
	} catch {
		return null;
	}
};

/** Write the fallback snapshot; never throws. */
export const Save = async (Path: string, Entries: Entry[], Now: number): Promise<void> => {
	try {
		const Target = Expand(Path);
		await mkdir(dirname(Target), { recursive: true });
		await writeFile(
			Target,
			JSON.stringify({ version: 1, savedAt: Now, entries: Entries }, null, "\t"),
			"utf8",
		);
	} catch {
		/* persistence optional */
	}
};
