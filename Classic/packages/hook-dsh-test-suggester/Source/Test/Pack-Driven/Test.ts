/**
 * @module Test
 *
 * The EXPLICIT pack override: a temporary repo with its own `.dsh/pack.yml` still speaks when
 * the session history is empty.
 *
 * @remarks
 * The note names the pack's `test/Suite` companion and never the built-in one. The same workspace
 * WITHOUT the pack abstains `no-history` (the built-in pack is never a candidate source); a pack
 * in a rooted tree still governs even when its declared signature marker is absent (the root
 * gates, not the signature); and the monorepo path with no history abstains `no-history` instead
 * of naming the built-in pack's companions.
 */
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
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

/** Mark the tree as a workspace root (the pack-independent `package.json` marker). */
const Manifest = (Root: string): void => {
	FileSystem.writeFileSync(Path.join(Root, "package.json"), "{}", "utf8");
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

/** The judged read inside one tree (the absolute path anchors the root there). */
const Probe = (Root: string): Record<string, unknown> => ({
	file_path: Path.join(Root, "Source/Test/Foo/Test.ts"),
	hint: "PASS",
});

/** The PACKED workspace: the manifest, the pack, its marker and the target. */
const Packed = Tree("test-suggester-packed-");
Manifest(Packed);
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
Put(Packed, "SUITE.md");

/** The SAME workspace without the pack: the manifest and the target only. */
const Bare = Tree("test-suggester-bare-");
Manifest(Bare);
Put(Bare, "SUITE.md");

/** The UNSIGNED workspace: a pack whose signature marker is absent. */
const Unsigned = Tree("test-suggester-unsigned-");
Manifest(Unsigned);
Put(Unsigned, ".dsh/pack.yml", Pack);

/** The MONOREPO-shaped tree: a manifest and a doc path, no pack and no smoke tree. */
const Monorepo = Tree("test-suggester-monorepo-");
Manifest(Monorepo);
Put(Monorepo, "Documentation/Plans/POC-LEDGER.md");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// P1: the explicit temp pack's family drives the note (empty history).
	{
		const Agent = AgentOf("pack-a");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "P1: the temp pack's family drives the note", async () => {
			const Out = await Call(Run, "read", Probe(Packed), Agent);
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

	// P2: the same workspace without the pack abstains no-history.
	{
		const Agent = AgentOf("pack-b");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "P2: the same workspace without the pack abstains no-history", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "read", Probe(Bare), Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("test-suggester: abstained no-history  0.00"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes("candidates call")).length, 0);
		});
	}

	// P3: the root gates the pack, not its declared signature marker.
	{
		const Agent = AgentOf("pack-c");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Unsigned);
		await CheckAsync(Count, "P3: a pack with an absent signature marker still governs the tree", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "read", Probe(Unsigned), Agent, Decision);
			assert.equal(Out, Decision);
			// The pack's family matched, and its one companion does not exist
			// in the tree: the existence filter empties the set.
			assert.ok(Run.Lines.includes("test-suggester: abstained no-companions Suite 0.87"));
			assert.equal(Run.Lines.filter((Line: string) => Line.includes("candidates call")).length, 0);
		});
	}

	// P4: the built-in pack is NEVER a candidate source.
	{
		const Agent = AgentOf("pack-d");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Monorepo);
		await CheckAsync(Count, "P4: a monorepo test read with no history abstains no-history", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(
				Run,
				"read",
				{ file_path: "Documentation/Plans/POC-LEDGER.md", hint: "Run-Smokes says PASS" },
				Agent,
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("test-suggester: abstained no-history  0.00"));
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
