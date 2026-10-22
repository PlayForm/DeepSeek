// Source/Test/Render-And-Collapse/Test.ts - the section framer and the
// budget collapse: the fixed frame byte-exact (with and without the version
// stamp), the empty section, the fully-fitting budget, the overflow summary
// (never a silent drop), and the order preservation.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Render, Collapse } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group R1: the frame.
	{
		Check(Count, "R1: the frame is byte-exact with the version stamp", () => {
			assert.equal(
				Render({ id: "map", kind: "map", title: "workspace map", lines: ["a.ts: entry", "b.ts: util"], version: "v2" }),
				[
					"--- WORKSPACE SECTION map (map) - workspace map @ v2 ---",
					"a.ts: entry",
					"b.ts: util",
					"--- END WORKSPACE SECTION map ---",
				].join("\n"),
			);
		});
		Check(Count, "R1: without a version the header carries no stamp", () => {
			assert.equal(
				Render({ id: "note", kind: "note", title: "plain", lines: ["hi"] }),
				[
					"--- WORKSPACE SECTION note (note) - plain ---",
					"hi",
					"--- END WORKSPACE SECTION note ---",
				].join("\n"),
			);
		});
		Check(Count, "R1: an empty section renders as the empty string", () => {
			assert.equal(Render({ id: "open", kind: "open", title: "questions", lines: [], version: "v3" }), "");
		});
	}

	// Group C1: the budget collapse.
	{
		const Sections = [
			{ id: "s1", kind: "map", title: "one", lines: ["l1"] },
			{ id: "s2", kind: "focus", title: "two", lines: ["l2"], version: "v5" },
		];
		const Full = Collapse(Sections, Number.MAX_SAFE_INTEGER);
		Check(Count, "C1: a generous budget keeps every section framed and uncollapsed", () => {
			assert.equal(Full.length, 2);
			assert.equal(Full[0]?.collapsed, false);
			assert.equal(Full[1]?.collapsed, false);
			assert.ok((Full[0]?.text ?? "").startsWith("--- WORKSPACE SECTION s1"));
		});
		const S1Length = Render(Sections[0]).length;
		const Tight = Collapse(Sections, S1Length);
		Check(Count, "C1: the overflow section collapses to its one-line version-stamped summary", () => {
			assert.equal(Tight[0]?.collapsed, false);
			assert.equal(Tight[1]?.collapsed, true);
			assert.equal(Tight[1]?.text, "s2 (focus) collapsed: two @ v5");
		});
		Check(Count, "C1: the summary keeps the section visible, never dropped", () => {
			assert.ok(Tight.every((E) => E.text.length > 0));
			assert.equal(Tight.length, 2);
		});
		const None = Collapse(Sections, 0);
		Check(Count, "C1: a zero budget collapses everything", () => {
			assert.equal(None.filter((E) => E.collapsed).length, 2);
			assert.equal(None[0]?.text, "s1 (map) collapsed: one");
		});
	}

	return Finish(Count, "Render-And-Collapse");
};

// Standalone entry: `node Target/Test/Render-And-Collapse/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Render-And-Collapse`);
}
