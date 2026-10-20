// Source/Test/Notes-And-Cooldown/Test.ts - one singular test: tier 1 of the
// coaching ladder - detection + strikes (R2) and the cooldown gating (R3).
// The two tiers share one run on purpose: R3's counts continue the exact
// run R2 built (R3's strike/suppression arithmetic is relative to R2's
// history), so the folder replays R2's four setup calls before R3's
// fresh-agent sequence. Runs standalone
// (`node Target/Test/Notes-And-Cooldown/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-tool-coach. The assertions are moved
// verbatim from Classic/smokes/tool-coach-smoke.mjs (R2 + R3).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
	Check,
	CheckAsync,
	Finish,
	Make,
	MakeCounter,
	Validate,
	Ledger,
	Post,
	rm,
	ACCEPT,
	Agent,
	LinesWith,
	CAT_ROW,
	SED_ROW,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: R2 - detect + strike: 3 offenses below the per-class threshold,
	// the 4th (same class) notes; the note text is byte-exact and carries the
	// LIVE fetch (D1's discriminator).
	rm();
	const RunR2 = Make(Validate({ logFile: Ledger }));
	{
		const AgentR2 = Agent("agent-r2");
		await Post(RunR2, "cat a.md", AgentR2);
		await Post(RunR2, "cat a.md", AgentR2);
		await Post(RunR2, "sed -i s/x/y/ b.md", AgentR2);
		Check(Count, "R2: two offense lines for the read-class cat, byte-exact pattern", () => {
			assert.ok(
				LinesWith(RunR2, ": offense bash read ").length === 2 &&
					LinesWith(RunR2, `: offense bash read ${CAT_ROW}`).length === 2,
			);
		});
		Check(Count, "R2: one offense line for the write-class sed -i, byte-exact pattern", () => {
			assert.ok(LinesWith(RunR2, `: offense bash write ${SED_ROW}`).length === 1);
		});
		await CheckAsync(Count, "R2: no note below the threshold (mixed classes, read at 2)", async () => {
			assert.ok(LinesWith(RunR2, ": strike ").length === 0);
		});
		const R2Out = await RunR2.Listeners["tools/post-execute"](
			{
				callId: "call_smoke",
				name: "bash",
				arguments: { command: "cat a.md" },
				agent: AgentR2,
				signal: undefined,
			},
			{ isError: false, value: "", content: [] },
			async () => ACCEPT,
		);
		await CheckAsync(Count, "R2: the 4th read offense returns a NEW decision", async () => {
			assert.ok(R2Out !== ACCEPT && R2Out.kind === "accept");
		});
		await CheckAsync(
			Count,
			"R2/D1: the notice carries the load-bearing source label {kind, form, summary}",
			async () => {
				assert.equal(
					JSON.stringify(R2Out.additionalContexts?.[0]?.source),
					JSON.stringify({ kind: "tool-coach", form: "notice", summary: "bash read \u00d7 4" }),
				);
			},
		);
		await CheckAsync(
			Count,
			"R2/D1: the tier-1 note text is byte-exact with the LIVE (fetched) description",
			async () => {
				const R2Text = R2Out.additionalContexts[0].content[0].text;
				assert.equal(
					R2Text,
					`Tool-coach note (strike 4, read-class bash pattern):
- "cat a.md" is forbidden for file content. Use the read tool instead.
- read: Read a UTF-8 text file (live fixture) and return line-numbered content. (key parameter: file_path).
- terminal edits produce no fs/observed event, so the governor/pinner/normalize plugins never see them.
The terminal runs COMMANDS (builds, tests, git, package managers); the tools handle CONTENT.`,
				);
			},
		);
		await CheckAsync(Count, "D1: no literal ${ placeholder remains in the composed note", async () => {
			const R2Text = R2Out.additionalContexts[0].content[0].text;
			assert.ok(!R2Text.includes("${"));
		});
		await CheckAsync(
			Count,
			"R2: the strike ledger line is byte-exact: 'strike 4/3 bash read -> note read'",
			async () => {
				assert.ok(LinesWith(RunR2, ": strike 4/3 bash read -> note read").length === 1);
			},
		);
		await CheckAsync(Count, "the durable ledger file carries the [ISO] strike line", async () => {
			assert.ok(
				FileSystem.existsSync(Ledger) &&
					FileSystem.readFileSync(Ledger, "utf8").includes("] strike 4/3 bash read -> note read"),
			);
		});
	}
	// Group: R3 - cooldown: offenses inside the cooldown suppress the note; the
	// second note waits for the cooldown; tier 2 escalates on the way (6
	// strikes since the note). R3 continues the SAME run (the counts are
	// relative to R2's history: agent-r2's four calls and one note).
	{
		const AgentR3 = Agent("agent-r3");
		for (let Index = 0; Index < 9; Index += 1) {
			await Post(RunR2, "cat a.md", AgentR3);
		}
		await CheckAsync(
			Count,
			"R3: six cooldown-suppressed lines for the offenses inside the cooldown (calls 4-9)",
			async () => {
				assert.ok(LinesWith(RunR2, ": cooldown suppressed ").length === 6);
			},
		);
		await CheckAsync(
			Count,
			"R3: the fresh agent's own first note fired at its 3rd offense (per-class threshold)",
			async () => {
				assert.ok(LinesWith(RunR2, ": strike 3/3 bash read -> note read").length === 1);
			},
		);
		await CheckAsync(
			Count,
			"R3: the suppressed line carries the total strikes: 'cooldown suppressed 8 bash read'",
			async () => {
				assert.ok(LinesWith(RunR2, ": cooldown suppressed 8 bash read").length >= 1);
			},
		);
		await CheckAsync(
			Count,
			"R3: tier 2 escalates at 6 strikes since the note: 'escalated persistent section (8 strikes)'",
			async () => {
				assert.ok(LinesWith(RunR2, ": escalated persistent section (8 strikes)").length === 1);
			},
		);
		await CheckAsync(
			Count,
			"R3: still only TWO strike lines (no second note inside the cooldown)",
			async () => {
				assert.ok(LinesWith(RunR2, ": strike ").length === 2);
			},
		);
		for (let Index = 0; Index < 3; Index += 1) {
			await Post(RunR2, "cat a.md", AgentR3);
		}
		await CheckAsync(Count, "R3: nine cooldown-suppressed lines in total (calls 4-12)", async () => {
			assert.ok(LinesWith(RunR2, ": cooldown suppressed ").length === 9);
		});
		await Post(RunR2, "cat a.md", AgentR3); // the 10th judged call since the note
		await CheckAsync(
			Count,
			"R3: the second note fires exactly when the cooldown elapses (window capped at 8)",
			async () => {
				assert.ok(LinesWith(RunR2, ": strike 8/3 bash read -> note read").length === 1);
			},
		);
	}
	return Finish(Count, "Notes-And-Cooldown");
};

// Standalone entry: `node Target/Test/Notes-And-Cooldown/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Notes-And-Cooldown`);
}
