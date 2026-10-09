// pinner-smoke.mjs — the @playform/hook-dsh-pinner-package smoke suite,
// post-factory-refactor edition. A fake ctx + the REAL built pinner entry
// (Target/Library.js) + the REAL factory service (@playform/plugin-dsh-factory
// Target/Library.js, instantiated against the same fake ctx — the service the
// pinner consumes through inject: ["fs", "pluginFactory"]).
//
// Covers the pre-refactor assertion set (loader contract, byte-identical
// ledger strings, the range law across all four sections, keep-list discovery
// order + union, silence/containment, the P₃ refresh, the guarded-write
// postures) UNCHANGED, plus the factory-wiring assertions (State fields, the
// transform contract, the P3 chain-key interlock, the Attach effects, the
// volatile shared config, the storage journal).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";

const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pinner-smoke-"));
const FACTORY = "../packages/plugin-dsh-factory/Target/Library.js";
const PINNER = "../packages/hook-dsh-package-pinner/Target/Library.js";

// ── the fake ctx (mirrors the factory smoke's harness) ──────────────────────
const loggerLines = { info: [], error: [] };
const fakeLogger = {
	info: (m) => loggerLines.info.push(m),
	error: (m) => loggerLines.error.push(m),
};

// The stat→write race injector: when Armed, the fake `stat` captures the
// file's CURRENT version token, then lets a racing author write land, then
// returns the PRE-write token — so the chain's guarded write guards a
// version that is already superseded when writeText checks it. This is the
// only window left after the fresh-stat basis (a racing write between the
// observation and the chain no longer refuses; the chain re-reads and
// merges it).
const Race = { Armed: null };

const makeCtx = (over = {}) => {
	const ctx = {
		logger: fakeLogger,
		events: [],
		emitted: [],
		effects: [],
		serviceGets: [],
		services: {},
		reads: [],
		writes: [],
		on: (name, fn) => {
			ctx.events.push([name, fn]);
			return () => true;
		},
		emit: (name, ...args) => ctx.emitted.push([name, ...args]),
		effect: (fn, label) => {
			const dispose = fn();
			ctx.effects.push([label, dispose]);
			return () => {
				const i = ctx.effects.findIndex((e) => e[0] === label);
				if (i >= 0) ctx.effects.splice(i, 1);
			};
		},
		get: (name) => {
			ctx.serviceGets.push(name);
			return ctx.services[name];
		},
		reflect: {
			provide: (name, value) => {
				ctx.services[name] = value;
				ctx[name] = value; // the service accessor (ctx.pluginFactory)
			},
		},
		// The ROOT seam: the Wire registers on the root scope (`Context.root.on`),
		// so the fake ctx must be its own root — ctx.root.on records into the
		// same ctx.events capture (a harness seam; zero assertion changes).
		get root() {
			return ctx;
		},
	};
	// The governed-fs backend: REAL temp-dir I/O, version tokens
	// (dev:size:mtimeNs:ctimeNs) enforcing the replaceIfVersion guard.
	const token = (p) => {
		const s = FileSystem.statSync(p);
		return `dev:${s.dev}:${s.size}:${s.mtimeNs}:${s.ctimeNs}`;
	};
	ctx.fs = {
		sandboxMode: undefined,
		readText: async (target, signal) => {
			ctx.reads.push([target.displayPath, signal !== undefined]);
			// throws when the file vanished — the backend contract
			return FileSystem.readFileSync(target.displayPath, "utf8");
		},
		writeText: async (target, content, intent, signal, fence) => {
			const current = FileSystem.existsSync(target.displayPath)
				? token(target.displayPath)
				: null;
			if (intent?.kind === "replaceIfVersion" && current !== intent.version)
				throw new Error(`FS_STALE_VERSION: ${target.displayPath}`);
			FileSystem.writeFileSync(target.displayPath, content);
			ctx.writes.push({
				path: target.displayPath,
				content,
				intent,
				signal: signal ?? null,
				fence: fence ?? null,
			});
			return { version: token(target.displayPath) };
		},
		stat: async (target) => {
			// The fresh-stat probe (the chain's write basis). When armed, the
			// racing author write lands AFTER the token is captured — the write
			// the chain is about to make will then fail the guard.
			const version = token(target.displayPath);
			if (Race.Armed && Race.Armed.path === target.displayPath) {
				FileSystem.writeFileSync(Race.Armed.path, Race.Armed.content);
				Race.Armed = null;
			}
			return { version };
		},
	};
	return Object.assign(ctx, over);
};

// ── helpers ─────────────────────────────────────────────────────────────────
let N = 0;
const ok = (label) => console.log(`ok ${++N} — ${label}`);
const write = (p, content) => {
	FileSystem.mkdirSync(Path.dirname(p), { recursive: true });
	FileSystem.writeFileSync(p, content);
	return p;
};
const token = (p) => {
	const s = FileSystem.statSync(p);
	return `dev:${s.dev}:${s.size}:${s.mtimeNs}:${s.ctimeNs}`;
};
const lines = (ledger) =>
	FileSystem.existsSync(ledger)
		? FileSystem.readFileSync(ledger, "utf8").split("\n").filter(Boolean)
		: [];
const ledgerHas = (ledger, fragment) => lines(ledger).some((l) => l.endsWith(fragment));
const ledgerCount = (ledger, fragment) => lines(ledger).filter((l) => l.endsWith(fragment)).length;
async function settle(st) {
	for (let i = 0; i < 500; i++) {
		if (st.Inflight.size === 0) return;
		await new Promise((r) => setImmediate(r));
	}
	throw new Error("the detached continuation never settled");
}
const wait = () => new Promise((r) => setImmediate(() => setImmediate(r)));

// ── the REAL factory + the REAL pinner ──────────────────────────────────────
const { default: PluginFactory } = await import(FACTORY);
const Pinner = await import(PINNER);

