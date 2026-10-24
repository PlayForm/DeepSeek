// Source/Test/Fingerprint-Targeting/Test.ts - the AST-aware targeting: a
// reflective Replace resolves its span from the GRAPH's node (the Symbol/Block
// nodes carry spans and content-derived fingerprints), verifies the span's
// fingerprint against the CURRENT text before writing, and rewrites only that
// span - a mismatch refuses and writes nothing. The folder also pins the
// textual fallback (no graph: the explicit span is used and still verified),
// the documented targeting refusals, and the rename's semantics consumer wiring
// (the real built semantics service mounted on the same fake context: the plan's
// edits are filtered to the operation's scope).
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Graph,
	Ledger,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Seed,
	Validate,
} from "../Harness.js";
import Semantics from "../../../../ets-plugin-dsh-workspace-semantics/Target/Library.js";
import GraphFingerprint from "../../../../ets-plugin-dsh-workspace-graph/Target/Function/Fingerprint.js";

const CONTENT = [
	"const alpha = 1;",
	"function beta() {",
	"\treturn alpha;",
	"}",
].join("\n");

const PATH = "/repo/a.ts";

/** The Block node the graph would have indexed: lines 3-4 of the fixture. */
const BLOCK = `Block:${PATH}:3:body`;

/** The graph's own fingerprint of that span (the algorithm must agree). */
const FINGERPRINT = GraphFingerprint(CONTENT.split("\n").slice(2, 4).join("\n"), "Block");

/** The node the fake graph serves. */
const NODES = {
	[BLOCK]: {
		id: BLOCK,
		kind: "Block",
		path: PATH,
		span: { startLine: 3, endLine: 4 },
		fingerprint: FINGERPRINT,
	},
};

