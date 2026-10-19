// Source/Test/Factory-Wiring/Test.ts - one singular test: the factory wiring
// (the silence/sync contract, the real factory instance with the P9
// probe-once seam, the chain pass through Furnace.Continue's Inflight
// lifecycle, the write through Furnace.GuardedWrite's signal + P4 fence, the
// keep-list through Furnace.ResolvePolicy, the attach P5 domain drain, the
// g1 gates through Furnace.Gate's log-nothing contract, and the ledger
// prefix composed by the factory's Append).
// Runs standalone (`node Target/Test/Factory-Wiring/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-cargo-governor.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Boot,
	CheckAsync,
	Finish,
	Fire,
	Furnace,
	Flush,
	Group,
	Ledger,
	LedgerFile,
	LoggerLines,
	MakeContext,
	MakeCounter,
	Provided,
	ProbeState,
	SeamStub,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the silence/sync contract.
	{
		const dir = Group("silence");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("silence");
		const { listener } = Boot(m);
		let Sync = false;
		listener(
			{ targetKey: "k1", displayPath: file },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		Sync = true; // the listener must return before any async stage runs
		const writesBeforeFlush = m.captured.writes.length;
		await Flush();
		const writesAfterFlush = m.captured.writes.length;
		await CheckAsync(Count, "silence: the listener is synchronous and await-free; the stages are detached", async () => {
			assert.equal(Sync, true, "the fs/observed listener is synchronous");
			assert.equal(writesBeforeFlush, 0, "no write has happened yet (detached)");
			assert.ok(writesAfterFlush > 0, "the detached continuation did the work");
		});
	}
	// Group: the real factory instance + the P9 seam.
	{
		const dir = Group("wire1");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("wire1");
		Boot(m);
		const t = { targetKey: "k1", displayPath: file };
		Fire(m, t, "v1", "edit");
		await Flush();
		Fire(m, t, "v2", "edit"); // a second full pass - the seam must NOT re-probe
		await Flush();
		const probeCount = m.captured.serviceGets.filter((n: string) => n === "subprocess").length;
		await CheckAsync(Count, "wiring: real factory instance; P9 probe-once seam across multiple passes", async () => {
			assert.equal(
				probeCount,
				1,
				"the subprocess seam probed exactly ONCE via the factory's Seam (P9)",
			);
			assert.equal(
				Provided["pluginFactory"],
				Furnace,
				"the real factory registered as ctx.pluginFactory",
			);
			assert.equal(m.ctx.pluginFactory, Furnace);
		});
	}
	// Group: the Continue Inflight lifecycle.
	{
		const dir = Group("wire2");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("wire2");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const inflightDuring = m.captured.writes[0].inflight;
		const inflightAfter = ProbeState.Inflight.size;
		await CheckAsync(Count, "wiring: the chain pass ran through factory.Continue (Inflight lifecycle)", async () => {
			assert.equal(
				inflightDuring,
				1,
				"the factory's Continue held the in-flight entry DURING the guarded write",
			);
			assert.equal(inflightAfter, 0, "...and removed it after settlement (finally)");
		});
	}
	// Group: the GuardedWrite signal + fence.
	{
		const dir = Group("wire3");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("wire3");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const W = m.captured.writes[0];
		await CheckAsync(Count, "wiring: the write went through factory.GuardedWrite (signal + P4 fence)", async () => {
			assert.equal(
				W.signal instanceof AbortSignal,
				true,
				"GuardedWrite forwarded the abort signal",
			);
			assert.equal(W.fence, null, "the P4 posture decided by the factory");
		});
	}
	// Group: the ResolvePolicy keep sidecar.
	{
		const dir = Group("wire4");
		const file = Path.join(dir, "Cargo.toml");
		FileSystem.writeFileSync(Path.join(dir, "pin-policy.json"), "{ nope");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("wire4");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		const content = m.captured.writes[0].content;
		await CheckAsync(
			Count,
			"wiring: the keep-list came through factory.ResolvePolicy (policyFileName = pin-policy.json)",
			async () => {
				assert.ok(
					lines.includes(
						`unreadable pin-policy.json at ${Path.join(dir, "pin-policy.json")} \u2014 using built-in default`,
					),
					"the factory's ResolvePolicy composed the unreadable-sidecar line with the module's PolicyName",
				);
				assert.ok(
					content.includes('rand = "0.8.0"'),
					"the unreadable source contributed nothing",
				);
			},
		);
	}
	// Group: the attach P5 domain.
	{
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("wire5a");
		Boot(m);
		// No storageDomain in this scenario: the factory's P5 silent-skip retires
		// the sink AND clears the pre-open queue - the activated record was queued
		// by apply and drained to nothing (the ledger stays the record).
		const queueDrained = ProbeState.Queue.length;
		const records: any[] = [];
		const m2 = MakeContext({
			services: {
				subprocess: SeamStub(),
				storageDomain: {
					open: async () => ({
						close: async () => {},
						table: () => ({
							put: async (_k: any, v: any) => {
								records.push(v);
							},
						}),
					}),
				},
			},
		});
		m2.ctx.pluginFactory = Furnace;
		m2.ledger = LedgerFile("wire5b");
		Boot(m2);
		await Flush();
		const queueDrained2 = ProbeState.Queue.length;
		// The journal-parity gap (P4): an update dispatch journals the dispatched
		// record - the parent governor's parity.
		const upd = Group("wire5b-update");
		FileSystem.mkdirSync(upd, { recursive: true });
		{
			const mU = MakeContext({
				services: {
					subprocess: SeamStub(),
					storageDomain: {
						open: async () => ({
							close: async () => {},
							table: () => ({
								put: async (_k: any, v: any) => {
									records.push(v);
								},
							}),
						}),
					},
				},
				files: {
					[Path.join(upd, "Cargo.toml")]: '[dependencies]\nrand = "0.8.0"\n',
				},
			});
			mU.ctx.pluginFactory = Furnace;
			mU.ledger = LedgerFile("wire5b-update");
			Boot(mU);
			await Flush();
			mU.listener?.(
				{ targetKey: "k-w5", displayPath: Path.join(upd, "Cargo.toml") },
				{ kind: "present", version: "v1" },
				{ name: "edit" },
			);
			await Flush();
		}
		const m3 = MakeContext({ services: { subprocess: SeamStub() } }); // no storageDomain
		m3.ctx.pluginFactory = Furnace;
		m3.ledger = LedgerFile("wire5c");
		Boot(m3);
		ProbeState.Journal("governed", "/p", "v");
		const queueAfterJournal = ProbeState.Queue.length;
		await CheckAsync(Count, "wiring: Attach P5 \u2014 the domain opens and drains; absent \u2192 silent skip", async () => {
			assert.equal(queueDrained, 0, "P5 absent \u2192 queue drained to nothing");
			assert.equal(queueDrained2, 0, "the pre-open queue drained into the domain");
			assert.equal(records[0].event, "activated", "the structured record flowed");
			assert.equal(records[0].detail, "cargo", "the activation detail (the update mode)");
			assert.ok(
				records.some((r) => r.event === "dispatched" && r.path === upd && r.detail === "cargo"),
				"the dispatched journal record (the parent governor's parity)",
			);
			assert.equal(queueAfterJournal, 0, "P5 absent \u2192 the sink is retired, no queue growth");
		});
	}
	// Group: the Gate log-nothing contract.
	{
		const dir = Group("wire6");
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("wire6");
		Boot(m);
		const baseline = Ledger(m.ledger).length; // the activation line
		const file = Path.join(dir, "node_modules", "x", "Cargo.toml");
		m.listener?.(
			{ targetKey: "k1", displayPath: file },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		const afterExcluded = Ledger(m.ledger).slice(baseline);
		m.listener?.(
			{ targetKey: "k2", displayPath: Path.join(dir, "package.json") },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		const afterBasename = Ledger(m.ledger).length;
		await CheckAsync(Count, "wiring: the g1 gates ran through factory.Gate (log-nothing contract honored)", async () => {
			assert.deepEqual(
				afterExcluded,
				[`skipped (excluded) ${file}`],
				"excluded \u2192 exactly one line",
			);
			assert.equal(
				afterBasename,
				baseline + 1,
				"basename miss \u2192 zero additional lines (the gate logged nothing)",
			);
		});
	}
	// Group: the ledger prefix (the factory Append composition).
	{
		const allInfo = LoggerLines.info.filter((l) => l.startsWith("hook-dsh-governor-cargo: "));
		const foreign = LoggerLines.info.filter((l) => !l.startsWith("hook-dsh-governor-cargo: "));
		await CheckAsync(Count, "wiring: the ledger prefix is State.Module (factory Append composition)", async () => {
			assert.ok(allInfo.length > 0);
			assert.equal(foreign.length, 0, "every logger line carries the State.Module prefix");
		});
	}
	return Finish(Count, "Factory-Wiring");
};

// Standalone entry: `node Target/Test/Factory-Wiring/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Factory-Wiring`);
}