// ══ 1. The loader contract ══════════════════════════════════════════════════
assert.equal(Pinner.name, "hook-dsh-pinner-package", "name export");
assert.equal(typeof Pinner.apply, "function", "apply export");
assert.equal(typeof Pinner.Config, "function", "Config export is a callable schema");
assert.ok(Pinner.Config.dict, "Config carries the schema dictionary");
assert.deepEqual(
	Pinner.inject,
	["fs", "pluginFactory"],
	"inject declares fs + the factory service",
);
assert.deepEqual(
	Object.keys(Pinner.default).sort(),
	["Config", "apply", "inject", "name"],
	"default object carries all four",
);
assert.equal(Pinner.default.apply, Pinner.apply, "default.apply is the named apply");
ok("loader contract: name/apply/Config/inject + the full default object");

// ══ 2. The Config schema (factory-built, real validation) ═══════════════════
const schema = Pinner.Config;
const validated = schema({});
assert.equal(validated.log.get(), true, "log default (volatile cell)");
assert.equal(
	validated.logFile.get(),
	"~/.dsh/hook-dsh-pinner-package.log",
	"logFile default (volatile cell)",
);
assert.deepEqual(
	validated.mutationTools.get(),
	["write", "edit", "str_replace_editor", "raw-write"],
	"mutationTools default (volatile cell)",
);
assert.equal(
	validated.updateCooldownMs.get(),
	3000,
	"factory shared updateCooldownMs present (the pinner never reads it)",
);
assert.equal(validated.policyFile, "", "policyFile default (non-volatile)");
assert.deepEqual(
	validated.sections,
	["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"],
	"sections default",
);
assert.deepEqual(
	validated.exclude,
	["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"],
	"exclude default",
);
ok("Config schema: all six shared/own fields validated with the historical defaults");

// ══ 3. Apply — activation proof + Attach + the State wiring ═════════════════
const Ledger = Path.join(Root, "ledger-main.log");
const ctx = makeCtx();
const factory = new PluginFactory(ctx); // the REAL service, registered as ctx.pluginFactory
assert.equal(ctx.pluginFactory, factory, "factory registered as ctx.pluginFactory");
ok("the REAL factory service instantiated against the fake ctx");

const cfg = schema({ log: true, logFile: Ledger });
const returned = Pinner.apply(ctx, cfg);
assert.equal(returned, undefined, "apply returns NOTHING");
assert.equal(
	ctx.events.filter((e) => e[0] === "fs/observed").length,
	1,
	"exactly one fs/observed listener (Wire)",
);
ok("apply returns undefined; Wire registered the fs/observed hook");

const listener = ctx.events.find((e) => e[0] === "fs/observed")[1];
const st = ctx.__hookDshPinnerPackageState;
assert.ok(st, "state exposed via the context attachment");
assert.equal(st.Module, "hook-dsh-pinner-package", "State.Module = the logger/ledger prefix");
assert.equal(st.Ledger, Ledger);
assert.equal(st.Enabled, true);
assert.deepEqual(st.Tool, ["write", "edit", "str_replace_editor", "raw-write"]);
assert.deepEqual(st.Section, [
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"optionalDependencies",
]);
assert.equal(st.Policy, "");
assert.equal(st.PolicyName, "pin-policy.json", "the union-discovery sidecar name");
assert.deepEqual(st.List, [
	"node_modules",
	".git",
	".dsh",
	".pnpm",
	".store",
	"DeepSeek Harness.app",
]);
assert.ok(
	st.Stash instanceof Map &&
		st.Inflight instanceof Map &&
		st.Seams instanceof Map &&
		Array.isArray(st.Queue),
);
assert.equal(st.Subprocess, undefined, "P9: subprocess seam probed once, absent → undefined");
assert.ok(ctx.serviceGets.includes("subprocess"), "the subprocess probe went through ctx.get");
ok("State: factory-built shared shape + the pinner's Section field + PolicyName");

const activation = lines(Ledger)[0];
assert.match(
	activation,
	/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] activated \(pinner, logFile=.*ledger-main\.log, sections=\[dependencies, devDependencies, peerDependencies, optionalDependencies\], exclude=\[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app\]\)$/,
	"the activation line is byte-identical",
);
assert.ok(
	loggerLines.info.includes(
		`hook-dsh-pinner-package: activated (pinner, logFile=${Ledger}, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])`,
	),
	"logger prefix composed from State.Module",
);
ok("activation proof: the durable activated (pinner, …) ledger line + the logger prefix");

assert.deepEqual(
	ctx.effects.map((e) => e[0]),
	[
		"hook-dsh-pinner-package-jobs",
		"hook-dsh-pinner-package-inflight",
		"hook-dsh-pinner-package-storage",
	],
	"Attach: the three lifecycle effects",
);
const flight = new AbortController();
st.Inflight.set("probe", { controller: flight });
ctx.effects.find((e) => e[0] === "hook-dsh-pinner-package-inflight")[1]();
assert.equal(flight.signal.aborted, true, "P2 disposer aborted the in-flight pass");
assert.equal(st.Inflight.size, 0, "P2 disposer cleared the map");
ok("Attach: P1/P2/P5 labels + the in-flight disposal effect");

// the storage-less journal sink is retired (silent skip)
st.Journal("x", "", "y");
assert.equal(st.Queue.length, 0, "P5 absent: the sink is a no-op — no queue growth");
ok("Journal: silent skip without a storage domain");

// ══ 4. The g1 gate set (end-to-end through the real listener) ═══════════════
const gatesDir = Path.join(Root, "gates");
const before = { reads: ctx.reads.length, writes: ctx.writes.length };
listener(
	{ targetKey: "g-actor", displayPath: Path.join(gatesDir, "package.json") },
	{ kind: "present", version: "v1" },
	{ name: "grep" },
);
listener(
	{ targetKey: "g-kind", displayPath: Path.join(gatesDir, "package.json") },
	{ kind: "absent", version: "v1" },
	{ name: "edit" },
);
listener(
	{ targetKey: "g-base", displayPath: Path.join(gatesDir, "Cargo.toml") },
	{ kind: "present", version: "v1" },
	{ name: "edit" },
);
await settle(st);
assert.equal(ctx.reads.length, before.reads, "non-trigger events: no read");
assert.equal(ctx.writes.length, before.writes, "non-trigger events: no write");
assert.equal(ledgerCount(Ledger, "skipped"), 0, "non-trigger events: no ledger line");
ok("gates: actor / kind / basename — no read, no write, no line");

