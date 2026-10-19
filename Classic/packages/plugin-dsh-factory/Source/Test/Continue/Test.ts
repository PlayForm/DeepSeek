// Source/Test/Continue/Test.ts - one singular test: the FULL continuation
// lifecycle (the mini module) - the change path (Inflight registered during,
// guarded write, module message, same-actor re-emit, removed after), the
// no-op paths (null transform, count 0), the unreadable content handed to the
// transform as null, the throw containment, the P3 chain-keys union in the
// transform, the fresh-version basis (the live failure mode), and the string
// message logged verbatim.
// Runs standalone (`node Target/Test/Continue/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/plugin-dsh-factory: the fake ctx + the REAL factory
// class, from the Harness.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	CheckAsync,
	Finish,
	MakeCounter,
	Make,
	TempRoot,
	FactoryClass,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// The folder fixtures: the temp root with the proj directory, the
	// auxiliary registry ({effectiveLatest: {leftpad: '1.0.0'}} - the chain
	// source) and the global policy ({keep: ['g','a']}). NO pin-policy.json is
	// created here: the source suite unlinks both pin-policy files before this
	// section ("keep section 8 fixtures out of the module's keep-list") and
	// the continuation scenarios must observe the same policy state.
	const Root = TempRoot("factory-smoke-");
	const proj = Path.join(Root, "proj");
	FileSystem.mkdirSync(proj);
	const target = { targetKey: "k1", displayPath: Path.join(proj, "package.json") };
	const actor = { name: "edit" };
	FileSystem.writeFileSync(
		Path.join(Root, "registry.json"),
		JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
	);
	FileSystem.writeFileSync(Path.join(Root, "global-policy.json"), JSON.stringify({ keep: ["g", "a"] }));
	const flavorLedger = Path.join(Root, "flavor-ledger.log");
	const factory: any = new FactoryClass(Make(null, { files: {} }).Context);
	let CURRENT: any = null;
	const miniTransform = (text: any, _section: any, keep: any) => {
		CURRENT.inflightAtTransform = CURRENT.Inflight.size;
		if (text === null) {
			factory.Append(
				CURRENT,
				`observed non-JSON package.json ${CURRENT.lastTarget?.displayPath} \u2014 skipped`,
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
			message: (outcome: any) =>
				`pinned ${CURRENT.lastTarget?.displayPath} (${count} versions) \u2192 ${outcome.version}`,
		};
	};
	// Group: 12a - the CHANGE path: Inflight registered during, write + message
	// + re-emit + removed after.
	{
		const Sub = "Continue: change path \u2014 Inflight lifecycle, guarded write, message, same-actor re-emit";
		{
			await CheckAsync(Count, Sub, async () => {
				const files: Record<string, string> = {
					[target.displayPath]: JSON.stringify({ name: "x", dependencies: { a: "^1.0.0", b: "2.0.0" } }),
				};
				const C = Make(null, { files });
				const ctxC = C.Context;
				const { writes, stats, emitted } = C;
				const stC: any = factory.State(
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
				// The intent's version is the fresh-stat CURRENT version - which equals
				// the observed one in this unraced scenario (the file did not advance
				// between the observation and the chain), so the value is unchanged BY
				// DESIGN.
				assert.deepEqual(writes.at(-1).intent, { kind: "replaceIfVersion", version: "v1" });
				// the fresh-stat probe happened before the write: read-only,
				// signal-carrying
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
				assert.match(flavorLines, /\u2192 fresh-v2/, "message composed from the outcome version");
				const reEmit = emitted.filter((e: any[]) => e[0] === "fs/observed").at(-1);
				assert.deepEqual(reEmit.slice(1, 3), [target, { kind: "present", version: "fresh-v2" }]);
				assert.equal(reEmit[3], actor, "same actor");
			});
		}
	}
	// Group: 12b - the NO-OP paths: null transform \u2192 no write, no emit, silent;
	// count === 0 \u2192 designed no-op.
	{
		const Sub = "Continue: no-op paths (null + count 0) silent, Inflight cleaned";
		{
			await CheckAsync(Count, Sub, async () => {
				const N = Make(null, {
					files: { [target.displayPath]: JSON.stringify({ dependencies: { a: "1.0.0" } }) },
				});
				const ctxN = N.Context;
				const { writes, emitted } = N;
				const stN: any = factory.State(
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
				assert.equal(writes.length, 0, "no-op \u2192 no write");
				assert.equal(emitted.length, 0, "no-op \u2192 no re-emit");
				assert.equal(stN.Inflight.size, 0, "Inflight still removed");
				const Z = Make(null, {
					files: { [target.displayPath]: JSON.stringify({ dependencies: { a: "^1.0.0" } }) },
				});
				const ctxZ = Z.Context;
				const { writes: writesZ } = Z;
				const stZ: any = factory.State(
					ctxZ,
					{ log: true, logFile: flavorLedger },
					{ module: "f", policyFileName: "pin-policy.json" },
				);
				stZ.lastTarget = target;
				CURRENT = stZ;
				await factory.Continue(stZ, target, actor, proj, null, "v1", () => ({
					next: {},
					count: 0,
				}));
				assert.equal(writesZ.length, 0, "count===0 \u2192 no write");
			});
		}
	}
	// Group: 12c - unreadable read \u2192 transform receives null (its non-JSON line
	// is its own).
	{
		const Sub = "Continue: unreadable content handed to the transform as null";
		{
			await CheckAsync(Count, Sub, async () => {
				const U = Make(null, { files: {} });
				const ctxU = U.Context;
				const stU: any = factory.State(ctxU, { log: true, logFile: flavorLedger }, { module: "f" });
				stU.lastTarget = target;
				CURRENT = stU;
				let gotNull: unknown = "unset";
				await factory.Continue(stU, target, actor, proj, null, "v1", (text: unknown) => {
					gotNull = text;
					return null;
				});
				assert.equal(gotNull, null, "failed readText \u2192 null current");
			});
		}
	}
	// Group: 12d - throw containment: logger-only suppression, never a rethrow.
	{
		const Sub =
			"Continue: throw contained \u2014 `<module>: continuation error (suppressed)` + Inflight cleaned";
		{
			await CheckAsync(Count, Sub, async () => {
				const T = Make(null, { files: { [target.displayPath]: "{}" } });
				const ctxT = T.Context;
				const { loggerLines } = T;
				const stT: any = factory.State(
					ctxT,
					{ log: true, logFile: flavorLedger },
					{ module: "cargo-governor" },
				);
				stT.lastTarget = target;
				CURRENT = stT;
				await assert.doesNotReject(() =>
					factory.Continue(stT, target, actor, proj, null, "v1", () => {
						throw new Error("boom");
					}),
				);
				assert.equal(
					loggerLines.error.at(-1),
					"cargo-governor: continuation error (suppressed): boom",
				);
				assert.equal(stT.Inflight.size, 0);
			});
		}
	}
	// Group: 12e - the keep-list reaches the transform: chain keys protect
	// chain pins.
	{
		const Sub = "Continue: P3 chain-keys union protects chain pins in the transform";
		{
			await CheckAsync(Count, Sub, async () => {
				const K = Make(null, {
					files: {
						[target.displayPath]: JSON.stringify({ dependencies: { leftpad: "^1.0.0", a: "^2.0.0" } }),
					},
				});
				const ctxK = K.Context;
				const { writes } = K;
				const stK: any = factory.State(
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
			});
		}
	}
	// Group: 12f - THE FRESH-VERSION BASIS (the live failure mode): the file
	// advanced between the observation and the chain - in the direct-govern
	// sequential fold the observed version is handed to every registered step,
	// so a later step's chain write against it failed FS_STALE_VERSION and
	// silently aborted the fold. The chain must stat the CURRENT version and
	// write against THAT, not the stale observed one.
	{
		const Sub =
			"Continue: fresh-version basis \u2014 the file advanced before the chain, the write guards the CURRENT version (not the stale observed one)";
		{
			await CheckAsync(Count, Sub, async () => {
				const Race = Make(null, {
					files: { [target.displayPath]: JSON.stringify({ dependencies: { q: "^1.0.0" } }) },
					// the current file version after the earlier fold steps' writes
					stat: async (t: any, signal: unknown) => {
						Race.stats.push([t.displayPath, signal !== undefined]);
						return { version: "current-v9" };
					},
				});
				const ctxRace = Race.Context;
				const { writes, stats } = Race;
				const stRace: any = factory.State(
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
			});
		}
	}
	// Group: Continue - message-as-string logged verbatim.
	{
		const Sub = "Continue: string message logged verbatim after the guarded write";
		{
			await CheckAsync(Count, Sub, async () => {
				const M = Make(null, {
					files: { [target.displayPath]: JSON.stringify({ dependencies: { q: "^1.0.0" } }) },
				});
				const ctxM = M.Context;
				const stM: any = factory.State(
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
			});
		}
	}
	return Finish(Count, "Continue");
};

// Standalone entry: `node Target/Test/Continue/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Continue`);
}
