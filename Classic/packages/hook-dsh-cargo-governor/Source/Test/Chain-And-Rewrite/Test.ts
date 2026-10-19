// Source/Test/Chain-And-Rewrite/Test.ts - one singular test: the chain pass's
// canonicalization (member table, idempotence, pinStyle exact, the target and
// workspace tables, inline tables), the rewrite contract (comment/formatting
// preservation byte-equality through the string-next path, the governed
// ledger line), the strict stripping (whole-entry, table-style, the
// no-registry case), and the full-version normalization (shorthand cores,
// exact prefix, prerelease/build, complex forms).
// Runs standalone (`node Target/Test/Chain-And-Rewrite/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-cargo-governor.
import assert from "node:assert/strict";
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
	Policy,
	Registry,
	SeamStub,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the member table canonicalization.
	{
		const dir = Group("chain1");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "2.0"\n' },
		});
		Registry(dir, { serde: "2.1" }); // a SHORTHAND registry value...
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("chain1");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(
			Count,
			'chain: member table \u2192 bare full resolved form (`serde = "2.1.0"`)',
			async () => {
				assert.equal(writes.length, 1);
				assert.equal(
					writes[0].content
						.split("\n")
						.filter((l: string) => l.trim().startsWith("serde"))
						.at(-1),
					'serde = "2.1.0"',
					"chain canonicalization always emits the FULL resolved form (padded from a shorthand registry)",
				);
			},
		);
	}
	// Group: the chain idempotence.
	{
		const dir = Group("chain2");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "2.1.0"\n' },
		});
		Registry(dir, { serde: "2.1.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("chain2");
		Boot(m);
		const t = { targetKey: "k1", displayPath: file };
		Fire(m, t, "v1", "edit");
		await Flush();
		const afterFirst = Ledger(m.ledger).length;
		m.files[t.displayPath] = '[dependencies]\nserde = "2.1.0"\n';
		Fire(m, t, "v2", "edit"); // a real re-entry with a fresh version
		await Flush();
		const writes = m.captured.writes.length;
		const afterSecond = Ledger(m.ledger).length;
		await CheckAsync(
			Count,
			"chain: idempotence \u2014 an already-canonical manifest maps to no plan, no write",
			async () => {
				assert.equal(writes, 0, "canonical manifest \u2192 no rewrite");
				assert.equal(afterSecond, afterFirst, "idempotence: P(P(c)) = P(c)");
			},
		);
	}
	// Group: pinStyle exact.
	{
		const dir = Group("exact");
		const file = Path.join(dir, "Cargo.toml");
		Policy(dir, { pinStyle: "exact" });
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "1.0"\n' },
		});
		Registry(dir, { serde: "1.1.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("exact");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(Count, 'chain: pinStyle exact \u2192 `serde = "=1.1.0"`', async () => {
			assert.equal(writes.length, 1);
			assert.ok(
				writes[0].content.includes('serde = "=1.1.0"'),
				"pinStyle exact \u2192 `=<resolved>` (manifest-level; there is no --exact flag)",
			);
		});
	}
	// Group: the target table.
	{
		const dir = Group("target1");
		const file = Path.join(dir, "Cargo.toml");
		const Text = "[target.'cfg(windows)'.dependencies]\nwinapi = \"0.3\"\n";
		const m = MakeContext({ services: { subprocess: SeamStub() }, files: { [file]: Text } });
		Registry(dir, { winapi: "0.3.9" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("target1");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(Count, "chain: `[target.'cfg(...)'.dependencies]` canonicalized", async () => {
			assert.equal(writes.length, 1);
			assert.ok(
				writes[0].content.includes('winapi = "0.3.9"'),
				"target table canonicalized",
			);
		});
	}
	// Group: the shared workspace table.
	{
		const dir = Group("wsdeps");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[workspace.dependencies]\nanyhow = "1.0"\n' },
		});
		Registry(dir, { anyhow: "1.0.1" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("wsdeps");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(
			Count,
			"chain: `[workspace.dependencies]` (the shared table) canonicalized",
			async () => {
				assert.equal(writes.length, 1);
				assert.ok(
					writes[0].content.includes('anyhow = "1.0.1"'),
					"shared dep table canonicalized",
				);
			},
		);
	}
	// Group: inline-table entries.
	{
		const dir = Group("inline");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\ntokio = { version = "0.3", features = ["full"] }\n' },
		});
		Registry(dir, { tokio: "0.3.1" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("inline");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(Count, "chain: inline-table entries spliced on their own line", async () => {
			assert.equal(writes.length, 1);
			assert.ok(
				writes[0].content.includes('tokio = { version = "0.3.1", features = ["full"] }'),
				"inline-table version replaced on the same line",
			);
		});
	}
	// Group: comment/formatting preservation (the string-next path).
	{
		const dir = Group("comments");
		const file = Path.join(dir, "Cargo.toml");
		const Original = [
			"# Workspace manifest for the smoke",
			"[dependencies]",
			"# The serialization workhorse",
			'serde = "1.0"   # inline comment stays',
			'tokio = { version = "0.3", features = ["full"] } # trailing comment',
			"",
			"[dev-dependencies]",
			'pretty_assertions = "1.0"',
			"",
			"[target.'cfg(windows)'.dependencies]",
			'winapi = "0.3"',
			"",
			"[workspace.dependencies]",
			'anyhow = "1.0"',
			"",
			"[package]",
			'name = "demo" # never touched',
			'version = "0.1.0"',
			"",
		].join("\n");
		const Expected = [
			"# Workspace manifest for the smoke",
			"[dependencies]",
			"# The serialization workhorse",
			'serde = "1.1.0"   # inline comment stays',
			'tokio = { version = "0.3.1", features = ["full"] } # trailing comment',
			"",
			"[dev-dependencies]",
			'pretty_assertions = "1.0.0"',
			"",
			"[target.'cfg(windows)'.dependencies]",
			'winapi = "0.3.9"',
			"",
			"[workspace.dependencies]",
			'anyhow = "1.0.1"',
			"",
			"[package]",
			'name = "demo" # never touched',
			'version = "0.1.0"',
			"",
		].join("\n");
		const m = MakeContext({ services: { subprocess: SeamStub() }, files: { [file]: Original } });
		Registry(dir, { serde: "1.1.0", tokio: "0.3.1", winapi: "0.3.9", anyhow: "1.0.1" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("comments");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(
			Count,
			"rewrite: comment/formatting preservation byte-equality (the string-next path)",
			async () => {
				assert.equal(writes.length, 1);
				// THE BYTE-EQUALITY: the string-next path - the written content is the
				// surgically spliced text, never a TOML stringify.
				assert.deepEqual(
					writes[0].content.split("\n"),
					Expected.split("\n"),
					"comments, inline comments, blank lines and untouched lines byte-identical",
				);
				assert.equal(
					typeof writes[0].content,
					"string",
					"next is a raw STRING (verbatim, not JSON)",
				);
			},
		);
	}
	// Group: the governed ledger line.
	{
		const dir = Group("govline");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "1.0"\n' },
		});
		Registry(dir, { serde: "1.1.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("govline");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		await CheckAsync(
			Count,
			"rewrite: `governed <path> \u2192 fresh-v2` ledger line (message-from-version path)",
			async () => {
				assert.equal(
					lines.filter((l) => l === `governed ${file} \u2192 fresh-v2`).length,
					1,
					"exactly one `governed <path> \u2192 <version>` line, composed from the fresh version",
				);
			},
		);
	}
	// Group: strict stripping.
	{
		const dir = Group("strict1");
		const file = Path.join(dir, "Cargo.toml");
		const Original = [
			"[dependencies]",
			'serde = "1.0"',
			'leaked = "0.1"',
			"inherited.workspace = true",
			"inherited2 = { workspace = true }",
			'local = { path = "../x" }',
			"",
		].join("\n");
		const Expected = [
			"[dependencies]",
			'serde = "1.1.0"',
			"inherited.workspace = true",
			"inherited2 = { workspace = true }",
			'local = { path = "../x" }',
			"",
		].join("\n");
		const m = MakeContext({ services: { subprocess: SeamStub() }, files: { [file]: Original } });
		Registry(dir, { serde: "1.1.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("strict1");
		Boot(m, { strict: true });
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(
			Count,
			"strict: whole-entry strip of unknown deps; inherited and path entries survive",
			async () => {
				assert.equal(writes.length, 1);
				assert.deepEqual(
					writes[0].content.split("\n"),
					Expected.split("\n"),
					"unknown dep stripped whole; chain dep canonicalized; inherited/path/git survive",
				);
			},
		);
	}
	{
		const dir = Group("strict2");
		const file = Path.join(dir, "Cargo.toml");
		const Original = [
			"[dependencies]",
			'serde = "1.0.0"',
			"",
			"[dependencies.bad]",
			'version = "0.1"',
			"",
			"[dev-dependencies]",
			'x = "1.0"',
			"",
		].join("\n");
		const Expected = [
			"[dependencies]",
			'serde = "1.0.0"',
			"",
			"[dev-dependencies]",
			'x = "1.0.0"',
			"",
		].join("\n");
		const m = MakeContext({ services: { subprocess: SeamStub() }, files: { [file]: Original } });
		Registry(dir, { serde: "1.0.0", x: "1.0.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("strict2");
		Boot(m, { strict: true });
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(Count, "strict: table-style `[dependencies.bad]` block removed", async () => {
			assert.equal(writes.length, 1);
			assert.deepEqual(
				writes[0].content.split("\n"),
				Expected.split("\n"),
				"table-style strip removes through the next header",
			);
		});
	}
	{
		const dir = Group("strict3");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("strict3");
		Boot(m, { strict: true });
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const writes = m.captured.writes;
		await CheckAsync(Count, "strict: no registry \u2192 no strip, normalization alone", async () => {
			assert.equal(
				writes.filter((w: any) => w.content.includes("rand")).length,
				1,
				"strict WITHOUT a registry strips nothing (strict is part of the chain pass)",
			);
			assert.ok(
				writes[0].content.includes('rand = "0.8.0"'),
				"normalization alone still runs without a registry",
			);
		});
	}
	// Group: the full-version normalization.
	{
		const dir = Group("norm1");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\na = "1.0"\nb = "1"\nc = "0.1"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("norm1");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const Out = m.captured.writes[0].content;
		await CheckAsync(Count, "normalize: shorthand cores padded to X.Y.Z", async () => {
			assert.ok(Out.includes('a = "1.0.0"'), '"1.0" \u2192 "1.0.0"');
			assert.ok(Out.includes('b = "1.0.0"'), '"1" \u2192 "1.0.0"');
			assert.ok(Out.includes('c = "0.1.0"'), '"0.1" \u2192 "0.1.0"');
		});
	}
	{
		const dir = Group("norm2");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: {
				[file]:
					'[dependencies]\na = "=1.0"\nb = "1.2-rc.1"\nc = "1.2.3-rc.1"\nd = "1.2.3+build"\ne = ">=1.0"\nf = "~1.2"\ng = "*"\nh = "1.0, 2.0"\n',
			},
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("norm2");
		Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const Out = m.captured.writes[0].content;
		await CheckAsync(
			Count,
			"normalize: exact prefix, prerelease/build preserved, complex forms untouched",
			async () => {
				assert.ok(Out.includes('a = "=1.0.0"'), '"=1.0" keeps its = prefix');
				assert.ok(Out.includes('b = "1.2.0-rc.1"'), "core padded BEFORE the prerelease");
				assert.ok(Out.includes('c = "1.2.3-rc.1"'), "prerelease preserved as authored");
				assert.ok(Out.includes('d = "1.2.3+build"'), "build metadata preserved as authored");
				for (const [name, ver] of [
					["e", '">=1.0"'],
					["f", '"~1.2"'],
					["g", '"*"'],
					["h", '"1.0, 2.0"'],
				]) {
					assert.ok(Out.includes(`${name} = ${ver}`), `${ver} left as-is (complex forms)`);
				}
			},
		);
	}
	return Finish(Count, "Chain-And-Rewrite");
};

// Standalone entry: `node Target/Test/Chain-And-Rewrite/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Chain-And-Rewrite`);
}
