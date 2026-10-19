// Source/Test/Gate-Write-Refresh/Test.ts - one singular test: the write path
// - the full g1 Gate matrix (target/govern/actor/kind/idempotent/basename/
// excluded/pass + the empty-tool-list and govern-marker cases), the
// GuardedWrite executor (the replaceIfVersion intent, both P4 sandbox
// postures, the Stash pre-registration, the abort-signal forwarding) and the
// Refresh same-actor re-emit with its best-effort containment.
// Runs standalone (`node Target/Test/Gate-Write-Refresh/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-plugin-dsh-factory: the fake ctx + the REAL factory
// class, from the Harness.
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import * as Path from "node:path";
import {
	Check,
	CheckAsync,
	Finish,
	MakeCounter,
	Make,
	TempRoot,
	FactoryClass,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// The folder fixtures: the fake ctx + the REAL factory instance, the temp
	// root, the source suite's st1 and st3 States and the Gate fixtures.
	const Fake = Make(null, { files: {} });
	const ctx = Fake.Context;
	const { emitted, writes } = Fake;
	const Root = TempRoot("factory-smoke-");
	const Ledger = Path.join(Root, "ledger.log");
	const factory: any = new FactoryClass(ctx);
	const volatileCell = { get: () => ["write", "edit"] };
	const st1: any = factory.State(
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
	const proj = Path.join(Root, "proj");
	mkdirSync(proj);
	const target = { targetKey: "k1", displayPath: Path.join(proj, "package.json") };
	const actor = { name: "edit" };
	const present = { kind: "present", version: "v1" };
	const base = { basename: "package.json" };
	// Group: 7 - Gate: the full g1 matrix.
	{
		const Sub = "Gate: full g1 matrix (target/govern/actor/kind/idempotent/basename/excluded/pass)";
		{
			Check(Count, Sub, () => {
				assert.deepEqual(factory.Gate(st1, null, present, actor, base), {
					pass: false,
					reason: "target",
				});
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
				const st3: any = factory.State(
					ctx,
					{ logFile: Ledger, mutationTools: ["zwrite"] },
					{ module: "f" },
				);
				assert.equal(
					factory.Gate(st3, target, present, actor, {
						basename: "package.json",
						mutationToolsField: "Tool",
					}).reason,
					"actor",
				);
				// the raw-write's wrapped actor (the `govern` marker): the event path
				// skips it silently, regardless of the marker's value - the direct
				// path is the channel
				assert.deepEqual(factory.Gate(st1, target, present, { ...actor, govern: false }, base), {
					pass: false,
					reason: "govern",
					path: target.displayPath,
				});
				assert.equal(
					factory.Gate(st1, target, present, { ...actor, govern: true }, base).reason,
					"govern",
				);
				assert.equal(
					factory.Gate(st1, target, present, { ...actor, govern: ["canonicalize"] }, base).reason,
					"govern",
				);
				assert.equal(
					factory.Gate(st1, target, present, { name: "raw-write" }, base).reason,
					"actor",
					"the marker is the gate: a name alone keeps the actor check",
				);
			});
		}
	}
	// Group: 10 - GuardedWrite: both sandbox postures + version guard.
	{
		const Sub = "GuardedWrite: replaceIfVersion intent + both P4 postures + Stash pre-registration";
		{
			await CheckAsync(Count, Sub, async () => {
				ctx.fs.sandboxMode = undefined;
				const out1 = await factory.GuardedWrite(st1, target, "{}\n", "v1");
				assert.equal(out1.version, "fresh-v2");
				assert.deepEqual(writes.at(-1).intent, { kind: "replaceIfVersion", version: "v1" });
				assert.equal(writes.at(-1).fence, null, "bare backend \u2192 NO fence policy");
				assert.equal(st1.Stash.get("k1"), "fresh-v2", "fresh version pre-registered");
				ctx.fs.sandboxMode = "workspace-write";
				await factory.GuardedWrite(st1, target, "{}\n", "fresh-v2");
				assert.deepEqual(
					writes.at(-1).fence,
					{ mode: "workspace-write", workspaceRoot: proj },
					"confined backend \u2192 fence rooted at the file's own directory",
				);
				assert.equal(st1.Stash.get("k1"), "fresh-v2");
			});
		}
	}
	// Group: 11 - Refresh: same-actor re-emit.
	{
		const Sub = "Refresh: P3/U2 re-emit with the same actor + best-effort";
		{
			Check(Count, Sub, () => {
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
					ctx.emit = (n: unknown, ...a: unknown[]) => emitted.push([n, ...a]);
				}, "best-effort");
			});
		}
	}
	// Group: Gate with an EMPTY tool list fails the actor gate (reads emit too).
	{
		const Sub = "Gate: empty mutation-tool list \u2192 actor gate fails";
		{
			Check(Count, Sub, () => {
				const stE: any = factory.State(ctx, { logFile: Ledger, mutationTools: [] }, { module: "f" });
				assert.equal(
					factory.Gate(stE, target, present, actor, {
						basename: "package.json",
						mutationToolsField: "Tool",
					}).reason,
					"actor",
				);
			});
		}
	}
	// Group: GuardedWrite forwards the abort signal.
	{
		const Sub = "GuardedWrite: abort signal forwarded";
		{
			await CheckAsync(Count, Sub, async () => {
				ctx.fs.sandboxMode = undefined;
				const signal = new AbortController().signal;
				await factory.GuardedWrite(st1, target, "{}\n", "v1", signal);
				assert.equal(writes.at(-1).signal, signal, "signal forwarded to ctx.fs.writeText");
			});
		}
	}
	return Finish(Count, "Gate-Write-Refresh");
};

// Standalone entry: `node Target/Test/Gate-Write-Refresh/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Gate-Write-Refresh`);
}
