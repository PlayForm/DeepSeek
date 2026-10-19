// Run-Smokes - the smoke runner for the monorepo (the shell-free
// replacement for the bash for-loop over the mechanics suites). Reads the
// suites in Classic/smokes first, then EffectTS/smokes, spawns each with
// `node`, streams its output through, and exits non-zero on the first
// failing suite - the exact semantics of the loop it replaces, with no
// shell glue in the build path.
//
// MIGRATION PASS (Smoke-Suite Restructure): after the .mjs suites, the
// runner ALSO enumerates every package's compiled per-test folders
// (`Classic/packages/*/Target/Test/` and `EffectTS/packages/*/Target/Test/`,
// one folder per test, each holding `Test.js` + the `README.md` that
// declares its expected PASS count), spawns each `Test.js` with stdio
// inherit, and FAILS if the process exits non-zero OR if the printed
// `N PASS - <Name>` line does not match the README's expected count - the
// vacuously-green guard: a mis-wired folder that passes with the wrong
// number of exercised checks is still a failure.
//
// THE COUNTING (the final line's n): one unit per .mjs suite (42 today -
// 21 per tree) + one unit per per-test folder under any Target/Test/ tree
// (10 today - 8 Classic + 10 ETS folders, i.e. 18 folders). Folders are
// counted, not suites, because each folder is run and guarded individually.
// During the migration the .mjs suites keep running unchanged (they stay
// byte-identical as the fallback until a later lane retires them), so a
// suite's assertions are effectively exercised twice until its .mjs file
// is retired.
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
	`\nAll ${Suites.length + Folders.length} smoke suites passed (the wiring suites self-skip without DSH_TEST_SCRATCH; see Maintain/Run-Wiring.mjs).`,
);
