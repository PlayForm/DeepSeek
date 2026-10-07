// cargo-smoke.mjs — the @playform/hook-dsh-governor-cargo smoke suite.
// A fake ctx + the REAL built Target + the REAL @playform/plugin-dsh-factory
// service instance (imported from the factory bundle's built Target,
// instantiated against the fake ctx — the class/service form).
//
// 57 pre-existing checks (loader contract, config, trigger gates, chain
// canonicalization member/target/workspace, comment/formatting preservation
// byte-equality, strict stripping, pinStyle exact, refusal guard, P3/U2
// coherence, the CLI mapping, cooldown/in-flight/breaker, cargo-edit-
// unavailable (both paths), verifyCommand, the Filter skip, the no-registry
// update path, the silence invariant, the full-version normalization
// directive) + factory-wiring checks (the state built via factory.State, the
// chain pass running through factory.Continue, the write through
// factory.GuardedWrite, the keep-list through factory.ResolvePolicy, the
// gates through factory.Gate, Attach P5, the State.Module ledger prefix,
// the inject contract).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";

// The monorepo bundles live one directory up from the smokes; resolve against
// this file so the smoke works regardless of the process CWD.
const FactoryDir = Path.resolve(import.meta.dirname, "../packages/plugin-dsh-factory");
const CargoDir = Path.resolve(import.meta.dirname, "../packages/hook-dsh-governor-cargo");
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "cargo-smoke-"));

const { default: PluginFactory } = await import(Path.join(FactoryDir, "Target/Library.js"));
const Cargo = await import(Path.join(CargoDir, "Target/Library.js"));

let N = 0;
const ok = (label) => console.log(`ok ${++N} — ${label}`);
const flush = async () => {
	for (let i = 0; i < 12; i += 1) await new Promise((r) => setImmediate(r));
};

// ── the fake harness ─────────────────────────────────────────────────────
const provided = {};
const loggerLines = { info: [], error: [] };
const fakeLogger = {
	info: (m) => loggerLines.info.push(m),
	error: (m) => loggerLines.error.push(m),
};
let ProbeState = null; // the current scenario's __hookDshGovernorCargoState

const makeCtx = (over = {}) => {
	const captured = {
		events: [],
		emitted: [],
		effects: [],
		serviceGets: [],
		writes: [],
		reads: [],
		controllers: [],
		started: [],
	};
	const services = over.services ?? {};
	const files = over.files ?? {};
	const store = { sandboxMode: over.sandboxMode };
	const ctx = {
		logger: fakeLogger,
		reflect: {
			provide: (name, value) => {
				provided[name] = value;
			},
		},
		on: (name, fn) => {
			captured.events.push([name, fn]);
			return () => true;
		},
		emit: (name, ...args) => {
			captured.emitted.push([name, ...args]);
		},
		effect: (fn, label) => {
			const dispose = fn();
			captured.effects.push([label, dispose]);
			return () => {};
		},
		// Attach's P5 factory probe (ctx.get "pluginFactory") must find the real
		// factory: the scenarios wire it as a ctx property
		// (`m.ctx.pluginFactory = factory`), so get falls through to the ctx
		// property when the services map lacks the name — without it the shared
		// sink is never bound and the pre-bind buffer never drains.
		get: (name) => {
			captured.serviceGets.push(name);
			return services[name] ?? ctx[name];
		},
		fs: {
			get sandboxMode() {
				return store.sandboxMode;
			},
			set sandboxMode(v) {
				store.sandboxMode = v;
			},
			readText: async (target, signal) => {
				captured.reads.push([target.displayPath, !!signal]);
				const file = files[target.displayPath];
				if (file === undefined) throw new Error("vanished");
				return file;
			},
			writeText: async (target, content, intent, signal, fence) => {
				captured.writes.push({
					path: target.displayPath,
					content,
					intent,
					signal: signal ?? null,
					fence: fence ?? null,
					inflight: ProbeState ? ProbeState.Inflight.size : -1,
				});
				files[target.displayPath] = content;
				return { version: over.freshVersion ?? "fresh-v2" };
			},
			stat: async () => ({ version: "stat-v9" }),
		},
		// The ROOT seam: the Wire registers on the root scope (`Context.root.on`),
		// so the fake ctx must be its own root — ctx.root.on records into the
		// same captured.events (a harness seam; zero assertion changes).
		get root() {
			return ctx;
		},
	};
	return { ctx, captured, files, services, store };
};

// The REAL factory instance — class/service registered as ctx.pluginFactory.
const factory = new PluginFactory({
	logger: fakeLogger,
	reflect: {
		provide: (name, value) => {
			provided[name] = value;
		},
	},
	fs: { sandboxMode: undefined },
});

const group = (name) => {
	const dir = Path.join(Root, name);
	FileSystem.mkdirSync(dir, { recursive: true });
	return dir;
};
const ledgerFile = (name) => Path.join(Root, `${name}.log`);
const ledger = (file) =>
	FileSystem.existsSync(file)
		? FileSystem.readFileSync(file, "utf8")
				.split("\n")
				.filter(Boolean)
				.map((l) => l.replace(/^\[[^\]]+\] /, ""))
		: [];

const boot = (m, user = {}) => {
	const cfg = Cargo.Config({ logFile: m.ledger, updateCooldownMs: 0, ...user });
	ProbeState = null;
	const ret = Cargo.apply(m.ctx, cfg);
	ProbeState = m.ctx.__hookDshGovernorCargoState;
	m.listener = m.captured.events.filter((e) => e[0] === "fs/observed").at(-1)?.[1];
	return { cfg, ret, listener: m.listener };
};

const manifest = (dir, body) => Path.join(dir, "Cargo.toml");
const fire = (m, t, version = "v1", actor = "edit") =>
	m.listener?.(t, { kind: "present", version }, { name: actor });
const registry = (dir, names) =>
	FileSystem.writeFileSync(
		Path.join(dir, "registry.json"),
		JSON.stringify({ effectiveLatest: names }),
	);
const policy = (dir, body) =>
	FileSystem.writeFileSync(Path.join(dir, "update-policy.json"), JSON.stringify(body));
const seamStub = (outcome = { exitCode: 0 }, stdoutText = "") => {
	const calls = [];
	return {
		calls,
		resolveExecutable: async (bin) => `/resolved/${bin}`,
		spawn: (req) => {
			calls.push(req);
			return {
				done: Promise.resolve(outcome),
				collected: {
					stdout: { readFrom: () => ({ text: stdoutText }) },
					stderr: { readFrom: () => ({ text: "" }) },
				},
			};
		},
	};
};

// ══ 1. THE LOADER CONTRACT ═══════════════════════════════════════════════
assert.equal(Cargo.name, "hook-dsh-governor-cargo");
assert.equal(typeof Cargo.apply, "function");
assert.equal(typeof Cargo.Config, "function", "Config is a real schemastery schema");
assert.deepEqual(Cargo.inject, ["fs", "pluginFactory"]);
ok("loader: name/apply/Config/inject named exports, inject = [fs, pluginFactory]");

assert.deepEqual(
	Object.keys(Cargo.default).sort(),
	["Config", "apply", "inject", "name"],
	"the default object carries ALL FOUR (the accessor shadow pitfall)",
);
assert.equal(Cargo.default.inject, Cargo.inject);
assert.equal(Cargo.default.Config, Cargo.Config);
assert.equal(Cargo.default.apply, Cargo.apply);
ok("loader: default object carries name/apply/Config/inject");