const excludedPath = Path.join(gatesDir, "node_modules", "x", "package.json");
listener(
	{ targetKey: "g-excl", displayPath: excludedPath },
	{ kind: "present", version: "v1" },
	{ name: "edit" },
);
await settle(st);
assert.equal(ctx.reads.length, before.reads, "excluded: no read");
assert.ok(
	lines(Ledger).some((l) =>
		/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] skipped \(excluded\) .*node_modules.*package\.json$/.test(
			l,
		),
	),
	"skipped (excluded) line byte-format",
);
ok("gates: exclusion-first → skipped (excluded) line, file untouched");

st.Stash.set("g-dup", "v1");
const exclLinesBefore = lines(Ledger).filter((l) => l.includes("skipped (excluded)")).length;
listener(
	{ targetKey: "g-dup", displayPath: Path.join(gatesDir, "package.json") },
	{ kind: "present", version: "v1" },
	{ name: "edit" },
);
const dupReads = ctx.reads.length;
listener(
	{ targetKey: "g-dup", displayPath: Path.join(gatesDir, "node_modules", "y", "package.json") },
	{ kind: "present", version: "v1" },
	{ name: "edit" },
);
await settle(st);
assert.equal(ctx.reads.length, dupReads, "idempotent re-emit → no read");
assert.equal(
	lines(Ledger).filter((l) => l.includes("skipped (excluded)")).length,
	exclLinesBefore,
	"idempotence precedes exclusion (the re-emit is silent even on an excluded path)",
);
ok("gates: Stash idempotence — silent re-emit, precedence over the excluded line");

// ══ 5. The pin pass — the range law across all four sections ════════════════
const pinDir = Path.join(Root, "pin-basic");
const pinPath = Path.join(pinDir, "package.json");
const author = {
	name: "x",
	scripts: { build: "tsc" },
	dependencies: {
		caret: "^0.3.4",
		tilde: "~1.2.3",
		equals: "=2.0.0",
		static: "0.4.0",
		star: "*",
		empty: "",
		compare: ">=1.0.0",
		compound: "^1.0.0 || 2.0.0",
		workspace: "workspace:*",
		file: "file:../x",
		link: "link:../y",
		git: "git+https://example/x",
		alias: "npm:pkg@1.0.0",
		wildcard: "^1.*",
		nonstring: { nested: true },
	},
	devDependencies: { dev: "^2.0.0" },
	peerDependencies: { peer: "=3.0.0" },
	optionalDependencies: { optional: "~4.0.0" },
};
write(pinPath, JSON.stringify(author));
const v1 = token(pinPath);
const target = { targetKey: "pin-basic", displayPath: pinPath };
const actor = { name: "edit" };
const writesBefore = ctx.writes.length;
const readsBefore = ctx.reads.length;
listener(target, { kind: "present", version: v1 }, actor);
assert.equal(
	ctx.writes.length,
	writesBefore,
	"the listener is await-free: the write detaches (silence)",
);
await settle(st);
const writeRecord = ctx.writes.at(-1);
assert.equal(writeRecord.path, pinPath, "the manifest was rewritten");
assert.equal(ctx.reads.length, readsBefore + 1, "exactly one governed read");
assert.equal(ctx.reads.at(-1)[0], pinPath, "readText got the target");
assert.equal(ctx.reads.at(-1)[1], true, "the read carries the pass's abort signal");
assert.deepEqual(
	writeRecord.intent,
	{ kind: "replaceIfVersion", version: v1 },
	"replaceIfVersion at the CURRENT (fresh-stat) version — equals the observed one in this unraced pass",
);
assert.equal(writeRecord.signal !== null, true, "the write carries the pass's abort signal");
const pinned = JSON.parse(writeRecord.content);
const D = author.dependencies;
assert.equal(pinned.dependencies.caret, "0.3.4", "^ stripped");
assert.equal(pinned.dependencies.tilde, "1.2.3", "~ stripped");
assert.equal(pinned.dependencies.equals, "2.0.0", "= stripped");
assert.equal(pinned.devDependencies.dev, "2.0.0", "^ stripped in devDependencies");
assert.equal(pinned.peerDependencies.peer, "3.0.0", "= stripped in peerDependencies");
assert.equal(pinned.optionalDependencies.optional, "4.0.0", "~ stripped in optionalDependencies");
assert.equal(pinned.dependencies.static, "0.4.0", "static untouched");
assert.equal(pinned.dependencies.star, "*", "wildcard without prefix untouched");
assert.equal(pinned.dependencies.empty, "", "empty range untouched");
assert.equal(pinned.dependencies.compare, ">=1.0.0", "comparison range untouched");
assert.equal(pinned.dependencies.compound, "^1.0.0 || 2.0.0", "compound/space range untouched");
assert.equal(pinned.dependencies.workspace, "workspace:*", "protocol untouched");
assert.equal(pinned.dependencies.file, "file:../x", "file: untouched");
assert.equal(pinned.dependencies.link, "link:../y", "link: untouched");
assert.equal(pinned.dependencies.git, "git+https://example/x", "git+ untouched");
assert.equal(pinned.dependencies.alias, "npm:pkg@1.0.0", "npm: alias untouched");
assert.equal(pinned.dependencies.wildcard, "1.*", "documented edge: ^1.* → 1.*");
assert.deepEqual(pinned.dependencies.nonstring, { nested: true }, "non-string value untouched");
assert.equal(pinned.name, "x", "refusal domain: name preserved");
assert.deepEqual(pinned.scripts, { build: "tsc" }, "refusal domain: scripts preserved");
assert.ok(
	writeRecord.content.endsWith("\n") && writeRecord.content.includes('\n  "name"'),
	"the trio's serialization: JSON.stringify(next, null, 2) + newline",
);
ok("the range law: strip ^/~/= one leading prefix, everything else untouched, all four sections");

