// Source/Test/State-And-Activation/Test.ts - one singular test: the activation
// posture (the ledger byte-shape regex + the State.Module logger prefix), the
// factory-built shared state shape with the cargo module fields, the wire
// posture (exactly one fiber-owned fs/observed registration + the State
// builder's P10 volatile-update refresh), and the attach posture (the
// P1/P2/P5 effect labels + the P1 root jobs controller).
// Runs standalone (`node Target/Test/State-And-Activation/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-cargo-governor.
import assert from "node:assert/strict";
import {
	Boot,
	Check,
	Finish,
	Furnace,
	Group,
	Ledger,
	LedgerFile,
	LoggerLines,
	MakeContext,
	MakeCounter,
	ProbeState,
	SeamStub,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the activation posture.
	{
		const dir = Group("act");
		void dir;
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("act");
		Boot(m);
		const lines = Ledger(m.ledger);
		Check(Count, "activation: ledger byte-shape + `hook-dsh-governor-cargo: ` logger prefix", () => {
			assert.equal(lines.length, 1, "exactly one activation line");
			assert.match(
				lines[0]!,
				/^activated \(cargo flavor, logFile=.*cargo-smoke-.*\.log, updateMode=cargo, cargoBin=cargo, exclude=\[node_modules, \.git, \.dsh, \.pnpm, \.store, DeepSeek Harness\.app\], policyFile=\(discovery\), keepFile=\(discovery\)\)$/,
				"the CARGO MODULE activation string byte-shape",
			);
			assert.equal(
				LoggerLines.info.at(-1),
				`hook-dsh-governor-cargo: ${lines[0]}`,
				"logger prefix = State.Module",
			);
		});
	}
	// Group: the factory-built shared state shape.
	{
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("state");
		Boot(m);
		const S = ProbeState;
		Check(Count, "state: factory-built shared shape + module fields + activation journal record", () => {
			assert.equal(S.Module, "hook-dsh-governor-cargo");
			assert.equal(S.PolicyName, "pin-policy.json", "the factory's keep sidecar name");
			assert.equal(S.Policy, "");
			assert.equal(S.Ledger, m.ledger);
			assert.equal(S.Enabled, true);
			assert.deepEqual(S.Tool, ["write", "edit", "str_replace_editor", "raw-write"]);
			assert.deepEqual(S.List, [
				"node_modules",
				".git",
				".dsh",
				".pnpm",
				".store",
				"DeepSeek Harness.app",
			]);
			assert.equal(S.Strict, false);
			assert.equal(S.Wait, 0);
			assert.equal(S.Limit, 3);
			assert.equal(S.CargoBin, "cargo");
			assert.equal(S.KeepFile, "");
			assert.equal(S.Mode, "cargo");
			assert.ok(
				S.Stash instanceof Map &&
					S.Inflight instanceof Map &&
					S.Seams instanceof Map &&
					Array.isArray(S.Queue),
			);
			assert.ok(S.Stamp instanceof Map && S.Set instanceof Set && S.Count instanceof Map);
			assert.equal(S.Subprocess, m.services.subprocess, "the P9 seam probed at State build");
			assert.equal(typeof S.Journal, "function", "the P5 journal sink present");
		});
	}
	// Group: the wire posture.
	{
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("wire");
		Boot(m);
		Check(
			Count,
			"wire: exactly one fiber-owned fs/observed registration, plus the P10 volatile-update refresh",
			() => {
				assert.equal(
					m.captured.events.filter((e: any) => e[0] === "fs/observed").length,
					1,
					"exactly one fs/observed listener (the factory's Wire)",
				);
				assert.equal(
					m.captured.events.filter((e: any) => e[0] !== "fs/observed").length,
					1,
					"one other hook: the State builder's P10 loader/volatile-update refresh (never fs/write-intent, never tools/*)",
				);
			},
		);
	}
	// Group: the attach posture.
	{
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("attach");
		Boot(m);
		const m2 = MakeContext({
			services: {
				subprocess: SeamStub(),
				jobs: {
					attachController: (n: string) => {
						m2.captured.controllers.push(n);
						return () => {};
					},
				},
			},
		});
		m2.ctx.pluginFactory = Furnace;
		m2.ledger = LedgerFile("attach2");
		Boot(m2);
		Check(Count, "attach: P1/P2/P5 effect labels + P1 root jobs controller", () => {
			assert.deepEqual(
				m.captured.effects.map((e: any) => e[0]),
				[
					"hook-dsh-governor-cargo-jobs",
					"hook-dsh-governor-cargo-inflight",
					"hook-dsh-governor-cargo-storage",
				],
			);
			assert.deepEqual(
				m.captured.controllers,
				[],
				"no jobs service in this scenario \u2192 no controller",
			);
			assert.deepEqual(
				m2.captured.controllers,
				["hook-dsh-governor-cargo"],
				"P1 attaches the root controller",
			);
		});
	}
	return Finish(Count, "State-And-Activation");
};

// Standalone entry: `node Target/Test/State-And-Activation/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - State-And-Activation`);
}
