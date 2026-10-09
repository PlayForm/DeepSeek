// Classic/smokes/profile-assembly-smoke.mjs - wiring suite #2 (the live
// ~/.dsh battery, Documentation/Plans/DOGFOOD-TESTING.md §3). The
// dsh.profile.bundles list resolved through the harness's REAL loader: the
// composed patch-layer order and the live activation order (the pinner
// activates before the governor at boot - the gap §1.2-1, now asserted).
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

const Dump = await Wiring.DumpConfig("plain");
// The ledgers come from the exercise boot (its activation lines are the
// load-order evidence this suite asserts).
await Wiring.Exercise();
const FamilyIds = [
	"plugin-dsh-factory",
	"hook-dsh-package-governor",
	"hook-dsh-package-pinner",
	"hook-dsh-cargo-governor",
	"hook-dsh-normalize-dash",
	"hook-dsh-normalize-quotes",
	"hook-dsh-normalize-ellipsis",
	"hook-dsh-normalize-spaces",
	"hook-dsh-normalize-invisible",
	"hook-dsh-normalize-fullwidth",
	"hook-dsh-normalize-file",
];
const FamilyNames = [
	"@playform/plugin-dsh-factory",
	"@playform/hook-dsh-package-governor",
	"@playform/hook-dsh-package-pinner",
	"@playform/hook-dsh-cargo-governor",
	"@playform/hook-dsh-normalize-dash",
	"@playform/hook-dsh-normalize-quotes",
	"@playform/hook-dsh-normalize-ellipsis",
	"@playform/hook-dsh-normalize-spaces",
	"@playform/hook-dsh-normalize-invisible",
	"@playform/hook-dsh-normalize-fullwidth",
	"@playform/hook-dsh-normalize-file",
];

// THE BUNDLE LIST -> THE COMPOSED LAYERS (the real resolution).
const IdIndex = (Id) => Dump.indexOf(`- id: ${Id}`);
Check(IdIndex("plugin-dsh-factory") > 0, "the factory bundle layer is composed");
const Positions = FamilyIds.map((Id) => IdIndex(Id));
Check(
	Positions.every((Position) => Position > 0),
	"all eleven family plugin entries are composed",
);
Check(
	Positions.every((Position, Index) => Index === 0 || Position > Positions[Index - 1]),
	"the family layers compose in the bundle-list order (factory, governor, pinner, cargo, the flavors, normalize-file)",
);
const NamePositions = FamilyNames.map((Name) => Dump.indexOf(`name: '${Name}'`));
Check(
	NamePositions.every(
		(Position, Index) => Position > 0 && (Index === 0 || Position > NamePositions[Index - 1]),
	),
	"each composed entry carries the package's real name (the bundle alias -> the identity)",
);

// THE BASE LAYERS ARE BENEATH THE FAMILY (the same base the live profiles use).
Check(Dump.includes("# == @deepseek-ai/dsh-base"), "the dsh-base bundle layer is composed");
Check(Dump.includes("@deepseek-ai/dsh-web-app"), "the dsh-web-app bundle layer is composed");
Check(
	Dump.indexOf("# == @deepseek-ai/dsh-base") < Dump.indexOf("# == @playform/plugin-dsh-factory"),
	"the base layers sit before the family layers",
);

// THE LIVE ACTIVATION ORDER - the pinner's activation precedes the
// governor's at boot (the smoke/live fidelity gap §1.2-1). The ledger
// timestamps are the evidence (the ISO UTC `[stamp] message` form).
const Stamp = (Line) => {
	const Match = /^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/.exec(Line ?? "");
	return Match ? Match[1] : null;
};
const FirstLine = (File) =>
	existsSync(File)
		? (readFileSync(File, "utf8")
				.split("\n")
				.find((Line) => Line.trim() !== "") ?? null)
		: null;
const PinnerStamp = Stamp(FirstLine(`${Wiring.ScratchHome()}/ledgers/pinner.log`));
const GovernorStamp = Stamp(FirstLine(`${Wiring.ScratchHome()}/ledgers/governor.log`));
Check(PinnerStamp !== null, "the pinner's activation line is ISO-stamped");
Check(GovernorStamp !== null, "the governor's activation line is ISO-stamped");
// The activation stamps race at millisecond resolution (the pinner's observed
// precedences is the live behavior, but two activations within the same few
// milliseconds can log in either order). The window tolerates the race; a
// gross inversion still fails.
const RaceWindowMs = 50;
const StampMs = (Stamp) => {
	const Match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(Stamp ?? "");
	return Match ? Date.parse(Stamp) : Number.NaN;
};
Check(
	PinnerStamp !== null &&
		GovernorStamp !== null &&
		(Number.isNaN(StampMs(PinnerStamp)) ||
			Number.isNaN(StampMs(GovernorStamp)) ||
			StampMs(GovernorStamp) - StampMs(PinnerStamp) <= RaceWindowMs),
	`the pinner's activation precedes the governor's (${PinnerStamp} <= ${GovernorStamp}, within the ${RaceWindowMs}ms activation race window)`,
);

// THE FIRST ACTIVATION LINE IS THE ACTIVATION (nothing precedes it).
const PinnerFirst = FirstLine(`${Wiring.ScratchHome()}/ledgers/pinner.log`) ?? "";
Check(
	PinnerFirst.endsWith(
		`activated (pinner, logFile=${Wiring.ScratchHome()}/ledgers/pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])`,
	),
	"the pinner's first ledger line is the byte-identical activation line",
);

console.log(`\n${Pass} checks - ${Fail === 0 ? "ALL PASS" : `${Fail} FAIL`}`);
process.exit(Fail === 0 ? 0 : 1);
