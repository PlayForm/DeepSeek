// Source/Test/Pack-Driven/Test.ts - the PACK-DRIVEN behaviour: a temporary
// repo with its own `.dsh/pack.yml` (its own signature and its own
// `doc/Index` family) overrides the built-in family, so the note names the
// pack's companion, never the built-in one; the same workspace WITHOUT the
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

/** The temp pack: a custom signature and one doc/Index family. */
const Pack = `signature:
  - docs/STYLE.md
families:
  "doc/Index":
    id: Index
    priority: 1
    threshold: 0.75
    signals:
      - rule: index
        pattern: '(^|/)Documentation/INDEX\\.md$'
        weight: 2.5
    targets:
      - path: docs/STYLE.md
        kind: style
        prior: 1.0
        reason: the temp style
`;

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** The PACKED workspace: the pack, its marker and the triggering path. */
const Packed = Tree("doc-suggester-packed-");
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
const PackedIndex = Put(Packed, "Documentation/INDEX.md");

/** The SAME workspace without the pack: the triggering path only. */
const Bare = Tree("doc-suggester-bare-");
const BareIndex = Put(Bare, "Documentation/INDEX.md");

/** The UNSIGNED workspace: a pack whose signature marker is absent. */
const Unsigned = Tree("doc-suggester-unsigned-");
Put(Unsigned, ".dsh/pack.yml", Pack);
const UnsignedIndex = Put(Unsigned, "Documentation/INDEX.md");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// P1: the temp pack's family overrides the built-in doc/Index family.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "P1: the temp pack's family drives the note", async () => {
			const Out = await Post(Run, {
				name: "read",
				arguments: { file_path: PackedIndex },
				agent: AgentOf("pack-a"),
			});
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "doc-suggester",
				form: "notice",
				summary: "Index 0.87",
			});
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text,
				"[doc-suggester] family=Index confidence=0.87\ncompanions (1):\n- docs/STYLE.md - the temp style\nnote: a documentation task rarely touches one file; keep the doc graph coherent.",
			);
			assert.equal(Text.includes("Documentation/ARCHIVE-STYLE.md"), false);
		});
		await CheckAsync(Count, "P1: the ledger counts the pack's one companion", async () => {
			assert.ok(
				Run.Lines.includes(
					`hook-dsh-doc-suggester: suggest Index 0.87 1 companions ${PackedIndex}`,
				),
			);
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
				{ name: "read", arguments: { file_path: BareIndex }, agent: AgentOf("pack-b") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(
				Run.Lines.includes("hook-dsh-doc-suggester: abstained foreign-workspace  0.00"),
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
				{ name: "read", arguments: { file_path: UnsignedIndex }, agent: AgentOf("pack-c") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(
				Run.Lines.includes("hook-dsh-doc-suggester: abstained foreign-workspace  0.00"),
			);
		});
	}

	// P4: the built-in pack still drives the monorepo path (parity).
	{
		const Run = Setup();
		await CheckAsync(Count, "P4: the built-in pack still drives the monorepo path", async () => {
			const Out = await Post(Run, {
				name: "read",
				arguments: { file_path: "Documentation/Plans/POC-LEDGER.md" },
				agent: AgentOf("pack-d"),
			});
			assert.equal(Out.additionalContexts[0].source.summary, "Plan 0.87");
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(Text.includes("- Documentation/INDEX.md - the index row"), true);
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
