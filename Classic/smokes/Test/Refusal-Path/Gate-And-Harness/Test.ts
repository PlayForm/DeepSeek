// smokes/Test/Gate-And-Harness/Test.ts - the wiring suites' skip guard and
// shared harness, as its own folder for EVERY wiring suite (the live ~/.dsh
// battery, Documentation/Plans/DOGFOOD-TESTING.md Section 3). The self-skip
// without DSH_TEST_SCRATCH, the gate reading the environment exactly, the
// scratch lifecycle (the complete path set, isolation from the real ~/.dsh,
// the idempotent reuse) - the harness contract every wiring folder stands
// on. The folder label is derived from the folder path, so this file is
// byte-identical in all seven wiring suites of both trees.
// Tree-agnostic: this folder exercises the LIVE harness via the shared
// wiring-live.mjs and imports nothing from the tree Targets, so the Classic
// and EffectTS copies are identical.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as Wiring from "../../../wiring-live.mjs";

let Pass = 0;
let Fail = 0;
const Check = (Condition: boolean, Message: string): void => {
	if (Condition) {
		Pass += 1;
		console.log(`PASS - ${Message}`);
	} else {
		Fail += 1;
		console.log(`FAIL - ${Message}`);
	}
};

// The folder label, from the compiled file's own path (the last two
// segments: <Suite>/<Folder>).
const Here = path.dirname(fileURLToPath(import.meta.url));
const Label = `${path.basename(path.dirname(Here))}/${path.basename(Here)}`;

// The gate: an UNSET DSH_TEST_SCRATCH means the folder SKIPS (exit 0,
// `SKIPPED (no scratch home)`) - the mechanics-only `pnpm test` never
// touches the harness. Same gate, same self-skip line as the .mjs suite
// this folder was split from.
if (!Wiring.ScratchHome()) {
	console.log("SKIPPED (no scratch home)");
	process.exit(0);
}

// Group: the skip guard. The folder run WITHOUT DSH_TEST_SCRATCH prints the
// exact self-skip line and exits 0. Negative control: spawn this compiled
// Test.js with the variable removed from the child environment - the child
// exits at the gate, so no scratch is created and no recursion happens.
{
	// Leaf: the child's stdout is exactly the self-skip line, stderr is
	// empty, and the exit code is 0.
	const Environment: NodeJS.ProcessEnv = { ...process.env };
	delete Environment["DSH_TEST_SCRATCH"];
	const Child = spawn(process.execPath, [fileURLToPath(import.meta.url)], {
		stdio: ["ignore", "pipe", "pipe"],
		env: Environment,
	});
	let Out = "";
	Child.stdout?.on("data", (Chunk) => {
		Out += String(Chunk);
	});
	let Err = "";
	Child.stderr?.on("data", (Chunk) => {
		Err += String(Chunk);
	});
	const Code = await new Promise<number | null>((Resolve) => {
		Child.on("close", (Code) => {
			Resolve(Code);
		});
	});
	Check(
		Out === "SKIPPED (no scratch home)\n" && Err === "" && Code === 0,
		"without DSH_TEST_SCRATCH the folder prints `SKIPPED (no scratch home)` and exits 0",
	);
}

// Group: the gate reads the environment exactly.
{
	// Leaf: ScratchHome() is exactly the DSH_TEST_SCRATCH value.
	Check(
		Wiring.ScratchHome() === process.env["DSH_TEST_SCRATCH"],
		"ScratchHome() is exactly the DSH_TEST_SCRATCH value (the gate is the environment)",
	);
}

// Group: the scratch lifecycle - the complete path set on disk, isolation
// from the real ~/.dsh, and the idempotent reuse.
const Scratch = (await Wiring.EnsureScratch())!;
{
	// Leaf: EnsureScratch returns the complete path set and every path
	// exists on disk.
	Check(
		existsSync(Scratch.Home) &&
			existsSync(Scratch.Profile) &&
			existsSync(Scratch.Tarballs) &&
			existsSync(Scratch.Ledgers) &&
			existsSync(Scratch.Work),
		"EnsureScratch returns the complete path set and every path exists on disk",
	);
}
{
	// Leaf: the home is the designated scratch and never the real ~/.dsh.
	Check(
		Scratch.Home !== `${homedir()}/.dsh` &&
			Scratch.Home === process.env["DSH_TEST_SCRATCH"],
		"the scratch home is the designated DSH_TEST_SCRATCH and never the real ~/.dsh",
	);
}
{
	// Leaf: a second EnsureScratch reuses the same home - the marker file
	// proves the reuse, no rebuild.
	const Again = (await Wiring.EnsureScratch())!;
	Check(
		Again.Home === Scratch.Home && existsSync(`${Scratch.Home}/.wiring-ready.json`),
		"a second EnsureScratch reuses the same home (the .wiring-ready.json marker, no rebuild)",
	);
}

console.log(`${Pass} PASS - ${Label}`);
process.exit(Fail === 0 ? 0 : 1);