const fresh1 = token(pinPath);
assert.equal(st.Stash.get("pin-basic"), fresh1, "the fresh version is pre-registered in the Stash");
assert.ok(
	ledgerHas(Ledger, `pinned ${pinPath} (7 versions)`),
	"pinned <path> (N versions) — byte-identical message (7: caret/tilde/equals/wildcard + dev/peer/optional)",
);
assert.equal(ledgerCount(Ledger, `pinned ${pinPath} (7 versions)`), 1, "exactly one pinned line");
const reEmit = ctx.emitted.filter((e) => e[0] === "fs/observed").at(-1);
assert.deepEqual(reEmit[1], target, "the P₃ re-emit carries the same target");
assert.deepEqual(reEmit[2], { kind: "present", version: fresh1 }, "…and the FRESH version");
assert.equal(reEmit[3], actor, "…with the SAME actor (same owner bucket)");
ok("the pin pass: guarded write + Stash pre-registration + the P₃ same-actor re-emit");

// the re-emit re-enters the listener: an idempotence-gate no-op
const quiet = { reads: ctx.reads.length, writes: ctx.writes.length, lines: lines(Ledger).length };
listener(target, { kind: "present", version: fresh1 }, actor);
await settle(st);
assert.equal(ctx.reads.length, quiet.reads, "re-entrant pass: no read");
assert.equal(ctx.writes.length, quiet.writes, "re-entrant pass: no write");
assert.equal(lines(Ledger).length, quiet.lines, "re-entrant pass: no ledger line");
ok("re-entrancy: the P₃ re-emit is a silent no-op (no rewrite loop)");

// the author's next guarded write does NOT fail FS_STALE_VERSION
await assert.doesNotReject(
	() =>
		ctx.fs.writeText(
			target,
			JSON.stringify({ name: "x", dependencies: { next: "^9.0.0" } }),
			{ kind: "replaceIfVersion", version: fresh1 },
			undefined,
			undefined,
		),
	"the observation-policy's record is refreshed — no stale-version leak",
);
ok("version coherence: the author's next guarded write succeeds at the fresh version");

// ══ 6. The refusal guard's invariant + the no-op paths ══════════════════════
const noopDir = Path.join(Root, "noops");
// already pinned → the designed no-op line, no write, no re-emit
const pinnedPath = write(
	Path.join(noopDir, "pinned", "package.json"),
	JSON.stringify({ name: "p", dependencies: { a: "1.0.0" } }),
);
listener(
	{ targetKey: "noop-pinned", displayPath: pinnedPath },
	{ kind: "present", version: token(pinnedPath) },
	actor,
);
await settle(st);
assert.ok(ledgerHas(Ledger, `no changes to pin for ${pinnedPath}`), "the no-changes line");
assert.equal(
	ctx.writes.filter((w) => w.path === pinnedPath).length,
	0,
	"no write on the no-op path",
);
// non-JSON → the skip line, no write
const badPath = write(Path.join(noopDir, "bad", "package.json"), "{ nope");
listener(
	{ targetKey: "noop-bad", displayPath: badPath },
	{ kind: "present", version: token(badPath) },
	actor,
);
await settle(st);
assert.ok(
	ledgerHas(Ledger, `observed non-JSON package.json ${badPath} — skipped`),
	"the non-JSON line byte-format",
);
assert.equal(
	ctx.writes.filter((w) => w.path === badPath).length,
	0,
	"no write on the non-JSON path",
);
// vanished file (the read fails) → the same line, contained
const ghost = { targetKey: "noop-ghost", displayPath: Path.join(noopDir, "ghost", "package.json") };
listener(ghost, { kind: "present", version: "v1" }, actor);
await settle(st);
assert.ok(
	ledgerHas(Ledger, `observed non-JSON package.json ${ghost.displayPath} — skipped`),
	"a vanished file maps to the non-JSON skip",
);
assert.equal(
	ctx.writes.filter((w) => w.path === ghost.displayPath).length,
	0,
	"no write for a vanished file",
);
assert.equal(st.Inflight.size, 0, "Inflight cleaned after every no-op path");
ok("no-op paths: no changes to pin / observed non-JSON / vanished — all silent writes-none");

// ══ 7. The fresh-stat write basis (the sequential-fold fix) ═════════════════
// (a) A racing author write BETWEEN the observation and the chain (the file
// advanced before the pass even started): the pass no longer refuses on the
// OBSERVED version — that refusal is exactly what silently aborted every
// later step of the direct-govern sequential fold (verified live: with
// `govern: ["canonicalize","pin"]` only the pinner's line landed). By design
// the pass now reads the CURRENT content, stats the CURRENT version, and
// lands its write against THAT — the author's change is incorporated, not
// clobbered.
const raceDir = Path.join(Root, "race-before");
const racePath = write(
	Path.join(raceDir, "package.json"),
	JSON.stringify({ name: "s", dependencies: { a: "^1.0.0" } }),
);
// the author advanced the file after the observation was emitted
FileSystem.writeFileSync(
	racePath,
	JSON.stringify({ name: "s", dependencies: { a: "^1.0.0", authored: "^9.9.9" } }),
);
const vAuthored = token(racePath);
const writesAtRace = ctx.writes.length;
listener(
	{ targetKey: "race-before", displayPath: racePath },
	{ kind: "present", version: "old-v9" },
	actor,
);
await settle(st);
assert.equal(
	ctx.writes.length,
	writesAtRace + 1,
	"an advanced file no longer aborts the chain (fresh-stat basis, BY DESIGN)",
);
const raceWrite = ctx.writes.at(-1);
assert.deepEqual(
	raceWrite.intent,
	{ kind: "replaceIfVersion", version: vAuthored },
	"the chain guarded the CURRENT (fresh-stat) version, not the stale observed 'old-v9'",
);
const raced = JSON.parse(raceWrite.content);
assert.equal(raced.dependencies.a, "1.0.0", "the pass's own pin applied on top");
assert.equal(
	raced.dependencies.authored,
	"9.9.9",
	"the racing author's dep was read and incorporated (no clobber, no abort)",
);
assert.ok(ledgerHas(Ledger, `pinned ${racePath} (2 versions)`), "the pass's pinned line landed");
assert.ok(
	!loggerLines.error.some((l) => l.includes(racePath)),
	"no suppression error for the advanced file",
);
ok(
	"fresh-stat basis: a file advanced between the observation and the chain is incorporated (the old observed-version refusal is gone by design — the live fold-abort fix)",
);

