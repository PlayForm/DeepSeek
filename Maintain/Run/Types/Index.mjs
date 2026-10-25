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
import Packages from "./Function/Packages.mjs";
import Run from "./Function/Run.mjs";

const Trees = ["classic", "effect-ts"];

const Arguments = process.argv.slice(2);
const Scope = [];
for (let Index = 0; Index < Arguments.length; Index += 1) {
	if (Arguments[Index] === "--tree") {
		const Value = Arguments[Index + 1];
		if (!Value || !Trees.includes(Value)) {
			console.error(`Usage: node Maintain/Run/Types/Index.mjs [--tree classic|effect-ts]`);
			process.exit(2);
		}
		Scope.push(Value);
		Index += 1;
	} else {
		console.error(`Usage: node Maintain/Run/Types/Index.mjs [--tree classic|effect-ts]`);
		process.exit(2);
	}
}

const Scopes = Scope.length > 0 ? Scope : Trees;
const Failed = await Run(Packages(Scopes));
process.exit(Failed > 0 ? 1 : 0);
