import * as FS from "node:fs";
import * as Path from "node:path";

export default (Exclusion, To, TwinName) => {
	let Protected = 0;

	// THE PROTECTION PROOF (both modes): every excluded FILE must still be
	// there (the walk never writes them, and nothing deletes them) - a missing
	// one means the hand-port was lost. An excluded FOLDER is the opposite
	// proof: it must be ABSENT (a stale copy would ship the Classic-only
	// dependency the exclusion exists to keep out).
	for (const File of Exclusion) {
		if (File.endsWith("/")) {
			if (FS.existsSync(Path.join(To, File))) {
				throw new Error(
					`EXCLUDED FOLDER PRESENT: ${TwinName}/${File} - remove the stale copy.`,
				);
			}
			continue;
		}
		if (!FS.existsSync(Path.join(To, File))) {
			throw new Error(`HAND-PORT LOST: ${TwinName}/${File} is missing after the run.`);
		}
		Protected += 1;
	}
	return Protected;
};