// (b) The remaining guard: a write landing between the fresh stat and the
// writeText still fails FS_STALE_VERSION safely, contained logger-only.
const staleDir = Path.join(Root, "stale");
const stalePath = write(
	Path.join(staleDir, "package.json"),
	JSON.stringify({ name: "s", dependencies: { a: "^1.0.0" } }),
);
const staleTarget = { targetKey: "stale", displayPath: stalePath };
Race.Armed = {
	path: stalePath,
	content: JSON.stringify({ name: "s", dependencies: { a: "^2.0.0", racer: "^3.0.0" } }),
};
const errsBefore = loggerLines.error.length;
const writesAtStale = ctx.writes.length;
listener(staleTarget, { kind: "present", version: token(stalePath) }, actor);
await settle(st);
assert.equal(ctx.writes.length, writesAtStale, "the guarded write was REJECTED — no clobber");
assert.equal(
	loggerLines.error.at(-1),
	"hook-dsh-pinner-package: continuation error (suppressed): FS_STALE_VERSION: " + stalePath,
	"the throw is contained: <module>: continuation error (suppressed)",
);
assert.equal(st.Inflight.size, 0, "Inflight cleaned after the contained throw");
assert.equal(
	ledgerCount(Ledger, `pinned ${stalePath} (1 versions)`),
	0,
	"no pinned line for the rejected pass",
);
assert.equal(
	JSON.parse(FileSystem.readFileSync(stalePath, "utf8")).dependencies.a,
	"^2.0.0",
	"the racing write survived intact (no clobber)",
);
assert.equal(Race.Armed, null, "the race injector fired exactly once (the chain's fresh stat)");
ok(
	"stat→write window: a racing write after the fresh stat still fails safely, contained logger-only",
);

// ══ 8. The keep-list discovery (union + order + the P3 interlock) ═══════════
// H1 — the dir sidecar protects a package
const h1 = Path.join(Root, "keep1");
const h1Path = write(
	Path.join(h1, "package.json"),
	JSON.stringify({ dependencies: { tailwindcss: "^3.0.5", react: "^18.0.0" } }),
);
write(Path.join(h1, "pin-policy.json"), JSON.stringify({ keep: ["tailwindcss"] }));
listener(
	{ targetKey: "keep1", displayPath: h1Path },
	{ kind: "present", version: token(h1Path) },
	actor,
);
await settle(st);
const h1Out = JSON.parse(ctx.writes.find((w) => w.path === h1Path).content);
assert.equal(
	h1Out.dependencies.tailwindcss,
	"^3.0.5",
	"the keep-list protects the range as authored",
);
assert.equal(h1Out.dependencies.react, "18.0.0", "non-kept packages are pinned in the same pass");
FileSystem.unlinkSync(Path.join(h1, "pin-policy.json"));
ok("keep-list: pin-policy.json protects tailwindcss, others pinned");

// H2 — the global policyFile unions with the dir sidecar
const globalPolicy = write(Path.join(Root, "global-policy.json"), JSON.stringify({ keep: ["g1"] }));
const h2 = Path.join(Root, "keep2");
const h2Path = write(
	Path.join(h2, "package.json"),
	JSON.stringify({ dependencies: { g1: "^1.0.0", g2: "^2.0.0", other: "^3.0.0" } }),
);
write(Path.join(h2, "pin-policy.json"), JSON.stringify({ keep: ["g2"] }));
const ctxG = makeCtx();
const factoryG = new PluginFactory(ctxG);
const cfgG = schema({
	log: true,
	logFile: Path.join(Root, "ledger-keep2.log"),
	policyFile: globalPolicy,
});
Pinner.apply(ctxG, cfgG);
const stG = ctxG.__hookDshPinnerPackageState;
ctxG.events.find((e) => e[0] === "fs/observed")[1](
	{ targetKey: "keep2", displayPath: h2Path },
	{ kind: "present", version: token(h2Path) },
	actor,
);
await settle(stG);
const h2Out = JSON.parse(ctxG.writes.find((w) => w.path === h2Path).content);
assert.equal(h2Out.dependencies.g1, "^1.0.0", "the global policy contributes to the union");
assert.equal(h2Out.dependencies.g2, "^2.0.0", "the dir sidecar contributes to the union");
assert.equal(h2Out.dependencies.other, "3.0.0", "unprotected packages pinned");
FileSystem.unlinkSync(Path.join(h2, "pin-policy.json"));
FileSystem.unlinkSync(globalPolicy);
ok("keep-list: global policyFile ∪ dir sidecar (the union, not first-wins)");

// H3 — the registry-co-located sidecar is a source
const h3 = Path.join(Root, "keep3");
const h3Path = write(
	Path.join(h3, "package.json"),
	JSON.stringify({ dependencies: { regkept: "^1.0.0", other: "^2.0.0" } }),
);
const registryA = write(Path.join(Root, "registry.json"), JSON.stringify({ effectiveLatest: {} }));
write(Path.join(Root, "pin-policy.json"), JSON.stringify({ keep: ["regkept"] }));
listener(
	{ targetKey: "keep3", displayPath: h3Path },
	{ kind: "present", version: token(h3Path) },
	actor,
);
await settle(st);
const h3Out = JSON.parse(ctx.writes.find((w) => w.path === h3Path).content);
assert.equal(h3Out.dependencies.regkept, "^1.0.0", "the registry-co-located sidecar contributes");
assert.equal(h3Out.dependencies.other, "2.0.0", "unprotected pinned");
FileSystem.unlinkSync(registryA);
FileSystem.unlinkSync(Path.join(Root, "pin-policy.json"));
ok("keep-list: the sidecar co-located with the discovered registry.json is absorbed");

