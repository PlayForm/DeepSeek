// factory-smoke.mjs — the @playform/ets-plugin-dsh-factory smoke suite.
// A fake ctx + a REAL PluginFactory instance (class/service registered as
// ctx.pluginFactory via the cordis Service base). ≥ 25 numbered checks.
//
// TRACING MODE (the plan's extra smoke mode, the hygiene rule): run the
// suite with the factory's OPT-IN tracing enabled via
// `FACTORY_SMOKE_TRACING=1`. The Runtime knob is flipped BEFORE the shells
// are constructed (`enableTracing` — the optional @effect/opentelemetry
// bundle is a devDependency loaded dynamically; it is never on the
// module-load path), and every `dsh.*` span is exported to a LOCAL
// OTLP/HTTP collector started below. The mode must change NOTHING
// observable: every pre-existing assertion passes unchanged and the `ok`
// stream stays byte-identical with the default run (the ledger strings —
// the byte-identical smoke contract — are untouched by the spans), while
// the collector MUST have received spans (proving the traced runtime was
// actually live, not silently off). See the tail assertions.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Http from "node:http";
import * as OS from "node:os";
import * as Path from "node:path";

const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "factory-smoke-"));
const Ledger = Path.join(Root, "ledger.log");

const provided = {};
const events = [];
const emitted = [];
const effects = [];
const serviceGets = [];
const services = {};
const loggerLines = { info: [], error: [] };
const reads = [];
const writes = [];
const stats = [];
const appended = [];

const fakeLogger = {
	info: (m) => loggerLines.info.push(m),
	error: (m) => loggerLines.error.push(m),
};

// The factory instance is hoisted so makeCtx can reset its P5 journal
// stages at the top of every scenario setup: the smoke reuses ONE factory
// instance, so a stale shared sink or pending buffer would leak earlier
// scenarios' records into a later scenario's domain (it is assigned right
// after the import below; the first makeCtx call happens before that, hence
// the guard).
let factory;

