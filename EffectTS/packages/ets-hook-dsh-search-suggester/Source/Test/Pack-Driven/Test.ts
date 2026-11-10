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
	SeedHistory,
	Setup,
} from "../Harness.js";

/**
 * @module Test
 *
 * The explicit pack override test.
 *
 * @remarks
 *
 * A temporary repo with its own `.dsh/pack.yml` (its own `search/Version`
 * family) speaks when the session history is empty, so the note names the
 * pack's companion and never a built-in one. The same workspace WITHOUT the
 * pack abstains `no-history` (the built-in pack is never a candidate
 * source). A pack in a rooted tree still governs even when its declared
 * signature marker is absent (the root gates, not the signature). The
 * monorepo path with no history abstains `no-history` instead of naming a
 * built-in companion. The History family is prepended before the pack's own
 * rows.
 */
/**
 * A temp tree under the OS temp dir (fresh per folder process).
 */
const Tree = (Prefix: string): string => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));

/**
 * Write one file under the tree (parents created).
 */
const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/**
 * The temp pack: a custom signature and one search/Version family.
 */
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

/**
 * The optional harness service the probe reads (the real shape: get(session)).
 */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/**
 * The PACKED workspace: the manifest, the pack, its marker and the target.
 */
const Packed = Tree("search-suggester-packed-");
Put(Packed, "package.json", "{}");
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
Put(Packed, "VERSIONS.md");
const PackedManifest = Path.join(Packed, "package.json");

/**
 * The SAME workspace without the pack.
 */
const Bare = Tree("search-suggester-bare-");
Put(Bare, "package.json", "{}");
Put(Bare, "VERSIONS.md");

/**
 * The UNSIGNED workspace: a pack whose signature marker is absent.
 */
const Unsigned = Tree("search-suggester-unsigned-");
Put(Unsigned, "package.json", "{}");
Put(Unsigned, ".dsh/pack.yml", Pack);

/**
 * One judged grep with no path argument (the cwd carries the workspace).
 */
const Grep = (Id: string, Pattern = "version"): any => ({
	name: "grep",
	arguments: { pattern: Pattern },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// P1: the explicit temp pack's family drives the note (empty history).
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "P1: the temp pack's family drives the note", async () => {
			const Out = await Post(Run, Grep("pack-a"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "search-suggester",
				form: "notice",
				summary: "Version 0.87",
			});
			assert.equal(
				Out.additionalContexts[0].content[0].text,
				"[search-suggester] intent=Version confidence=0.87\ntargets (1):\n- VERSIONS.md - the temp versions\nnote: open these before more searches; Target/ is generated, never edit it.",
			);
		});
		await CheckAsync(Count, "P1: the ledger counts the pack's one candidate", async () => {
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.87 1 candidates"));
		});
	}

	// P2: the same workspace without the pack abstains no-history.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "P2: the same workspace without the pack abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Grep("pack-b"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// P3: the root gates the pack, not its declared signature marker.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Unsigned);
		await CheckAsync(Count, "P3: a pack with an absent companion abstains no-companions", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Grep("pack-c"), Decision);
			assert.equal(Out, Decision);
			// The pack's family matched, and its one companion does not exist
			// in the tree: the existence filter empties the set.
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions Version 0.87"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// P4: the built-in pack is NEVER a candidate source.
	{
		const Run = Setup();
		await CheckAsync(Count, "P4: a monorepo read with no history abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(
				Run,
				{ name: "read", arguments: { file_path: "package.json" }, agent: AgentOf("pack-d") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
	}

	// P5: the History family is prepended before the explicit pack's rows.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		SeedHistory(Run, "pack-e", PackedManifest, ["VERSIONS.md"]);
		await CheckAsync(Count, "P5: the History family outranks the explicit pack's row", async () => {
			const Out = await Post(Run, {
				name: "grep",
				arguments: { pattern: "version", path: PackedManifest },
				agent: AgentOf("pack-e"),
			});
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 1 candidates"),
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
