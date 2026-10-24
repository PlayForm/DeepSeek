// Source/Test/Abstention/Test.ts - the plan's suite 4: the abstention path.
// The five reasons the plugin can give (no-signal, low-confidence,
// no-companions, ambiguous-target, foreign-workspace), each with its
// byte-exact ledger line, the downstream decision returned UNCHANGED, the
// durable `[ISO]` form, and the standing rule that an abstention is silence:
// no note, ever.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
	CheckAsync,
	Durable,
	DurableLine,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Post,
	rm,
	Setup,
	Validate,
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

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** A dedicated parent for the fixture trees (the sibling glob's base). */
const Parent = Tree("search-suggester-abstention-");
const Branch = (Name: string): string => {
	const Full = Path.join(Parent, Name);
	FileSystem.mkdirSync(Full, { recursive: true });
	return Full;
};

/** The EMPTY workspace: the built-in signature only, none of the Owner set. */
const Empty = Branch("empty");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");
const EmptyManifest = Put(Empty, "package.json");

/** The FOREIGN workspace: a manifest, no signature. */
const Foreign = Branch("foreign");
const ForeignManifest = Put(Foreign, "package.json");

/** The PACKED workspace: its own pack and one target, which the config excludes. */
const Packed = Branch("packed");
Put(
	Packed,
	".dsh/pack.yml",
	`signature:
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
`,
);
Put(Packed, "docs/STYLE.md");
const PackedManifest = Put(Packed, "VERSIONS.md");

/** The silence call: a judged grep with no matching intent. */
const Unrelated = (Id: string): any => ({
	name: "grep",
	arguments: { pattern: "unrelated query", path: "" },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group A1: no-signal.
	{
		const Run = Setup();
		await CheckAsync(Count, "A1: an unrelated call abstains no-signal", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Unrelated("a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-signal  0.00"));
			assert.match(
				DurableLine("abstained no-signal"),
				Durable("abstained no-signal  0.00"),
			);
		});
	}

	// Group A2: low-confidence.
	{
		const Run = Setup();
		await CheckAsync(Count, "A2: a weak call abstains low-confidence", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(
				Run,
				{ name: "grep", arguments: { pattern: "1.2.3", path: "package.json" }, agent: AgentOf("a") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.84"));
			assert.match(
				DurableLine("abstained low-confidence"),
				Durable("abstained low-confidence Version 0.84"),
			);
		});
	}

	// Group A3: no-companions (the empty workspace).
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "A3: an emptied intent abstains no-companions", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(
				Run,
				{
					name: "grep",
					arguments: { pattern: "CONTRIBUTING", path: EmptyManifest },
					agent: AgentOf("a"),
				},
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions Owner 0.66"));
			assert.match(
				DurableLine("abstained no-companions"),
				Durable("abstained no-companions Owner 0.66"),
			);
		});
	}

	// Group A4: ambiguous-target (every candidate excluded).
	{
		rm();
		const Run = Make(
			Validate({ logFile: Ledger, enabled: true, exclude: ["VERSIONS.md"] }),
		);
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "A4: an excluded candidate set abstains ambiguous-target", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(
				Run,
				{ name: "grep", arguments: { pattern: "version", path: PackedManifest }, agent: AgentOf("a") },
				Decision,
			);
			assert.equal(Out, Decision);
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: abstained ambiguous-target Version 0.87"),
			);
			assert.match(
				DurableLine("abstained ambiguous-target"),
				Durable("abstained ambiguous-target Version 0.87"),
			);
		});
	}

	// Group A5: foreign-workspace.
	{
		const Run = Setup();
		await CheckAsync(Count, "A5: a foreign workspace abstains foreign-workspace", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(
				Run,
				{
					name: "grep",
					arguments: { pattern: "1.2.3 version", path: ForeignManifest },
					agent: AgentOf("a"),
				},
				Decision,
			);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"),
			);
			assert.match(
				DurableLine("abstained foreign-workspace"),
				Durable("abstained foreign-workspace  0.00"),
			);
		});
	}

	// Group A6: the standing rule - an abstention never emits.
	{
		const Run = Setup();
		await CheckAsync(Count, "A6: the abstention scenarios never emit a note", async () => {
			await Post(Run, Unrelated("a"));
			await Post(Run, {
				name: "grep",
				arguments: { pattern: "1.2.3", path: "package.json" },
				agent: AgentOf("b"),
			});
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
			assert.equal(Run.Warns.length, 0);
		});
	}

	return Finish(Count, "Abstention");
};

// Standalone entry: `node Target/Test/Abstention/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Abstention`);
}
