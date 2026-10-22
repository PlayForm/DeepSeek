// Source/Test/Guard-And-Ledger/Test.ts - the listener behavior: the refusal
// replaces the dispatch (next() deliberately not called), the allow path
// passes through, the payload-shape extraction, the exclusion match, the
// fail-open contract, the byte-exact refusal and ledger lines in both the
// logger and durable forms, and the zero file-content guarantee.
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Fire,
	Ledger,
	LedgerLines,
	LedgerWith,
	LinesWith,
	Make,
	MakeCounter,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount. */
const Setup = (Config: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: the deny arm.
	{
		const Run = Setup();
		const Decision = await Fire(Run, { command: "git add -A" });
		CheckAsync(Count, "G1: the refusal replaces the dispatch and never calls next()", async () => {
			assert.equal(Decision.decision, "deny");
			assert.equal(Decision.__nextCalled, 0);
		});
		Check(Count, "G1: the refusal line is byte-exact", () => {
			assert.equal(
				Decision.refusal,
				'gitguard: refused "git add" (deny-list: git add) - git is read-only in this session (the checks-only law). Allowed: git status, log, diff, show, rev-parse, ls-files, fetch.',
			);
		});
		Check(Count, "G1: the denial is ledgered in both forms, byte-exact", () => {
			assert.deepEqual(LinesWith(Run, "denied add"), ["gitguard: denied add (deny-list: git add)"]);
			assert.equal(LedgerLines().filter((Line) => Line.endsWith("denied add (deny-list: git add)")).length, 1);
			assert.equal(LedgerWith("denied add").length, 1);
		});
	}

	// Group G2: the allow arm.
	{
		const Run = Setup();
		const Decision = await Fire(Run, { command: "git status" });
		Check(Count, "G2: an allowed dispatch passes through next() unchanged", () => {
			assert.equal(Decision.decision, "allow");
			assert.equal(Decision.passed, true);
			assert.equal(Decision.__nextCalled, 1);
			assert.deepEqual(LinesWith(Run, "denied"), []);
		});
	}

	// Group G3: the unreadable and null payloads.
	{
		const Run = Setup();
		const Empty = await Fire(Run, {});
		const Null = await Fire(Run, null);
		Check(Count, "G3: a payload without a readable command passes, never guesses", () => {
			assert.equal(Empty.__nextCalled, 1);
			assert.equal(Null.__nextCalled, 1);
			assert.deepEqual(LinesWith(Run, "denied"), []);
		});
	}

	// Group G4: the exclusion.
	{
		const Run = Setup({ exclude: ["node_modules"] });
		const Excluded = await Fire(Run, { command: "git add -A", cwd: "/repo/node_modules" });
		const Inside = await Fire(Run, { command: "git add -A", cwd: "/repo/src" });
		Check(Count, "G4: an excluded working directory skips the guard entirely", () => {
			assert.equal(Excluded.__nextCalled, 1);
			assert.equal(Inside.decision, "deny");
			assert.equal(Inside.__nextCalled, 0);
			assert.deepEqual(LinesWith(Run, "denied add").length, 1);
		});
	}

	// Group G5: the payload-shape extraction.
	{
		const Run = Setup();
		const String = await Fire(Run, "git reset --hard");
		const Exec = await Fire(Run, { exec: { command: "git commit -m x" } });
		const Input = await Fire(Run, { input: { command: "git rm -r ." } });
		const Cmd = await Fire(Run, { cmd: "git stash pop" });
		Check(Count, "G5: all four dispatch shapes carry the command to the guard", () => {
			assert.equal(String.decision, "deny");
			assert.ok(String.refusal.startsWith('gitguard: refused "git reset" (deny-list: git reset)'));
			assert.equal(Exec.decision, "deny");
			assert.ok(Exec.refusal.includes('refused "git commit"'));
			assert.equal(Input.decision, "deny");
			assert.ok(Input.refusal.includes('refused "git rm"'));
			assert.equal(Cmd.decision, "deny");
			assert.ok(Cmd.refusal.includes('refused "git stash"'));
		});
	}

	// Group G6: every denied attempt is ledgered once, never punished.
	{
		const Run = Setup();
		await Fire(Run, { command: "git push --force" });
		await Fire(Run, { command: "git push --force" });
		Check(Count, "G6: two identical denials surface once each and ledger twice", () => {
			assert.deepEqual(LinesWith(Run, "denied push (deny-list: git push)"), [
				"gitguard: denied push (deny-list: git push)",
				"gitguard: denied push (deny-list: git push)",
			]);
			assert.equal(LinesWith(Run, "refused").length, 0);
		});
	}

	// Group G7: the zero file-content guarantee.
	{
		const Run = Setup();
		await Fire(Run, { command: "git add -A" });
		await Fire(Run, { command: "git status" });
		await Fire(Run, { command: "git commit -m x", cwd: "/repo" });
		Check(Count, "G7: the fake fs records ZERO writeText and readText calls", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.reads.length, 0);
		});
	}
	return Finish(Count, "Guard-And-Ledger");
};

// Standalone entry: `node Target/Test/Guard-And-Ledger/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Guard-And-Ledger`);
}