// H4 — an unreadable sidecar: the byte-identical line + it contributes nothing
const h4 = Path.join(Root, "keep4");
const h4Path = write(
	Path.join(h4, "package.json"),
	JSON.stringify({ dependencies: { a: "^1.0.0" } }),
);
const h4Sidecar = write(Path.join(h4, "pin-policy.json"), "{ nope");
listener(
	{ targetKey: "keep4", displayPath: h4Path },
	{ kind: "present", version: token(h4Path) },
	actor,
);
await settle(st);
assert.ok(
	ledgerHas(Ledger, `unreadable pin-policy.json at ${h4Sidecar} — using built-in default`),
	"the unreadable-policy line byte-format",
);
assert.equal(
	JSON.parse(ctx.writes.find((w) => w.path === h4Path).content).dependencies.a,
	"1.0.0",
	"the unreadable source contributes nothing",
);
FileSystem.unlinkSync(h4Sidecar);
ok("keep-list: unreadable sidecar → logged line + built-in default");

// H5 — a configured-but-absent global policy is silently not a source
const ctxA = makeCtx();
const factoryA = new PluginFactory(ctxA);
const ledgerA = Path.join(Root, "ledger-absent.log");
Pinner.apply(
	ctxA,
	schema({ log: true, logFile: ledgerA, policyFile: Path.join(Root, "nope-policy.json") }),
);
const h5 = Path.join(Root, "keep5");
const h5Path = write(
	Path.join(h5, "package.json"),
	JSON.stringify({ dependencies: { a: "^1.0.0" } }),
);
ctxA.events.find((e) => e[0] === "fs/observed")[1](
	{ targetKey: "keep5", displayPath: h5Path },
	{ kind: "present", version: token(h5Path) },
	actor,
);
await settle(ctxA.__hookDshPinnerPackageState);
assert.equal(
	JSON.parse(ctxA.writes.find((w) => w.path === h5Path).content).dependencies.a,
	"1.0.0",
	"pinned normally",
);
assert.equal(ledgerCount(ledgerA, "unreadable"), 0, "the absent policy logs NOTHING");
ok("keep-list: configured-but-absent policyFile is silently not a source");

// H6 — THE P3 INTERLOCK: chain pins are never stripped (no governor ping-pong)
const h6 = Path.join(Root, "keep6");
const h6Path = write(
	Path.join(h6, "package.json"),
	JSON.stringify({ dependencies: { leftpad: "^1.0.0", other: "^2.0.0" } }),
);
const registryB = write(
	Path.join(Root, "registry.json"),
	JSON.stringify({ effectiveLatest: { leftpad: "1.2.3" } }),
);
listener(
	{ targetKey: "keep6", displayPath: h6Path },
	{ kind: "present", version: token(h6Path) },
	actor,
);
await settle(st);
const h6Out = JSON.parse(ctx.writes.find((w) => w.path === h6Path).content);
assert.equal(
	h6Out.dependencies.leftpad,
	"^1.0.0",
	"the chain key is protected (the governor canonicalizes to ^resolved)",
);
assert.equal(h6Out.dependencies.other, "2.0.0", "non-chain packages pinned");
// the ping-pong probe: re-observe the fresh version three times
for (let i = 0; i < 3; i++) {
	listener(
		{ targetKey: "keep6", displayPath: h6Path },
		{ kind: "present", version: token(h6Path) },
		actor,
	);
	await settle(st);
}
assert.equal(
	JSON.parse(FileSystem.readFileSync(h6Path, "utf8")).dependencies.leftpad,
	"^1.0.0",
	"no ping-pong: the chain pin survives repeated passes",
);
FileSystem.unlinkSync(registryB);
ok(
	"the P3 interlock: chain names are always in the keep-list — the governor×pinner ping-pong cannot start",
);

// ══ 8b. The direct-govern path (Factory.Govern → the registered pin step) ═══
// The raw-write tool's per-call `govern` route: the step registered at apply
// runs through the DIRECT path — a simulated raw-write-style invocation with
// a real target and the observed version. The direct path must match the
// event-path behavior the scenarios above assert (the same guarded write, the
// same ledger strings, the Stash seeding).
{
	const pinDirDirect = Path.join(Root, "pin-direct");
	const pinPathDirect = write(
		Path.join(pinDirDirect, "package.json"),
		JSON.stringify({ dependencies: { a: "^1.0.0", b: "2.0.0" } }),
	);
	const vDirect = token(pinPathDirect);
	const writesBeforeDirect = ctx.writes.length;
	// The SEQUENTIAL FOLD: Govern is async and awaits each step, so the
	// direct-path invocations below are awaited (every assertion stays
	// byte-identical; the single-step scenario is now deterministic by
	// construction — the chain completes before the call resolves).
	await factory.Govern(
		{ targetKey: "pin-direct", displayPath: pinPathDirect },
		"pin",
		actor,
		vDirect,
	);
	await settle(st);
	const writeDirect = ctx.writes.at(-1);
	assert.equal(ctx.writes.length, writesBeforeDirect + 1, "pin: the chain pass wrote");
	assert.deepEqual(
		writeDirect.intent,
		{ kind: "replaceIfVersion", version: vDirect },
		"pin: guarded write at the CURRENT (fresh-stat) version — equals the observed one in this unraced pass",
	);
	const pinnedDirect = JSON.parse(writeDirect.content);
	assert.equal(pinnedDirect.dependencies.a, "1.0.0", "pin: ^ stripped by the direct pass");
	assert.equal(pinnedDirect.dependencies.b, "2.0.0", "pin: static untouched by the direct pass");
	assert.equal(
		st.Stash.get("pin-direct"),
		token(pinPathDirect),
		"pin: the Stash seeded (then advanced by the guarded write's fresh version)",
	);
	assert.ok(
		ledgerHas(Ledger, `pinned ${pinPathDirect} (1 versions)`),
		"pin: `pinned <path> (N versions)` byte-identical",
	);
	// selection: unknown names are ignored (the registered name is the only one)
	const beforeLines = lines(Ledger).length;
	await factory.Govern(
		{ targetKey: "pin-direct2", displayPath: pinPathDirect },
		["bogus"],
		actor,
		vDirect,
	);
	await settle(st);
	assert.equal(lines(Ledger).length, beforeLines, "selection: unknown step names run nothing");
	ok("direct-govern: pin — Stash seed + Continue, ledger byte-identical, unknown names ignored");
}

