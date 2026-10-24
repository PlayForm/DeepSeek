// Source/Test/Noise/Test.ts - the plan's suite 8: the ZERO-NOTE contract.
// Twenty legitimate calls (unrelated searches, low-confidence matches, and
// tools the suggester never judges) must produce EXACTLY zero notes - the
// suite asserts the count, not merely the absence of an error (the
// vacuous-green trap), and it asserts that the silence is measured: every
// judged call that stayed silent left its abstention line.
import assert from "node:assert/strict";
import { AgentOf, CheckAsync, Finish, MakeCounter, Post, Pre, Setup } from "../Harness.js";

/** One judged grep. */
const Grep = (Run: any, Agent: string, Pattern: string): Promise<any> =>
	Post(Run, { name: "grep", arguments: { pattern: Pattern, path: "" }, agent: AgentOf(Agent) });

/** One call the suggester never judges. */
const Other = (Run: any, Name: string, Args: Record<string, unknown>): Promise<any> =>
	Post(Run, { name: Name, arguments: Args, agent: AgentOf("noise") });

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group N1: twenty calls, zero notes.
	{
		const Run = Setup();
		let Notes = 0;
		const Record = (Out: any): void => {
			Notes += (Out.additionalContexts ?? []).length;
		};
		await CheckAsync(Count, "N1: twenty legitimate calls produce exactly zero notes", async () => {
			for (let Index = 0; Index < 5; Index += 1) {
				Record(await Grep(Run, `n${Index}`, `unrelated query ${Index}`));
			}
			for (const [Index, Pattern] of [
				"threshold",
				"PASS",
				"const Thing",
				"README",
				"hook-dsh-noise",
			].entries()) {
				Record(await Grep(Run, `l${Index}`, Pattern));
			}
			Record(await Other(Run, "webfetch", { url: "https://example.com" }));
			Record(await Other(Run, "agent", { prompt: "read the docs" }));
			Record(await Other(Run, "web_search", { queries: ["search suggester"] }));
			Record(await Other(Run, "list_agents", {}));
			Record(await Other(Run, "write", { file_path: "Temporary/scratch.txt", content: "x" }));
			for (let Index = 5; Index < 10; Index += 1) {
				Record(await Grep(Run, `n${Index}`, `unrelated query ${Index}`));
			}
			assert.equal(Notes, 0);
		});
		await CheckAsync(Count, "N1: the silence is measured (ten abstention lines)", async () => {
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
			assert.equal(
				Run.Lines.filter((Line: string) => Line.includes("abstained no-signal")).length,
				10,
			);
			assert.equal(
				Run.Lines.filter((Line: string) => Line.includes("abstained low-confidence")).length,
				5,
			);
		});
		await CheckAsync(Count, "N1: no warning fired during the silent run", async () => {
			assert.deepEqual(Run.Warns, []);
		});
	}

	// Group N2: the zero holds across a turn boundary (the reset does not leak).
	{
		const Run = Setup();
		await CheckAsync(Count, "N2: a fresh turn stays silent after a silent turn", async () => {
			await Grep(Run, "a", "unrelated query one");
			await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
			const Second = await Grep(Run, "a", "unrelated query two");
			assert.deepEqual(Second.additionalContexts ?? [], []);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	return Finish(Count, "Noise");
};

// Standalone entry: `node Target/Test/Noise/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Noise`);
}
