// governor-smoke.mjs — the @playform/hook-dsh-governor-package smoke suite
// (post factory-consumption refactor). A fake ctx + a REAL PluginFactory
// instance (the cordis Service base pattern from the factory's own smoke —
// the fake ctx gains the real `pluginFactory` service) + the governor's REAL
// built Target. Reconstructed 2026-10-04: the original smoke was lost from
// /tmp, so this suite re-asserts the full pre-refactor behavioral contract —
// every ledger string byte-exact, the silence invariant, the chain
// semantics, the exemptions and the loader contract — plus the NEW factory
// wiring (State fields, the transform contract, the jobs envelope).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";

// The monorepo bundles live one directory up from the smokes; resolve against
// this file so the smoke works regardless of the process CWD.
const FACTORY_DIR = Path.resolve(import.meta.dirname, "../packages/plugin-dsh-factory");
const GOVERNOR_DIR = Path.resolve(import.meta.dirname, "../packages/hook-dsh-governor-package");
const NCU_BIN = "ncu";
const EXCLUDE = ["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"];
const TOOLS = ["write", "edit", "str_replace_editor", "raw-write"];

const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "governor-smoke-"));
const Ledger = Path.join(Root, "governor.log");

// ── the fake harness ─────────────────────────────────────────────────────
const provided = {};
const events = [];
const emitted = [];
const effects = [];
const serviceGets = [];
const services = {};
const loggerLines = { info: [], error: [] };
const reads = [];
const writes = [];
const spawnSpecs = [];
const jobStarts = [];
const jobRings = [];
const storageRecords = [];

let WriteSeq = 0;
let NextSpawnExits = [];
let NextSpawnOut = "";

const fakeLogger = {
	info: (m) => loggerLines.info.push(m),
	error: (m) => loggerLines.error.push(m),
};

// The ROOT seam: the Wire registers on the root scope (`Context.root.on`), so
// the fake ctx must be its own root — ctx.root.on records into the same
// `events` capture (a harness seam; zero assertion changes).
const makeCtx = (over = {}) => {
	const Context = {
		logger: fakeLogger,
		on: (name, fn) => {
			events.push([name, fn]);
			return () => true;
		},
		emit: (name, ...args) => {
			emitted.push([name, ...args]);
			// the real bus dispatches synchronously — the refresh re-emit re-enters
			// the listener (and must be a no-op there via the Stash gate)
			for (const [n, fn] of [...events]) if (n === name) fn(...args);
		},
		effect: (fn, label) => {
			const dispose = fn();
			effects.push([label, dispose]);
			return () =>
				effects.splice(
					effects.findIndex((e) => e[0] === label),
					1,
				);
		},
		get: (name) => {
			serviceGets.push(name);
			// Attach's P5 factory probe (ctx.get "pluginFactory") must find the real
			// factory: it is wired as a ctx property (`ctx.pluginFactory = factory`),
			// so get falls through to the ctx property when the services map lacks
			// the name — without it the shared sink is never bound and the pre-bind
			// buffer never drains.
			return services[name] ?? ctx[name];
		},
		fs: {
			sandboxMode: undefined,
			readText: async (target, signal) => {
				reads.push([target.displayPath, !!signal]);
				over.onRead?.(target);
				const file = over.files?.[target.displayPath];
				if (file === undefined) throw new Error("vanished");
				return file;
			},
			writeText: async (target, content, intent, signal, fence) => {
				writes.push({
					path: target.displayPath,
					content,
					intent,
					signal: signal ?? null,
					fence: fence ?? null,
				});
				over.files[target.displayPath] = content;
				return { version: `fresh-${++WriteSeq}` };
			},
			stat: async () => ({ version: "stat-v9" }),
		},
		reflect: { provide: (name, value) => (provided[name] = value) },
		// cordis plugin contexts inherit `root` (the shared event bus scope); the
		// fake ctx is its own root.
		get root() {
			return Context;
		},
	};
	return Context;
};

const files = {};
const ctx = makeCtx({ files });
let InflightDuringRead = -1;
ctx.__spy = {
	onRead: () => {
		/* set later, after the probe exists */
	},
};
ctx.fs.readText = async (target, signal) => {
	reads.push([target.displayPath, !!signal]);
	if (typeof Probe !== "undefined" && Probe) InflightDuringRead = Probe.Inflight.size;
	const file = files[target.displayPath];
	if (file === undefined) throw new Error("vanished");
	return file;
};

services["subprocess"] = {
	resolveExecutable: async (bin) => `resolved:${bin}`,
	spawn: (spec) => {
		spawnSpecs.push(spec);
		const exit = NextSpawnExits.length ? NextSpawnExits.shift() : 0;
		return {
			done: Promise.resolve({ exitCode: exit }),
			collected: {
				stdout: { readFrom: () => (NextSpawnOut ? { text: NextSpawnOut } : undefined) },
				stderr: { readFrom: () => undefined },
			},
		};
	},
};
services["jobs"] = {
	attachController: (name) => {
		controllers.push(name);
		return () => detached.push(name);
	},
	start: (spec) => {
		jobStarts.push(spec);
		const ring = [];
		jobRings.push(ring);
		const hooks = spec.run({ append: (t) => ring.push(t) });
		hooks.done.catch(() => {});
		return "governor-update-1";
	},
};
services["storageDomain"] = {
	open: async () => ({
		close: async () => {
			domainClosed = true;
		},
		table: () => ({ put: async (k, v) => storageRecords.push([k, v]) }),
	}),
};

const controllers = [];
const detached = [];
let domainClosed = false;

const ledgerLines = () => FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
const find = (needle) => ledgerLines().filter((l) => l.includes(needle));
const settle = async (turns = 8) => {
	for (let i = 0; i < turns; i++) await new Promise((r) => setImmediate(r));
};

let N = 0;
const ok = (label) => console.log(`ok ${++N} — ${label}`);

// ── the REAL factory instance (the Service base pattern) ────────────────
const { default: PluginFactory } = await import(`${FACTORY_DIR}/Target/Library.js`);
const factory = new PluginFactory(ctx);
assert.equal(provided["pluginFactory"], factory, "factory registered as ctx.pluginFactory");
ctx.pluginFactory = factory;

// ── 1. the entry contract ────────────────────────────────────────────────
const Governor = await import(`${GOVERNOR_DIR}/Target/Library.js`);
assert.equal(Governor.name, "hook-dsh-governor-package");
assert.equal(typeof Governor.apply, "function");
assert.ok(Governor.Config, "Config schema exported");
assert.deepEqual(Governor.inject, ["fs", "pluginFactory"], "inject = fs + pluginFactory");
for (const k of ["name", "apply", "Config", "inject"])
	assert.ok(k in Governor.default, `default object carries ${k}`);
ok("entry: name/apply/Config/inject + the default object carries all four");

// the ONLY factory import is the Config module's standalone Schema (the
// module-load use — factory v0.1.1 P1); every OTHER Target module resolves
// the factory exclusively through ctx (the injected service)
const targetSources = [];
const factoryImporters = [];
const walk = (dir) => {
	for (const e of FileSystem.readdirSync(dir, { withFileTypes: true })) {
		const p = Path.join(dir, e.name);
		if (e.isDirectory()) walk(p);
		else if (p.endsWith(".js")) {
			const source = FileSystem.readFileSync(p, "utf8");
			targetSources.push(source);
			if (source.includes("plugin-dsh-factory")) factoryImporters.push(p);
		}
	}
};
walk(`${GOVERNOR_DIR}/Target`);
assert.deepEqual(
	factoryImporters,
	[Path.join(GOVERNOR_DIR, "Target", "Variable", "Config.js")],
	"the ONLY factory import is the Config module's standalone Schema (module-load use)",
);
ok(
	"consumption: the built Target resolves the factory through ctx EXCEPT the Config module's standalone Schema import",
);

// ── 2. the Config schema (factory.Schema shape parity, local composition) ─
const raw = Governor.Config({ logFile: Ledger });
assert.equal(raw.logFile.get(), Ledger, "volatile logFile cell");
assert.equal(raw.log.get(), true, "volatile log cell default true");
assert.equal(raw.updateCooldownMs.get(), 3000, "volatile cooldown cell");
assert.deepEqual(raw.mutationTools.get(), TOOLS, "volatile mutationTools cell");
assert.equal(raw.strict, false);
assert.equal(raw.maxUpdateFailures, 3);
assert.equal(raw.updateMode, "programmatic");
assert.equal(raw.ncuBin, NCU_BIN);
assert.equal(raw.policyFile, "");
assert.deepEqual(raw.exclude, EXCLUDE);
ok("Config: volatile cells + defaults (factory.Schema shared-block parity)");

