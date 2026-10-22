// Resolve - the target resolution (plan section 3): the intent's targets if
// given (validated to exist under the root), otherwise the kind's globs
// walked from the root. The walk is bounded (maxTargets, and a depth cap so
// a runaway tree cannot hang the prepare).
import { existsSync as Exists, readdirSync as Read, statSync as Stat } from "node:fs";
import { join as Join, relative as Relative, resolve as Resolve } from "node:path";

import type Config from "../Interface/Config.js";
import Match from "./Match.js";

const MAX_DEPTH = 8;

/** Walk the root, collecting files matching any glob, bounded. */
const Walk = (Root: string, Patterns: RegExp[], Limit: number): string[] => {
	const Found: string[] = [];
	const Visit = (Dir: string, Depth: number): void => {
		if (Found.length >= Limit || Depth > MAX_DEPTH) {
			return;
		}
		let Entries: string[];
		try {
			Entries = Read(Dir);
		} catch {
			return;
		}
		for (const Entry of Entries) {
			if (Found.length >= Limit) {
				return;
			}
			const Path = Join(Dir, Entry);
			let Stats;
			try {
				Stats = Stat(Path);
			} catch {
				continue;
			}
			if (Stats.isDirectory()) {
				switch (Entry) {
					case "node_modules":
					case ".git":
					case "Target":
					case "dist":
						continue;
				}
				Visit(Path, Depth + 1);
			} else if (
				Stats.isFile() &&
				Patterns.some((Pattern) => Pattern.test(Relative(Root, Path)))
			) {
				Found.push(Path);
			}
		}
	};
	Visit(Root, 0);
	return Found;
};

export default (
	Root: string,
	Config: Config,
	Kind: string,
	Targets: string[] | undefined,
): string[] => {
	const Limit = Math.max(1, Config.maxTargets);
	switch (true) {
		case Targets !== undefined && Targets.length > 0: {
			const Found: string[] = [];
			for (const Raw of Targets) {
				const Path = Resolve(Root, Raw);
				if (Found.length < Limit && Exists(Path) && Stat(Path).isFile()) {
					Found.push(Path);
				}
			}
			return Found;
		}
		default: {
			const Globs = Config.kinds[Kind]?.globs ?? [];
			if (Globs.length === 0) {
				return [];
			}
			return Walk(
				Root,
				Globs.map((Glob) => Match(Glob)),
				Limit,
			);
		}
	}
};