{
	const m = makeCtx();
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("loader");
	const { ret } = boot(m);
	assert.equal(ret, undefined, "apply returns NOTHING");
}
ok("loader: apply returns undefined");

// ══ 2. THE CONFIG SCHEMA ═════════════════════════════════════════════════
const cfg0 = Cargo.Config({});
assert.equal(cfg0.log.get(), true, "log default");
assert.equal(
	cfg0.logFile.get(),
	"~/.dsh/hook-dsh-governor-cargo.log",
	"the SEPARATE ledger default",
);
assert.equal(cfg0.updateCooldownMs.get(), 3000);
assert.deepEqual(cfg0.mutationTools.get(), ["write", "edit", "str_replace_editor", "raw-write"]);
assert.equal(cfg0.policyFile, "");
assert.equal(cfg0.strict, false);
assert.equal(cfg0.maxUpdateFailures, 3);
assert.equal(cfg0.cargoBin, "cargo");
assert.equal(cfg0.keepFile, "");
assert.equal(cfg0.updateMode, "cargo");
assert.deepEqual(cfg0.exclude, [
	"node_modules",
	".git",
	".dsh",
	".pnpm",
	".store",
	"DeepSeek Harness.app",
]);
ok("config: all defaults (separate ledger, cargoBin, updateMode, exclude list)");

for (const f of ["log", "logFile", "updateCooldownMs", "mutationTools"])
	assert.equal(typeof cfg0[f].get, "function", `${f} is a volatile cell`);
for (const f of [
	"policyFile",
	"exclude",
	"strict",
	"maxUpdateFailures",
	"cargoBin",
	"keepFile",
	"updateMode",
])
	assert.equal(typeof cfg0[f]?.get, "undefined", `${f} validates plain`);
ok("config: shared volatile cells + plain module fields");

const cfg1 = Cargo.Config({
	cargoBin: "/Volumes/CORSAIR/Tool/macOS/rust/cargo/bin/cargo",
	strict: true,
	keepFile: "/k.json",
	updateMode: "cargo",
});
assert.equal(
	cfg1.cargoBin.get?.() ?? cfg1.cargoBin,
	"/Volumes/CORSAIR/Tool/macOS/rust/cargo/bin/cargo",
);
assert.equal(cfg1.strict, true);
assert.equal(cfg1.keepFile, "/k.json");
ok("config: overrides validated (patch-row values)");

// ══ 3. ACTIVATION ════════════════════════════════════════════════════════
{
	const dir = group("act");
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("act");
	boot(m);
	const lines = ledger(m.ledger);
	assert.equal(lines.length, 1, "exactly one activation line");
	assert.match(
		lines[0],
		/^activated \(cargo flavor, logFile=.*cargo-smoke-.*\.log, updateMode=cargo, cargoBin=cargo, exclude=\[node_modules, \.git, \.dsh, \.pnpm, \.store, DeepSeek Harness\.app\], policyFile=\(discovery\), keepFile=\(discovery\)\)$/,
		"the CARGO MODULE activation string byte-shape",
	);
	assert.equal(
		loggerLines.info.at(-1),
		`hook-dsh-governor-cargo: ${lines[0]}`,
		"logger prefix = State.Module",
	);
}
ok("activation: ledger byte-shape + `hook-dsh-governor-cargo: ` logger prefix");

{
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("state");
	boot(m);
	const S = ProbeState;
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
}
ok("state: factory-built shared shape + module fields + activation journal record");

{
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("wire");
	boot(m);
	assert.equal(
		m.captured.events.filter((e) => e[0] === "fs/observed").length,
		1,
		"exactly one fs/observed listener (the factory's Wire)",
	);
	assert.equal(
		m.captured.events.filter((e) => e[0] !== "fs/observed").length,
		0,
		"no other hooks (never fs/write-intent, never tools/*)",
	);
}
ok("wire: exactly one fiber-owned fs/observed registration, no other hooks");

{
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("attach");
	boot(m);
	assert.deepEqual(
		m.captured.effects.map((e) => e[0]),
		[
			"hook-dsh-governor-cargo-jobs",
			"hook-dsh-governor-cargo-inflight",
			"hook-dsh-governor-cargo-storage",
		],
	);
	assert.deepEqual(
		m.captured.controllers,
		[],
		"no jobs service in this scenario → no controller",
	);
	const m2 = makeCtx({
		services: {
			subprocess: seamStub(),
			jobs: {
				attachController: (n) => {
					m2.captured.controllers.push(n);
					return () => {};
				},
			},
		},
	});
	m2.ctx.pluginFactory = factory;
	m2.ledger = ledgerFile("attach2");
	boot(m2);
	assert.deepEqual(
		m2.captured.controllers,
		["hook-dsh-governor-cargo"],
		"P1 attaches the root controller",
	);
}
ok("attach: P1/P2/P5 effect labels + P1 root jobs controller");

// ══ 4. THE TRIGGER GATES ═════════════════════════════════════════════════
{
	const dir = group("gates");
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("gates");
	const { listener } = boot(m);
	const baseline = ledger(m.ledger).length; // the activation line
	const t = { targetKey: "k1", displayPath: Path.join(dir, "Cargo.toml") };
	fire(m, t, "v1", "grep"); // reads emit too — the actor gate is required
	assert.equal(ledger(m.ledger).length, baseline, "non-mutation actor → silent");
	m.listener?.(t, { kind: "present", version: "v1" }); // a truly MISSING actor
	assert.equal(ledger(m.ledger).length, baseline, "missing actor → silent");
	fire(m, t, "v1", "edit");
	const after = ledger(m.ledger).length;
	m.listener?.({ ...t }, { kind: "absent" }, { name: "edit" }); // absent probe
	assert.equal(ledger(m.ledger).length, after, "absent probe → silent");
}
ok("gate: actor + kind gates silent (reads emit too, absent probes)");

{
	const dir = group("gates2");
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("gates2");
	const { listener } = boot(m);
	const baseline = ledger(m.ledger).length;
	const t = { targetKey: "k1", displayPath: Path.join(dir, "package.json") };
	fire(m, t, "v1", "edit");
	assert.equal(ledger(m.ledger).length, baseline, "wrong basename → silent");
	fire(m, { targetKey: "k2", displayPath: Path.join(dir, "sub", "Cargo.toml") }, "v1", "edit");
	await flush();
	assert.ok(
		ledger(m.ledger).includes(
			`observed non-JSON/TOML Cargo.toml ${Path.join(dir, "sub", "Cargo.toml")} — skipped`,
		),
		"missing file content read → non-TOML line",
	);
}
ok("gate: basename gate silent for non-Cargo.toml");

{
	const dir = group("excl");
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("excl");
	const { listener } = boot(m);
	const t = { targetKey: "k1", displayPath: Path.join(dir, "node_modules", "x", "Cargo.toml") };
	FileSystem.mkdirSync(Path.dirname(t.displayPath), { recursive: true });
	FileSystem.writeFileSync(t.displayPath, '[dependencies]\nserde = "1.0"\n');
	const baseline = ledger(m.ledger).length;
	fire(m, t, "v1", "edit");
	await flush();
	const lines = ledger(m.ledger).slice(baseline);
	assert.deepEqual(lines, [`skipped (excluded) ${t.displayPath}`]);
	assert.equal(m.captured.reads.length, 0, "excluded → never read");
	assert.equal(m.captured.writes.length, 0, "excluded → never written");
}
ok("gate: exclusion-first → `skipped (excluded) <path>`, no read, no write");

