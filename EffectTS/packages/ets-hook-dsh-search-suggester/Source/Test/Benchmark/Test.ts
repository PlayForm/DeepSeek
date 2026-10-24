// Source/Test/Benchmark/Test.ts - the P4 REPLAY BENCHMARK: the fixed
// fifty-call sequence (Variable/Sequence) replayed through the REAL built
// listener, the emitted notes scored by Function/Benchmark against the
// hand-labelled lane targets, the precision/recall/first-note numbers
// printed, the determinism proven by a second identical replay, and the
// threshold floor shown to gate the lanes (the benchmark runs at 0.6; the
// default 0.75 keeps only the destructive Version lane).
import assert from "node:assert/strict";
import Benchmark from "../../Function/Benchmark.js";
import type { Note } from "../../Interface/Benchmark.js";
import Sequence from "../../Variable/Sequence.js";
import {
	AgentOf,
	CheckAsync,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Post,
	Pre,
	rm,
	Setup,
	Validate,
} from "../Harness.js";

/** The benchmark's config: the default surface with the documented threshold floor. */
const Bench = (): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.6 }));
};

/** The note's candidate paths (the "- <path>[ (n)] - <reason>" lines). */
const Candidates = (Text: string): string[] =>
	Text.split("\n")
		.filter((Line) => Line.startsWith("- "))
		.map((Line) => {
			const Body = Line.slice(2);
			const Cut = Body.indexOf(" - ");
			const Head = Cut === -1 ? Body : Body.slice(0, Cut);
			return Head.replace(/ \(\d+\)$/, "");
		});

/** Replay the fixed sequence and collect the emitted notes. */
const Replay = async (Run: any): Promise<Note[]> => {
	const Notes: Note[] = [];
	for (const [Index, Call] of Sequence.calls.entries()) {
		if (Call.context !== undefined) {
			await Pre(Run, {
				agent: AgentOf(Call.agent),
				messages: [{ role: "user", content: Call.context }],
			});
		}
		const Out = await Post(Run, {
			name: Call.name,
			arguments: Call.arguments,
			agent: AgentOf(Call.agent),
		});
		const Contexts = Out.additionalContexts ?? [];
		const Note = Contexts.find((Entry: any) => Entry?.source?.kind === "search-suggester");
		if (Note === undefined) {
			continue;
		}
		const Text = Note.content[0].text as string;
		Notes.push({
			intent: String(Note.source.summary).split(" ")[0] ?? "",
			candidates: Candidates(Text),
			call: Index + 1,
		});
	}
	return Notes;
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group B1: the replay and the metrics.
	{
		const Run = Bench();
		const Notes = await Replay(Run);
		await CheckAsync(Count, "B1: the sequence emits one note per lane", async () => {
			assert.deepEqual(
				Notes.map((Note) => Note.intent),
				["Version", "Test", "Doc", "Config", "Symbol"],
			);
			assert.deepEqual(
				Notes.map((Note) => Note.candidates.length),
				[7, 4, 5, 6, 4],
			);
		});
		const Metrics = Benchmark(Notes, Sequence.expected);
		await CheckAsync(Count, "B1: the benchmark numbers are the recorded baseline", async () => {
			assert.equal(Metrics.Notes, 5);
			assert.equal(Metrics.Suggested, 26);
			assert.equal(Metrics.Hits, 26);
			assert.equal(Metrics.Expected, 37);
			assert.equal(Metrics.Matched, 26);
			assert.equal(Metrics.First, 1);
			assert.equal(Metrics.Precision.toFixed(2), "1.00");
			assert.equal(Metrics.Recall.toFixed(2), "0.70");
		});
		await CheckAsync(Count, "B1: the benchmark line prints the numbers", async () => {
			const Line = `benchmark: calls=${Sequence.calls.length} notes=${Metrics.Notes} precision=${Metrics.Precision.toFixed(2)} recall=${Metrics.Recall.toFixed(2)} first-note=${Metrics.First}`;
			console.log(Line);
			assert.equal(
				Line,
				"benchmark: calls=50 notes=5 precision=1.00 recall=0.70 first-note=1",
			);
		});
	}

	// Group B2: the determinism (a second identical replay).
	{
		const Run = Bench();
		const Metrics = Benchmark(await Replay(Run), Sequence.expected);
		await CheckAsync(Count, "B2: the replay is deterministic", async () => {
			assert.equal(Metrics.Notes, 5);
			assert.equal(Metrics.Suggested, 26);
			assert.equal(Metrics.Expected, 37);
			assert.equal(Metrics.Matched, 26);
			assert.equal(Metrics.Precision.toFixed(2), "1.00");
			assert.equal(Metrics.Recall.toFixed(2), "0.70");
			assert.equal(Metrics.First, 1);
		});
		await CheckAsync(Count, "B2: the replay leaves the deterministic ledger trail", async () => {
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 5);
			assert.equal(Run.Warns.length, 0);
		});
	}

	// Group B3: the config floor cannot lower the pack's per-intent gates.
	{
		const Run = Setup();
		const Metrics = Benchmark(await Replay(Run), Sequence.expected);
		await CheckAsync(Count, "B3: the config cannot lower the pack's gates", async () => {
			assert.equal(Metrics.Notes, 5);
			assert.equal(Metrics.Suggested, 26);
			assert.equal(Metrics.Precision.toFixed(2), "1.00");
			assert.equal(Metrics.Recall.toFixed(2), "0.70");
		});
	}

	return Finish(Count, "Benchmark");
};

// Standalone entry: `node Target/Test/Benchmark/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Benchmark`);
}