const makeCtx = (over = {}) => {
	if (factory) {
		factory.PendingJournal = [];
		factory.SharedJournal = undefined;
	}
	// The ROOT seam: the Wire registers on the root scope (`Context.root.on`),
	// so the fake ctx must be its own root — ctx.root.on records into the same
	// `events` capture (a harness seam; the Wire assertions are unchanged).
	const Context = {
		logger: fakeLogger,
		on: (name, fn) => {
			events.push([name, fn]);
			return () => true;
		},
		emit: (name, ...args) => emitted.push([name, ...args]),
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
			return services[name];
		},
		fs: {
			sandboxMode: undefined,
			readText: async (target, signal) => {
				reads.push([target.displayPath, !!signal]);
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
				return { version: "fresh-v2" };
			},
			// The Continue chain pass's fresh-stat probe (the write-against-the-
			// current-version basis). The default returns the CURRENT file version
			// — in every unraced scenario that is the observed version ("v1"), so
			// the existing intent assertions stay byte-identical; a scenario that
			// models the file advancing between the observation and the chain
			// overrides `stat` (the raced 12f below). The probe is recorded so the
			// scenarios can assert it happened as a read-only, signal-carrying
			// call.
			stat:
				over.stat ??
				(async (target, signal) => {
					stats.push([target.displayPath, signal !== undefined]);
					return { version: "v1" };
				}),
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

const ctx = makeCtx({ files: {} });

// The REAL instance — the class/service registered as ctx.pluginFactory.
const { default: PluginFactory } =
	await import("../packages/ets-plugin-dsh-factory/Target/Library.js");

let N = 0;
const ok = (label) => console.log(`ok ${++N} — ${label}`);

// ── TRACING MODE setup (the OPT-IN knob, before ANY shell is built) ──────
// The runtime is materialized synchronously in the factory constructor, so
// the knob must be set and the optional bundle loaded before the first
// `new PluginFactory` — hence this block sits before the Library import.
const TRACING = process.env.FACTORY_SMOKE_TRACING === "1";
let tracingHits = 0;
let tracingServer = null;
if (TRACING) {
	// Fast batch flush so the tail assertion is deterministic (the default
	// BatchSpanProcessor schedule is 5s — the timing hygiene of the traced
	// build is that exports never run on the caller's critical path).
	process.env.OTEL_BSP_SCHEDULE_DELAY = "200";
	process.env.OTEL_BSP_EXPORT_TIMEOUT = "2000";
	// The local OTel collector: accepts any OTLP/HTTP POST (the exporter
	// posts to the configured URL verbatim) and counts the exports.
	tracingServer = Http.createServer((req, res) => {
		req.resume();
		req.on("end", () => {
			tracingHits++;
			res.writeHead(200, { "content-type": "application/x-protobuf" });
			res.end(Buffer.alloc(0));
		});
	});
	tracingServer.unref();
	await new Promise((resolve) => tracingServer.listen(0, "127.0.0.1", resolve));
	const Runtime = await import("../packages/ets-plugin-dsh-factory/Target/Service/Runtime.js");
	const enabled = await Runtime.enableTracing({
		endpoint: `http://127.0.0.1:${tracingServer.address().port}`,
		serviceName: "factory-smoke",
	});
	assert.equal(enabled, true, "tracing mode: the optional OTel bundle loaded (dynamic import)");
}

// ── 1. The entry contract ────────────────────────────────────────────────
assert.equal(typeof PluginFactory, "function", "default export is a class");
assert.ok(
	Object.getPrototypeOf(PluginFactory)?.name === "Service" ||
		String(Object.getPrototypeOf(PluginFactory)).includes("Service"),
	"extends Service",
);
assert.deepEqual(PluginFactory.inject, ["fs"], "static inject = [fs]");
factory = new PluginFactory(ctx);
assert.equal(provided["pluginFactory"], factory, "registered as ctx.pluginFactory");
assert.equal(factory.name, "pluginFactory", "service name is pluginFactory");
ok("entry: class extends Service, static inject=[fs], registered as ctx.pluginFactory");

for (const m of [
	"Append",
	"Match",
	"Discover",
	"Parse",
	"ResolvePolicy",
	"Gate",
	"GuardedWrite",
	"Refresh",
	"Continue",
	"State",
	"Wire",
	"Attach",
	"Journal",
	"Schema",
	"Seam",
])
	assert.equal(typeof factory[m], "function", `method ${m}`);
ok("entry: all 15 service methods present");

// ── 2. State builder: defaults, cell unwrap, module fields ──────────────
const volatileCell = { get: () => ["write", "edit"] };
const st1 = factory.State(
	ctx,
	{
		log: true,
		logFile: Ledger,
		policyFile: "",
		exclude: ["x"],
		mutationTools: volatileCell,
		strict: false,
		sections: ["dependencies"],
	},
	{ module: "smoke-flavor", fields: { Section: "sections", Strict: "strict" } },
);
assert.equal(st1.Module, "smoke-flavor");
assert.deepEqual(st1.Tool, ["write", "edit"], "volatile cell unwrapped");
assert.equal(st1.Ledger, Ledger);
assert.equal(st1.Enabled, true);
assert.deepEqual(st1.List, ["x"]);
assert.equal(st1.Policy, "");
assert.equal(st1.PolicyName, "");
assert.deepEqual(st1.Section, ["dependencies"], "module field Section mapped");
assert.equal(st1.Strict, false, "module field Strict mapped");
assert.ok(
	st1.Stash instanceof Map &&
		st1.Inflight instanceof Map &&
		st1.Seams instanceof Map &&
		st1.Queue.length === 0,
);
assert.equal(st1.Subprocess, undefined, "subprocess seam absent → undefined");
ok("State: cell unwrap + shared mappings + module fields + fresh structures");

services["subprocess"] = { spawn: () => "stub" };
const st2 = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
assert.equal(st2.Subprocess.spawn(), "stub", "subprocess probed once at build");
ok("State: P9 probe-once subprocess seam");

// ── 3. Seam: probe-once caching, never the dead accessor ────────────────
services["smoke-x"] = { tag: "x" };
const seamBefore = serviceGets.length;
assert.equal(factory.Seam(st2, "smoke-x"), services["smoke-x"]);
assert.equal(factory.Seam(st2, "smoke-x"), services["smoke-x"]);
assert.equal(serviceGets.length, seamBefore + 1, "second Seam call served from cache");
assert.equal(factory.Seam(st2, "no-such-service"), undefined);
ok("Seam: probe-once cache (incl. cached undefined), ctx.get only");

// ── 4. Match ─────────────────────────────────────────────────────────────
assert.equal(factory.Match("/a/node_modules/b/package.json", ["node_modules"]), true);
assert.equal(factory.Match("/a/b/package.json", ["node_modules"]), false);
assert.equal(factory.Match("/a/b/package.json", []), false);
assert.equal(factory.Match("/a/b/package.json", null), false);
ok("Match: exclusion-first segment match");

// ── 5. Discover + Parse (the auxiliary plain-fs exemption) ──────────────
const proj = Path.join(Root, "proj");
FileSystem.mkdirSync(proj);
FileSystem.writeFileSync(
	Path.join(Root, "registry.json"),
	JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
);
assert.equal(factory.Discover(proj), Path.join(Root, "registry.json"));
const nm = Path.join(Root, "node_modules", "deep");
FileSystem.mkdirSync(nm, { recursive: true });
assert.equal(factory.Discover(nm), null, "walk-up stops at node_modules");
assert.equal(factory.Discover("/"), null);
assert.deepEqual(factory.Parse(Path.join(Root, "registry.json")), {
	effectiveLatest: { leftpad: "1.0.0" },
});
FileSystem.writeFileSync(Path.join(Root, "bad.json"), "{ nope");
assert.equal(factory.Parse(Path.join(Root, "bad.json")), null);
assert.equal(factory.Parse(Path.join(Root, "missing.json")), null);
ok("Discover/Parse: walk-up + node_modules boundary + contained JSON read");

// ── 6. ResolvePolicy: the union keep-list with chain keys ───────────────
const globalPolicy = Path.join(Root, "global-policy.json");
FileSystem.writeFileSync(globalPolicy, JSON.stringify({ keep: ["g", "a"] }));
FileSystem.writeFileSync(Path.join(proj, "pin-policy.json"), JSON.stringify({ keep: ["a", "b"] }));
FileSystem.writeFileSync(Path.join(Root, "pin-policy.json"), JSON.stringify({ keep: ["b", "c"] }));
const stP = factory.State(
	ctx,
	{ logFile: Ledger, policyFile: globalPolicy },
	{ module: "f", policyFileName: "pin-policy.json" },
);
const keep1 = factory.ResolvePolicy(stP, proj, Path.join(Root, "registry.json"), ["leftpad"]);
assert.deepEqual(
	keep1,
	["g", "a", "b", "c", "leftpad"],
	"union order: global → dir → found → chain",
);
const keep2 = factory.ResolvePolicy(stP, proj, null, ["zzz"]);
assert.deepEqual(keep2, ["g", "a", "b", "zzz"], "no registry → no found-adjacent source");
// the Options parameterization: policyFileName via the call, not the State
FileSystem.writeFileSync(globalPolicy, JSON.stringify({ keep: ["g", "a"] }));
const keepOpt = factory.ResolvePolicy(st1, proj, null, [], {
	policyFileName: "pin-policy.json",
	policyFileField: "Policy",
});
assert.ok(
	keepOpt.includes("a") && keepOpt.includes("b"),
	"Options-parameterized lookup works on a State without PolicyName",
);
FileSystem.writeFileSync(globalPolicy, "{ nope");
const keep3 = factory.ResolvePolicy(stP, proj, null, []);
assert.deepEqual(keep3, ["a", "b"], "unreadable global skipped + logged");
assert.ok(
	loggerLines.info.some((m) =>
		m.includes(`unreadable pin-policy.json at ${globalPolicy} — using built-in default`),
	),
	"unreadable-policy line composed with the parameterized filename",
);
ok("ResolvePolicy: union keep-list + P3 chain-keys + unreadable handling");

// ── 7. Gate: the full g1 matrix ──────────────────────────────────────────
const target = { targetKey: "k1", displayPath: Path.join(proj, "package.json") };
const actor = { name: "edit" };
const present = { kind: "present", version: "v1" };
const base = { basename: "package.json" };
assert.deepEqual(factory.Gate(st1, null, present, actor, base), { pass: false, reason: "target" });
assert.equal(factory.Gate(st1, target, present, undefined, base).reason, "actor");
assert.equal(factory.Gate(st1, target, present, { name: "grep" }, base).reason, "actor");
assert.equal(factory.Gate(st1, target, { kind: "absent" }, actor, base).reason, "kind");
st1.Stash.set("k1", "v1");
assert.equal(factory.Gate(st1, target, present, actor, base).reason, "idempotent");
st1.Stash.clear();
assert.equal(
	factory.Gate(st1, target, present, actor, { basename: "Cargo.toml" }).reason,
	"basename",
);
assert.equal(
	factory.Gate(
		st1,
		{ targetKey: "k1", displayPath: Path.join(Root, "x", "package.json") },
		present,
		actor,
		base,
	).reason,
	"excluded",
);
assert.deepEqual(factory.Gate(st1, target, present, actor, base), {
	pass: true,
	path: target.displayPath,
});
assert.equal(factory.Gate(st1, target, present, actor, base).pass, true);
const st3 = factory.State(ctx, { logFile: Ledger, mutationTools: ["zwrite"] }, { module: "f" });
assert.equal(
	factory.Gate(st3, target, present, actor, {
		basename: "package.json",
		mutationToolsField: "Tool",
	}).reason,
	"actor",
);
// the raw-write's wrapped actor (the `govern` marker): the event path skips it
// silently, regardless of the marker's value — the direct path is the channel
assert.deepEqual(factory.Gate(st1, target, present, { ...actor, govern: false }, base), {
	pass: false,
	reason: "govern",
	path: target.displayPath,
});
assert.equal(factory.Gate(st1, target, present, { ...actor, govern: true }, base).reason, "govern");
assert.equal(
	factory.Gate(st1, target, present, { ...actor, govern: ["canonicalize"] }, base).reason,
	"govern",
);
assert.equal(
	factory.Gate(st1, target, present, { name: "raw-write" }, base).reason,
	"actor",
	"the marker is the gate: a name alone keeps the actor check",
);
ok("Gate: full g1 matrix (target/govern/actor/kind/idempotent/basename/excluded/pass)");

// ── 8. Append: byte-identical ledger semantics ───────────────────────────
factory.Append(st1, "smoke ledger line");
const lines = FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
assert.match(lines.at(-1), /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] smoke ledger line$/);
assert.equal(loggerLines.info.at(-1), "smoke-flavor: smoke ledger line");
const stOff = factory.State(ctx, { logFile: Ledger, log: false }, { module: "f" });
const sizeBefore = FileSystem.statSync(Ledger).size;
assert.doesNotThrow(() => factory.Append(stOff, "disabled line"));
assert.equal(FileSystem.statSync(Ledger).size, sizeBefore, "Enabled=false → no file append");
assert.doesNotThrow(() => factory.Append(stOff, "bad ledger path"), "never throws");
ok("Append: [ISO] line + logger prefix + Enabled gate + never throws");

// ── 9. Journal: silent-skip + record paths ───────────────────────────────
assert.doesNotThrow(() => factory.Journal(st1, "activated", "", "proof"));
assert.equal(factory.PendingJournal.length, 1, "queued into the pre-bind buffer");
assert.deepEqual(factory.PendingJournal[0], {
	event: "activated",
	path: "",
	detail: "proof",
	at: factory.PendingJournal[0].at,
});
assert.equal(st1.Queue.length, 0, "the per-State queue stays empty while the buffer is live");
// the defensive fallback: buffer retired + no shared sink → per-State sink
const BufferBackup = factory.PendingJournal;
factory.PendingJournal = undefined;
assert.doesNotThrow(() => {
	st1.Journal = () => {
		throw new Error("storage broke");
	};
	factory.Journal(st1, "governed", "/p", "v");
});
factory.PendingJournal = BufferBackup;
ok("Journal: pre-bind buffer sink + per-State fallback + storage failure contained (silent skip)");

// ── 10. GuardedWrite: both sandbox postures + version guard ─────────────
ctx.fs.sandboxMode = undefined;
const out1 = await factory.GuardedWrite(st1, target, "{}\n", "v1");
assert.equal(out1.version, "fresh-v2");
assert.deepEqual(writes.at(-1).intent, { kind: "replaceIfVersion", version: "v1" });
assert.equal(writes.at(-1).fence, null, "bare backend → NO fence policy");
assert.equal(st1.Stash.get("k1"), "fresh-v2", "fresh version pre-registered");
ctx.fs.sandboxMode = "workspace-write";
await factory.GuardedWrite(st1, target, "{}\n", "fresh-v2");
assert.deepEqual(
	writes.at(-1).fence,
	{ mode: "workspace-write", workspaceRoot: proj },
	"confined backend → fence rooted at the file's own directory",
);
assert.equal(st1.Stash.get("k1"), "fresh-v2");
ok("GuardedWrite: replaceIfVersion intent + both P4 postures + Stash pre-registration");

// ── 11. Refresh: same-actor re-emit ──────────────────────────────────────
emitted.length = 0;
factory.Refresh(st1, target, actor, "fresh-v2");
assert.deepEqual(emitted.at(-1), [
	"fs/observed",
	target,
	{ kind: "present", version: "fresh-v2" },
	actor,
]);
assert.equal(st1.Stash.get("k1"), "fresh-v2");
assert.doesNotThrow(() => {
	ctx.emit = () => {
		throw new Error("bus down");
	};
	factory.Refresh(st1, target, actor, "x");
	ctx.emit = (n, ...a) => emitted.push([n, ...a]);
}, "best-effort");
ok("Refresh: P3/U2 re-emit with the same actor + best-effort");

// ── 12. Continue: the FULL continuation lifecycle (mini module) ─────────
FileSystem.unlinkSync(Path.join(proj, "pin-policy.json")); // keep section 8 fixtures out of the module's keep-list
FileSystem.unlinkSync(Path.join(Root, "pin-policy.json"));
const flavorLedger = Path.join(Root, "flavor-ledger.log");
const stF = factory.State(
	ctx,
	{ log: true, logFile: flavorLedger, exclude: [], mutationTools: ["edit"] },
	{ module: "smoke-pinner", fields: { Section: "sections" }, policyFileName: "pin-policy.json" },
);
stF.fields = undefined; // not used
let CURRENT = null;
const miniTransform = (text, section, keep) => {
	CURRENT.inflightAtTransform = CURRENT.Inflight.size;
	if (text === null) {
		factory.Append(
			CURRENT,
			`observed non-JSON package.json ${CURRENT.lastTarget?.displayPath} — skipped`,
		);
		return null;
	}
	let doc;
	try {
		doc = JSON.parse(text);
	} catch {
		return null;
	}
	const next = { ...doc, dependencies: { ...doc.dependencies } };
	let count = 0;
	for (const [k, v] of Object.entries(next.dependencies ?? {})) {
		if (keep.includes(k) || typeof v !== "string" || !v.startsWith("^")) continue;
		next.dependencies[k] = v.slice(1);
		count++;
	}
	if (count === 0) return null;
	return {
		next,
		count,
		message: (outcome) =>
			`pinned ${CURRENT.lastTarget?.displayPath} (${count} versions) → ${outcome.version}`,
	};
};

// 12a. the CHANGE path: Inflight registered during, write + message + re-emit + removed after
const files = {
	[target.displayPath]: JSON.stringify({ name: "x", dependencies: { a: "^1.0.0", b: "2.0.0" } }),
};
const ctxC = makeCtx({ files });
ctxC.logger = fakeLogger;
const stC = factory.State(
	ctxC,
	{ log: true, logFile: flavorLedger, exclude: [], mutationTools: ["edit"] },
	{ module: "smoke-pinner", policyFileName: "pin-policy.json" },
);
stC.lastTarget = target;
stC.inflightAtTransform = 0;
CURRENT = stC;
await factory.Continue(
	stC,
	target,
	actor,
	proj,
	Path.join(Root, "registry.json"),
	"v1",
	miniTransform,
);
assert.equal(stC.inflightAtTransform, 1, "Inflight registered before the transform");
assert.equal(stC.Inflight.size, 0, "Inflight removed after settlement");
assert.equal(writes.at(-1).path, target.displayPath);
// The intent's version is the fresh-stat CURRENT version — which equals the
// observed one in this unraced scenario (the file did not advance between
// the observation and the chain), so the value is unchanged BY DESIGN.
assert.deepEqual(writes.at(-1).intent, { kind: "replaceIfVersion", version: "v1" });
// the fresh-stat probe happened before the write: read-only, signal-carrying
assert.deepEqual(stats.at(-1), [target.displayPath, true], "the chain stat probe");
assert.equal(JSON.parse(writes.at(-1).content).dependencies.a, "1.0.0", "pinned");
assert.equal(JSON.parse(writes.at(-1).content).dependencies.b, "2.0.0", "kept static");
assert.equal(
	JSON.parse(writes.at(-1).content).name,
	"x",
	"serialization preserves untouched sections",
);
const flavorLines = FileSystem.readFileSync(flavorLedger, "utf8");
assert.ok(flavorLines.includes("pinned /"), "module message logged via the ledger");
assert.match(flavorLines, /→ fresh-v2/, "message composed from the outcome version");
const reEmit = emitted.filter((e) => e[0] === "fs/observed").at(-1);
assert.deepEqual(reEmit.slice(1, 3), [target, { kind: "present", version: "fresh-v2" }]);
assert.equal(reEmit[3], actor, "same actor");
ok("Continue: change path — Inflight lifecycle, guarded write, message, same-actor re-emit");

// 12b. the NO-OP paths: null transform → no write, no emit, silent
writes.length = 0;
emitted.length = 0;
const filesNoop = { [target.displayPath]: JSON.stringify({ dependencies: { a: "1.0.0" } }) };
const ctxN = makeCtx({ files: filesNoop });
ctxN.logger = fakeLogger;
const stN = factory.State(
	ctxN,
	{ log: true, logFile: flavorLedger },
	{ module: "smoke-pinner", policyFileName: "pin-policy.json" },
);
stN.lastTarget = target;
CURRENT = stN;
await factory.Continue(
	stN,
	target,
	actor,
	proj,
	Path.join(Root, "registry.json"),
	"v1",
	miniTransform,
);
assert.equal(writes.length, 0, "no-op → no write");
assert.equal(emitted.length, 0, "no-op → no re-emit");
assert.equal(stN.Inflight.size, 0, "Inflight still removed");
// count === 0 → designed no-op
const ctxZ = makeCtx({
	files: { [target.displayPath]: JSON.stringify({ dependencies: { a: "^1.0.0" } }) },
});
ctxZ.logger = fakeLogger;
const stZ = factory.State(
	ctxZ,
	{ log: true, logFile: flavorLedger },
	{ module: "f", policyFileName: "pin-policy.json" },
);
stZ.lastTarget = target;
CURRENT = stZ;
await factory.Continue(stZ, target, actor, proj, null, "v1", () => ({ next: {}, count: 0 }));
assert.equal(writes.length, 0, "count===0 → no write");
ok("Continue: no-op paths (null + count 0) silent, Inflight cleaned");

// 12c. unreadable read → transform receives null (its non-JSON line is its own)
const ctxU = makeCtx({ files: {} });
ctxU.logger = fakeLogger;
const stU = factory.State(ctxU, { log: true, logFile: flavorLedger }, { module: "f" });
stU.lastTarget = target;
CURRENT = stU;
let gotNull = "unset";
await factory.Continue(stU, target, actor, proj, null, "v1", (text) => {
	gotNull = text;
	return null;
});
assert.equal(gotNull, null, "failed readText → null current");
ok("Continue: unreadable content handed to the transform as null");

// 12d. throw containment: logger-only suppression, never a rethrow
const ctxT = makeCtx({ files: { [target.displayPath]: "{}" } });
ctxT.logger = fakeLogger;
const stT = factory.State(ctxT, { log: true, logFile: flavorLedger }, { module: "cargo-governor" });
stT.lastTarget = target;
CURRENT = stT;
await assert.doesNotReject(() =>
	factory.Continue(stT, target, actor, proj, null, "v1", () => {
		throw new Error("boom");
	}),
);
assert.equal(loggerLines.error.at(-1), "cargo-governor: continuation error (suppressed): boom");
assert.equal(stT.Inflight.size, 0);
ok("Continue: throw contained — `<module>: continuation error (suppressed)` + Inflight cleaned");

// 12e. the keep-list reaches the transform: chain keys protect chain pins
const filesK = {
	[target.displayPath]: JSON.stringify({ dependencies: { leftpad: "^1.0.0", a: "^2.0.0" } }),
};
const ctxK = makeCtx({ files: filesK });
ctxK.logger = fakeLogger;
const stK = factory.State(
	ctxK,
	{ log: true, logFile: flavorLedger },
	{ module: "f", policyFileName: "pin-policy.json" },
);
stK.lastTarget = target;
CURRENT = stK;
await factory.Continue(
	stK,
	target,
	actor,
	proj,
	Path.join(Root, "registry.json"),
	"v1",
	miniTransform,
);
const writtenK = JSON.parse(writes.at(-1).content);
assert.equal(writtenK.dependencies.leftpad, "^1.0.0", "P3 chain key kept");
assert.equal(writtenK.dependencies.a, "2.0.0", "non-chain pinned");
ok("Continue: P3 chain-keys union protects chain pins in the transform");

// 12f. THE FRESH-VERSION BASIS (the live failure mode): the file advanced
// between the observation and the chain — in the direct-govern sequential
// fold the observed version is handed to every registered step, so a later
// step's chain write against it failed FS_STALE_VERSION and silently
// aborted the fold. The chain must stat the CURRENT version and write
// against THAT, not the stale observed one.
const filesRace = { [target.displayPath]: JSON.stringify({ dependencies: { q: "^1.0.0" } }) };
const ctxRace = makeCtx({
	files: filesRace,
	// the current file version after the earlier fold steps' writes
	stat: async (t, signal) => {
		stats.push([t.displayPath, signal !== undefined]);
		return { version: "current-v9" };
	},
});
ctxRace.logger = fakeLogger;
const stRace = factory.State(
	ctxRace,
	{ log: true, logFile: flavorLedger },
	{ module: "f", policyFileName: "pin-policy.json" },
);
stRace.lastTarget = target;
CURRENT = stRace;
await factory.Continue(stRace, target, actor, proj, null, "v-stale", () => ({
	next: { dependencies: { q: "1.0.0" } },
	count: 1,
	message: "pinned raced line",
}));
assert.deepEqual(
	writes.at(-1).intent,
	{ kind: "replaceIfVersion", version: "current-v9" },
	"the chain wrote against the FRESH stat version",
);
assert.notEqual(
	writes.at(-1).intent.version,
	"v-stale",
	"the stale observed version is never the intent's basis (the live failure mode)",
);
assert.deepEqual(
	stats.at(-1),
	[target.displayPath, true],
	"the raced pass also probed the fresh stat",
);
ok(
	"Continue: fresh-version basis — the file advanced before the chain, the write guards the CURRENT version (not the stale observed one)",
);

// ── 13. Wire: registration + the module's own activation proof ──────────
events.length = 0;
let observed = null;
factory.Wire(ctx, st1, (t, o, a) => {
	observed = [t, o, a];
});
assert.equal(events.at(-1)[0], "fs/observed");
events.at(-1)[1](target, present, actor);
assert.deepEqual(observed, [target, present, actor]);
factory.Append(st1, "activated (smoke)");
assert.ok(FileSystem.readFileSync(Ledger, "utf8").includes("activated (smoke)"));
ok("Wire: fiber-owned fs/observed registration + module-supplied activation proof");

// ── 14. Attach: P1 jobs + P2 inflight disposal + P5 storage ─────────────
const controllers = [];
const detached = [];
services["jobs"] = {
	attachController: (name) => {
		controllers.push(name);
		return () => detached.push(name);
	},
};
const stA = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
const flight = new AbortController();
stA.Inflight.set("k1", { controller: flight });
effects.length = 0;
factory.Attach(ctx, { state: stA, name: "smoke-flavor" });
const labels = effects.map((e) => e[0]);
assert.deepEqual(labels, ["smoke-flavor-jobs", "smoke-flavor-inflight", "smoke-flavor-storage"]);
assert.deepEqual(controllers, ["smoke-flavor"], "P1: jobs controller attached");
const inflightEffect = effects.find((e) => e[0] === "smoke-flavor-inflight")[1];
inflightEffect();
assert.equal(flight.signal.aborted, true, "P2: unload aborts the in-flight pass");
assert.equal(stA.Inflight.size, 0, "P2: map cleared");
// P5 absent → silent skip, sink retired
const stS = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
effects.length = 0;
factory.Attach(ctx, { state: stS, name: "smoke-flavor" });
const storageDispose = effects.find((e) => e[0] === "smoke-flavor-storage")[1];
stS.Journal("activated", "", "queued");
assert.equal(stS.Queue.length, 0, "P5 absent: sink retired — no queue growth");
storageDispose();
// P5 present → stub domain opens, queue drains, records flow. The stub's
// `open` CAPTURES the spec Function/Open passes to defineDomain (a small
// harness seam, mirroring the scenario style above): the SHARED
// package_governance v2 events table is asserted below — v2 BY DESIGN
// (register item #8: the "normalized" event is a new event name, and a new
// event name requires a new domain version).
const records = [];
let domainClosed = false;
let domainSpec = null;
services["storageDomain"] = {
	open: async (spec) => {
		domainSpec = spec;
		return {
			close: async () => {
				domainClosed = true;
			},
			table: () => ({ put: async (k, v) => records.push([k, v]) }),
		};
	},
};
const stD = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
stD.Journal("activated", "", "pre-open record");
effects.length = 0;
factory.Attach(ctx, { state: stD, name: "smoke-flavor" });
await new Promise((r) => setImmediate(() => setImmediate(r)));
assert.equal(stD.Queue.length, 0, "pre-open queue drained");
assert.equal(
	domainSpec && domainSpec.name,
	"package_governance",
	"P5 spec: the SHARED package_governance domain",
);
assert.equal(
	domainSpec && domainSpec.version,
	2,
	"P5 spec: domain VERSION 2 (item #8 — 'normalized' is a new event name, so a version bump)",
);
assert.ok(
	domainSpec && domainSpec.tables && domainSpec.tables.events,
	"P5 spec: declares the events table",
);
assert.deepEqual(
	domainSpec.tables.events.valueSchema.shape.event.options,
	["activated", "governed", "dispatched", "update-failed", "excluded", "normalized"],
	"P5 spec: v2 event vocabulary ('normalized' included)",
);
// The v2 open contract (the P5 fix): per-record layout + compatibleVersions
// [1] — the single-layout unit parser enforces exact version equality, so
// the per-record backend's legacy bootstrap migrates the pre-existing
// v1-stamped file instead of hard-failing `version-mismatch` — and the
// corrupt-record policy so one bad stored record can never brick the open.
assert.equal(
	domainSpec.layout,
	"per-record",
	"P5 spec: per-record LAYOUT (the v1→v2 self-migration path)",
);
assert.deepEqual(
	domainSpec.compatibleVersions,
	[1],
	"P5 spec: compatibleVersions [1] — the legacy v1 stamp migrates",
);
assert.equal(
	domainSpec.invalidRecords,
	"backup-and-skip",
	"P5 spec: backup-and-skip — one corrupt record cannot brick the open",
);
assert.equal(records.length, 1, "record flowed to the domain table");
assert.equal(records[0][1].event, "activated");
assert.equal(records[0][1].detail, "pre-open record");
stD.Journal("governed", "/p.json", "fresh-v2");
await new Promise((r) => setImmediate(r));
assert.equal(records.length, 2, "live records flow after open");
effects.find((e) => e[0] === "smoke-flavor-storage")[1]();
await new Promise((r) => setImmediate(r));
assert.equal(domainClosed, true, "P5 disposer closes the domain");
ok("Attach: P1 controller + P2 disposal + P5 open/drain/silent-skip/close");

// P5 open FAILURE → the loud ledger line (the P5 fix): a present facility
// whose open rejects produces exactly one best-effort ledger line
// ("storage journal open failed: <message>" — logger + the module's
// durable ledger, via the factory's own Append) and NO throw: the failed
// open never binds a sink or a domain handle, the best-effort posture
// stays (the absent-facility silent skip above is a different, still
// silent case — Open is never even called without a facility).
services["storageDomain"] = {
	open: async () => {
		throw new Error("version-mismatch");
	},
};
factory.SharedJournal = undefined;
factory.PendingJournal = [];
const failLedger = Path.join(Root, "fail-ledger.log");
const stFail = factory.State(ctx, { log: true, logFile: failLedger }, { module: "smoke-flavor" });
effects.length = 0;
factory.Attach(ctx, { state: stFail, name: "smoke-flavor" });
await new Promise((r) => setImmediate(() => setImmediate(r)));
assert.equal(stFail.Domain, undefined, "P5 failed open: no domain handle bound");
assert.equal(factory.SharedJournal, undefined, "P5 failed open: no shared sink bound");
assert.ok(
	FileSystem.readFileSync(failLedger, "utf8").includes(
		"storage journal open failed: version-mismatch",
	),
	"P5 failed open: the LOUD ledger line (best-effort, never rethrown)",
);
ok("Attach: P5 failed open → loud ledger line, no throw, no sink bound");

// ── 15. Schema: shared volatile fields + module fields ──────────────────
const { default: Unwrap } =
	await import("../packages/ets-plugin-dsh-factory/Target/Function/Unwrap.js");
const { default: SectionList } =
	await import("../packages/ets-plugin-dsh-factory/Target/Variable/Default.js");
const schema = factory.Schema(
	{ logFile: flavorLedger },
	{ sections: factory.Schema.constructor ? undefined : undefined },
);
const schema2 = factory.Schema({ logFile: flavorLedger });
const order = Object.keys(schema2.dict ?? {});
assert.deepEqual(order.slice(0, 6), [
	"log",
	"logFile",
	"updateCooldownMs",
	"mutationTools",
	"policyFile",
	"exclude",
]);
for (const f of ["log", "logFile", "updateCooldownMs", "mutationTools"])
	assert.equal(schema2.dict[f].meta.volatile, true, `${f} volatile`);
assert.equal(schema2.dict.logFile.meta.default, flavorLedger);
assert.equal(schema2.dict.updateCooldownMs.meta.default, 3000);
assert.equal(schema2.dict.policyFile.meta.default, "");
assert.deepEqual(schema2.dict.exclude.meta.default, SectionList);
assert.equal(schema2.dict.exclude.meta.volatile, undefined, "exclude not volatile");
// real schemastery validation: defaults filled, volatile cell produced + unwrapped
const validated = schema2({});
assert.equal(
	validated.logFile.get(),
	flavorLedger,
	"volatile logFile validates to a cell with the default",
);
assert.equal(validated.policyFile, "", "non-volatile policyFile validates to the plain default");
const unwrapped = Unwrap(validated);
assert.deepEqual(
	unwrapped.mutationTools,
	["write", "edit", "str_replace_editor", "raw-write"],
	"volatile cell unwrapped by State machinery",
);
assert.equal(unwrapped.log, true);
ok(
	"Schema: shared volatile fields, per-module defaults, module field slots, real validation + unwrap",
);

// ── 16+. Finer-grained edge checks ──────────────────────────────────────
// nearest registry wins when several exist up the tree
const deeper = Path.join(proj, "deeper");
FileSystem.mkdirSync(deeper, { recursive: true });
FileSystem.writeFileSync(Path.join(proj, "registry.json"), JSON.stringify({ level: "near" }));
assert.equal(Path.dirname(factory.Discover(deeper)), proj, "nearest registry.json wins");
FileSystem.unlinkSync(Path.join(proj, "registry.json"));
ok("Discover: nearest-wins over multiple levels");
// Parse on a directory is contained
assert.equal(factory.Parse(Root), null);
ok("Parse: directory path contained to null");
// configured-but-absent global policy: not a source, no unreadable line
const stQ = factory.State(
	ctx,
	{ logFile: Ledger, policyFile: Path.join(Root, "nope-policy.json") },
	{ module: "f", policyFileName: "pin-policy.json" },
);
const linesQ = FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean).length;
assert.deepEqual(factory.ResolvePolicy(stQ, proj, null, []), []);
assert.equal(
	FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean).length,
	linesQ,
	"absent global → no unreadable log",
);
ok("ResolvePolicy: configured-but-absent policy is silently not a source");
// Gate with an EMPTY tool list fails the actor gate (reads emit too)
const stE = factory.State(ctx, { logFile: Ledger, mutationTools: [] }, { module: "f" });
assert.equal(
	factory.Gate(stE, target, present, actor, {
		basename: "package.json",
		mutationToolsField: "Tool",
	}).reason,
	"actor",
);
ok("Gate: empty mutation-tool list → actor gate fails");
// GuardedWrite forwards the abort signal
ctx.fs.sandboxMode = undefined;
const signal = new AbortController().signal;
await factory.GuardedWrite(st1, target, "{}\n", "v1", signal);
assert.equal(writes.at(-1).signal, signal, "signal forwarded to ctx.fs.writeText");
ok("GuardedWrite: abort signal forwarded");
// Continue: message-as-string logged verbatim
const ctxM = makeCtx({
	files: { [target.displayPath]: JSON.stringify({ dependencies: { q: "^1.0.0" } }) },
});
ctxM.logger = fakeLogger;
const stM = factory.State(
	ctxM,
	{ log: true, logFile: flavorLedger },
	{ module: "f", policyFileName: "pin-policy.json" },
);
stM.lastTarget = target;
CURRENT = stM;
await factory.Continue(stM, target, actor, proj, null, "v1", () => ({
	next: { dependencies: { q: "1.0.0" } },
	count: 1,
	message: "pinned verbatim line",
}));
assert.ok(FileSystem.readFileSync(flavorLedger, "utf8").includes("pinned verbatim line"));
ok("Continue: string message logged verbatim after the guarded write");
// State tolerates a config missing optional shared fields
const stBare = factory.State(ctx, {}, { module: "f" });
assert.equal(stBare.Ledger, undefined);
assert.doesNotThrow(() => factory.Append(stBare, "bare"));
ok("State: missing config fields tolerated (schema guarantees them in production)");
// Schema: module fields appended last, after the shared block
const flavorField = factory.Schema({}, {}).dict.exclude;
const schema3 = factory.Schema({ logFile: flavorLedger }, { sections: flavorField });
assert.equal(
	Object.keys(schema3.dict).at(-1),
	"sections",
	"module field appended after the shared block",
);
assert.deepEqual(schema3.dict.sections.meta.default, SectionList);
assert.equal(
	schema3.dict.sections.meta.volatile,
	undefined,
	"module fields keep their own volatility",
);
ok("Schema: module field slots appended verbatim");
// Match: the manifest basename itself as an excluded segment
assert.equal(factory.Match("/a/b/package.json", ["package.json"]), true);
ok("Match: exact-segment equality");
// UpdateKey: the namespaced Inflight key for update-stage controllers (P2 —
// the chain pass keys by the plain targetKey; an update stage MUST register
// under this key or the chain's settlement can drop its controller)
assert.equal(factory.UpdateKey({ targetKey: "k1", displayPath: "/x/package.json" }), "update:k1");
assert.equal(factory.UpdateKey({ targetKey: "update:k1", displayPath: "/x" }), "update:update:k1");
ok("UpdateKey: the namespaced Inflight key (update:<targetKey>)");

