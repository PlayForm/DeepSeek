// Source/Test/Expand/Test.ts - one singular test: the tilde expansion for
// config-supplied paths - the bare "~" is the home, the "~/x" form joins the
// home, and every other path (absolute, relative, empty) passes through
// unchanged. Runs standalone (`node Target/Test/Expand/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/lib-dsh-core: the REAL built entry only.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Expand } from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Expand - the tilde expansion (home, home/child, unchanged).
	{
		const Sub = "Expand: the tilde expansion (home, home/child, unchanged paths)";
		{
			// `os.homedir()` honors $HOME on POSIX, so the test redirects it to
			// a fresh temp directory, asserts against it, and restores the
			// original afterwards - every assertion runs against the temp home,
			// never the real one.
			Check(Count, Sub, () => {
				const Original = process.env["HOME"];
				const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "expand-smoke-"));
				try {
					process.env["HOME"] = Home;
					assert.equal(Expand("~"), Home, "the bare tilde is the home");
					assert.equal(
						Expand("~/a/b"),
						Path.join(Home, "a/b"),
						"the home-prefixed path joins the home",
					);
					assert.equal(Expand("/abs"), "/abs", "absolute paths pass through");
					assert.equal(Expand("rel"), "rel", "relative paths pass through");
					assert.equal(Expand(""), "", "the empty path passes through");
				} finally {
					if (Original === undefined) {
						delete process.env["HOME"];
					} else {
						process.env["HOME"] = Original;
					}
				}
			});
		}
	}
	return Finish(Count, "Expand");
};

// Standalone entry: `node Target/Test/Expand/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Expand`);
}
