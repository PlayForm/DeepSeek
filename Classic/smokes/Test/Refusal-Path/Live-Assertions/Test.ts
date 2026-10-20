// smokes/Test/Refusal-Path/Live-Assertions/Test.ts - one singular test: the
// governed-path violation inside the scratch tree produces the byte-
// identical REFUSED ledger line and leaves the file untouched - the negative
// case, safely, never touching the user's real trees. Split from
// refusal-path-smoke.mjs: this folder carries the suite's live assertions;
// the skip guard and the harness checks live in the sibling Gate-And-Harness
// folder.
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

// The main boot's Paths shape (the live-assertions view of the exercise).
type ExercisePaths = {
	cargoRefusal: string;
	cargoRefusalContent: string;
	cargoRefusal2: string;
	cargoRefusal2Content: string;
};

const Exercised = (await Wiring.Exercise())!;
const Paths = Exercised.Paths as ExercisePaths;
const Refused = `REFUSED rewrite of ${Paths.cargoRefusal}: dependency "leftover" in section "dependencies" not found in text \u2014 rewrite aborted`;

// Group: the refusal ledger line - byte-identical (the CORE's Refusal
// composer).
{
	Check(
		Lines("cargo-governor").some((Line) => Line.endsWith(Refused)),
		"the cargo governor logged the byte-identical REFUSED line",
	);
}

// Group: the file is untouched - the aborted rewrite never writes a partial
// one.
{
	Check(
		readFileSync(Paths.cargoRefusal, "utf8") === Paths.cargoRefusalContent,
		"the refused Cargo.toml is byte-identical to what was written (no partial rewrite)",
	);
}

// Group: no governed line for the refused path - the refusal never proceeds
// to a guarded write.
{
	Check(
		!Lines("cargo-governor").some((Line) => Line.includes(`governed ${Paths.cargoRefusal} `)),
		"no governed line exists for the refused path",
	);
}

// Group: the contrast - the sibling pretty-table manifest (a locatable plan)
// went through: its governed line exists and its bytes changed.
{
	Check(
		Lines("cargo-governor").some((Line) => Line.includes(`governed ${Paths.cargoRefusal2} `)),
		"the sibling locatable plan was governed (the refusal is entry-specific, not path-wide)",
	);
	Check(
		readFileSync(Paths.cargoRefusal2, "utf8") !== Paths.cargoRefusal2Content,
		"the governed sibling's bytes changed (the contrast holds)",
	);
}

// The package governor's own refusal guard (non-dependency sections) is a
// defensive guard the chain pass cannot trigger by construction - documented
// here as the residual it is (see the wiring report).

console.log(`${Pass} PASS - Refusal-Path/Live-Assertions`);
process.exit(Fail === 0 ? 0 : 1);
