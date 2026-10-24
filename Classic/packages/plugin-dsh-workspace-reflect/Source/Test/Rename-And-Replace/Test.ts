// Source/Test/Rename-And-Replace/Test.ts - the rename and the replace ops:
// the scope-honest transformation (block vs file), the whole-word matching,
// the rejections (identity, no-op, span, size, missing file), the applied
// write through the REAL factory GuardedWrite with the version fence, the
// conflict and outcome-unknown mappings, the cold-mount denial, and the
// byte-exact ledger lines for every outcome.
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Ledger,
	LedgerWith,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Seed,
	Validate,
} from "../Harness.js";

const CONTENT = [
	"const alpha = 1;",
	"function alphaBeta() { return alpha; }",
	"export const gamma = alphaBeta();",
].join("\n");

/** An enabled mount with the standard file seeded at version 1. The D6 policy
 *  gate is OPENED here (`write: auto`) because this folder exercises the
 *  rename and the replace; the shipped `write: approve` is arbitrated by
 *  `Source/Test/Policy-Defaults`. */
const Setup = (Config: Record<string, unknown> = {}, Files: Record<string, string> = {}): any => {
	rm();
	return Make(
		Validate({ logFile: Ledger, enabled: true, policy: { write: "auto" }, ...Config }),
		Seed({ "/repo/a.ts": CONTENT, ...Files }),
	);
};

/** A mount whose fake fs fails every write with the given message (the gate
 *  is open - this fixture exercises the write failure, not the policy). */
