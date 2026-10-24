// Source/Test/Loader-And-Config/Test.ts - one singular test: the pinner's
// loader contract (name/apply/Config/inject + the full default object) and the
// factory-built Config schema validated with the historical defaults.
// Runs standalone (`node Target/Test/Loader-And-Config/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-package-pinner.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import * as Pinner from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the loader contract.
	{
		const Sub = "loader contract: name/apply/Config/inject + the full default object";
		{
			Check(Count, Sub, () => {
				assert.equal(Pinner.name, "hook-dsh-pinner-package", "name export");
				assert.equal(typeof Pinner.apply, "function", "apply export");
				assert.equal(typeof Pinner.Config, "function", "Config export is a callable schema");
				assert.ok(Pinner.Config.dict, "Config carries the schema dictionary");
				assert.deepEqual(
					Pinner.inject,
					["fs", "pluginFactory"],
					"inject declares fs + the factory service",
				);
				assert.deepEqual(
					Object.keys(Pinner.default).sort(),
					["Config", "apply", "inject", "name"],
					"default object carries all four",
				);
				assert.equal(Pinner.default.apply, Pinner.apply, "default.apply is the named apply");
			});
		}
	}
	// Group: the Config schema (factory-built, real validation).
	{
		const Sub = "Config schema: all six shared/own fields validated with the historical defaults";
		{
			Check(Count, Sub, () => {
				const schema = Pinner.Config;
				const validated = schema({});
				assert.equal(validated.log.get(), true, "log default (volatile cell)");
				assert.equal(
					validated.logFile.get(),
					"~/.dsh/playform/ets-hook-dsh-package-pinner.log",
					"logFile default (volatile cell)",
				);
				assert.deepEqual(
					validated["mutationTools"].get(),
					["write", "edit", "str_replace_editor", "raw-write"],
					"mutationTools default (volatile cell)",
				);
				assert.equal(
					validated["updateCooldownMs"].get(),
					3000,
					"factory shared updateCooldownMs present (the pinner never reads it)",
				);
				assert.equal(validated["policyFile"], "", "policyFile default (non-volatile)");
				assert.deepEqual(
					validated["sections"],
					["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"],
					"sections default",
				);
				assert.deepEqual(
					validated["exclude"],
					["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"],
					"exclude default",
				);
			});
		}
	}
	return Finish(Count, "Loader-And-Config");
};

// Standalone entry: `node Target/Test/Loader-And-Config/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Loader-And-Config`);
}
