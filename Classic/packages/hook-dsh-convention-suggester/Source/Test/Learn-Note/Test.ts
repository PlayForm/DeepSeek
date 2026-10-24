// Source/Test/Learn-Note/Test.ts - the D4 bootstrap's NOTE gate: ONE note per
// workspace per PROCESS, on the first JUDGED call. A non-judged call never
// scans and never notes; the first judged call in a packless workspace writes
// the proposal, appends the ledger line and prepends the note; a SECOND mount
// of the hook in the same process does not re-note and does not recreate a
// deleted proposal (the reservation is module-level, keyed by root); a
// DIFFERENT workspace gets its own note; and learning off stays silent.
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

/** The temporary home the learner writes under (the real ~/.dsh is untouched). */
const Home = Tree("convention-learn-note-home-");
process.env["HOME"] = Home;

/** The proposal path for a repo root. */
const Proposal = (Root: string): string =>
	Path.join(
		Home,
		".dsh/playform/proposals",
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

/** One packless repo with a doc index, a package layout and its prose. */
const MakeRepo = (Prefix: string): string => {
	const Root = Tree(Prefix);
	for (const Relative of [
		"Documentation/INDEX.md",
		"package.json",
		"README.md",
		"SCHEME.md",
		"Source/Library.ts",
		"Source/Function/Apply.ts",
	]) {
		Put(Root, Relative);
	}
	return Root;
};

/** The first workspace and a second one (the per-root key). */
const Repo = MakeRepo("convention-learn-note-repo-");
const Other = MakeRepo("convention-learn-note-other-");

/** The learning-off repo: markers, no signature, the default config. */
const Silent = Tree("convention-learn-note-silent-");
Put(Silent, "Documentation/INDEX.md");
Put(Silent, "package.json");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group N1: a non-judged call never scans, writes or notes.
	{
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
				"convention-suggester: activated (bundle 0.1.0, intents 4, threshold 0.75)",
			]);
		});
	}

	// Group N2: the first judged call is the one that proposes.
	{
		const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		Run.Context.workingDirectory = Service(Repo);
		await CheckAsync(Count, "N2: the first judged call emits the note", async () => {
			const Out = await Post(Run, Write("Source/Function/Apply.ts", "a"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "convention-suggester",
				form: "notice",
				summary: "learned pack 4 families",
			});
			assert.equal(Out.additionalContexts[0].content[0].text, NoteText(Repo, 4));
		});
		await CheckAsync(Count, "N2: the ledger line is byte-exact in both forms", async () => {
			const Line = `learned proposal ${Path.basename(Repo).toLowerCase()} 4 families ${Proposal(Repo)}`;
			assert.ok(Run.Lines.includes(`convention-suggester: ${Line}`));
			assert.match(DurableLine("learned proposal"), Durable(Line));
		});
		await CheckAsync(Count, "N2: the proposal file exists", async () => {
			assert.equal(FileSystem.existsSync(Proposal(Repo)), true);
		});
	}

	// Group N3: a second mount in the same process does not re-note.
	{
		FileSystem.rmSync(Proposal(Repo));
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		Run.Context.workingDirectory = Service(Repo);
		await CheckAsync(Count, "N3: a second mount of the same root neither notes nor recreates the file", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Write("Source/Function/Apply.ts", "b"), Decision);
			assert.equal(Out, Decision);
			assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
			assert.ok(
				Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"),
			);
			assert.equal(
				Run.Lines.filter((Line: string) => Line.includes("learned proposal")).length,
				0,
			);
		});
	}

	// Group N4: the reservation is keyed by root, not global.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		Run.Context.workingDirectory = Service(Other);
		await CheckAsync(Count, "N4: a different workspace gets its own proposal and note", async () => {
			const Out = await Post(Run, Write("Source/Function/Apply.ts", "c"));
			assert.equal(Out.additionalContexts[0].source.summary, "learned pack 4 families");
			assert.equal(Out.additionalContexts[0].content[0].text, NoteText(Other, 4));
			assert.equal(FileSystem.existsSync(Proposal(Other)), true);
		});
	}

	// Group N5: learning off stays silent.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Run.Context.workingDirectory = Service(Silent);
		await CheckAsync(Count, "N5: learning off emits no note and writes no file", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Write("Source/Function/Apply.ts", "d"), Decision);
			assert.equal(Out, Decision);
			assert.equal(FileSystem.existsSync(Proposal(Silent)), false);
			assert.ok(
				Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"),
			);
		});
	}

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
