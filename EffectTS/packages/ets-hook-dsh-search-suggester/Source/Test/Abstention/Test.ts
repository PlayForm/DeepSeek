// Source/Test/Abstention/Test.ts - the plan's suite 4: the abstention path.
// The six reasons the plugin can give (no-signal, low-confidence,
// no-companions, ambiguous-target, foreign-workspace, no-history), each with
// its byte-exact ledger line, the downstream decision returned UNCHANGED, the
// durable `[ISO]` form, and the standing rule that an abstention is silence:
// no note, ever.
//
// THE SOURCE SPLIT: the four classifier reasons are driven by an EXPLICIT
// `.dsh/pack.yml` (the pack is an override only), while `foreign-workspace`
// and `no-history` are the two reasons a workspace with no explicit pack and
// no session history gives.
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

/** A dedicated parent for the fixture trees. */
const Parent = Tree("search-suggester-abstention-");
const Branch = (Name: string): string => {
	const Full = Path.join(Parent, Name);
	FileSystem.mkdirSync(Full, { recursive: true });
	return Full;
};

/** The temp pack: one search/Version family whose gate is the raised 0.9. */
const Pack = `families:
  "search/Version":
    id: Version
    priority: 1
    threshold: 0.9
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

/** The PACKED workspace: the manifest, the pack and its companion. */
const Packed = Branch("packed");
Put(Packed, "package.json", "{}");
Put(Packed, ".dsh/pack.yml", Pack);
const PackedRead = Put(Packed, "README.md");
Put(Packed, "VERSIONS.md");

/** The EMPTY workspace: the pack whose companion does not exist. */
const Empty = Branch("empty");
Put(Empty, "package.json", "{}");
Put(Empty, ".dsh/pack.yml", Pack);
const EmptyRead = Put(Empty, "README.md");

/** The BARE rooted workspace: a manifest, no pack, no history. */
const Bare = Branch("bare");
Put(Bare, "package.json", "{}");
const BareRead = Put(Bare, "README.md");

/** The FOREIGN workspace: no manifest, no cwd. */
const Foreign = Branch("foreign");
const ForeignRead = Put(Foreign, "README.md");

/** One judged grep. */
const Grep = (Pattern: string, Path_: string, Id: string): any => ({
	name: "grep",
	arguments: { pattern: Pattern, path: Path_ },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group A1: no-signal (the pack matched nothing).
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "A1: an unrelated call abstains no-signal", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Grep("unrelated query", PackedRead, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-signal  0.00"));
			assert.match(
				DurableLine("abstained no-signal"),
				Durable("abstained no-signal  0.00"),
			);
		});
	}

	// Group A2: low-confidence (the pack's own 0.9 gate holds 0.87).
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "A2: a weak match abstains low-confidence", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Grep("version", PackedRead, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.87"));
			assert.match(
				DurableLine("abstained low-confidence"),
				Durable("abstained low-confidence Version 0.87"),
			);
		});
	}

	// Group A3: no-companions (the pack's companion is absent).
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Empty);
		await CheckAsync(Count, "A3: an emptied family abstains no-companions", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Grep("version", EmptyRead, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions Version 0.87"));
			assert.match(
				DurableLine("abstained no-companions"),
				Durable("abstained no-companions Version 0.87"),
			);
		});
	}

	// Group A4: ambiguous-target (every candidate excluded by the config).
	{
		rm();
		const Run = Make(
			Validate({ logFile: Ledger, enabled: true, exclude: ["VERSIONS.md"] }),
		);
		Run.Context.workingDirectory = Service(Packed);
		await CheckAsync(Count, "A4: an excluded candidate set abstains ambiguous-target", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Grep("version", PackedRead, "a"), Decision);
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

	// Group A5: foreign-workspace (no root marker, no session cwd).
	{
		const Run = Setup();
		await CheckAsync(Count, "A5: a foreign workspace abstains foreign-workspace", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, Grep("version", ForeignRead, "a"), Decision);
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

	// Group A6: no-history (a rooted workspace with no pack and no history).
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "A6: a rooted workspace with no history abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Grep("version", BareRead, "a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
			assert.match(
				DurableLine("abstained no-history"),
				Durable("abstained no-history  0.00"),
			);
		});
	}

	// Group A7: the standing rule - an abstention never emits.
	{
		const Run = Setup();
		await CheckAsync(Count, "A7: the abstention scenarios never emit a note", async () => {
			await Post(Run, Grep("unrelated query", ForeignRead, "a"));
			await Post(Run, Grep("version", BareRead, "b"));
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