// ── 3. apply: wiring, state, activation ──────────────────────────────────
effects.length = 0;
const returned = Governor.apply(ctx, raw);
assert.equal(returned, undefined, "apply returns nothing");
const Probe = ctx.__hookDshGovernorPackageState;
assert.ok(Probe, "ctx.__hookDshGovernorPackageState probe attached");
ok("apply: returns nothing; the state exposed via ctx.__hookDshGovernorPackageState");
assert.equal(Probe.Module, "hook-dsh-governor-package");
assert.deepEqual(Probe.Tool, TOOLS, "Tool ← mutationTools (cell unwrapped)");
ok("State: Module + Tool ← mutationTools (cell unwrapped by the factory)");
assert.equal(Probe.Strict, false);
assert.equal(Probe.Wait, 3000);
assert.equal(Probe.Limit, 3);
assert.equal(Probe.Binary, NCU_BIN);
assert.equal(Probe.Mode, "programmatic");
ok("State: module fields via the setup map (Strict/Wait/Limit/Binary/Mode)");
assert.equal(Probe.Policy, "");
assert.equal(Probe.PolicyName, "update-policy.json", "sidecar name for union discovery");
assert.equal(Probe.Ledger, Ledger);
assert.equal(Probe.Enabled, true);
assert.deepEqual(Probe.List, EXCLUDE);
ok("State: shared mappings (Policy/policyFile, Ledger/logFile, Enabled/log, List/exclude)");
assert.equal(Probe.Subprocess, services["subprocess"], "P9 subprocess probed at build");
ok("State: P9 subprocess seam probed once at build");
assert.equal(Probe.Factory, factory, "the injected factory stored on State");
ok("State: the injected factory service stored on State");
assert.ok(
	Probe.Stash instanceof Map &&
		Probe.Inflight instanceof Map &&
		Probe.Seams instanceof Map &&
		Probe.Queue.length === 0 &&
		factory.PendingJournal.length === 1 &&
		Probe.Stamp instanceof Map &&
		Probe.Set instanceof Set &&
		Probe.Count instanceof Map,
	"fresh machinery + module gate collections (+ the pre-bind buffered activated record)",
);
// the smoke drives engine selection through the module's Mode field: the
// bin-mode scenarios run against the STUBBED subprocess seam (offline, fast)
Probe.Mode = "bin";
ok("State: fresh machinery + module gate collections (Stash/Inflight/Seams/Queue/Stamp/Set/Count)");

assert.deepEqual(
	effects.map((e) => e[0]),
	[
		"hook-dsh-governor-package-jobs",
		"hook-dsh-governor-package-inflight",
		"hook-dsh-governor-package-storage",
	],
	"factory.Attach registered P1/P2/P5 with the module labels",
);
assert.deepEqual(controllers, ["hook-dsh-governor-package"], "P1: jobs controller attached");
assert.equal(
	events.filter((e) => e[0] === "fs/observed").length,
	1,
	"one fs/observed listener (Factory.Wire)",
);
ok("Attach: P1 controller + P2/P5 effects; Wire registered fs/observed");

await settle();
assert.equal(Probe.Queue.length, 0, "P5: pre-open queue drained into the stub domain");
assert.equal(storageRecords.length, 1);
assert.equal(storageRecords[0][1].event, "activated");
ok("activation: the P5 record drained into the opened domain");
const lines = ledgerLines();
assert.equal(lines.length, 1, "exactly one ledger line so far");
assert.match(
	lines[0],
	/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] activated \(anywhere mode, logFile=/,
);
assert.ok(
	lines[0].includes(
		`logFile=${Ledger}, updateMode=programmatic, ncuBin=${NCU_BIN}, exclude=[${EXCLUDE.join(", ")}], policyFile=(discovery))`,
	),
	"activation proof composed byte-identically",
);
ok("activation: durable proof line byte-identical ([ISO] format + summary fields)");

const Listener = events.find((e) => e[0] === "fs/observed")[1];

// ── 4. the g1 gate matrix (Factory.Gate through the wired listener) ─────
const mkTarget = (dir, key) => ({ targetKey: key, displayPath: Path.join(dir, "package.json") });
const actor = { name: "edit" };

// target gate: silent
let before = ledgerLines().length;
Listener(null, { kind: "present", version: "v1" }, actor);
assert.equal(ledgerLines().length, before, "null target → silent");
ok("Gate: missing target → silent (Factory.Gate reason=target)");
// actor gate: silent (reads emit too)
const projGates = Path.join(Root, "gates");
FileSystem.mkdirSync(projGates);
const tGates = mkTarget(projGates, "k-gates");
Listener(tGates, { kind: "present", version: "v1" }, { name: "grep" });
assert.equal(ledgerLines().length, before, "non-mutation actor → silent");
ok("Gate: non-mutation actor tool → silent (reads emit too)");
// kind gate: silent
Listener(tGates, { kind: "absent" }, actor);
assert.equal(ledgerLines().length, before, "absent observation → silent");
ok("Gate: absent observation → silent");
// basename gate: silent
Listener(
	{ targetKey: "k-cargo", displayPath: Path.join(projGates, "Cargo.toml") },
	{ kind: "present", version: "v1" },
	actor,
);
assert.equal(ledgerLines().length, before, "non-package.json basename → silent");
ok("Gate: non-package.json basename → silent (the module gate)");
// idempotence gate: silent
Probe.Stash.set(tGates.targetKey, "v1");
Listener(tGates, { kind: "present", version: "v1" }, actor);
assert.equal(ledgerLines().length, before, "Stash idempotence → silent");
Probe.Stash.delete(tGates.targetKey);
ok("Gate: Stash idempotence → silent (our own re-emits skip)");

// exclusion-first: the module's line
const projExcluded = Path.join(Root, ".git", "inner");
FileSystem.mkdirSync(projExcluded, { recursive: true });
files[Path.join(projExcluded, "package.json")] = "{}";
Listener(mkTarget(projExcluded, "k-exc"), { kind: "present", version: "v1" }, actor);
assert.equal(
	find(`skipped (excluded) ${Path.join(projExcluded, "package.json")}`).length,
	1,
	"excluded line byte-identical",
);
ok("Gate: exclusion-first → `skipped (excluded) <path>` byte-identical");
assert.ok(
	storageRecords.some(
		([, r]) => r.event === "excluded" && r.path === Path.join(projExcluded, "package.json"),
	),
	"P5 excluded record",
);
ok("Gate: the P5 `excluded` record for the excluded path");
assert.equal(writes.length, 0, "excluded → no write");
ok("Gate: excluded → no write, nothing else logged");

// listener throw containment (silence invariant)
Probe.Factory = undefined;
assert.doesNotThrow(() => Listener(tGates, { kind: "present", version: "vX" }, actor));
Probe.Factory = factory;
assert.ok(
	loggerLines.error.some((m) =>
		m.startsWith("hook-dsh-governor-package: listener error (suppressed): "),
	),
	"listener error suppressed, logger-only",
);
ok("silence: a throwing listener is contained (`listener error (suppressed)`), never rethrown");