const SetupFailing = (FailMessage: string): any => {
	rm();
	return Make(
		Validate({ logFile: Ledger, enabled: true, policy: { write: "auto" } }),
		(_Context: any, Run: any) => {
			Run.Fs.files = { "/repo/a.ts": CONTENT };
			Run.Fs.FailWrites = FailMessage;
		},
	);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group R1: the applied rename in block scope.
	{
		const Run = Setup();
		const Reply = await Run.Context.workspaceReflect.rename({
			kind: "rename",
			path: "/repo/a.ts",
			startLine: 1,
			endLine: 2,
			oldName: "alpha",
			newName: "delta",
		});
		Check(Count, "R1: the block-scope rename applies only inside the span", () => {
			assert.equal(Reply.status, "applied");
			assert.equal(Reply.version, "2");
			assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[0], "const delta = 1;");
			assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[2], "export const gamma = alphaBeta();");
		});
		Check(Count, "R1: the rename ledger line is byte-exact (logger and durable file)", () => {
			assert.deepEqual(LinesWith(Run, "rename /repo/a.ts"), [
				"reflect: rename /repo/a.ts alpha -> delta (applied)",
			]);
			assert.equal(LedgerWith("rename /repo/a.ts alpha -> delta (applied)").length, 1);
			assert.equal(LinesWith(Run, "conflict").length, 0);
		});
	}

	// Group R2: the file-scope rename and the whole-word rule.
	{
		const Run = Setup();
		const Reply = await Run.Context.workspaceReflect.rename({
			kind: "rename",
			path: "/repo/a.ts",
			startLine: 1,
			endLine: 1,
			oldName: "alpha",
			newName: "delta",
			scope: "file",
		});
		Check(Count, "R2: the file scope renames every whole-word occurrence", () => {
			assert.equal(Reply.status, "applied");
			assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[0], "const delta = 1;");
			assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[1], "function alphaBeta() { return delta; }");
			assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[2], "export const gamma = alphaBeta();");
		});
		Check(Count, "R2: whole-word only - alphaBeta is never touched", () => {
			assert.ok(!Run.Fs.files["/repo/a.ts"].includes("deltaBeta"));
		});
	}

	// Group R3: the rejections.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceReflect;
		await CheckAsync(Count, "R3: zero occurrences is a rejected reply, never an applied write", async () => {
			const Reply = await Service.rename({
				kind: "rename", path: "/repo/a.ts", startLine: 1, endLine: 1, oldName: "omega", newName: "delta",
			});
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "no occurrences in scope");
			assert.equal(Run.Fs.writes.length, 0);
		});
		await CheckAsync(Count, "R3: a no-op rename is rejected", async () => {
			const Reply = await Service.rename({
				kind: "rename", path: "/repo/a.ts", startLine: 1, endLine: 1, oldName: "alpha", newName: "alpha",
			});
			assert.equal(Reply.detail, "rename is a no-op");
		});
		await CheckAsync(Count, "R3: an incomplete identity is rejected", async () => {
			const Reply = await Service.rename({
				kind: "rename", path: "", startLine: 1, endLine: 1, oldName: "alpha", newName: "delta",
			});
			assert.equal(Reply.detail, "rename identity incomplete");
		});
		await CheckAsync(Count, "R3: a non-integral span is rejected", async () => {
			const Reply = await Service.rename({
				kind: "rename", path: "/repo/a.ts", startLine: 1.5, endLine: 2, oldName: "alpha", newName: "delta",
			});
			assert.equal(Reply.detail, "span is not integral");
		});
		await CheckAsync(Count, "R3: a missing file is rejected, never a fabricated read", async () => {
			const Reply = await Service.rename({
				kind: "rename", path: "/repo/none.ts", startLine: 1, endLine: 1, oldName: "alpha", newName: "delta",
			});
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "not an observed file");
		});
	}

	// Group R4: the size and span guards.
	{
		const Run = Setup({ maxFileBytes: 10 });
		await CheckAsync(Count, "R4: a file larger than maxFileBytes is rejected", async () => {
			const Reply = await Run.Context.workspaceReflect.rename({
				kind: "rename", path: "/repo/a.ts", startLine: 1, endLine: 1, oldName: "alpha", newName: "delta",
			});
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "file too large");
			assert.equal(Run.Fs.reads.length, 0);
		});
		const Run2 = Setup({ maxBlockLines: 2 });
		await CheckAsync(Count, "R4: a rename span wider than maxBlockLines is rejected", async () => {
			const Reply = await Run2.Context.workspaceReflect.rename({
				kind: "rename", path: "/repo/a.ts", startLine: 1, endLine: 3, oldName: "alpha", newName: "delta",
			});
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "span too large");
			assert.equal(Run2.Fs.writes.length, 0);
		});
	}

	// Group P1: the applied replace and the deletion form.
	{
		const Run = Setup();
		const Reply = await Run.Context.workspaceReflect.replace({
			kind: "replace",
			path: "/repo/a.ts",
			startLine: 2,
			endLine: 2,
			text: "function delta() { return 42; }",
		});
		Check(Count, "P1: the replace swaps the span's lines exactly", () => {
			assert.equal(Reply.status, "applied");
			assert.deepEqual(Run.Fs.files["/repo/a.ts"].split("\n"), [
				"const alpha = 1;",
				"function delta() { return 42; }",
				"export const gamma = alphaBeta();",
			]);
		});
		Check(Count, "P1: the replace ledger line is byte-exact", () => {
			assert.ok(LinesWith(Run, "replace /repo/a.ts lines 2-2").includes("reflect: replace /repo/a.ts lines 2-2 (applied)"));
		});
		const Reply2 = await Run.Context.workspaceReflect.replace({
			kind: "replace",
			path: "/repo/a.ts",
			startLine: 1,
			endLine: 1,
			text: "",
		});
		Check(Count, "P1: an empty text deletes the span", () => {
			assert.equal(Reply2.status, "applied");
			assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[0], "function delta() { return 42; }");
		});
	}

	// Group P2: the replace guards.
	{
		const Run = Setup();
		await CheckAsync(Count, "P2: a span outside the file is rejected", async () => {
			const Reply = await Run.Context.workspaceReflect.replace({
				kind: "replace", path: "/repo/a.ts", startLine: 1, endLine: 9, text: "x",
			});
			assert.equal(Reply.status, "rejected");
			assert.equal(Reply.detail, "span is outside the file");
		});
		const Run2 = Setup({ maxBlockLines: 1 });
		await CheckAsync(Count, "P2: a replace span wider than maxBlockLines is rejected", async () => {
			const Reply = await Run2.Context.workspaceReflect.replace({
				kind: "replace", path: "/repo/a.ts", startLine: 1, endLine: 2, text: "x",
			});
			assert.equal(Reply.detail, "span too large");
			assert.equal(Run2.Fs.writes.length, 0);
		});
	}

	// Group X1: the version fence through the REAL GuardedWrite.
	{
		const Run = Setup();
		Run.Fs.versions["/repo/a.ts"] = "7";
		// The fence's current version differs from the observed one: the
		// file moved under the op between the read and the write.
		Run.Fs.WriteVersionOverride = "8";
		const Reply = await Run.Context.workspaceReflect.rename({
			kind: "rename",
			path: "/repo/a.ts",
			startLine: 1,
			endLine: 1,
			oldName: "alpha",
			newName: "delta",
		});
		Check(Count, "X1: a file that moved under the op yields a conflict, never an overwrite", () => {
			assert.equal(Reply.status, "conflict");
			assert.ok(Reply.detail.includes("version"));
			assert.equal(Run.Fs.files["/repo/a.ts"], CONTENT);
			assert.deepEqual(LinesWith(Run, "conflict /repo/a.ts"), [
				"reflect: conflict /repo/a.ts (expected 7)",
			]);
		});
	}

	// Group X2: the outcome-unknown mapping.
	{
		const Run = SetupFailing("raid array on fire");
		const Reply = await Run.Context.workspaceReflect.rename({
			kind: "rename",
			path: "/repo/a.ts",
			startLine: 1,
			endLine: 1,
			oldName: "alpha",
			newName: "delta",
		});
		Check(Count, "X2: an unclassifiable write failure maps to outcome-unknown", () => {
			assert.equal(Reply.status, "outcome-unknown");
			assert.equal(Reply.detail, "raid array on fire");
			assert.equal(Reply.version, undefined);
			assert.deepEqual(LinesWith(Run, "failed /repo/a.ts"), [
				"reflect: failed /repo/a.ts (raid array on fire)",
			]);
		});
	}

	// Group X3: the cold mount denies every op.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger }), Seed({ "/repo/a.ts": CONTENT }));
		const Reply = await Run.Context.workspaceReflect.rename({
			kind: "rename", path: "/repo/a.ts", startLine: 1, endLine: 1, oldName: "alpha", newName: "delta",
		});
		Check(Count, "X3: a disabled plugin answers denied, never a write", () => {
			assert.equal(Reply.status, "denied");
			assert.equal(Reply.detail, "enabled=false");
			assert.equal(Run.Fs.writes.length, 0);
			assert.deepEqual(LinesWith(Run, "denied"), ["reflect: denied (enabled=false)"]);
		});
	}

	return Finish(Count, "Rename-And-Replace");
};

// Standalone entry: `node Target/Test/Rename-And-Replace/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Rename-And-Replace`);
}
