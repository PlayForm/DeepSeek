import * as FS from "node:fs";
import * as Path from "node:path";

import Exclude from "./Exclude.mjs";
import Walk from "./Walk.mjs";

/** Compare the expected twin text with the tree; every stale, missing or extra
 *  path is returned. */
export default (To, Expected, Exclusion, TwinName) => {
	const Stale = [];
	for (const [File, Text] of Expected) {
		const Target = Path.join(To, File);
		const Actual = FS.existsSync(Target) ? FS.readFileSync(Target, "utf8") : null;
		if (Actual !== Text) {
			Stale.push(`${TwinName}/${File} (${Actual === null ? "missing" : "diff"})`);
		}
	}
	const Extra = [...Walk(To, "Configuration"), ...Walk(To, "Source")].filter(
		(File) => !Expected.has(File) && !Exclude(Exclusion, File),
	);
	for (const File of Extra) {
		Stale.push(`${TwinName}/${File} (extra)`);
	}
	return Stale;
};