/** The validated config shape a sibling loader hands to its apply. */
const Definition = (Raw: Record<string, unknown>): any =>
	(Semantics.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/** An enabled mount; the attach hook seeds the fs and may mount siblings. The
 *  D6 policy gate is OPENED here (`write: auto`) because this folder exercises
 *  the replace path; the shipped `write: approve` is arbitrated by
 *  `Source/Test/Policy-Defaults`. */
const Setup = (
	Config: Record<string, unknown> = {},
	Files: Record<string, string> = { [PATH]: CONTENT },
	Attach?: (Context: any, Run: any) => void,
): any => {
	rm();
	return Make(
		Validate({ logFile: Ledger, enabled: true, policy: { write: "auto" }, ...Config }),
		(Context: any, Run: any) => {
			Seed(Files)(Context, Run);
			Attach?.(Context, Run);
		},
	);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group F1: the node-targeted replace by fingerprint.
	{
		const Calls: string[] = [];
		const Run = Setup({}, { [PATH]: CONTENT }, (Context: any) => {
			Context.workspaceGraph = Graph(Calls, undefined, NODES);
		});
		const Reply = await Run.Context.workspaceReflect.replace({
			kind: "replace",
			path: PATH,
			node: BLOCK,
			fingerprint: FINGERPRINT,
			text: "\treturn alpha + 1;\n}",
		});
		Check(Count, "F1: the graph's node span is the span that is rewritten", () => {
			assert.equal(Reply.status, "applied");
			assert.deepEqual(Run.Fs.files[PATH].split("\n"), [
				"const alpha = 1;",
				"function beta() {",
				"\treturn alpha + 1;",
				"}",
			]);
		});
		Check(Count, "F1: the ledger names the NODE's span, not a request span", () => {
			assert.deepEqual(LinesWith(Run, "replace /repo/a.ts"), [
				"reflect: replace /repo/a.ts lines 3-4 (applied)",
			]);
		});
		Check(Count, "F1: the applied write is carried to the graph", () => {
			assert.deepEqual(Calls, [PATH]);
			assert.deepEqual(LinesWith(Run, "carried"), [
				`reflect: carried ${PATH} (graph reindexed)`,
			]);
		});
	}

	// Group F2: the stale node refuses and writes nothing.
	{
		const Run = Setup({}, { [PATH]: CONTENT }, (Context: any) => {
			Context.workspaceGraph = Graph([], undefined, NODES);
		});
		const Stale = GraphFingerprint("\treturn omega;", "Block");
		const Reply = await Run.Context.workspaceReflect.replace({
			kind: "replace",
			path: PATH,
			node: BLOCK,
			fingerprint: Stale,
			text: "gone",
		});
		Check(Count, "F2: a fingerprint mismatch is a rejected reply", () => {
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "fingerprint mismatch");
		});
		Check(Count, "F2: the mismatch refuses byte-exactly and writes nothing", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.files[PATH], CONTENT);
			assert.deepEqual(LinesWith(Run, "fingerprint mismatch"), [
				`reflect: rejected ${PATH} (fingerprint mismatch)`,
			]);
		});
	}

	// Group F3: the textual fallback with the graph absent.
	{
		const Run = Setup();
		const Textual = await Run.Context.workspaceReflect.replace({
			kind: "replace",
			path: PATH,
			startLine: 3,
			endLine: 3,
			text: "\treturn alpha + 2;",
		});
		Check(Count, "F3: without a node target the textual span engine still applies", () => {
			assert.equal(Textual.status, "applied");
			assert.equal(Run.Fs.files[PATH].split("\n")[2], "\treturn alpha + 2;");
			assert.deepEqual(LinesWith(Run, "replace /repo/a.ts"), [
				"reflect: replace /repo/a.ts lines 3-3 (applied)",
			]);
		});
		const Fallback = await Run.Context.workspaceReflect.replace({
			kind: "replace",
			path: PATH,
			startLine: 1,
			endLine: 1,
			node: `Symbol:${PATH}:alpha`,
			fingerprint: GraphFingerprint("const alpha = 1;", "Symbol", "alpha"),
			text: "const alpha = 9;",
		});
		Check(Count, "F3: with no graph the explicit span is the fallback and is verified", () => {
			assert.equal(Fallback.status, "applied");
			assert.equal(Run.Fs.files[PATH].split("\n")[0], "const alpha = 9;");
			assert.deepEqual(LinesWith(Run, "replace /repo/a.ts lines 1-1"), [
				"reflect: replace /repo/a.ts lines 1-1 (applied)",
			]);
		});
		const Absent = await Run.Context.workspaceReflect.replace({
			kind: "replace",
			path: PATH,
			node: BLOCK,
			fingerprint: FINGERPRINT,
			text: "gone",
		});
		Check(Count, "F3: a node target with no graph and no span refuses byte-exactly", () => {
			assert.equal(Absent.status, "rejected");
			assert.equal(Absent.detail, "graph absent");
			assert.deepEqual(LinesWith(Run, "graph absent"), [
				`reflect: rejected ${PATH} (graph absent)`,
			]);
		});
		const Wrong = await Run.Context.workspaceReflect.replace({
			kind: "replace",
			path: PATH,
			startLine: 3,
			endLine: 4,
			node: BLOCK,
			fingerprint: "not-the-fingerprint",
			text: "gone",
		});
		Check(Count, "F3: the fallback verifies the fingerprint too", () => {
			assert.equal(Wrong.status, "rejected");
			assert.equal(Wrong.detail, "fingerprint mismatch");
		});
	}

	// Group F4: the targeting refusals.
	{
		const Run = Setup({}, { [PATH]: CONTENT, "/repo/other.ts": CONTENT }, (Context: any) => {
			Context.workspaceGraph = Graph([], undefined, NODES);
		});
		const Service = Run.Context.workspaceReflect;
		await CheckAsync(Count, "F4: a node target without a fingerprint refuses", async () => {
			const Reply = await Service.replace({ kind: "replace", path: PATH, node: BLOCK, text: "x" });
			assert.equal(Reply.detail, "fingerprint required for a node target");
		});
		await CheckAsync(Count, "F4: a fingerprint without a node target refuses", async () => {
			const Reply = await Service.replace({
				kind: "replace",
				path: PATH,
				startLine: 1,
				endLine: 1,
				fingerprint: FINGERPRINT,
				text: "x",
			});
			assert.equal(Reply.detail, "fingerprint without a node target");
		});
		await CheckAsync(Count, "F4: a node id for another path refuses byte-exactly", async () => {
			const Reply = await Service.replace({
				kind: "replace",
				path: "/repo/other.ts",
				node: BLOCK,
				fingerprint: FINGERPRINT,
				text: "x",
			});
			assert.equal(Reply.detail, "node path mismatch");
			assert.deepEqual(LinesWith(Run, "node path mismatch"), [
				"reflect: rejected /repo/other.ts (node path mismatch)",
			]);
		});
		await CheckAsync(Count, "F4: a File-kind node id is not targetable", async () => {
			const Reply = await Service.replace({
				kind: "replace",
				path: PATH,
				startLine: 1,
				endLine: 1,
				node: `File:${PATH}`,
				fingerprint: FINGERPRINT,
				text: "x",
			});
			assert.equal(Reply.detail, "node not targetable");
		});
		await CheckAsync(Count, "F4: a node the graph does not know refuses", async () => {
			const Reply = await Service.replace({
				kind: "replace",
				path: PATH,
				node: `Symbol:${PATH}:unknown`,
				fingerprint: FINGERPRINT,
				text: "x",
			});
			assert.equal(Reply.detail, "node not found");
		});
	}

	// Group F5: the rename's semantics consumer wiring.
	{
		const Run = Setup({}, { [PATH]: CONTENT }, (Context: any) => {
			Semantics.apply(Context, Definition({ enabled: true, log: false }));
		});
		const Service = Run.Context.workspaceReflect;
		await CheckAsync(Count, "F5: the semantics plan is filtered to the block scope", async () => {
			const Reply = await Service.rename({
				kind: "rename",
				path: PATH,
				startLine: 3,
				endLine: 4,
				oldName: "alpha",
				newName: "delta",
			});
			assert.equal(Reply.status, "applied");
			assert.deepEqual(Run.Fs.files[PATH].split("\n"), [
				"const alpha = 1;",
				"function beta() {",
				"\treturn delta;",
				"}",
			]);
		});
		await CheckAsync(Count, "F5: the deepened and rename lines are byte-exact", async () => {
			assert.deepEqual(LinesWith(Run, "deepened"), [
				`reflect: deepened ${PATH} (1 edits via semantics)`,
			]);
			assert.deepEqual(LinesWith(Run, "rename /repo/a.ts"), [
				`reflect: rename ${PATH} alpha -> delta (applied)`,
			]);
			assert.equal(
				Run.Lines.some((Line: string) => Line.startsWith("semantics: planned rename alpha -> delta")),
				true,
				"the real service produced the plan",
			);
		});
		await CheckAsync(Count, "F5: the file scope takes every plan edit", async () => {
			const Reply = await Service.rename({
				kind: "rename",
				path: PATH,
				startLine: 1,
				endLine: 1,
				oldName: "alpha",
				newName: "omega",
				scope: "file",
			});
			assert.equal(Reply.status, "applied");
			assert.deepEqual(Run.Fs.files[PATH].split("\n"), [
				"const omega = 1;",
				"function beta() {",
				"\treturn delta;",
				"}",
			]);
			assert.equal(LinesWith(Run, "deepened").length, 2);
		});
		await CheckAsync(Count, "F5: an identifier outside the scope falls back to the refusal", async () => {
			const Reply = await Service.rename({
				kind: "rename",
				path: PATH,
				startLine: 3,
				endLine: 4,
				oldName: "missing",
				newName: "delta",
			});
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "no occurrences in scope");
			assert.deepEqual(LinesWith(Run, "no occurrences in scope"), [
				`reflect: rejected ${PATH} (no occurrences in scope)`,
			]);
		});
	}

	return Finish(Count, "Fingerprint-Targeting");
};

// Standalone entry: `node Target/Test/Fingerprint-Targeting/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Fingerprint-Targeting`);
}
