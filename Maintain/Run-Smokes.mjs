// Run-Smokes - the smoke runner for the monorepo (the shell-free
// replacement for the bash for-loop over the mechanics suites). Enumerates
// every package's compiled per-test folders (`Classic/packages/*/Target/Test/`
// and `EffectTS/packages/*/Target/Test/`, one folder per test, each holding
// `Test.js` + the `README.md` that declares its expected PASS count), spawns
// each `Test.js` with stdio inherit, and FAILS if the process exits non-zero
// OR if the printed `N PASS - <Name>` line does not match the README's
// expected count - the vacuously-green guard: a mis-wired folder that passes
// with the wrong number of exercised checks is still a failure.
//
// THE COUNTING (the final line's n): one unit per per-test folder under any
// Target/Test/ tree. Folders are counted, not suites, because each folder is
// run and guarded individually. The former `.mjs` fallback suites (42 files)
// were retired by the wrap-up lane (I8) once every package's Source/Test
// folders covered its suite - the runner's glob counts ONLY the folders now;
// the per-suite before/after totals live in the totals ledger of
// Documentation/Plans/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md. The wiring
// battery lives in <tree>/smokes/Test/ (built by <tree>/smokes/Build-Tests.sh)
// and runs under Maintain/Run-Wiring.mjs; without DSH_TEST_SCRATCH its
// folders self-skip, and its `.mjs` originals are retired too.
import { spawn } from "node:child_process";
import FileSystem from "node:fs";
import Path from "node:path";

// The per-test folders: every package that carries a Target/Test/ tree.
const Packages = [
	...FileSystem.readdirSync("Classic/packages", { withFileTypes: true })
		.filter((Entry) => Entry.isDirectory())
		.map((Entry) => Path.join("Classic/packages", Entry.name)),
	...FileSystem.readdirSync("EffectTS/packages", { withFileTypes: true })
		.filter((Entry) => Entry.isDirectory())
		.map((Entry) => Path.join("EffectTS/packages", Entry.name)),
];

const Folders = [];
for (const Package of Packages) {
	const Test = Path.join(Package, "Target/Test");
	if (!FileSystem.existsSync(Test)) {
		continue;
	}
	for (const Entry of FileSystem.readdirSync(Test, { withFileTypes: true })) {
		if (!Entry.isDirectory()) {
			continue;
		}
		const File = Path.join(Test, Entry.name, "Test.js");
		if (FileSystem.existsSync(File)) {
			Folders.push({ Name: Entry.name, Package, File });
		}
	}
}
Folders.sort((Left, Right) => Left.File.localeCompare(Right.File));

// The expected PASS count, declared by the folder's SOURCE README
// (`Source/Test/<Name>/README.md`, section "## Expected count" ->
// "<N> PASS."). A folder without a parseable count is a failure - the count
// IS the vacuously-green guard. (The README stays in Source/Test; the build
// compiles only the Test.ts files into Target/Test.)
const Expected = (Folder) => {
	const Readme = Path.join(
		Folder.Package,
		"Source/Test",
		Path.basename(Path.dirname(Folder.File)),
		"README.md",
	);
	const Text = FileSystem.readFileSync(Readme, "utf8");
	const Index = Text.indexOf("## Expected count");
	if (Index < 0) {
		throw new Error(`${Folder.Package}/${Folder.Name}: README has no "## Expected count"`);
	}
	const Match = /(\d+)\s*PASS/.exec(Text.slice(Index));
	if (!Match) {
		throw new Error(`${Folder.Package}/${Folder.Name}: README has no "<N> PASS." count`);
	}
	return Number(Match[1]);
};

for (const Folder of Folders) {
	console.log(`\n=== ${Folder.Package} / ${Folder.Name}`);
	let Printed = null;
	let Buffer = "";
	const Process = spawn(process.execPath, [Folder.File], {
		stdio: ["ignore", "pipe", "inherit"],
	});
	Process.stdout.setEncoding("utf8");
	Process.stdout.on("data", (Data) => {
		process.stdout.write(Data);
		Buffer += Data;
		const Lines = Buffer.split("\n");
		Buffer = Lines.pop() ?? "";
		for (const Line of Lines) {
			const Match = /^(\d+) PASS - (.+)$/.exec(Line);
			if (Match) {
				Printed = Number(Match[1]);
			}
		}
	});
	const Code = await new Promise((Resolve) => Process.on("close", Resolve));
	let Want;
	try {
		Want = Expected(Folder);
	} catch (Error) {
		console.error(String(Error));
		process.exit(1);
	}
	if (Code !== 0) {
		console.error(`\nFAILED: ${Folder.Package} / ${Folder.Name} (exit ${Code})`);
		process.exit(Code);
	}
	if (Printed === null) {
		console.error(
			`\nFAILED: ${Folder.Package} / ${Folder.Name} printed no "N PASS - <Name>" line`,
		);
		process.exit(1);
	}
	if (Printed !== Want) {
		console.error(
			`\nFAILED: ${Folder.Package} / ${Folder.Name} printed ${Printed} PASS, README expects ${Want} (the vacuously-green guard)`,
		);
		process.exit(1);
	}
}

console.log(
	`\nAll ${Folders.length} smoke suites passed (the wiring suites self-skip without DSH_TEST_SCRATCH; see Maintain/Run-Wiring.mjs).`,
);
