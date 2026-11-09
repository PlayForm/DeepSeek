/**
 * @module Test
 *
 * The EXPLICIT pack override: a temporary repo with its own `.dsh/pack.yml` drives the intent
 * and the caveat while the candidates still come from the recall.
 *
 * @remarks
 * The pack's own `replay/Rerun` family outranks the synthesized one, so the pack never supplies a
 * file. The same workspace WITHOUT the pack emits the synthesized Repeat note (the recall is the
 * only default source); the pack with NO record matches and abstains `no-memory`; and a workspace
 * with neither a pack nor a record abstains `no-history` instead of naming a literal built-in
 * pack.
 */
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
	rmStore,
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

/** Mark the tree as a workspace root (the pack-independent `package.json` marker). */
const Manifest = (Root: string): void => {
	FileSystem.writeFileSync(Path.join(Root, "package.json"), "{}", "utf8");
};

/** The temp pack: a declared signature and one replay/Rerun family. */
const Pack = `signature:
  - docs/STYLE.md
families:
  "replay/Rerun":
    id: Rerun
    priority: 1
    threshold: 0.75
    note: the temp recall is the answer
    signals:
      - rule: temp-shape
        pattern: 'grep'
        weight: 3.0
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

/** The PACKED workspace: the root marker, the pack, and the recalled path. */
const Packed = Tree("replay-suggester-packed-");
Manifest(Packed);
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "Source/Version.ts");

/** The SAME workspace without the pack (the recalled file still exists). */
const Bare = Tree("replay-suggester-bare-");
Manifest(Bare);
Put(Bare, "Source/Version.ts");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// P1: the explicit pack's family outranks the synthesized one.
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
				summary: "Rerun 0.92",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[replay-suggester] intent=Rerun confidence=0.92\ntargets (1):\n- Source/Version.ts - touched last time (Repeat)\nnote: the temp recall is the answer",
			);
			// The candidates come from the recall, never from the pack: the
			// pack's own target set is empty.
			assert.equal(Text.includes("docs/STYLE.md"), false);
		});
		await CheckAsync(Count, "P1: the ledger counts the recalled companion", async () => {
			assert.ok(
				Run.Lines.includes("replay-suggester: suggest Rerun 0.92 1 candidates call grep"),
			);
		});
	}

	// P2: the same workspace without the pack emits the synthesized note.
	{
		WriteStore([Record]);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "P2: without a pack the recall still produces the note", async () => {
			const Out = await Call(Run, "grep", { pattern: "version" });
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "replay-suggester",
				form: "notice",
				summary: "Repeat 0.87",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- Source/Version.ts - touched last time (Repeat)\nnote: the last time this call was made, these files were touched",
			);
			assert.ok(
				Run.Lines.includes("replay-suggester: suggest Repeat 0.87 1 candidates call grep"),
			);
		});
	}

	// P3: the pack with no record matches and abstains no-memory.
	{
		rmStore();
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "P3: a pack family with no record abstains no-memory", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "grep", { pattern: "version" }, undefined, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("replay-suggester: abstained no-memory Rerun 0.92"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes("candidates call")).length, 0);
		});
	}

	// P4: no pack and no record abstains no-history.
	{
		rmStore();
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "P4: a workspace with no pack and no record abstains no-history", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "grep", { pattern: "version" }, undefined, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("replay-suggester: abstained no-history  0.00"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes("candidates call")).length, 0);
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
