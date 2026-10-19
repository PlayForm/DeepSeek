// Source/Test/Chain-Pass/Test.ts - one singular test: the chain pass through
// Factory.Continue + the module transform - the guarded write (the fresh-stat
// replaceIfVersion intent, the task-owned abort signal, the P4 fence on a bare
// backend), the canonicalized content with the public dep and non-dependency
// sections preserved, the byte-identical `governed <path> -> <version>` line,
// the P5 record, the same-actor re-emit, the Stash pre-registration, the P2
// Inflight lifecycle, the jobs envelope with the bin-mode engine run, the
// settlement cleanup, and the silent re-entrant pass.
// Runs standalone (`node Target/Test/Chain-Pass/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-package-governor.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Boot,
	Check,
	Emitted,
	Events,
	Files,
	Finish,
	Inflight,
	JobStarts,
	LoggerLines,
	MakeCounter,
	NCU_BIN,
	Probe,
	Root,
	SpawnSpecs,
	StorageRecords,
	Writes,
	find,
	ledgerLines,
	mkTarget,
	actor,
	settle,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Boot();
	Probe.Mode = "bin";
	const Listener = Events.find((e) => e[0] === "fs/observed")![1];
	// Group: the chain pass through Factory.Continue + the module transform.
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
	Files[pathA] = JSON.stringify(manifestA);
	const before = ledgerLines().length;
	Inflight.DuringRead = -1;
	Listener(mkTarget(projA, "k-a"), { kind: "present", version: "v1" }, actor);
	await settle();
	// g2 lines
	{
		const Sub =
			"chain pass: guarded write via Factory.Continue \u2014 replaceIfVersion intent + task-owned signal + P4 fence (bare backend)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(`no registry.json found for ${pathA} \u2014 chain pass skipped`).length,
					0,
				);
				// the governed write
				const writeA = Writes.at(-1);
				assert.equal(writeA.path, pathA);
				// The intent's version is the fresh-stat CURRENT version (the chain pass
				// stats the target right before the write - the sequential-fold fix, so a
				// later fold step's chain write never guards a version an earlier step's
				// write already superseded). This fake's stat returns "stat-v9" as the
				// current version; on a real backend an unraced pass stats exactly the
				// observed version, so the guarded semantics are unchanged.
				assert.deepEqual(writeA.intent, { kind: "replaceIfVersion", version: "stat-v9" });
				assert.equal(
					writeA.signal instanceof AbortSignal,
					true,
					"Continue's task-owned signal forwarded",
				);
				assert.equal(writeA.fence, null, "bare backend (sandboxMode undefined) -> no fence policy");
			});
		}
	}
	{
		const Sub =
			"chain pass: chain pin canonicalized to ^resolved, public dep + non-dependency sections preserved";
		{
			Check(Count, Sub, () => {
				const writeA = Writes.at(-1);
				const writtenA = JSON.parse(writeA.content);
				assert.equal(writtenA.dependencies.leftpad, "^1.0.0", "chain pin canonicalized to ^resolved");
				assert.equal(writtenA.dependencies.chalk, "^5.0.0", "public dep untouched by the chain pass");
				assert.deepEqual(writtenA.scripts, manifestA.scripts, "non-dependency sections preserved");
			});
		}
	}
	{
		const Sub = "chain pass: serialization JSON.stringify(next, null, 2) + newline (factory-owned)";
		{
			Check(Count, Sub, () => {
				const writeA = Writes.at(-1);
				assert.ok(
					writeA.content.endsWith("\n") && writeA.content.includes('\n  "name"'),
					"serialization JSON.stringify(next, null, 2) + newline",
				);
			});
		}
	}
	{
		const Sub =
			"version coherence: `governed <path> \u2192 <version>` line byte-identical (ledger + module-prefixed logger)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(`governed ${pathA} \u2192 fresh-1`).length,
					1,
					"`governed <path> \u2192 <version>` byte-identical",
				);
				assert.ok(
					LoggerLines.info.includes(`hook-dsh-governor-package: governed ${pathA} \u2192 fresh-1`),
					"logger line composed with the module prefix",
				);
			});
		}
	}
	{
		const Sub = "version coherence: the P5 `governed` record carries the fresh version";
		{
			Check(Count, Sub, () => {
				assert.ok(
					StorageRecords.some(
						([, r]) => r.event === "governed" && r.path === pathA && r.detail === "fresh-1",
					),
					"P5 governed record with the fresh version",
				);
			});
		}
	}
	{
		const Sub = "version coherence: the factory re-emits fs/observed with the SAME actor";
		{
			Check(Count, Sub, () => {
				const reEmit = Emitted.filter(
					(e) => e[0] === "fs/observed" && e[2]?.version === "fresh-1",
				).at(-1)!;
				assert.deepEqual(reEmit.slice(1, 3), [
					mkTarget(projA, "k-a"),
					{ kind: "present", version: "fresh-1" },
				]);
				assert.equal(reEmit[3], actor, "same actor \u21d2 same owner bucket");
			});
		}
	}
	{
		const Sub = "version coherence: Stash pre-registration before the re-emit (no second write)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					Writes.filter((w) => w.path === pathA).length,
					1,
					"the fresh-1 re-emit was a no-op (the factory pre-registered Stash before re-emitting)",
				);
				assert.equal(
					Probe.Stash.get("k-a"),
					"stat-v9",
					"U\u2082 re-registered the stat version after settlement",
				);
			});
		}
	}
	{
		const Sub = "Continue lifecycle: P2 Inflight registered during, removed after";
		{
			Check(Count, Sub, () => {
				// the Inflight lifecycle inside the factory's Continue
				assert.equal(Inflight.DuringRead, 1, "Inflight registered before readText (factory scaffolding)");
				assert.equal(Probe.Inflight.size, 0, "Inflight removed after settlement");
			});
		}
	}
	{
		const Sub = "jobs envelope: `update stage dispatched \u2026` line byte-identical + dispatched journal record";
		{
			Check(Count, Sub, () => {
				// the update stage followed the settled continuation (jobs envelope)
				assert.equal(JobStarts.length, 1, "one harness job started");
				const job = JobStarts[0];
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
					StorageRecords.some(
						([, r]) => r.event === "dispatched" && r.path === projA && r.detail === "bin",
					),
				);
			});
		}
	}
	{
		const Sub =
			"engine: bin mode \u2014 resolved binary through the seam, built-in dep groups, concurrency";
		{
			Check(Count, Sub, () => {
				// the bin-mode run through the subprocess seam
				assert.equal(find(`update: mode=bin (ncu binary ${NCU_BIN})`).length, 1);
				const spec = SpawnSpecs.at(-1);
				assert.equal(spec.cwd, projA);
				assert.deepEqual(spec.argv.slice(0, 3), [`resolved:${NCU_BIN}`, "-u", "--dep"]);
				assert.equal(spec.argv[3], "dev,optional,peer,prod,bundle", "built-in dep groups");
				assert.deepEqual(spec.argv.slice(4, 6), ["--concurrency", "8"]);
			});
		}
	}
	{
		const Sub =
			"engine: reject merge (policy \u222a chain deps, one -x argument) + target latest + DONE line";
		{
			Check(Count, Sub, () => {
				const spec = SpawnSpecs.at(-1);
				assert.ok(
					spec.argv.includes("-x") && spec.argv[spec.argv.indexOf("-x") + 1] === "tailwindcss,leftpad",
					"reject = policy reject \u222a chain deps, ONE comma-delimited argument",
				);
				assert.equal(spec.argv.includes("-a"), false, "no allow when the policy has none");
				assert.deepEqual(spec.argv.slice(-2), ["--target", "latest"]);
				assert.equal(find("update: DONE \u2014 pins bumped per policy").length, 1);
			});
		}
	}
	{
		const Sub = "settlement: breaker reset + per-dir in-flight + P2 map cleared";
		{
			Check(Count, Sub, () => {
				// settlement: breaker reset, U\u2082 refresh with the stat's version, silence
				assert.equal(Probe.Count.get(projA) ?? 0, 0, "breaker reset on success");
				assert.equal(Probe.Set.has(projA), false, "per-dir in-flight cleared");
				assert.equal(Probe.Inflight.size, 0, "P2 map cleared");
			});
		}
	}
	{
		const Sub = "settlement: U\u2082 stat-based refresh re-emitted with the same actor";
		{
			Check(Count, Sub, () => {
				const lastEmit = Emitted.filter((e) => e[0] === "fs/observed").at(-1)!;
				assert.deepEqual(
					lastEmit.slice(1, 3),
					[mkTarget(projA, "k-a"), { kind: "present", version: "stat-v9" }],
					"U\u2082: stat-based refresh re-emitted",
				);
				assert.equal(lastEmit[3], actor);
			});
		}
	}
	{
		const Sub = "settlement: the re-entrant pass after U\u2082 is a no-op (silence)";
		{
			Check(Count, Sub, () => {
				const afterSettle = ledgerLines().length;
				assert.equal(afterSettle, before + 5, "no extra lines: the re-entrant pass was a no-op");
			});
		}
	}
	return Finish(Count, "Chain-Pass");
};

// Standalone entry: `node Target/Test/Chain-Pass/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Chain-Pass`);
}
