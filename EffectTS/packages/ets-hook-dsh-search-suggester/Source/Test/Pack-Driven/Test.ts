// Source/Test/Pack-Driven/Test.ts - the PACK-DRIVEN behaviour: a temporary
// repo with its own `.dsh/pack.yml` (its own signature and its own
// `search/Version` intent) overrides the built-in intent, so the note names
// the pack's target, never the built-in one; the same workspace WITHOUT the
// pack stays silent (`abstained foreign-workspace`); a pack whose signature
// marker is absent stays silent too; and the built-in pack still drives the
// monorepo path (parity).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
	CheckAsync,
	Finish,
	MakeCounter,
	Post,
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

/** The temp pack: a custom signature and one search/Version intent. */
const Pack = `signature:
  - docs/STYLE.md
families:
  "search/Version":
    id: Version
    priority: 1
    threshold: 0.5
    signals:
      - rule: R1 literal-shape
        pattern: '\\bversion\\b'
        weight: 2.5
    targets:
      - path: VERSIONS.md
        kind: doc
        prior: 1.0
        reason: the temp versions
`;

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** The PACKED workspace: the pack, its marker and the target. */
const Packed = Tree("search-suggester-packed-");
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
Put(Packed, "VERSIONS.md");

/** The SAME workspace without the pack. */
const Bare = Tree("search-suggester-bare-");
Put(Bare, "VERSIONS.md");

/** The UNSIGNED workspace: a pack whose signature marker is absent. */
const Unsigned = Tree("search-suggester-unsigned-");
Put(Unsigned, ".dsh/pack.yml", Pack);

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// P1: the temp pack's intent overrides the built-in search/Version intent.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "P1: the temp pack's intent drives the note", async () => {
			const Out = await Post(Run, {
				name: "grep",
				arguments: { pattern: "version" },
				agent: AgentOf("pack-a"),
			});
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "search-suggester",
				form: "notice",
				summary: "Version 0.87",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[search-suggester] intent=Version confidence=0.87\ntargets (1):\n- VERSIONS.md - the temp versions\nnote: open these before more searches; Target/ is generated, never edit it.",
			);
			assert.equal(Text.includes("the monorepo manifest"), false);
		});
		await CheckAsync(Count, "P1: the ledger counts the pack's one candidate", async () => {
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.87 1 candidates"));
		});
	}

	// P2: the same workspace without the pack stays silent.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "P2: the same workspace without the pack stays silent", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(
				Run,
				{ name: "grep", arguments: { pattern: "version" }, agent: AgentOf("pack-b") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// P3: the pack's signature gates the workspace.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Unsigned);
		await CheckAsync(Count, "P3: a pack whose signature marker is absent stays silent", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(
				Run,
				{ name: "grep", arguments: { pattern: "version" }, agent: AgentOf("pack-c") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"),
			);
		});
	}

	// P4: the built-in pack still drives the monorepo path (parity).
	{
		const Run = Setup();
		await CheckAsync(Count, "P4: the built-in pack still drives the monorepo path", async () => {
			const Out = await Post(Run, {
				name: "grep",
				arguments: { pattern: "version 1.2.3", path: "package.json" },
				agent: AgentOf("pack-d"),
			});
			assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(Text.includes("- package.json - the monorepo manifest"), true);
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