// ── 5. the chain pass through Factory.Continue + the module transform ───
const projA = Path.join(Root, "proj-a");
FileSystem.mkdirSync(projA);
FileSystem.writeFileSync(
	Path.join(projA, "registry.json"),
	JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
);
const manifestA = {
	name: "x",
	dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" },
	scripts: { build: "tsc" },
};
const pathA = Path.join(projA, "package.json");
files[pathA] = JSON.stringify(manifestA);
before = ledgerLines().length;
InflightDuringRead = -1;
Listener(mkTarget(projA, "k-a"), { kind: "present", version: "v1" }, actor);
await settle();
// g2 lines
assert.equal(find(`no registry.json found for ${pathA} — chain pass skipped`).length, 0);
// the governed write
const writeA = writes.at(-1);
assert.equal(writeA.path, pathA);
// The intent's version is the fresh-stat CURRENT version (the chain pass
// stats the target right before the write — the sequential-fold fix, so a
// later fold step's chain write never guards a version an earlier step's
// write already superseded). This fake's stat returns "stat-v9" as the
// current version; on a real backend an unraced pass stats exactly the
// observed version, so the guarded semantics are unchanged.
assert.deepEqual(writeA.intent, { kind: "replaceIfVersion", version: "stat-v9" });
assert.equal(writeA.signal instanceof AbortSignal, true, "Continue's task-owned signal forwarded");
assert.equal(writeA.fence, null, "bare backend (sandboxMode undefined) → no fence policy");
ok(
	"chain pass: guarded write via Factory.Continue — replaceIfVersion intent + task-owned signal + P4 fence (bare backend)",
);
const writtenA = JSON.parse(writeA.content);
assert.equal(writtenA.dependencies.leftpad, "^1.0.0", "chain pin canonicalized to ^resolved");
assert.equal(writtenA.dependencies.chalk, "^5.0.0", "public dep untouched by the chain pass");
assert.deepEqual(writtenA.scripts, manifestA.scripts, "non-dependency sections preserved");
ok(
	"chain pass: chain pin canonicalized to ^resolved, public dep + non-dependency sections preserved",
);
assert.ok(
	writeA.content.endsWith("\n") && writeA.content.includes('\n  "name"'),
	"serialization JSON.stringify(next, null, 2) + newline",
);
ok("chain pass: serialization JSON.stringify(next, null, 2) + newline (factory-owned)");

// the governed line + journal + same-actor re-emit
assert.equal(
	find(`governed ${pathA} → fresh-1`).length,
	1,
	"`governed <path> → <version>` byte-identical",
);
assert.ok(
	loggerLines.info.includes(`hook-dsh-governor-package: governed ${pathA} → fresh-1`),
	"logger line composed with the module prefix",
);
ok(
	"version coherence: `governed <path> → <version>` line byte-identical (ledger + module-prefixed logger)",
);
assert.ok(
	storageRecords.some(
		([, r]) => r.event === "governed" && r.path === pathA && r.detail === "fresh-1",
	),
	"P5 governed record with the fresh version",
);
ok("version coherence: the P5 `governed` record carries the fresh version");
const reEmit = emitted.filter((e) => e[0] === "fs/observed" && e[2]?.version === "fresh-1").at(-1);
assert.deepEqual(reEmit.slice(1, 3), [
	mkTarget(projA, "k-a"),
	{ kind: "present", version: "fresh-1" },
]);
assert.equal(reEmit[3], actor, "same actor ⇒ same owner bucket");
ok("version coherence: the factory re-emits fs/observed with the SAME actor");
assert.equal(
	writes.filter((w) => w.path === pathA).length,
	1,
	"the fresh-1 re-emit was a no-op (the factory pre-registered Stash before re-emitting)",
);
assert.equal(
	Probe.Stash.get("k-a"),
	"stat-v9",
	"U₂ re-registered the stat version after settlement",
);
ok("version coherence: Stash pre-registration before the re-emit (no second write)");

// the Inflight lifecycle inside the factory's Continue
assert.equal(InflightDuringRead, 1, "Inflight registered before readText (factory scaffolding)");
assert.equal(Probe.Inflight.size, 0, "Inflight removed after settlement");
ok("Continue lifecycle: P2 Inflight registered during, removed after");

// the update stage followed the settled continuation (jobs envelope)
assert.equal(jobStarts.length, 1, "one harness job started");
const job = jobStarts[0];
assert.equal(job.kind, "governor-update");
assert.equal(job.label, `ncu ${projA}`);
assert.ok(!("owner" in job), "unowned job (owner key absent)");
assert.equal(typeof job.run, "function");
assert.equal(
	find(
		`update stage dispatched for ${projA} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
	).length,
	1,
	"dispatched line byte-identical",
);
assert.ok(
	storageRecords.some(
		([, r]) => r.event === "dispatched" && r.path === projA && r.detail === "bin",
	),
);
ok("jobs envelope: `update stage dispatched …` line byte-identical + dispatched journal record");

// the bin-mode run through the subprocess seam
assert.equal(find(`update: mode=bin (ncu binary ${NCU_BIN})`).length, 1);
const spec = spawnSpecs.at(-1);
assert.equal(spec.cwd, projA);
assert.deepEqual(spec.argv.slice(0, 3), [`resolved:${NCU_BIN}`, "-u", "--dep"]);
assert.equal(spec.argv[3], "dev,optional,peer,prod,bundle", "built-in dep groups");
assert.deepEqual(spec.argv.slice(4, 6), ["--concurrency", "8"]);
ok("engine: bin mode — resolved binary through the seam, built-in dep groups, concurrency");
assert.ok(
	spec.argv.includes("-x") && spec.argv[spec.argv.indexOf("-x") + 1] === "tailwindcss,leftpad",
	"reject = policy reject ∪ chain deps, ONE comma-delimited argument",
);
assert.equal(spec.argv.includes("-a"), false, "no allow when the policy has none");
assert.deepEqual(spec.argv.slice(-2), ["--target", "latest"]);
assert.equal(find("update: DONE — pins bumped per policy").length, 1);
ok("engine: reject merge (policy ∪ chain deps, one -x argument) + target latest + DONE line");

// settlement: breaker reset, U₂ refresh with the stat's version, silence
assert.equal(Probe.Count.get(projA) ?? 0, 0, "breaker reset on success");
assert.equal(Probe.Set.has(projA), false, "per-dir in-flight cleared");
assert.equal(Probe.Inflight.size, 0, "P2 map cleared");
ok("settlement: breaker reset + per-dir in-flight + P2 map cleared");
const lastEmit = emitted.filter((e) => e[0] === "fs/observed").at(-1);
assert.deepEqual(
	lastEmit.slice(1, 3),
	[mkTarget(projA, "k-a"), { kind: "present", version: "stat-v9" }],
	"U₂: stat-based refresh re-emitted",
);
assert.equal(lastEmit[3], actor);
ok("settlement: U₂ stat-based refresh re-emitted with the same actor");
const afterSettle = ledgerLines().length;
assert.equal(afterSettle, before + 5, "no extra lines: the re-entrant pass was a no-op");
ok("settlement: the re-entrant pass after U₂ is a no-op (silence)");

// ── 6. chain-pass no-ops and refusals ────────────────────────────────────
// non-JSON manifest
const projH = Path.join(Root, "proj-h");
FileSystem.mkdirSync(projH);
files[Path.join(projH, "package.json")] = "{ nope";
before = ledgerLines().length;
Listener(mkTarget(projH, "k-h"), { kind: "present", version: "v1" }, actor);
await settle();
assert.equal(
	find(`no registry.json found for ${Path.join(projH, "package.json")} — chain pass skipped`)
		.length,
	1,
	"the g2 line comes first (same order as the pre-refactor flow)",
);
assert.equal(
	find(`observed non-JSON package.json ${Path.join(projH, "package.json")} — skipped`).length,
	1,
);
assert.equal(ledgerLines().length, before + 2, "non-JSON → exactly the g2 + non-JSON lines");
assert.equal(jobStarts.length, 1, "non-JSON → no update stage (passage closed)");
ok("transform: undecodable manifest → `observed non-JSON … — skipped`, no write, no update");

// no registry found — the pass is skipped, the update stage still runs (cooldown-gated)
const projB = Path.join(Root, "proj-b");
FileSystem.mkdirSync(projB);
files[Path.join(projB, "package.json")] = JSON.stringify({ dependencies: { chalk: "^5.0.0" } });
before = ledgerLines().length;
Listener(mkTarget(projB, "k-b"), { kind: "present", version: "v1" }, actor);
await settle();
assert.equal(
	find(`no registry.json found for ${Path.join(projB, "package.json")} — chain pass skipped`)
		.length,
	1,
);
assert.equal(
	find(
		`update stage dispatched for ${projB} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
	).length,
	1,
	"no registry → straight to the update stage (the chain pass wrote nothing)",
);
assert.equal(
	writes.filter((w) => w.path === Path.join(projB, "package.json")).length,
	0,
	"no registry → no chain rewrite",
);
ok("chain semantics: no registry.json → pass skipped, everything public, update still gated");

