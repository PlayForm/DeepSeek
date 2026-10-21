// One-shot generator: the wave-3 mirror of the live-containers ETS twin from
// the Classic twin under the tree-identity substitutions ONLY (the L2
// precedent, Maintain/generate-ets-governor-tests.mjs). Identity ledger
// strings are protected - the ETS packages keep the Classic module
// identities by contract. Run once from the monorepo root; the output is
// diff-verified afterwards.
import * as FS from "node:fs";
import * as Path from "node:path";

const From = "Classic/packages/hook-dsh-live-containers";
const To = "EffectTS/packages/ets-hook-dsh-live-containers";

// The wave-3 file set (the new modules, the additive edits, the tests, the
// docs) - the untouched wave-1/2 files stay as generated before.
const Files = [
	"Source/Interface/Events.ts",
	"Source/Interface/State.ts",
	"Source/Interface/Config.ts",
	"Source/Variable/DefaultCheckSets.ts",
	"Source/Variable/Config.ts",
	"Source/Function/Watchlist.ts",
	"Source/Function/Band.ts",
	"Source/Function/Storage.ts",
	"Source/Function/Monitors.ts",
	"Source/Function/MonitorTools.ts",
	"Source/Function/Jobs.ts",
	"Source/Function/Board.ts",
	"Source/Function/Plant.ts",
	"Source/Function/Apply.ts",
	"Source/Test/Harness.ts",
	"Source/Test/Monitors-Engine/Test.ts",
	"Source/Test/Monitors-Engine/README.md",
	"Source/Test/Monitors-Band/Test.ts",
	"Source/Test/Monitors-Band/README.md",
	"Source/Test/Monitors-Jobs/Test.ts",
	"Source/Test/Monitors-Jobs/README.md",
	"Source/Test/Monitors-Persist/Test.ts",
	"Source/Test/Monitors-Persist/README.md",
	"Source/Test/Monitors-Tools/Test.ts",
	"Source/Test/Monitors-Tools/README.md",
	"Source/Test/Monitors-Boards/Test.ts",
	"Source/Test/Monitors-Boards/README.md",
	"README.md",
	"SCHEME.md",
];

const Substitute = (text) =>
	text
		// The core bundle import: the ETS twin binds @playform/ets-base-dsh.
		.replaceAll("@playform/lib-dsh-core", "@playform/ets-base-dsh")
		// Cross-bundle import paths and comment mentions of the factory package.
		.replaceAll("plugin-dsh-factory", "ets-plugin-dsh-factory");

for (const File of Files) {
	const Source = Path.join(From, File);
	const Target = Path.join(To, File);
	FS.mkdirSync(Path.dirname(Target), { recursive: true });
	const text = FS.readFileSync(Source, "utf8");
	FS.writeFileSync(Target, Substitute(text));
}
console.log("generated", Files.length, "files into", To);
