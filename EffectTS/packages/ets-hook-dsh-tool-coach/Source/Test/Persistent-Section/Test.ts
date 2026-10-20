// Source/Test/Persistent-Section/Test.ts - one singular test: tier 2 of the
// coaching ladder - the persistent system-prompt section: it turns on at the
// escalation threshold, appends EXACTLY one section with every other assembly
// field untouched (PTC + structured-output preserved), fills the verbatim
// heading + fixed rules + the live-fetched tool table capped at
// maxSectionTools, logs no rebuild line on the first build, and auto-clears
// after the clean window with its byte-exact line. Runs standalone
// (`node Target/Test/Persistent-Section/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-tool-coach. The assertions are moved
// verbatim from Classic/smokes/tool-coach-smoke.mjs (R4).
import assert from "node:assert/strict";
import {
	CheckAsync,
	Finish,
	Make,
	MakeCounter,
	Validate,
	Assemble,
	Post,
	rm,
	Agent,
	LinesWith,
	Ledger,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	rm();
	const RunR4 = Make(Validate({ logFile: Ledger }));
	const AgentR4 = Agent("agent-r4");
	for (let Index = 0; Index < 9; Index += 1) {
		await Post(RunR4, "cat a.md", AgentR4);
	}
	await CheckAsync(Count, "R4: the escalation line fires at the 6th strike since the note", async () => {
		assert.ok(LinesWith(RunR4, ": escalated persistent section (8 strikes)").length === 1);
	});
	const Before = await Assemble(RunR4, AgentR4);
	await CheckAsync(Count, "R4: the assembled sections are base + the coach's", async () => {
		assert.ok(Before.sections.length === 2);
	});
	await CheckAsync(Count, "R4: the base section untouched", async () => {
		assert.ok(Before.sections[0].name === "base" && Before.sections[0].text === "BASE");
	});
	await CheckAsync(Count, "R4: the appended section is the coach's", async () => {
		assert.ok(Before.sections[1].name === "hook-dsh-tool-coach");
	});
	await CheckAsync(Count, "R4: the section text starts with the verbatim heading", async () => {
		assert.ok(Before.sections[1].text.startsWith("Tool discipline (persistent, from tool-coach):"));
	});
	await CheckAsync(
		Count,
		"R4: contexts, tools and variables are DEEP-EQUAL untouched (PTC + structured-output preserved)",
		async () => {
			assert.ok(Before.contexts.length === 1 && Before.variables.v === "1" && Before.tools.length === 1);
		},
	);
	await CheckAsync(Count, "R4: the ${command} fill lands in both fixed rules", async () => {
		assert.ok(
			Before.sections[1].text.includes(
				'- NEVER read file content through the terminal: "cat a.md-style" commands',
			) &&
				Before.sections[1].text.includes(
					"- NEVER mutate file content through the terminal: cat a.md-style commands",
				),
		);
	});
	await CheckAsync(Count, "R4/D1: no literal ${ placeholder remains in the composed section", async () => {
		assert.ok(!Before.sections[1].text.includes("${"));
	});
	await CheckAsync(Count, "R4: the tool table has exactly maxSectionTools (8) rows", async () => {
		const Table = Before.sections[1].text.split("| tool | purpose |")[1] ?? "";
		const Rows = Table.split("\n").filter(
			(Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"),
		);
		assert.equal(Rows.length, 8);
	});
	await CheckAsync(Count, "R4: the first row is the write-class mapped tool (edit), live description", async () => {
		const Table = Before.sections[1].text.split("| tool | purpose |")[1] ?? "";
		const Rows = Table.split("\n").filter(
			(Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"),
		);
		assert.equal(Rows[0], "| edit | Edit an existing UTF-8 text file by replacing literal text. |");
	});
	await CheckAsync(
		Count,
		"R4: the third row is the read-class mapped tool with the LIVE description",
		async () => {
			const Table = Before.sections[1].text.split("| tool | purpose |")[1] ?? "";
			const Rows = Table.split("\n").filter(
				(Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"),
			);
			assert.equal(
				Rows[2],
				"| read | Read a UTF-8 text file (live fixture) and return line-numbered content. |",
			);
		},
	);
	await CheckAsync(
		Count,
		"R4: the cap holds - with 11 mapped tools the 8 rows are all mapped (the top-up appears in D3b)",
		async () => {
			const Table = Before.sections[1].text.split("| tool | purpose |")[1] ?? "";
			const Rows = Table.split("\n").filter(
				(Row: string) => Row.startsWith("| ") && !Row.startsWith("| ---"),
			);
			assert.ok(!Rows.some((Row: string) => Row.includes("zzz_fixture")));
		},
	);
	await CheckAsync(Count, "R4: the FIRST section build logs no rebuild line", async () => {
		assert.ok(LinesWith(RunR4, ": section rebuilt").length === 0);
	});
	const OffensesBeforeClean = LinesWith(RunR4, ": offense bash read").length;
	for (let Index = 0; Index < 12; Index += 1) {
		await Post(RunR4, "git status", AgentR4);
	}
	await CheckAsync(
		Count,
		"R4: 12 clean judged calls clear the section: 'persistent section cleared (12 clean calls)'",
		async () => {
			assert.ok(LinesWith(RunR4, ": persistent section cleared (12 clean calls)").length === 1);
		},
	);
	const After = await Assemble(RunR4, AgentR4);
	await CheckAsync(
		Count,
		"R4: after the clean window the assembly has NO coach section (returns untouched)",
		async () => {
			assert.ok(After.sections.length === 1 && After.sections[0].name === "base");
		},
	);
	await CheckAsync(Count, "R4: the clean git status calls wrote no NEW offense lines", async () => {
		assert.ok(LinesWith(RunR4, ": offense bash read").length === OffensesBeforeClean);
	});
	return Finish(Count, "Persistent-Section");
};

// Standalone entry: `node Target/Test/Persistent-Section/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Persistent-Section`);
}
