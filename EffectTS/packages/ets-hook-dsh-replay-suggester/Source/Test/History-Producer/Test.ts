// Source/Test/History-Producer/Test.ts - THE STORE'S PRODUCER (the completion
// spec's wave 2c re-spec): the recall reader finally has data. Every judged
// call in a workspace is appended to the call history - the per-agent ring
// plus the durable tier (the `replay_history` KV domain, or the JSON fallback
// when the harness provides no storage) - and a later call recalls the paths
// that accompanied a similar prior call.
//
// The scenarios:
//   * a sequence of judged calls fills the store (the mirror, the ring, the
//     byte-exact `recorded` lines);
//   * a later call recalls and the note names the historical companions
//     (byte-exact note and suggest line);
//   * an empty store abstains honestly (no note, no claim);
//   * the KV path survives a reopen (the domain spec, the recovered line, a
//     recall from the restored mirror);
//   * the JSON fallback survives a reopen without any storage facility;
//   * the ring is bounded by `historyDepth`;
//   * a non-judged call and a foreign-workspace call are never recorded;
//   * the SEEDED store still wins (the fixtures' precedence);
//   * a failed domain open is loud and degrades to the file.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	Call,
	Check,
	CheckAsync,
	FakeStorage,
	Finish,
	FreshRecord,
	LinesWith,
	MakeCounter,
	Mount,
	Setup,
	WriteStore,
	rmStore,
} from "../Harness.js";

/** A Repeat-shaped call: search + literal + context evidence, one path. */
const Probe = (Path_: string): Record<string, unknown> => ({
	file_path: Path_,
	pattern: "export function",
});

/** A mount with the ring wide enough to exercise the episode and no cooldown. */
const Knobs = { cooldownCalls: 0, maxNotesPerTurn: 5 };

