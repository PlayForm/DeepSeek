// Source/Test/Wiring-And-Endpoints/Test.ts - the wiring: the loader contract
// (the default object carries name/apply/Config/inject, apply returns
// nothing), the service provided through ctx.provide, the byte-exact
// activation lines for both postures, the disabled gate on both endpoints,
// and the fail-loud schema validation.
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	LinesWith,
	Make,
	MakeCounter,
	MakeRoot,
	Plugin,
	Validate,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the loader contract.
	{
		const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
		Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
			assert.equal((Plugin as any).name, "client-dsh-panel-family-host");
			assert.equal(typeof (Plugin as any).apply, "function");
			assert.ok((Plugin as any).Config);
			assert.deepEqual((Plugin as any).inject, ["webServer"]);
		});
		Check(Count, "L1: apply returns NOTHING and the service is provided", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Run.Service !== undefined);
			assert.equal(typeof Run.Service.tail, "function");
			assert.equal(typeof Run.Service.stats, "function");
		});
	}

	// Group W1: the disabled posture.
	{
		const Run = Make(Validate({ logRoot: MakeRoot() }));
		Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["host: activated (enabled=false)"]);
		});
		await CheckAsync(Count, "W1: a disabled endpoint answers with the refusal, never reads", async () => {
			assert.deepEqual(await Run.Service.tail("hook-dsh-workspace-observe", 5), {
				ok: false,
				code: "rejected",
				message: "the panel-family host is disabled (enabled=false)",
			});
			assert.deepEqual(await Run.Service.stats(), {
				ok: false,
				code: "rejected",
				message: "the panel-family host is disabled (enabled=false)",
			});
		});
	}

	// Group W2: the enabled posture.
	{
		const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
		Check(Count, "W2: the activation line is byte-exact", () => {
			assert.deepEqual(Run.Lines, ["host: activated (enabled=true)"]);
		});
	}

	// Group X1: the fail-loud schema validation.
	{
		Check(Count, "X1: maxLines below 1 fails loud at load", () => {
			assert.throws(() => Validate({ maxLines: 0 }), /expected number >= 1/);
		});
		Check(Count, "X1: maxLines above 2000 fails loud at load", () => {
			assert.throws(() => Validate({ maxLines: 2001 }), /expected number <= 2000/);
		});
	}

	// Group W3: no logging beyond the activation line.
	{
		const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
		Check(Count, "W3: nothing is logged on apply beyond the activation line", () => {
			assert.deepEqual(LinesWith(Run, "host:"), Run.Lines);
			assert.equal(Run.Lines.length, 1);
		});
	}
	return Finish(Count, "Wiring-And-Endpoints");
};

// Standalone entry: `node Target/Test/Wiring-And-Endpoints/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Endpoints`);
}
