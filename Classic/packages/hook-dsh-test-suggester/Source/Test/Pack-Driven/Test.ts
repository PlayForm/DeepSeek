// Source/Test/Pack-Driven/Test.ts - the PACK-DRIVEN behaviour: a temporary
// repo with its own `.dsh/pack.yml` (its own signature and its own
// `test/Suite` intent) overrides the built-in intent, so the note names the
// pack's target and carries the pack's caveat; the same workspace WITHOUT
// the pack stays silent (`abstained foreign-workspace`); a pack whose
// signature marker is absent stays silent too; and the built-in pack still
// drives the monorepo path (parity).
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

/** The temp pack: a custom signature and one test/Suite intent. */
const Pack = `signature:
  - docs/STYLE.md
families:
  "test/Suite":
    id: Suite
    priority: 1
    threshold: 0.5
    note: the temp test caveat
    signals:
      - rule: test-shape
        pattern: 'PASS'
        weight: 2.5
    targets:
      - path: SUITE.md
        kind: ''
        prior: 1.0
        reason: the temp suite
`;

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** The PACKED workspace: the pack, its marker and the target. */
const Packed = Tree("test-suggester-packed-");
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
Put(Packed, "SUITE.md");

/** The SAME workspace without the pack. */
const Bare = Tree("test-suggester-bare-");
Put(Bare, "SUITE.md");

/** The UNSIGNED workspace: a pack whose signature marker is absent. */
const Unsigned = Tree("test-suggester-unsigned-");
Put(Unsigned, ".dsh/pack.yml", Pack);

/** The judged read arguments (the hint carries the PASS shape into the probe JSON). */
const Probe = { file_path: "Source/Test/Foo/Test.ts", hint: "PASS" };

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// P1: the temp pack's intent overrides the built-in test/Suite intent.
	{
		const Agent = { agent: { id: "pack-a" } };
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "P1: the temp pack's intent drives the note", async () => {
			const Out = await Call(Run, "read", Probe, Agent);
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "test-suggester",
				form: "notice",
				summary: "Suite 0.87",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[test-suggester] intent=Suite confidence=0.87\ntargets (1):\n- SUITE.md - the temp suite\nnote: the temp test caveat",
			);
			assert.equal(Text.includes("the assertion body"), false);
		});
		await CheckAsync(Count, "P1: the ledger counts the pack's one candidate", async () => {
			assert.ok(
				Run.Lines.includes("test-suggester: suggest Suite 0.87 1 candidates call read"),
			);
		});
	}

	// P2: the same workspace without the pack stays silent.
	{
		const Agent = { agent: { id: "pack-b" } };
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "P2: the same workspace without the pack stays silent", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "read", Probe, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes("candidates call")).length, 0);
		});
	}

	// P3: the pack's signature gates the workspace.
	{
		const Agent = { agent: { id: "pack-c" } };
		const Run = Setup();
		Run.Context.workingDirectory = Service(Unsigned);
		await CheckAsync(Count, "P3: a pack whose signature marker is absent stays silent", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "read", Probe, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
		});
	}

	// P4: the built-in pack still drives the monorepo path (parity).
	{
		const Agent = { agent: { id: "pack-d" } };
		const Run = Setup();
		await CheckAsync(Count, "P4: the built-in pack still drives the monorepo path", async () => {
			const Out = await Call(Run, "read", {
				file_path: "Source/Test/Foo/Test.ts",
				hint: "Run-Smokes says PASS",
			}, Agent);
			assert.equal(Out.additionalContexts[0].source.summary, "Suite 0.65");
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text.includes("- Source/Test/<Suite>/Test.ts - the assertion body - the suite that proves it"),
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
