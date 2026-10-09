// Classic/smokes/governed-write-smoke.mjs - wiring suite #5 (the live ~/.dsh
// battery, Documentation/Plans/DOGFOOD-TESTING.md §3). A real
// raw-write/normalize-file through the harness's event loop normalizes the
// fixture and leaves the expected bytes on disk; the governed event path
// rewrites the manifest through the guarded write; the raw-write govern
// escape hatch stays event-silent BY DESIGN.
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

// THE RAW-WRITE NORMALIZE PATH - the six-transform Rewrite chain applied to
// the real file bytes (the same fixture the smokes use, promoted on-disk).
Check(
	readFileSync(Paths.normalizeFixture, "utf8") === Wiring.SixNormalized,
	"the raw-write normalize:true fixture is on disk byte-normalized (dashes, quotes, ellipsis, spaces, invisibles, fullwidth)",
);

// THE GOVERNED EVENT PATH - the factory's shared write executor through the
// real fs/write-intent waterfall and the root fs/observed emit; the
// governor's guarded write re-serialized the manifest with the canonical pin.
const ExpectedProbe =
	'{\n  "name": "@local/scratch-probe",\n  "version": "0.1.0",\n  "dependencies": {\n    "lodash": "^4.2.0"\n  }\n}\n';
Check(
	readFileSync(Paths.probeTarget, "utf8") === ExpectedProbe,
	"the governed manifest was rewritten by the chain pass (3.0.0 → ^4.2.0, the JSON.stringify(2)+\\n form)",
);

// THE ESCAPE HATCH - a raw-write with govern OFF (the wrapped actor's
// falsy marker) does NOT trigger the event path: no governor line for it.
const SilentGovernor = !Lines("governor").some((Line) => Line.includes(Paths.packageJson));
Check(SilentGovernor, "the raw-write govern:false escape hatch kept the event path silent for the manifest");

// THE DIRECT FOLD - the raw-write govern:true chain pass rewrote the Cargo
// chain pin to the full resolved form, surgically (comments/formatting kept).
Check(
	readFileSync(Paths.cargoToml, "utf8") === '[dependencies]\nserde = "1.2.3"\n',
	"the cargo direct fold rewrote the chain pin to the bare resolved version (serde = \"1.2.3\")",
);

// THE NORMALIZATION-ONLY CARGO PATH (no registry): simple forms padded to
// X.Y.Z by the cargo flavor's normalization rule.
Check(
	readFileSync(Paths.cargoRefusal2, "utf8") === '[dependencies]\nserde = { version = "1.0.0" }\nleftover = "2.0.0"\n',
	"the cargo normalization pass padded the simple version forms inline (1.0 → 1.0.0)",
);

// THE NORMALIZE-FILE TOOL - through the observation-policy-disabled boot
// (the tool's update path requires an fs/write-intent replaceIfVersion
// decision, which needs an observed owner; see the residuals report).
const NF = await Wiring.NormalizeFileBoot();
const NFPaths = NF.Paths;
Check(
	readFileSync(NFPaths.normalizeFileTarget, "utf8") === Wiring.SixNormalized,
	"the normalize-file tool left the expected normalized bytes on disk",
);
const Count = Object.values(Wiring.SixCounts).reduce((Sum, N) => Sum + N, 0);
const NFLine = `normalized ${Count} char(s) in ${NFPaths.normalizeFileTarget}`;
Check(
	Lines("normalize-file").some((Line) => Line.endsWith(NFLine)),
	`the normalize-file ledger logged "${NFLine}"`,
);
const NFGovernorSilent = !Lines("governor").some((Line) => Line.includes(NFPaths.normalizeFileTarget));
Check(NFGovernorSilent, "the normalize-file write is not a governance event (no governor line for it)");

console.log(`\n${Pass} checks - ${Fail === 0 ? "ALL PASS" : `${Fail} FAIL`}`);
process.exit(Fail === 0 ? 0 : 1);
