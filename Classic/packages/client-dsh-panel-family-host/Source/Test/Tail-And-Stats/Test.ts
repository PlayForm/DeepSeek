// Source/Test/Tail-And-Stats/Test.ts - the endpoints against real files in a
// disposable log root: the tail slicing and the namespace/lines validation,
// the maxLines cap, the not-found surfaces, the ccr stats summary, and the
// read-only guarantee (the fixture bytes unchanged, no new files).
import assert from "node:assert/strict";
import {
	Bytes,
	CheckAsync,
	Finish,
	Make,
	MakeCounter,
	MakeRoot,
	Names,
	Put,
	Validate,
} from "../Harness.js";

const LOG = "hook-dsh-workspace-observe.log";
const CONTENT = "line-1\nline-2\nline-3\nline-4\n";

/** A standard enabled mount over one fresh root with one log file. */
const Setup = (Config: Record<string, unknown> = {}) => {
	const Root = MakeRoot();
	const Log = Put(Root, LOG, CONTENT);
	const Ccr = Put(Root, "ccr.log", "a\nb\nc\n");
	const Run = Make(Validate({ enabled: true, logRoot: Root, maxLines: 200, ccrLog: Ccr, ...Config }));
	return { Run, Root, Log, Ccr };
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group T1: the tail slicing.
	{
		const { Run, Root, Log } = Setup();
		await CheckAsync(Count, "T1: tail returns the last N lines", async () => {
			assert.deepEqual(await Run.Service.tail("hook-dsh-workspace-observe", 2), {
				ok: true,
				namespace: "hook-dsh-workspace-observe",
				lines: ["line-3", "line-4"],
			});
		});
		await CheckAsync(Count, "T1: a larger request returns every line", async () => {
			assert.deepEqual((await Run.Service.tail("hook-dsh-workspace-observe", 10)).lines, [
				"line-1",
				"line-2",
				"line-3",
				"line-4",
			]);
		});
		await CheckAsync(Count, "T1: the maxLines cap bounds the request", async () => {
			const Capped = Make(Validate({ enabled: true, logRoot: Root, maxLines: 2 }));
			assert.deepEqual((await Capped.Service.tail("hook-dsh-workspace-observe", 100)).lines, [
				"line-3",
				"line-4",
			]);
		});
		await CheckAsync(Count, "T1: the log bytes are untouched (read-only)", async () => {
			assert.equal(Bytes(Log).toString(), CONTENT);
			assert.deepEqual(Names(Root), ["ccr.log", LOG]);
		});
	}

	// Group T2: the tail validation.
	{
		const { Run } = Setup();
		await CheckAsync(Count, "T2: a namespace outside the family pattern is rejected", async () => {
			assert.deepEqual(await Run.Service.tail("../etc/passwd", 5), {
				ok: false,
				code: "rejected",
				message: 'namespace "../etc/passwd" is not a family module name',
			});
			assert.equal((await Run.Service.tail("a.b", 5)).code, "rejected");
			assert.equal((await Run.Service.tail("UPPER", 5)).code, "rejected");
			assert.equal((await Run.Service.tail("a/b", 5)).code, "rejected");
		});
		await CheckAsync(Count, "T2: non-positive and non-integer line counts are rejected", async () => {
			assert.equal((await Run.Service.tail("hook-dsh-workspace-observe", 0)).code, "rejected");
			assert.equal((await Run.Service.tail("hook-dsh-workspace-observe", 1.5)).code, "rejected");
		});
		await CheckAsync(Count, "T2: a missing log is not-found with the byte-exact prefix", async () => {
			const Result = await Run.Service.tail("hook-dsh-missing", 5);
			assert.equal(Result.code, "not-found");
			assert.equal(
				(Result as { message: string }).message.startsWith('log "hook-dsh-missing.log" is unreadable: '),
				true,
			);
		});
	}

	// Group S1: the ccr stats.
	{
		const { Run, Root, Ccr } = Setup();
		await CheckAsync(Count, "S1: stats returns the exact ccr summary", async () => {
			assert.deepEqual(await Run.Service.stats(), {
				ok: true,
				ccrLog: Ccr,
				bytes: 6,
				lines: 3,
			});
		});
		await CheckAsync(Count, "S1: the ccr bytes are untouched (read-only)", async () => {
			assert.equal(Bytes(Ccr).toString(), "a\nb\nc\n");
			assert.deepEqual(Names(Root), ["ccr.log", LOG]);
		});
		await CheckAsync(Count, "S1: a missing ccr log is not-found", async () => {
			const Missing = Make(Validate({ enabled: true, ccrLog: "/nonexistent/ccr.log" }));
			const Result = await Missing.Service.stats();
			assert.equal(Result.code, "not-found");
			assert.equal((Result as { message: string }).message.startsWith("ccr log is unreadable: "), true);
		});
	}
	return Finish(Count, "Tail-And-Stats");
};

// Standalone entry: `node Target/Test/Tail-And-Stats/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Tail-And-Stats`);
}
