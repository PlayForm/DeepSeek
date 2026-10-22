// Source/Test/Connect-And-Carry/Test.ts - the connect op and the reflective
// carry: the import insertion with a symbol, the comment form without one,
// the idempotence (already connected), the identity rejection, the relative
// specifier computation, and the carry (absent graph silent skip, present
// graph reindexes with the byte-exact carried line, a graph failure is
// contained and never undoes the applied write).
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Graph,
	Ledger,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Validate,
} from "../Harness.js";

const CONTENT = "export const alpha = 1;\n";

/** An enabled mount with an optional workspaceGraph attached (an array
 *  argument attaches the handle even when empty - the graph exists but has
 *  recorded no calls yet; no argument attaches nothing). */
const Setup = (Calls?: string[], Throw?: string): any => {
	rm();
	return Make(
		Validate({ logFile: Ledger, enabled: true }),
		(Context: any, Run: any) => {
			Run.Fs.files = { "/repo/src/a.ts": CONTENT };
			if (Calls !== undefined) {
				Context.workspaceGraph = Graph(Calls, Throw);
			}
		},
	);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group C1: the connect with a symbol.
	{
		const Run = Setup();
		const Reply = await Run.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "/repo/src/a.ts",
			toPath: "/repo/src/beta.ts",
			symbol: "Beta",
		});
		Check(Count, "C1: the connect inserts an import of the symbol at the top", () => {
			assert.equal(Reply.status, "applied");
			assert.equal(Run.Fs.files["/repo/src/a.ts"].split("\n")[0], 'import { Beta } from "./beta.ts";');
		});
		Check(Count, "C1: the connect ledger line is byte-exact", () => {
			assert.deepEqual(LinesWith(Run, "connect /repo/src/a.ts"), [
				"reflect: connect /repo/src/a.ts -> /repo/src/beta.ts (applied)",
			]);
		});
	}

	// Group C2: the comment form and the relative specifier.
	{
		const Run = Setup();
		const Reply = await Run.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "/repo/src/a.ts",
			toPath: "/repo/lib/b.ts",
		});
		Check(Count, "C2: without a symbol a reference comment is inserted", () => {
			assert.equal(Reply.status, "applied");
			assert.equal(Run.Fs.files["/repo/src/a.ts"].split("\n")[0], "// connect: /repo/lib/b.ts");
		});
		const Run2 = Setup();
		await Run2.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "/repo/src/a.ts",
			toPath: "/repo/src/beta.ts",
			symbol: "Beta",
		});
		Check(Count, "C2: the specifier is relative to the from-file's directory", () => {
			assert.ok(Run2.Fs.files["/repo/src/a.ts"].includes('from "./beta.ts"'));
		});
	}

	// Group C3: the idempotence.
	{
		const Run = Setup();
		await Run.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "/repo/src/a.ts",
			toPath: "/repo/src/beta.ts",
			symbol: "Beta",
		});
		Run.Fs.writes = [];
		const Reply = await Run.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "/repo/src/a.ts",
			toPath: "/repo/src/beta.ts",
			symbol: "Beta",
		});
		Check(Count, "C3: an already-connected from-file is rejected, never duplicated", () => {
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "already connected");
			assert.equal(Run.Fs.writes.length, 0);
		});
	}

	// Group C4: the identity rejection.
	{
		const Run = Setup();
		const Reply = await Run.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "",
			toPath: "/repo/src/beta.ts",
		});
		Check(Count, "C4: an incomplete identity is rejected with the byte-exact line", () => {
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "connect identity incomplete");
			assert.deepEqual(LinesWith(Run, "rejected"), [
				"reflect: rejected  (connect identity incomplete)",
			]);
		});
	}

	// Group K1: the carry with an absent graph.
	{
		const Run = Setup();
		const Reply = await Run.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "/repo/src/a.ts",
			toPath: "/repo/src/beta.ts",
			symbol: "Beta",
		});
		Check(Count, "K1: an absent graph is a silent skip - the write still applies", () => {
			assert.equal(Reply.status, "applied");
			assert.equal(LinesWith(Run, "carried").length, 0);
			assert.equal(LinesWith(Run, "carry").length, 0);
		});
	}

	// Group K2: the carry with a present graph.
	{
		const Calls: string[] = [];
		const Run = Setup(Calls);
		const Reply = await Run.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "/repo/src/a.ts",
			toPath: "/repo/src/beta.ts",
			symbol: "Beta",
		});
		Check(Count, "K2: a present graph reindexes the changed file", () => {
			assert.equal(Reply.status, "applied");
			assert.deepEqual(Calls, ["/repo/src/a.ts"]);
			assert.deepEqual(LinesWith(Run, "carried"), [
				"reflect: carried /repo/src/a.ts (graph reindexed)",
			]);
		});
	}

	// Group K3: the carry failure is contained.
	{
		const Calls: string[] = [];
		const Run = Setup(Calls, "graph offline");
		const Reply = await Run.Context.workspaceReflect.connect({
			kind: "connect",
			fromPath: "/repo/src/a.ts",
			toPath: "/repo/src/beta.ts",
			symbol: "Beta",
		});
		Check(Count, "K3: a graph failure is swallowed after one line, never undone", () => {
			assert.equal(Reply.status, "applied");
			assert.ok(Run.Fs.files["/repo/src/a.ts"].startsWith("import { Beta }"));
			assert.deepEqual(LinesWith(Run, "failed /repo/src/a.ts"), [
				"reflect: failed /repo/src/a.ts (carry: graph offline)",
			]);
			assert.equal(LinesWith(Run, "carried").length, 0);
		});
	}

	return Finish(Count, "Connect-And-Carry");
};

// Standalone entry: `node Target/Test/Connect-And-Carry/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Connect-And-Carry`);
}