// ══ 8c. The two-chain-writer fold (the live failure mode, enforced fs) ══════
// Two chain-writing steps in ONE fold: the canonicalize (simulating the
// governor's chain pass) and the REAL pin. Before the fresh-stat basis, the
// fold handed every step the OBSERVED version, so the second step's chain
// write failed FS_STALE_VERSION and silently aborted (verified live: a
// `govern: true` run over canonicalize + pin produced only the pinner's
// `pinned` line). The fake fs ENFORCES the replaceIfVersion guard, so both
// writes landing is itself the proof that the second step guarded the
// FRESH version.
const FoldCan = (P) => (text, section, keep) => {
	if (text === null) return null;
	let doc;
	try {
		doc = JSON.parse(text);
	} catch {
		return null;
	}
	if (typeof doc?.dependencies?.leftpad !== "string" || doc.dependencies.leftpad === "^1.2.3")
		return null;
	const next = { ...doc, dependencies: { ...doc.dependencies, leftpad: "^1.2.3" } };
	return { next, count: 1, message: (o) => `governed ${P} → ${o.version}` };
};
{
	// forward registered order: [pin (registered at apply), fold-canonicalize]
	const dir = Path.join(Root, "fold-forward");
	const regPath = write(
		Path.join(dir, "registry.json"),
		JSON.stringify({ effectiveLatest: { leftpad: "1.2.3" } }),
	);
	const pathF = write(
		Path.join(dir, "package.json"),
		JSON.stringify({ dependencies: { leftpad: "~1.0.0", other: "^2.0.0" } }),
	);
	const vFold = token(pathF);
	const stFold = factory.State(
		ctx,
		{ log: true, logFile: Ledger },
		{ module: "package-governor", policyFileName: "pin-policy.json" },
	);
	factory.RegisterGovern("package.json", "fold-canonicalize", (t, a, v) =>
		factory.Continue(stFold, t, a, dir, regPath, v, FoldCan(pathF)),
	);
	const writesBeforeFold = ctx.writes.length;
	await factory.Govern(
		{ targetKey: "fold-forward", displayPath: pathF },
		["pin", "fold-canonicalize"],
		actor,
		vFold,
	);
	await settle(stFold);
	const foldWrites = ctx.writes.slice(writesBeforeFold);
	assert.equal(
		foldWrites.length,
		2,
		"forward fold: BOTH chain-writing steps wrote (enforced guard passed)",
	);
	assert.deepEqual(
		foldWrites[0].intent,
		{ kind: "replaceIfVersion", version: vFold },
		"forward fold step 1 (pin): guarded at the observed version (unraced)",
	);
	assert.notEqual(
		foldWrites[1].intent.version,
		vFold,
		"forward fold step 2 (canonicalize): guarded at the FRESH version — the pre-fix code failed FS_STALE_VERSION here",
	);
	assert.deepEqual(
		JSON.parse(FileSystem.readFileSync(pathF, "utf8")),
		{ dependencies: { leftpad: "^1.2.3", other: "2.0.0" } },
		"forward fold: final file canonical + pinned (deterministic convergence)",
	);
	const foldLedger = lines(Ledger);
	const pinnedIdx = foldLedger
		.map((l) => l.includes(`pinned ${pathF} (1 versions)`))
		.lastIndexOf(true);
	const governedIdx = foldLedger.map((l) => l.includes(`governed ${pathF} → `)).lastIndexOf(true);
	assert.ok(
		pinnedIdx >= 0 && governedIdx > pinnedIdx,
		"forward fold: both lines appear in the fold's registered order (pinned, then governed)",
	);
	ok(
		"two-chain-writer fold (pin → canonicalize): both writes land at the fresh-stat version, both lines appear, final file canonical + pinned",
	);
	factory.RegisterGovern("package.json", "fold-canonicalize", () => {}); // drop the sim step
}
{
	// reverse registered order: [fold-canonicalize-r, pin (apply registers after)]
	const ctxFold = makeCtx();
	const factoryFold = new PluginFactory(ctxFold);
	const dir = Path.join(Root, "fold-reverse");
	const regPath = write(
		Path.join(dir, "registry.json"),
		JSON.stringify({ effectiveLatest: { leftpad: "1.2.3" } }),
	);
	const pathR = write(
		Path.join(dir, "package.json"),
		JSON.stringify({ dependencies: { leftpad: "~1.0.0", other: "^2.0.0" } }),
	);
	const vFoldR = token(pathR);
	const stFoldR = factoryFold.State(
		ctxFold,
		{ log: true, logFile: Ledger },
		{ module: "package-governor", policyFileName: "pin-policy.json" },
	);
	factoryFold.RegisterGovern("package.json", "fold-canonicalize-r", (t, a, v) =>
		factoryFold.Continue(stFoldR, t, a, dir, regPath, v, FoldCan(pathR)),
	);
	Pinner.apply(ctxFold, schema({ log: true, logFile: Ledger })); // registers "pin" AFTER the sim step
	const writesBeforeFoldR = ctxFold.writes.length;
	await factoryFold.Govern(
		{ targetKey: "fold-reverse", displayPath: pathR },
		true,
		actor,
		vFoldR,
	);
	await settle(ctxFold.__hookDshPinnerPackageState);
	const foldRWrites = ctxFold.writes.slice(writesBeforeFoldR);
	assert.equal(
		foldRWrites.length,
		2,
		"reverse fold: BOTH chain-writing steps wrote (enforced guard passed)",
	);
	assert.deepEqual(
		foldRWrites[0].intent,
		{ kind: "replaceIfVersion", version: vFoldR },
		"reverse fold step 1 (canonicalize): guarded at the observed version (unraced)",
	);
	assert.notEqual(
		foldRWrites[1].intent.version,
		vFoldR,
		"reverse fold step 2 (pin): guarded at the FRESH version — the pre-fix code failed FS_STALE_VERSION here",
	);
	assert.deepEqual(
		JSON.parse(FileSystem.readFileSync(pathR, "utf8")),
		{ dependencies: { leftpad: "^1.2.3", other: "2.0.0" } },
		"reverse fold: the SAME converged final state as the forward order (deterministic regardless of registration order)",
	);
	const foldRLedger = lines(Ledger);
	const governedIdxR = foldRLedger
		.map((l) => l.includes(`governed ${pathR} → `))
		.lastIndexOf(true);
	const pinnedIdxR = foldRLedger
		.map((l) => l.includes(`pinned ${pathR} (1 versions)`))
		.lastIndexOf(true);
	assert.ok(
		governedIdxR >= 0 && pinnedIdxR > governedIdxR,
		"reverse fold: both lines appear in this fold's registered order (governed, then pinned)",
	);
	ok(
		"two-chain-writer fold (canonicalize → pin): reverse registration order converges to the same final state",
	);
}

