import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
	CheckAsync,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Post,
	rm,
	SeedHistory,
	Setup,
	Validate,
} from "../Harness.js";

/**
 * @module Test
 *
 * The plan's suite 1: the classification rule table of an EXPLICIT pack, the
 * History family's precedence, and the two silences.
 *
 * @remarks
 *
 * The rule table (one case per family, the priority tie-break, and the evidence
 * total beating the priority), the History family's precedence over the pack,
 * and the two silences (no-signal inside a packed workspace, no-history in a
 * workspace with neither a pack nor a history).
 *
 * The classifier's verdict is read from the ledger line (a note or the
 * low-confidence abstention names the winning family), so the suite asserts the
 * RULE TABLE, not the delivery.
 *
 * THE BUILT-IN PACK IS RETIRED: every rule below belongs to the temporary
 * `.dsh/pack.yml`, never to a literal built-in family.
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
 * The temp pack: three families with their own rule tables and priorities.
 * Doc carries three rules so its evidence total can beat Version's, and
 * Usage shares Doc's evidence so the priority order decides their tie.
 */
const Pack = `families:
  "search/Version":
    id: Version
    priority: 1
    threshold: 0.5
    signals:
      - rule: R1 literal-shape
        pattern: '\\bversion\\b'
        weight: 2.5
    targets:
      - path: package.json
        kind: manifest
        prior: 1.0
        reason: the temp manifest
  "search/Doc":
    id: Doc
    priority: 8
    threshold: 0.5
    signals:
      - rule: R7 heading
        pattern: 'README'
        weight: 2.0
      - rule: R7 heading
        pattern: '##'
        weight: 2.0
      - rule: R7 frontmatter
        pattern: 'title'
        weight: 2.0
    targets:
      - path: README.md
        kind: doc
        prior: 1.0
        reason: the temp readme
  "search/Usage":
    id: Usage
    priority: 9
    threshold: 0.5
    signals:
      - rule: R9 caller
        pattern: 'hook-dsh-'
        weight: 2.0
    targets:
      - path: Source/Library.ts
        kind: symbol
        prior: 1.0
        reason: the temp entry
`;

/**
 * The PACKED workspace: the manifest, the pack, and the three companions.
 */
const Packed = Tree("search-suggester-classification-");
Put(Packed, "package.json", "{}");
Put(Packed, ".dsh/pack.yml", Pack);
const PackedRead = Put(Packed, "README.md");
const PackedSource = Put(Packed, "Source/Library.ts");

/**
 * The BARE workspace: a manifest and nothing else.
 */
const Bare = Tree("search-suggester-classification-bare-");
Put(Bare, "package.json", "{}");
const BareRead = Put(Bare, "README.md");

/**
 * One judged grep whose text is the pattern and whose path is the anchor.
 */
const Grep = (Run: any, Id: string, Pattern: string, Path_: string): Promise<any> =>
	Post(Run, { name: "grep", arguments: { pattern: Pattern, path: Path_ }, agent: AgentOf(Id) });

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// The raised floor: 0.87 and 0.80 abstain, 1.00 emits, so the family that
	// won the classification is readable from the ledger line.
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));

	// Group C1: one case per family of the explicit pack.
	await CheckAsync(Count, "C: the Version family wins its own literal", async () => {
		await Grep(Run, "c1", "version", PackedRead);
		assert.ok(
			Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.87"),
		);
	});
	await CheckAsync(Count, "C: the Doc family wins its own literal", async () => {
		await Grep(Run, "c2", "README", PackedRead);
		assert.ok(
			Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Doc 0.80"),
		);
	});
	await CheckAsync(Count, "C: the Usage family wins its own literal", async () => {
		// The call path must not spell `README`: Detect matches the path too,
		// so a README anchor would hand the Doc family a second rule.
		await Grep(Run, "c3", "hook-dsh-caller", PackedSource);
		assert.ok(
			Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Usage 0.80"),
		);
	});

	// Group C2: the priority tie-break (equal evidence, lower priority wins).
	await CheckAsync(Count, "C: equal evidence is broken by the pack priority", async () => {
		const Before = Run.Lines.filter((Line: string) => Line.includes("Usage")).length;
		await Grep(Run, "c4", "README hook-dsh-", PackedRead);
		assert.ok(
			Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Doc 0.80"),
		);
		assert.equal(Run.Lines.filter((Line: string) => Line.includes("Usage")).length, Before);
	});

	// Group C3: the higher evidence total beats the priority.
	await CheckAsync(Count, "C: the higher evidence total beats the priority", async () => {
		await Grep(Run, "c5", "version README ## title", PackedRead);
		assert.ok(
			Run.Lines.includes("hook-dsh-search-suggester: suggest Doc 1.00 1 candidates"),
		);
	});

	// Group C4: determinism (the same call on two fresh agents).
	await CheckAsync(Count, "C: the same call classifies identically twice", async () => {
		const Before = Run.Lines.filter((Line: string) =>
			Line.includes("low-confidence Version 0.87"),
		).length;
		await Grep(Run, "c6", "version", PackedRead);
		await Grep(Run, "c7", "version", PackedRead);
		const After = Run.Lines.filter((Line: string) =>
			Line.includes("low-confidence Version 0.87"),
		).length;
		assert.equal(After - Before, 2);
	});

	// Group C5: the two silences.
	await CheckAsync(Count, "C: a call the pack does not match abstains no-signal", async () => {
		// The same non-`README` anchor: a README path would match Doc's rule.
		await Grep(Run, "c8", "unrelated query", PackedSource);
		assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-signal  0.00"));
	});
	await CheckAsync(Count, "C: a workspace with no pack and no history abstains no-history", async () => {
		await Grep(Run, "c9", "version", BareRead);
		assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
	});

	// Group C6: the History family is prepended and wins the tie (the default
	// floor, because the synthetic family's own gate is 0.75).
	{
		const Fresh = Setup();
		SeedHistory(Fresh, "c10", PackedRead, ["README.md"]);
		await CheckAsync(Count, "C: the History family outranks the explicit pack", async () => {
			const Out = await Grep(Fresh, "c10", "version", PackedRead);
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			assert.ok(
				Fresh.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 2 candidates"),
			);
		});
	}

	return Finish(Count, "Classification");
};

// Standalone entry: `node Target/Test/Classification/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Classification`);
}
