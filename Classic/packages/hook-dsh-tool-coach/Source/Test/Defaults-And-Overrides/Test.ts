import assert from "node:assert/strict";
import { StaticCatalog } from "../../../Target/Function/Fetch.js";
import Override from "../../../Target/Function/Override.js";
import {
	CATALOG,
	CLASS_LEADS,
	Check,
	CheckAsync,
	DefaultOf,
	Detect,
	DEFAULT_EXEMPTS,
	DEFAULT_PATTERNS,
	Finish,
	Make,
	MakeCounter,
	ParamsOf,
	Post,
	PrimaryOf,
	rm,
	Validate,
	Agent,
	Ledger,
} from "../Harness.js";

/**
 * @module Test
 *
 * Runs one singular test: the harness-defaults projection and the user-override layer.
 *
 * @remarks
 *
 * The coach's note used to name ONE parameter - whatever the schema declared
 * first - so a `head -40` offense was answered with `read` + `file_path`, the
 * one call shape that cannot express a line range. These checks pin the fix:
 * the note now carries the harness's WHOLE parameter surface with each declared
 * default, and the generated static table carries the same projection.
 *
 * They also pin the precedence of the three description layers - the user's
 * `toolDescriptions` cell over the live registry over the generated table - and
 * the two detection corrections the same session exposed: `cd X && cmd` is no
 * longer an offense, and `nohup` now names `bash` (with its run_in_background
 * parameter) instead of a tool that does not exist.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: the default extraction - the harness's two carriers.
	{
		Check(Count, "DefaultOf: reads the 'Defaults to X.' sentence", () => {
			assert.equal(
				DefaultOf({ description: "1-based first line to return. Defaults to 1." }),
				"1",
			);
			assert.equal(
				DefaultOf({ description: "Maximum number of lines to return. Defaults to 2000." }),
				"2000",
			);
		});
		Check(Count, "DefaultOf: stops at the clause boundary (semicolon, full stop)", () => {
			assert.equal(
				DefaultOf({
					description:
						"Replace all matches. Defaults to false; when false, old_string must appear exactly once.",
				}),
				"false",
			);
			assert.equal(
				DefaultOf({
					description:
						"Directory to search in. Defaults to the session workspace; a relative path resolves against it.",
				}),
				"the session workspace",
			);
		});
		Check(Count, "DefaultOf: the `default` annotation wins over the sentence", () => {
			assert.equal(
				DefaultOf({ description: "Whatever. Defaults to 9.", default: "7" }),
				"7",
			);
		});
		Check(Count, "DefaultOf: a continuation clause states no default", () => {
			assert.equal(
				DefaultOf({
					description:
						"Max wait in milliseconds with wait: true. Defaults to and is capped by configuration.",
				}),
				undefined,
			);
			assert.equal(DefaultOf({ description: "No clause here." }), undefined);
		});
	}

	// Group: the parameter projection - order, requiredness, primary key.
	{
		const Params = ParamsOf({
			properties: {
				file_path: { description: "Path to read." },
				offset: { description: "1-based first line to return. Defaults to 1." },
				limit: { description: "Maximum number of lines to return. Defaults to 2000." },
			},
			required: ["file_path"],
		});
		Check(Count, "ParamsOf: keeps the schema's declaration order and requiredness", () => {
			assert.equal(
				JSON.stringify(Params),
				JSON.stringify([
					{ name: "file_path", required: true },
					{ name: "offset", required: false, default: "1" },
					{ name: "limit", required: false, default: "2000" },
				]),
			);
		});
		Check(Count, "PrimaryOf: the first REQUIRED key, not the first declared", () => {
			assert.equal(PrimaryOf(Params), "file_path");
			assert.equal(
				PrimaryOf([
					{ name: "zebra", required: false },
					{ name: "alpha", required: true },
				]),
				"alpha",
			);
			assert.equal(PrimaryOf([]), "");
		});
		Check(Count, "ParamsOf: a parameters object with no properties projects to no params", () => {
			assert.equal(JSON.stringify(ParamsOf(undefined)), "[]");
			assert.equal(JSON.stringify(ParamsOf({})), "[]");
		});
	}

	// Group: the generated static table carries the SAME projection as the live
	// registry (the fallback is no longer a hand-maintained approximation).
	{
		const Static = StaticCatalog();
		const Read = Static.tools.get("read");
		Check(Count, "StaticCatalog: the generated table projects read's defaults", () => {
			assert.equal(Read?.param, "file_path");
			assert.equal(
				JSON.stringify(Read?.params.find((Param: any) => Param.name === "offset")),
				JSON.stringify({ name: "offset", required: false, default: "1" }),
			);
			assert.equal(
				Read?.params.find((Param: any) => Param.name === "limit")?.default,
				"2000",
			);
		});
		Check(Count, "StaticCatalog: the generated table is the harness catalog, not a copy", () => {
			assert.ok(Object.keys(CATALOG).length >= 60);
			assert.equal(Read?.description, CATALOG["read"]?.description);
			assert.equal(Static.tools.get("working_directory")?.params[0]?.required, false);
		});
		Check(Count, "StaticCatalog: a parameter-named tool no longer exists in the table", () => {
			assert.equal(Static.tools.has("run_in_background"), false);
			assert.equal(Static.tools.get("bash")?.params.some((Param: any) => Param.name === "run_in_background"), true);
		});
	}

	// Group: the composed note - the live path names the whole surface.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger }));
		const Who = Agent("agent-defaults");
		await Post(Run, "cat a.md", Who);
		await Post(Run, "cat a.md", Who);
		const Out = await Post(Run, "cat a.md", Who);
		const Text: string = Out.additionalContexts[0].content[0].text;
		await CheckAsync(Count, "note: names every parameter with its declared default", async () => {
			assert.ok(
				Text.includes(
					"Parameters: file_path (required), offset (default 1), limit (default 2000).",
				),
			);
		});
		await CheckAsync(Count, "note: renders the call shape the model should make", async () => {
			assert.ok(Text.includes("- Call shape: read { file_path, offset?, limit? }."));
		});
		await CheckAsync(Count, "note: the discovery class names the optional parameter as optional", async () => {
			rm();
			const DiscoveryRun = Make(Validate({ logFile: Ledger, threshold: 1 }));
			const Discovery = await Post(DiscoveryRun, "pwd", Agent("agent-defaults-discovery"));
			assert.ok(
				Discovery.additionalContexts[0].content[0].text.includes(
					"working_directory: Read the current working directory, or change it with cd. Parameters: cd (optional).",
				),
			);
		});
	}

	// Group: maxNoteParams caps the named surface and reports the remainder.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, maxNoteParams: 1 }));
		const Who = Agent("agent-cap");
		await Post(Run, "cat a.md", Who);
		await Post(Run, "cat a.md", Who);
		const Out = await Post(Run, "cat a.md", Who);
		await CheckAsync(Count, "note: maxNoteParams truncates and reports the remainder", async () => {
			const Text: string = Out.additionalContexts[0].content[0].text;
			assert.ok(Text.includes("Parameters: file_path (required), +2 more."));
			assert.ok(Text.includes("- Call shape: read { file_path, offset?, limit? }."));
		});
	}

	// Group: the user-override layer - per FIELD, over live and static alike.
	{
		const Base = StaticCatalog();
		Check(Count, "Override: an empty override map returns the catalog unchanged", () => {
			assert.equal(Override(Base, {}), Base);
		});
		Check(Count, "Override: a description-only override keeps the harness parameters", () => {
			const Catalog = Override(Base, { read: { description: "Read a text file, page by page." } });
			const Read = Catalog.tools.get("read");
			assert.equal(Read?.description, "Read a text file, page by page.");
			assert.equal(Read?.params.find((Param: any) => Param.name === "offset")?.default, "1");
		});
		Check(Count, "Override: a params-only override keeps the harness description", () => {
			const Catalog = Override(Base, {
				read: {
					params: [
						{ name: "file_path", required: true },
						{ name: "offset", required: false, default: "1" },
					],
				},
			});
			const Read = Catalog.tools.get("read");
			assert.equal(Read?.description, Base.tools.get("read")?.description);
			assert.equal(JSON.stringify(Read?.params.map((Param: any) => Param.name)), '["file_path","offset"]');
			assert.equal(Read?.param, "file_path");
		});
		Check(Count, "Override: an override may name a tool the catalog does not carry", () => {
			const Catalog = Override(Base, {
				mcp__house__search: {
					description: "Search the house index.",
					params: [{ name: "query", required: true }],
				},
			});
			const Tool = Catalog.tools.get("mcp__house__search");
			assert.equal(Tool?.description, "Search the house index.");
			assert.equal(Tool?.param, "query");
		});
		rm();
		const Run = Make(
			Validate({
				logFile: Ledger,
				toolDescriptions: { read: { description: "Read a text file, page by page." } },
			}),
		);
		const Who = Agent("agent-override");
		await Post(Run, "cat a.md", Who);
		await Post(Run, "cat a.md", Who);
		const Out = await Post(Run, "cat a.md", Who);
		await CheckAsync(Count, "Override: the user's words reach the composed note", async () => {
			const Text: string = Out.additionalContexts[0].content[0].text;
			assert.ok(
				Text.includes("- read: Read a text file, page by page. Parameters: file_path (required), offset (default 1), limit (default 2000)."),
			);
		});
	}

	// Group: the detection corrections the same session exposed.
	{
		const Craft = (Command: string): any => Detect(Command, DEFAULT_PATTERNS, DEFAULT_EXEMPTS);
		Check(Count, "detect: `cd X && cmd` is not an offense (the false positive is gone)", () => {
			assert.equal(Craft("cd /Volumes/x && diff -q a b"), null);
			assert.equal(Craft("cd /Volumes/x"), null);
		});
		Check(Count, "detect: a bare pwd still maps to working_directory", () => {
			const Result = Craft("pwd");
			assert.equal(Result?.kind, "offense");
			assert.equal(Result.match.class, "discovery");
			assert.equal(Result.match.tool, "working_directory");
		});
		Check(Count, "detect: a background job maps to bash (the phantom tool is gone)", () => {
			const Result = Craft("nohup ./serve &");
			assert.equal(Result?.kind, "offense");
			assert.equal(Result.match.tool, "bash");
		});
		Check(Count, "detect: a file-descriptor redirect does not invent a pipeline", () => {
			// Before the fix `2>&1` split the command at the `&`, so the invented
			// second pipeline (`1 | tail -5`) lost the exempt `git` head and the
			// `tail` segment was reported as a read offense.
			assert.equal(Craft("git status 2>&1 | tail -5")?.kind, "exempt");
			assert.equal(Craft("node x.js 2>&1 | tail -30")?.kind, "exempt");
			assert.equal(Craft("make 2>&1 | tail -20")?.kind, "exempt");
		});
		Check(Count, "detect: a real background operator still splits", () => {
			assert.equal(Craft("cat a.md &")?.kind, "offense");
			assert.equal(Craft("cat a.md & cat b.md")?.kind, "offense");
		});
		Check(Count, "class lead: each class says what the command did, not 'for file content'", () => {
			assert.equal(CLASS_LEADS.discovery, "discovers paths or URLs");
			assert.equal(CLASS_LEADS.read, "reads file content into the conversation");
			assert.equal(CLASS_LEADS.write, "mutates file content on disk");
			assert.ok(!Object.values(CLASS_LEADS).some((Lead: string) => Lead.includes("forbidden")));
		});
	}
	return Finish(Count, "Defaults-And-Overrides");
};

// Standalone entry: `node Target/Test/Defaults-And-Overrides/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Defaults-And-Overrides`);
}
