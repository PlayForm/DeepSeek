// Folders - the immediate subdirectory names of one directory, sorted (the
// order the reconciliation names them in). A missing or unreadable directory
// is an EMPTY list, never a throw: the reconciliation runs on the judged hot
// path and must stay fail-open (the listener's own catch is the last resort).
import { readdirSync } from "node:fs";

export default (Directory: string): string[] => {
	try {
		return readdirSync(Directory, { withFileTypes: true })
			.filter((Entry) => Entry.isDirectory())
			.map((Entry) => Entry.name)
			.sort();
	} catch {
		return [];
	}
};
