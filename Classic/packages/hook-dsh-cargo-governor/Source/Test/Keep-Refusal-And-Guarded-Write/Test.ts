// Source/Test/Keep-Refusal-And-Guarded-Write/Test.ts - one singular test: the
// keep-list discovery (directory pin-policy.json, the configured global
// keepFile, the registry-adjacent source), the refusal guard (the unmatched
// plan aborts and skips the update stage), the designed silence (non-TOML and
// vanished manifests), and the guarded write + P3 (the versioned intent, the
// Stash pre-registration, the same-actor re-emit, both sandbox postures, the
// contained racing write).
// Runs standalone (`node Target/Test/Keep-Refusal-And-Guarded-Write/Test.js`)
// AND under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
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
	ProbeState,
	Registry,
	Root,
	SeamStub,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the keep-list discovery.
	{
		const dir = Group("keep1");
		const file = Path.join(dir, "Cargo.toml");
		FileSystem.writeFileSync(
			Path.join(dir, "pin-policy.json"),
			JSON.stringify({ keep: ["leftpad"] }),
		);
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nleftpad = "1.0"\nother = "1.0"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("keep1");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const Out = m.captured.writes[0].content;
		await CheckAsync(Count, "keep: directory pin-policy.json wins over normalization (byte-identical)", async () => {
			assert.ok(Out.includes('leftpad = "1.0"'), "kept package byte-identical");
			assert.ok(Out.includes('other = "1.0.0"'), "non-kept normalized");
		});
	}
	{
		const dir = Group("keep2");
		const file = Path.join(dir, "Cargo.toml");
		const keepGlobal = Path.join(Root, "keep-global.json");
		FileSystem.writeFileSync(keepGlobal, JSON.stringify({ keep: ["gated"] }));
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\ngated = "0.1"\nother = "0.1"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("keep2");
		Boot(m, { keepFile: keepGlobal });
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const Out = m.captured.writes[0].content;
		await CheckAsync(Count, "keep: the configured global keepFile honored", async () => {
			assert.ok(Out.includes('gated = "0.1"'), "the global keepFile honored");
			assert.ok(Out.includes('other = "0.1.0"'), "non-kept normalized");
		});
	}
	{
		const ws = Group("keep3");
		const proj = Path.join(ws, "proj");
		FileSystem.mkdirSync(proj);
		Registry(ws, { chaindep: "2.0.0" });
		FileSystem.writeFileSync(
			Path.join(ws, "pin-policy.json"),
			JSON.stringify({ keep: ["adjacent"] }),
		);
		const file = Path.join(proj, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nadjacent = "2.0"\nchaindep = "1.0"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("keep3");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const Out = m.captured.writes[0].content;
		await CheckAsync(
			Count,
			"keep: registry-adjacent source honored; chain canonicalization not suppressed",
			async () => {
				assert.ok(Out.includes('adjacent = "2.0"'), "registry-adjacent pin-policy.json honored");
				assert.ok(Out.includes('chaindep = "2.0.0"'), "the chain is NOT suppressed by the keep-list");
			},
		);
	}
	// Group: the refusal guard.
	{
		const dir = Group("refuse1");
		const file = Path.join(dir, "Cargo.toml");
		const Text = '[dependencies]\nserde.version = "1.0"\nserde.features = ["derive"]\n';
		const m = MakeContext({ services: { subprocess: SeamStub() }, files: { [file]: Text } });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("refuse1");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		const writeCount = m.captured.writes.length;
		const dispatched = lines.filter((l) => l.startsWith("update stage dispatched")).length;
		await CheckAsync(Count, "refusal: unmatched plan aborts the whole rewrite; update stage skipped", async () => {
			assert.ok(
				lines.includes(
					`REFUSED rewrite of ${file}: dependency "serde" in section "dependencies" not found in text \u2014 rewrite aborted`,
				),
				"the unmatched-plan refusal line",
			);
			assert.equal(writeCount, 0, "refusal \u2192 NO write (never a partial rewrite)");
			assert.equal(dispatched, 0, "refusal \u2192 the update stage is skipped");
		});
	}
	// Group: the designed silence.
	{
		const dir = Group("nontoml");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: "this is [[ not toml" },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("nontoml");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		const writeCount = m.captured.writes.length;
		const m2 = MakeContext({ services: { subprocess: SeamStub() }, files: {} }); // vanished file
		m2.ctx.pluginFactory = Furnace;
		m2.ledger = LedgerFile("nontoml2");
		const { listener: l2 } = Boot(m2);
		l2(
			{ targetKey: "k9", displayPath: file },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		await Flush();
		const lines2 = Ledger(m2.ledger);
		const writeCount2 = m2.captured.writes.length;
		await CheckAsync(
			Count,
			"silence: non-TOML and vanished manifests \u2192 the designed skip line, never a throw",
			async () => {
				assert.ok(
					lines.includes(`observed non-JSON/TOML Cargo.toml ${file} \u2014 skipped`),
					"the non-TOML line",
				);
				assert.equal(writeCount, 0);
				assert.ok(
					lines2.includes(`observed non-JSON/TOML Cargo.toml ${file} \u2014 skipped`),
					"vanished file \u2192 same line, contained",
				);
				assert.equal(writeCount2, 0);
			},
		);
	}
	// Group: the guarded write + P3.
	{
		const dir = Group("write1");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "1.0"\n' },
		});
		Registry(dir, { serde: "1.1.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("write1");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const W = m.captured.writes[0];
		await CheckAsync(Count, "P3: replaceIfVersion intent, Stash pre-registration, abort signal", async () => {
			// The intent's version is the fresh-stat CURRENT version (the chain pass
			// stats before the write - the sequential-fold fix); with this fake's stat
			// that is "stat-v9". On a real backend an unraced pass stats exactly the
			// observed version, so the guarded semantics are unchanged.
			assert.deepEqual(
				W.intent,
				{ kind: "replaceIfVersion", version: "stat-v9" },
				"the version-guarded intent at the fresh-stat CURRENT version",
			);
			assert.equal(W.fence, null, "bare backend \u2192 NO fence policy");
			assert.equal(ProbeState.Stash.get("k1"), "fresh-v2", "fresh version pre-registered");
			assert.equal(
				ProbeState.Context.fs.sandboxMode === undefined && W.signal instanceof AbortSignal,
				true,
				"the write carries the continuation's abort signal",
			);
		});
	}
	{
		const dir = Group("write2");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "1.0"\n' },
		});
		Registry(dir, { serde: "1.1.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("write2");
		Boot(m);
		const t = { targetKey: "k1", displayPath: file };
		Fire(m, t, "v1", "edit");
		await Flush();
		const reEmit = m.captured.emitted.filter((e: any) => e[0] === "fs/observed").at(-1);
		const before = Ledger(m.ledger).length;
		Fire(m, t, "fresh-v2", "edit"); // the re-emit re-enters the listener...
		await Flush();
		const after = Ledger(m.ledger).length;
		await CheckAsync(Count, "P3: same-actor re-emit after the write; the re-entry is a no-op", async () => {
			assert.deepEqual(reEmit.slice(1, 3), [t, { kind: "present", version: "fresh-v2" }]);
			assert.equal(reEmit[3].name, "edit", "SAME actor \u21d2 same owner bucket");
			assert.equal(after, before, "\u2026and is a no-op via the Stash gate");
		});
	}
	{
		const dir = Group("write3");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "1.0"\n' },
			sandboxMode: "workspace-write",
		});
		Registry(dir, { serde: "1.1.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("write3");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const fence = m.captured.writes[0].fence;
		// The racing-author case: the guarded write fails (stale version) safely.
		const m2 = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "1.0"\n' },
		});
		m2.ctx.pluginFactory = Furnace;
		m2.ledger = LedgerFile("write3b");
		m2.ctx.fs.writeText = async () => {
			throw new Error("FS_STALE_VERSION");
		};
		Boot(m2);
		m2.listener?.(
			{ targetKey: "k1", displayPath: file },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		await Flush();
		const writes2 = m2.captured.writes.length;
		const governed2 = Ledger(m2.ledger).filter((l) => l.startsWith("governed")).length;
		const suppressed = LoggerLines.error.some((l) =>
			l.startsWith("hook-dsh-governor-cargo: continuation error (suppressed):"),
		);
		await CheckAsync(
			Count,
			"P3/P4: both sandbox postures; a racing write is contained (no clobber, no leak)",
			async () => {
				assert.deepEqual(
					fence,
					{ mode: "workspace-write", workspaceRoot: dir },
					"confined backend \u2192 fence rooted at the file's own directory",
				);
				assert.equal(writes2, 0);
				assert.equal(governed2, 0, "a racing write \u2192 no governed line, no ledger noise");
				assert.ok(suppressed, "contained \u2192 logger-only suppression");
			},
		);
	}
	return Finish(Count, "Keep-Refusal-And-Guarded-Write");
};

// Standalone entry: `node Target/Test/Keep-Refusal-And-Guarded-Write/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Keep-Refusal-And-Guarded-Write`);
}
