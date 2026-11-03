// Source/Test/Learn-Proposal/Test.ts - the RETIRED proposal derivation, at
// the Apply level. The literal learner no longer derives or writes a pack: a
// repo with the full doc graph, the package layout and the site produces no
// proposal, no live pack and no repo pack, and the judged call abstains
// `no-history`.
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

/** The temporary home the retired learner would have written under. */
const Home = Tree("convention-learn-home-");
process.env["HOME"] = Home;

/** The proposal and the live user-layer pack for a repo root. */
const Proposal = (Root: string): string =>
	Path.join(
		Home,
		".dsh/playform/proposals",
		`${Path.basename(Root).toLowerCase()}.yml`,
	);
const Live = (Root: string): string =>
	Path.join(
		Home,
		".dsh/playform/workspaces",
		`${Path.basename(Root).toLowerCase()}.yml`,
	);

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** The full fixture: the doc graph, the package layout and the site. */
const Repo = Tree("convention-learn-repo-");
FileSystem.mkdirSync(Path.join(Repo, ".git"), { recursive: true });
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

/** The judged call: a write of the fixture's entry. */
const Call = (Id: string): any => ({
	name: "write",
	arguments: { file_path: Path.join(Repo, "Source/Function/Apply.ts") },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
	Run.Context.workingDirectory = Service(Repo);

	await CheckAsync(Count, "L1: the retired learner writes no proposal, no live pack and no repo pack", async () => {
		const Decision = { kind: "allow", additionalContexts: [] };
		const Out = await Post(Run, Call("a"), Decision);
		assert.equal(Out, Decision);
		assert.deepEqual(Out.additionalContexts, []);
		assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
		assert.equal(FileSystem.existsSync(Live(Repo)), false);
		assert.equal(FileSystem.existsSync(Path.join(Repo, ".dsh/pack.yml")), false);
	});
	await CheckAsync(Count, "L2: the call abstains no-history and never notes a learned pack", async () => {
		assert.ok(Run.Lines.includes("convention-suggester: abstained no-history  0.00"));
		assert.match(
			DurableLine("abstained no-history"),
			Durable("abstained no-history  0.00"),
		);
		assert.equal(Run.Lines.filter((Line: string) => Line.includes("learned proposal")).length, 0);
		assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
	});

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
