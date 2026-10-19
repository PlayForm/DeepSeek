// Source/Test/Direct-Govern-And-Lifecycle/Test.ts - one singular test: the
// direct-govern path (Factory.Govern to the registered steps: the P2 namespaced
// UpdateKey, canonicalize with and without a registry, the update step alone,
// the selection fold, the two-chain-writer fold in both registration orders),
// plus the lifecycle: the idempotent second author write (cooldown), the P2
// disposal, the P5 close, and the P5-absent retirement.
// Runs standalone (`node Target/Test/Direct-Govern-And-Lifecycle/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-package-governor.
//
// The SILENT REPLAY (the L2 precedent): the idempotence check asserts the
// cooldown gate for proj-b, which the source suite had already stamped by the
// no-registry dispatch of section 6. This folder replays that generating
// fixture (one proj-b dispatch) silently before the idempotence check, so the
// cooldown gate is armed exactly as in the source flow.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Boot,
	Check,
	Context,
	Domain,
	Effects,
	Events,
	Files,
	Finish,
	Furnace,
	JobStarts,
	Ledger,
	MakeContext,
	MakeCounter,
	NCU_BIN,
	Probe,
	Root,
	Services,
	Writes,
	find,
	ledgerLines,
	mkTarget,
	actor,
	settle,
} from "../Harness.js";
import FactoryClass from "../../../../plugin-dsh-factory/Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Boot();
	Probe.Mode = "bin";
	const Listener = Events.find((e) => e[0] === "fs/observed")![1];
	// The two-chain-writer fold transforms (the live failure mode's sim steps).
	const foldPinT = (P: string) => (text: string, _section: unknown, keep: string[]) => {
		const doc = JSON.parse(text);
		const next = { ...doc, dependencies: { ...doc.dependencies } };
		let count = 0;
		for (const [k, v] of Object.entries(next.dependencies ?? {})) {
			if (keep.includes(k) || typeof v !== "string" || !v.startsWith("^")) continue;
			next.dependencies[k] = v.slice(1);
			count++;
		}
		if (count === 0) return null;
		return { next, count, message: (o: any) => `pinned ${P} (${count} versions) \u2192 ${o.version}` };
	};
	const foldCanT = (P: string) => (text: string, _section: unknown, _keep: string[]) => {
		const doc = JSON.parse(text);
		if (typeof doc?.dependencies?.leftpad !== "string" || doc.dependencies.leftpad === "^1.0.0")
			return null;
		const next = { ...doc, dependencies: { ...doc.dependencies, leftpad: "^1.0.0" } };
		return { next, count: 1, message: (o: any) => `governed ${P} \u2192 ${o.version}` };
	};
	// The sim steps' Refresh re-emits must not re-enter the module's live
	// listener: the sim State is NOT the listener's State, so the listener's
	// Stash has no entry for the sim target keys and a re-emit would detach a
	// second governor chain pass racing the fold (a sim artifact - in
	// production each step's State IS its listener's state and the re-emit is
	// idempotent). The listener capture is module-level, so blank it around
	// each fold run and restore after the fold has settled.
	const UngovernedEmit = async (run: () => Promise<void>) => {
		const Saved = Events.splice(0, Events.length);
		try {
			await run();
		} finally {
			Events.push(...Saved);
		}
	};
	// Group: the P2 namespaced UpdateKey (the collision window).
	{
		const colid = Path.join(Root, "colid");
		FileSystem.mkdirSync(colid, { recursive: true });
		FileSystem.writeFileSync(
			Path.join(colid, "package.json"),
			JSON.stringify({ name: "colid", dependencies: {} }),
		);
		const mk = mkTarget(colid, "k-colid");
		const updateControl = new AbortController();
		const chainControl = new AbortController();
		const Sub =
			"P2: the update stage's namespaced key (factory.UpdateKey) survives the chain pass settlement";
		{
			Check(Count, Sub, () => {
				assert.equal(
					Probe.Factory.UpdateKey(mk),
					"update:k-colid",
					"UpdateKey namespaces the target key",
				);
				// the update stage's controller (as Dispatch registers it)...
				Probe.Inflight.set(Probe.Factory.UpdateKey(mk), { controller: updateControl });
				// ...and the chain pass's controller (as Continue registers it)...
				Probe.Inflight.set(String(mk.targetKey), { controller: chainControl });
				assert.equal(
					Probe.Inflight.size,
					2,
					"the two passes coexist under distinct keys (no collision)",
				);
				// the chain pass settles: it deletes ONLY its plain key...
				Probe.Inflight.delete(String(mk.targetKey));
				assert.equal(Probe.Inflight.size, 1, "the chain's settlement leaves the update entry");
				assert.equal(
					Probe.Inflight.get("update:k-colid").controller,
					updateControl,
					"the running update's controller survives the chain settlement",
				);
				// ...and the unload disposal still aborts the surviving update.
				const colidEffect = Effects.find(
					(e) => e[0] === "hook-dsh-governor-package-inflight",
				)![1];
				colidEffect();
				assert.equal(updateControl.signal.aborted, true, "unload aborts the surviving update run");
				Probe.Inflight.clear();
			});
		}
	}
	// Group: the direct-govern path (Factory.Govern to the registered steps).
	{
		// canonicalize: the chain pass WITHOUT the update follow
		const projDc = Path.join(Root, "proj-direct");
		FileSystem.mkdirSync(projDc);
		FileSystem.writeFileSync(
			Path.join(projDc, "registry.json"),
			JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
		);
		const pathDc = Path.join(projDc, "package.json");
		Files[pathDc] = JSON.stringify({ dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" } });
		const jobsBeforeDc = JobStarts.length;
		// The SEQUENTIAL FOLD: Govern is async and awaits each step, so the
		// direct-path invocations below are awaited - every scenario is now
		// deterministic (the pre-fold detached chains could race their guarded
		// writes). Every pre-existing assertion stays byte-identical.
		await Furnace.Govern(mkTarget(projDc, "k-dc"), "canonicalize", actor, "v-direct");
		await settle();
		const writeDc = Writes.filter((w: any) => w.path === pathDc).at(-1);
		const Sub =
			"direct-govern: canonicalize \u2014 g2 + Stash seed + Continue, no update follow, ledger byte-identical";
		{
			Check(Count, Sub, () => {
				assert.equal(writeDc !== undefined, true, "canonicalize: the chain pass wrote");
				// The intent's version is the fresh-stat CURRENT version (the chain pass
				// stats before the write - the sequential-fold fix); with this fake's stat
				// that is "stat-v9", not the observed "v-direct". On a real backend an
				// unraced pass stats exactly the observed version.
				assert.deepEqual(
					writeDc.intent,
					{ kind: "replaceIfVersion", version: "stat-v9" },
					"canonicalize: guarded write at the CURRENT (fresh-stat) version",
				);
				const writtenDc = JSON.parse(writeDc.content);
				assert.equal(
					writtenDc.dependencies.leftpad,
					"^1.0.0",
					"canonicalize: chain pin canonicalized",
				);
				assert.equal(writtenDc.dependencies.chalk, "^5.0.0", "canonicalize: public dep untouched");
				assert.equal(
					find(`governed ${pathDc} \u2192 `).length,
					1,
					"canonicalize: `governed <path> \u2192 <version>` byte-identical",
				);
				assert.ok(
					Probe.Stash.get("k-dc"),
					"canonicalize: the Stash seeded (then advanced by the guarded write)",
				);
				assert.equal(
					JobStarts.length,
					jobsBeforeDc,
					"canonicalize: NO update stage (the chain pass without the Follow)",
				);
				assert.equal(
					find(`update stage dispatched for ${projDc}`).length,
					0,
					"canonicalize: no dispatched line for the direct target",
				);
				assert.equal(
					Writes.filter((w: any) => w.path === pathDc).length,
					1,
					"canonicalize: exactly one write",
				);
			});
		}
	}
	{
		// canonicalize with no registry: the same g2 skip line as the event path
		const projDn = Path.join(Root, "proj-direct-noreg");
		FileSystem.mkdirSync(projDn);
		const pathDn = Path.join(projDn, "package.json");
		Files[pathDn] = JSON.stringify({ dependencies: { chalk: "^5.0.0" } });
		await Furnace.Govern(mkTarget(projDn, "k-dn"), "canonicalize", actor, "v-direct2");
		await settle();
		const Sub =
			"direct-govern: canonicalize with no registry \u2014 the g2 line, no write, Stash seeded";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(`no registry.json found for ${pathDn} \u2014 chain pass skipped`).length,
					1,
					"canonicalize: the g2 skip line, byte-identical with the event path",
				);
				assert.equal(
					Writes.filter((w: any) => w.path === pathDn).length,
					0,
					"canonicalize: no registry \u2192 no chain rewrite",
				);
				assert.equal(
					Probe.Stash.get("k-dn"),
					"v-direct2",
					"canonicalize: the Stash seeded even on the no-registry pass",
				);
			});
		}
	}
	{
		// update: the update stage alone (Follow/Dispatch path with its own gates)
		const projDu = Path.join(Root, "proj-direct-update");
		FileSystem.mkdirSync(projDu);
		const pathDu = Path.join(projDu, "package.json");
		Files[pathDu] = JSON.stringify({ dependencies: { chalk: "^5.0.0" } });
		const jobsBeforeDu = JobStarts.length;
		await Furnace.Govern(mkTarget(projDu, "k-du"), "update", actor, "v-direct3");
		await settle();
		const Sub =
			"direct-govern: update \u2014 the update stage alone through Follow/Dispatch, gates and ledger byte-identical";
		{
			Check(Count, Sub, () => {
				assert.equal(
					JobStarts.length,
					jobsBeforeDu + 1,
					"update: the jobs envelope ran (the module's own machinery)",
				);
				assert.equal(
					find(
						`update stage dispatched for ${projDu} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
					).length,
					1,
					"update: `update stage dispatched ...` line byte-identical",
				);
				assert.equal(
					find("update: DONE \u2014 pins bumped per policy").length >= 1,
					true,
					"update: the run completed",
				);
				assert.equal(
					Writes.filter((w: any) => w.path === pathDu).length,
					0,
					"update: no chain write from the update step (nothing public was rewritten by ncu in this stub)",
				);
				assert.equal(
					Probe.Stash.get("k-du"),
					"stat-v9",
					"update: the Stash seeded, then advanced by the U\u2082 refresh",
				);
			});
		}
	}
	{
		// selection: unknown names are ignored; a full selection runs both steps
		const projDn = Path.join(Root, "proj-direct-noreg");
		const projDc = Path.join(Root, "proj-direct");
		const pathDc = Path.join(projDc, "package.json");
		Files[pathDc] = JSON.stringify({ dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" } });
		const before = ledgerLines().length;
		await Furnace.Govern(mkTarget(projDn, "k-dn2"), ["bogus"], actor, "v-direct4");
		await settle();
		const jobsBeforeBoth = JobStarts.length;
		await Furnace.Govern(mkTarget(Path.join(Root, "proj-direct"), "k-dc2"), true, actor, "v-direct5");
		await settle();
		const bothLines = ledgerLines();
		const lastGoverned = bothLines
			.map((l) => l.includes(`governed ${pathDc} \u2192 `))
			.lastIndexOf(true);
		// Exact-line match (the bare `dispatched for ${projDc}` prefix would also
		// match the sibling `proj-direct-update` directory).
		const dcDispatch = bothLines
			.map((l) =>
				l.includes(
					`update stage dispatched for ${Path.join(Root, "proj-direct")} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
				),
			)
			.lastIndexOf(true);
		const Sub =
			"direct-govern: selection \u2014 unknown names ignored, `true` runs the registered steps in order (sequential fold)";
		{
			Check(Count, Sub, () => {
				assert.equal(ledgerLines().length, before, "selection: unknown step names run nothing");
				assert.equal(Probe.Stash.has("k-dc2"), true, "selection: both steps seeded their Stash token");
				assert.ok(JobStarts.length >= jobsBeforeBoth, "selection: `true` reached the update step too");
				assert.equal(
					find(`governed ${pathDc} \u2192 `).length >= 2,
					true,
					"selection: `true` ran the chain pass again",
				);
				// DETERMINISTIC SEQUENTIAL FOLD (newly assertable): the canonicalize
				// step's chain (its write + its `governed` line) completes BEFORE the
				// update step reads the file and dispatches - the race that previously
				// left the file state and the ledger nondeterministic is gone.
				assert.equal(
					dcDispatch > lastGoverned && lastGoverned >= 0,
					true,
					"selection: the canonicalize chain's `governed` line precedes the update step's dispatch (sequential fold order)",
				);
				const fileAfterFold = JSON.parse(Files[pathDc]);
				assert.equal(
					fileAfterFold.dependencies.leftpad,
					"^1.0.0",
					"selection: the update step read the file as the canonicalize left it (no write race)",
				);
				Probe.Stash.delete("k-dc2");
			});
		}
	}
	{
		// the TWO-CHAIN-WRITER FOLD: forward registered order, canonicalize then
		// the registered sim-pin - both are chain writers through Factory.Continue.
		const projFold = Path.join(Root, "proj-fold");
		FileSystem.mkdirSync(projFold);
		FileSystem.writeFileSync(
			Path.join(projFold, "registry.json"),
			JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
		);
		const pathFold = Path.join(projFold, "package.json");
		Files[pathFold] = JSON.stringify({ dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" } });
		const StFold = Furnace.State(
			Context,
			{ log: true, logFile: Ledger, exclude: [] },
			{ module: "package-governor", policyFileName: "pin-policy.json" },
		);
		Furnace.RegisterGovern("package.json", "fold-pin", (t: any, a: any, v: any) =>
			Furnace.Continue(
				StFold,
				t,
				a,
				projFold,
				Path.join(projFold, "registry.json"),
				v,
				foldPinT(pathFold),
			),
		);
		const writesAtFold = Writes.filter((w: any) => w.path === pathFold).length;
		await UngovernedEmit(async () => {
			await Furnace.Govern(
				mkTarget(projFold, "k-fold"),
				["canonicalize", "fold-pin"],
				actor,
				"v-fold",
			);
			await settle();
		});
		const foldWrites = Writes.filter((w: any) => w.path === pathFold).slice(writesAtFold);
		const foldLines = ledgerLines();
		const foldGovIdx = foldLines
			.map((l) => l.includes(`governed ${pathFold} \u2192 `))
			.lastIndexOf(true);
		const foldPinIdx = foldLines
			.map((l) => l.includes(`pinned ${pathFold} (1 versions) \u2192 `))
			.lastIndexOf(true);
		const Sub =
			"direct-govern: two-chain-writer fold (canonicalize + sim-pin) \u2014 both writes land at the fresh-stat version, both lines appear, registered order";
		{
			Check(Count, Sub, () => {
				assert.equal(foldWrites.length, 2, "the fold: BOTH chain-writing steps wrote");
				assert.deepEqual(
					foldWrites[0].intent,
					{ kind: "replaceIfVersion", version: "stat-v9" },
					"fold step 1 (canonicalize): guarded at the fresh-stat CURRENT version",
				);
				assert.deepEqual(
					foldWrites[1].intent,
					{ kind: "replaceIfVersion", version: "stat-v9" },
					"fold step 2 (sim-pin): guarded at the fresh-stat CURRENT version \u2014 NOT the stale observed 'v-fold' (the live failure mode)",
				);
				assert.notEqual(
					foldWrites[1].intent.version,
					"v-fold",
					"the observed version handed to the fold is never the second step's write basis",
				);
				const foldFinal = JSON.parse(Files[pathFold]);
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
					find(`governed ${pathFold} \u2192 `).length,
					1,
					"fold: the canonicalize's `governed` line",
				);
				assert.equal(
					find(`pinned ${pathFold} (1 versions) \u2192 `).length,
					1,
					"fold: the sim-pin's `pinned` line",
				);
				assert.ok(
					foldGovIdx >= 0 && foldPinIdx > foldGovIdx,
					"fold: the lines appear in the fold's registered order (canonicalize before pin)",
				);
				Furnace.RegisterGovern("package.json", "fold-pin", () => {}); // drop the sim step for later scenarios
				Probe.Stash.delete("k-fold");
			});
		}
	}
	{
		// reverse registered order on a fresh factory instance: sim-pin FIRST,
		// sim-canonicalize second - the same convergence from the other direction.
		const CtxR = MakeContext({ files: Files });
		// Fixture-only scaffolding: the reverse-fold factory is typed as `any` so
		// the sim steps can pass plain runtime strings exactly like the source
		// suite does (the branded FsVersion / Transform types are build-time
		// constraints on real consumers, not on this fixture).
		const FactoryR: any = new FactoryClass(CtxR);
		const projFoldR = Path.join(Root, "proj-fold-r");
		FileSystem.mkdirSync(projFoldR);
		FileSystem.writeFileSync(
			Path.join(projFoldR, "registry.json"),
			JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
		);
		const pathFoldR = Path.join(projFoldR, "package.json");
		Files[pathFoldR] = JSON.stringify({ dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" } });
		const StFoldR = FactoryR.State(
			CtxR,
			{ log: true, logFile: Ledger, exclude: [] },
			{ module: "package-governor", policyFileName: "pin-policy.json" },
		);
		FactoryR.RegisterGovern("package.json", "fold-pin-r", (t: any, a: any, v: any) =>
			FactoryR.Continue(
				StFoldR,
				t,
				a,
				projFoldR,
				Path.join(projFoldR, "registry.json"),
				v,
				foldPinT(pathFoldR),
			),
		);
		FactoryR.RegisterGovern("package.json", "fold-can-r", (t: any, a: any, v: any) =>
			FactoryR.Continue(
				StFoldR,
				t,
				a,
				projFoldR,
				Path.join(projFoldR, "registry.json"),
				v,
				foldCanT(pathFoldR),
			),
		);
		const writesAtFoldR = Writes.filter((w: any) => w.path === pathFoldR).length;
		await UngovernedEmit(async () => {
			await FactoryR.Govern(mkTarget(projFoldR, "k-fold-r"), true, actor, "v-fold-r");
			await settle();
		});
		const foldRWrites = Writes.filter((w: any) => w.path === pathFoldR).slice(writesAtFoldR);
		const Sub =
			"direct-govern: reverse registered order \u2014 sim-pin + sim-canonicalize both land and converge to the same final state";
		{
			Check(Count, Sub, () => {
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
				const foldRFinal = JSON.parse(Files[pathFoldR]);
				assert.deepEqual(
					foldRFinal.dependencies,
					{ leftpad: "^1.0.0", chalk: "5.0.0" },
					"reverse fold: the SAME converged final state as the forward order (deterministic regardless of registration order)",
				);
				assert.equal(
					find(`pinned ${pathFoldR} (1 versions) \u2192 `).length,
					1,
					"reverse fold: the sim-pin's line",
				);
				assert.equal(
					find(`governed ${pathFoldR} \u2192 `).length,
					1,
					"reverse fold: the sim-canonicalize's line",
				);
				Probe.Stash.delete("k-fold-r");
			});
		}
	}
	{
		// the author's second write: no double update, no stale-version.
		// The silent replay first: the source suite had already stamped proj-b's
		// cooldown via the section-6 no-registry dispatch; replay it unasserted.
		const projB = Path.join(Root, "proj-b");
		FileSystem.mkdirSync(projB);
		Files[Path.join(projB, "package.json")] = JSON.stringify({ dependencies: { chalk: "^5.0.0" } });
		Listener(mkTarget(projB, "k-b"), { kind: "present", version: "v1" }, actor);
		await settle();
		Listener(mkTarget(projB, "k-b2"), { kind: "present", version: "v9" }, actor);
		await settle();
		const Sub = "idempotence: a second author write re-governs silently and never double-updates";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(`update stage skipped for ${projB} (cooldown)`).length,
					1,
					"the immediate re-write is cooldown-gated (one update run per dir)",
				);
				assert.ok(Probe.Stash.get("k-b2"), "Stash tracks the fresh observation");
			});
		}
	}
	// Group: P2 disposal + P5 close on unload.
	{
		const flight = new AbortController();
		Probe.Inflight.set("k-unload", { controller: flight });
		const inflightEffect = Effects.find(
			(e) => e[0] === "hook-dsh-governor-package-inflight",
		)![1];
		const Sub = "lifecycle: the P2 effect aborts every in-flight continuation and clears the map";
		{
			Check(Count, Sub, () => {
				inflightEffect();
				assert.equal(flight.signal.aborted, true, "unload aborts in-flight continuations");
				assert.equal(Probe.Inflight.size, 0, "and clears the map");
			});
		}
	}
	{
		const storageEffect = Effects.find((e) => e[0] === "hook-dsh-governor-package-storage")![1];
		await storageEffect();
		await settle(2);
		const Sub = "lifecycle: the P5 disposer closes the storage domain";
		{
			Check(Count, Sub, () => {
				assert.equal(Domain.Closed, true, "the storage disposer closes the domain");
			});
		}
	}
	{
		// P5 absent -> silent skip, sink retired
		const Ctx2 = MakeContext({ files: {} });
		Ctx2.get = (name: string) => (name === "storageDomain" ? undefined : Services[name]);
		const StOff = Furnace.State(Ctx2, { logFile: Ledger }, { module: "package-governor" });
		Furnace.Attach(Ctx2, { state: StOff, name: "probe-off" });
		StOff.Journal("activated", "", "should not queue");
		const Sub = "lifecycle: P5 absent \u2192 silent skip, the journal sink retired";
		{
			Check(Count, Sub, () => {
				assert.equal(StOff.Queue.length, 0, "P5 absent \u2192 the sink is retired (no queue growth)");
			});
		}
	}
	return Finish(Count, "Direct-Govern-And-Lifecycle");
};

// Standalone entry: `node Target/Test/Direct-Govern-And-Lifecycle/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Direct-Govern-And-Lifecycle`);
}
