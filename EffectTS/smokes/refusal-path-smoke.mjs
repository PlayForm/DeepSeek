// Classic/smokes/refusal-path-smoke.mjs - wiring suite #6 (the live ~/.dsh
// battery, Documentation/Plans/DOGFOOD-TESTING.md §3). The governed-path
// violation inside the scratch tree produces the byte-identical REFUSED
// ledger line and leaves the file untouched - the negative case, safely,
// never touching the user's real trees.
import { existsSync, readFileSync } from "node:fs";
import * as Wiring from "./wiring-live.mjs";

let Pass = 0,
	Fail = 0;
const Check = (Condition, Message) => {
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
const Lines = (Name) =>
	existsSync(`${Ledgers}/${Name}.log`)
		? readFileSync(`${Ledgers}/${Name}.log`, "utf8").split("\n").filter((Line) => Line.trim() !== "")
		: [];

const { Paths } = await Wiring.Exercise();
const Refused = `REFUSED rewrite of ${Paths.cargoRefusal}: dependency "leftover" in section "dependencies" not found in text — rewrite aborted`;

// THE REFUSAL LEDGER LINE - byte-identical (the CORE's Refusal composer).
Check(
	Lines("cargo-governor").some((Line) => Line.endsWith(Refused)),
	"the cargo governor logged the byte-identical REFUSED line",
);

// THE FILE IS UNTOUCHED - the aborted rewrite never writes a partial one.
Check(
	readFileSync(Paths.cargoRefusal, "utf8") === Paths.cargoRefusalContent,
	"the refused Cargo.toml is byte-identical to what was written (no partial rewrite)",
);

// NO GOVERNED LINE FOR THE REFUSED PATH - the refusal never proceeds to a
// guarded write.
Check(
	!Lines("cargo-governor").some((Line) => Line.includes(`governed ${Paths.cargoRefusal} `)),
	"no governed line exists for the refused path",
);

// THE CONTRAST - the sibling pretty-table manifest (a locatable plan) went
// through: its governed line exists and its bytes changed.
Check(
	Lines("cargo-governor").some((Line) => Line.includes(`governed ${Paths.cargoRefusal2} `)),
	"the sibling locatable plan was governed (the refusal is entry-specific, not path-wide)",
);
Check(
	readFileSync(Paths.cargoRefusal2, "utf8") !== Paths.cargoRefusal2Content,
	"the governed sibling's bytes changed (the contrast holds)",
);

// THE PACKAGE GOVERNOR'S OWN REFUSAL GUARD (non-dependency sections) is a
// defensive guard the chain pass cannot trigger by construction - documented
// here as the residual it is (see the wiring report).

console.log(`\n${Pass} checks - ${Fail === 0 ? "ALL PASS" : `${Fail} FAIL`}`);
process.exit(Fail === 0 ? 0 : 1);
