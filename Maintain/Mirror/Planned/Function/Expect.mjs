import * as FS from "node:fs";
import * as Path from "node:path";

import Exclude from "./Exclude.mjs";
import Substitute from "./Substitute.mjs";

/** The expected twin text: the substituted Classic source for every path the
 *  walk covers. */
export default (From, Paths, Exclusion) => {
	const Expected = new Map();
	let Skipped = 0;
	for (const File of Paths) {
		if (Exclude(Exclusion, File)) {
			Skipped += 1;
			continue;
		}
		Expected.set(File, Substitute(FS.readFileSync(Path.join(From, File), "utf8")));
	}
	return { Expected, Skipped };
};