{
	const dir = group("idem");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [Path.join(dir, "Cargo.toml")]: '[dependencies]\nserde = "2.0"\n' },
	});
	registry(dir, { serde: "2.1.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("idem");
	const { listener } = boot(m);
	const t = { targetKey: "k1", displayPath: Path.join(dir, "Cargo.toml") };
	fire(m, t, "v1", "edit");
	await flush();
	assert.ok(ledger(m.ledger).some((l) => l.startsWith("governed ")));
	const reads = m.captured.reads.length;
	const writes = m.captured.writes.length;
	fire(m, t, "fresh-v2", "edit"); // our own re-emit — the version the write pre-registered
	assert.equal(m.captured.reads.length, reads, "idempotent → not even a read");
	assert.equal(m.captured.writes.length, writes, "idempotent → no write");
	assert.equal(
		ledger(m.ledger).filter((l) => l.startsWith("governed ")).length,
		1,
		"no second governed line",
	);
}
ok("gate: the Stash idempotence gate blocks our own re-emits (no read, no write)");

// ══ 5. REGISTRY DISCOVERY LINES ══════════════════════════════════════════
{
	const dir = group("noreg1");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("noreg1");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.ok(
		ledger(m.ledger).includes(`no registry.json found for ${file} — chain pass skipped`),
		"the no-registry line",
	);
}
ok("g2: `no registry.json found for … — chain pass skipped`");

{
	const dir = group("badreg");
	const file = Path.join(dir, "Cargo.toml");
	FileSystem.writeFileSync(Path.join(dir, "registry.json"), "{ nope");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("badreg");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.ok(
		ledger(m.ledger).includes(
			`unreadable registry.json at ${Path.join(dir, "registry.json")} — chain pass skipped for ${file}`,
		),
		"the unreadable-registry line",
	);
}
ok("g2: `unreadable registry.json at … — chain pass skipped for …`");

// ══ 6. THE CHAIN PASS — CANONICALIZATION ═════════════════════════════════
{
	const dir = group("chain1");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "2.0"\n' },
	});
	registry(dir, { serde: "2.1" }); // a SHORTHAND registry value…
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("chain1");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(m.captured.writes.length, 1);
	assert.equal(
		m.captured.writes[0].content
			.split("\n")
			.filter((l) => l.trim().startsWith("serde"))
			.at(-1),
		'serde = "2.1.0"',
		"chain canonicalization always emits the FULL resolved form (padded from a shorthand registry)",
	);
}
ok('chain: member table → bare full resolved form (`serde = "2.1.0"`)');

