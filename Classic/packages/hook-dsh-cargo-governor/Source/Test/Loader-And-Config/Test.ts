// Source/Test/Loader-And-Config/Test.ts - one singular test: the loader
// contract (the named exports + the default object's four keys + apply's
// undefined return) and the config schema (every default, the volatile cells
// vs the plain module fields, the overrides validation).
// Runs standalone (`node Target/Test/Loader-And-Config/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-cargo-governor.
import assert from "node:assert/strict";
import {
	Boot,
	Check,
	Finish,
	Furnace,
	LedgerFile,
	MakeContext,
	MakeCounter,
	Validate,
} from "../Harness.js";
import * as Cargo from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the loader contract.
	{
		Check(Count, "loader: name/apply/Config/inject named exports, inject = [fs, pluginFactory]", () => {
			assert.equal(Cargo.name, "hook-dsh-governor-cargo");
			assert.equal(typeof Cargo.apply, "function");
			assert.equal(typeof Cargo.Config, "function", "Config is a real schemastery schema");
			assert.deepEqual(Cargo.inject, ["fs", "pluginFactory"]);
		});
		Check(Count, "loader: default object carries name/apply/Config/inject", () => {
			assert.deepEqual(
				Object.keys(Cargo.default).sort(),
				["Config", "apply", "inject", "name"],
				"the default object carries ALL FOUR (the accessor shadow pitfall)",
			);
			assert.equal(Cargo.default.inject, Cargo.inject);
			assert.equal(Cargo.default.Config, Cargo.Config);
			assert.equal(Cargo.default.apply, Cargo.apply);
		});
		{
			const m = MakeContext();
			m.ctx.pluginFactory = Furnace;
			m.ledger = LedgerFile("loader");
			const { ret } = Boot(m);
			Check(Count, "loader: apply returns undefined", () => {
				assert.equal(ret, undefined, "apply returns NOTHING");
			});
		}
	}
	// Group: the config schema.
	{
		const cfg0 = Validate({});
		Check(Count, "config: all defaults (separate ledger, cargoBin, updateMode, exclude list)", () => {
			assert.equal(cfg0.log.get(), true, "log default");
			assert.equal(
				cfg0.logFile.get(),
				"~/.dsh/hook-dsh-cargo-governor.log",
				"the SEPARATE ledger default",
			);
			assert.equal(cfg0.updateCooldownMs.get(), 3000);
			assert.deepEqual(cfg0.mutationTools.get(), ["write", "edit", "str_replace_editor", "raw-write"]);
			assert.equal(cfg0.policyFile, "");
			assert.equal(cfg0.strict, false);
			assert.equal(cfg0.maxUpdateFailures, 3);
			assert.equal(cfg0.cargoBin, "cargo");
			assert.equal(cfg0.keepFile, "");
			assert.equal(cfg0.updateMode, "cargo");
			assert.deepEqual(cfg0.exclude, [
				"node_modules",
				".git",
				".dsh",
				".pnpm",
				".store",
				"DeepSeek Harness.app",
			]);
		});
		Check(Count, "config: shared volatile cells + plain module fields", () => {
			for (const f of ["log", "logFile", "updateCooldownMs", "mutationTools"])
				assert.equal(typeof cfg0[f].get, "function", `${f} is a volatile cell`);
			for (const f of [
				"policyFile",
				"exclude",
				"strict",
				"maxUpdateFailures",
				"cargoBin",
				"keepFile",
				"updateMode",
			])
				assert.equal(typeof cfg0[f]?.get, "undefined", `${f} validates plain`);
		});
		const cfg1 = Validate({
			cargoBin: "cargo",
			strict: true,
			keepFile: "/k.json",
			updateMode: "cargo",
		});
		Check(Count, "config: overrides validated (patch-row values)", () => {
			assert.equal(cfg1.cargoBin.get?.() ?? cfg1.cargoBin, "cargo");
			assert.equal(cfg1.strict, true);
			assert.equal(cfg1.keepFile, "/k.json");
		});
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
