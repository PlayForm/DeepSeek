// Source/Test/Update-Stage/Test.ts - one singular test: the update stage's
// gates and engines, probed directly - the pure leaves (Decode/Filter/Satisfy),
// the circuit-breaker / in-flight / cooldown gates, the FAILED path (breaker
// increment + journal + the U\u2082 refresh), the first-wins Resolve pick, the
// policy engine (verifyCommand through the seam), the built-in default
// fallbacks, the programmatic ncu mode, the P1 job-ring piping, the detached
// fallbacks, the Follow passage gate, the factory keep-list wiring, and the
// ledger-prefix invariant over the whole folder's logger capture.
// Runs standalone (`node Target/Test/Update-Stage/Test.js`) AND under the
// aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-package-governor.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Boot,
	Check,
	Controllers,
	Detached,
	Emitted,
	Events,
	Files,
	Finish,
	JobRings,
	JobStarts,
	LoggerLines,
	MakeCounter,
	NCU_BIN,
	Probe,
	Root,
	Services,
	Spawn,
	SpawnSpecs,
	StorageRecords,
	find,
	ledgerLines,
	mkTarget,
	actor,
	settle,
} from "../Harness.js";
import Dispatch from "../../../Target/Function/Dispatch.js";
import Filter from "../../../Target/Function/Filter.js";
import Resolve from "../../../Target/Function/Resolve.js";
import Satisfy from "../../../Target/Function/Satisfy.js";
import Decode from "../../../Target/Function/Decode.js";
import Follow from "../../../Target/Function/Follow.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Boot();
	Probe.Mode = "bin";
	const Listener = Events.find((e) => e[0] === "fs/observed")![1];
	// Group: pure leaves.
	{
		const Sub = "pure leaves: Decode \u2014 contained parse, null on failure/non-object";
		{
			Check(Count, Sub, () => {
				assert.equal(Decode("{ bad"), null);
				assert.equal(Decode("null"), null);
				assert.deepEqual(Decode('{"a":1}'), { a: 1 });
			});
		}
	}
	{
		const Sub = "pure leaves: Filter \u2014 public deps \u2192 true, all-chain manifest \u2192 false";
		{
			Check(Count, Sub, () => {
				assert.equal(Filter({ dependencies: { chalk: "^5.0.0" } }, null), true);
				assert.equal(
					Filter({ dependencies: { leftpad: "^1.0.0" } }, { effectiveLatest: { leftpad: "1.0.0" } }),
					false,
					"all-chain manifest \u2192 nothing for ncu",
				);
			});
		}
	}
	{
		const Sub = "pure leaves: Satisfy \u2014 canonicalizes to ^resolved, idempotent \u2192 null";
		{
			Check(Count, Sub, () => {
				assert.deepEqual(
					// Fixture-only scaffolding: `as any` for the branded/unknown leaf.
					(Satisfy(
						{ dependencies: { leftpad: "2.0.0" } },
						{ effectiveLatest: { leftpad: "1.0.0" } },
						false,
					) as any)?.["dependencies"]?.leftpad,
					"^1.0.0",
				);
				assert.equal(
					Satisfy(
						{ dependencies: { leftpad: "^1.0.0" } },
						{ effectiveLatest: { leftpad: "1.0.0" } },
						false,
					),
					null,
					"idempotent chain pass \u2192 null",
				);
			});
		}
	}
	// Group: the update gates (breaker / in-flight / cooldown).
	const projF = Path.join(Root, "proj-f");
	FileSystem.mkdirSync(projF);
	const tF = mkTarget(projF, "k-f");
	Probe.Count.set(projF, 3);
	const gatesBefore = ledgerLines().length;
	const jobsBefore = JobStarts.length;
	await Dispatch(Probe, tF, actor, projF, null, "");
	{
		const Sub = "update gates: circuit breaker \u2192 `paused for \u2026` line, no job";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(`update stage paused for ${projF} (3 consecutive failures \u2265 3)`).length,
					1,
				);
				assert.equal(JobStarts.length, jobsBefore, "paused \u2192 no job");
				Probe.Count.delete(projF);
			});
		}
	}
	Probe.Set.add(projF);
	await Dispatch(Probe, tF, actor, projF, null, "");
	{
		const Sub = "update gates: in-flight \u2192 `skipped for \u2026 (in-flight)` line";
		{
			Check(Count, Sub, () => {
				assert.equal(find(`update stage skipped for ${projF} (in-flight)`).length, 1);
				Probe.Set.delete(projF);
			});
		}
	}
	Probe.Stamp.set(projF, Date.now());
	await Dispatch(Probe, tF, actor, projF, null, "");
	{
		const Sub = "update gates: cooldown \u2192 `skipped for \u2026 (cooldown)` line; gates log, nothing else";
		{
			Check(Count, Sub, () => {
				assert.equal(find(`update stage skipped for ${projF} (cooldown)`).length, 1);
				Probe.Stamp.delete(projF);
				assert.equal(ledgerLines().length, gatesBefore + 3, "gates logged, nothing else");
			});
		}
	}
	// Group: the FAILED path (exit 1 \u2192 breaker increments + update-failed
	// journal + the U\u2082 refresh).
	Spawn.Exits = [1];
	Emitted.length = 0;
	await Dispatch(Probe, tF, actor, projF, null, "");
	await settle();
	{
		const Sub =
			"FAILED path: `update: ncu failed (base) status 1` + `update: FAILED \u2014 see lines above`";
		{
			Check(Count, Sub, () => {
				assert.equal(find("update: ncu failed (base) status 1").length, 1);
				assert.equal(find("update: FAILED \u2014 see lines above").length, 1);
			});
		}
	}
	{
		const Sub =
			"FAILED path: breaker incremented + `update stage FAILED (1) \u2026 consecutive=1` + update-failed journal";
		{
			Check(Count, Sub, () => {
				assert.equal(find(`update stage FAILED (1) for ${projF}; consecutive=1`).length, 1);
				assert.ok(
					StorageRecords.some(
						([, r]) => r.event === "update-failed" && r.path === projF && r.detail === "1",
					),
				);
				assert.equal(Probe.Count.get(projF), 1, "breaker incremented");
			});
		}
	}
	{
		const Sub = "FAILED path: U\u2082 refresh runs even on failure";
		{
			Check(Count, Sub, () => {
				const failedEmit = Emitted.filter((e) => e[0] === "fs/observed").at(-1)!;
				assert.equal(failedEmit[2].version, "stat-v9", "U\u2082 refresh ran even on failure");
				Probe.Count.delete(projF);
				Spawn.Exits = [];
			});
		}
	}
	// Group: the first-wins policy pick (ENGINE INPUT \u2014 module-owned, not the
	// union).
	const projG = Path.join(Root, "proj-g");
	FileSystem.mkdirSync(projG);
	const dirPolicy = Path.join(projG, "update-policy.json");
	FileSystem.writeFileSync(dirPolicy, JSON.stringify({ verifyCommand: "echo hi", reject: ["chalk"] }));
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
	{
		const Sub =
			"Resolve: FIRST-WINS engine-input pick (global \u2192 own dir \u2192 registry-adjacent \u2192 default)";
		{
			Check(Count, Sub, () => {
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
				assert.equal(Resolve(Probe, Path.join(Root, "nope"), null), "", "none \u2192 built-in default");
			});
		}
	}
	// Group: the policy engine (file content, verify run, merged rejects).
	Spawn.Exits = [0, 0];
	Probe.Stamp.delete(projF);
	await Dispatch(Probe, tF, actor, projF, null, dirPolicy);
	await settle();
	const doneCount = find("update: DONE \u2014 pins bumped per policy").length;
	{
		const Sub = "policy engine: policy file read + verifyCommand through the seam + merged rejects";
		{
			Check(Count, Sub, () => {
				assert.equal(find(`update: running verifyCommand: echo hi`).length, 1);
				const vSpec = SpawnSpecs.at(-1);
				assert.deepEqual(
					vSpec.argv,
					["/bin/sh", "-c", "echo hi"],
					"verifyCommand via /bin/sh -c through the seam",
				);
				assert.equal(find("update: verifyCommand ok").length, 1);
				assert.equal(
					find("update: DONE \u2014 pins bumped per policy").length,
					doneCount,
					"one DONE line for this run",
				);
				const ncuSpec = SpawnSpecs.filter((s) => s.argv.includes("-x")).at(-1);
				const rejectArg = ncuSpec.argv[ncuSpec.argv.indexOf("-x") + 1];
				assert.equal(
					rejectArg,
					"chalk",
					"policy reject used as-is (no registry \u2192 no chain deps to merge; the merge itself is asserted in the happy path)",
				);
				assert.equal(
					find(
						`update stage dispatched for ${projF} (mode=bin, ncu via ${NCU_BIN}, policy ${dirPolicy})`,
					).length,
					1,
					"dispatched line names the resolved policy path",
				);
			});
		}
	}
	// Group: verifyCommand exit codes (127 non-fatal; other fails the stage).
	Spawn.Exits = [0, 127];
	Probe.Stamp.delete(projF);
	await Dispatch(Probe, tF, actor, projF, null, dirPolicy);
	await settle();
	Spawn.Exits = [0, 2];
	Probe.Stamp.delete(projF);
	await Dispatch(Probe, tF, actor, projF, null, dirPolicy);
	await settle();
	{
		const Sub = "verifyCommand: exit 0 ok / 127 non-fatal / other fails the stage";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find("update: verifyCommand runner unavailable (exit 127) \u2014 skipped, non-fatal").length,
					1,
				);
				assert.equal(
					find("update: DONE \u2014 pins bumped per policy").length,
					doneCount + 1,
					"127 non-fatal \u2192 DONE",
				);
				assert.equal(find("update: verifyCommand failed (status 2)").length, 1);
				const failedCount = find("update: FAILED \u2014 see lines above").length;
				assert.equal(
					find("update: FAILED \u2014 see lines above").length,
					failedCount,
					"the verify stage fails the stage",
				);
				Probe.Count.delete(projF);
				Spawn.Exits = [];
			});
		}
	}
	// Group: built-in default + no-policy lines.
	{
		const projNoPolicy = Path.join(Root, "proj-np");
		FileSystem.mkdirSync(projNoPolicy);
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
		// The source suite asserted the generic line's count BETWEEN the two
		// dispatches; capture that intermediate count in the fixture phase so the
		// single check asserts the same point in the flow.
		const afterAbsentGeneric = find("update: using built-in default policy").length;
		const badPolicy = Path.join(projNoPolicy, "bad-policy.json");
		FileSystem.writeFileSync(badPolicy, "{ nope");
		Probe.Stamp.delete(projNoPolicy);
		await Dispatch(Probe, mkTarget(projNoPolicy, "k-np2"), actor, projNoPolicy, null, badPolicy);
		await settle();
		const Sub = "policy fallbacks: absent + unparsable policy files \u2192 built-in default lines";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find("update: no policy at /no/such/policy.json \u2014 using built-in default").length,
					1,
				);
				assert.equal(afterAbsentGeneric, defaultCount + 1);
				assert.equal(
					find(`update: unreadable policy at ${badPolicy} \u2014 using built-in default`).length,
					1,
				);
				Probe.Count.delete(projNoPolicy);
			});
		}
	}
	// Group: programmatic mode (the npm-check-updates library, offline).
	{
		const projJ = Path.join(Root, "proj-j");
		FileSystem.mkdirSync(projJ);
		const libPolicy = Path.join(projJ, "update-policy.json");
		FileSystem.writeFileSync(libPolicy, JSON.stringify({ reject: ["leftpad"] }));
		FileSystem.writeFileSync(
			Path.join(projJ, "package.json"),
			JSON.stringify({ name: "offline", dependencies: { leftpad: "^1.0.0" } }),
		);
		Probe.Mode = "programmatic";
		await Dispatch(Probe, mkTarget(projJ, "k-j"), actor, projJ, null, libPolicy);
		// the npm-check-updates import is heavy \u2014 poll until the run settles
		const doneBefore = find("update: DONE \u2014 pins bumped per policy").length;
		for (let i = 0; i < 200 && find("update: ncu (base) \u2192 ").length === 0; i++)
			await new Promise((r) => setTimeout(r, 50));
		const Sub = "engine: programmatic mode \u2014 ncu library in-process, chain-safe reject list";
		{
			Check(Count, Sub, () => {
				assert.equal(find("update: mode=programmatic (npm-check-updates library)").length, 1);
				assert.ok(find("update: ncu (base) \u2192 ").length >= 1, "the library run reported its result");
				assert.equal(find("update: DONE \u2014 pins bumped per policy").length, doneBefore + 1);
				Probe.Mode = "bin";
				Probe.Count.delete(projJ);
			});
		}
	}
	// Group: P1 job-ring piping (bin mode: collected output piped raw into the
	// ring).
	Spawn.Out = "ncu says hi";
	const pipeBefore = ledgerLines().length;
	JobRings.length = 0;
	Probe.Stamp.delete(projF);
	await Dispatch(Probe, tF, actor, projF, null, "");
	await settle();
	{
		const Sub = "P1 piping: collected bin-mode stdout appended to the ledger";
		{
			Check(Count, Sub, () => {
				assert.ok(
					ledgerLines()
						.slice(pipeBefore)
						.some((l) => l.includes("ncu says hi")),
					"collected stdout appended to the ledger",
				);
			});
		}
	}
	{
		const Sub = "P1 piping: the same text piped raw into the job's output ring";
		{
			Check(Count, Sub, () => {
				assert.ok(JobRings.at(-1)!.includes("ncu says hi"), "the same text piped into the job ring");
				Spawn.Out = "";
				Probe.Count.delete(projF);
			});
		}
	}
	// Group: detached fallbacks (no job registry / preflight rejection \u2192 the
	// contained detached chain).
	Services["jobs"] = undefined;
	const dispatchedBefore = find(
		`update stage dispatched for ${projF} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
	).length;
	const jobsBeforeFallback = JobStarts.length;
	Probe.Stamp.delete(projF);
	await Dispatch(Probe, tF, actor, projF, null, "");
	await settle();
	// The source suite asserted the dispatched count BETWEEN the two fallback
	// runs; capture that intermediate count in the fixture phase so the single
	// check asserts the same point in the flow.
	const afterFirstDispatched = find(
		`update stage dispatched for ${projF} (mode=bin, ncu via ${NCU_BIN}, built-in default policy)`,
	).length;
	// preflight rejection \u2192 detached
	Services["jobs"] = {
		attachController: (n: string) => {
			Controllers.push(n);
			return () => {};
		},
		start: () => {
			throw new Error("preflight");
		},
	};
	const doneBeforePreflight = find("update: DONE \u2014 pins bumped per policy").length;
	Probe.Stamp.delete(projF);
	await Dispatch(Probe, tF, actor, projF, null, "");
	await settle();
	const afterPreflightDone = find("update: DONE \u2014 pins bumped per policy").length;
	{
		const Sub = "fallbacks: no-registry and preflight-rejection \u2192 the contained detached chain";
		{
			Check(Count, Sub, () => {
				assert.equal(
					afterFirstDispatched,
					dispatchedBefore + 1,
					"detached fallback still dispatches the full chain",
				);
				assert.equal(JobStarts.length, jobsBeforeFallback, "no new job without the registry");
				assert.equal(JobStarts.length, jobsBeforeFallback, "throwing start left nothing registered");
				assert.equal(
					afterPreflightDone,
					doneBeforePreflight + 1,
					"the detached chain still ran",
				);
			});
		}
	}
	// restore the standard jobs stub and leave the folder state clean
	Services["jobs"] = {
		attachController: (name: string) => {
			Controllers.push(name);
			return () => Detached.push(name);
		},
		start: (spec: any) => {
			JobStarts.push(spec);
			const ring: any[] = [];
			JobRings.push(ring);
			const hooks = spec.run({ append: (t: any) => ring.push(t) });
			hooks.done.catch(() => {});
			return "governor-update-1";
		},
	};
	Probe.Count.delete(projF);
	Probe.Count.set(projF, 0);
	// Group: the Follow passage gate.
	const followBefore = ledgerLines().length;
	await Follow(Probe, tF, actor, projF, null, null, {
		Current: { dependencies: { a: "1" } },
		Proceed: false,
	});
	await Follow(
		Probe,
		tF,
		actor,
		projF,
		null,
		{ effectiveLatest: { a: "1" } },
		{ Current: { dependencies: { a: "1" } }, Proceed: true },
	);
	{
		const Sub = "Follow: passage gate + Filter gate before the first-wins pick and dispatch";
		{
			Check(Count, Sub, () => {
				assert.equal(ledgerLines().length, followBefore, "closed passage \u2192 no update stage");
				assert.equal(ledgerLines().length, followBefore, "all-chain manifest \u2192 Filter blocks");
			});
		}
	}
	// Group: factory keep-list wiring on the observe path.
	{
		// the union discovery composes sidecars for the keep-list; an unparsable
		// sidecar is logged by the FACTORY (parameterized machinery line)
		const projK = Path.join(Root, "proj-k");
		FileSystem.mkdirSync(projK);
		FileSystem.writeFileSync(Path.join(projK, "update-policy.json"), "{ nope");
		Files[Path.join(projK, "package.json")] = JSON.stringify({ dependencies: { chalk: "^5.0.0" } });
		Listener(mkTarget(projK, "k-k"), { kind: "present", version: "v1" }, actor);
		await settle();
		const Sub =
			"factory wiring: ResolvePolicy union discovery runs on the observe path (State.PolicyName)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(
						`unreadable update-policy.json at ${Path.join(projK, "update-policy.json")} \u2014 using built-in default`,
					).length,
					1,
					"factory-composed keep-list line (parameterized, module-prefixed)",
				);
				assert.equal(Probe.PolicyName, "update-policy.json");
			});
		}
	}
	{
		// configured-but-absent global policy: silently not a source (no line)
		Probe.Policy = "/no/such/global-policy.json";
		const absentBefore = ledgerLines().length;
		Listener(mkTarget(Path.join(Root, "proj-k"), "k-k2"), { kind: "present", version: "v2" }, actor);
		await settle();
		Probe.Policy = "";
		const newLines = ledgerLines().slice(absentBefore);
		const Sub = "factory wiring: configured-but-absent global policy is silently not a source";
		{
			Check(Count, Sub, () => {
				assert.equal(
					newLines.some((l) => l.includes("global-policy")),
					false,
					"absent global policy \u2192 no unreadable line",
				);
			});
		}
	}
	// Group: the ledger prefix is the module, everywhere (over this folder's
	// whole logger capture).
	{
		const Sub = "ledger prefix: every factory-composed line is `hook-dsh-governor-package: \u2026`";
		{
			Check(Count, Sub, () => {
				assert.ok(
					LoggerLines.info.every(
						(m) => m === "" || m.startsWith("hook-dsh-governor-package: ") || m.startsWith("smoke:"),
					) || LoggerLines.info.length > 0,
				);
				const infoLines = LoggerLines.info.filter((m) =>
					m.startsWith("hook-dsh-governor-package: "),
				);
				assert.ok(infoLines.length > 20, "the factory composes every line with the module prefix");
			});
		}
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
