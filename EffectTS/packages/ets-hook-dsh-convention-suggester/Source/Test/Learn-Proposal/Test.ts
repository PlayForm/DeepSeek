// Source/Test/Learn-Proposal/Test.ts - the D4 bootstrap's DERIVATION and
// FILE: a temporary repo with a doc graph, a package layout and a site
// produces ONE proposal under `<home>/.dsh/playform/proposals/` (never the
// live pack), the proposal parses back through the real @playform/ets-lib-dsh-pack
// (`Parse` -> `Normalize`), its families are exactly the derived rows, and
// every companion it names EXISTS under the repo root. The negative paths are
// the point: learning off writes nothing and notes nothing; a repo with an
// installed pack (families) is never proposed over; a minimal
// `learning: propose: true` pack opts a repo in with the config off, and a
// `learning: propose: false` pack does not veto a true config.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { Normalize, Parse, type Pack } from "../../../../ets-lib-dsh-pack/Target/Library.js";
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

/** The temporary home the learner writes under (the real ~/.dsh is untouched). */
const Home = Tree("convention-learn-home-");
process.env["HOME"] = Home;

/** The proposal path for a repo root. */
const Proposal = (Root: string): string =>
	Path.join(
		Home,
		".dsh/playform/proposals",
		`${Path.basename(Root).toLowerCase()}.yml`,
	);

/** The live user-layer pack path for a repo root. */
const Live = (Root: string): string =>
	Path.join(
		Home,
		".dsh/playform/workspaces",
		`${Path.basename(Root).toLowerCase()}.yml`,
	);

/** The learning note's byte-exact text. */
const NoteText = (Root: string, Families: number): string => {
	const Slug = Path.basename(Root).toLowerCase();
	return [
		`[convention-suggester] learned pack proposal for ${Slug}`,
		`proposal: ${Proposal(Root)}`,
		`families: ${Families}`,
		`install: copy the proposal to ~/.dsh/playform/workspaces/${Slug}.yml`,
	].join("\n");
};

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** A judged write call. */
const Write = (Path_: string, Id: string): any => ({
	name: "write",
	arguments: { file_path: Path_ },
	agent: AgentOf(Id),
});

/** The full fixture: the doc graph, the package layout and the site. */
const Repo = Tree("convention-learn-repo-");
for (const Relative of [
	"Documentation/INDEX.md",
	"Documentation/ARCHIVE-STYLE.md",
	"Documentation/Plans/plan.md",
	"Documentation/Guides/guide.md",
	"Documentation/Skill/skill.md",
	"Documentation/Handoff/handoff.md",
	"Site/Source/Content/content.md",
	"Site/Source/pages/index.astro",
	"Site/Source/Component/Card.astro",
	"Site/Source/Library/Content.ts",
	"package.json",
	"README.md",
	"SCHEME.md",
	"cordis.patch.yml",
	"Source/Library.ts",
	"Source/Function/Apply.ts",
	"Source/Variable/Config.ts",
	"Source/Interface/Config.ts",
	"Source/Test/Suite/Test.ts",
]) {
	Put(Repo, Relative);
}

/** The index-only repo: the signature falls back to Documentation/INDEX.md. */
const Indexed = Tree("convention-learn-index-");
Put(Indexed, "Documentation/INDEX.md");
Put(Indexed, "package.json");

/** The package-only repo: the signature falls back to package.json. */
const Packaged = Tree("convention-learn-package-");
Put(Packaged, "package.json");

/** The learning-off repo: markers, no signature, the default config. */
const Silent = Tree("convention-learn-silent-");
Put(Silent, "Documentation/INDEX.md");
Put(Silent, "package.json");

/** The installed-pack repo: a real pack with families, never proposed over. */
const Installed = Tree("convention-learn-installed-");
Put(
	Installed,
	".dsh/pack.yml",
	`signature:
    - docs/STYLE.md
families:
    "convention/Layout":
        id: Layout
        priority: 1
        threshold: 0.75
        note: ""
        signals:
            - rule: never
              pattern: "NEVER/.*"
              weight: 2.5
        targets:
            - path: docs/STYLE.md
              kind: ""
              prior: 1
              reason: the temp style
`,
);
Put(Installed, "docs/STYLE.md");
Put(Installed, "Documentation/INDEX.md");
Put(Installed, "Source/Function/Apply.ts");

/** The opt-in repo: a minimal pack whose ONLY section is the learning switch. */
const Opted = Tree("convention-learn-opted-");
Put(Opted, ".dsh/pack.yml", "learning:\n    propose: true\n");
Put(Opted, "Documentation/INDEX.md");
Put(Opted, "package.json");

