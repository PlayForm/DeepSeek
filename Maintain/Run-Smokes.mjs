// Run-Smokes - the smoke runner for the monorepo (the shell-free
// replacement for the bash for-loop over the mechanics suites). Reads the
// suites in Classic/smokes first, then EffectTS/smokes, spawns each with
// `node`, streams its output through, and exits non-zero on the first
// failing suite - the exact semantics of the loop it replaces, with no
// shell glue in the build path.
import FileSystem from "node:fs";
import Path from "node:path";
import { spawn } from "node:child_process";

const Glob = (Directory) =>
	FileSystem.readdirSync(Directory, { withFileTypes: true })
		.filter((Entry) => Entry.isFile() && Entry.name.endsWith("-smoke.mjs"))
		.map((Entry) => Path.join(Directory, Entry.name))
		.sort();

const Suites = [...Glob("Classic/smokes"), ...Glob("EffectTS/smokes")];

for (const Suite of Suites) {
	console.log(`\n=== ${Path.basename(Suite)}`);
	const Process = spawn(process.execPath, [Suite], {
		stdio: ["ignore", "inherit", "inherit"],
	});
	const Code = await new Promise((Resolve) => Process.on("close", Resolve));
	if (Code !== 0) {
		console.error(`\nFAILED: ${Path.basename(Suite)} (exit ${Code})`);
		process.exit(Code);
	}
}

console.log(`\nAll ${Suites.length} smoke suites passed (the wiring suites self-skip without DSH_TEST_SCRATCH; see Maintain/Run-Wiring.mjs).`);
