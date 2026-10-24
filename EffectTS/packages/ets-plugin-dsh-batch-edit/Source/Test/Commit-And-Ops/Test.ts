// Source/Test/Commit-And-Ops/Test.ts - the commit path: the two-phase
// commit with its byte-exact ledger lines, the write through the factory's
// executor with the replaceIfVersion intent, the governed-basename re-route
// through Factory.Govern, the stale halt, the strict-mode error, the
// designed no-op silence, the atomic gate, and the op executor / diff units.
import assert from "node:assert/strict";
import * as Ops from "../../../Target/Function/Ops.js";
import {
	Check,
	CheckAsync,
	Exec,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount over the given file fixture. The D6 policy gate
 *  is opened explicitly (`policy.write: "auto"`): these scenarios exercise
 *  the commit itself, while the gate's shipped `approve` refusal is the
 *  Policy-Defaults folder's scenario. */
const Setup = (
	Files: Record<string, string>,
	Raw: Record<string, unknown> = {},
): any => {
	rm();
	return Make(
		Validate({ ...Raw, enabled: true, logFile: Ledger, policy: { write: "auto" } }),
		Files,
	);
};

/** Open a machine with one literal search and one replace op, return the run. */
const OpenReplace = async (Run: any, Search: string, With: string, Files?: string[]): Promise<any> =>
	Run.Tool.execute(
		{
			action: "open",
			files: Files ?? Object.keys(Run.Fs.files),
			searches: [`s=${Search}`],
			ops: [`file=* search=s op=replace with=${With}`],
		},
		Exec(),
	);

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group C1: the happy path.
	{
		const Run = Setup({ "a.txt": "hello\nworld\n" });
		await CheckAsync(Count, "C1: a commit replaces, writes through the factory and closes the one-shot machine", async () => {
			await OpenReplace(Run, "world", "HI");
			const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
			assert.equal(Out.applied, 1);
			assert.equal(Out.failed, 0);
			assert.equal(Out.halted, 0);
			assert.deepEqual(Out.state, [
				{
					file: "a.txt",
					status: "done",
					version: "v2",
					diff: "- world\n+ HI",
				},
			]);
			assert.equal(Run.Fs.files["a.txt"], "hello\nHI\n");
		});
		await CheckAsync(Count, "C1: the commit ledger lines are byte-exact", async () => {
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition running a.txt op=1/1"));
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition applied a.txt version v1 -> v2"));
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (1 applied, 0 failed, 0 halted)"));
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine closed mach-1"));
		});
		await CheckAsync(Count, "C1: the write carried the replaceIfVersion intent and the factory's stash got the fresh version", async () => {
			assert.equal(Run.Fs.writes.length, 1);
			assert.deepEqual(Run.Fs.writes[0].intent, { kind: "replaceIfVersion", version: "v1" });
			assert.equal(Run.Fs.writes[0].content, "hello\nHI\n");
			assert.equal(Run.State.Stash.get("key:a.txt"), "v2");
		});
	}

	// Group C2: the governed-basename re-route.
	{
		const Run = Setup({ "package.json": "{\n\t\"name\": \"x\"\n}\n" });
		const Governed: { path: string; version: string }[] = [];
		Run.State.Factory.RegisterGovern("package.json", "smoke", (_T: any, _A: any, V: string) => {
			Governed.push({ path: _T.displayPath, version: V });
		});
		await CheckAsync(Count, "C2: a package.json write re-runs the registered governance steps exactly once", async () => {
			await Run.Tool.execute(
				{
					action: "open",
					files: ["package.json"],
					searches: ["s=x"],
					ops: ["file=* search=s op=replace with=y"],
				},
				Exec(),
			);
			await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
			assert.deepEqual(Governed, [{ path: "package.json", version: "v2" }]);
			assert.equal(Run.Fs.files["package.json"], "{\n\t\"name\": \"y\"\n}\n");
		});
	}

	// Group C3: the stale halt.
	{
		const Run = Setup({ "a.txt": "hello\nworld\n" });
		await CheckAsync(Count, "C3: an externally touched file halts stale and is protected, not written", async () => {
			await OpenReplace(Run, "world", "HI");
			Run.Fs.versions.set("a.txt", "v9");
			const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
			assert.equal(Out.halted, 1);
			assert.equal(Out.applied, 0);
			assert.deepEqual(Out.state, [{ file: "a.txt", status: "halted", version: "v1", haltReason: "stale" }]);
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition halted a.txt stale"));
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (0 applied, 0 failed, 1 halted)"));
			assert.equal(Run.Fs.files["a.txt"], "hello\nworld\n");
		});
	}

	// Group C4: the strict-mode error.
	{
		const Run = Setup({ "a.txt": "hello\n" }, { strictMode: true });
		await CheckAsync(Count, "C4: a search-not-found under strict mode errors the file loudly", async () => {
			await OpenReplace(Run, "missing", "HI");
			const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
			assert.equal(Out.failed, 1);
			assert.deepEqual(Out.state, [{ file: "a.txt", status: "errored", version: "v1", error: "search not found" }]);
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition errored a.txt search not found"));
		});
	}

	// Group C5: the designed no-op.
	{
		const Run = Setup({ "a.txt": "hello\n" });
		await CheckAsync(Count, "C5: a zero-change commit is the designed no-op - nothing written, nothing logged", async () => {
			await Run.Tool.execute(
				{
					action: "open",
					files: ["a.txt"],
					searches: ["s=zzz"],
					ops: ["file=* search=s op=replace with=HI"],
				},
				Exec(),
			);
			const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
			assert.equal(Out.applied, 0);
			assert.deepEqual(Out.state, [{ file: "a.txt", status: "observed", version: "v1" }]);
			assert.equal(Run.Fs.writes.length, 0);
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (0 applied, 0 failed, 0 halted)"));
			// The no-op silence: no applied line, only the running marker.
			assert.ok(!Run.Lines.some((L: string) => L.includes("transition applied")));
		});
	}

	// Group C6: the atomic gate.
	{
		const Run = Setup({ "1-first.txt": "one\n", "2-second.txt": "two\n" });
		await CheckAsync(Count, "C6: a failed write stops the apply loop - the remainder returns to observed", async () => {
			Run.Fs.failWrite = "1-first.txt";
			await OpenReplace(Run, "one", "UNO");
			const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
			assert.equal(Out.failed, 1);
			assert.equal(Out.applied, 0);
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition errored 1-first.txt write denied"));
			const Second = Out.state.find((C: any) => C.file === "2-second.txt");
			assert.equal(Second.status, "observed");
			assert.equal(Run.Fs.writes.length, 0);
		});
	}

	// Group C7: the op executor units.
	{
		Check(Count, "C7: replace with mode first replaces only the first occurrence", () => {
			assert.deepEqual(Ops.ApplyOp("a a a", "a", "replace", "b", "first", false), { next: "b a a", count: 1 });
			assert.deepEqual(Ops.ApplyOp("a a a", "a", "replace", "b", 2, false), { next: "b b a", count: 2 });
			assert.deepEqual(Ops.ApplyOp("a a a", "a", "replace", "b", undefined, false), { next: "b b b", count: 3 });
		});
		Check(Count, "C7: a regex search counts and replaces through the same executor", () => {
			const Result = Ops.ApplyOp("aa12bb34", /[0-9]+/, "replace", "#", undefined, false);
			assert.deepEqual(Result, { next: "aa#bb#", count: 2 });
		});
		Check(Count, "C7: the line ops insert before/after and remove the matched lines", () => {
			assert.deepEqual(Ops.ApplyOp("one\ntwo\nthree", "two", "insert-before", "X", undefined, false), {
				next: "one\nX\ntwo\nthree",
				count: 1,
			});
			assert.deepEqual(Ops.ApplyOp("one\ntwo\nthree", "two", "insert-after", "X", undefined, false), {
				next: "one\ntwo\nX\nthree",
				count: 1,
			});
			assert.deepEqual(Ops.ApplyOp("one\ntwo\nthree", "two", "remove-line", "", undefined, false), {
				next: "one\nthree",
				count: 1,
			});
		});
		Check(Count, "C7: append and prepend pad the newline honestly", () => {
			assert.deepEqual(Ops.ApplyOp("one", "s", "append", "X", undefined, false), { next: "one\nX\n", count: 1 });
			assert.deepEqual(Ops.ApplyOp("one\n", "s", "append", "X", undefined, false), { next: "one\nX\n", count: 1 });
			assert.deepEqual(Ops.ApplyOp("one", "s", "prepend", "X", undefined, false), { next: "X\none", count: 1 });
		});
		Check(Count, "C7: the diff is the bounded removed/added line list", () => {
			assert.equal(Ops.Diff("a\nb\nc\n", "a\nc\n"), "- b");
			assert.equal(Ops.Diff("a\n", "a\nX\n"), "+ X");
			assert.equal(Ops.Diff("", "", 2000), "");
		});
	}
	return Finish(Count, "Commit-And-Ops");
};

// Standalone entry: `node Target/Test/Commit-And-Ops/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Commit-And-Ops`);
}
