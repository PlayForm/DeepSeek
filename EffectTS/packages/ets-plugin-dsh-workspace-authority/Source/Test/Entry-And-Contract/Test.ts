// Source/Test/Entry-And-Contract/Test.ts - the loader contract and the
// mount: the default object carries name/apply/Config/inject, the cold mount
// is IDLE-forever with the byte-exact disabled line, the enabled mount logs
// the byte-exact activation line with the policy count, the fail-loud
// validation throws at load, and the durable ledger carries the [ISO] forms.
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Ledger,
	LedgerLines,
	Make,
	MakeCounter,
	Plugin,
	Validate,
	rm,
} from "../Harness.js";

/** A fresh run with an empty ledger. */
const Setup = (Raw: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, ...Raw }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group A1: the default object carries all four exports.
	Check(Count, "A1: the default object carries name, apply, Config and inject", () => {
		assert.equal(Plugin.name, "plugin-dsh-workspace-authority");
		assert.equal(typeof Plugin.apply, "function");
		assert.equal(typeof Plugin.Config, "function");
		assert.deepEqual(Plugin.inject, ["pluginFactory"]);
	});

	// Group A2: the cold mount.
	{
		const Run = Setup({});
		const Service = Run.Provided.workspaceAuthority;
		Check(Count, "A2: apply returns nothing, the service is still provided", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Service !== undefined);
			assert.equal(Service.name, "workspaceAuthority");
			assert.equal(Service.State.On, false);
		});
		Check(Count, "A2: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["authority: disabled (enabled=false)"]);
			assert.match(
				LedgerLines()[0] ?? "",
				/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] disabled \(enabled=false\)$/,
			);
		});
		Check(Count, "A2: the cold mount wires nothing and serves nothing", () => {
			assert.deepEqual(Run.RootNames, []);
			assert.deepEqual(Run.Effects, []);
			assert.deepEqual(Service.grant({ holder: "a", resource: "/r", operations: ["read"] }), undefined);
			assert.equal(Service.acquire("a", "/r"), undefined);
			assert.equal(Service.residence("/r", "tmp", 1), undefined);
			assert.deepEqual(Service.evict(), []);
		});
	}

	// Group A3: the fail-loud validation.
	{
		const Fail = (Raw: Record<string, unknown>, Message: string): void => {
			rm();
			let Thrown: any;
			try {
				Make(Validate({ logFile: Ledger, ...Raw }));
			} catch (Error) {
				Thrown = Error;
			}
			assert.ok(Thrown !== undefined, `expected throw: ${Message}`);
			assert.equal(Thrown.message, Message);
		};
		Check(Count, "A3: the numeric bounds fail loud", () => {
			Fail({ defaultTtlMs: 0 }, "authority: defaultTtlMs must be >= 1");
			Fail({ maxLeasesPerHolder: 0 }, "authority: maxLeasesPerHolder must be >= 1");
			Fail({ maxCapabilitiesPerHolder: 0 }, "authority: maxCapabilitiesPerHolder must be >= 1");
			Fail({ revocationGraceMs: -1 }, "authority: revocationGraceMs must be >= 0");
		});
		Check(Count, "A3: the policy table fails loud", () => {
			Fail({ policy: "nope" }, "$.policy expected array but got nope");
			Fail(
				{ policy: [{ kind: "tmp", disposition: "nuke" }] },
				"authority: every policy rule needs disposition ∈ {keep, defer, evict, discard, promote}",
			);
		});
	}

	// Group A4: the enabled mount.
	{
		const Run = Setup({ enabled: true });
		Check(Count, "A4: the enabled mount logs the byte-exact activation line", () => {
			assert.deepEqual(Run.Lines, ["authority: activated (ttl=300000, policy=0)"]);
			assert.equal(Run.State.On, true);
		});
		const Counted = Setup({ enabled: true, policy: [{ kind: "tmp", disposition: "evict" }] });
		Check(Count, "A4: the activation line carries the policy count", () => {
			assert.deepEqual(Counted.Lines, ["authority: activated (ttl=300000, policy=1)"]);
		});
	}

	return Finish(Count, "Entry-And-Contract");
};

// Standalone entry: `node Target/Test/Entry-And-Contract/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Entry-And-Contract`);
}
