// Source/Test/Entry-And-Contract/Test.ts - the loader contract and the
// mount: the default object carries name/apply/Config/inject, the cold mount
// is IDLE-forever (byte-exact disabled line, wired to nothing, the service
// still answers with a loud refusal), the enabled mount wires the root
// listener and the storage effect, and the fail-loud validation throws at
// load.
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
const Setup = (Raw: Record<string, unknown> = {}, Attach?: (Context: any) => void): any => {
	rm();
	return Make(Validate({ logFile: Ledger, ...Raw }), Attach);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group E1: the default object carries all four exports.
	Check(Count, "E1: the default object carries name, apply, Config and inject", () => {
		assert.equal(Plugin.name, "plugin-dsh-workspace-evidence");
		assert.equal(typeof Plugin.apply, "function");
		assert.equal(typeof Plugin.Config, "function");
		assert.deepEqual(Plugin.inject, ["pluginFactory"]);
	});

	// Group E2: the cold mount (the IDLE-forever posture).
	{
		const Run = Setup({});
		const Service = Run.Provided.workspaceEvidence;
		Check(Count, "E2: apply returns nothing, the service is still provided", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Service !== undefined);
			assert.equal(Service.name, "workspaceEvidence");
			assert.equal(Service.State.On, false);
		});
		Check(Count, "E2: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["evidence: disabled (enabled=false)"]);
			assert.match(
				LedgerLines()[0] ?? "",
				/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] disabled \(enabled=false\)$/,
			);
		});
		Check(Count, "E2: the cold mount wires nothing - no root listener, no effect", () => {
			assert.deepEqual(Run.RootNames, []);
			assert.deepEqual(Run.Effects, []);
		});
		Check(Count, "E2: the disabled service refuses loudly and invalidates nothing", () => {
			assert.throws(
				() => Service.validate("a", "reality", "s", []),
				/evidence: service is disabled \(enabled=false\)/,
			);
			assert.equal(Service.invalidate("x"), 0);
		});
	}

	// Group E3: the fail-loud validation.
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
		Check(Count, "E3: an empty domain fails loud", () => {
			Fail({ domain: "" }, "evidence: domain must be a non-empty string");
		});
		Check(Count, "E3: a zero maxValidations fails loud", () => {
			Fail({ maxValidations: 0 }, "evidence: maxValidations must be an integer >= 1");
		});
		Check(Count, "E3: a non-array exclude fails loud at the schema", () => {
			Fail({ exclude: "nope" }, "$.exclude expected array but got nope");
		});
	}

	// Group E4: the enabled mount.
	{
		const Run = Setup({ enabled: true });
		Check(Count, "E4: the enabled mount logs the byte-exact activation line", () => {
			assert.deepEqual(Run.Lines, ["evidence: activated (domain=workspace_evidence)"]);
			assert.equal(Run.State.On, true);
		});
		Check(Count, "E4: the enabled mount wires the root listener and the storage effect", () => {
			assert.deepEqual(Run.RootNames, ["fs/observed"]);
			assert.deepEqual(Run.Effects, ["evidence-storage"]);
			assert.ok(typeof Run.Listeners["fs/observed"] === "function");
		});
		Check(Count, "E4: the volatile cells arrive as { get } cells and unwrap", () => {
			assert.equal(typeof (Run.Raw.enabled as { get?: unknown })?.get, "function");
			assert.equal(Run.State.DomainName, "workspace_evidence");
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
