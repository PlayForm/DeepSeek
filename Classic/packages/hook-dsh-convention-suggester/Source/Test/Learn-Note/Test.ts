// Source/Test/Learn-Note/Test.ts - the RETIRED learning note, at the Apply
// level. The literal learner no longer notes or writes anything: a non-judged
// call stays silent, and the first judged call in a packless workspace with
// `learning: true` abstains `no-history` without a proposal file.
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
const Home = Tree("convention-learn-note-home-");
process.env["HOME"] = Home;

/** The proposal path for a repo root. */
const Proposal = (Root: string): string =>
	Path.join(
		Home,
		".dsh/playform/proposals",
		`${Path.basename(Root).toLowerCase()}.yml`,
	);

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** One packless repo with a doc index, a package layout and its prose. */
const Repo = Tree("convention-learn-note-repo-");
FileSystem.mkdirSync(Path.join(Repo, ".git"), { recursive: true });
for (const Relative of [
	"Documentation/INDEX.md",
	"package.json",
	"README.md",
	"SCHEME.md",
	"Source/Library.ts",
	"Source/Function/Apply.ts",
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

	await CheckAsync(Count, "N1: a non-judged call writes nothing and notes nothing", async () => {
		const Decision = { kind: "allow", additionalContexts: [] };
		const Out = await Post(
			Run,
			{ name: "bash", arguments: { command: "ls" }, agent: AgentOf("a") },
			Decision,
		);
		assert.equal(Out, Decision);
		assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
		assert.deepEqual(Run.Lines, [
			`convention-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`,
		]);
	});
	await CheckAsync(Count, "N2: the first judged call abstains no-history and writes no proposal", async () => {
		const Decision = { kind: "allow", additionalContexts: [] };
		const Out = await Post(Run, Call("a"), Decision);
		assert.equal(Out, Decision);
		assert.deepEqual(Out.additionalContexts, []);
		assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
		assert.ok(Run.Lines.includes("convention-suggester: abstained no-history  0.00"));
		assert.match(
			DurableLine("abstained no-history"),
			Durable("abstained no-history  0.00"),
		);
		assert.equal(Run.Lines.filter((Line: string) => Line.includes("learned proposal")).length, 0);
	});

	return Finish(Count, "Learn-Note");
};

// Standalone entry: `node Target/Test/Learn-Note/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Learn-Note`);
}
