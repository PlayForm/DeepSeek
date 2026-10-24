// Run-Types - the repo-level type gate (the shell-free replacement for
// trusting `pnpm run build`, which logs TypeScript diagnostics without
// failing and only tsc-checks Source/Test via prepublishOnly). Enumerates
// every package directory under `Classic/packages/` and `EffectTS/packages/`
// that contains `Configuration/TypeScript.noemit.json`, runs
// `pnpm --config.verify-deps-before-run=false exec tsc -p
// Configuration/TypeScript.noemit.json --pretty false` in each package
// directory, and FAILS (exit 1) if any package's tsc exits non-zero - the
// honest gate: a red tree is a red gate.
//
// The output: one `PASS` / `FAIL <n> diagnostics` line per package, the first
// 12 diagnostic lines per failing package (bounded so a red run stays
// actionable), and a final `TOTAL=<n> FAIL=<n>` summary. `--tree
// classic|effect-ts` scopes the run to one tree.
import { spawn } from "node:child_process";
import FileSystem from "node:fs";
import Path from "node:path";

const Trees = ["classic", "effect-ts"];
const TreeDirectories = { classic: "Classic", "effect-ts": "EffectTS" };
const DiagnosticLimit = 12;

const Arguments = process.argv.slice(2);
const Scope = [];
for (let Index = 0; Index < Arguments.length; Index += 1) {
	if (Arguments[Index] === "--tree") {
		const Value = Arguments[Index + 1];
		if (!Value || !Trees.includes(Value)) {
			console.error(`Usage: node Maintain/Run-Types.mjs [--tree classic|effect-ts]`);
			process.exit(2);
		}
		Scope.push(Value);
		Index += 1;
	} else {
		console.error(`Usage: node Maintain/Run-Types.mjs [--tree classic|effect-ts]`);
		process.exit(2);
	}
}

const Scopes = Scope.length > 0 ? Scope : Trees;

// The packages: every directory under each tree's packages/ that carries the
// noemit TypeScript configuration.
const Packages = [];
for (const Tree of Scopes) {
	const Root = Path.join(TreeDirectories[Tree], "packages");
	for (const Entry of FileSystem.readdirSync(Root, { withFileTypes: true })) {
		if (!Entry.isDirectory()) {
			continue;
		}
		const Package = Path.join(Root, Entry.name);
		if (FileSystem.existsSync(Path.join(Package, "Configuration/TypeScript.noemit.json"))) {
			Packages.push({ Tree, Package });
		}
	}
}

const Check = (Entry) =>
	new Promise((Resolve) => {
		const Process = spawn(
			"pnpm",
			[
				"--config.verify-deps-before-run=false",
				"exec",
				"tsc",
				"-p",
				"Configuration/TypeScript.noemit.json",
				"--pretty",
				"false",
			],
			{ cwd: Entry.Package, stdio: ["ignore", "pipe", "pipe"] },
		);
		let Output = "";
		Process.stdout.setEncoding("utf8");
		Process.stderr.setEncoding("utf8");
		Process.stdout.on("data", (Data) => {
			Output += Data;
		});
		Process.stderr.on("data", (Data) => {
			Output += Data;
		});
		Process.on("close", (Code) => {
			const Diagnostics = Output.split("\n").filter((Line) => Line.trim().length > 0);
			Resolve({ Code: Code ?? 1, Diagnostics });
		});
	});

let Failed = 0;
for (const Entry of Packages) {
	const Result = await Check(Entry);
	if (Result.Code === 0) {
		console.log(`PASS ${Entry.Package}`);
		continue;
	}
	Failed += 1;
	console.log(`FAIL ${Entry.Package} (${Result.Diagnostics.length} diagnostics)`);
	for (const Line of Result.Diagnostics.slice(0, DiagnosticLimit)) {
		console.log(`  ${Line}`);
	}
	if (Result.Diagnostics.length > DiagnosticLimit) {
		console.log(`  ... and ${Result.Diagnostics.length - DiagnosticLimit} more`);
	}
}

console.log(`\nTOTAL=${Packages.length} FAIL=${Failed}`);
process.exit(Failed > 0 ? 1 : 0);
