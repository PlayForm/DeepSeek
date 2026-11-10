import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
	AgentOf,
	CheckAsync,
	Durable,
	DurableLine,
	Finish,
	Knowledge,
	Ledger,
	LedgerWith,
	Make,
	MakeCounter,
	Post,
	rm,
	SeedHistory,
	Setup,
	Validate,
	Workspace,
} from "../Harness.js";

/**
 * @module Test
 *
 * The P4 DISMISS TOOL test.
 *
 * @remarks
 *
 * The test covers the registration through the loader's tool API, the
 * recorded dismissal and its byte-exact ledger line, the family
 * suppression, the path-level candidate drop, the durable reload, the TTL
 * expiry, and the two refusals (unknown family, disabled plugin).
 *
 * THE FAMILY VOCABULARY: the built-in pack is retired, so the note's family
 * is the synthetic `History` row; the refusal cases prove that a former
 * built-in family id is no longer known.
 */
/**
 * The judged call's anchor path (relative to the temp workspace).
 */
const Anchor = "README.md";

/**
 * The two companions touched right after the anchor.
 */
const Companions = ["CHANGELOG.md", "SCHEME.md"];

/**
 * The temp workspace the scenarios judge.
 */
const Space = Workspace([Anchor, ...Companions]);

/**
 * One judged read of the anchor.
 */
const Read = (Id: string): any => ({
	name: "read",
	arguments: { file_path: Space.At(Anchor) },
	agent: AgentOf(Id),
});

/**
 * Write a knowledge file with the given dismissals (the reload fixture).
 */
const Persist = (Dismissals: { intent: string; path?: string; until: number }[]): void => {
	FileSystem.writeFileSync(
		Knowledge,
		JSON.stringify({
			schema: 1,
			intents: {},
			journal: [],
			dismissals: Dismissals,
			stats: { emitted: 0, followed: 0, ignored: 0, dismissed: 0 },
		}),
		"utf8",
	);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group D1: the registration and the definition.
	{
		const Run = Setup();
		await CheckAsync(Count, "D1: the tool registers through the loader's tool API", async () => {
			assert.equal(Run.Tools.length, 1);
			const Tool = Run.Tools[0];
			assert.equal(Tool.name, "suggestion_dismiss");
			assert.equal(typeof Tool.execute, "function");
			assert.deepEqual(Tool.parameters.required, ["intent"]);
			assert.equal(Tool.parameters.properties.intent.type, "string");
			assert.equal(Tool.parameters.properties.path.type, "string");
			assert.deepEqual(Object.keys(Tool.output.schema.properties).sort(), [
				"detail",
				"dismissed",
				"intent",
				"path",
				"until",
			]);
			assert.deepEqual(Tool.output.schema.required, ["dismissed", "intent", "until", "detail"]);
		});
	}

	// Group D2: the family dismissal.
	{
		rm();
		const Run = Setup();
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "D2: a family dismissal is recorded and ledgered", async () => {
			const Before = Math.floor(Date.now() / 1000);
			const Out = await Run.Tools[0].execute({ intent: "History" }, {});
			const After = Math.floor(Date.now() / 1000);
			assert.equal(Out.dismissed, true);
			assert.equal(Out.intent, "History");
			assert.equal(Object.hasOwn(Out, "path"), false);
			assert.ok(Out.until >= Before + 86400 && Out.until <= After + 86400);
			assert.equal(Out.detail, `dismissed History until ${Out.until}`);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: dismissed History *"));
			assert.match(DurableLine("dismissed History *"), Durable("dismissed History *"));
			assert.equal(LedgerWith("dismissed History *").length, 1);
		});
		await CheckAsync(Count, "D2: the dismissal lands in the knowledge file", async () => {
			const Stored = JSON.parse(FileSystem.readFileSync(Knowledge, "utf8"));
			assert.equal(Stored.dismissals.length, 1);
			assert.equal(Stored.dismissals[0].intent, "History");
			assert.equal(Object.hasOwn(Stored.dismissals[0], "path"), false);
			assert.equal(Stored.stats.dismissed, 1);
			assert.equal(Stored.seed, false);
		});
		await CheckAsync(Count, "D2: the family dismissal suppresses the note", async () => {
			const Out = await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed dismissed History"));
			assert.match(
				DurableLine("suppressed dismissed History"),
				Durable("suppressed dismissed History"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// Group D3: the path dismissal drops the candidate.
	{
		rm();
		const Run = Setup();
		SeedHistory(Run, "b", Space.At(Anchor), Companions);
		await CheckAsync(Count, "D3: a path dismissal is recorded with its path", async () => {
			const Out = await Run.Tools[0].execute({ intent: "History", path: "CHANGELOG.md" }, {});
			assert.equal(Out.dismissed, true);
			assert.equal(Out.path, "CHANGELOG.md");
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: dismissed History CHANGELOG.md"));
		});
		await CheckAsync(Count, "D3: the dismissed path leaves the note, the rest emits", async () => {
			const Out = await Post(Run, Read("b"));
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(Text.includes("- CHANGELOG.md"), false);
			assert.equal(Text.includes("- SCHEME.md - touched 1 time(s) after a similar call"), true);
			assert.equal(
				Text.startsWith("[search-suggester] intent=History confidence=0.87\ntargets (1):"),
				true,
			);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 1 candidates"));
		});
	}

	// Group D4: the durable reload and the TTL expiry.
	{
		rm();
		Persist([{ intent: "History", until: Math.floor(Date.now() / 1000) + 3600 }]);
		const Live = Make(Validate({ logFile: Ledger, enabled: true }));
		SeedHistory(Live, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "D4: a live dismissal survives a reload", async () => {
			assert.equal(Live.State.Knowledge.dismissals.length, 1);
			const Out = await Post(Live, Read("a"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Live.Lines.includes("hook-dsh-search-suggester: suppressed dismissed History"));
		});
		rm();
		Persist([{ intent: "History", until: 1 }]);
		const Expired = Make(Validate({ logFile: Ledger, enabled: true }));
		SeedHistory(Expired, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "D4: an expired dismissal is pruned and the note returns", async () => {
			assert.equal(Expired.State.Knowledge.dismissals.length, 1);
			const Out = await Post(Expired, Read("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			assert.equal(Expired.State.Knowledge.dismissals.length, 0);
			assert.equal(Expired.Lines.filter((Line: string) => Line.includes("dismissed")).length, 0);
		});
	}

	// Group D5: the refusals.
	{
		rm();
		const Run = Setup();
		await CheckAsync(Count, "D5: an unknown family is a self-describing error", async () => {
			await assert.rejects(
				Run.Tools[0].execute({ intent: "Nope" }, {}),
				/unknown suggestion family "Nope"/,
			);
			// A former built-in family id is no longer known either.
			await assert.rejects(
				Run.Tools[0].execute({ intent: "Version" }, {}),
				/unknown suggestion family "Version"/,
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": dismissed ")).length, 0);
		});
		await CheckAsync(Count, "D5: a disabled suggester refuses the tool", async () => {
			rm();
			const Off = Make(Validate({ logFile: Ledger, enabled: false }));
			await assert.rejects(Off.Tools[0].execute({ intent: "History" }, {}), /disabled \(enabled=false\)/);
		});
	}

	return Finish(Count, "Dismiss");
};

// Standalone entry: `node Target/Test/Dismiss/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Dismiss`);
}
