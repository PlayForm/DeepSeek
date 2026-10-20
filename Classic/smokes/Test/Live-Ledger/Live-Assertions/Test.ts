// smokes/Test/Live-Ledger/Live-Assertions/Test.ts - one singular test: the
// scratch run's ledger files exist under $SCRATCH/ledgers, the activation
// lines match the smoke-contract strings byte-for-byte, and each flavor's
// normalized count increments per exercised stream (the plan's Section 2.5
// assertions, now read from real log files instead of synthetic captures).
// Split from live-ledger-smoke.mjs: this folder carries the suite's live
// assertions; the skip guard and the harness checks live in the sibling
// Gate-And-Harness folder.
// Tree-agnostic: this folder exercises the LIVE harness via the shared
// wiring-live.mjs and imports nothing from the tree Targets, so the Classic
// and EffectTS copies are identical.
import { existsSync, readFileSync } from "node:fs";
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

if (!Wiring.ScratchHome()) {
	console.log("SKIPPED (no scratch home)");
	process.exit(0);
}

const Home = Wiring.ScratchHome();
const Ledgers = `${Home}/ledgers`;
const Lines = (Name: string): string[] =>
	existsSync(`${Ledgers}/${Name}.log`)
		? readFileSync(`${Ledgers}/${Name}.log`, "utf8")
				.split("\n")
				.filter((Line) => Line.trim() !== "")
		: [];
const HasLine = (Name: string, Line: string): boolean =>
	Lines(Name).some((Entry) => Entry.endsWith(Line));
const Iso = (Line: string): boolean => /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] .+/.test(Line);

// The main boot's Paths shape (the live-assertions view of the exercise).
type ExercisePaths = {
	probeTarget: string;
	cargoToml: string;
	cargoRefusal: string;
};

// The exercise must run FIRST - the ledgers are its product.
const Exercised = (await Wiring.Exercise())!;
const Paths = Exercised.Paths as ExercisePaths;

// Group: the ledger files exist (the storage domain under the redirected
// home).
for (const Name of [
	"governor",
	"pinner",
	"cargo-governor",
	"normalize-dash",
	"quotes",
	"ellipsis",
	"spaces",
	"invisible",
	"fullwidth",
	"normalize-file",
]) {
	Check(
		existsSync(`${Ledgers}/${Name}.log`),
		`the ${Name}.log ledger exists under the scratch home`,
	);
}

// Group: the activation lines - byte-identical to the smoke contract, with
// the scratch paths substituted (the logFile value is part of the string).
{
	Check(
		HasLine(
			"governor",
			"activated (anywhere mode, logFile=" +
				Ledgers +
				"/governor.log, updateMode=programmatic, ncuBin=ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))",
		),
		"the governor's activation line is byte-identical",
	);
	Check(
		HasLine(
			"pinner",
			"activated (pinner, logFile=" +
				Ledgers +
				"/pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])",
		),
		"the pinner's activation line is byte-identical",
	);
	Check(
		HasLine(
			"cargo-governor",
			"activated (cargo flavor, logFile=" +
				Ledgers +
				"/cargo-governor.log, updateMode=cargo, cargoBin=" +
				Home +
				"/fake-cargo, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery), keepFile=(discovery))",
		),
		"the cargo governor's activation line is byte-identical",
	);
	Check(
		HasLine(
			"normalize-dash",
			"activated (replacement=-, reasoning=on, toolArgs=on, logFile=" +
				Ledgers +
				"/normalize-dash.log)",
		),
		"the dash flavor's activation line is byte-identical",
	);
	Check(
		HasLine(
			"quotes",
			"activated (reasoning=on, toolArgs=on, logFile=" + Ledgers + "/quotes.log)",
		),
		"the quotes flavor's activation line is byte-identical",
	);
	Check(
		HasLine(
			"ellipsis",
			"activated (replacement=..., reasoning=on, toolArgs=on, logFile=" +
				Ledgers +
				"/ellipsis.log)",
		),
		"the ellipsis flavor's activation line is byte-identical",
	);
	Check(
		HasLine(
			"spaces",
			"activated (replacement= , reasoning=on, toolArgs=on, logFile=" + Ledgers + "/spaces.log)",
		),
		"the spaces flavor's activation line is byte-identical",
	);
	Check(
		HasLine(
			"invisible",
			"activated (replacement=, reasoning=on, toolArgs=on, logFile=" +
				Ledgers +
				"/invisible.log)",
		),
		"the invisible flavor's activation line is byte-identical",
	);
	Check(
		HasLine(
			"fullwidth",
			"activated (reasoning=on, toolArgs=on, logFile=" + Ledgers + "/fullwidth.log)",
		),
		"the fullwidth flavor's activation line is byte-identical",
	);
	Check(
		HasLine(
			"normalize-file",
			"activated (replacement=-, logFile=" + Ledgers + "/normalize-file.log)",
		),
		"the normalize-file activation line is byte-identical",
	);
}

// Group: every ledger line is the `[ISO] message` form (the storage domain's
// real append semantics, not the smokes' synthetic captures).
{
	const GovernorLines = Lines("governor");
	Check(
		GovernorLines.length > 0 && GovernorLines.every(Iso),
		"every governor ledger line is ISO-stamped",
	);
}

// Group: the flavor counts increment per exercised stream - the one root
// llm/stream waterfall produces the exact per-flavor count lines.
for (const [Ledger, Line] of Object.entries(Wiring.StreamLedger)) {
	Check(HasLine(Ledger, Line), `the exercised stream logged "${Line}"`);
}

// Group: the governance chain lines from the exercised writes.
{
	Check(
		Lines("governor").some((Line) => Line.includes(`governed ${Paths.probeTarget} \u2192 `)),
		"the governed event-path write logged the governor's governed line",
	);
	Check(
		HasLine("pinner", "no changes to pin for " + Paths.probeTarget),
		"the pinner logged its no-changes line for the governed manifest",
	);
	Check(
		Lines("cargo-governor").some((Line) => Line.includes(`governed ${Paths.cargoToml} \u2192 `)),
		"the cargo direct fold logged the governed line for the chain Cargo.toml",
	);
	Check(
		HasLine(
			"cargo-governor",
			`no registry.json found for ${Paths.cargoRefusal} \u2014 chain pass skipped`,
		),
		"the cargo chain discovery logged the no-registry line",
	);
	Check(
		HasLine(
			"cargo-governor",
			`REFUSED rewrite of ${Paths.cargoRefusal}: dependency "leftover" in section "dependencies" not found in text \u2014 rewrite aborted`,
		),
		"the refusal attempt logged the byte-identical REFUSED line",
	);
}

// Group: the storage-domain gap is visible (Section 1.2-5 of the plan): the
// shared journal domain records its open failure in the ledgers instead of
// crashing boot. WHICH module's ledger carries the line depends on which
// open loses the best-effort race (the factory opens first; the
// governor/pinner/cargo contenders vary by boot), so the check scans the
// family ledgers.
{
	Check(
		["governor", "pinner", "cargo-governor"].some((Name) =>
			HasLine(Name, "storage journal open failed: domain 'package_governance' is already open"),
		),
		"the storage journal open failure is recorded (the silent-catch era's visible edge)",
	);
}

console.log(`${Pass} PASS - Live-Ledger/Live-Assertions`);
process.exit(Fail === 0 ? 0 : 1);
