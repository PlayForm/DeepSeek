// Discover — the nearest registry.json walking UP from Dir, stopping at
// node_modules boundaries and the filesystem root; null when none. Identical
// across the trio (the registry filename is machinery, not module vocabulary
// — all three modules discover the same registry.json).
//
// Exemption (documented): a plain-fs walk-up over auxiliary discovery files
// (registry.json existence probes) — internal calculation, kept synchronous
// so the listener's g2 stage stays await-free. The walk-up never reads the
// governed manifest.
import * as FileSystem from "node:fs";
import { basename as Base, dirname as Parent, join as Join } from "node:path";

export default (Dir: string): string | null => {
	let Step = Dir;
	while (Step && Step !== "/" && Step.length > 1) {
		const Candidate = Join(Step, "registry.json");
		switch (true) {
			case Base(Step) === "node_modules":
				return null;
			case FileSystem.existsSync(Candidate):
				return Candidate;
			case Parent(Step) === Step:
				return null;
		}
		Step = Parent(Step);
	}
	return null;
};
