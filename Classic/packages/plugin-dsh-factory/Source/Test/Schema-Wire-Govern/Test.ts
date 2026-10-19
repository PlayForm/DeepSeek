// Source/Test/Schema-Wire-Govern/Test.ts - one singular test: the Schema
// factory (the shared volatile fields, the per-module defaults, the real
// validation + unwrap, the module field slots appended verbatim), the Wire
// registration (the fiber-owned fs/observed listener + the module-supplied
// activation proof) and the direct-govern registry (RegisterGovern storage,
// selection resolution, basename routing, per-step containment, in-place
// re-registration).
// Runs standalone (`node Target/Test/Schema-Wire-Govern/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/plugin-dsh-factory: the fake ctx + the REAL factory
// class, from the Harness.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Check,
	CheckAsync,
	Finish,
	MakeCounter,
	Make,
	TempRoot,
	FactoryClass,
} from "../Harness.js";
import Unwrap from "../../../Target/Function/Unwrap.js";
import SectionList from "../../../Target/Variable/Default.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// The folder fixtures: the fake ctx + the REAL factory instance, the temp
	// root, the flavor ledger and the source suite's st1 State.
	const Fake = Make(null, { files: {} });
	const ctx = Fake.Context;
	const { events } = Fake;
	const Root = TempRoot("factory-smoke-");
	const Ledger = Path.join(Root, "ledger.log");
	const flavorLedger = Path.join(Root, "flavor-ledger.log");
	const factory: any = new FactoryClass(ctx);
	const volatileCell = { get: () => ["write", "edit"] };
	const proj = Path.join(Root, "proj");
	FileSystem.mkdirSync(proj, { recursive: true });
	const target = { targetKey: "k1", displayPath: Path.join(proj, "package.json") };
	const present = { kind: "present", version: "v1" };
	const actor = { name: "edit" };
	const st1: any = factory.State(
		ctx,
		{
			log: true,
			logFile: Ledger,
			policyFile: "",
			exclude: ["x"],
			mutationTools: volatileCell,
			strict: false,
			sections: ["dependencies"],
		},
		{ module: "smoke-flavor", fields: { Section: "sections", Strict: "strict" } },
	);
	// Group: 15 - Schema: shared volatile fields + module fields.
	{
		const Sub =
			"Schema: shared volatile fields, per-module defaults, module field slots, real validation + unwrap";
		{
			Check(Count, Sub, () => {
				const schema2 = factory.Schema({ logFile: flavorLedger });
				const order = Object.keys(schema2.dict ?? {});
				assert.deepEqual(order.slice(0, 6), [
					"log",
					"logFile",
					"updateCooldownMs",
					"mutationTools",
					"policyFile",
					"exclude",
				]);
				for (const f of ["log", "logFile", "updateCooldownMs", "mutationTools"])
					assert.equal(schema2.dict[f].meta.volatile, true, `${f} volatile`);
				assert.equal(schema2.dict.logFile.meta.default, flavorLedger);
				assert.equal(schema2.dict.updateCooldownMs.meta.default, 3000);
				assert.equal(schema2.dict.policyFile.meta.default, "");
				assert.deepEqual(schema2.dict.exclude.meta.default, SectionList);
				assert.equal(schema2.dict.exclude.meta.volatile, undefined, "exclude not volatile");
				// real schemastery validation: defaults filled, volatile cell produced +
				// unwrapped
				const validated = schema2({});
				assert.equal(
					validated.logFile.get(),
					flavorLedger,
					"volatile logFile validates to a cell with the default",
				);
				assert.equal(validated.policyFile, "", "non-volatile policyFile validates to the plain default");
				const unwrapped = Unwrap(validated);
				assert.deepEqual(
					(unwrapped as any).mutationTools,
					["write", "edit", "str_replace_editor", "raw-write"],
					"volatile cell unwrapped by State machinery",
				);
				assert.equal((unwrapped as any).log, true);
			});
		}
	}
	// Group: Schema - module fields appended last, after the shared block.
	{
		const Sub = "Schema: module field slots appended verbatim";
		{
			Check(Count, Sub, () => {
				const flavorField = factory.Schema({}, {}).dict.exclude;
				const schema3 = factory.Schema({ logFile: flavorLedger }, { sections: flavorField });
				assert.equal(
					Object.keys(schema3.dict).at(-1),
					"sections",
					"module field appended after the shared block",
				);
				assert.deepEqual(schema3.dict.sections.meta.default, SectionList);
				assert.equal(
					schema3.dict.sections.meta.volatile,
					undefined,
					"module fields keep their own volatility",
				);
			});
		}
	}
	// Group: 13 - Wire: registration + the module's own activation proof.
	{
		const Sub = "Wire: fiber-owned fs/observed registration + module-supplied activation proof";
		{
			Check(Count, Sub, () => {
				events.length = 0;
				let observed = null;
				factory.Wire(ctx, st1, (t: unknown, o: unknown, a: unknown) => {
					observed = [t, o, a];
				});
				assert.equal(events.at(-1)[0], "fs/observed");
				events.at(-1)[1](target, present, actor);
				assert.deepEqual(observed, [target, present, actor]);
				factory.Append(st1, "activated (smoke)");
				assert.ok(FileSystem.readFileSync(Ledger, "utf8").includes("activated (smoke)"));
			});
		}
	}
	// Group: 17 - the direct-govern registry + Govern (the raw-write tool's
	// path). The SEQUENTIAL FOLD: Govern is async and awaits each step, so
	// every invocation below is awaited - the assertions observe each step's
	// completion in registered order.
	{
		const Sub =
			"Govern: the direct-govern registry \u2014 RegisterGovern storage, selection resolution (true/all/array/name/false), basename routing, per-step containment, in-place re-registration";
		{
			await CheckAsync(Count, Sub, async () => {
				// The registry starts empty (a govern call against it is a contained
				// no-op)
				assert.deepEqual(factory.GovernSteps, {}, "the registry starts empty");
				{
					const goTarget = { targetKey: "k-gov", displayPath: Path.join(proj, "package.json") };
					const actor = { name: "edit" };
					await assert.doesNotReject(
						() => factory.Govern(goTarget, true, actor, "v1"),
						"empty registry: governed no-op",
					);
					assert.equal(
						Object.keys(factory.GovernSteps).length,
						0,
						"empty registry: nothing registered by Govern itself",
					);
					// RegisterGovern stores per basename, in registration order
					const ran: any[] = [];
					const step = (name: string) => (t: any, act: any, ver: any) =>
						ran.push([name, t.displayPath, act, ver]);
					factory.RegisterGovern("package.json", "first", step("first"));
					factory.RegisterGovern("package.json", "second", step("second"));
					factory.RegisterGovern("Cargo.toml", "cargo", step("cargo"));
					assert.deepEqual(
						factory.GovernSteps["package.json"].map((s: any) => s.name),
						["first", "second"],
						"RegisterGovern: steps stored per basename in registration order",
					);
					assert.deepEqual(
						factory.GovernSteps["Cargo.toml"].map((s: any) => s.name),
						["cargo"],
						"RegisterGovern: basenames are independent",
					);
					// selection resolution: true/"all" \u2192 all registered; array \u2192 named
					// subset; single name \u2192 that step; unknown names ignored;
					// false/absent \u2192 none.
					ran.length = 0;
					await factory.Govern(goTarget, true, actor, "v1");
					assert.deepEqual(
						ran.map((r) => r[0]),
						["first", "second"],
						"Govern: true \u2192 every registered step",
					);
					assert.deepEqual(
						ran.map((r) => r[2]),
						[actor, actor],
						"Govern: steps receive the actor",
					);
					assert.deepEqual(
						ran.map((r) => r[3]),
						["v1", "v1"],
						"Govern: steps receive the version",
					);
					assert.deepEqual(
						ran.map((r) => r[1]),
						[goTarget.displayPath, goTarget.displayPath],
						"Govern: steps receive the target",
					);
					ran.length = 0;
					await factory.Govern(goTarget, ["second", "nope"], actor, "v2");
					assert.deepEqual(
						ran.map((r) => r[0]),
						["second"],
						"Govern: array \u2192 the named subset, unknown names ignored",
					);
					assert.deepEqual(
						ran.map((r) => r[3]),
						["v2"],
						"Govern: the subset received the version",
					);
					ran.length = 0;
					await factory.Govern(goTarget, "first", actor, "v3");
					assert.deepEqual(
						ran.map((r) => r[0]),
						["first"],
						"Govern: a single name selects that step",
					);
					ran.length = 0;
					await factory.Govern(goTarget, "nope", actor, "v3");
					await factory.Govern(goTarget, ["nope"], actor, "v3");
					assert.deepEqual(ran, [], "Govern: an unknown-only selection runs nothing");
					for (const None of [false, null, undefined]) {
						ran.length = 0;
						await factory.Govern(goTarget, None, actor, "v3");
						assert.deepEqual(ran, [], `Govern: ${String(None)} \u2192 no governance`);
					}
					// a step keyed by basename does not fire for another basename
					ran.length = 0;
					await factory.Govern(
						{ targetKey: "k-toml", displayPath: Path.join(proj, "Cargo.toml") },
						true,
						actor,
						"v4",
					);
					assert.deepEqual(
						ran.map((r) => r[0]),
						["cargo"],
						"Govern: basename resolution (package.json steps not fired for Cargo.toml)",
					);
					// contained execution: a throwing step doesn't propagate, later steps
					// still run
					factory.RegisterGovern("package.json", "boom", () => {
						throw new Error("step boom");
					});
					ran.length = 0;
					await assert.doesNotReject(
						() => factory.Govern(goTarget, true, actor, "v5"),
						"a throwing step never propagates",
					);
					assert.deepEqual(
						ran.map((r) => r[0]),
						["first", "second"],
						"Govern: the steps after the throwing one still ran (per-step containment)",
					);
					// re-registration replaces in place (HMR reload, no duplicate)
					factory.RegisterGovern("package.json", "first", step("first2"));
					assert.deepEqual(
						factory.GovernSteps["package.json"].map((s: any) => s.name),
						["first", "second", "boom"],
						"RegisterGovern: same-name re-registration replaces in place (position preserved, no duplicate)",
					);
					ran.length = 0;
					await factory.Govern(goTarget, "first", actor, "v6");
					assert.deepEqual(
						ran.map((r) => r[0]),
						["first2"],
						"RegisterGovern: the replaced closure is the one that runs",
					);
				}
			});
		}
	}
	return Finish(Count, "Schema-Wire-Govern");
};

// Standalone entry: `node Target/Test/Schema-Wire-Govern/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Schema-Wire-Govern`);
}
