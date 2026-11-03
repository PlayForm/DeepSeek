// Source/Test/Persistence/Test.ts - the plan's suite 6: the knowledge file.
// The atomic write (temp + rename, mode 0600, no temp left behind), the
// documented JSON schema (schema 1, the learned rows, the journal, the
// dismissals, the stats), the reload, and the corruption fallback - a corrupt
// or foreign-schema file degrades to the cold start, never to a crash, and
// the plugin still emits from the session history.
//
// THE SEED MARKER: the offline seed's source is an EXPLICIT pack, so this
// workspace (the package itself, no `.dsh/pack.yml`) seeds nothing and the
// file carries `seed: false` without a `seededAt` stamp - the documented
// optional field appears only after a pack seed (Function/Seed).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	AgentOf,
	CheckAsync,
	Finish,
	Knowledge,
	Ledger,
	Make,
	MakeCounter,
	Post,
	rm,
	SeedHistory,
	Service,
	Setup,
	Validate,
	Workspace,
} from "../Harness.js";

/** The judged call's anchor path (relative to the temp workspace). */
const Anchor = "README.md";

/** The two companions touched right after the anchor. */
const Companions = ["CHANGELOG.md", "SCHEME.md"];

/** The temp workspace the scenarios judge. */
const Space = Workspace([Anchor, ...Companions]);

/** One judged read of the anchor. */
const Read = (Id: string): any => ({
	name: "read",
	arguments: { file_path: Space.At(Anchor) },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the atomic write.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "P1: an emit writes the knowledge file atomically", async () => {
			await Post(Run, Read("a"));
			assert.equal(FileSystem.existsSync(Knowledge), true);
			const Temp = Path.join(Path.dirname(Knowledge), `.${Path.basename(Knowledge)}.tmp`);
			assert.equal(FileSystem.existsSync(Temp), false);
		});
		await CheckAsync(Count, "P1: the knowledge file is mode 0600", async () => {
			assert.equal(FileSystem.statSync(Knowledge).mode & 0o777, 0o600);
		});
		await CheckAsync(Count, "P1: the JSON schema is the documented one", async () => {
			const Stored = JSON.parse(FileSystem.readFileSync(Knowledge, "utf8"));
			assert.deepEqual(Object.keys(Stored).sort(), [
				"dismissals",
				"intents",
				"journal",
				"schema",
				"seed",
				"stats",
			]);
			assert.equal(Stored.schema, 1);
			assert.equal(Stored.seed, false);
			assert.deepEqual(Stored.dismissals, []);
			assert.deepEqual(Stored.stats, { emitted: 1, followed: 0, ignored: 0, dismissed: 0 });
			assert.equal(Stored.intents.History["CHANGELOG.md"].count, 1);
			assert.equal(Stored.intents.History["SCHEME.md"].count, 1);
			assert.equal(Stored.journal.length, 1);
			assert.equal(Stored.journal[0].intent, "History");
			assert.equal(Stored.journal[0].outcome, "ignored");
			assert.equal(Stored.journal[0].kappa.toFixed(2), "0.87");
			assert.equal(Stored.journal[0].candidates.length, 2);
		});
	}

	// Group P2: the reload.
	{
		const Reload = Make(Validate({ logFile: Ledger, enabled: true }));
		await CheckAsync(Count, "P2: the saved knowledge reloads", async () => {
			assert.deepEqual(Reload.State.Knowledge.stats, {
				emitted: 1,
				followed: 0,
				ignored: 0,
				dismissed: 0,
			});
			assert.equal(Reload.State.Knowledge.seed, false);
			assert.equal(Reload.State.Knowledge.intents.History["CHANGELOG.md"].count, 1);
			assert.equal(Reload.State.Knowledge.journal.length, 1);
		});
	}

	// Group P3: the corruption fallback.
	{
		rm();
		FileSystem.writeFileSync(Knowledge, "not json at all", "utf8");
		const Run = Make(Validate({ logFile: Ledger, enabled: true, seed: false }));
		await CheckAsync(Count, "P3: a corrupt file degrades to the cold start", async () => {
			assert.deepEqual(Run.State.Knowledge.stats, {
				emitted: 0,
				followed: 0,
				ignored: 0,
				dismissed: 0,
			});
			assert.deepEqual(Run.State.Knowledge.intents, {});
			assert.deepEqual(Run.State.Knowledge.dismissals, []);
			assert.equal(Run.Warns.length, 0);
		});
		await CheckAsync(Count, "P3: the cold start still emits from the session history", async () => {
			Run.Context.workingDirectory = Service(Space.Root);
			SeedHistory(Run, "a", Space.At(Anchor), Companions);
			const Out = await Post(Run, Read("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		await CheckAsync(Count, "P3: the corrupt file is overwritten by the next save", async () => {
			const Stored = JSON.parse(FileSystem.readFileSync(Knowledge, "utf8"));
			assert.equal(Stored.schema, 1);
			assert.equal(Stored.stats.emitted, 1);
		});
	}

	// Group P4: the foreign schema.
	{
		rm();
		FileSystem.writeFileSync(
			Knowledge,
			JSON.stringify({ schema: 2, intents: { History: {} }, journal: [] }),
			"utf8",
		);
		const Run = Make(Validate({ logFile: Ledger, enabled: true, seed: false }));
		await CheckAsync(Count, "P4: a foreign schema degrades to the cold start", async () => {
			assert.deepEqual(Run.State.Knowledge.intents, {});
			assert.equal(Run.State.Knowledge.schema, 1);
		});
	}

	return Finish(Count, "Persistence");
};

// Standalone entry: `node Target/Test/Persistence/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Persistence`);
}
