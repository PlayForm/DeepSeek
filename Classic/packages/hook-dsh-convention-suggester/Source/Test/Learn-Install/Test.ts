// Source/Test/Learn-Install/Test.ts - THE MONEY SHOT: the learner proposes a
// pack for a temporary repo, the proposal is COPIED into the user layer
// (`<home>/.dsh/playform/workspaces/<slug>.yml`), and the REAL built
// doc-suggester in that repo now emits a note naming the PROPOSAL's
// companions - an end-to-end pass across the convention-suggester's learner,
// @playform/lib-dsh-pack (the resolution + the YAML parser) and the
// doc-suggester's listener, all real built Targets.
//
// The repo deliberately carries the site folders the DERIVED `doc/Site`
// family names (`Site/Source/Component`, `Site/Source/Library`, ...) and NOT
// the built-in pack's `Site/Source/Library/Content.ts`: the note naming
// `Site/Source/Component` therefore proves the installed proposal is the pack
// in force, not the built-in fallback.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import DocPlugin from "../../../../hook-dsh-doc-suggester/Target/Library.js";
import {
	AgentOf,
	CheckAsync,
	Finish,
	Furnace,
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

/** The temporary home both plugins resolve their user layer under. */
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

/** The fixture: the doc index, the site, the package layout - no style guide. */
const Repo = Tree("convention-learn-install-repo-");
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

/** The doc suggester's own ledger (a temp file, never the real ~/.dsh). */
const DocLedger = Path.join(Home, "doc-suggester.log");

/**
 * Mount the REAL built doc-suggester against a fake ctx in the family's
 * shape (the factory service, the captured listeners, the optional
 * `workingDirectory` service, a recording fs the plugin must never touch).
 */
const MountDoc = (Cwd: string): any => {
	const Lines: string[] = [];
	const Warns: string[] = [];
	const Listeners: any = {};
	let Context: any;
	Context = {
		pluginFactory: Furnace,
		workingDirectory: { get: () => Cwd },
		fs: {
			readText: async () => {
				throw new Error("readText must never be called");
			},
			writeText: async () => {
				throw new Error("writeText must never be called");
			},
		},
		logger: {
			info: (Message: string) => {
				Lines.push(Message);
			},
			warn: (Message: string) => {
				Warns.push(Message);
			},
		},
		on: (Name: string, Listener: unknown) => {
			Listeners[Name] = Listener;
			return () => true;
		},
		get: (Name: string) => Context[Name],
		effect: (Setup: () => unknown) => {
			Setup();
			return () => true;
		},
		root: { on: () => () => true },
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Context[Name] = Value;
				return () => true;
			},
		},
	};
	const Raw = (DocPlugin.Config as unknown as (Input: Record<string, unknown>) => any)({
		logFile: DocLedger,
		enabled: true,
	});
	(DocPlugin.apply as any)(Context, Raw);
	return { Context, Lines, Warns, Listeners, State: Context.__hookDshDocSuggesterState };
};

/** The doc ledger's durable lines (the `[ISO] message` forms). */
const DocLines = (): string[] =>
	(() => {
		try {
			return FileSystem.readFileSync(DocLedger, "utf8").split("\n").filter(Boolean);
		} catch {
			return [];
		}
	})();

/** The doc note's byte-exact text (the derived `doc/Site` family). */
const DocText = [
	"[doc-suggester] family=Site confidence=0.87",
	"companions (5):",
	"- Documentation - the source of truth",
	"- Site/Source/Content - the site content",
	"- Site/Source/pages - the site pages",
	"- Site/Source/Component - the components",
	"- Site/Source/Library - the site library",
	"note: a documentation task rarely touches one file; keep the doc graph coherent.",
].join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Phase 1: the learner proposes the pack.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
		Run.Context.workingDirectory = Service(Repo);
		await CheckAsync(Count, "I1: the learner writes the proposal and notes it", async () => {
			const Out = await Post(Run, {
				name: "write",
				arguments: { file_path: "Source/Function/Apply.ts" },
				agent: AgentOf("a"),
			});
			assert.equal(Out.additionalContexts[0].source.summary, "learned pack 6 families");
			assert.equal(FileSystem.existsSync(Proposal(Repo)), true);
			assert.equal(FileSystem.existsSync(Live(Repo)), false);
		});
	}

	// Phase 2: the user installs the proposal (the one manual step).
	FileSystem.mkdirSync(Path.dirname(Live(Repo)), { recursive: true });
	FileSystem.copyFileSync(Proposal(Repo), Live(Repo));

	// Phase 3: the doc suggester in the same repo now reads the installed pack.
	{
		const Doc = MountDoc(Repo);
		await CheckAsync(Count, "I2: the installed proposal is byte-identical to the file the learner wrote", async () => {
			assert.equal(
				FileSystem.readFileSync(Live(Repo), "utf8"),
				FileSystem.readFileSync(Proposal(Repo), "utf8"),
			);
		});
		await CheckAsync(Count, "I3: the doc suggester emits the note naming the proposal's companions", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Doc.Listeners["tools/post-execute"](
				{
					name: "read",
					arguments: { file_path: "Site/Source/pages/index.astro" },
					agent: AgentOf("doc"),
				},
				{},
				() => Promise.resolve(Decision),
			);
			assert.equal(Out.additionalContexts.length, 1);
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "doc-suggester",
				form: "notice",
				summary: "Site 0.87",
			});
			assert.equal(Out.additionalContexts[0].content[0].text, DocText);
			assert.equal(Out.additionalContexts[0].content[0].text.includes("Component"), true);
			assert.equal(
				Out.additionalContexts[0].content[0].text.includes(
					"Site/Source/Library/Content.ts",
				),
				false,
			);
		});
		await CheckAsync(Count, "I3: the doc ledger line counts the derived companions", async () => {
			assert.ok(
				Doc.Lines.includes(
					"hook-dsh-doc-suggester: suggest Site 0.87 5 companions Site/Source/pages/index.astro",
				),
			);
			assert.equal(
				DocLines().filter((Line) =>
					Line.includes(
						"suggest Site 0.87 5 companions Site/Source/pages/index.astro",
					),
				).length,
				1,
			);
			assert.deepEqual(Doc.Warns, []);
		});
	}

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
