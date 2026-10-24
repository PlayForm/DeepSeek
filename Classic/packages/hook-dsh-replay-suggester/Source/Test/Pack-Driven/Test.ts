// Source/Test/Pack-Driven/Test.ts - the PACK-DRIVEN behaviour: a temporary
// repo with its own `.dsh/pack.yml` (its own signature and its own
// `replay/Repeat` intent with its own caveat) overrides the built-in intent;
// the same workspace WITHOUT the pack stays silent
// (`abstained foreign-workspace`); a pack whose signature marker is absent
// stays silent too; and the built-in pack still drives the monorepo path
// (parity). The recalled companion comes from the history store (a replay
// answer without a record is a guess, so the pack supplies the caveat and
// the gate, never the companion).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	Call,
	CheckAsync,
	Finish,
	MakeCounter,
	Setup,
	WriteStore,
} from "../Harness.js";

/** A temp tree under the OS temp dir (fresh per folder process). */
const Tree = (Prefix: string): string => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));

/** Write one file under the tree (parents created). */
const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/** The temp pack: a custom signature and one replay/Repeat intent. */
const Pack = `signature:
  - docs/STYLE.md
families:
  "replay/Repeat":
    id: Repeat
    priority: 1
    threshold: 0.75
    note: the temp recall is the answer
    signals:
      - rule: search-shape
        pattern: 'grep'
        weight: 0.5
      - rule: literal-shape
        pattern: '"version"'
        weight: 0.4
      - rule: context-shape
        pattern: 'pattern'
        weight: 0.3
    targets: []
`;

/** The one history record: the probe the judged grep produces. */
const Record = {
	intent: "Repeat",
	probe: 'grep {"pattern":"version"}',
	files: ["Source/Version.ts"],
	verify: "",
};

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** The PACKED workspace: the pack and its marker. */
const Packed = Tree("replay-suggester-packed-");
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");

/** The SAME workspace without the pack. */
const Bare = Tree("replay-suggester-bare-");

/** The UNSIGNED workspace: a pack whose signature marker is absent. */
const Unsigned = Tree("replay-suggester-unsigned-");
Put(Unsigned, ".dsh/pack.yml", Pack);

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// P1: the temp pack's intent (and caveat) drives the note.
	{
		WriteStore([Record]);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "P1: the temp pack's intent and caveat drive the note", async () => {
			const Out = await Call(Run, "grep", { pattern: "version" });
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "replay-suggester",
				form: "notice",
				summary: "Repeat 0.77",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[replay-suggester] intent=Repeat confidence=0.77\ntargets (1):\n- Source/Version.ts - touched last time (Repeat)\nnote: the temp recall is the answer",
			);
		});
		await CheckAsync(Count, "P1: the ledger counts the recalled companion", async () => {
			assert.ok(
				Run.Lines.includes("replay-suggester: suggest Repeat 0.77 1 candidates call grep"),
			);
		});
	}

	// P2: the same workspace without the pack stays silent.
	{
		WriteStore([Record]);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "P2: the same workspace without the pack stays silent", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "grep", { pattern: "version" }, undefined, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes("candidates call")).length, 0);
		});
	}

	// P3: the pack's signature gates the workspace.
	{
		WriteStore([Record]);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Unsigned);
		await CheckAsync(Count, "P3: a pack whose signature marker is absent stays silent", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "grep", { pattern: "version" }, undefined, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
		});
	}

	// P4: the built-in pack still drives the monorepo path (parity).
	{
		WriteStore([{ ...Record, probe: "grep" }]);
		const Run = Setup();
		await CheckAsync(Count, "P4: the built-in pack still drives the monorepo path", async () => {
			const Out = await Call(Run, "grep", {
				pattern: "version",
				path: "Source/Version.ts",
			});
			assert.equal(Out.additionalContexts[0].source.summary, "Repeat 0.77");
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(Text.includes("- Source/Version.ts - touched last time (Repeat)"), true);
			assert.equal(
				Text.includes("note: the recall is the answer; without a record the hook abstains."),
				true,
			);
		});
	}

	return Finish(Count, "Pack-Driven");
};

// Standalone entry: `node Target/Test/Pack-Driven/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Pack-Driven`);
}
