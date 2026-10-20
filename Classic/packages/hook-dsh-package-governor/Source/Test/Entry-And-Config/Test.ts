// Source/Test/Entry-And-Config/Test.ts - one singular test: the entry
// contract (name/apply/Config/inject), the built Target's factory-consumption
// posture (the ONLY factory import is the Config module's standalone Schema),
// and the Config schema's volatile cells + defaults.
// Runs standalone (`node Target/Test/Entry-And-Config/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-package-governor.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import { Check, EXCLUDE, Finish, Ledger, MakeCounter, NCU_BIN, TOOLS } from "../Harness.js";
import * as Governor from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the entry contract.
	{
		const Sub = "entry: name/apply/Config/inject + the default object carries all four";
		{
			Check(Count, Sub, () => {
				assert.equal(Governor.name, "hook-dsh-governor-package");
				assert.equal(typeof Governor.apply, "function");
				assert.ok(Governor.Config, "Config schema exported");
				assert.deepEqual(Governor.inject, ["fs", "pluginFactory"], "inject = fs + pluginFactory");
				for (const k of ["name", "apply", "Config", "inject"])
					assert.ok(k in Governor.default, `default object carries ${k}`);
			});
		}
	}
	{
		const Sub =
			"consumption: the built Target resolves the factory through ctx EXCEPT the Config module's standalone Schema import";
		{
			Check(Count, Sub, () => {
				// the ONLY factory import is the Config module's standalone Schema (the
				// module-load use - factory v0.1.1 P1); every OTHER Target module
				// resolves the factory exclusively through ctx (the injected service)
				const GovernorDir = Path.resolve(import.meta.dirname, "../../..");
				const factoryImporters: string[] = [];
				const walk = (dir: string) => {
					// The compiled Test tree lives under Target/Test and mentions the
					// factory only in its harness imports - skip it (fixture-only
					// adaptation; the source suite ran this walk before the Test tree
					// existed).
					if (dir.endsWith(Path.join("Target", "Test"))) return;
					for (const e of FileSystem.readdirSync(dir, { withFileTypes: true })) {
						const p = Path.join(dir, e.name);
						if (e.isDirectory()) walk(p);
						else if (p.endsWith(".js")) {
							const source = FileSystem.readFileSync(p, "utf8");
							if (source.includes("plugin-dsh-factory")) factoryImporters.push(p);
						}
					}
				};
				walk(`${GovernorDir}/Target`);
				assert.deepEqual(
					factoryImporters,
					[Path.join(GovernorDir, "Target", "Variable", "Config.js")],
					"the ONLY factory import is the Config module's standalone Schema (module-load use)",
				);
			});
		}
	}
	{
		const Sub = "Config: volatile cells + defaults (factory.Schema shared-block parity)";
		{
			Check(Count, Sub, () => {
				const raw = Governor.Config({ logFile: Ledger });
				assert.equal(raw.logFile.get(), Ledger, "volatile logFile cell");
				assert.equal(raw.log.get(), true, "volatile log cell default true");
				assert.equal(raw["updateCooldownMs"].get(), 3000, "volatile cooldown cell");
				assert.deepEqual(raw["mutationTools"].get(), TOOLS, "volatile mutationTools cell");
				assert.equal(raw["strict"], false);
				assert.equal(raw["maxUpdateFailures"], 3);
				assert.equal(raw["updateMode"], "programmatic");
				assert.equal(raw["ncuBin"], NCU_BIN);
				assert.equal(raw["policyFile"], "");
				assert.deepEqual(raw["exclude"], EXCLUDE);
			});
		}
	}
	{
		const Sub = "Config: the default logFile is the documented ledger path";
		{
			Check(Count, Sub, () => {
				assert.equal(
					Governor.Config({}).logFile.get(),
					"~/.dsh/hook-dsh-package-governor.log",
					"logFile default (volatile cell) - must equal the cordis.patch.yml row and the README",
				);
			});
		}
	}
	return Finish(Count, "Entry-And-Config");
};

// Standalone entry: `node Target/Test/Entry-And-Config/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Entry-And-Config`);
}