{
	const dir = group("chain2");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "2.1.0"\n' },
	});
	registry(dir, { serde: "2.1.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("chain2");
	const { listener } = boot(m);
	const t = { targetKey: "k1", displayPath: file };
	fire(m, t, "v1", "edit");
	await flush();
	const afterFirst = ledger(m.ledger).length;
	m.files[t.displayPath] = '[dependencies]\nserde = "2.1.0"\n';
	fire(m, t, "v2", "edit"); // a real re-entry with a fresh version
	await flush();
	assert.equal(m.captured.writes.length, 0, "canonical manifest → no rewrite");
	assert.equal(ledger(m.ledger).length, afterFirst, "idempotence: P(P(c)) = P(c)");
}
ok("chain: idempotence — an already-canonical manifest maps to no plan, no write");

{
	const dir = group("exact");
	const file = Path.join(dir, "Cargo.toml");
	policy(dir, { pinStyle: "exact" });
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0"\n' },
	});
	registry(dir, { serde: "1.1.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("exact");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(m.captured.writes.length, 1);
	assert.ok(
		m.captured.writes[0].content.includes('serde = "=1.1.0"'),
		"pinStyle exact → `=<resolved>` (manifest-level; there is no --exact flag)",
	);
}
ok('chain: pinStyle exact → `serde = "=1.1.0"`');

{
	const dir = group("target1");
	const file = Path.join(dir, "Cargo.toml");
	const Text = "[target.'cfg(windows)'.dependencies]\nwinapi = \"0.3\"\n";
	const m = makeCtx({ services: { subprocess: seamStub() }, files: { [file]: Text } });
	registry(dir, { winapi: "0.3.9" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("target1");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(m.captured.writes.length, 1);
	assert.ok(
		m.captured.writes[0].content.includes('winapi = "0.3.9"'),
		"target table canonicalized",
	);
}
ok("chain: `[target.'cfg(...)'.dependencies]` canonicalized");

{
	const dir = group("wsdeps");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[workspace.dependencies]\nanyhow = "1.0"\n' },
	});
	registry(dir, { anyhow: "1.0.1" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("wsdeps");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(m.captured.writes.length, 1);
	assert.ok(
		m.captured.writes[0].content.includes('anyhow = "1.0.1"'),
		"shared dep table canonicalized",
	);
}
ok("chain: `[workspace.dependencies]` (the shared table) canonicalized");

{
	const dir = group("inline");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\ntokio = { version = "0.3", features = ["full"] }\n' },
	});
	registry(dir, { tokio: "0.3.1" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("inline");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(m.captured.writes.length, 1);
	assert.ok(
		m.captured.writes[0].content.includes('tokio = { version = "0.3.1", features = ["full"] }'),
		"inline-table version replaced on the same line",
	);
}
ok("chain: inline-table entries spliced on their own line");

{
	const dir = group("comments");
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
	const m = makeCtx({ services: { subprocess: seamStub() }, files: { [file]: Original } });
	registry(dir, { serde: "1.1.0", tokio: "0.3.1", winapi: "0.3.9", anyhow: "1.0.1" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("comments");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(m.captured.writes.length, 1);
	// THE BYTE-EQUALITY: the string-next path — the written content is the
	// surgically spliced text, never a TOML stringify.
	assert.deepEqual(
		m.captured.writes[0].content.split("\n"),
		Expected.split("\n"),
		"comments, inline comments, blank lines and untouched lines byte-identical",
	);
	assert.equal(
		typeof m.captured.writes[0].content,
		"string",
		"next is a raw STRING (verbatim, not JSON)",
	);
}
ok("rewrite: comment/formatting preservation byte-equality (the string-next path)");

{
	const dir = group("govline");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0"\n' },
	});
	registry(dir, { serde: "1.1.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("govline");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const lines = ledger(m.ledger);
	assert.equal(
		lines.filter((l) => l === `governed ${file} → fresh-v2`).length,
		1,
		"exactly one `governed <path> → <version>` line, composed from the fresh version",
	);
}
ok("rewrite: `governed <path> → fresh-v2` ledger line (message-from-version path)");

// ══ 7. STRICT ════════════════════════════════════════════════════════════
{
	const dir = group("strict1");
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
	const m = makeCtx({ services: { subprocess: seamStub() }, files: { [file]: Original } });
	registry(dir, { serde: "1.1.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("strict1");
	const { listener } = boot(m, { strict: true });
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(m.captured.writes.length, 1);
	assert.deepEqual(
		m.captured.writes[0].content.split("\n"),
		Expected.split("\n"),
		"unknown dep stripped whole; chain dep canonicalized; inherited/path/git survive",
	);
}
ok("strict: whole-entry strip of unknown deps; inherited and path entries survive");

{
	const dir = group("strict2");
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
	const m = makeCtx({ services: { subprocess: seamStub() }, files: { [file]: Original } });
	registry(dir, { serde: "1.0.0", x: "1.0.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("strict2");
	const { listener } = boot(m, { strict: true });
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(m.captured.writes.length, 1);
	assert.deepEqual(
		m.captured.writes[0].content.split("\n"),
		Expected.split("\n"),
		"table-style strip removes through the next header",
	);
}
ok("strict: table-style `[dependencies.bad]` block removed");

{
	const dir = group("strict3");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("strict3");
	const { listener } = boot(m, { strict: true });
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(
		m.captured.writes.filter((w) => w.content.includes("rand")).length,
		1,
		"strict WITHOUT a registry strips nothing (strict is part of the chain pass)",
	);
	assert.ok(
		m.captured.writes[0].content.includes('rand = "0.8.0"'),
		"normalization alone still runs without a registry",
	);
}
ok("strict: no registry → no strip, normalization alone");

// ══ 8. FULL-VERSION NORMALIZATION ════════════════════════════════════════
{
	const dir = group("norm1");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\na = "1.0"\nb = "1"\nc = "0.1"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("norm1");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const Out = m.captured.writes[0].content;
	assert.ok(Out.includes('a = "1.0.0"'), '"1.0" → "1.0.0"');
	assert.ok(Out.includes('b = "1.0.0"'), '"1" → "1.0.0"');
	assert.ok(Out.includes('c = "0.1.0"'), '"0.1" → "0.1.0"');
}
ok("normalize: shorthand cores padded to X.Y.Z");

{
	const dir = group("norm2");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: {
			[file]: '[dependencies]\na = "=1.0"\nb = "1.2-rc.1"\nc = "1.2.3-rc.1"\nd = "1.2.3+build"\ne = ">=1.0"\nf = "~1.2"\ng = "*"\nh = "1.0, 2.0"\n',
		},
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("norm2");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const Out = m.captured.writes[0].content;
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
}
ok("normalize: exact prefix, prerelease/build preserved, complex forms untouched");

// ══ 9. THE KEEP-LIST ═════════════════════════════════════════════════════
{
	const dir = group("keep1");
	const file = Path.join(dir, "Cargo.toml");
	FileSystem.writeFileSync(
		Path.join(dir, "pin-policy.json"),
		JSON.stringify({ keep: ["leftpad"] }),
	);
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nleftpad = "1.0"\nother = "1.0"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("keep1");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const Out = m.captured.writes[0].content;
	assert.ok(Out.includes('leftpad = "1.0"'), "kept package byte-identical");
	assert.ok(Out.includes('other = "1.0.0"'), "non-kept normalized");
}
ok("keep: directory pin-policy.json wins over normalization (byte-identical)");

{
	const dir = group("keep2");
	const file = Path.join(dir, "Cargo.toml");
	const keepGlobal = Path.join(Root, "keep-global.json");
	FileSystem.writeFileSync(keepGlobal, JSON.stringify({ keep: ["gated"] }));
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\ngated = "0.1"\nother = "0.1"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("keep2");
	const { listener } = boot(m, { keepFile: keepGlobal });
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const Out = m.captured.writes[0].content;
	assert.ok(Out.includes('gated = "0.1"'), "the global keepFile honored");
	assert.ok(Out.includes('other = "0.1.0"'), "non-kept normalized");
}
ok("keep: the configured global keepFile honored");

{
	const ws = group("keep3");
	const proj = Path.join(ws, "proj");
	FileSystem.mkdirSync(proj);
	registry(ws, { chaindep: "2.0.0" });
	FileSystem.writeFileSync(
		Path.join(ws, "pin-policy.json"),
		JSON.stringify({ keep: ["adjacent"] }),
	);
	const file = Path.join(proj, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nadjacent = "2.0"\nchaindep = "1.0"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("keep3");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const Out = m.captured.writes[0].content;
	assert.ok(Out.includes('adjacent = "2.0"'), "registry-adjacent pin-policy.json honored");
	assert.ok(Out.includes('chaindep = "2.0.0"'), "the chain is NOT suppressed by the keep-list");
}
ok("keep: registry-adjacent source honored; chain canonicalization not suppressed");

// ══ 10. REFUSALS ═════════════════════════════════════════════════════════
{
	const dir = group("refuse1");
	const file = Path.join(dir, "Cargo.toml");
	const Text = '[dependencies]\nserde.version = "1.0"\nserde.features = ["derive"]\n';
	const m = makeCtx({ services: { subprocess: seamStub() }, files: { [file]: Text } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("refuse1");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const lines = ledger(m.ledger);
	assert.ok(
		lines.includes(
			`REFUSED rewrite of ${file}: dependency "serde" in section "dependencies" not found in text — rewrite aborted`,
		),
		"the unmatched-plan refusal line",
	);
	assert.equal(m.captured.writes.length, 0, "refusal → NO write (never a partial rewrite)");
	assert.equal(
		lines.filter((l) => l.startsWith("update stage dispatched")).length,
		0,
		"refusal → the update stage is skipped",
	);
}
ok("refusal: unmatched plan aborts the whole rewrite; update stage skipped");

{
	const dir = group("nontoml");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: "this is [[ not toml" },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("nontoml");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.ok(
		ledger(m.ledger).includes(`observed non-JSON/TOML Cargo.toml ${file} — skipped`),
		"the non-TOML line",
	);
	assert.equal(m.captured.writes.length, 0);
	const m2 = makeCtx({ services: { subprocess: seamStub() }, files: {} }); // vanished file
	m2.ctx.pluginFactory = factory;
	m2.ledger = ledgerFile("nontoml2");
	const { listener: l2 } = boot(m2);
	l2(
		{ targetKey: "k9", displayPath: file },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await flush();
	assert.ok(
		ledger(m2.ledger).includes(`observed non-JSON/TOML Cargo.toml ${file} — skipped`),
		"vanished file → same line, contained",
	);
	assert.equal(m2.captured.writes.length, 0);
}
ok("silence: non-TOML and vanished manifests → the designed skip line, never a throw");

// ══ 11. THE GUARDED WRITE + P3 ═══════════════════════════════════════════
{
	const dir = group("write1");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0"\n' },
	});
	registry(dir, { serde: "1.1.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("write1");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const W = m.captured.writes[0];
	// The intent's version is the fresh-stat CURRENT version (the chain pass
	// stats before the write — the sequential-fold fix); with this fake's stat
	// that is "stat-v9". On a real backend an unraced pass stats exactly the
	// observed version, so the guarded semantics are unchanged.
	assert.deepEqual(
		W.intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"the version-guarded intent at the fresh-stat CURRENT version",
	);
	assert.equal(W.fence, null, "bare backend → NO fence policy");
	assert.equal(ProbeState.Stash.get("k1"), "fresh-v2", "fresh version pre-registered");
	assert.equal(
		ProbeState.Context.fs.sandboxMode === undefined && W.signal instanceof AbortSignal,
		true,
		"the write carries the continuation's abort signal",
	);
}
ok("P3: replaceIfVersion intent, Stash pre-registration, abort signal");

{
	const dir = group("write2");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0"\n' },
	});
	registry(dir, { serde: "1.1.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("write2");
	const { listener } = boot(m);
	const t = { targetKey: "k1", displayPath: file };
	fire(m, t, "v1", "edit");
	await flush();
	const reEmit = m.captured.emitted.filter((e) => e[0] === "fs/observed").at(-1);
	assert.deepEqual(reEmit.slice(1, 3), [t, { kind: "present", version: "fresh-v2" }]);
	assert.equal(reEmit[3].name, "edit", "SAME actor ⇒ same owner bucket");
	const before = ledger(m.ledger).length;
	fire(m, t, "fresh-v2", "edit"); // the re-emit re-enters the listener…
	await flush();
	assert.equal(ledger(m.ledger).length, before, "…and is a no-op via the Stash gate");
}
ok("P3: same-actor re-emit after the write; the re-entry is a no-op");

{
	const dir = group("write3");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0"\n' },
		sandboxMode: "workspace-write",
	});
	registry(dir, { serde: "1.1.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("write3");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.deepEqual(
		m.captured.writes[0].fence,
		{ mode: "workspace-write", workspaceRoot: dir },
		"confined backend → fence rooted at the file's own directory",
	);
	// The racing-author case: the guarded write fails (stale version) safely.
	const m2 = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0"\n' },
	});
	m2.ctx.pluginFactory = factory;
	m2.ledger = ledgerFile("write3b");
	m2.ctx.fs.writeText = async () => {
		throw new Error("FS_STALE_VERSION");
	};
	boot(m2);
	m2.listener?.(
		{ targetKey: "k1", displayPath: file },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await flush();
	assert.equal(m2.captured.writes.length, 0);
	assert.equal(
		m2.ledger && ledger(m2.ledger).filter((l) => l.startsWith("governed")).length,
		0,
		"a racing write → no governed line, no ledger noise",
	);
	assert.ok(
		loggerLines.error.some((l) =>
			l.startsWith("hook-dsh-governor-cargo: continuation error (suppressed):"),
		),
		"contained → logger-only suppression",
	);
}
ok("P3/P4: both sandbox postures; a racing write is contained (no clobber, no leak)");

// ══ 12. THE UPDATE STAGE ═════════════════════════════════════════════════
{
	const dir = group("filterskip");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0.0"\n' },
	});
	registry(dir, { serde: "1.0.0" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("filterskip");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(
		ledger(m.ledger).filter((l) => l.startsWith("update stage dispatched")).length,
		0,
		"everything chain-governed → nothing for cargo to do",
	);
}
ok("update: the Filter skip — a fully chain-governed manifest dispatches nothing");

{
	const dir = group("noreg2");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("noreg2");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const lines = ledger(m.ledger);
	assert.ok(
		lines.some(
			(l) =>
				l ===
				`update stage dispatched for ${dir} (cargo via cargo, built-in default policy)`,
		),
		"no registry → everything is public, the built-in default policy",
	);
	assert.ok(lines.includes("update: using built-in default policy"));
	assert.ok(lines.some((l) => l.startsWith("update: cargo upgrade upgrade --manifest-path ")));
	assert.ok(lines.includes("update: DONE — pins bumped per policy"));
}
ok("update: the no-registry path dispatches with the built-in default policy");

{
	// ── the direct-govern path (Factory.Govern → the registered steps) ─────
	// The raw-write tool's per-call `govern` route: the steps registered at
	// apply run through the DIRECT path — a simulated raw-write-style
	// invocation with a real target and the observed version. The direct path
	// must match the event-path behavior the scenarios above assert (the same
	// guarded write, the same ledger strings, the Stash seeding).
	const dir = group("direct");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0"\nrand = "0.8.0"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("direct");
	boot(m);
	registry(dir, { serde: "1.0.0" });
	const t = { targetKey: "k-direct", displayPath: file };
	const writesBefore = m.captured.writes.length;
	// The SEQUENTIAL FOLD: Govern is async and awaits each step, so the
	// direct-path invocations below are awaited (every assertion stays
	// byte-identical; the scenarios are now deterministic by construction).
	await factory.Govern(t, "cargo", { name: "edit" }, "v-direct");
	await flush();
	const lines = ledger(m.ledger);
	const write = m.captured.writes.at(-1);
	assert.equal(m.captured.writes.length, writesBefore + 1, "cargo step: the chain pass wrote");
	assert.deepEqual(
		write.intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"cargo step: guarded write at the CURRENT (fresh-stat) version — the chain pass stats before the write (the sequential-fold fix); on a real backend an unraced pass stats exactly the observed version",
	);
	assert.ok(
		write.content.includes('serde = "1.0.0"'),
		"cargo step: chain pin rewritten to the resolved form",
	);
	assert.ok(
		write.content.includes('rand = "0.8.0"'),
		"cargo step: public dep untouched by the chain pass",
	);
	assert.ok(
		lines.includes(`governed ${file} → fresh-v2`),
		"cargo step: `governed <path> → <version>` byte-identical",
	);
	assert.equal(
		ProbeState.Stash.get("k-direct"),
		"fresh-v2",
		"cargo step: the Stash seeded, then advanced by the write",
	);
	assert.equal(
		lines.filter((l) => l.startsWith("update stage dispatched")).length,
		0,
		"cargo step: NO update stage (the chain + normalization pass only)",
	);
	// selection: unknown names are ignored
	const beforeLines = lines.length;
	await factory.Govern(t, ["bogus"], { name: "edit" }, "v-x");
	await flush();
	assert.equal(ledger(m.ledger).length, beforeLines, "selection: unknown step names run nothing");

	// selection: `true` runs BOTH registered steps in order (the sequential
	// fold): the cargo chain pass completes (its write + its `governed` line)
	// before the update step reads the file and dispatches — the guarded
	// writes can never race.
	m.files[file] = '[dependencies]\nserde = "1.0"\nrand = "0.8.0"\n';
	await factory.Govern(t, true, { name: "edit" }, "v-direct3");
	await flush();
	const combined = ledger(m.ledger);
	const lastGoverned = combined.map((l) => l.includes(`governed ${file} → `)).lastIndexOf(true);
	const dispatched = combined
		.map(
			(l) =>
				l ===
				`update stage dispatched for ${dir} (cargo via cargo, built-in default policy)`,
		)
		.lastIndexOf(true);
	assert.ok(
		lastGoverned >= 0 && dispatched > lastGoverned,
		"selection: the cargo chain pass's `governed` line precedes the update step's dispatch (sequential fold order)",
	);
	assert.ok(
		combined.filter((l) => l.includes(`governed ${file} → `)).length >= 2,
		"selection: `true` ran the chain pass again",
	);
	const combinedWrite = m.captured.writes.filter((w) => w.path === file).at(-1);
	assert.ok(
		combinedWrite.content.includes('serde = "1.0.0"'),
		"selection: the fold left the chain pin in the canonical form (deterministic final state)",
	);
}
ok(
	"direct-govern: cargo — Stash seed + Continue, guarded write, ledger byte-identical, no update stage",
);
ok(
	"direct-govern: cargo sequential fold — `true` runs the cargo step then the update step, in order (deterministic)",
);

{
	// ── THE TWO-CHAIN-WRITER FOLD (the live failure mode) ────────────────────
	// The pre-fix fold handed every step the OBSERVED version, so once the
	// first chain-writing step advanced the file, every later chain-writing
	// step failed FS_STALE_VERSION and silently aborted (verified live: a
	// `govern: true` run over canonicalize + pin produced only the pinner's
	// line). With the fresh-stat write basis the second step's chain guards
	// the version it just stat-ed — both land.
	const dir = group("fold");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0"\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("fold");
	boot(m);
	registry(dir, { serde: "1.0.0" });
	const t = { targetKey: "k-fold", displayPath: file };
	const stSim = factory.State(
		m.ctx,
		{ log: true, logFile: m.ledger },
		{ module: "hook-dsh-governor-cargo", policyFileName: "pin-policy.json" },
	);
	// a second chain-writing step (registered after the module's own): a sim
	// pass that appends a marker line through the same Factory.Continue chain
	// (an edit orthogonal to the cargo step's pin canonicalization — the
	// cargo pass rewrites the whole dependency section in ONE write, so the
	// marker line proves the second step read and wrote the file the first
	// step left behind).
	factory.RegisterGovern("Cargo.toml", "fold-sim", (tt, a, v) =>
		factory.Continue(stSim, tt, a, dir, null, v, (text) => {
			if (typeof text !== "string" || text.includes("# fold-sim")) return null;
			return {
				next: text + "# fold-sim\n",
				count: 1,
				message: `fold-sim appended in ${file}`,
			};
		}),
	);
	const writesBeforeFold = m.captured.writes.length;
	await factory.Govern(t, ["cargo", "fold-sim"], { name: "edit" }, "v-fold-cargo");
	await flush();
	const foldWrites = m.captured.writes.slice(writesBeforeFold);
	assert.equal(foldWrites.length, 2, "fold: BOTH chain-writing steps wrote");
	assert.deepEqual(
		foldWrites[0].intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"fold step 1 (cargo): guarded at the fresh-stat CURRENT version",
	);
	assert.deepEqual(
		foldWrites[1].intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"fold step 2 (sim): guarded at the fresh-stat CURRENT version — NOT the stale observed 'v-fold-cargo'",
	);
	assert.notEqual(
		foldWrites[1].intent.version,
		"v-fold-cargo",
		"the observed version handed to the fold is never the later step's write basis",
	);
	assert.ok(m.files[file].includes('serde = "1.0.0"'), "fold: the cargo step's chain pin landed");
	assert.ok(
		m.files[file].includes("# fold-sim"),
		"fold: the sim step landed on the file as the cargo step left it",
	);
	const foldLedger = ledger(m.ledger);
	const govIdx = foldLedger.map((l) => l.includes(`governed ${file} → `)).lastIndexOf(true);
	const simIdx = foldLedger.map((l) => l.includes("fold-sim appended")).lastIndexOf(true);
	assert.ok(
		govIdx >= 0 && simIdx > govIdx,
		"fold: both lines appear in the fold's registered order (cargo's `governed`, then the sim's)",
	);
	ok(
		"direct-govern: two-chain-writer fold (cargo + sim) — both writes land at the fresh-stat version, final state converged",
	);
	factory.RegisterGovern("Cargo.toml", "fold-sim", () => {}); // drop the sim step
}

{
	const dir = group("direct-update");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("direct-update");
	boot(m);
	const t = { targetKey: "k-direct2", displayPath: file };
	await factory.Govern(t, "update", { name: "edit" }, "v-direct2");
	await flush();
	const lines = ledger(m.ledger);
	assert.ok(
		lines.some(
			(l) =>
				l ===
				`update stage dispatched for ${dir} (cargo via cargo, built-in default policy)`,
		),
		"update step: `update stage dispatched …` line byte-identical",
	);
	assert.ok(
		lines.includes("update: using built-in default policy"),
		"update step: the policy diagnostics belong to the job",
	);
	assert.ok(
		lines.includes("update: DONE — pins bumped per policy"),
		"update step: the run completed",
	);
	assert.equal(
		m.captured.writes.filter((w) => w.path === file).length,
		0,
		"update step: no chain write from the update step",
	);
	assert.equal(
		ProbeState.Stash.get("k-direct2"),
		"stat-v9",
		"update step: the Stash seeded, then advanced by the U₂ refresh",
	);
}
ok(
	"direct-govern: update — the update stage alone through the Dispatch envelope, gates and ledger byte-identical",
);

{
	const dir = group("cooldown");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("cooldown");
	const { listener } = boot(m, { updateCooldownMs: 60000 });
	const t = { targetKey: "k1", displayPath: file };
	fire(m, t, "v1", "edit");
	await flush();
	fire(m, t, "v2", "edit"); // a second write within the cooldown window
	await flush();
	const lines = ledger(m.ledger);
	assert.ok(
		lines.some((l) => l.startsWith("update stage dispatched for")),
		"first write dispatched",
	);
	assert.ok(lines.includes(`update stage skipped for ${dir} (cooldown)`));
}
ok("update: cooldown gate — `update stage skipped for … (cooldown)`");

{
	const dir = group("inflight");
	const file = Path.join(dir, "Cargo.toml");
	const hanging = {
		resolveExecutable: async (b) => `/resolved/${b}`,
		spawn: () => ({
			done: new Promise(() => {}),
			collected: {
				stdout: { readFrom: () => ({ text: "" }) },
				stderr: { readFrom: () => ({ text: "" }) },
			},
		}),
	};
	const m = makeCtx({
		services: { subprocess: hanging },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("inflight");
	const { listener } = boot(m);
	const t = { targetKey: "k1", displayPath: file };
	fire(m, t, "v1", "edit");
	await flush();
	fire(m, t, "v2", "edit"); // one update run per directory
	await flush();
	assert.ok(
		ledger(m.ledger).includes(`update stage skipped for ${dir} (in-flight)`),
		"the in-flight gate line",
	);
	const inflightEffect = m.captured.effects.find(
		(e) => e[0] === "hook-dsh-governor-cargo-inflight",
	)[1];
	assert.equal(ProbeState.Inflight.size, 1, "the run's controller is registered");
	inflightEffect(); // P2 — unload disposal
	assert.equal(ProbeState.Inflight.size, 0, "P2 clears the map");
}
ok("update: in-flight gate + P2 disposal aborts and clears the in-flight run");

{
	const dir = group("breaker");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub({ exitCode: 1 }) },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("breaker");
	const { listener } = boot(m, { maxUpdateFailures: 2 });
	const t = { targetKey: "k1", displayPath: file };
	fire(m, t, "v1", "edit");
	await flush();
	fire(m, t, "v2", "edit");
	await flush();
	assert.equal(ProbeState.Count.get(dir), 2, "two consecutive failures counted");
	fire(m, t, "v3", "edit");
	await flush();
	assert.ok(
		ledger(m.ledger).includes(`update stage paused for ${dir} (2 consecutive failures ≥ 2)`),
		"the breaker pause line",
	);
	assert.equal(
		ledger(m.ledger).filter((l) => l.startsWith("update stage dispatched")).length,
		2,
		"no third dispatch",
	);
}
ok("update: circuit breaker — consecutive failures pause the stage");

// ══ 13. THE CLI MAPPING ══════════════════════════════════════════════════
{
	const dir = group("cli");
	const file = Path.join(dir, "Cargo.toml");
	policy(dir, {
		reject: ["openssl-sys"],
		allow: ["serde"],
		compatible: "allow",
		incompatible: "ignore",
		pinned: "ignore",
	});
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nserde = "1.0.0"\ntokio = "0.3.1"\nrand = "0.8"\n' },
	});
	registry(dir, { serde: "1.0.0", tokio: "0.3.1" });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("cli");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const lines = ledger(m.ledger);
	assert.ok(
		lines.includes(
			`update stage dispatched for ${dir} (cargo via cargo, policy ${Path.join(dir, "update-policy.json")})`,
		),
		"the dispatched line names the policy path",
	);
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
	assert.deepEqual(
		argv,
		expected,
		"ONE --exclude pair per crate (reject ∪ chain deps); no comma form",
	);
}
ok("CLI: argv — exclusionary level (reject ∪ chain), -p allow, the policy flags");

{
	const dir = group("digest");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub({ exitCode: 0 }, "Updating serde v1.0.0 -> v1.1.0\n") },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("digest");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const lines = ledger(m.ledger);
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
	assert.ok(lines.includes("update: DONE — pins bumped per policy"));
	assert.ok(
		lines.indexOf(lines.find((l) => l === `governed ${file} → fresh-v2`)) <
			lines.indexOf(lines.find((l) => l.startsWith("update stage dispatched"))),
		"ledger order preserved: governed … before update stage dispatched …",
	);
}
ok("CLI: digest line, collected output appended, ledger order preserved");

{
	const dir = group("fail");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub({ exitCode: 1 }) },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("fail");
	const { listener } = boot(m, { maxUpdateFailures: 99 });
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const lines = ledger(m.ledger);
	assert.ok(lines.includes("update: cargo upgrade failed (base) status 1"));
	assert.ok(lines.includes("update: FAILED — see lines above"));
	assert.ok(lines.includes(`update stage FAILED (1) for ${dir}; consecutive=1`));
	assert.equal(ProbeState.Count.get(dir), 1);
}
ok("CLI: failure path — per-invocation line, FAILED line, breaker incremented");

{
	const dir = group("unavail");
	const file = Path.join(dir, "Cargo.toml");
	const throwing = {
		resolveExecutable: async () => {
			throw new Error("no cargo here");
		},
		spawn: () => {
			throw new Error("unreachable");
		},
	};
	const m1 = makeCtx({
		services: { subprocess: throwing },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m1.ctx.pluginFactory = factory;
	m1.ledger = ledgerFile("unavail1");
	boot(m1);
	m1.listener?.(
		{ targetKey: "k1", displayPath: file },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await flush();
	assert.ok(
		ledger(m1.ledger).includes(
			"update: cargo-edit unavailable: resolveExecutable(cargo) failed: no cargo here",
		),
		"the resolveExecutable failure line",
	);
	const m2 = makeCtx({
		services: { subprocess: seamStub({ exitCode: 101 }, "error: no such command: upgrade\n") },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m2.ctx.pluginFactory = factory;
	m2.ledger = ledgerFile("unavail2");
	boot(m2);
	m2.listener?.(
		{ targetKey: "k2", displayPath: file },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await flush();
	assert.ok(
		ledger(m2.ledger).includes(
			"update: cargo-edit unavailable: error: no such command: upgrade",
		),
		"exit 101 + no-such-command → the graceful cargo-edit-unavailable path",
	);
	const m3 = makeCtx({ files: { [file]: '[dependencies]\nrand = "0.8"\n' } }); // no seam
	m3.ctx.pluginFactory = factory;
	m3.ledger = ledgerFile("unavail3");
	boot(m3, { cargoBin: "/nonexistent/cargo-for-smoke", maxUpdateFailures: 99 });
	m3.listener?.(
		{ targetKey: "k3", displayPath: file },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await flush();
	assert.ok(
		ledger(m3.ledger).some((l) => l.startsWith("update: cargo-edit unavailable:")),
		"the node:child_process fallback contained (no seam in this deployment)",
	);
}
ok("CLI: cargo-edit unavailable — resolveExecutable failure, exit 101, and the no-seam fallback");

// ══ 14. VERIFYCOMMAND, U2, THE JOBS ENVELOPE ═════════════════════════════
{
	const dir = group("verify1");
	const file = Path.join(dir, "Cargo.toml");
	policy(dir, { verifyCommand: "cargo check" });
	const m = makeCtx({
		services: { subprocess: seamStub({ exitCode: 0 }) },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("verify1");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	const argvs = m.services.subprocess.calls.map((c) => c.argv);
	assert.deepEqual(
		argvs.at(-1),
		["/bin/sh", "-c", "cargo check"],
		"verifyCommand via the seam, /bin/sh -c",
	);
	const lines = ledger(m.ledger);
	assert.ok(lines.includes("update: running verifyCommand: cargo check"));
	assert.ok(lines.includes("update: verifyCommand ok"));
	assert.ok(lines.includes("update: DONE — pins bumped per policy"));
}
ok("verify: ok path — /bin/sh -c via the seam, the ledger lines");

{
	const dir = group("verify2");
	const file = Path.join(dir, "Cargo.toml");
	policy(dir, { verifyCommand: "cargo check" });
	let VerifyCalls = 0; // call 1 = the upgrade (must succeed), call 2 = the verify
	const m = makeCtx({
		services: {
			subprocess: {
				resolveExecutable: async (b) => `/resolved/${b}`,
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
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("verify2");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.ok(
		ledger(m.ledger).includes(
			"update: verifyCommand runner unavailable (exit 127) — skipped, non-fatal",
		),
		"exit 127 is non-fatal",
	);
	assert.ok(ledger(m.ledger).includes("update: DONE — pins bumped per policy"));
	const dir2 = group("verify3");
	const file2 = Path.join(dir2, "Cargo.toml");
	policy(dir2, { verifyCommand: "cargo check" });
	let VerifyCalls3 = 0; // call 1 = the upgrade (must succeed), call 2 = the verify
	const m3 = makeCtx({
		services: {
			subprocess: {
				resolveExecutable: async (b) => `/resolved/${b}`,
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
	m3.ctx.pluginFactory = factory;
	m3.ledger = ledgerFile("verify3");
	boot(m3, { maxUpdateFailures: 99 });
	m3.listener?.(
		{ targetKey: "k1", displayPath: file2 },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await flush();
	assert.ok(ledger(m3.ledger).includes("update: verifyCommand failed (status 3)"));
	assert.ok(ledger(m3.ledger).includes("update: FAILED — see lines above"));
}
ok("verify: exit 127 non-fatal; a failing verify fails the stage");

{
	const dir = group("u2");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("u2");
	const { listener } = boot(m);
	const t = { targetKey: "k1", displayPath: file };
	fire(m, t, "v1", "edit");
	await flush();
	assert.equal(ProbeState.Stash.get("k1"), "stat-v9", "U2 registered the stat's version");
	const reEmit = m.captured.emitted.filter((e) => e[0] === "fs/observed").at(-1);
	assert.deepEqual(reEmit.slice(1, 3), [t, { kind: "present", version: "stat-v9" }]);
	assert.equal(reEmit[3].name, "edit", "the U2 re-emit uses the same actor");
}
ok("U2: stat-based refresh after the update job — Stash + same-actor re-emit");

{
	const dir = group("jobs");
	const file = Path.join(dir, "Cargo.toml");
	const jobSink = { lines: [] };
	const m = makeCtx({
		services: {
			subprocess: seamStub({ exitCode: 0 }, "Updating rand v0.8.0 -> v0.9.0\n"),
			jobs: {
				attachController: () => () => {},
				start: (req) => {
					m.captured.started.push(req);
					const handle = req.run({ append: (chunk) => jobSink.lines.push(chunk) });
					m.captured.done = handle.done;
					return {};
				},
			},
		},
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("jobs");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush(); // the dispatch happens inside the detached continuation
	const started = m.captured.started.at(-1);
	assert.equal(started.kind, "governor-update");
	assert.equal(started.label, `cargo upgrade ${dir}`);
	assert.ok(!("owner" in started), "unowned job — the owner KEY absent (the uniform envelope)");
	const done = await m.captured.done;
	await flush();
	assert.ok(
		jobSink.lines.includes("Updating rand v0.8.0 -> v0.9.0"),
		"output piped to Job.append",
	);
	assert.deepEqual(
		done,
		{ status: "completed", detail: "exit code: 0" },
		"the settlement mapping",
	);
}
ok(
	"jobs envelope: kind/label (unowned — owner key absent) + Job.append piping + the settlement mapping",
);

{
	const dir = group("silence");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("silence");
	const { listener } = boot(m);
	let Sync = false;
	listener(
		{ targetKey: "k1", displayPath: file },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	Sync = true; // the listener must return before any async stage runs
	assert.equal(Sync, true, "the fs/observed listener is synchronous");
	assert.equal(m.captured.writes.length, 0, "no write has happened yet (detached)");
	await flush();
	assert.ok(m.captured.writes.length > 0, "the detached continuation did the work");
}
ok("silence: the listener is synchronous and await-free; the stages are detached");

// ══ 15. FACTORY WIRING ═══════════════════════════════════════════════════
{
	const dir = group("wire1");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("wire1");
	const { listener } = boot(m);
	const t = { targetKey: "k1", displayPath: file };
	fire(m, t, "v1", "edit");
	await flush();
	fire(m, t, "v2", "edit"); // a second full pass — the seam must NOT re-probe
	await flush();
	assert.equal(
		m.captured.serviceGets.filter((n) => n === "subprocess").length,
		1,
		"the subprocess seam probed exactly ONCE via the factory's Seam (P9)",
	);
	assert.equal(
		provided["pluginFactory"],
		factory,
		"the real factory registered as ctx.pluginFactory",
	);
	assert.equal(m.ctx.pluginFactory, factory);
}
ok("wiring: real factory instance; P9 probe-once seam across multiple passes");

{
	const dir = group("wire2");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("wire2");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(
		m.captured.writes[0].inflight,
		1,
		"the factory's Continue held the in-flight entry DURING the guarded write",
	);
	assert.equal(ProbeState.Inflight.size, 0, "…and removed it after settlement (finally)");
}
ok("wiring: the chain pass ran through factory.Continue (Inflight lifecycle)");

{
	const dir = group("wire3");
	const file = Path.join(dir, "Cargo.toml");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("wire3");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.equal(
		m.captured.writes[0].signal instanceof AbortSignal,
		true,
		"GuardedWrite forwarded the abort signal",
	);
	assert.equal(m.captured.writes[0].fence, null, "the P4 posture decided by the factory");
}
ok("wiring: the write went through factory.GuardedWrite (signal + P4 fence)");

{
	const dir = group("wire4");
	const file = Path.join(dir, "Cargo.toml");
	FileSystem.writeFileSync(Path.join(dir, "pin-policy.json"), "{ nope");
	const m = makeCtx({
		services: { subprocess: seamStub() },
		files: { [file]: '[dependencies]\nrand = "0.8"\n' },
	});
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("wire4");
	const { listener } = boot(m);
	fire(m, { targetKey: "k1", displayPath: file }, "v1", "edit");
	await flush();
	assert.ok(
		ledger(m.ledger).includes(
			`unreadable pin-policy.json at ${Path.join(dir, "pin-policy.json")} — using built-in default`,
		),
		"the factory's ResolvePolicy composed the unreadable-sidecar line with the module's PolicyName",
	);
	assert.ok(
		m.captured.writes[0].content.includes('rand = "0.8.0"'),
		"the unreadable source contributed nothing",
	);
}
ok("wiring: the keep-list came through factory.ResolvePolicy (policyFileName = pin-policy.json)");

{
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("wire5a");
	boot(m);
	// No storageDomain in this scenario: the factory's P5 silent-skip retires
	// the sink AND clears the pre-open queue — the activated record was queued
	// by apply and drained to nothing (the ledger stays the record).
	assert.equal(ProbeState.Queue.length, 0, "P5 absent → queue drained to nothing");
	const records = [];
	const m2 = makeCtx({
		services: {
			subprocess: seamStub(),
			storageDomain: {
				open: async () => ({
					close: async () => {},
					table: () => ({
						put: async (k, v) => {
							records.push(v);
						},
					}),
				}),
			},
		},
	});
	m2.ctx.pluginFactory = factory;
	m2.ledger = ledgerFile("wire5b");
	boot(m2);
	await flush();
	assert.equal(ProbeState.Queue.length, 0, "the pre-open queue drained into the domain");
	assert.equal(records[0].event, "activated", "the structured record flowed");
	assert.equal(records[0].detail, "cargo", "the activation detail (the update mode)");
	// The journal-parity gap (P4): an update dispatch journals the dispatched
	// record — the parent governor's parity.
	const upd = group("wire5b-update");
	FileSystem.mkdirSync(upd, { recursive: true });
	{
		const mU = makeCtx({
			services: {
				subprocess: seamStub(),
				storageDomain: {
					open: async () => ({
						close: async () => {},
						table: () => ({
							put: async (k, v) => {
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
		mU.ctx.pluginFactory = factory;
		mU.ledger = ledgerFile("wire5b-update");
		boot(mU);
		await flush();
		mU.listener?.(
			{ targetKey: "k-w5", displayPath: Path.join(upd, "Cargo.toml") },
			{ kind: "present", version: "v1" },
			{ name: "edit" },
		);
		await flush();
		assert.ok(
			records.some((r) => r.event === "dispatched" && r.path === upd && r.detail === "cargo"),
			"the dispatched journal record (the parent governor's parity)",
		);
	}
	const m3 = makeCtx({ services: { subprocess: seamStub() } }); // no storageDomain
	m3.ctx.pluginFactory = factory;
	m3.ledger = ledgerFile("wire5c");
	boot(m3);
	ProbeState.Journal("governed", "/p", "v");
	assert.equal(ProbeState.Queue.length, 0, "P5 absent → the sink is retired, no queue growth");
}
ok("wiring: Attach P5 — the domain opens and drains; absent → silent skip");

{
	const dir = group("wire6");
	const m = makeCtx({ services: { subprocess: seamStub() } });
	m.ctx.pluginFactory = factory;
	m.ledger = ledgerFile("wire6");
	boot(m);
	const baseline = ledger(m.ledger).length; // the activation line
	const file = Path.join(dir, "node_modules", "x", "Cargo.toml");
	m.listener?.(
		{ targetKey: "k1", displayPath: file },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	assert.deepEqual(
		ledger(m.ledger).slice(baseline),
		[`skipped (excluded) ${file}`],
		"excluded → exactly one line",
	);
	m.listener?.(
		{ targetKey: "k2", displayPath: Path.join(dir, "package.json") },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	assert.equal(
		ledger(m.ledger).length,
		baseline + 1,
		"basename miss → zero additional lines (the gate logged nothing)",
	);
}
ok("wiring: the g1 gates ran through factory.Gate (log-nothing contract honored)");

{
	const allInfo = loggerLines.info.filter((l) => l.startsWith("hook-dsh-governor-cargo: "));
	assert.ok(allInfo.length > 0);
	const foreign = loggerLines.info.filter((l) => !l.startsWith("hook-dsh-governor-cargo: "));
	assert.equal(foreign.length, 0, "every logger line carries the State.Module prefix");
}
ok("wiring: the ledger prefix is State.Module (factory Append composition)");

// ── done ─────────────────────────────────────────────────────────────────
console.log(`\n${N} checks — ALL PASS (${57} pre-existing + ${N - 57} factory wiring)`);
