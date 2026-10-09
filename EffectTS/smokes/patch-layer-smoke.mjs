// Classic/smokes/patch-layer-smoke.mjs - wiring suite #3 (the live ~/.dsh
// battery, Documentation/Plans/DOGFOOD-TESTING.md §3). The effective-config
// rule: the patch config REPLACES the entry config wholesale; the
// $DSH_HOME/cordis.patch.yml home-level layer outranks the profile's own;
// a patch toggle flips a family plugin's Config as the harness projects it.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
// The dump renders long scalar values (the /var/folders scratch paths) as
// YAML folded block scalars; flatten them so substring assertions hold
// regardless of the scratch path length.
const EntryConfig = (Dump, Id) => {
	Dump = Dump.replace(/: >-\n\s+/g, ": ").replace(/: \|-\n\s+/g, ": ");
	const Start = Dump.indexOf(`- id: ${Id}\n`);
	if (Start < 0) return null;
	const Next = Dump.indexOf("\n# == ", Start + 1);
	return Dump.slice(Start, Next < 0 ? Dump.length : Next);
};

// THE BUNDLE LAYER DEFAULTS (no user patch, no overlay).
const Plain = await Wiring.DumpConfig("plain");
const GovernorDefault = EntryConfig(Plain, "hook-dsh-package-governor");
Check(
	GovernorDefault.includes("updateCooldownMs: 3000"),
	"the bundle layer's governor config carries updateCooldownMs: 3000 before any patch",
);
Check(
	GovernorDefault.includes("logFile: ~/.dsh/hook-dsh-package-governor.log"),
	"the bundle layer's logFile default is the un-expanded ~/.dsh form (the silent-catch ledger gap)",
);

// THE WIRING OVERLAY - the wholesale replacement.
const Overlay = await Wiring.DumpConfig("overlay", `${Home}/overlay.yml`);
const GovernorOverlay = EntryConfig(Overlay, "hook-dsh-package-governor");
Check(
	GovernorOverlay.includes(`logFile: ${Home}/ledgers/governor.log`),
	"the overlay's governor logFile replaces the entry config",
);
Check(
	EntryConfig(Plain, "hook-dsh-normalize-dash").includes("normalizeToolArguments: true"),
	"the bundle layer's dash normalizeToolArguments is true before any patch",
);
const DashOverlay = EntryConfig(Overlay, "hook-dsh-normalize-dash");
Check(
	DashOverlay.includes("replacement: '-'") &&
		DashOverlay.includes("normalizeToolArguments: true"),
	"the dash flavor's overlay config is projected exactly",
);

// THE WHOLESALE RULE, OBSERVABLE: the dash schema's
// normalizeToolArguments default is false while the bundle layer sets true;
// an overlay row that omits it must fall back to the schema default (false),
// not inherit the bundle layer's true.
const WholesalePath = `${Home}/overlay-wholesale.yml`;
writeFileSync(
	WholesalePath,
	`- id: hook-dsh-normalize-dash\n  config:\n    log: true\n    logFile: ${Home}/ledgers/wholesale-dash.log\n`,
);
try {
	const Wholesale = await Wiring.DumpConfig("wholesale", WholesalePath);
	Check(
		!EntryConfig(Wholesale, "hook-dsh-normalize-dash").includes("normalizeToolArguments"),
		"the patch config REPLACES the entry config wholesale: the omitted cell is absent from the composed config (the schema default wins at runtime, not the bundle layer's true)",
	);
} finally {
	rmSync(WholesalePath, { force: true });
}

// THE PATCH TOGGLE - a one-row overlay flips a family Config value.
const TogglePath = `${Home}/overlay-toggle.yml`;
writeFileSync(TogglePath, '- id: hook-dsh-normalize-dash\n  config:\n    replacement: ">"\n');
try {
	const Toggled = await Wiring.DumpConfig("toggle", TogglePath);
	Check(
		EntryConfig(Toggled, "hook-dsh-normalize-dash").includes("replacement: '>'"),
		"a one-row patch flips the dash replacement as the harness projects it",
	);
} finally {
	rmSync(TogglePath, { force: true });
}

// THE HOME-LEVEL PATCH LAYER ($DSH_HOME/cordis.patch.yml) outranks the
// profile's own layer.
const HomePatch = `${Home}/cordis.patch.yml`;
const WroteHomePatch = !existsSync(HomePatch);
writeFileSync(
	HomePatch,
	`- id: hook-dsh-package-pinner\n  config:\n    logFile: ${Home}/ledgers/home-pinner.log\n`,
);
try {
	const WithHome = await Wiring.DumpConfig("home-patch");
	Check(
		EntryConfig(WithHome, "hook-dsh-package-pinner").includes(
			`logFile: ${Home}/ledgers/home-pinner.log`,
		),
		"the home-level patch layer is applied over the profile's own layer",
	);
} finally {
	if (WroteHomePatch) rmSync(HomePatch, { force: true });
}

// THE HOME PATCH IS GONE - no residue for the other dumps.
Check(
	!existsSync(HomePatch) || !readFileSync(HomePatch, "utf8").includes("home-pinner.log"),
	"the home-level patch left no residue in the scratch home",
);

console.log(`\n${Pass} checks - ${Fail === 0 ? "ALL PASS" : `${Fail} FAIL`}`);
process.exit(Fail === 0 ? 0 : 1);
