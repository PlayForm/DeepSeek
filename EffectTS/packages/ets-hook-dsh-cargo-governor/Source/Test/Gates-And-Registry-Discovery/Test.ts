// Source/Test/Gates-And-Registry-Discovery/Test.ts - one singular test: the
// trigger gates (actor + kind, basename, exclusion-first with no read/write,
// the Stash idempotence gate) and the registry discovery lines (the
// no-registry skip and the unreadable-registry skip).
// Runs standalone (`node Target/Test/Gates-And-Registry-Discovery/Test.js`)
// AND under the aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-cargo-governor.
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
	MakeContext,
	MakeCounter,
	Registry,
	SeamStub,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the actor + kind gates.
	{
		const dir = Group("gates");
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("gates");
		Boot(m);
		const baseline = Ledger(m.ledger).length; // the activation line
		const t = { targetKey: "k1", displayPath: Path.join(dir, "Cargo.toml") };
		Fire(m, t, "v1", "grep"); // reads emit too - the actor gate is required
		const afterGrep = Ledger(m.ledger).length;
		m.listener?.(t, { kind: "present", version: "v1" }); // a truly MISSING actor
		const afterMissing = Ledger(m.ledger).length;
		Fire(m, t, "v1", "edit");
		const after = Ledger(m.ledger).length;
		m.listener?.({ ...t }, { kind: "absent" }, { name: "edit" }); // absent probe
		const afterAbsent = Ledger(m.ledger).length;
		await CheckAsync(Count, "gate: actor + kind gates silent (reads emit too, absent probes)", async () => {
			assert.equal(afterGrep, baseline, "non-mutation actor \u2192 silent");
			assert.equal(afterMissing, baseline, "missing actor \u2192 silent");
			assert.equal(afterAbsent, after, "absent probe \u2192 silent");
			await Flush();
		});
	}
	// Group: the basename gate.
	{
		const dir = Group("gates2");
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("gates2");
		Boot(m);
		const baseline = Ledger(m.ledger).length;
		const t = { targetKey: "k1", displayPath: Path.join(dir, "package.json") };
		Fire(m, t, "v1", "edit");
		const afterWrong = Ledger(m.ledger).length;
		Fire(m, { targetKey: "k2", displayPath: Path.join(dir, "sub", "Cargo.toml") }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		await CheckAsync(Count, "gate: basename gate silent for non-Cargo.toml", async () => {
			assert.equal(afterWrong, baseline, "wrong basename \u2192 silent");
			assert.ok(
				lines.includes(
					`observed non-JSON/TOML Cargo.toml ${Path.join(dir, "sub", "Cargo.toml")} \u2014 skipped`,
				),
				"missing file content read \u2192 non-TOML line",
			);
		});
	}
	// Group: exclusion-first.
	{
		const dir = Group("excl");
		const m = MakeContext({ services: { subprocess: SeamStub() } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("excl");
		Boot(m);
		const t = { targetKey: "k1", displayPath: Path.join(dir, "node_modules", "x", "Cargo.toml") };
		FileSystem.mkdirSync(Path.dirname(t.displayPath), { recursive: true });
		FileSystem.writeFileSync(t.displayPath, '[dependencies]\nserde = "1.0"\n');
		const baseline = Ledger(m.ledger).length;
		Fire(m, t, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger).slice(baseline);
		await CheckAsync(Count, "gate: exclusion-first \u2192 `skipped (excluded) <path>`, no read, no write", async () => {
			assert.deepEqual(lines, [`skipped (excluded) ${t.displayPath}`]);
			assert.equal(m.captured.reads.length, 0, "excluded \u2192 never read");
			assert.equal(m.captured.writes.length, 0, "excluded \u2192 never written");
		});
	}
	// Group: the Stash idempotence gate.
	{
		const dir = Group("idem");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [Path.join(dir, "Cargo.toml")]: '[dependencies]\nserde = "2.0"\n' },
		});
		Registry(dir, { serde: "2.1.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("idem");
		Boot(m);
		const t = { targetKey: "k1", displayPath: Path.join(dir, "Cargo.toml") };
		Fire(m, t, "v1", "edit");
		await Flush();
		const governedAfterFirst = Ledger(m.ledger).filter((l) => l.startsWith("governed ")).length;
		const reads = m.captured.reads.length;
		const writes = m.captured.writes.length;
		Fire(m, t, "fresh-v2", "edit"); // our own re-emit - the version the write pre-registered
		// The gate is synchronous: the counts are captured without a flush,
		// exactly like the source suite.
		const readsAfter = m.captured.reads.length;
		const writesAfter = m.captured.writes.length;
		const governedTotal = Ledger(m.ledger).filter((l) => l.startsWith("governed ")).length;
		await CheckAsync(
			Count,
			"gate: the Stash idempotence gate blocks our own re-emits (no read, no write)",
			async () => {
				assert.ok(governedAfterFirst >= 1, "the first pass governed");
				assert.equal(readsAfter, reads, "idempotent \u2192 not even a read");
				assert.equal(writesAfter, writes, "idempotent \u2192 no write");
				assert.equal(governedTotal, 1, "no second governed line");
			},
		);
	}
	// Group: the registry discovery lines.
	{
		const dir = Group("noreg1");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("noreg1");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		await CheckAsync(Count, "g2: `no registry.json found for \u2026 \u2014 chain pass skipped`", async () => {
			assert.ok(
				lines.includes(`no registry.json found for ${file} \u2014 chain pass skipped`),
				"the no-registry line",
			);
		});
	}
	{
		const dir = Group("badreg");
		const file = Path.join(dir, "Cargo.toml");
		FileSystem.writeFileSync(Path.join(dir, "registry.json"), "{ nope");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("badreg");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		await CheckAsync(Count, "g2: `unreadable registry.json at \u2026 \u2014 chain pass skipped for \u2026`", async () => {
			assert.ok(
				lines.includes(
					`unreadable registry.json at ${Path.join(dir, "registry.json")} \u2014 chain pass skipped for ${file}`,
				),
				"the unreadable-registry line",
			);
		});
	}
	return Finish(Count, "Gates-And-Registry-Discovery");
};

// Standalone entry: `node Target/Test/Gates-And-Registry-Discovery/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Gates-And-Registry-Discovery`);
}
