// Source/Test/Learn-Install/Test.ts - the RETIRED learner, at the Apply
// level. The literal pack learner is no longer called (the history-driven
// proposal is the next step), so this suite keeps only the consequence: a
// judged call in a packless workspace with `learning: true` abstains
// `no-history` and writes neither a proposal nor a live pack.
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
const Home = Tree("convention-learn-install-home-");
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

/** The fixture: the doc index, the site and the package layout, no style guide. */
const Repo = Tree("convention-learn-install-repo-");
FileSystem.mkdirSync(Path.join(Repo, ".git"), { recursive: true });
for (const Relative of [
	"Documentation/INDEX.md",
	"Documentation/Handoff/handoff.md",
	"Site/Source/Content/content.md",
	"Site/Source/pages/index.astro",
	"Site/Source/Component/Card.astro",
	"Site/Source/Library/Layout.ts",
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

	await CheckAsync(Count, "I1: the retired learner writes no proposal and no live pack", async () => {
		const Decision = { kind: "allow", additionalContexts: [] };
		const Out = await Post(Run, Call("a"), Decision);
		assert.equal(Out, Decision);
		assert.deepEqual(Out.additionalContexts, []);
		assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
		assert.equal(FileSystem.existsSync(Live(Repo)), false);
		assert.equal(FileSystem.existsSync(Path.join(Repo, ".dsh/pack.yml")), false);
	});
	await CheckAsync(Count, "I2: the call abstains no-history instead of noting a learned pack", async () => {
		assert.ok(Run.Lines.includes("convention-suggester: abstained no-history  0.00"));
		assert.match(
			DurableLine("abstained no-history"),
			Durable("abstained no-history  0.00"),
		);
		assert.equal(Run.Lines.filter((Line: string) => Line.includes("learned proposal")).length, 0);
		assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
	});

	return Finish(Count, "Learn-Install");
};

// Standalone entry: `node Target/Test/Learn-Install/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Learn-Install`);
}