// ══ 9. Factory wiring — the transform contract, driven directly ═════════════
const { default: Leaf } =
	await import("../packages/hook-dsh-package-pinner/Target/Function/Transform.js");
const appends = [];
const leafFurnace = { Append: (s, m) => appends.push(m) };
const leafState = {
	Context: { logger: fakeLogger },
	Ledger: Ledger,
	Enabled: true,
	Module: "package-pinner",
	Section: ["dependencies"],
};
const leafPath = "/tmp/smoke-leaf/package.json";
const leaf = Leaf(leafFurnace, leafState, leafPath);
const out = leaf(JSON.stringify({ dependencies: { a: "^1.0.0" } }), ["dependencies"], []);
assert.deepEqual(
	out.next,
	{ dependencies: { a: "1.0.0" } },
	"the transform returns the NEXT manifest",
);
assert.equal(out.count, 1, "…the COUNT of pinned versions");
assert.equal(
	out.message,
	`pinned ${leafPath} (1 versions)`,
	"…and the module's message (the factory logs it after the write)",
);
assert.equal(
	leaf(null, ["dependencies"], []),
	null,
	"the contract: current = null (failed read) → null",
);
assert.equal(leaf("not json", ["dependencies"], []), null, "the contract: undecodable → null");
assert.deepEqual(
	appends,
	[
		`observed non-JSON package.json ${leafPath} — skipped`,
		`observed non-JSON package.json ${leafPath} — skipped`,
	],
	"the module's no-op lines are logged INSIDE the transform (the factory stays silent)",
);
assert.equal(
	leaf(JSON.stringify({ dependencies: { a: "1.0.0" } }), ["dependencies"], []),
	null,
	"the contract: no change → null",
);
assert.equal(
	appends.at(-1),
	`no changes to pin for ${leafPath}`,
	"the no-changes line came from the transform",
);
ok(
	"the transform contract: (current: string|null, section, keep) → {next, count, message}|null — the module leaf",
);

// the factory's throw containment composes with the pinner's Module
const errsAtWire = loggerLines.error.length;
await assert.doesNotReject(() =>
	factory.Continue(st, target, actor, Path.join(Root, "pin-basic"), null, "v1", () => {
		throw new Error("boom");
	}),
);
assert.equal(
	loggerLines.error.at(-1),
	"hook-dsh-pinner-package: continuation error (suppressed): boom",
	"factory.Continue composes the suppression line from State.Module",
);
assert.equal(st.Inflight.size, 0, "Inflight cleaned after the contained throw");
ok("factory wiring: the detached continuation is contained, logger-only, Inflight-cleaned");

// ══ 10. The P5 storage journal (the activated record drains) ════════════════
const records = [];
let domainClosed = false;
const ctxS = makeCtx();
new PluginFactory(ctxS);
ctxS.services["storageDomain"] = {
	open: async () => ({
		close: async () => {
			domainClosed = true;
		},
		table: () => ({ put: async (k, v) => records.push([k, v]) }),
	}),
};
const ledgerS = Path.join(Root, "ledger-storage.log");
Pinner.apply(ctxS, schema({ log: true, logFile: ledgerS }));
await wait();
assert.equal(ctxS.__hookDshPinnerPackageState.Queue.length, 0, "the pre-open queue drained");
assert.equal(records.length, 1, "the activated record flowed to the domain");
assert.equal(records[0][1].event, "activated");
assert.ok(
	records[0][1].detail.startsWith("activated (pinner, "),
	"the record carries the activation proof",
);
ctxS.effects.find((e) => e[0] === "hook-dsh-pinner-package-storage")[1]();
await wait();
assert.equal(domainClosed, true, "the storage disposer closes the domain");
ok("P5 storage: the activated record drains; the disposer closes the domain");

// ══ 11. The silence invariant ═══════════════════════════════════════════════
// a broken ledger never throws out of the listener
const ctxB = makeCtx();
new PluginFactory(ctxB);
Pinner.apply(ctxB, schema({ log: true, logFile: Path.join(Root, "pin-basic") })); // a DIRECTORY — appendFileSync fails
const stB = ctxB.__hookDshPinnerPackageState;
const exclDir = Path.join(Root, "silent", "node_modules", "z");
assert.doesNotThrow(() => {
	ctxB.events.find((e) => e[0] === "fs/observed")[1](
		{ targetKey: "silent", displayPath: Path.join(exclDir, "package.json") },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
}, "a broken ledger (appendFileSync failure) is swallowed");
await settle(stB);
assert.ok(
	loggerLines.info.some((m) => m.includes("hook-dsh-pinner-package: skipped (excluded)")),
	"the logger still recorded the line",
);
ok("silence: the ledger append is best-effort — never throws out of the listener");

// a throwing target (hostile event payload) is suppressed logger-only
const hostile = { targetKey: "hostile" };
Object.defineProperty(hostile, "displayPath", {
	get() {
		throw new Error("hostile payload");
	},
});
const errsBeforeHostile = loggerLines.error.length;
assert.doesNotThrow(() => listener(hostile, { kind: "present", version: "v1" }, actor));
assert.equal(
	loggerLines.error.at(-1),
	"hook-dsh-pinner-package: listener error (suppressed): hostile payload",
	"the listener suppression line",
);
assert.equal(loggerLines.error.length, errsBeforeHostile + 1, "exactly one suppressed error");
await settle(st);
ok("silence: a throw inside the listener is suppressed logger-only (the tool call never sees it)");

// ══ done ═════════════════════════════════════════════════════════════════════
console.log(`\n${N} checks — ALL PASS`);
