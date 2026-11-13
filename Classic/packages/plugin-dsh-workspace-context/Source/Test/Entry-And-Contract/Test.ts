import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Ledger,
	LedgerLines,
	LedgerWith,
	Make,
	MakeCounter,
	Plugin,
	Throws,
	Validate,
	rm,
} from "../Harness.js";

/**
 * @module Test
 *
 * The loader contract and the mount: the default object's four exports, the live
 * disabled cold mount, the enabled mount, the fail-loud validation and the durable ledger forms.
 *
 * @remarks
 *
 * The default object carries name/apply/Config/inject, the ONLY named exports - apply alone never
 * catches a missing inject. The cold mount is the LIVE disabled posture: the byte-exact disabled
 * line, the service still answering honestly, and the tool registered but refusing at call time
 * with no ledger write (a flip acts on the very next call). The enabled mount registers the
 * service and the tool with the byte-exact activation line. The fail-loud validation throws at
 * load, and the durable ledger carries the `[ISO]` forms.
 */
/**
 * A fresh run with an empty ledger.
 */
const Setup = (Raw: Record<string, unknown> = {}, Attach?: (Context: any) => void): any => {
	rm();
	return Make(Validate({ logFile: Ledger, ...Raw }), Attach);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group E1: the default object carries all four exports.
	Check(Count, "E1: the default object carries name, apply, Config and inject", () => {
		assert.equal(Plugin.name, "plugin-dsh-workspace-context");
		assert.equal(typeof Plugin.apply, "function");
		assert.equal(typeof Plugin.Config, "function");
		assert.deepEqual(Plugin.inject, ["pluginFactory"]);
	});
	Check(Count, "E1: the schema fills the Config base (enabled, log, logFile)", () => {
		const Knobs = Validate({});
		assert.equal(Knobs.enabled.get(), true);
		assert.equal(Knobs.log.get(), true);
		assert.equal(Knobs.logFile.get(), "~/.dsh/playform/plugin-dsh-workspace-context.log");
	});

	// Group E2: the cold mount (the live disabled posture: every surface
	// registers, each answers at call time).
	{
		const Run = Setup({ enabled: false });
		const Service = Run.Provided.workspaceContext;
		Check(Count, "E2: apply returns nothing and the service is still provided", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Service !== undefined);
			assert.equal(Service.name, "workspaceContext");
			assert.equal(Service.State.On, false);
		});
		Check(Count, "E2: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["context: disabled (enabled=false)"]);
		});
		Check(Count, "E2: the durable ledger carries the [ISO] disabled line", () => {
			assert.equal(LedgerWith("disabled (enabled=false)").length, 1);
			assert.match(
				LedgerLines()[0] ?? "",
				/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] disabled \(enabled=false\)$/,
			);
		});
		Check(Count, "E2: the cold mount registers the tool and touches no root seam", () => {
			assert.equal(Run.Tools.length, 1);
			assert.equal(Run.Tools[0].name, "workspace_context");
			assert.equal(Run.RootNames.length, 0);
			assert.equal(Run.Effects.length, 0);
		});
		await CheckAsync(Count, "E2: the registered tool refuses at call time with no ledger write", async () => {
			await assert.rejects(
				Run.Tools[0].execute({}),
				{ message: "workspace_context: the context plugin is disabled (enabled=false)" },
			);
			assert.equal(LedgerWith("packet").length, 0);
			assert.deepEqual(Run.Lines, ["context: disabled (enabled=false)"]);
		});
		await CheckAsync(Count, "E2: a flip to enabled acts on the very next call", async () => {
			Service.State.On = true;
			const Answer = await Run.Tools[0].execute({});
			assert.ok(typeof Answer.text === "string" && Answer.text.length > 0);
			assert.equal(typeof Answer.tokens, "number");
			Service.State.On = false;
			await assert.rejects(
				Run.Tools[0].execute({}),
				{ message: "workspace_context: the context plugin is disabled (enabled=false)" },
			);
		});
	}

	// Group E3: the fail-loud validation.
	{
		const Fail = (Raw: Record<string, unknown>, Message: string): void => {
			rm();
			Throws(() => Make(Validate({ logFile: Ledger, ...Raw })), Message);
		};
		Check(Count, "E3: an invalid budget fails loud with the exact message", () => {
			Fail({ budgetTokens: 0 }, "context: budgetTokens and budgetMaximum must be integers >= 1");
		});
		Check(Count, "E3: a budgetMaximum below the budget fails loud", () => {
			Fail(
				{ budgetTokens: 500, budgetMaximum: 400 },
				"context: budgetMaximum must be >= budgetTokens",
			);
		});
		Check(Count, "E3: an empty workspaceName fails loud", () => {
			Fail({ workspaceName: "" }, "context: workspaceName must be a non-empty string");
		});
		Check(Count, "E3: negative caps fail loud", () => {
			Fail(
				{ neighborLimit: -1 },
				"context: neighborLimit, evidenceLimit and mapLimit must be integers >= 0",
			);
		});
		Check(Count, "E3: a non-array lenses fails loud at the schema", () => {
			Fail({ lenses: "nope" }, "$.lenses expected array but got nope");
		});
	}

	// Group E4: the enabled mount.
	{
		const Run = Setup({ enabled: true });
		Check(Count, "E4: the enabled mount logs the byte-exact activation line", () => {
			assert.deepEqual(Run.Lines, ["context: activated (budget=2000/4000, lenses=3)"]);
			assert.equal(Run.State.On, true);
		});
		Check(Count, "E4: the enabled mount registers the read-only tool", () => {
			assert.equal(Run.Tools.length, 1);
			assert.equal(Run.Tools[0].name, "workspace_context");
			assert.equal(typeof Run.Tools[0].execute, "function");
		});
		Check(Count, "E4: the volatile cells arrive as { get } cells and unwrap", () => {
			assert.equal(typeof (Run.Raw.enabled as { get?: unknown })?.get, "function");
			assert.equal(Run.State.Ledger, Ledger);
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
