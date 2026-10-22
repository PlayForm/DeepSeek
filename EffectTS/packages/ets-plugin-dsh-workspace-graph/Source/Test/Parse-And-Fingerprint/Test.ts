// Source/Test/Parse-And-Fingerprint/Test.ts - the v0 parser against the
// committed fixtures: the exact node set and spans for the TypeScript fixture
// (A4), the span containment invariants, the contains edges, the
// relative-import edge with the skipped non-relative specifier, the Markdown
// DocSections with the frozen spans, the test-path Test node, the fingerprint
// formula recomputed independently, and the byte-exact unsupported-language
// skip. Unit smoke of @playform/plugin-dsh-workspace-graph: the fake ctx +
// the REAL built class, from the Harness.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { Check, Finish, MakeCounter, MakeGraph } from "../Harness.js";
// The committed fixtures, read from the Source tree (the fixtures are part of
// the test folder; the Target only carries the compiled tests).
const FIXTURE_TS = readFileSync(
	new URL("../../../Source/Test/Parse-And-Fingerprint/Fixture.ts", import.meta.url),
	"utf8",
);
const FIXTURE_MD = readFileSync(
	new URL("../../../Source/Test/Parse-And-Fingerprint/Fixture.md", import.meta.url),
	"utf8",
);

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const TS_PATH = "/proj/src/fixture.ts";
	const MD_PATH = "/proj/doc/fixture.md";

	// Group: the TypeScript fixture (A4).
	{
		const Run = MakeGraph({
			enabled: true,
			files: {
				[TS_PATH]: FIXTURE_TS,
				[MD_PATH]: FIXTURE_MD,
			},
		});
		await Run.Graph.indexFile(TS_PATH);
		await Run.Graph.indexFile(MD_PATH);
		const Snapshot = Run.Graph.snapshot();
		const Ids = new Set(Snapshot.nodes.map((N: any) => N.id));
		const ExpectedTsIds = [
			`File:${TS_PATH}`,
			`Symbol:${TS_PATH}:VERSION`,
			`Symbol:${TS_PATH}:greet`,
			`Block:${TS_PATH}:7:body`,
			`Symbol:${TS_PATH}:Greeter`,
			`Block:${TS_PATH}:11:body`,
			`Symbol:${TS_PATH}:Shape`,
			`Block:${TS_PATH}:17:body`,
			`Symbol:${TS_PATH}:Alias`,
			`Symbol:${TS_PATH}:counter`,
		];
		Check(Count, "parse: the TypeScript fixture yields exactly the expected File, Symbol and Block nodes (A4)", () => {
			for (const Id of ExpectedTsIds) {
				assert.ok(Ids.has(Id), `missing ${Id}`);
			}
			const TsNodes = Snapshot.nodes.filter((N: any) => N.path === TS_PATH);
			assert.equal(TsNodes.length, ExpectedTsIds.length, "no extra nodes in the TS file");
		});
		Check(Count, "parse: symbol spans sit inside the file span and block spans inside their symbol spans", () => {
			const File = Run.Graph.getNode(`File:${TS_PATH}`);
			assert.equal(File?.span?.startLine, 1);
			assert.equal(File?.span?.endLine, 22, "the fixture has 22 lines");
			const Greet = Run.Graph.getNode(`Symbol:${TS_PATH}:greet`);
			assert.deepEqual(Greet?.span, { startLine: 6, endLine: 8 });
			const GreetBody = Run.Graph.getNode(`Block:${TS_PATH}:7:body`);
			assert.deepEqual(GreetBody?.span, { startLine: 7, endLine: 8 });
			const Greeter = Run.Graph.getNode(`Symbol:${TS_PATH}:Greeter`);
			assert.deepEqual(Greeter?.span, { startLine: 10, endLine: 14 });
			const GreeterBody = Run.Graph.getNode(`Block:${TS_PATH}:11:body`);
			assert.deepEqual(GreeterBody?.span, { startLine: 11, endLine: 14 });
			for (const NodeItem of Snapshot.nodes.filter((N: any) => N.path === TS_PATH)) {
				assert.ok(
					(NodeItem.span?.startLine ?? 1) >= File.span.startLine &&
						(NodeItem.span?.endLine ?? 1) <= File.span.endLine,
					`inside file: ${NodeItem.id}`,
				);
			}
		});
		Check(Count, "parse: the contains edges run File to child and carry the child's span", () => {
			const Contains = Snapshot.edges.filter(
				(E: any) => E.kind === "contains" && E.from === `File:${TS_PATH}`,
			);
			assert.equal(Contains.length, 9, "six symbols plus three blocks");
			const GreetEdge = Contains.find((E: any) => E.to === `Symbol:${TS_PATH}:greet`);
			assert.deepEqual(GreetEdge?.span, { startLine: 6, endLine: 8 });
		});
		Check(Count, "parse: the relative import edges to the resolved file id and the non-relative specifier is skipped", () => {
			const Imports = Snapshot.edges.filter((E: any) => E.kind === "imports");
			assert.equal(Imports.length, 1, "only ./helper is relative");
			assert.deepEqual(Imports[0], {
				kind: "imports",
				from: `File:${TS_PATH}`,
				to: "File:/proj/src/helper",
				span: { startLine: 1, endLine: 1 },
			});
			assert.equal(
				Snapshot.nodes.some((N: any) => N.id.includes("node:path") || N.id.includes("node")),
				false,
				"the non-relative specifier produced no node",
			);
			assert.equal(Run.State.SkippedImports, 1, "the non-relative specifier was recorded");
		});
	}

	// Group: the Markdown fixture (A4).
	{
		const Run = MakeGraph({ enabled: true, files: { [MD_PATH]: FIXTURE_MD } });
		await Run.Graph.indexFile(MD_PATH);
		Check(Count, "parse: the Markdown fixture yields exactly the four DocSections with the frozen spans", () => {
			const Sections = Run.Graph.find({ kind: "DocSection" });
			assert.deepEqual(
				Sections.map((S: any) => [S.id, S.name, S.span.startLine, S.span.endLine]),
				[
					[`DocSection:${MD_PATH}:1`, "Top", 1, 15],
					[`DocSection:${MD_PATH}:5`, "Inner", 5, 12],
					[`DocSection:${MD_PATH}:9`, "Deep", 9, 12],
					[`DocSection:${MD_PATH}:13`, "Second", 13, 15],
				],
			);
		});
	}

	// Group: the test-path rule (A4).
	{
		const TestPath = "/proj/pkg/Source/Test/Demo/Test.ts";
		const Run = MakeGraph({
			enabled: true,
			files: { [TestPath]: "export const flag = true;\n" },
		});
		await Run.Graph.indexFile(TestPath);
		Check(Count, "parse: a test-path file yields the Test node plus its contains edge", () => {
			const Test = Run.Graph.getNode(`Test:${TestPath}`);
			assert.equal(Test?.kind, "Test");
			assert.equal(Test?.span?.startLine, 1);
			assert.equal(Test?.span?.endLine, 1);
			const Contains = Run.Graph
				.snapshot()
				.edges.filter((E: any) => E.kind === "contains" && E.to === `Test:${TestPath}`);
			assert.equal(Contains.length, 1);
			assert.equal(Contains[0]?.from, `File:${TestPath}`);
		});
	}

	// Group: the fingerprint formula, recomputed independently.
	{
		const Run = MakeGraph({ enabled: true, files: { [TS_PATH]: FIXTURE_TS } });
		await Run.Graph.indexFile(TS_PATH);
		const Fingerprint = (Text: string, Kind: string, Name = ""): string =>
			createHash("sha256").update(`${Text.replace(/\r\n/g, "\n").split("\n").map((L) => L.replace(/[ \t]+$/, "")).join("\n")}\n${Kind}\n${Name}`).digest("hex");
		const Lines = FIXTURE_TS.replace(/\r\n/g, "\n").split("\n");
		if (Lines.at(-1) === "") Lines.pop();
		Check(Count, "fingerprint: the formula is sha256 of normalized text, kind and name", () => {
			const File = Run.Graph.getNode(`File:${TS_PATH}`);
			assert.equal(File?.fingerprint, Fingerprint(Lines.join("\n"), "File"));
			const Version = Run.Graph.getNode(`Symbol:${TS_PATH}:VERSION`);
			assert.equal(Version?.fingerprint, Fingerprint(Lines[3] ?? "", "Symbol", "VERSION"));
			const GreetBody = Run.Graph.getNode(`Block:${TS_PATH}:7:body`);
			assert.equal(
				GreetBody?.fingerprint,
				Fingerprint(
					`${Lines[6] ?? ""}\n${Lines[7] ?? ""}`,
					"Block",
				),
			);
			const Deep = Run.Graph.find({ kind: "DocSection" });
			assert.equal(Deep.length, 0, "no Markdown in this folder's TS index");
		});
	}

	// Group: the unsupported language skip (byte-exact).
	{
		const Run = MakeGraph({ enabled: true, files: { "/proj/data/config.json": "{}\n" } });		const Outcome = await Run.Graph.indexFile("/proj/data/config.json");
		Check(Count, "parse: an unsupported language is skipped with the byte-exact ledger line", () => {
			assert.deepEqual(Outcome, {
				path: "/proj/data/config.json",
				status: "skipped",
				nodes: 0,
				edges: 0,
				reason: "unsupported language",
			});
			assert.ok(
				Run.loggerLines.includes("graph: skipped /proj/data/config.json (unsupported language)"),
			);
			assert.equal(Run.Graph.statistics().files, 0, "nothing stored");
		});
	}

	return Finish(Count, "Parse-And-Fingerprint");
};

// Standalone entry: `node Target/Test/Parse-And-Fingerprint/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Parse-And-Fingerprint`);
}