/** Fire the four-call episode (A, B, C, D) on one mount. */
const Episode = async (Run: any, Agent: unknown): Promise<void> => {
	for (const Name of ["src/A.ts", "src/B.ts", "src/C.ts", "src/D.ts"]) {
		await Call(Run, "read", Probe(Name), Agent);
	}
};

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group H1: the producer fills the store.
	{
		const Agent = { agent: { id: "produce-a" } };
		const Run = Setup(Knobs);
		await Run.State.Flush();
		await Episode(Run, Agent);
		await CheckAsync(Count, "H1: the judged calls fill the durable mirror, newest first", async () => {
			await Run.State.Flush();
			assert.deepEqual(
				Run.State.History.map((Entry: any) => `${Entry.seq} ${Entry.path} ${Entry.intent}`),
				["3 src/D.ts Repeat", "2 src/C.ts Repeat", "1 src/B.ts Repeat", "0 src/A.ts replay"],
			);
		});
		await CheckAsync(Count, "H1: the agent's own ring carries the same calls", async () => {
			const Memory = Run.State.Agents.get(Agent);
			assert.deepEqual(
				Memory.History.map((Entry: any) => Entry.path),
				["src/D.ts", "src/C.ts", "src/B.ts", "src/A.ts"],
			);
		});
		await CheckAsync(Count, "H1: every recorded call logs the byte-exact line", async () => {
			await Run.State.Flush();
			assert.deepEqual(LinesWith(Run, "recorded "), [
				"replay-suggester: recorded replay src/A.ts (1 in store)",
				"replay-suggester: recorded Repeat src/B.ts (2 in store)",
				"replay-suggester: recorded Repeat src/C.ts (3 in store)",
				"replay-suggester: recorded Repeat src/D.ts (4 in store)",
			]);
		});
	}

	// Group H2: a later call recalls the historical companions.
	{
		const Agent = { agent: { id: "recall-a" } };
		const Run = Setup(Knobs);
		await Run.State.Flush();
		await Episode(Run, Agent);
		const Result = await Call(Run, "read", Probe("src/E.ts"), Agent);
		Check(Count, "H2: the note names the companions of the similar call", () => {
			assert.equal(Result.additionalContexts.length, 1);
			assert.deepEqual(Result.additionalContexts[0].source, {
				kind: "replay-suggester",
				form: "notice",
				summary: "Repeat 0.77",
			});
			assert.equal(
				Result.additionalContexts[0].content[0].text,
				"[replay-suggester] intent=Repeat confidence=0.77\ntargets (3):\n- src/D.ts - touched last time (Repeat)\n- src/C.ts - touched last time (Repeat)\n- src/B.ts - touched last time (Repeat)\nnote: the recall is the answer; without a record the hook abstains.",
			);
		});
		Check(Count, "H2: the suggest line counts the recalled companions", () => {
			assert.deepEqual(LinesWith(Run, "candidates call").slice(-1), [
				"replay-suggester: suggest Repeat 0.77 3 candidates call read",
			]);
		});
	}

	// Group H3: an empty store abstains honestly.
	{
		const Agent = { agent: { id: "empty-a" } };
		const Run = Setup(Knobs);
		await Run.State.Flush();
		const Decision = { kind: "allow" };
		const Result = await Call(Run, "read", Probe("src/A.ts"), Agent, Decision);
		Check(Count, "H3: an empty store emits NO note and makes NO claim", () => {
			assert.equal(Result, Decision);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
			assert.equal(LinesWith(Run, "abstained").length, 0);
			assert.equal(LinesWith(Run, "store empty (starting fresh)").length, 1);
		});
	}

	// Group H4: the KV path survives a reopen.
	{
		const Facility = FakeStorage();
		const Agent = { agent: { id: "kv-a" } };
		const First = Mount(Knobs, Facility);
		await First.State.Flush();
		await Episode(First, Agent);
		await First.State.Flush();
		Check(Count, "H4: the domain spec is replay_history v1 per-record with NO compatibleVersions", () => {
			assert.equal(Facility.spec.name, "replay_history");
			assert.equal(Facility.spec.version, 1);
			assert.equal(Facility.spec.layout, "per-record");
			assert.equal(Facility.spec.invalidRecords, "backup-and-skip");
			assert.ok(Facility.spec.tables.history !== undefined);
			assert.ok(Facility.spec.tables.meta !== undefined);
			assert.equal(Facility.spec.compatibleVersions, undefined);
		});
		const Second = Mount(Knobs, Facility);
		await Second.State.Flush();
		Check(Count, "H4: the reopen restores the entries with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Second, "store recovered"), [
				"replay-suggester: store recovered 4 entries (replay_history)",
			]);
			assert.equal(Second.State.History.length, 4);
			assert.equal(Second.State.Seq, 4);
		});
		await CheckAsync(Count, "H4: a call after the reopen recalls the restored companions", async () => {
			const Result = await Call(Second, "read", Probe("src/E.ts"), { agent: { id: "kv-b" } });
			assert.equal(
				Result.additionalContexts[0].content[0].text.includes("- src/D.ts - touched last time (Repeat)"),
				true,
			);
		});
	}

	// Group H5: the JSON fallback survives a reopen.
	{
		const Shared = FreshRecord();
		const Agent = { agent: { id: "file-a" } };
		const First = Setup({ ...Knobs, recordPath: Shared });
		await First.State.Flush();
		await Episode(First, Agent);
		await First.State.Flush();
		Check(Count, "H5: without storage the JSON fallback is the store", () => {
			const Raw = JSON.parse(FileSystem.readFileSync(Shared, "utf8"));
			assert.equal(Raw.version, 1);
			assert.equal(typeof Raw.savedAt, "number");
			assert.deepEqual(
				Raw.entries.map((Entry: any) => Entry.path),
				["src/D.ts", "src/C.ts", "src/B.ts", "src/A.ts"],
			);
		});
		const Second = Setup({ ...Knobs, recordPath: Shared });
		await Second.State.Flush();
		Check(Count, "H5: the fallback reopen restores the entries with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Second, "store recovered"), [
				"replay-suggester: store recovered 4 entries (file)",
			]);
		});
		await CheckAsync(Count, "H5: a call after the fallback reopen recalls the restored companions", async () => {
			const Result = await Call(Second, "read", Probe("src/E.ts"), { agent: { id: "file-b" } });
			assert.equal(
				Result.additionalContexts[0].content[0].text.includes("- src/D.ts - touched last time (Repeat)"),
				true,
			);
		});
	}

	// Group H6: the ring is bounded.
	{
		const Agent = { agent: { id: "bound-a" } };
		const Run = Setup({ ...Knobs, historyDepth: 2 });
		await Run.State.Flush();
		await Episode(Run, Agent);
		await Run.State.Flush();
		Check(Count, "H6: historyDepth bounds the mirror and the agent ring", () => {
			assert.deepEqual(
				Run.State.History.map((Entry: any) => Entry.path),
				["src/D.ts", "src/C.ts"],
			);
			assert.deepEqual(
				Run.State.Agents.get(Agent).History.map((Entry: any) => Entry.path),
				["src/D.ts", "src/C.ts"],
			);
		});
	}

	// Group H7: the calls that are never recorded.
	{
		const Agent = { agent: { id: "skip-a" } };
		const Run = Setup(Knobs);
		await Run.State.Flush();
		await Call(Run, "fetch", Probe("src/A.ts"), Agent);
		await CheckAsync(Count, "H7: a non-judged tool is never recorded", async () => {
			await Run.State.Flush();
			assert.equal(Run.State.History.length, 0);
			assert.equal(LinesWith(Run, "recorded ").length, 0);
		});
		const Foreign = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "replay-suggester-foreign-"));
		FileSystem.writeFileSync(Path.join(Foreign, "src.ts"), "x", "utf8");
		const Gated = Setup(Knobs);
		Gated.Context.workingDirectory = Service(Foreign);
		await Call(Gated, "read", Probe(Path.join(Foreign, "src.ts")), Agent);
		await CheckAsync(Count, "H7: a foreign-workspace call is never recorded", async () => {
			await Gated.State.Flush();
			assert.equal(Gated.State.History.length, 0);
			assert.equal(LinesWith(Gated, "recorded ").length, 0);
			assert.ok(Gated.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
		});
	}

	// Group H8: the seeded store still wins (the fixtures' precedence).
	{
		rmStore();
		WriteStore([{ intent: "Repeat", probe: "src", files: ["src/Seed.ts"], verify: "", at: 1 }]);
		const Agent = { agent: { id: "seed-a" } };
		const Run = Setup(Knobs);
		await Run.State.Flush();
		await Episode(Run, Agent);
		const Result = await Call(Run, "read", Probe("src/E.ts"), Agent);
		Check(Count, "H8: the seeded record takes precedence over the live history", () => {
			const Text = Result.additionalContexts[0].content[0].text;
			assert.equal(Text.includes("- src/Seed.ts - touched last time (Repeat)"), true);
			assert.equal(Text.includes("- src/D.ts"), false);
		});
		rmStore();
	}

	// Group H9: a failed domain open is loud and degrades to the file.
	{
		const Facility = FakeStorage({ failOpen: true });
		const Run = Mount(Knobs, Facility);
		await Run.State.Flush();
		Check(Count, "H9: a failed open is loud and the JSON fallback takes over", () => {
			assert.deepEqual(LinesWith(Run, "store open failed"), [
				"replay-suggester: store open failed: storage unavailable",
			]);
			assert.equal(Run.State.Handle, undefined);
			assert.equal(LinesWith(Run, "store empty (starting fresh)").length, 1);
		});
	}

	return Finish(Count, "History-Producer");
};

// Standalone entry: `node Target/Test/History-Producer/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - History-Producer`);
}
