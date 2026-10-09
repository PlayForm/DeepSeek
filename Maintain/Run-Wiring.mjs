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

// The fast path: a PERSISTENT pre-configured home (the dedicated dogfood
// profile per Documentation/Plans/DOGFOOD-TESTING.md §2 — created once via
// the wiring-live scaffold, e.g. ~/.dsh-dogfood with the dsh-test profile).
// DSH_WIRING_HOME selects the base; each tree gets its own subhome
// (`classic/`, `ets/`) because both scaffolds build a profile named
// `dsh-test` with different package names (the Classic vs the ets group) —
// one home cannot serve both. The .wiring-ready.json marker makes
// EnsureScratch reuse a subhome as-is (no repack, no reinstall). Without
// DSH_WIRING_HOME the runner builds a throwaway temp scratch per tree (the
// isolation variant) and destroys it at exit — persistent subhomes are
// NEVER destroyed here.
const Persistent = process.env.DSH_WIRING_HOME ?? "";
const ScratchFor = (Tree) =>
	Persistent
		? Path.join(Persistent, Tree === "EffectTS" ? "ets" : "classic")
		: FileSystem.mkdtempSync(Path.join(Os.tmpdir(), `dsh-wiring-${Tree}-`));
const TempHomes = [];
let Failed = 0;
const Totals = [];

try {
	for (const Tree of Trees) {
		const Scratch = ScratchFor(Tree);
		if (!Persistent) TempHomes.push(Scratch);
		// Deterministic reruns: the persistent subhome keeps its configured
		// profile, but the ledgers are reset per run (they are the test
		// profile's own logs - the suites assert activation lines and the
		// exercised flow lines against a known-fresh trail).
		FileSystem.rmSync(Path.join(Scratch, "ledgers"), { recursive: true, force: true });
		FileSystem.mkdirSync(Path.join(Scratch, "ledgers"), { recursive: true });
		console.log(
			`\nRun-Wiring: ${Tree} home ${Scratch}` +
				(Persistent ? " (persistent, left in place)" : " (destroyed at exit)"),
		);
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
	// DESTROY - no residue (the persistent subhomes are left in place).
	for (const Home of TempHomes) FileSystem.rmSync(Home, { recursive: true, force: true });
}

console.log(
	Failed === 0 ? "\nAll 14 wiring suites passed." : `\n${Failed} wiring suite(s) FAILED.`,
);
process.exit(Failed === 0 ? 0 : 1);
