// Source/Test/Direct-Govern-Folds-Wiring/Test.ts - one singular test: the
// direct-govern path (Factory.Govern to the registered pin step, guarded write
// at the fresh-stat version, unknown names ignored), the two-chain-writer fold
// in both registration orders (the enforced FS guard proving the fresh-stat
// basis), the factory wiring (the transform contract driven directly, the
// throw containment composing the pinner's Module), the P5 storage journal
// (the activated record drains; the disposer closes the domain), and the
// silence invariant (the broken ledger never throws; the hostile payload is
// suppressed logger-only).
// Runs standalone (`node Target/Test/Direct-Govern-Folds-Wiring/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-package-pinner.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Boot,
	Check,
	CheckAsync,
	Finish,
	Ledger,
	LedgerHas,
	Lines,
	MakeContext,
	MakeCounter,
	LoggerLines,
	Root,
	Settle,
	Wait,
	Write,
	token,
} from "../Harness.js";
import * as Pinner from "../../../Target/Library.js";
import FactoryClass from "../../../../ets-plugin-dsh-factory/Target/Library.js";
import LeafDefault from "../../../Target/Function/Transform.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const World = Boot();
	const { ctx, Factory, listener, st } = World;
	const actor = { name: "edit" };
	// Group: the direct-govern path (Factory.Govern to the registered pin step).
	{
		// The raw-write tool's per-call `govern` route: the step registered at
		// apply runs through the DIRECT path - a simulated raw-write-style
		// invocation with a real target and the observed version. The direct path
		// must match the event-path behavior the scenarios above assert (the same
		// guarded write, the same ledger strings, the Stash seeding).
		const pinDirDirect = Path.join(Root, "pin-direct");
		const pinPathDirect = Write(
			Path.join(pinDirDirect, "package.json"),
			JSON.stringify({ dependencies: { a: "^1.0.0", b: "2.0.0" } }),
		);
		const vDirect = token(pinPathDirect);
		const writesBeforeDirect = ctx.writes.length;
		// The SEQUENTIAL FOLD: Govern is async and awaits each step, so the
		// direct-path invocations below are awaited (every assertion stays
		// byte-identical; the single-step scenario is now deterministic by
		// construction - the chain completes before the call resolves).
		await Factory.Govern(
			{ targetKey: "pin-direct", displayPath: pinPathDirect },
			"pin",
			actor,
			vDirect,
		);
		await Settle(st);
		const writeDirect = ctx.writes.at(-1);
		const stDirect = st.Stash.get("pin-direct");
		// selection: unknown names are ignored (the registered name is the only one)
		const beforeLines = Lines(Ledger).length;
		await Factory.Govern(
			{ targetKey: "pin-direct2", displayPath: pinPathDirect },
			["bogus"],
			actor,
			vDirect,
		);
		await Settle(st);
		const afterBogusLines = Lines(Ledger).length;
		const Sub = "direct-govern: pin \u2014 Stash seed + Continue, ledger byte-identical, unknown names ignored";
		{
			Check(Count, Sub, () => {
				assert.equal(
					ctx.writes.length,
					writesBeforeDirect + 1,
					"pin: the chain pass wrote",
				);
				assert.deepEqual(
					writeDirect.intent,
					{ kind: "replaceIfVersion", version: vDirect },
					"pin: guarded write at the CURRENT (fresh-stat) version \u2014 equals the observed one in this unraced pass",
				);
				const pinnedDirect = JSON.parse(writeDirect.content);
				assert.equal(pinnedDirect.dependencies.a, "1.0.0", "pin: ^ stripped by the direct pass");
				assert.equal(
					pinnedDirect.dependencies.b,
					"2.0.0",
					"pin: static untouched by the direct pass",
				);
				assert.equal(
					stDirect,
					token(pinPathDirect),
					"pin: the Stash seeded (then advanced by the guarded write's fresh version)",
				);
				assert.ok(
					LedgerHas(Ledger, `pinned ${pinPathDirect} (1 versions)`),
					"pin: `pinned <path> (N versions)` byte-identical",
				);
				assert.equal(afterBogusLines, beforeLines, "selection: unknown step names run nothing");
			});
		}
	}
	// Group: the two-chain-writer fold (the live failure mode, enforced fs).
	const FoldCan = (P: string) => (text: any, _section: any, _keep: any) => {
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
		return { next, count: 1, message: (o: any) => `governed ${P} \u2192 ${o.version}` };
	};
	{
		// forward registered order: [pin (registered at apply), fold-canonicalize]
		const dir = Path.join(Root, "fold-forward");
		const regPath = Write(
			Path.join(dir, "registry.json"),
			JSON.stringify({ effectiveLatest: { leftpad: "1.2.3" } }),
		);
		const pathF = Write(
			Path.join(dir, "package.json"),
			JSON.stringify({ dependencies: { leftpad: "~1.0.0", other: "^2.0.0" } }),
		);
		const vFold = token(pathF);
		const stFold = Factory.State(
			ctx,
			{ log: true, logFile: Ledger },
			{ module: "package-governor", policyFileName: "pin-policy.json" },
		);
		Factory.RegisterGovern("package.json", "fold-canonicalize", (t: any, a: any, v: any) =>
			Factory.Continue(stFold, t, a, dir, regPath, v, FoldCan(pathF)),
		);
		const writesBeforeFold = ctx.writes.length;
		await Factory.Govern(
			{ targetKey: "fold-forward", displayPath: pathF },
			["pin", "fold-canonicalize"],
			actor,
			vFold,
		);
		await Settle(stFold);
		const foldWrites = ctx.writes.slice(writesBeforeFold);
		const foldLedger = Lines(Ledger);
		const pinnedIdx = foldLedger
			.map((l: string) => l.includes(`pinned ${pathF} (1 versions)`))
			.lastIndexOf(true);
		const governedIdx = foldLedger
			.map((l: string) => l.includes(`governed ${pathF} \u2192 `))
			.lastIndexOf(true);
		Factory.RegisterGovern("package.json", "fold-canonicalize", () => {}); // drop the sim step
		const Sub =
			"two-chain-writer fold (pin \u2192 canonicalize): both writes land at the fresh-stat version, both lines appear, final file canonical + pinned";
		{
			Check(Count, Sub, () => {
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
					"forward fold step 2 (canonicalize): guarded at the FRESH version \u2014 the pre-fix code failed FS_STALE_VERSION here",
				);
				assert.deepEqual(
					JSON.parse(FileSystem.readFileSync(pathF, "utf8")),
					{ dependencies: { leftpad: "^1.2.3", other: "2.0.0" } },
					"forward fold: final file canonical + pinned (deterministic convergence)",
				);
				assert.ok(
					pinnedIdx >= 0 && governedIdx > pinnedIdx,
					"forward fold: both lines appear in the fold's registered order (pinned, then governed)",
				);
			});
		}
	}
	{
		// reverse registered order: [fold-canonicalize-r, pin (apply registers after)]
		const ctxFold = MakeContext();
		const FactoryFold = new FactoryClass(ctxFold);
		const dir = Path.join(Root, "fold-reverse");
		const regPath = Write(
			Path.join(dir, "registry.json"),
			JSON.stringify({ effectiveLatest: { leftpad: "1.2.3" } }),
		);
		const pathR = Write(
			Path.join(dir, "package.json"),
			JSON.stringify({ dependencies: { leftpad: "~1.0.0", other: "^2.0.0" } }),
		);
		const vFoldR = token(pathR);
		const stFoldR = FactoryFold.State(
			ctxFold,
			{ log: true, logFile: Ledger },
			{ module: "package-governor", policyFileName: "pin-policy.json" },
		);
		FactoryFold.RegisterGovern("package.json", "fold-canonicalize-r", (t: any, a: any, v: any) =>
			FactoryFold.Continue(stFoldR, t, a, dir, regPath, v, FoldCan(pathR)),
		);
		Pinner.apply(ctxFold, (Pinner.Config as any)({ log: true, logFile: Ledger })); // registers "pin" AFTER the sim step
		const writesBeforeFoldR = ctxFold.writes.length;
		await FactoryFold.Govern(
			{ targetKey: "fold-reverse" as any, displayPath: pathR },
			true,
			actor,
			vFoldR as any,
		);
		await Settle(ctxFold.__hookDshPinnerPackageState);
		const foldRWrites = ctxFold.writes.slice(writesBeforeFoldR);
		const foldRLedger = Lines(Ledger);
		const governedIdxR = foldRLedger
			.map((l: string) => l.includes(`governed ${pathR} \u2192 `))
			.lastIndexOf(true);
		const pinnedIdxR = foldRLedger
			.map((l: string) => l.includes(`pinned ${pathR} (1 versions)`))
			.lastIndexOf(true);
		const Sub =
			"two-chain-writer fold (canonicalize \u2192 pin): reverse registration order converges to the same final state";
		{
			Check(Count, Sub, () => {
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
					"reverse fold step 2 (pin): guarded at the FRESH version \u2014 the pre-fix code failed FS_STALE_VERSION here",
				);
				assert.deepEqual(
					JSON.parse(FileSystem.readFileSync(pathR, "utf8")),
					{ dependencies: { leftpad: "^1.2.3", other: "2.0.0" } },
					"reverse fold: the SAME converged final state as the forward order (deterministic regardless of registration order)",
				);
				assert.ok(
					governedIdxR >= 0 && pinnedIdxR > governedIdxR,
					"reverse fold: both lines appear in this fold's registered order (governed, then pinned)",
				);
			});
		}
	}
	// Group: factory wiring - the transform contract, driven directly.
	{
		const appends: string[] = [];
		// Fixture-only scaffolding: the module leaf's furnace is a stub, not a
		// full PluginFactory - cast it so the fixtures pass plain runtime values
		// exactly like the source suite does.
		const leafFurnace: any = { Append: (_s: unknown, m: string) => appends.push(m) };
		// Fixture-only scaffolding: a partial State probe is enough for the
		// module leaf under test - cast it so the fixtures pass plain runtime
		// values exactly like the source suite does.
		const leafState: any = {
			Context: { logger: { info: (m: string) => LoggerLines.info.push(m) } },
			Ledger: Ledger,
			Enabled: true,
			Module: "package-pinner",
			Section: ["dependencies"],
		};
		const leafPath = "/tmp/smoke-leaf/package.json";
		const leaf = LeafDefault(leafFurnace, leafState, leafPath);
		const out = leaf(JSON.stringify({ dependencies: { a: "^1.0.0" } }), ["dependencies"], []);
		const Sub =
			"the transform contract: (current: string|null, section, keep) \u2192 {next, count, message}|null \u2014 the module leaf";
		{
			Check(Count, Sub, () => {
				assert.deepEqual(
					out.next,
					{ dependencies: { a: "1.0.0" } },
					"the transform returns the NEXT manifest",
				);
				assert.equal(out.count, 1, "\u2026the COUNT of pinned versions");
				assert.equal(
					out.message,
					`pinned ${leafPath} (1 versions)`,
					"\u2026and the module's message (the factory logs it after the write)",
				);
				assert.equal(
					leaf(null, ["dependencies"], []),
					null,
					"the contract: current = null (failed read) \u2192 null",
				);
				assert.equal(leaf("not json", ["dependencies"], []), null, "the contract: undecodable \u2192 null");
				assert.deepEqual(
					appends,
					[
						`observed non-JSON package.json ${leafPath} \u2014 skipped`,
						`observed non-JSON package.json ${leafPath} \u2014 skipped`,
					],
					"the module's no-op lines are logged INSIDE the transform (the factory stays silent)",
				);
				assert.equal(
					leaf(JSON.stringify({ dependencies: { a: "1.0.0" } }), ["dependencies"], []),
					null,
					"the contract: no change \u2192 null",
				);
				assert.equal(
					appends.at(-1),
					`no changes to pin for ${leafPath}`,
					"the no-changes line came from the transform",
				);
			});
		}
	}
	{
		// the factory's throw containment composes with the pinner's Module
		const errsAtWire = LoggerLines.error.length;
		const target = { targetKey: "pin-basic", displayPath: Path.join(Root, "pin-basic", "package.json") };
		const Sub =
			"factory wiring: the detached continuation is contained, logger-only, Inflight-cleaned";
		await CheckAsync(Count, Sub, async () => {
			await assert.doesNotReject(() =>
				Factory.Continue(st, target, actor, Path.join(Root, "pin-basic"), null, "v1", () => {
					throw new Error("boom");
				}),
			);
			assert.equal(
				LoggerLines.error.at(-1),
				"hook-dsh-pinner-package: continuation error (suppressed): boom",
				"factory.Continue composes the suppression line from State.Module",
			);
			assert.equal(st.Inflight.size, 0, "Inflight cleaned after the contained throw");
			assert.ok(LoggerLines.error.length > errsAtWire, "the suppression error was logged");
		});
	}
	// Group: the P5 storage journal (the activated record drains).
	{
		const records: any[] = [];
		let domainClosed = false;
		const ctxS = MakeContext();
		new FactoryClass(ctxS);
		ctxS.services["storageDomain"] = {
			open: async () => ({
				close: async () => {
					domainClosed = true;
				},
				table: () => ({ put: async (k: any, v: any) => records.push([k, v]) }),
			}),
		};
		const ledgerS = Path.join(Root, "ledger-storage.log");
		Pinner.apply(ctxS, (Pinner.Config as any)({ log: true, logFile: ledgerS }));
		await Wait();
		ctxS.effects.find((e: any) => e[0] === "hook-dsh-pinner-package-storage")[1]();
		await Wait();
		const Sub = "P5 storage: the activated record drains; the disposer closes the domain";
		{
			Check(Count, Sub, () => {
				assert.equal(
					ctxS.__hookDshPinnerPackageState.Queue.length,
					0,
					"the pre-open queue drained",
				);
				assert.equal(records.length, 1, "the activated record flowed to the domain");
				assert.equal(records[0]![1].event, "activated");
				assert.ok(
					records[0]![1].detail.startsWith("activated (pinner, "),
					"the record carries the activation proof",
				);
				assert.equal(domainClosed, true, "the storage disposer closes the domain");
			});
		}
	}
	// Group: the silence invariant.
	{
		// a broken ledger never throws out of the listener
		const ctxB = MakeContext();
		new FactoryClass(ctxB);
		Pinner.apply(
			ctxB,
			(Pinner.Config as any)({ log: true, logFile: Path.join(Root, "pin-basic") }),
		); // a DIRECTORY \u2014 appendFileSync fails
		const stB = ctxB.__hookDshPinnerPackageState;
		const exclDir = Path.join(Root, "silent", "node_modules", "z");
		FileSystem.mkdirSync(exclDir, { recursive: true });
		let threw: unknown = null;
		try {
			ctxB.events.find((e: any) => e[0] === "fs/observed")[1](
				{ targetKey: "silent", displayPath: Path.join(exclDir, "package.json") },
				{ kind: "present", version: "v1" },
				{ name: "edit" },
			);
		} catch (e) {
			threw = e;
		}
		await Settle(stB);
		const Sub = "silence: the ledger append is best-effort \u2014 never throws out of the listener";
		{
			Check(Count, Sub, () => {
				assert.equal(threw, null, "a broken ledger (appendFileSync failure) is swallowed");
				assert.ok(
					LoggerLines.info.some((m: string) =>
						m.includes("hook-dsh-pinner-package: skipped (excluded)"),
					),
					"the logger still recorded the line",
				);
			});
		}
	}
	{
		// a throwing target (hostile event payload) is suppressed logger-only
		const hostile: any = { targetKey: "hostile" };
		Object.defineProperty(hostile, "displayPath", {
			get() {
				throw new Error("hostile payload");
			},
		});
		const errsBeforeHostile = LoggerLines.error.length;
		let threw: unknown = null;
		try {
			listener(hostile, { kind: "present", version: "v1" }, actor);
		} catch (e) {
			threw = e;
		}
		await Settle(st);
		const Sub =
			"silence: a throw inside the listener is suppressed logger-only (the tool call never sees it)";
		{
			Check(Count, Sub, () => {
				assert.equal(threw, null, "the hostile payload does not escape");
				assert.equal(
					LoggerLines.error.at(-1),
					"hook-dsh-pinner-package: listener error (suppressed): hostile payload",
					"the listener suppression line",
				);
				assert.equal(
					LoggerLines.error.length,
					errsBeforeHostile + 1,
					"exactly one suppressed error",
				);
			});
		}
	}
	return Finish(Count, "Direct-Govern-Folds-Wiring");
};

// Standalone entry: `node Target/Test/Direct-Govern-Folds-Wiring/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Direct-Govern-Folds-Wiring`);
}
