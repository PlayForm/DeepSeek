// Source/Test/Refusals-And-Transform/Test.ts - one singular test: the
// chain-pass no-ops and refusals (undecodable manifest, no registry, unreadable
// registry, strict strip), the module transform contract probed directly (raw
// text in, keep-list ignored, the message composition, the passage marking, the
// idempotent null), and the P4 confined fence posture.
// Runs standalone (`node Target/Test/Refusals-And-Transform/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-package-governor.
//
// The SILENT REPLAY (the L2 precedent): the source suite is cumulative - the
// undecodable-manifest check asserts the ABSOLUTE count of started jobs (the
// source suite's section 5 started exactly one before this point). This folder
// replays that generating fixture (the proj-a chain pass) silently, without
// assertions, so the absolute count holds; the replayed fixture is verified
// indirectly by that count assertion itself (a broken module prints a different
// count and the check fails loudly).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Boot,
	Check,
	Context,
	Events,
	Files,
	Finish,
	JobStarts,
	MakeCounter,
	Probe,
	Root,
	StorageRecords,
	Writes,
	find,
	ledgerLines,
	mkTarget,
	actor,
	settle,
} from "../Harness.js";
import BuildTransform from "../../../Target/Function/Transform.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Boot();
	Probe.Mode = "bin";
	const Listener = Events.find((e) => e[0] === "fs/observed")![1];
	// -- the silent replay fixture (source suite section 5, unasserted) --
	const projA = Path.join(Root, "proj-a");
	FileSystem.mkdirSync(projA);
	FileSystem.writeFileSync(
		Path.join(projA, "registry.json"),
		JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
	);
	const pathA = Path.join(projA, "package.json");
	Files[pathA] = JSON.stringify({
		name: "x",
		dependencies: { leftpad: "^2.0.0", chalk: "^5.0.0" },
		scripts: { build: "tsc" },
	});
	Listener(mkTarget(projA, "k-a"), { kind: "present", version: "v1" }, actor);
	await settle();
	// Group: chain-pass no-ops and refusals.
	{
		// non-JSON manifest
		const projH = Path.join(Root, "proj-h");
		FileSystem.mkdirSync(projH);
		Files[Path.join(projH, "package.json")] = "{ nope";
		const before = ledgerLines().length;
		Listener(mkTarget(projH, "k-h"), { kind: "present", version: "v1" }, actor);
		await settle();
		const Sub =
			"transform: undecodable manifest \u2192 `observed non-JSON \u2026 \u2014 skipped`, no write, no update";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(
						`no registry.json found for ${Path.join(projH, "package.json")} \u2014 chain pass skipped`,
					).length,
					1,
					"the g2 line comes first (same order as the pre-refactor flow)",
				);
				assert.equal(
					find(`observed non-JSON package.json ${Path.join(projH, "package.json")} \u2014 skipped`)
						.length,
					1,
				);
				assert.equal(
					ledgerLines().length,
					before + 2,
					"non-JSON \u2192 exactly the g2 + non-JSON lines",
				);
				assert.equal(JobStarts.length, 1, "non-JSON \u2192 no update stage (passage closed)");
			});
		}
	}
	{
		// no registry found - the pass is skipped, the passage stays closed (no
		// update stage; the no-flap rule)
		const projB = Path.join(Root, "proj-b");
		FileSystem.mkdirSync(projB);
		Files[Path.join(projB, "package.json")] = JSON.stringify({
			dependencies: { chalk: "^5.0.0" },
		});
		Listener(mkTarget(projB, "k-b"), { kind: "present", version: "v1" }, actor);
		await settle();
		const Sub =
			"chain semantics: no registry.json \u2192 pass skipped, everything public, no update stage";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(
						`no registry.json found for ${Path.join(projB, "package.json")} \u2014 chain pass skipped`,
					).length,
					1,
				);
				assert.equal(
					find(
						`update stage dispatched for ${projB} (mode=bin, ncu via ncu, built-in default policy)`,
					).length,
					0,
					"no registry \u2192 the passage stays closed, no update stage (the no-flap rule)",
				);
				assert.equal(
					Writes.filter((w) => w.path === Path.join(projB, "package.json")).length,
					0,
					"no registry \u2192 no chain rewrite",
				);
			});
		}
	}
	{
		// unreadable registry.json
		const projD = Path.join(Root, "proj-d");
		FileSystem.mkdirSync(projD);
		FileSystem.writeFileSync(Path.join(projD, "registry.json"), "{ nope");
		Files[Path.join(projD, "package.json")] = JSON.stringify({
			dependencies: { leftpad: "^2.0.0" },
		});
		Listener(mkTarget(projD, "k-d"), { kind: "present", version: "v1" }, actor);
		await settle();
		const Sub =
			"chain semantics: unreadable registry \u2192 `unreadable registry.json \u2026 skipped for <path>`";
		{
			Check(Count, Sub, () => {
				assert.equal(
					find(
						`unreadable registry.json at ${Path.join(projD, "registry.json")} \u2014 chain pass skipped for ${Path.join(projD, "package.json")}`,
					).length,
					1,
				);
				assert.equal(
					find(
						`update stage dispatched for ${projD} (mode=bin, ncu via ncu, built-in default policy)`,
					).length,
					0,
					"unreadable registry \u2192 the passage stays closed, no update stage (the no-flap rule)",
				);
				assert.equal(
					Probe.Stash.get("k-d"),
					"v1",
					"Stash seeded at the observed version (no update stage runs, so no U\u2082 advance)",
				);
			});
		}
	}
	{
		// strict strip (strict unknown dep stripped, chain dep canonicalized)
		const projE = Path.join(Root, "proj-e");
		FileSystem.mkdirSync(projE);
		FileSystem.writeFileSync(
			Path.join(projE, "registry.json"),
			JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
		);
		Files[Path.join(projE, "package.json")] = JSON.stringify({
			dependencies: { leftpad: "^2.0.0", unknown: "^1.0.0" },
		});
		Probe.Strict = true;
		Listener(mkTarget(projE, "k-e"), { kind: "present", version: "v1" }, actor);
		await settle();
		Probe.Strict = false;
		const writtenE = JSON.parse(
			Writes.filter((w) => w.path === Path.join(projE, "package.json")).at(-1).content,
		);
		const Sub =
			"chain semantics: strict strip of unknown deps (never a default) + canonicalization";
		{
			Check(Count, Sub, () => {
				assert.equal(writtenE.dependencies.leftpad, "^1.0.0");
				assert.equal(writtenE.dependencies.unknown, undefined, "strict:true strips unknown deps");
				assert.ok(find(`governed ${Path.join(projE, "package.json")} \u2192 fresh-`).length >= 1);
			});
		}
	}
	// the transform contract, probed directly (raw text in, decode inside,
	// section/keep ignored - the governor closes over its own sections)
	const passage: any = { Current: null, Proceed: false };
	const transform = BuildTransform(
		Probe,
		// Fixture-only scaffolding: a plain runtime string for the branded
		// FsTargetKey, exactly like the source suite passes.
		{ targetKey: "k-t", displayPath: pathA } as any,
		{ effectiveLatest: { leftpad: "1.0.0" } },
		passage,
	);
	const out = transform(
		JSON.stringify({ dependencies: { leftpad: "^2.0.0", a: "^2.0.0" } }),
		undefined,
		["a", "leftpad"],
	);
	// Type-level narrowing for the raw-tsc emit (the L5A awaited step): the
	// factory types the transform's result `Output | null` (idempotent
	// manifests yield the designed no-op) and `next` unknown; this manifest
	// is decodable, so narrow once — no assertion changes.
	if (out === null) throw new Error("a decodable manifest yields a message");
	const Decoded = out.next as { dependencies: { leftpad: string; a: string } };
	{
		const Sub =
			"transform: raw text in, decode inside; keep-list ignored (governor closes over its sections)";
		{
			Check(Count, Sub, () => {
				assert.equal(out.count, 1);
				assert.equal(
					Decoded.dependencies.leftpad,
					"^1.0.0",
					"decode inside the transform (raw text in)",
				);
				assert.equal(
					Decoded.dependencies.a,
					"^2.0.0",
					"the keep-list does NOT pin (governor ignores it)",
				);
				assert.equal(typeof out.message, "function");
			});
		}
	}
	// The compose arm of the factory's `message?` union (string | composer);
	// the assertion below already proves the composed bytes.
	const Compose = out.message as (outcome: { version: string }) => string;
	const msg = Compose({ version: "fresh-9" });
	{
		const Sub = "transform: the message composes `governed <path> \u2192 <version>` from the outcome";
		{
			Check(Count, Sub, () => {
				assert.equal(
					msg,
					`governed ${pathA} \u2192 fresh-9`,
					"message composes the module's version-bearing line",
				);
			});
		}
	}
	{
		const Sub = "transform: the post-write message marks the passage + journals the governed record";
		{
			Check(Count, Sub, () => {
				assert.equal(passage.Proceed, true, "message marks the passage (post-write only)");
				assert.equal(
					passage.Current.dependencies.leftpad,
					"^2.0.0",
					"passage carries the decoded manifest",
				);
				assert.ok(StorageRecords.some(([, r]) => r.event === "governed" && r.detail === "fresh-9"));
			});
		}
	}
	const noopPassage: any = { Current: null, Proceed: false };
	const noopTransform = BuildTransform(
		Probe,
		{ targetKey: "k-t-noop", displayPath: pathA } as any,
		{ effectiveLatest: { leftpad: "1.0.0" } },
		noopPassage,
	);
	const noopOut = noopTransform(
		JSON.stringify({ dependencies: { leftpad: "^1.0.0" } }),
		undefined,
		[],
	);
	{
		const Sub =
			"transform: idempotent manifest \u2192 null; the no-change path keeps the passage closed";
		{
			Check(Count, Sub, () => {
				assert.equal(noopOut, null, "idempotent manifest \u2192 null (the factory's designed no-op)");
				assert.equal(
					noopPassage.Proceed,
					false,
					"every computed pin equals its current pin \u2192 the passage stays closed (no dispatch, no write)",
				);
			});
		}
	}
	const publicPassage: any = { Current: null, Proceed: false };
	const publicTransform = BuildTransform(
		Probe,
		{ targetKey: "k-t-public", displayPath: pathA } as any,
		null,
		publicPassage,
	);
	const publicOut = publicTransform(
		JSON.stringify({ dependencies: { chalk: "^5.0.0" } }),
		undefined,
		[],
	);
	{
		const Sub =
			"transform: no registry \u2192 the no-change path keeps the passage closed (the no-flap rule)";
		{
			Check(Count, Sub, () => {
				assert.equal(publicOut, null, "nothing to govern \u2192 null");
				assert.equal(
					publicPassage.Proceed,
					false,
					"no registry \u2192 the update stage path stays closed (no dispatch)",
				);
			});
		}
	}
	{
		// the P4 CONFINED fence posture: a sandbox-mode-configured backend gets a
		// per-call workspace-write policy rooted at the governed manifest's
		// directory
		Context.fs.sandboxMode = "workspace-write";
		const projFence = Path.join(Root, "proj-fence");
		FileSystem.mkdirSync(projFence);
		FileSystem.writeFileSync(
			Path.join(projFence, "registry.json"),
			JSON.stringify({ effectiveLatest: { leftpad: "1.0.0" } }),
		);
		Files[Path.join(projFence, "package.json")] = JSON.stringify({
			dependencies: { leftpad: "^2.0.0" },
		});
		Listener(mkTarget(projFence, "k-fence"), { kind: "present", version: "v1" }, actor);
		await settle();
		Context.fs.sandboxMode = undefined;
		const writeFence = Writes.filter((w) => w.path === Path.join(projFence, "package.json")).at(-1);
		const Sub = "P4: confined backend \u2192 workspace-write fence rooted at the manifest's own directory";
		{
			Check(Count, Sub, () => {
				assert.deepEqual(
					writeFence.fence,
					{ mode: "workspace-write", workspaceRoot: projFence },
					"confined backend \u2192 fence rooted at the manifest's own directory",
				);
			});
		}
	}
	return Finish(Count, "Refusals-And-Transform");
};

// Standalone entry: `node Target/Test/Refusals-And-Transform/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Refusals-And-Transform`);
}
