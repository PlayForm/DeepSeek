// Roster - the aggregate runner's roster for one package: the smoke folders it
// will actually run. Maintain/Run-Smokes.mjs enumerates
// `<package>/Target/Test/<Folder>/Test.js` (one folder per suite, the compiled
// Test.ts plus the README that declares the count), so a Source folder without
// a built Target folder is NOT in the roster - the runner never sees it and
// the count it claims is never exercised.
//
// The roster is read from the built tree, not from a hand-maintained list:
// the runner has no list to drift from (it derives the folders on every run),
// so the built tree IS the roster.
import { existsSync } from "node:fs";
import { join } from "node:path";

import Folders from "./Folders.js";

export default (PackageRoot: string): Set<string> => {
	const Built = join(PackageRoot, "Target", "Test");
	return new Set(Folders(Built).filter((Folder) => existsSync(join(Built, Folder, "Test.js"))));
};
