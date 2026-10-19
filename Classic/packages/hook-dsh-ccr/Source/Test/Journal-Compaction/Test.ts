// Source/Test/Journal-Compaction/Test.ts - one singular test: the opt-in
// JSONL journal - the wired store path, the one-record-per-store format
// ({hash, type, size, ttlAt} + the base64 payload), the boot compaction (the
// corrupt and expired records dropped on a fake restart, the entry still
// retrievable), and the boot-compaction edges (an empty file, an all-expired
// file rewritten empty, and a MISSING file that is not created on boot -
// memory-only).
// Runs standalone (`node Target/Test/Journal-Compaction/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-ccr: the fake ctx + the REAL factory +
// the REAL ccr apply, from the Harness.
import assert from "node:assert/strict";
import {
	appendFileSync,
	existsSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import {
	Check,
	CheckAsync,
	Finish,
	MakeCounter,
	Make,
	Rm,
	Validate,
	Ledger,
	JournalPath as Journal,
	TextBlock,
	Exec,
	NextAccept,
	TerminalText,
	HashOf,
	SizeOf,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Run 9 - the JSONL journal (opt-in) round-trip + boot compaction.
	Rm();
	const Run9 = Make(Validate({ logFile: Ledger, journalPath: Journal }));
	{
		const Sub = "journalPath is wired into the store";
		Check(Count, Sub, () => {
			assert.ok(Run9.State.Store.Path === Journal);
		});
	}
	{
		const Sub = "the journal: exactly one JSONL record after one store";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("j".repeat(80), 40));
			await Run9.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			const Lines = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
			assert.ok(Lines.length === 1);
		});
	}
	{
		const Sub = "the journal record carries {hash, type, size, ttlAt}";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("j".repeat(80), 40));
			await Run9.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			const Lines = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
			const Record = Lines.length > 0 ? JSON.parse(Lines[0]) : undefined;
			assert.ok(
				Record !== undefined &&
					Record.hash === HashOf(Content) &&
					Record.type === "terminal" &&
					Record.size === SizeOf(Content) &&
					typeof Record.ttlAt === "number",
			);
		});
	}
	{
		const Sub = "the journal payload is the base64 of the content's JSON serialization";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("j".repeat(80), 40));
			await Run9.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			const Lines = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
			const Record = Lines.length > 0 ? JSON.parse(Lines[0]) : undefined;
			assert.ok(
				Record !== undefined &&
					Buffer.from(Record.payload, "base64").toString("utf8") === JSON.stringify(Content),
			);
		});
	}
	{
		const Sub = "boot compaction: the corrupt and expired records are dropped, one survives";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("j".repeat(80), 40));
			await Run9.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			// Corrupt the journal: one broken line + one expired record.
			appendFileSync(Journal, "\n");
			appendFileSync(
				Journal,
				`${JSON.stringify({
					hash: "e".repeat(24),
					type: "terminal",
					size: 3,
					ttlAt: Date.now() - 1000,
					payload: Buffer.from("[]", "utf8").toString("base64"),
				})}\n`,
			);
			appendFileSync(Journal, "{not json at all\n");
			// The "restart": a fresh apply over the same journal file loads +
			// compacts.
			const Run9b = Make(Validate({ logFile: Ledger, journalPath: Journal }));
			const Surviving = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
			assert.ok(Surviving.length === 1);
		});
	}
	{
		const Sub = "the journal survives the fake restart: the entry is retrievable again";
		await CheckAsync(Count, Sub, async () => {
			const Content = TextBlock(TerminalText("j".repeat(80), 40));
			await Run9.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
			appendFileSync(Journal, "\n");
			appendFileSync(
				Journal,
				`${JSON.stringify({
					hash: "e".repeat(24),
					type: "terminal",
					size: 3,
					ttlAt: Date.now() - 1000,
					payload: Buffer.from("[]", "utf8").toString("base64"),
				})}\n`,
			);
			appendFileSync(Journal, "{not json at all\n");
			const Run9b = Make(Validate({ logFile: Ledger, journalPath: Journal }));
			const Retrieved = await Run9b.Registered[0].execute(
				{ hash: HashOf(Content) },
				Exec("ccr_retrieve"),
			);
			assert.ok(
				Retrieved.text ===
					`${"make: starting\nexit code: 0\n"}${Array.from({ length: 40 }, (_, I) => `row ${I} ${"j".repeat(80)}`).join("\n")}`,
			);
		});
	}
	// Group: Run 9b (additive) - the journal's boot-compaction edges.
	Rm();
	{
		// Edge 1: an EMPTY journal file - loads to an empty store, no crash.
		writeFileSync(Journal, "", "utf8");
		const Run9c = Make(Validate({ logFile: Ledger, journalPath: Journal }));
		const Sub = "boot compaction edge: an EMPTY journal file loads to an empty store (no crash)";
		Check(Count, Sub, () => {
			assert.ok(
				Run9c.State.Store.Stats().count === 0 && Run9c.State.Store.Stats().bytes === 0,
			);
		});
	}
	{
		// Edge 2: an ALL-EXPIRED journal - every record past its TTL compacts away.
		writeFileSync(
			Journal,
			`${JSON.stringify({
				hash: "a".repeat(24),
				type: "terminal",
				size: 3,
				ttlAt: Date.now() - 1000,
				payload: Buffer.from("[]", "utf8").toString("base64"),
			})}\n${JSON.stringify({
				hash: "b".repeat(24),
				type: "file",
				size: 3,
				ttlAt: Date.now() - 2000,
				payload: Buffer.from("[]", "utf8").toString("base64"),
			})}\n`,
			"utf8",
		);
		const Run9d = Make(Validate({ logFile: Ledger, journalPath: Journal }));
		const Sub = "boot compaction edge: an ALL-EXPIRED journal compacts to an empty store";
		Check(Count, Sub, () => {
			assert.ok(Run9d.State.Store.Stats().count === 0);
		});
	}
	{
		const Sub = "boot compaction edge: the all-expired file is rewritten empty";
		Check(Count, Sub, () => {
			assert.ok(readFileSync(Journal, "utf8").trim() === "");
		});
	}
	{
		// Edge 3: a MISSING journal file - boot creates nothing, memory-only.
		const Fresh = "/tmp/ccr-smoke-journal-absent.jsonl";
		try {
			rmSync(Fresh);
		} catch {}
		const Run9e = Make(Validate({ logFile: Ledger, journalPath: Fresh }));
		const Sub = "boot compaction edge: a MISSING journal file is not created on boot (memory-only)";
		Check(Count, Sub, () => {
			assert.ok(Run9e.State.Store.Path === Fresh && !existsSync(Fresh));
		});
	}
	return Finish(Count, "Journal-Compaction");
};

// Standalone entry: `node Target/Test/Journal-Compaction/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Journal-Compaction`);
}
