// Source/Test/Render-And-Frames/Test.ts - the R-series: the section shape
// (exactly one appended section named live-containers, interpolate: false),
// the byte-exact LIVE CONTAINER frame for every phase-1 block kind, the
// variable table (time/date/tz under the FAKE CLOCK, counters, manifest,
// gauge), the per-block vars override, the {{token}} replace-only engine
// (unknown tokens render literally + ledger `render unknown <id> <token>`),
// and the budget failsafe (the oldest frames collapse to one-line summaries
// + ledger `failsafe section-collapse <n>`). Every assertion lands on the
// rendered section text or a ledger line - never on "no throw".
import assert from "node:assert/strict";
import {
	Advance,
	Assemble,
	Block,
	Check,
	ClockBox,
	ExpectedDate,
	ExpectedTime,
	Finish,
	Frame,
	LinesWith,
	MakeClocked,
	MakeCounter,
	Validate,
	Ledger,
	rm,
	Zone,
	LiveSection,
	PreStep,
	Post,
} from "../Harness.js";

const Now0 = ClockBox.Now;

const Frame1 = (Id: string, Body: string): string => Frame("---", Id, Body);
const ExpectedFrames: Record<string, string> = {
	t: Frame1("t", `${ExpectedTime(Now0)} | ${ExpectedDate(Now0)} | ${Zone()}`),
	c: Frame1("c", "m=0 t=0 s=none"),
	man: Frame1("man", `cwd=${process.cwd()} session=scope-1`),
	g: Frame1("g", "m=0 s=none"),
	n: Frame1("n", "hello"),
	tpl: Frame1("tpl", "tpl sees 0"),
};
const Expected1 = Object.values(ExpectedFrames).join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the section shape and the six kind frames (one assembly over a
	// table with one block of every phase-1 kind plus one wave-2 kind).
	rm();
	const Run1 = MakeClocked(
		Validate({
			logFile: Ledger,
			enabled: true,
			blocks: [
				Block("t", "time", "{{time}} | {{date}} | {{tz}}"),
				Block("c", "counter", "m={{messageCount}} t={{turnCount}} s={{sinceLastTool}}"),
				Block("man", "manifest", "cwd={{cwd}} session={{sessionId}}"),
				Block("g", "gauge", "m={{messageCount}} s={{sinceLastTool}}"),
				Block("n", "note", "hello"),
				Block("tpl", "template", "tpl sees {{messageCount}}"),
				Block("wave2", "session-stats", "messages={{messageCount}}"),
			],
		}),
	);
	const Out1 = await Assemble(Run1);
	{
		const Live = LiveSection(Out1);
		Check(Count, "exactly ONE section appended per assembly", () => {
			assert.equal(Out1.sections.length, 2);
			assert.equal(Live !== undefined, true);
			assert.equal(Out1.sections.filter((S: any) => S.name === "live-containers").length, 1);
		});
		Check(Count, 'the section name is "live-containers"', () => {
			assert.equal(Live.name, "live-containers");
		});
		Check(Count, "the section carries interpolate: false", () => {
			assert.equal(Live.interpolate, false);
		});
		Check(Count, "the base section is untouched", () => {
			assert.deepEqual(Out1.sections[0], { name: "base", text: "BASE" });
		});
		Check(Count, "the section body is the byte-exact kind-frame table", () => {
			assert.equal(Live.text, Expected1);
		});
		Check(Count, "the wave-2 kind is skipped, not rendered", () => {
			assert.equal(Live.text.includes("wave2"), false);
		});
		Check(Count, "ledger: one block rendered line per rendered block (byte-exact)", () => {
			for (const [Id, FrameText] of Object.entries(ExpectedFrames)) {
				const Lines = LinesWith(Run1, `block rendered ${Id} (`);
				assert.equal(Lines.length, 1);
				assert.equal(
					Lines[0],
					`hook-dsh-live-containers: block rendered ${Id} (${Buffer.byteLength(
						FrameText,
						"utf8",
					)} bytes)`,
				);
			}
		});
		Check(Count, "ledger: the wave-2 kind skips with (unknown kind)", () => {
			assert.deepEqual(LinesWith(Run1, "block skipped wave2"), [
				"hook-dsh-live-containers: block skipped wave2 (unknown kind)",
			]);
		});
	}
	// Group: the recompute/changing-value cycle (counters + the fake clock).
	{
		await PreStep(Run1, 2);
		await Post(Run1, "bash");
		Advance(7000);
		const Out2 = await Assemble(Run1);
		const Live2 = LiveSection(Out2);
		Check(Count, "counter block recomputed from the pre-step/post-execute observers", () => {
			assert.ok(Live2.text.includes(Frame1("c", "m=2 t=1 s=7s")));
		});
		Check(Count, "gauge block recomputed (sinceLastTool after clock advance)", () => {
			assert.ok(Live2.text.includes(Frame1("g", "m=2 s=7s")));
		});
		Check(Count, "template kind sees the whole variable table", () => {
			assert.ok(Live2.text.includes(Frame1("tpl", "tpl sees 2")));
		});
		Check(Count, "time block recomputed under the advanced fake clock", () => {
			assert.ok(Live2.text.includes(Frame1("t", `${ExpectedTime(ClockBox.Now)} | ${ExpectedDate(ClockBox.Now)} | ${Zone()}`)));
			assert.equal(Live2.text === Expected1, false);
		});
		Check(Count, "ledger: request-trigger blocks re-rendered (second pass)", () => {
			assert.ok(LinesWith(Run1, "block rendered c (").length >= 2);
		});
	}
	// Group: {{}} replace-only, unknown tokens literal (interpolate: false).
	rm();
	{
		const Run2 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("u", "note", "{{provider}} and {{mystery}}")],
			}),
		);
		const Out = await Assemble(Run2);
		Check(Count, "unknown tokens render LITERALLY (the harness variable never resolves)", () => {
			assert.ok(LiveSection(Out).text.includes("{{provider}} and {{mystery}}"));
		});
		Check(Count, "ledger: render unknown lines (byte-exact, once per token)", () => {
			assert.deepEqual(LinesWith(Run2, "render unknown u "), [
				"hook-dsh-live-containers: render unknown u provider",
				"hook-dsh-live-containers: render unknown u mystery",
			]);
		});
	}
	// Group: per-block vars override the built-ins.
	rm();
	{
		const Run3 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("f", "time", "{{time}}", { vars: { time: "frozen" } })],
			}),
		);
		const Out3 = await Assemble(Run3);
		Check(Count, "per-block vars override the built-in token", () => {
			assert.ok(LiveSection(Out3).text.includes(Frame("---", "f", "frozen")));
		});
		Check(Count, "vars override leaves no unknown-token ledger line", () => {
			assert.equal(LinesWith(Run3, "render unknown f").length, 0);
		});
	}
	// Group: the separator knob shapes the frame.
	rm();
	{
		const Run4 = MakeClocked(
			Validate({ logFile: Ledger, enabled: true, separator: "===", blocks: [Block("s", "note", "hi")] }),
		);
		const Out4 = await Assemble(Run4);
		Check(Count, "custom separator byte-exact in the frame", () => {
			assert.equal(
				LiveSection(Out4).text,
				Frame("===", "s", "hi"),
			);
		});
	}
	// Group: the budget failsafe (the oldest frames collapse; never silent).
	rm();
	{
		const Fat = "x".repeat(200);
		const Run5 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				sectionBudgetBytes: 100,
				blocks: [Block("fat1", "note", Fat), Block("fat2", "note", Fat)],
			}),
		);
		const Out5 = await Assemble(Run5);
		const Text = LiveSection(Out5).text;
		const FatFrame1 = Frame("---", "fat1", Fat);
		Check(Count, "the budget collapse leaves a one-line summary for the oldest frame", () => {
			assert.ok(
				Text.includes(`--- LIVE CONTAINER fat1 (collapsed, ${Buffer.byteLength(FatFrame1, "utf8")} bytes; not harness state) ---`),
			);
		});
		Check(Count, "the last frame is never collapsed", () => {
			assert.ok(Text.includes(Frame("---", "fat2", Fat)));
		});
		Check(Count, "ledger: failsafe section-collapse 1 (byte-exact)", () => {
			assert.deepEqual(LinesWith(Run5, "failsafe section-collapse"), [
				"hook-dsh-live-containers: failsafe section-collapse 1",
			]);
		});
	}
	// Group: nothing renders -> NO section at all (empty body passthrough).
	rm();
	{
		const Run6 = MakeClocked(
			Validate({
				logFile: Ledger,
				enabled: true,
				blocks: [Block("off", "note", "hi", { enabled: false })],
			}),
		);
		const Out6 = await Assemble(Run6);
		Check(Count, "an all-disabled table appends no section", () => {
			assert.equal(Out6.sections.length, 1);
			assert.equal(Out6.sections[0].name, "base");
		});
		Check(Count, "ledger: the disabled block skip line (byte-exact, once)", () => {
			assert.deepEqual(LinesWith(Run6, "block skipped off"), [
				"hook-dsh-live-containers: block skipped off (disabled)",
			]);
		});
	}
	return Finish(Count, "Render-And-Frames");
};

// Standalone entry: `node Target/Test/Render-And-Frames/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Render-And-Frames`);
}