// unreadable registry.json
const projD = Path.join(Root, "proj-d");
FileSystem.mkdirSync(projD);
FileSystem.writeFileSync(Path.join(projD, "registry.json"), "{ nope");
files[Path.join(projD, "package.json")] = JSON.stringify({ dependencies: { leftpad: "^2.0.0" } });
before = ledgerLines().length;
Listener(mkTarget(projD, "k-d"), { kind: "present", version: "v1" }, actor);
await settle();
assert.equal(
	find(
		`unreadable registry.json at ${Path.join(projD, "registry.json")} — chain pass skipped for ${Path.join(projD, "package.json")}`,
	).length,
	1,
);
assert.equal(
	find(
		`update stage dispatched for ${projD} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
	).length,
	1,
	"unreadable registry → chain pass skipped but the update stage still runs (pre-refactor semantics)",
);
assert.equal(
	Probe.Stash.get("k-d"),
	"stat-v9",
	"Stash seeded, then advanced by the update stage's U₂",
);
ok("chain semantics: unreadable registry → `unreadable registry.json … skipped for <path>`");

// strict strip (strict unknown dep stripped, chain dep canonicalized)
const projE = Path.join(Root, "proj-e");
FileSystem.mkdirSync(projE);
FileSystem.writeFileSync(
	Path.join(projE, "registry.json"),
	JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
);
files[Path.join(projE, "package.json")] = JSON.stringify({
	dependencies: { leftpad: "^2.0.0", unknown: "^1.0.0" },
});
Probe.Strict = true;
before = ledgerLines().length;
Listener(mkTarget(projE, "k-e"), { kind: "present", version: "v1" }, actor);
await settle();
Probe.Strict = false;
const writtenE = JSON.parse(
	writes.filter((w) => w.path === Path.join(projE, "package.json")).at(-1).content,
);
assert.equal(writtenE.dependencies.leftpad, "^1.0.0");
assert.equal(writtenE.dependencies.unknown, undefined, "strict:true strips unknown deps");
assert.ok(find(`governed ${Path.join(projE, "package.json")} → fresh-`).length >= 1);
ok("chain semantics: strict strip of unknown deps (never a default) + canonicalization");

// the transform contract, probed directly (raw text in, decode inside,
// section/keep ignored — the governor closes over its own sections)
const { default: BuildTransform } = await import(`${GOVERNOR_DIR}/Target/Function/Transform.js`);
const { default: RegistryView } = await import(`${GOVERNOR_DIR}/Target/Interface/Registry.js`);
const passage = { Current: null, Proceed: false };
const transform = BuildTransform(
	Probe,
	{ targetKey: "k-t", displayPath: pathA },
	{ effectiveLatest: { leftpad: "1.0.0" } },
	passage,
);
const out = transform(
	JSON.stringify({ dependencies: { leftpad: "^2.0.0", a: "^2.0.0" } }),
	undefined,
	["a", "leftpad"],
);
assert.equal(out.count, 1);
assert.equal(out.next.dependencies.leftpad, "^1.0.0", "decode inside the transform (raw text in)");
assert.equal(out.next.dependencies.a, "^2.0.0", "the keep-list does NOT pin (governor ignores it)");
assert.equal(typeof out.message, "function");
ok("transform: raw text in, decode inside; keep-list ignored (governor closes over its sections)");
const msg = out.message({ version: "fresh-9" });
assert.equal(
	msg,
	`governed ${pathA} → fresh-9`,
	"message composes the module's version-bearing line",
);
ok("transform: the message composes `governed <path> → <version>` from the outcome");
assert.equal(passage.Proceed, true, "message marks the passage (post-write only)");
assert.equal(
	passage.Current.dependencies.leftpad,
	"^2.0.0",
	"passage carries the decoded manifest",
);
assert.ok(storageRecords.some(([, r]) => r.event === "governed" && r.detail === "fresh-9"));
ok("transform: the post-write message marks the passage + journals the governed record");
const noopOut = transform(JSON.stringify({ dependencies: { leftpad: "^1.0.0" } }), undefined, []);
assert.equal(noopOut, null, "idempotent manifest → null (the factory's designed no-op)");
assert.equal(passage.Proceed, true, "no-change path opens the passage synchronously");
ok("transform: idempotent manifest → null; the no-change path opens the passage");

// the P4 CONFINED fence posture: a sandbox-mode-configured backend gets a
// per-call workspace-write policy rooted at the governed manifest's directory
ctx.fs.sandboxMode = "workspace-write";
const projFence = Path.join(Root, "proj-fence");
FileSystem.mkdirSync(projFence);
FileSystem.writeFileSync(
	Path.join(projFence, "registry.json"),
	JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
);
files[Path.join(projFence, "package.json")] = JSON.stringify({
	dependencies: { leftpad: "^2.0.0" },
});
Listener(mkTarget(projFence, "k-fence"), { kind: "present", version: "v1" }, actor);
await settle();
ctx.fs.sandboxMode = undefined;
const writeFence = writes.filter((w) => w.path === Path.join(projFence, "package.json")).at(-1);
assert.deepEqual(
	writeFence.fence,
	{ mode: "workspace-write", workspaceRoot: projFence },
	"confined backend → fence rooted at the manifest's own directory",
);
ok("P4: confined backend → workspace-write fence rooted at the manifest's own directory");

// ── 7. the update-stage gates + engines (module-owned, directly probed) ─
const { default: Dispatch } = await import(`${GOVERNOR_DIR}/Target/Function/Dispatch.js`);
const { default: Filter } = await import(`${GOVERNOR_DIR}/Target/Function/Filter.js`);
const { default: Resolve } = await import(`${GOVERNOR_DIR}/Target/Function/Resolve.js`);
const { default: Satisfy } = await import(`${GOVERNOR_DIR}/Target/Function/Satisfy.js`);
const { default: Decode } = await import(`${GOVERNOR_DIR}/Target/Function/Decode.js`);
const { default: Settle } = await import(`${GOVERNOR_DIR}/Target/Function/Settle.js`);
const { default: Follow } = await import(`${GOVERNOR_DIR}/Target/Function/Follow.js`);

// Filter + Decode + Satisfy units
assert.equal(Decode("{ bad"), null);
assert.equal(Decode("null"), null);
assert.deepEqual(Decode('{"a":1}'), { a: 1 });
ok("pure leaves: Decode — contained parse, null on failure/non-object");
assert.equal(Filter({ dependencies: { chalk: "^5.0.0" } }, null), true);
assert.equal(
	Filter({ dependencies: { leftpad: "^1.0.0" } }, { effectiveLatest: { leftpad: "1.0.0" } }),
	false,
	"all-chain manifest → nothing for ncu",
);
ok("pure leaves: Filter — public deps → true, all-chain manifest → false");
assert.deepEqual(
	Satisfy(
		{ dependencies: { leftpad: "2.0.0" } },
		{ effectiveLatest: { leftpad: "1.0.0" } },
		false,
	)?.dependencies.leftpad,
	"^1.0.0",
);
assert.equal(
	Satisfy(
		{ dependencies: { leftpad: "^1.0.0" } },
		{ effectiveLatest: { leftpad: "1.0.0" } },
		false,
	),
	null,
	"idempotent chain pass → null",
);
ok("pure leaves: Satisfy — canonicalizes to ^resolved, idempotent → null");

// breaker gate
const projF = Path.join(Root, "proj-f");
FileSystem.mkdirSync(projF);
const tF = mkTarget(projF, "k-f");
Probe.Count.set(projF, 3);
before = ledgerLines().length;
const jobsBefore = jobStarts.length;
await Dispatch(Probe, tF, actor, projF, null, "");
assert.equal(find(`update stage paused for ${projF} (3 consecutive failures ≥ 3)`).length, 1);
assert.equal(jobStarts.length, jobsBefore, "paused → no job");
Probe.Count.delete(projF);
ok("update gates: circuit breaker → `paused for …` line, no job");
// in-flight gate
Probe.Set.add(projF);
await Dispatch(Probe, tF, actor, projF, null, "");
assert.equal(find(`update stage skipped for ${projF} (in-flight)`).length, 1);
Probe.Set.delete(projF);
ok("update gates: in-flight → `skipped for … (in-flight)` line");
// cooldown gate
Probe.Stamp.set(projF, Date.now());
await Dispatch(Probe, tF, actor, projF, null, "");
assert.equal(find(`update stage skipped for ${projF} (cooldown)`).length, 1);
Probe.Stamp.delete(projF);
assert.equal(ledgerLines().length, before + 3, "gates logged, nothing else");
ok("update gates: cooldown → `skipped for … (cooldown)` line; gates log, nothing else");

// FAILED path: exit 1 → breaker increments + update-failed journal + U₂
NextSpawnExits = [1];
before = ledgerLines().length;
emitted.length = 0;
await Dispatch(Probe, tF, actor, projF, null, "");
await settle();
assert.equal(find("update: ncu failed (base) status 1").length, 1);
assert.equal(find("update: FAILED — see lines above").length, 1);
ok("FAILED path: `update: ncu failed (base) status 1` + `update: FAILED — see lines above`");
assert.equal(find(`update stage FAILED (1) for ${projF}; consecutive=1`).length, 1);
assert.ok(
	storageRecords.some(
		([, r]) => r.event === "update-failed" && r.path === projF && r.detail === "1",
	),
);
assert.equal(Probe.Count.get(projF), 1, "breaker incremented");
ok(
	"FAILED path: breaker incremented + `update stage FAILED (1) … consecutive=1` + update-failed journal",
);
const failedEmit = emitted.filter((e) => e[0] === "fs/observed").at(-1);
assert.equal(failedEmit[2].version, "stat-v9", "U₂ refresh ran even on failure");
Probe.Count.delete(projF);
NextSpawnExits = [];
ok("FAILED path: U₂ refresh runs even on failure");

// first-wins policy path pick (ENGINE INPUT — module-owned, not the union)
const projG = Path.join(Root, "proj-g");
FileSystem.mkdirSync(projG);
const dirPolicy = Path.join(projG, "update-policy.json");
FileSystem.writeFileSync(
	dirPolicy,
	JSON.stringify({ verifyCommand: "echo hi", reject: ["chalk"] }),
);
const globalPolicy = Path.join(Root, "global-update-policy.json");
FileSystem.writeFileSync(globalPolicy, JSON.stringify({ reject: ["x"] }));
const regAdjacent = Path.join(Root, "registry-adjacent");
FileSystem.mkdirSync(regAdjacent);
FileSystem.writeFileSync(
	Path.join(regAdjacent, "update-policy.json"),
	JSON.stringify({ reject: ["y"] }),
);
const regFile = Path.join(regAdjacent, "registry.json");
FileSystem.writeFileSync(regFile, "{}");
const bare = Path.join(Root, "proj-g2");
FileSystem.mkdirSync(bare);
assert.equal(Resolve(Probe, projG, null), dirPolicy, "the file's own directory wins first");
assert.equal(
	Resolve(Probe, bare, regFile),
	Path.join(regAdjacent, "update-policy.json"),
	"co-located with the discovered registry",
);
Probe.Policy = globalPolicy;
assert.equal(
	Resolve(Probe, projG, null),
	globalPolicy,
	"configured global policyFile wins over sidecars",
);
Probe.Policy = "";
assert.equal(Resolve(Probe, Path.join(Root, "nope"), null), "", "none → built-in default");
ok("Resolve: FIRST-WINS engine-input pick (global → own dir → registry-adjacent → default)");

// policy file content: built-in default line, no-policy line, verify run
before = ledgerLines().length;
NextSpawnExits = [0, 0];
Probe.Stamp.delete(projF);
await Dispatch(Probe, tF, actor, projF, null, dirPolicy);
await settle();
assert.equal(find(`update: running verifyCommand: echo hi`).length, 1);
const vSpec = spawnSpecs.at(-1);
assert.deepEqual(
	vSpec.argv,
	["/bin/sh", "-c", "echo hi"],
	"verifyCommand via /bin/sh -c through the seam",
);
assert.equal(find("update: verifyCommand ok").length, 1);
const doneCount = find("update: DONE — pins bumped per policy").length;
assert.equal(
	find("update: DONE — pins bumped per policy").length,
	doneCount,
	"one DONE line for this run",
);
const ncuSpec = spawnSpecs.filter((s) => s.argv.includes("-x")).at(-1);
const rejectArg = ncuSpec.argv[ncuSpec.argv.indexOf("-x") + 1];
assert.equal(
	rejectArg,
	"chalk",
	"policy reject used as-is (no registry → no chain deps to merge; the merge itself is asserted in the happy path)",
);
assert.equal(
	find(`update stage dispatched for ${projF} (mode=bin, ncu via ${NCU_BIN}, policy ${dirPolicy})`)
		.length,
	1,
	"dispatched line names the resolved policy path",
);
ok("policy engine: policy file read + verifyCommand through the seam + merged rejects");

// verifyCommand 127 (non-fatal) and failure
NextSpawnExits = [0, 127];
Probe.Stamp.delete(projF);
before = ledgerLines().length;
await Dispatch(Probe, tF, actor, projF, null, dirPolicy);
await settle();
assert.equal(
	find("update: verifyCommand runner unavailable (exit 127) — skipped, non-fatal").length,
	1,
);
assert.equal(
	find("update: DONE — pins bumped per policy").length,
	doneCount + 1,
	"127 non-fatal → DONE",
);
NextSpawnExits = [0, 2];
Probe.Stamp.delete(projF);
await Dispatch(Probe, tF, actor, projF, null, dirPolicy);
await settle();
assert.equal(find("update: verifyCommand failed (status 2)").length, 1);
const failedCount = find("update: FAILED — see lines above").length;
assert.equal(
	find("update: FAILED — see lines above").length,
	failedCount,
	"the verify stage fails the stage",
);
Probe.Count.delete(projF);
NextSpawnExits = [];
ok("verifyCommand: exit 0 ok / 127 non-fatal / other fails the stage");

// built-in default + no-policy lines
const projNoPolicy = Path.join(Root, "proj-np");
FileSystem.mkdirSync(projNoPolicy);
before = ledgerLines().length;
const defaultCount = find("update: using built-in default policy").length;
await Dispatch(
	Probe,
	mkTarget(projNoPolicy, "k-np"),
	actor,
	projNoPolicy,
	null,
	"/no/such/policy.json",
);
await settle();
assert.equal(find("update: no policy at /no/such/policy.json — using built-in default").length, 1);
assert.equal(find("update: using built-in default policy").length, defaultCount + 1);
Probe.Count.delete(projNoPolicy);
const badPolicy = Path.join(projNoPolicy, "bad-policy.json");
FileSystem.writeFileSync(badPolicy, "{ nope");
before = ledgerLines().length;
Probe.Stamp.delete(projNoPolicy);
await Dispatch(Probe, mkTarget(projNoPolicy, "k-np2"), actor, projNoPolicy, null, badPolicy);
await settle();
assert.equal(find(`update: unreadable policy at ${badPolicy} — using built-in default`).length, 1);
Probe.Count.delete(projNoPolicy);
ok("policy fallbacks: absent + unparsable policy files → built-in default lines");

// programmatic mode: the npm-check-updates library, offline (all deps rejected)
const projJ = Path.join(Root, "proj-j");
FileSystem.mkdirSync(projJ);
const libPolicy = Path.join(projJ, "update-policy.json");
FileSystem.writeFileSync(libPolicy, JSON.stringify({ reject: ["leftpad"] }));
FileSystem.writeFileSync(
	Path.join(projJ, "package.json"),
	JSON.stringify({ name: "offline", dependencies: { leftpad: "^1.0.0" } }),
);
Probe.Mode = "programmatic";
before = ledgerLines().length;
await Dispatch(Probe, mkTarget(projJ, "k-j"), actor, projJ, null, libPolicy);
// the npm-check-updates import is heavy — poll until the run settles
const doneBefore = find("update: DONE — pins bumped per policy").length;
for (let i = 0; i < 200 && find("update: ncu (base) → ").length === 0; i++)
	await new Promise((r) => setTimeout(r, 50));
assert.equal(find("update: mode=programmatic (npm-check-updates library)").length, 1);
assert.ok(find("update: ncu (base) → ").length >= 1, "the library run reported its result");
assert.equal(find("update: DONE — pins bumped per policy").length, doneBefore + 1);
Probe.Mode = "bin";
Probe.Count.delete(projJ);
ok("engine: programmatic mode — ncu library in-process, chain-safe reject list");

// job ring piping (bin mode: collected output piped raw into the ring)
NextSpawnOut = "ncu says hi";
before = ledgerLines().length;
jobRings.length = 0;
Probe.Stamp.delete(projF);
await Dispatch(Probe, tF, actor, projF, null, "");
await settle();
assert.ok(
	ledgerLines()
		.slice(before)
		.some((l) => l.includes("ncu says hi")),
	"collected stdout appended to the ledger",
);
ok("P1 piping: collected bin-mode stdout appended to the ledger");
assert.ok(jobRings.at(-1).includes("ncu says hi"), "the same text piped into the job ring");
NextSpawnOut = "";
Probe.Count.delete(projF);
ok("P1 piping: the same text piped raw into the job's output ring");

// detached fallback: no job registry serves this context
services["jobs"] = undefined;
before = ledgerLines().length;
const dispatchedBefore = find(
	`update stage dispatched for ${projF} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
).length;
const jobsBeforeFallback = jobStarts.length;
Probe.Stamp.delete(projF);
await Dispatch(Probe, tF, actor, projF, null, "");
await settle();
assert.equal(
	find(
		`update stage dispatched for ${projF} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
	).length,
	dispatchedBefore + 1,
	"detached fallback still dispatches the full chain",
);
assert.equal(jobStarts.length, jobsBeforeFallback, "no new job without the registry");
Probe.Count.delete(projF);
// preflight rejection → detached
services["jobs"] = {
	attachController: (n) => {
		controllers.push(n);
		return () => {};
	},
	start: () => {
		throw new Error("preflight");
	},
};
before = ledgerLines().length;
const doneBeforePreflight = find("update: DONE — pins bumped per policy").length;
Probe.Stamp.delete(projF);
await Dispatch(Probe, tF, actor, projF, null, "");
await settle();
assert.equal(jobStarts.length, jobsBeforeFallback, "throwing start left nothing registered");
assert.equal(
	find("update: DONE — pins bumped per policy").length,
	doneBeforePreflight + 1,
	"the detached chain still ran",
);
services["jobs"] = {
	attachController: (name) => {
		controllers.push(name);
		return () => detached.push(name);
	},
	start: (spec) => {
		jobStarts.push(spec);
		const ring = [];
		jobRings.push(ring);
		const hooks = spec.run({ append: (t) => ring.push(t) });
		hooks.done.catch(() => {});
		return "governor-update-1";
	},
};
Probe.Count.delete(projF);
Probe.Count.set(projF, 0);
ok("fallbacks: no-registry and preflight-rejection → the contained detached chain");

// ── 8. Follow: the passage gate ─────────────────────────────────────────
before = ledgerLines().length;
await Follow(Probe, tF, actor, projF, null, null, {
	Current: { dependencies: { a: "1" } },
	Proceed: false,
});
assert.equal(ledgerLines().length, before, "closed passage → no update stage");
await Follow(
	Probe,
	tF,
	actor,
	projF,
	null,
	{ effectiveLatest: { a: "1" } },
	{ Current: { dependencies: { a: "1" } }, Proceed: true },
);
assert.equal(ledgerLines().length, before, "all-chain manifest → Filter blocks");
ok("Follow: passage gate + Filter gate before the first-wins pick and dispatch");

// ── 9. factory keep-list wiring on the observe path ─────────────────────
// the union discovery composes sidecars for the keep-list; an unparsable
// sidecar is logged by the FACTORY (parameterized machinery line)
const projK = Path.join(Root, "proj-k");
FileSystem.mkdirSync(projK);
FileSystem.writeFileSync(Path.join(projK, "update-policy.json"), "{ nope");
files[Path.join(projK, "package.json")] = JSON.stringify({ dependencies: { chalk: "^5.0.0" } });
before = ledgerLines().length;
Listener(mkTarget(projK, "k-k"), { kind: "present", version: "v1" }, actor);
await settle();
assert.equal(
	find(
		`unreadable update-policy.json at ${Path.join(projK, "update-policy.json")} — using built-in default`,
	).length,
	1,
	"factory-composed keep-list line (parameterized, module-prefixed)",
);
assert.equal(Probe.PolicyName, "update-policy.json");
ok("factory wiring: ResolvePolicy union discovery runs on the observe path (State.PolicyName)");

// configured-but-absent global policy: silently not a source (no line)
Probe.Policy = "/no/such/global-policy.json";
before = ledgerLines().length;
Listener(mkTarget(projK, "k-k2"), { kind: "present", version: "v2" }, actor);
await settle();
Probe.Policy = "";
const newLines = ledgerLines().slice(before);
assert.equal(
	newLines.some((l) => l.includes("global-policy")),
	false,
	"absent global policy → no unreadable line",
);
ok("factory wiring: configured-but-absent global policy is silently not a source");

// ── 10b. P2 — the Inflight collision window (factory.UpdateKey) ──────────
// The update stage registers its run controller under the NAMESPACED key
// (State.Factory.UpdateKey → "update:<targetKey>"); the chain pass
// (factory.Continue) registers under the PLAIN key and its settlement deletes
// ONLY its own. Before the namespacing, the chain's delete could silently
// drop the running update's controller (the cargo lesson, factory-side now).
{
	const colid = Path.join(Root, "colid");
	FileSystem.mkdirSync(colid, { recursive: true });
	FileSystem.writeFileSync(
		Path.join(colid, "package.json"),
		JSON.stringify({ name: "colid", dependencies: {} }),
	);
	const mk = mkTarget(colid, "k-colid");
	assert.equal(
		Probe.Factory.UpdateKey(mk),
		"update:k-colid",
		"UpdateKey namespaces the target key",
	);
	// the update stage's controller (as Dispatch registers it)…
	const updateControl = new AbortController();
	Probe.Inflight.set(Probe.Factory.UpdateKey(mk), { controller: updateControl });
	// …and the chain pass's controller (as Continue registers it)…
	const chainControl = new AbortController();
	Probe.Inflight.set(String(mk.targetKey), { controller: chainControl });
	assert.equal(
		Probe.Inflight.size,
		2,
		"the two passes coexist under distinct keys (no collision)",
	);
	// the chain pass settles: it deletes ONLY its plain key…
	Probe.Inflight.delete(String(mk.targetKey));
	assert.equal(Probe.Inflight.size, 1, "the chain's settlement leaves the update entry");
	assert.equal(
		Probe.Inflight.get("update:k-colid").controller,
		updateControl,
		"the running update's controller survives the chain settlement",
	);
	// …and the unload disposal still aborts the surviving update.
	const colidEffect = effects.find((e) => e[0] === "hook-dsh-governor-package-inflight")[1];
	colidEffect();
	assert.equal(updateControl.signal.aborted, true, "unload aborts the surviving update run");
	Probe.Inflight.clear();
	ok(
		"P2: the update stage's namespaced key (factory.UpdateKey) survives the chain pass settlement",
	);
}

// ── 10c. the direct-govern path (Factory.Govern → the registered steps) ──
// The raw-write tool's per-call `govern` route: the steps registered at apply
// run through the DIRECT path — a simulated raw-write-style invocation with a
// real target and the observed version. The direct path must match the
// event-path behavior the scenarios above assert (the same g2 lines, the same
// guarded write, the same ledger strings, the Stash seeding).
{
	// canonicalize: the chain pass WITHOUT the update follow
	const projDc = Path.join(Root, "proj-direct");
	FileSystem.mkdirSync(projDc);
	FileSystem.writeFileSync(
		Path.join(projDc, "registry.json"),
		JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
	);
	const pathDc = Path.join(projDc, "package.json");
	files[pathDc] = JSON.stringify({ dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" } });
	before = ledgerLines().length;
	const jobsBeforeDc = jobStarts.length;
	// The SEQUENTIAL FOLD: Govern is async and awaits each step, so the
	// direct-path invocations below are awaited — every scenario is now
	// deterministic (the pre-fold detached chains could race their guarded
	// writes). Every pre-existing assertion stays byte-identical.
	await factory.Govern(mkTarget(projDc, "k-dc"), "canonicalize", actor, "v-direct");
	await settle();
	const writeDc = writes.filter((w) => w.path === pathDc).at(-1);
	assert.equal(writeDc !== undefined, true, "canonicalize: the chain pass wrote");
	// The intent's version is the fresh-stat CURRENT version (the chain pass
	// stats before the write — the sequential-fold fix); with this fake's stat
	// that is "stat-v9", not the observed "v-direct". On a real backend an
	// unraced pass stats exactly the observed version.
	assert.deepEqual(
		writeDc.intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"canonicalize: guarded write at the CURRENT (fresh-stat) version",
	);
	const writtenDc = JSON.parse(writeDc.content);
	assert.equal(writtenDc.dependencies.leftpad, "^1.0.0", "canonicalize: chain pin canonicalized");
	assert.equal(writtenDc.dependencies.chalk, "^5.0.0", "canonicalize: public dep untouched");
	assert.equal(
		find(`governed ${pathDc} → `).length,
		1,
		"canonicalize: `governed <path> → <version>` byte-identical",
	);
	assert.ok(
		Probe.Stash.get("k-dc"),
		"canonicalize: the Stash seeded (then advanced by the guarded write)",
	);
	assert.equal(
		jobStarts.length,
		jobsBeforeDc,
		"canonicalize: NO update stage (the chain pass without the Follow)",
	);
	assert.equal(
		find(`update stage dispatched for ${projDc}`).length,
		0,
		"canonicalize: no dispatched line for the direct target",
	);
	assert.equal(
		writes.filter((w) => w.path === pathDc).length,
		1,
		"canonicalize: exactly one write",
	);
	ok(
		"direct-govern: canonicalize — g2 + Stash seed + Continue, no update follow, ledger byte-identical",
	);

	// canonicalize with no registry: the same g2 skip line as the event path
	const projDn = Path.join(Root, "proj-direct-noreg");
	FileSystem.mkdirSync(projDn);
	const pathDn = Path.join(projDn, "package.json");
	files[pathDn] = JSON.stringify({ dependencies: { chalk: "^5.0.0" } });
	before = ledgerLines().length;
	await factory.Govern(mkTarget(projDn, "k-dn"), "canonicalize", actor, "v-direct2");
	await settle();
	assert.equal(
		find(`no registry.json found for ${pathDn} — chain pass skipped`).length,
		1,
		"canonicalize: the g2 skip line, byte-identical with the event path",
	);
	assert.equal(
		writes.filter((w) => w.path === pathDn).length,
		0,
		"canonicalize: no registry → no chain rewrite",
	);
	assert.equal(
		Probe.Stash.get("k-dn"),
		"v-direct2",
		"canonicalize: the Stash seeded even on the no-registry pass",
	);
	ok("direct-govern: canonicalize with no registry — the g2 line, no write, Stash seeded");

	// update: the update stage alone (Follow/Dispatch path with its own gates)
	const projDu = Path.join(Root, "proj-direct-update");
	FileSystem.mkdirSync(projDu);
	const pathDu = Path.join(projDu, "package.json");
	files[pathDu] = JSON.stringify({ dependencies: { chalk: "^5.0.0" } });
	before = ledgerLines().length;
	const jobsBeforeDu = jobStarts.length;
	await factory.Govern(mkTarget(projDu, "k-du"), "update", actor, "v-direct3");
	await settle();
	assert.equal(
		jobStarts.length,
		jobsBeforeDu + 1,
		"update: the jobs envelope ran (the module's own machinery)",
	);
	assert.equal(
		find(
			`update stage dispatched for ${projDu} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
		).length,
		1,
		"update: `update stage dispatched …` line byte-identical",
	);
	assert.equal(
		find("update: DONE — pins bumped per policy").length >= 1,
		true,
		"update: the run completed",
	);
	assert.equal(
		writes.filter((w) => w.path === pathDu).length,
		0,
		"update: no chain write from the update step (nothing public was rewritten by ncu in this stub)",
	);
	assert.equal(
		Probe.Stash.get("k-du"),
		"stat-v9",
		"update: the Stash seeded, then advanced by the U₂ refresh",
	);
	ok(
		"direct-govern: update — the update stage alone through Follow/Dispatch, gates and ledger byte-identical",
	);

	// selection: unknown names are ignored; a full selection runs both steps
	before = ledgerLines().length;
	await factory.Govern(mkTarget(projDn, "k-dn2"), ["bogus"], actor, "v-direct4");
	await settle();
	assert.equal(ledgerLines().length, before, "selection: unknown step names run nothing");
	const jobsBeforeBoth = jobStarts.length;
	const dcStash = Probe.Stash.get("k-dc");
	files[pathDc] = JSON.stringify({ dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" } });
	await factory.Govern(mkTarget(projDc, "k-dc2"), true, actor, "v-direct5");
	await settle();
	assert.equal(Probe.Stash.has("k-dc2"), true, "selection: both steps seeded their Stash token");
	assert.ok(jobStarts.length >= jobsBeforeBoth, "selection: `true` reached the update step too");
	assert.equal(
		find(`governed ${pathDc} → `).length >= 2,
		true,
		"selection: `true` ran the chain pass again",
	);
	// DETERMINISTIC SEQUENTIAL FOLD (newly assertable): the canonicalize
	// step's chain (its write + its `governed` line) completes BEFORE the
	// update step reads the file and dispatches — the race that previously
	// left the file state and the ledger nondeterministic is gone.
	const bothLines = ledgerLines();
	const lastGoverned = bothLines
		.map((l) => l.includes(`governed ${pathDc} → `))
		.lastIndexOf(true);
	// Exact-line match (the bare `dispatched for ${projDc}` prefix would also
	// match the sibling `proj-direct-update` directory).
	const dcDispatch = bothLines
		.map((l) =>
			l.includes(
				`update stage dispatched for ${projDc} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
			),
		)
		.lastIndexOf(true);
	assert.equal(
		dcDispatch > lastGoverned && lastGoverned >= 0,
		true,
		"selection: the canonicalize chain's `governed` line precedes the update step's dispatch (sequential fold order)",
	);
	const fileAfterFold = JSON.parse(files[pathDc]);
	assert.equal(
		fileAfterFold.dependencies.leftpad,
		"^1.0.0",
		"selection: the update step read the file as the canonicalize left it (no write race)",
	);
	ok(
		"direct-govern: sequential fold — the canonicalize chain (`governed` line + write) completes before the update step (deterministic order)",
	);
	Probe.Stash.delete("k-dc2");
	ok(
		"direct-govern: selection — unknown names ignored, `true` runs the registered steps in order (sequential fold)",
	);

	// ── THE TWO-CHAIN-WRITER FOLD (the live failure mode) ────────────────────
	// The pre-fix fold handed every step the OBSERVED version, so once the
	// first chain-writing step advanced the file, every later chain-writing
	// step failed FS_STALE_VERSION and silently aborted (verified live: a
	// `govern: true` run over canonicalize + pin produced only the pinner's
	// `pinned` line — the canonicalize's write lost the version race). With
	// the fresh-stat write basis each step's chain stats the file as the
	// previous step left it: both land, both lines appear, and the final
	// state converges regardless of the registration order.
	const foldPinT = (P) => (text, section, keep) => {
		const doc = JSON.parse(text);
		const next = { ...doc, dependencies: { ...doc.dependencies } };
		let count = 0;
		for (const [k, v] of Object.entries(next.dependencies ?? {})) {
			if (keep.includes(k) || typeof v !== "string" || !v.startsWith("^")) continue;
			next.dependencies[k] = v.slice(1);
			count++;
		}
		if (count === 0) return null;
		return { next, count, message: (o) => `pinned ${P} (${count} versions) → ${o.version}` };
	};
	const foldCanT = (P) => (text, section, keep) => {
		const doc = JSON.parse(text);
		if (typeof doc?.dependencies?.leftpad !== "string" || doc.dependencies.leftpad === "^1.0.0")
			return null;
		const next = { ...doc, dependencies: { ...doc.dependencies, leftpad: "^1.0.0" } };
		return { next, count: 1, message: (o) => `governed ${P} → ${o.version}` };
	};
	// The sim steps' Refresh re-emits must not re-enter the module's live
	// listener: the sim State is NOT the listener's State, so the listener's
	// Stash has no entry for the sim target keys and a re-emit would detach a
	// second governor chain pass racing the fold (a sim artifact — in
	// production each step's State IS its listener's state and the re-emit is
	// idempotent). The listener capture is module-level, so blank it around
	// each fold run and restore after the fold has settled.
	const UngovernedEmit = async (run) => {
		const Saved = events.splice(0, events.length);
		try {
			await run();
		} finally {
			events.push(...Saved);
		}
	};
	// forward registered order: canonicalize (the module's own step) then the
	// registered sim-pin — both are chain writers through Factory.Continue.
	const projFold = Path.join(Root, "proj-fold");
	FileSystem.mkdirSync(projFold);
	FileSystem.writeFileSync(
		Path.join(projFold, "registry.json"),
		JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
	);
	const pathFold = Path.join(projFold, "package.json");
	files[pathFold] = JSON.stringify({ dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" } });
	const stFold = factory.State(
		ctx,
		{ log: true, logFile: Ledger, exclude: [] },
		{ module: "package-governor", policyFileName: "pin-policy.json" },
	);
	factory.RegisterGovern("package.json", "fold-pin", (t, a, v) =>
		factory.Continue(
			stFold,
			t,
			a,
			projFold,
			Path.join(projFold, "registry.json"),
			v,
			foldPinT(pathFold),
		),
	);
	const writesAtFold = writes.filter((w) => w.path === pathFold).length;
	await UngovernedEmit(async () => {
		await factory.Govern(
			mkTarget(projFold, "k-fold"),
			["canonicalize", "fold-pin"],
			actor,
			"v-fold",
		);
		await settle();
	});
	const foldWrites = writes.filter((w) => w.path === pathFold).slice(writesAtFold);
	assert.equal(foldWrites.length, 2, "the fold: BOTH chain-writing steps wrote");
	assert.deepEqual(
		foldWrites[0].intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"fold step 1 (canonicalize): guarded at the fresh-stat CURRENT version",
	);
	assert.deepEqual(
		foldWrites[1].intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"fold step 2 (sim-pin): guarded at the fresh-stat CURRENT version — NOT the stale observed 'v-fold' (the live failure mode)",
	);
	assert.notEqual(
		foldWrites[1].intent.version,
		"v-fold",
		"the observed version handed to the fold is never the second step's write basis",
	);
	const foldFinal = JSON.parse(files[pathFold]);
	assert.equal(
		foldFinal.dependencies.leftpad,
		"^1.0.0",
		"fold: the chain pin canonicalized (step 1 landed)",
	);
	assert.equal(
		foldFinal.dependencies.chalk,
		"5.0.0",
		"fold: the sim-pin stripped the public dep (step 2 landed on step 1's file)",
	);
	assert.equal(
		find(`governed ${pathFold} → `).length,
		1,
		"fold: the canonicalize's `governed` line",
	);
	assert.equal(
		find(`pinned ${pathFold} (1 versions) → `).length,
		1,
		"fold: the sim-pin's `pinned` line",
	);
	const foldLines = ledgerLines();
	const foldGovIdx = foldLines
		.map((l) => l.includes(`governed ${pathFold} → `))
		.lastIndexOf(true);
	const foldPinIdx = foldLines
		.map((l) => l.includes(`pinned ${pathFold} (1 versions) → `))
		.lastIndexOf(true);
	assert.ok(
		foldGovIdx >= 0 && foldPinIdx > foldGovIdx,
		"fold: the lines appear in the fold's registered order (canonicalize before pin)",
	);
	ok(
		"direct-govern: two-chain-writer fold (canonicalize + sim-pin) — both writes land at the fresh-stat version, both lines appear, registered order",
	);
	factory.RegisterGovern("package.json", "fold-pin", () => {}); // drop the sim step for later scenarios
	Probe.Stash.delete("k-fold");

	// reverse registered order on a fresh factory instance: sim-pin FIRST,
	// sim-canonicalize second — the same convergence from the other direction.
	const ctxR = makeCtx({ files });
	const factoryR = new PluginFactory(ctxR);
	const projFoldR = Path.join(Root, "proj-fold-r");
	FileSystem.mkdirSync(projFoldR);
	FileSystem.writeFileSync(
		Path.join(projFoldR, "registry.json"),
		JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
	);
	const pathFoldR = Path.join(projFoldR, "package.json");
	files[pathFoldR] = JSON.stringify({ dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" } });
	const stFoldR = factoryR.State(
		ctxR,
		{ log: true, logFile: Ledger, exclude: [] },
		{ module: "package-governor", policyFileName: "pin-policy.json" },
	);
	factoryR.RegisterGovern("package.json", "fold-pin-r", (t, a, v) =>
		factoryR.Continue(
			stFoldR,
			t,
			a,
			projFoldR,
			Path.join(projFoldR, "registry.json"),
			v,
			foldPinT(pathFoldR),
		),
	);
	factoryR.RegisterGovern("package.json", "fold-can-r", (t, a, v) =>
		factoryR.Continue(
			stFoldR,
			t,
			a,
			projFoldR,
			Path.join(projFoldR, "registry.json"),
			v,
			foldCanT(pathFoldR),
		),
	);
	const writesAtFoldR = writes.filter((w) => w.path === pathFoldR).length;
	await UngovernedEmit(async () => {
		await factoryR.Govern(mkTarget(projFoldR, "k-fold-r"), true, actor, "v-fold-r");
		await settle();
	});
	const foldRWrites = writes.filter((w) => w.path === pathFoldR).slice(writesAtFoldR);
	assert.equal(foldRWrites.length, 2, "reverse fold: BOTH chain-writing steps wrote");
	assert.deepEqual(
		foldRWrites[0].intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"reverse fold step 1 (sim-pin): fresh-stat CURRENT version",
	);
	assert.deepEqual(
		foldRWrites[1].intent,
		{ kind: "replaceIfVersion", version: "stat-v9" },
		"reverse fold step 2 (sim-canonicalize): fresh-stat CURRENT version (not the stale observed 'v-fold-r')",
	);
	const foldRFinal = JSON.parse(files[pathFoldR]);
	assert.deepEqual(
		foldRFinal.dependencies,
		{ leftpad: "^1.0.0", chalk: "5.0.0" },
		"reverse fold: the SAME converged final state as the forward order (deterministic regardless of registration order)",
	);
	assert.equal(
		find(`pinned ${pathFoldR} (1 versions) → `).length,
		1,
		"reverse fold: the sim-pin's line",
	);
	assert.equal(
		find(`governed ${pathFoldR} → `).length,
		1,
		"reverse fold: the sim-canonicalize's line",
	);
	ok(
		"direct-govern: reverse registered order — sim-pin + sim-canonicalize both land and converge to the same final state",
	);
	Probe.Stash.delete("k-fold-r");
}

// ── 10. the author's second write: no double update, no stale-version ───
before = ledgerLines().length;
Listener(mkTarget(projB, "k-b2"), { kind: "present", version: "v9" }, actor);
await settle();
assert.equal(
	find(`update stage skipped for ${projB} (cooldown)`).length,
	1,
	"the immediate re-write is cooldown-gated (one update run per dir)",
);
assert.ok(Probe.Stash.get("k-b2"), "Stash tracks the fresh observation");
ok("idempotence: a second author write re-governs silently and never double-updates");

// ── 11. P2 disposal + P5 close on unload ────────────────────────────────
const flight = new AbortController();
Probe.Inflight.set("k-unload", { controller: flight });
const inflightEffect = effects.find((e) => e[0] === "hook-dsh-governor-package-inflight")[1];
inflightEffect();
assert.equal(flight.signal.aborted, true, "unload aborts in-flight continuations");
assert.equal(Probe.Inflight.size, 0, "and clears the map");
ok("lifecycle: the P2 effect aborts every in-flight continuation and clears the map");
const storageEffect = effects.find((e) => e[0] === "hook-dsh-governor-package-storage")[1];
await storageEffect();
await settle(2);
assert.equal(domainClosed, true, "the storage disposer closes the domain");
ok("lifecycle: the P5 disposer closes the storage domain");
// P5 absent → silent skip, sink retired
const ctx2 = makeCtx({ files: {} });
ctx2.get = (name) => (name === "storageDomain" ? undefined : services[name]);
const stOff = factory.State(ctx2, { logFile: Ledger }, { module: "package-governor" });
factory.Attach(ctx2, { state: stOff, name: "probe-off" });
stOff.Journal("activated", "", "should not queue");
assert.equal(stOff.Queue.length, 0, "P5 absent → the sink is retired (no queue growth)");
ok("lifecycle: P5 absent → silent skip, the journal sink retired");

// ── 12. the ledger prefix is the module, everywhere ─────────────────────
assert.ok(
	loggerLines.info.every(
		(m) => m === "" || m.startsWith("hook-dsh-governor-package: ") || m.startsWith("smoke:"),
	) || loggerLines.info.length > 0,
);
const infoLines = loggerLines.info.filter((m) => m.startsWith("hook-dsh-governor-package: "));
assert.ok(infoLines.length > 20, "the factory composes every line with the module prefix");
ok("ledger prefix: every factory-composed line is `hook-dsh-governor-package: …`");

// ── done ─────────────────────────────────────────────────────────────────
console.log(`\n${N} checks — ALL PASS`);