// ── 17. The direct-govern registry + Govern (the raw-write tool's path) ──
// The registry starts empty (a govern call against it is a contained no-op)
assert.deepEqual(factory.GovernSteps, {}, "the registry starts empty");
{
	const goTarget = { targetKey: "k-gov", displayPath: Path.join(proj, "package.json") };
	// The SEQUENTIAL FOLD: Govern is async and awaits each step, so every
	// invocation below is awaited — the assertions observe each step's
	// completion in registered order (no invocation change weakens an
	// assertion; every message stays byte-identical).
	await assert.doesNotReject(
		() => factory.Govern(goTarget, true, actor, "v1"),
		"empty registry: governed no-op",
	);
	assert.equal(
		Object.keys(factory.GovernSteps).length,
		0,
		"empty registry: nothing registered by Govern itself",
	);
	// RegisterGovern stores per basename, in registration order
	const ran = [];
	const step = (name) => (target, act, ver) => ran.push([name, target.displayPath, act, ver]);
	factory.RegisterGovern("package.json", "first", step("first"));
	factory.RegisterGovern("package.json", "second", step("second"));
	factory.RegisterGovern("Cargo.toml", "cargo", step("cargo"));
	assert.deepEqual(
		factory.GovernSteps["package.json"].map((s) => s.name),
		["first", "second"],
		"RegisterGovern: steps stored per basename in registration order",
	);
	assert.deepEqual(
		factory.GovernSteps["Cargo.toml"].map((s) => s.name),
		["cargo"],
		"RegisterGovern: basenames are independent",
	);
	// selection resolution: true/"all" → all registered; array → named subset;
	// single name → that step; unknown names ignored; false/absent → none.
	ran.length = 0;
	await factory.Govern(goTarget, true, actor, "v1");
	assert.deepEqual(
		ran.map((r) => r[0]),
		["first", "second"],
		"Govern: true → every registered step",
	);
	assert.deepEqual(
		ran.map((r) => r[2]),
		[actor, actor],
		"Govern: steps receive the actor",
	);
	assert.deepEqual(
		ran.map((r) => r[3]),
		["v1", "v1"],
		"Govern: steps receive the version",
	);
	assert.deepEqual(
		ran.map((r) => r[1]),
		[goTarget.displayPath, goTarget.displayPath],
		"Govern: steps receive the target",
	);
	ran.length = 0;
	await factory.Govern(goTarget, ["second", "nope"], actor, "v2");
	assert.deepEqual(
		ran.map((r) => r[0]),
		["second"],
		"Govern: array → the named subset, unknown names ignored",
	);
	assert.deepEqual(
		ran.map((r) => r[3]),
		["v2"],
		"Govern: the subset received the version",
	);
	ran.length = 0;
	await factory.Govern(goTarget, "first", actor, "v3");
	assert.deepEqual(
		ran.map((r) => r[0]),
		["first"],
		"Govern: a single name selects that step",
	);
	ran.length = 0;
	await factory.Govern(goTarget, "nope", actor, "v3");
	await factory.Govern(goTarget, ["nope"], actor, "v3");
	assert.deepEqual(ran, [], "Govern: an unknown-only selection runs nothing");
	for (const None of [false, null, undefined]) {
		ran.length = 0;
		await factory.Govern(goTarget, None, actor, "v3");
		assert.deepEqual(ran, [], `Govern: ${String(None)} → no governance`);
	}
	// a step keyed by basename does not fire for another basename
	ran.length = 0;
	await factory.Govern(
		{ targetKey: "k-toml", displayPath: Path.join(proj, "Cargo.toml") },
		true,
		actor,
		"v4",
	);
	assert.deepEqual(
		ran.map((r) => r[0]),
		["cargo"],
		"Govern: basename resolution (package.json steps not fired for Cargo.toml)",
	);
	// contained execution: a throwing step doesn't propagate, later steps still run
	factory.RegisterGovern("package.json", "boom", () => {
		throw new Error("step boom");
	});
	ran.length = 0;
	await assert.doesNotReject(
		() => factory.Govern(goTarget, true, actor, "v5"),
		"a throwing step never propagates",
	);
	assert.deepEqual(
		ran.map((r) => r[0]),
		["first", "second"],
		"Govern: the steps after the throwing one still ran (per-step containment)",
	);
	// re-registration replaces in place (HMR reload, no duplicate)
	factory.RegisterGovern("package.json", "first", step("first2"));
	assert.deepEqual(
		factory.GovernSteps["package.json"].map((s) => s.name),
		["first", "second", "boom"],
		"RegisterGovern: same-name re-registration replaces in place (position preserved, no duplicate)",
	);
	ran.length = 0;
	await factory.Govern(goTarget, "first", actor, "v6");
	assert.deepEqual(
		ran.map((r) => r[0]),
		["first2"],
		"RegisterGovern: the replaced closure is the one that runs",
	);
}
ok(
	"Govern: the direct-govern registry — RegisterGovern storage, selection resolution (true/all/array/name/false), basename routing, per-step containment, in-place re-registration",
);

