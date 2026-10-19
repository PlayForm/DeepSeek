// Source/Test/Update-Stage/Test.ts - one singular test: the update stage
// (the Filter skip, the no-registry dispatch, the cooldown/in-flight/breaker
// gates), the CLI mapping (the argv, the digest line, the failure path, the
// cargo-edit-unavailable paths), verifyCommand (ok, 127 non-fatal, failing),
// the U2 stat-based refresh, and the jobs envelope.
// Runs standalone (`node Target/Test/Update-Stage/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
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
	ProbeState,
	Registry,
	SeamStub,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the Filter skip.
	{
		const dir = Group("filterskip");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "1.0.0"\n' },
		});
		Registry(dir, { serde: "1.0.0" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("filterskip");
		const { listener } = Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const dispatched = Ledger(m.ledger).filter((l) => l.startsWith("update stage dispatched"))
			.length;
		await CheckAsync(
			Count,
			"update: the Filter skip \u2014 a fully chain-governed manifest dispatches nothing",
			async () => {
				assert.equal(dispatched, 0, "everything chain-governed \u2192 nothing for cargo to do");
			},
		);
	}
	// Group: the no-registry dispatch.
	{
		const dir = Group("noreg2");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("noreg2");
		const { listener } = Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		await CheckAsync(
			Count,
			"update: the no-registry path dispatches with the built-in default policy",
			async () => {
				assert.ok(
					lines.some(
						(l) =>
							l ===
							`update stage dispatched for ${dir} (cargo via cargo, built-in default policy)`,
					),
					"no registry \u2192 everything is public, the built-in default policy",
				);
				assert.ok(lines.includes("update: using built-in default policy"));
				assert.ok(lines.some((l) => l.startsWith("update: cargo upgrade upgrade --manifest-path ")));
				assert.ok(lines.includes("update: DONE \u2014 pins bumped per policy"));
			},
		);
	}
	// Group: the cooldown gate.
	{
		const dir = Group("cooldown");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("cooldown");
		const { listener } = Boot(m, { updateCooldownMs: 60000 });
		const t = { targetKey: "k1", displayPath: file };
		Fire(m, t, "v1", "edit");
		await Flush();
		Fire(m, t, "v2", "edit"); // a second write within the cooldown window
		await Flush();
		const lines = Ledger(m.ledger);
		await CheckAsync(Count, "update: cooldown gate \u2014 `update stage skipped for \u2026 (cooldown)`", async () => {
			assert.ok(
				lines.some((l) => l.startsWith("update stage dispatched for")),
				"first write dispatched",
			);
			assert.ok(lines.includes(`update stage skipped for ${dir} (cooldown)`));
		});
	}
	// Group: the in-flight gate + P2.
	{
		const dir = Group("inflight");
		const file = Path.join(dir, "Cargo.toml");
		const hanging = {
			resolveExecutable: async (b: string) => `/resolved/${b}`,
			spawn: () => ({
				done: new Promise(() => {}),
				collected: {
					stdout: { readFrom: () => ({ text: "" }) },
					stderr: { readFrom: () => ({ text: "" }) },
				},
			}),
		};
		const m = MakeContext({
			services: { subprocess: hanging },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("inflight");
		const { listener } = Boot(m);
		const t = { targetKey: "k1", displayPath: file };
		Fire(m, t, "v1", "edit");
		await Flush();
		Fire(m, t, "v2", "edit"); // one update run per directory
		await Flush();
		const lines = Ledger(m.ledger);
		const inflightSize = ProbeState.Inflight.size;
		const inflightEffect = m.captured.effects.find(
			(e: any) => e[0] === "hook-dsh-governor-cargo-inflight",
		)[1];
		inflightEffect(); // P2 - unload disposal
		const inflightAfter = ProbeState.Inflight.size;
		await CheckAsync(
			Count,
			"update: in-flight gate + P2 disposal aborts and clears the in-flight run",
			async () => {
				assert.ok(lines.includes(`update stage skipped for ${dir} (in-flight)`), "the in-flight gate line");
				assert.equal(inflightSize, 1, "the run's controller is registered");
				assert.equal(inflightAfter, 0, "P2 clears the map");
			},
		);
	}
	// Group: the circuit breaker.
	{
		const dir = Group("breaker");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub({ exitCode: 1 }) },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("breaker");
		const { listener } = Boot(m, { maxUpdateFailures: 2 });
		const t = { targetKey: "k1", displayPath: file };
		Fire(m, t, "v1", "edit");
		await Flush();
		Fire(m, t, "v2", "edit");
		await Flush();
		const countAfterTwo = ProbeState.Count.get(dir);
		Fire(m, t, "v3", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		const dispatchedCount = lines.filter((l) => l.startsWith("update stage dispatched")).length;
		await CheckAsync(Count, "update: circuit breaker \u2014 consecutive failures pause the stage", async () => {
			assert.equal(countAfterTwo, 2, "two consecutive failures counted");
			assert.ok(
				lines.includes(`update stage paused for ${dir} (2 consecutive failures \u2265 2)`),
				"the breaker pause line",
			);
			assert.equal(dispatchedCount, 2, "no third dispatch");
		});
	}
	// Group: the CLI mapping.
	{
		const dir = Group("cli");
		const file = Path.join(dir, "Cargo.toml");
		Policy(dir, {
			reject: ["openssl-sys"],
			allow: ["serde"],
			compatible: "allow",
			incompatible: "ignore",
			pinned: "ignore",
		});
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nserde = "1.0.0"\ntokio = "0.3.1"\nrand = "0.8"\n' },
		});
		Registry(dir, { serde: "1.0.0", tokio: "0.3.1" });
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("cli");
		const { listener } = Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		const argv = m.services.subprocess.calls[0].argv;
		const expected = [
			"/resolved/cargo",
			"upgrade",
			"--manifest-path",
			file,
			"--exclude",
			"openssl-sys",
			"--exclude",
			"serde",
			"--exclude",
			"tokio",
			"-p",
			"serde",
			"--compatible",
			"allow",
			"--incompatible",
			"ignore",
			"--pinned",
			"ignore",
		];
		await CheckAsync(
			Count,
			"CLI: argv \u2014 exclusionary level (reject \u222a chain), -p allow, the policy flags",
			async () => {
				assert.ok(
					lines.includes(
						`update stage dispatched for ${dir} (cargo via cargo, policy ${Path.join(dir, "update-policy.json")})`,
					),
					"the dispatched line names the policy path",
				);
				assert.deepEqual(
					argv,
					expected,
					"ONE --exclude pair per crate (reject \u222a chain deps); no comma form",
				);
			},
		);
	}
	{
		const dir = Group("digest");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub({ exitCode: 0 }, "Updating serde v1.0.0 -> v1.1.0\n") },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("digest");
		const { listener } = Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		const governedIdx = lines.indexOf(lines.find((l) => l === `governed ${file} \u2192 fresh-v2`));
		const dispatchedIdx = lines.indexOf(lines.find((l) => l.startsWith("update stage dispatched")));
		await CheckAsync(
			Count,
			"CLI: digest line, collected output appended, ledger order preserved",
			async () => {
				assert.ok(
					lines.some(
						(l) =>
							l.startsWith(`update: cargo upgrade upgrade --manifest-path ${file}`) &&
							l.endsWith('{"exitCode":0}'),
					),
					"the digest line with the JSON exit code",
				);
				assert.ok(
					lines.includes("Updating serde v1.0.0 -> v1.1.0"),
					"collected stdout appended to the ledger",
				);
				assert.ok(lines.includes("update: DONE \u2014 pins bumped per policy"));
				assert.ok(
					governedIdx < dispatchedIdx,
					"ledger order preserved: governed ... before update stage dispatched ...",
				);
			},
		);
	}
	{
		const dir = Group("fail");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub({ exitCode: 1 }) },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("fail");
		const { listener } = Boot(m, { maxUpdateFailures: 99 });
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		const count = ProbeState.Count.get(dir);
		await CheckAsync(Count, "CLI: failure path \u2014 per-invocation line, FAILED line, breaker incremented", async () => {
			assert.ok(lines.includes("update: cargo upgrade failed (base) status 1"));
			assert.ok(lines.includes("update: FAILED \u2014 see lines above"));
			assert.ok(lines.includes(`update stage FAILED (1) for ${dir}; consecutive=1`));
			assert.equal(count, 1);
		});
	}
	{
		const dir = Group("unavail");
		const file = Path.join(dir, "Cargo.toml");
		const throwing = {
			resolveExecutable: async () => {
				throw new Error("no cargo here");
			},
			spawn: () => {
				throw new Error("unreachable");
			},
		};
		const m1 = MakeContext({
			services: { subprocess: throwing },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m1.ctx.pluginFactory = Furnace;
		m1.ledger = LedgerFile("unavail1");
		Boot(m1);
		m1.listener?.(
			{ targetKey: "k1", displayPath: file },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		await Flush();
		const m2 = MakeContext({
			services: { subprocess: SeamStub({ exitCode: 101 }, "error: no such command: upgrade\n") },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m2.ctx.pluginFactory = Furnace;
		m2.ledger = LedgerFile("unavail2");
		Boot(m2);
		m2.listener?.(
			{ targetKey: "k2", displayPath: file },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		await Flush();
		const m3 = MakeContext({ files: { [file]: '[dependencies]\nrand = "0.8"\n' } }); // no seam
		m3.ctx.pluginFactory = Furnace;
		m3.ledger = LedgerFile("unavail3");
		Boot(m3, { cargoBin: "/nonexistent/cargo-for-smoke", maxUpdateFailures: 99 });
		m3.listener?.(
			{ targetKey: "k3", displayPath: file },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		await Flush();
		const lines1 = Ledger(m1.ledger);
		const lines2 = Ledger(m2.ledger);
		const lines3 = Ledger(m3.ledger);
		await CheckAsync(
			Count,
			"CLI: cargo-edit unavailable \u2014 resolveExecutable failure, exit 101, and the no-seam fallback",
			async () => {
				assert.ok(
					lines1.includes(
						"update: cargo-edit unavailable: resolveExecutable(cargo) failed: no cargo here",
					),
					"the resolveExecutable failure line",
				);
				assert.ok(
					lines2.includes(
						"update: cargo-edit unavailable: error: no such command: upgrade",
					),
					"exit 101 + no-such-command \u2192 the graceful cargo-edit-unavailable path",
				);
				assert.ok(
					lines3.some((l) => l.startsWith("update: cargo-edit unavailable:")),
					"the node:child_process fallback contained (no seam in this deployment)",
				);
			},
		);
	}
	// Group: verifyCommand.
	{
		const dir = Group("verify1");
		const file = Path.join(dir, "Cargo.toml");
		Policy(dir, { verifyCommand: "cargo check" });
		const m = MakeContext({
			services: { subprocess: SeamStub({ exitCode: 0 }) },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("verify1");
		const { listener } = Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const argvs = m.services.subprocess.calls.map((c: any) => c.argv);
		const lines = Ledger(m.ledger);
		await CheckAsync(Count, "verify: ok path \u2014 /bin/sh -c via the seam, the ledger lines", async () => {
			assert.deepEqual(
				argvs.at(-1),
				["/bin/sh", "-c", "cargo check"],
				"verifyCommand via the seam, /bin/sh -c",
			);
			assert.ok(lines.includes("update: running verifyCommand: cargo check"));
			assert.ok(lines.includes("update: verifyCommand ok"));
			assert.ok(lines.includes("update: DONE \u2014 pins bumped per policy"));
		});
	}
	{
		const dir = Group("verify2");
		const file = Path.join(dir, "Cargo.toml");
		Policy(dir, { verifyCommand: "cargo check" });
		let VerifyCalls = 0; // call 1 = the upgrade (must succeed), call 2 = the verify
		const m = MakeContext({
			services: {
				subprocess: {
					resolveExecutable: async (b: string) => `/resolved/${b}`,
					spawn: () => {
						VerifyCalls += 1;
						return {
							done: Promise.resolve({ exitCode: VerifyCalls === 1 ? 0 : 127 }),
							collected: {
								stdout: { readFrom: () => ({ text: "" }) },
								stderr: { readFrom: () => ({ text: "" }) },
							},
						};
					},
				},
			},
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("verify2");
		const { listener } = Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush();
		const lines = Ledger(m.ledger);
		const dir2 = Group("verify3");
		const file2 = Path.join(dir2, "Cargo.toml");
		Policy(dir2, { verifyCommand: "cargo check" });
		let VerifyCalls3 = 0; // call 1 = the upgrade (must succeed), call 2 = the verify
		const m3 = MakeContext({
			services: {
				subprocess: {
					resolveExecutable: async (b: string) => `/resolved/${b}`,
					spawn: () => {
						VerifyCalls3 += 1;
						return {
							done: Promise.resolve({ exitCode: VerifyCalls3 === 1 ? 0 : 3 }),
							collected: {
								stdout: { readFrom: () => ({ text: "" }) },
								stderr: { readFrom: () => ({ text: "" }) },
							},
						};
					},
				},
			},
			files: { [file2]: '[dependencies]\nrand = "0.8"\n' },
		});
		m3.ctx.pluginFactory = Furnace;
		m3.ledger = LedgerFile("verify3");
		Boot(m3, { maxUpdateFailures: 99 });
		m3.listener?.(
			{ targetKey: "k1", displayPath: file2 },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		await Flush();
		const lines3 = Ledger(m3.ledger);
		await CheckAsync(Count, "verify: exit 127 non-fatal; a failing verify fails the stage", async () => {
			assert.ok(
				lines.includes(
					"update: verifyCommand runner unavailable (exit 127) \u2014 skipped, non-fatal",
				),
				"exit 127 is non-fatal",
			);
			assert.ok(lines.includes("update: DONE \u2014 pins bumped per policy"));
			assert.ok(lines3.includes("update: verifyCommand failed (status 3)"));
			assert.ok(lines3.includes("update: FAILED \u2014 see lines above"));
		});
	}
	// Group: the U2 refresh.
	{
		const dir = Group("u2");
		const file = Path.join(dir, "Cargo.toml");
		const m = MakeContext({
			services: { subprocess: SeamStub() },
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("u2");
		const { listener } = Boot(m);
		const t = { targetKey: "k1", displayPath: file };
		Fire(m, t, "v1", "edit");
		await Flush();
		const stashed = ProbeState.Stash.get("k1");
		const reEmit = m.captured.emitted.filter((e: any) => e[0] === "fs/observed").at(-1);
		await CheckAsync(Count, "U2: stat-based refresh after the update job \u2014 Stash + same-actor re-emit", async () => {
			assert.equal(stashed, "stat-v9", "U2 registered the stat's version");
			assert.deepEqual(reEmit.slice(1, 3), [t, { kind: "present", version: "stat-v9" }]);
			assert.equal(reEmit[3].name, "edit", "the U2 re-emit uses the same actor");
		});
	}
	// Group: the jobs envelope.
	{
		const dir = Group("jobs");
		const file = Path.join(dir, "Cargo.toml");
		const jobSink: { lines: string[] } = { lines: [] };
		const m = MakeContext({
			services: {
				subprocess: SeamStub({ exitCode: 0 }, "Updating rand v0.8.0 -> v0.9.0\n"),
				jobs: {
					attachController: () => () => {},
					start: (req: any) => {
						m.captured.started.push(req);
						const handle = req.run({ append: (chunk: string) => jobSink.lines.push(chunk) });
						m.captured.done = handle.done;
						return {};
					},
				},
			},
			files: { [file]: '[dependencies]\nrand = "0.8"\n' },
		});
		m.ctx.pluginFactory = Furnace;
		m.ledger = LedgerFile("jobs");
		const { listener } = Boot(m);
		Fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
		await Flush(); // the dispatch happens inside the detached continuation
		const started = m.captured.started.at(-1);
		const done = await m.captured.done;
		await Flush();
		const sink = jobSink.lines;
		await CheckAsync(
			Count,
			"jobs envelope: kind/label (unowned \u2014 owner key absent) + Job.append piping + the settlement mapping",
			async () => {
				assert.equal(started.kind, "governor-update");
				assert.equal(started.label, `cargo upgrade ${dir}`);
				assert.ok(!("owner" in started), "unowned job \u2014 the owner KEY absent (the uniform envelope)");
				assert.ok(
					sink.includes("Updating rand v0.8.0 -> v0.9.0"),
					"output piped to Job.append",
				);
				assert.deepEqual(
					done,
					{ status: "completed", detail: "exit code: 0" },
					"the settlement mapping",
				);
			},
		);
	}
	return Finish(Count, "Update-Stage");
};

// Standalone entry: `node Target/Test/Update-Stage/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Update-Stage`);
}
