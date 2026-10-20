// Source/Test/Wiring-And-Defaults/Test.ts - one singular test: the loader
// contract and the config defaults are the two surfaces every other folder
// (and every consumer) silently depends on - the volatile cells, the
// defaults, the activation posture (five registrations, the REAL factory on
// the state, the byte-exact `disabled (enabled=false)` cold-mount line and
// the byte-exact `activated (...)` line, the durable [ISO] proofs), and the
// fail-loud validation refusals. A drift here breaks every later folder, so
// it is its own folder.
// Unit smoke of @playform/hook-dsh-live-containers. Runs standalone
// (`node Target/Test/Wiring-And-Defaults/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
import assert from "node:assert/strict";
import {
	Block,
	Check,
	DEFAULT_BLOCKS_IDS,
	Finish,
	Make,
	MakeCounter,
	rm,
	Validate,
	Ledger,
	LedgerLines,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the volatile cells and the config defaults (the schema's
	// `{ get }` cell shape + every default value).
	rm();
	const Raw1 = Validate({});
	{
		Check(Count, "volatile cell: logFile arrives as { get }", () => {
			assert.equal(typeof Raw1.logFile.get, "function");
		});
		Check(Count, "volatile cell: enabled arrives as { get }", () => {
			assert.equal(typeof Raw1.enabled.get, "function");
		});
		Check(Count, "volatile cell: sectionName arrives as { get }", () => {
			assert.equal(typeof Raw1.sectionName.get, "function");
		});
		Check(Count, "volatile cell: refresh arrives as { get }", () => {
			assert.equal(typeof Raw1.refresh.get, "function");
		});
		Check(Count, "volatile cell: ttlCalls arrives as { get }", () => {
			assert.equal(typeof Raw1.ttlCalls.get, "function");
		});
		Check(Count, "volatile cell: separator arrives as { get }", () => {
			assert.equal(typeof Raw1.separator.get, "function");
		});
		Check(Count, "volatile cell: sectionBudgetBytes arrives as { get }", () => {
			assert.equal(typeof Raw1.sectionBudgetBytes.get, "function");
		});
		Check(Count, "volatile cell: blocks arrives as { get } (array cell)", () => {
			assert.equal(typeof Raw1.blocks.get, "function");
		});
	}
	{
		Check(Count, "config default enabled=false (the IDLE-forever posture)", () => {
			assert.equal(Raw1.enabled.get(), false);
		});
		Check(Count, "config default logFile=~/.dsh/live-containers.log", () => {
			assert.equal(Raw1.logFile.get(), "~/.dsh/live-containers.log");
		});
		Check(Count, "config default sectionName=live-containers", () => {
			assert.equal(Raw1.sectionName.get(), "live-containers");
		});
		Check(Count, 'config default refresh="request"', () => {
			assert.equal(Raw1.refresh.get(), "request");
		});
		Check(Count, "config default ttlCalls=8", () => {
			assert.equal(Raw1.ttlCalls.get(), 8);
		});
		Check(Count, 'config default separator="---"', () => {
			assert.equal(Raw1.separator.get(), "---");
		});
		Check(Count, "config default sectionBudgetBytes=4096", () => {
			assert.equal(Raw1.sectionBudgetBytes.get(), 4096);
		});
		Check(Count, "config default blocks = the 14-entry catalog in shipped order", () => {
			assert.equal(
				JSON.stringify(Raw1.blocks.get().map((B: any) => B.id)),
				JSON.stringify(DEFAULT_BLOCKS_IDS),
			);
		});
		Check(Count, "config default blocks: the three day-one enabled blocks are enabled", () => {
			const Blocks = Raw1.blocks.get();
			for (const ID of ["todo-list", "command-runner", "session-stats"]) {
				assert.equal(Blocks.find((B: any) => B.id === ID).enabled, true);
			}
		});
		Check(Count, "config default blocks: the dormant catalog entries are disabled", () => {
			const Blocks = Raw1.blocks.get();
			assert.equal(
				Blocks.filter((B: any) => B.enabled).length,
				3,
				"exactly todo-list, command-runner, session-stats enabled",
			);
		});
	}
	// Group: the apply-time wiring and the activation (the REAL factory, the
	// five registrations, the state probe, the byte-exact ledger lines).
	{
		const Run1 = Make(Validate({ logFile: Ledger }));
		Check(Count, "apply returns NOTHING (the loader contract)", () => {
			assert.equal(Run1.Returned, undefined);
		});
		Check(Count, "the four plugin listeners are registered", () => {
			assert.deepEqual(Object.keys(Run1.Listeners).sort(), [
				"agent/pre-step",
				"loader/volatile-update",
				"system-prompt/assemble",
				"tools/change",
				"tools/post-execute",
			]);
		});
		Check(Count, "plus the State builder's P10 loader/volatile-update refresh", () => {
			assert.equal(typeof Run1.Listeners["loader/volatile-update"], "function");
		});
		Check(Count, "exactly FIVE registrations (4 plugin + 1 volatile refresh)", () => {
			assert.equal(Object.keys(Run1.Listeners).length, 5);
		});
		Check(Count, "the module identity is hook-dsh-live-containers", () => {
			assert.equal(Run1.State.Module, "hook-dsh-live-containers");
		});
		Check(Count, "state carries the REAL factory instance", () => {
			assert.ok(Run1.State.Factory);
			assert.equal(Run1.State.Factory, Run1.Context.pluginFactory);
		});
		Check(Count, "state unwraps the defaults (On=false, refresh=request, ttlCalls=8)", () => {
			assert.equal(Run1.State.On, false);
			assert.equal(Run1.State.Refresh, "request");
			assert.equal(Run1.State.TtlCalls, 8);
			assert.equal(Run1.State.Separator, "---");
			assert.equal(Run1.State.Budget, 4096);
		});
		Check(Count, "cold-mount ledger line byte-exact: disabled (enabled=false)", () => {
			assert.deepEqual(Run1.Lines, ["hook-dsh-live-containers: disabled (enabled=false)"]);
		});
		Check(Count, "the durable ledger file carries the [ISO] disabled line", () => {
			assert.equal(LedgerLines().length, 1);
			assert.match(LedgerLines()[0]!, /^\[.*\] disabled \(enabled=false\)$/);
		});
	}
	{
		// The activated mount: the byte-exact activation line (the master
		// switch and the render knobs on the line).
		rm();
		const Run2 = Make(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("t1", "time", "{{time}}"), Block("n1", "note", "hi")],
			}),
		);
		Check(Count, "activation ledger line byte-exact", () => {
			assert.deepEqual(Run2.Lines, [
				"hook-dsh-live-containers: activated (bundle 0.1.0, blocks=2, refresh=request)",
			]);
		});
		Check(Count, "the durable ledger file carries the [ISO] activation line", () => {
			assert.equal(LedgerLines().length, 1);
			assert.match(
				LedgerLines()[0]!,
				/^\[.*\] activated \(bundle 0\.1\.0, blocks=2, refresh=request\)$/,
			);
		});
		Check(Count, "activation ttl flavor byte-exact (refresh=ttl)", () => {
			rm();
			const Run3 = Make(Validate({ logFile: Ledger, enabled: true, refresh: "ttl" }));
			assert.deepEqual(Run3.Lines, [
				"hook-dsh-live-containers: activated (bundle 0.1.0, blocks=14, refresh=ttl)",
			]);
		});
	}
	// Group: fail-loud validation (each refusal on the exact message). The
	// configs are PLAIN (not schema-validated) with a valid base, so the
	// plugin's own fail-loud Validate is what throws - the schema's own
	// union/array checks would throw first with schemastery messages.
	{
		const Base = (): Record<string, unknown> => ({
			logFile: Ledger,
			sectionName: "live-containers",
			refresh: "request",
			ttlCalls: 8,
			separator: "---",
			sectionBudgetBytes: 4096,
			blocks: [] as unknown[],
		});
		Check(Count, "fail-loud: empty sectionName rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), sectionName: "" });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				"hook-dsh-live-containers: sectionName must be a non-empty string",
			);
		});
		Check(Count, 'fail-loud: refresh outside "request"|"ttl" rejected', () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), refresh: "hourly" });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				'hook-dsh-live-containers: refresh must be one of "request" | "ttl"',
			);
		});
		Check(Count, "fail-loud: ttlCalls below 1 rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), ttlCalls: 0 });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(Threw?.message, "hook-dsh-live-containers: ttlCalls must be >= 1");
		});
		Check(Count, "fail-loud: empty separator rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), separator: "" });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				"hook-dsh-live-containers: separator must be a non-empty string",
			);
		});
		Check(Count, "fail-loud: sectionBudgetBytes below 1 rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), sectionBudgetBytes: 0 });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(Threw?.message, "hook-dsh-live-containers: sectionBudgetBytes must be >= 1");
		});
		Check(Count, "fail-loud: blocks not an array rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), blocks: "nope" });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				"hook-dsh-live-containers: blocks must be an array of block specs",
			);
		});
		Check(Count, "fail-loud: duplicate block ids rejected", () => {
			let Threw: any = null;
			try {
				Make({
					...Base(),
					blocks: [Block("dup", "note", "a"), Block("dup", "note", "b")],
				});
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				"hook-dsh-live-containers: block ids must be unique: dup",
			);
		});
		Check(Count, "fail-loud: unknown block kind rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), blocks: [Block("b", "warp", "x")] });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				"hook-dsh-live-containers: block b has an unknown kind: warp",
			);
		});
		Check(Count, "fail-loud: empty block template rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), blocks: [Block("b", "note", "")] });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				"hook-dsh-live-containers: block b needs a non-empty template",
			);
		});
		Check(Count, "fail-loud: non-string var value rejected", () => {
			let Threw: any = null;
			try {
				Make({
					...Base(),
					blocks: [Block("b", "note", "x", { vars: { k: 7 as unknown as string } })],
				});
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				"hook-dsh-live-containers: block b vars.k must be a string",
			);
		});
		Check(Count, "fail-loud: bad block trigger rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), blocks: [Block("b", "note", "x", { trigger: "daily" })] });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				'hook-dsh-live-containers: block b trigger must be one of "request" | "event" | "ttl" | "manual"',
			);
		});
		Check(Count, "fail-loud: bad block scope rejected", () => {
			let Threw: any = null;
			try {
				Make({ ...Base(), blocks: [Block("b", "note", "x", { scope: "sometimes" })] });
			} catch (Error) {
				Threw = Error;
			}
			assert.equal(
				Threw?.message,
				'hook-dsh-live-containers: block b scope must be one of "always" | "when-agents-active" | "when-tasks-live" | "never"',
			);
		});
	}
	return Finish(Count, "Wiring-And-Defaults");
};

// Standalone entry: `node Target/Test/Wiring-And-Defaults/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Defaults`);
}