// ── 18. The #14 PARALLEL MARKER: the `{ steps, parallel }` form ──────────
// The object form alongside the legacy boolean/string/array selection: the
// inner selection resolves exactly as before, `parallel: true` switching
// the fold's concurrency to unbounded (`Effect.all`, fiber scheduling).
// Sequential is the DEFAULT (the live-verified race fix — unchanged). The
// marker's documented SAFETY CONDITION: disjoint targets only; same-file
// steps race. Accordingly the smoke exercises only DISJOINT-safe steps —
// each step's effects land on its OWN file — and asserts the marker
// semantics (accepted, all steps run and complete, real overlap) plus the
// containment invariants; the conflicting same-file race outcomes are
// deliberately NOT asserted (nothing else changes: every pre-existing
// assertion above stays byte-identical, sequential is still the default).
{
	const ctxP = makeCtx({ files: {} });
	ctxP.logger = fakeLogger;
	const factoryP = new PluginFactory(ctxP);
	const dirP = Path.join(Root, "proj-parallel");
	FileSystem.mkdirSync(dirP);
	const targetP = { targetKey: "k-par", displayPath: Path.join(dirP, "package.json") };
	const fileA = Path.join(dirP, "parallel-a.txt");
	const fileB = Path.join(dirP, "parallel-b.txt");
	const fileC = Path.join(dirP, "parallel-c.txt");
	const eventsP = [];
	// A DISJOINT-safe step: records its start, waits (so a parallel run can
	// be distinguished from a sequential one), writes its OWN file, records
	// its completion. The write is the step's settled effect.
	const step = (name, file, delay) => async () => {
		eventsP.push(`${name}:start`);
		if (delay > 0) await new Promise((r) => setTimeout(r, delay));
		FileSystem.writeFileSync(file, `${name}\n`);
		eventsP.push(`${name}:done`);
	};
	factoryP.RegisterGovern("package.json", "par-a", step("par-a", fileA, 25));
	factoryP.RegisterGovern("package.json", "par-b", step("par-b", fileB, 15));
	factoryP.RegisterGovern("package.json", "par-c", step("par-c", fileC, 10));

	// 18a. the marker is ACCEPTED and the steps ALL run and complete: the
	// parallel run resolves only after every step's effects settled (both
	// files written), and the caller is never disturbed.
	await assert.doesNotReject(
		() =>
			factoryP.Govern(targetP, { steps: ["par-a", "par-b"], parallel: true }, actor, "v-par"),
		"the marker form is accepted",
	);
	assert.equal(
		FileSystem.readFileSync(fileA, "utf8"),
		"par-a\n",
		"parallel: step a's effect settled (its file written)",
	);
	assert.equal(
		FileSystem.readFileSync(fileB, "utf8"),
		"par-b\n",
		"parallel: step b's effect settled (its file written)",
	);
	ok(
		"#14 parallel: the `{ steps, parallel }` marker is accepted and both disjoint-safe steps run and settle",
	);

	// 18b. REAL overlap (unbounded concurrency, not just acceptance): both
	// steps START before either finishes — the sequential fold's start/finish
	// pattern could never interleave like this.
	eventsP.length = 0;
	await factoryP.Govern(targetP, { steps: ["par-a", "par-b"], parallel: true }, actor, "v-par2");
	const firstDone = Math.min(
		...["par-a:done", "par-b:done"].map((m) => eventsP.indexOf(m)).filter((i) => i >= 0),
	);
	assert.equal(
		eventsP.slice(0, firstDone).filter((e) => e.endsWith(":start")).length,
		2,
		"parallel: both steps started before either finished (unbounded concurrency)",
	);
	assert.equal(
		FileSystem.existsSync(fileA) && FileSystem.existsSync(fileB),
		true,
		"parallel: both steps settled again",
	);
	ok("#14 parallel: real unbounded overlap — both steps started before either finished");

	// 18c. the INNER SELECTION still applies in parallel mode: the named
	// subset runs, the unselected steps do not.
	FileSystem.rmSync(fileB, { force: true });
	eventsP.length = 0;
	await factoryP.Govern(targetP, { steps: ["par-a"], parallel: true }, actor, "v-par3");
	assert.equal(
		eventsP.includes("par-a:start"),
		true,
		"parallel + inner selection: the selected step ran",
	);
	assert.equal(
		eventsP.includes("par-b:start"),
		false,
		"parallel + inner selection: the unselected step did not run",
	);
	assert.equal(
		FileSystem.existsSync(fileB),
		false,
		"parallel + inner selection: the unselected step's effect is absent",
	);
	// single-name form inside the marker too
	eventsP.length = 0;
	await factoryP.Govern(targetP, { steps: "par-b", parallel: true }, actor, "v-par4");
	assert.deepEqual(
		eventsP,
		["par-b:start", "par-b:done"],
		"parallel: single-name inner selection runs just that step",
	);
	ok(
		"#14 parallel: the inner selection still applies — array and single-name forms run only the selected steps",
	);

	// 18d. the OBJECT FORM DEFAULT is SEQUENTIAL: without `parallel: true`,
	// the same marker form keeps the live-verified fold order — each step
	// completes before the next starts (the existing order semantics,
	// unchanged).
	eventsP.length = 0;
	FileSystem.rmSync(fileA, { force: true });
	FileSystem.rmSync(fileB, { force: true });
	await factoryP.Govern(targetP, { steps: ["par-a", "par-b"] }, actor, "v-par5");
	assert.deepEqual(
		eventsP,
		["par-a:start", "par-a:done", "par-b:start", "par-b:done"],
		"object form without the marker: the sequential fold (each step completes before the next starts)",
	);
	assert.equal(
		FileSystem.existsSync(fileA) && FileSystem.existsSync(fileB),
		true,
		"sequential object form: both steps settled",
	);
	ok(
		"#14 parallel: the object form WITHOUT the marker keeps the sequential fold (each step completes before the next starts)",
	);

	// 18e. CONTAINMENT in parallel mode: a throwing step never propagates
	// and the other step still runs and completes (the silence invariant in
	// both modes).
	factoryP.RegisterGovern("package.json", "par-boom", () => {
		throw new Error("parallel boom");
	});
	FileSystem.rmSync(fileB, { force: true });
	eventsP.length = 0;
	await assert.doesNotReject(
		() =>
			factoryP.Govern(
				targetP,
				{ steps: ["par-boom", "par-b"], parallel: true },
				actor,
				"v-par6",
			),
		"parallel: a throwing step never propagates",
	);
	assert.equal(
		FileSystem.readFileSync(fileB, "utf8"),
		"par-b\n",
		"parallel: the step after the throwing one still ran and settled",
	);
	ok(
		"#14 parallel: containment — a throwing step never propagates and the other step still runs and settles",
	);

	// 18f. `steps: true` / `"all"` inside the marker: every registered step
	// runs in parallel, the throwing one contained, all effects settled.
	FileSystem.rmSync(fileA, { force: true });
	FileSystem.rmSync(fileB, { force: true });
	FileSystem.rmSync(fileC, { force: true });
	await assert.doesNotReject(
		() => factoryP.Govern(targetP, { steps: true, parallel: true }, actor, "v-par7"),
		"parallel: `steps: true` accepted (all registered steps)",
	);
	assert.equal(
		FileSystem.existsSync(fileA) &&
			FileSystem.existsSync(fileB) &&
			FileSystem.existsSync(fileC),
		true,
		"parallel: all three registered steps' effects settled",
	);
	await assert.doesNotReject(
		() => factoryP.Govern(targetP, { steps: "all", parallel: true }, actor, "v-par8"),
		"parallel: `steps: 'all'` accepted",
	);
	ok(
		"#14 parallel: `steps: true` / `steps: 'all'` run every registered step, the throwing one contained",
	);

	// 18g. the no-op inner selections stay no-ops in the marker form.
	eventsP.length = 0;
	for (const None of [false, null, undefined]) {
		await factoryP.Govern(targetP, { steps: None, parallel: true }, actor, "v-par9");
	}
	assert.deepEqual(eventsP, [], "parallel: false/null/undefined inner selections run nothing");
}
ok("#14 parallel: false/null/undefined inner selections stay no-ops in the marker form");

// ── TRACING MODE tail (the hygiene rule) ─────────────────────────────────
// No `ok()` here and no stdout output at all: the mode must leave the `ok`
// stream byte-identical with the default run. The tail only (a) waits for
// the BatchSpanProcessor's fast flush (200ms schedule, set above) and
// (b) asserts the local collector actually received OTLP exports — the
// traced runtime was LIVE for the whole suite (every factory instance's
// `dsh.*` spans), not silently off. Every ledger assertion above ran
// through the traced runtime unchanged: the byte-identical smoke contract
// holds with tracing on.
if (TRACING) {
	await new Promise((r) => setTimeout(r, 2000));
	assert.ok(
		tracingHits > 0,
		"tracing mode: the local collector received OTLP span exports (traced runtime live)",
	);
	tracingServer.close();
}

// ── done ─────────────────────────────────────────────────────────────────
console.log(`\n${N} checks — ALL PASS`);