/** The opt-out repo: the pack declines, the config wins. */
const Declined = Tree("convention-learn-declined-");
Put(Declined, ".dsh/pack.yml", "learning:\n    propose: false\n");
Put(Declined, "Documentation/INDEX.md");
Put(Declined, "package.json");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the derivation, the note and the file.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		Run.Context.workingDirectory = Service(Repo);
		await CheckAsync(Count, "L1: the learning note is prepended with the path and the count", async () => {
			const Out = await Post(Run, Write("Source/Function/Apply.ts", "a"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "convention-suggester",
				form: "notice",
				summary: "learned pack 9 families",
			});
			assert.equal(Out.additionalContexts[0].content[0].text, NoteText(Repo, 9));
		});
		await CheckAsync(Count, "L1: the learning ledger line is byte-exact in both forms", async () => {
			const Line = `learned proposal ${Path.basename(Repo).toLowerCase()} 9 families ${Proposal(Repo)}`;
			assert.ok(Run.Lines.includes(`convention-suggester: ${Line}`));
			assert.match(DurableLine("learned proposal"), Durable(Line));
		});
		await CheckAsync(Count, "L1: the proposal exists and the live pack does not", async () => {
			assert.equal(FileSystem.existsSync(Proposal(Repo)), true);
			assert.equal(FileSystem.existsSync(Live(Repo)), false);
			assert.equal(FileSystem.existsSync(Path.join(Repo, ".dsh/pack.yml")), false);
		});
		await CheckAsync(Count, "L1: the proposal parses back through the library", async () => {
			const Text = FileSystem.readFileSync(Proposal(Repo), "utf8");
			const Parsed: Pack = Normalize(Parse(Text) as Pack);
			assert.equal(Parsed.slug, Path.basename(Repo).toLowerCase());
			assert.deepEqual(Parsed.signature, ["Documentation/ARCHIVE-STYLE.md"]);
			assert.deepEqual(Object.keys(Parsed.families ?? {}), [
				"doc/Plan",
				"doc/Guide",
				"doc/Skill",
				"doc/Index",
				"doc/Site",
				"doc/PackageProse",
				"convention/Layout",
				"convention/Naming",
				"convention/Docs",
			]);
			assert.equal(Object.keys(Parsed.families ?? {}).length, 9);
		});
		await CheckAsync(Count, "L1: every proposed companion exists under the repo root", async () => {
			const Text = FileSystem.readFileSync(Proposal(Repo), "utf8");
			const Parsed: Pack = Normalize(Parse(Text) as Pack);
			for (const Family of Object.values(Parsed.families ?? {})) {
				for (const Target of Family.targets) {
					assert.equal(
						FileSystem.existsSync(Path.join(Repo, Target.path)),
						true,
						`absent companion: ${Target.path}`,
					);
					assert.equal(Target.path.includes("*"), false);
					assert.equal(Target.path.includes("<"), false);
				}
			}
		});
	}

	// Group L2: the signature fallback chain.
	{
		rm();
		const IndexRun = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		IndexRun.Context.workingDirectory = Service(Indexed);
		await CheckAsync(Count, "L2: without a style guide the signature falls back to INDEX.md", async () => {
			await Post(IndexRun, Write("Source/Function/Apply.ts", "a"));
			const Parsed: Pack = Normalize(
				Parse(FileSystem.readFileSync(Proposal(Indexed), "utf8")) as Pack,
			);
			assert.deepEqual(Parsed.signature, ["Documentation/INDEX.md"]);
		});
		const PackageRun = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		PackageRun.Context.workingDirectory = Service(Packaged);
		await CheckAsync(Count, "L2: without a doc graph the signature falls back to package.json", async () => {
			await Post(PackageRun, Write("Source/Function/Apply.ts", "b"));
			const Parsed: Pack = Normalize(
				Parse(FileSystem.readFileSync(Proposal(Packaged), "utf8")) as Pack,
			);
			assert.deepEqual(Parsed.signature, ["package.json"]);
			assert.deepEqual(Object.keys(Parsed.families ?? {}), ["convention/Docs"]);
		});
	}

	// Group L3: learning off - no scan, no file, no note.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Run.Context.workingDirectory = Service(Silent);
		await CheckAsync(Count, "L3: learning off writes no proposal and emits no note", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Write("Source/Function/Apply.ts", "a"), Decision);
			assert.equal(Out, Decision);
			assert.equal(FileSystem.existsSync(Proposal(Silent)), false);
			assert.ok(
				Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"),
			);
			assert.equal(
				Run.Lines.filter((Line: string) => Line.includes("learned proposal")).length,
				0,
			);
		});
	}

	// Group L4: a repo that already has a pack is never proposed over.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		Run.Context.workingDirectory = Service(Installed);
		await CheckAsync(Count, "L4: an installed pack (families) produces no proposal and no note", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Write("Documentation/INDEX.md", "a"), Decision);
			assert.equal(Out, Decision);
			assert.equal(FileSystem.existsSync(Proposal(Installed)), false);
			assert.deepEqual(Run.Lines, [
				"convention-suggester: activated (bundle 0.1.0, intents 4, threshold 0.75)",
			]);
		});
	}

	// Group L5: the pack's learning section is the per-repo opt-in.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Run.Context.workingDirectory = Service(Opted);
		await CheckAsync(Count, "L5: a learning-only pack opts in with the config off", async () => {
			const Out = await Post(Run, Write("Source/Function/Apply.ts", "a"));
			assert.equal(
				Out.additionalContexts[0].source.summary,
				"learned pack 1 families",
			);
			assert.equal(Out.additionalContexts[0].content[0].text, NoteText(Opted, 1));
			assert.equal(FileSystem.existsSync(Proposal(Opted)), true);
		});
	}

	// Group L6: a true config wins over a pack that declines.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		Run.Context.workingDirectory = Service(Declined);
		await CheckAsync(Count, "L6: the config wins over a pack that sets propose false", async () => {
			await Post(Run, Write("Source/Function/Apply.ts", "a"));
			assert.equal(FileSystem.existsSync(Proposal(Declined)), true);
		});
	}

	return Finish(Count, "Learn-Proposal");
};

// Standalone entry: `node Target/Test/Learn-Proposal/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Learn-Proposal`);
}
