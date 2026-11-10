import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import Seed from "../../Function/Seed.js";
import { Empty } from "../../Function/Persist.js";
import type { Intent } from "../../Interface/Execution.js";
import type Projection from "../../Interface/Projection.js";
import {
	Check,
	Finish,
	Knowledge,
	Ledger,
	Make,
	MakeCounter,
	rm,
	Setup,
	Validate,
} from "../Harness.js";

/**
 * @module Test
 *
 * The P3 OFFLINE SEED test: the deterministic warm start of the learned
 * knowledge, with no LLM and no session history.
 *
 * @remarks
 *
 * THE SEED SOURCE: an EXPLICIT pack's canonical candidates. The built-in
 * pack is retired, so a workspace without `.dsh/pack.yml` seeds nothing (the
 * apply-time mount asserts that), and the function itself is exercised
 * directly with an explicit family fixture: the canonical tier (prior 1.0)
 * is seeded, while the `<...>` placeholder, the `family: true` aggregate and
 * the fallback tiers stay cold. A candidate the graph projection proves is
 * seeded twice, the seed never overwrites an existing row, it does not save,
 * and the `learn`/`seed` switches turn it off.
 */
/**
 * The explicit family the seed reads: five targets across every tier.
 */
const Family: Intent[] = [
	{
		id: "Version",
		priority: 1,
		threshold: 0.75,
		signals: [],
		familyGlobs: ["**/README.md"],
		targets: [
			{ path: "package.json", kind: "manifest", prior: 1.0, reason: "the manifest" },
			{ path: "CHANGELOG.md", kind: "doc", prior: 1.0, reason: "the changelog" },
			{ path: "Source/Test/<Suite>/Test.ts", kind: "test", prior: 1.0, reason: "the placeholder" },
			{ path: "README.md", kind: "doc", prior: 0.6, reason: "the fallback" },
			{ path: "Target", kind: "family", prior: 1.0, reason: "the tail", family: true },
		],
	},
];

/**
 * The projection that proves one canonical row (the graph's own rank).
 */
const Graph: Projection = {
	revision: "r1",
	nodes: 1,
	root: 0,
	facts: new Map([["package.json", { kinds: ["File"], depth: 1, recency: 1 }]]),
};

/**
 * The epoch-seconds stamp the seeded rows carry.
 */
const At = 1700000000;

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group S1: the seeded rows and their shape.
	{
		const Store = Empty();
		const Seeded = Seed(Store, Family, undefined, At);
		Check(Count, "S1: the canonical rows are seeded with their markers", () => {
			assert.equal(Seeded, 2);
			assert.deepEqual(Store.intents.Version["package.json"], {
				count: 1,
				followed: 1,
				lastSeen: At,
				seed: true,
			});
			assert.equal(Store.intents.Version["CHANGELOG.md"].seed, true);
			assert.equal(Store.seed, true);
			assert.equal(Store.seededAt, At);
		});
		Check(Count, "S1: the placeholder, the aggregate and the fallback stay cold", () => {
			assert.equal(Store.intents.Version["Source/Test/<Suite>/Test.ts"], undefined);
			assert.equal(Store.intents.Version["Target"], undefined);
			assert.equal(Store.intents.Version["README.md"], undefined);
			assert.equal(Store.intents.Version["**/README.md"], undefined);
			assert.deepEqual(Object.keys(Store.intents.Version).sort(), [
				"CHANGELOG.md",
				"package.json",
			]);
		});
		Check(Count, "S1: the seed moves no stat", () => {
			assert.deepEqual(Store.stats, { emitted: 0, followed: 0, ignored: 0, dismissed: 0 });
		});
	}

	// Group S2: the graph proof doubles a seeded row.
	{
		const Store = Empty();
		Seed(Store, Family, Graph, At);
		Check(Count, "S2: a graph-proven row is seeded twice", () => {
			assert.equal(Store.intents.Version["package.json"].count, 2);
			assert.equal(Store.intents.Version["package.json"].followed, 2);
			assert.equal(Store.intents.Version["package.json"].seed, true);
			assert.equal(Store.intents.Version["CHANGELOG.md"].count, 1);
		});
	}

	// Group S3: the seed never overwrites an existing row.
	{
		const Store = Empty();
		Store.intents.Version = {
			"package.json": { count: 9, followed: 9, lastSeen: 5 },
		};
		Seed(Store, Family, undefined, At);
		Check(Count, "S3: an existing row wins over the seed", () => {
			assert.deepEqual(Store.intents.Version["package.json"], {
				count: 9,
				followed: 9,
				lastSeen: 5,
			});
			assert.equal(Store.intents.Version["CHANGELOG.md"].seed, true);
		});
		Check(Count, "S3: a second seed run moves no count", () => {
			const Before = JSON.stringify(Store.intents);
			Seed(Store, Family, undefined, At + 1);
			assert.equal(JSON.stringify(Store.intents), Before);
		});
	}

	// Group S4: the seed does not save.
	{
		rm();
		Seed(Empty(), Family, undefined, At);
		Check(Count, "S4: the seed writes no knowledge file", () => {
			assert.equal(FileSystem.existsSync(Knowledge), false);
		});
	}

	// Group S5: the apply-time seed reads only an EXPLICIT pack.
	{
		const Run = Setup();
		Check(Count, "S5: a workspace with no explicit pack seeds nothing", () => {
			assert.deepEqual(Run.State.Knowledge.intents, {});
			assert.equal(Run.State.Knowledge.seed, false);
			assert.equal(Run.State.Knowledge.seededAt, undefined);
		});
	}

	// Group S6: the switches.
	{
		rm();
		const NoLearn = Make(Validate({ logFile: Ledger, enabled: true, learn: false }));
		Check(Count, "S6: learn=false keeps the deterministic cold start", () => {
			assert.deepEqual(NoLearn.State.Knowledge.intents, {});
			assert.equal(NoLearn.State.Knowledge.seed, false);
		});
		rm();
		const NoSeed = Make(Validate({ logFile: Ledger, enabled: true, seed: false }));
		Check(Count, "S6: seed=false keeps the deterministic cold start", () => {
			assert.deepEqual(NoSeed.State.Knowledge.intents, {});
			assert.equal(NoSeed.State.Knowledge.seed, false);
		});
		rm();
		const Off = Make(Validate({ logFile: Ledger, enabled: false }));
		Check(Count, "S6: a disabled mount does not seed", () => {
			assert.deepEqual(Off.State.Knowledge.intents, {});
			assert.equal(Off.State.Knowledge.seed, false);
		});
	}

	return Finish(Count, "Seed");
};

// Standalone entry: `node Target/Test/Seed/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Seed`);
}
