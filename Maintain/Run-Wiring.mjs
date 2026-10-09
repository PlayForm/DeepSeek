// Run-Wiring - the wiring-battery runner (the live ~/.dsh integration test
// per Documentation/Plans/DOGFOOD-TESTING.md). Owns the full scratch
// lifecycle - create (12 pack tarballs, NO symlinks) → install (file: copy
// deps) → activate (the real harness boot) → exercise (the governed-write
// script through the harness's own event loop) → verify (the 7 wiring
// suites) → destroy (`rm -rf`, no residue; the real profiles untouched).
// The suites' printed totals are the arbiter; this runner only reports
// per-suite and combined wiring counts, never the 733/746 mechanics numbers.
import FileSystem from "node:fs";
import Os from "node:os";
import Path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const Trees = ["Classic", "EffectTS"];
const WiringSuites = [
	"scratch-profile-smoke.mjs",
	"profile-assembly-smoke.mjs",
	"patch-layer-smoke.mjs",
	"live-ledger-smoke.mjs",
	"governed-write-smoke.mjs",
	"refusal-path-smoke.mjs",
	"introspection-smoke.mjs",
];

if (spawnSync("dsh", ["--version"], { encoding: "utf8" }).status !== 0) {
	console.error("Run-Wiring: the dsh CLI is not available on PATH");
	process.exit(1);
}

const Scratch = FileSystem.mkdtempSync(Path.join(Os.tmpdir(), "dsh-wiring-"));
console.log(`Run-Wiring: scratch home ${Scratch} (destroyed at exit)`);

let Failed = 0;
const Totals = [];

try {
	for (const Tree of Trees) {
		for (const Suite of WiringSuites) {
			const File = Path.join(Tree, "smokes", Suite);
			console.log(`\n=== ${Tree}/${Suite}`);
			const Child = spawn(process.execPath, [File], {
				stdio: ["ignore", "inherit", "inherit"],
				env: { ...process.env, DSH_TEST_SCRATCH: Scratch },
			});
			const Code = await new Promise((Resolve) => Child.on("close", Resolve));
			if (Code !== 0) {
				console.error(`\nFAILED: ${Tree}/${Suite} (exit ${Code})`);
				Failed += 1;
			}
		}
	}
} finally {
	// DESTROY - no residue.
	FileSystem.rmSync(Scratch, { recursive: true, force: true });
}

console.log(Failed === 0 ? "\nAll 14 wiring suites passed." : `\n${Failed} wiring suite(s) FAILED.`);
process.exit(Failed === 0 ? 0 : 1);
