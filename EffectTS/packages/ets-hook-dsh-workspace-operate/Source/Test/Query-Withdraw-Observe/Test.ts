// Source/Test/Query-Withdraw-Observe/Test.ts - the observe side and the
// management surface: the silent fs/observed fence tracker (no ledger noise,
// never throws, own-actor ignored), the staleness rule's use of the
// observed version as the fence when the caller gives none, the withdrawal
// path with its byte-exact line, the filtered query with its limits, the
// honest statistics, and the full-table refusal.
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	FileNode,
	FakeGraph,
	Fire,
	Ledger,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Validate,
	SymbolNode,
} from "../Harness.js";

/** A standard enabled mount with overrides and an optional fake graph. */
const Setup = (Config: Record<string, unknown> = {}, Graph?: any): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }), Graph);
};

/** The default fake graph: symbol Alpha in a.ts, file nodes for a.ts and b.ts. */
const DefaultGraph = (Edges: { kind: string; from: string; to: string }[] = []) =>
	FakeGraph(
		[
			SymbolNode("Alpha", "/repo/src/a.ts", "sym-alpha"),
			FileNode("/repo/src/a.ts", "file-a"),
			FileNode("/repo/src/b.ts", "file-b"),
		],
		Edges,
	);

/** Drive one folder's checks. */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group O1: the fence tracker.
	{
		const Run = Setup();
		const Before = Run.Lines.length;
		Fire(Run, "/repo/src/a.ts", "v9");
		Fire(Run, "/repo/src/b.ts", "v1", Run.State.Self);
		Check(Count, "O1: the fence tracker records foreign events silently", () => {
			assert.equal(Run.State.Observed.get("/repo/src/a.ts"), "v9");
			assert.equal(Run.Lines.length, Before);
		});
		Check(Count, "O1: the hook's own actor is ignored and malformed events never throw", () => {
			Fire(Run, "/repo/src/never.ts", "v1", Run.State.Self);
			assert.equal(Run.State.Observed.has("/repo/src/never.ts"), false);
			Run.Listeners["fs/observed"](null, null, undefined);
			assert.equal(Run.State.Observed.has("unknown"), false);
		});
	}

	// Group O2: the observed version as the fence.
	{
		const Run = Setup({}, DefaultGraph());
		Fire(Run, "/repo/src/a.ts", "v1");
		await CheckAsync(Count, "O2: without a caller fence the observed version is used", async () => {
			const Outcome = await Run.Context.workspaceOperate.proposeRename({
				path: "/repo/src/a.ts",
				name: "Alpha",
				to: "Beta",
			});
			assert.equal(Outcome.status, "proposed");
			assert.equal(Outcome.proposal.version, "v1");
			assert.equal(Outcome.proposal.id, "rename-1");
		});
		await CheckAsync(Count, "O2: a caller fence that contradicts the observed version is refused", async () => {
			const Outcome = await Run.Context.workspaceOperate.proposeRename({
				path: "/repo/src/a.ts",
				name: "Alpha",
				to: "Beta",
				version: "v9",
			});
			assert.equal(Outcome.status, "refused");
			assert.deepEqual(Outcome.refusal, {
				kind: "rename",
				reason: "stale-version",
				detail: "the fence v9 contradicts the observed version v1",
			});
			assert.deepEqual(LinesWith(Run, "refused rename stale-version"), [
				"operate: refused rename stale-version",
			]);
		});
		await CheckAsync(Count, "O2: a version is never invented (no fence, no observation)", async () => {
			const Outcome = await Run.Context.workspaceOperate.proposeRename({
				path: "/repo/src/unknown.ts",
				name: "Alpha",
				to: "Beta",
			});
			assert.equal(Outcome.status, "refused");
			assert.equal(Outcome.refusal.reason, "missing-version");
		});
	}

	// Group O3: the withdrawal path.
	{
		const Run = Setup({}, DefaultGraph());
		const Service = Run.Context.workspaceOperate;
		await Service.proposeRename({
			path: "/repo/src/a.ts",
			name: "Alpha",
			to: "Beta",
			version: "v1",
		});
		Check(Count, "O3: a withdrawal marks the proposal and logs the byte-exact line", () => {
			assert.equal(Service.withdraw("rename-1"), true);
			assert.equal(Service.get("rename-1").status, "withdrawn");
			assert.deepEqual(LinesWith(Run, "withdrawn"), ["operate: withdrawn rename-1"]);
		});
		Check(Count, "O3: an unknown id is a false return, never an error", () => {
			assert.equal(Service.withdraw("nope-9"), false);
			assert.equal(Service.withdraw("rename-1"), false);
		});
	}

	// Group O4: the query surface.
	{
		const Run = Setup({}, DefaultGraph());
		const Service = Run.Context.workspaceOperate;
		await Service.proposeRename({
			path: "/repo/src/a.ts",
			name: "Alpha",
			to: "Beta",
			version: "v1",
		});
		await Service.proposeConnect({
			from: { path: "/repo/src/a.ts" },
			target: { path: "/repo/src/b.ts" },
			edge: "imports",
			version: "v1",
		});
		await Service.proposeReplace({
			path: "/repo/src/b.ts",
			span: { startLine: 1, endLine: 1 },
			content: "x",
			version: "v1",
		});
		Check(Count, "O4: the list filters by kind, path and status", () => {
			assert.deepEqual(Service.list({ kind: "rename" }).map((P: any) => P.id), ["rename-1"]);
			assert.deepEqual(Service.list({ path: "/repo/src/b.ts" }).map((P: any) => P.id), [
				"replace-3",
			]);
			assert.deepEqual(Service.list({ status: "withdrawn" }), []);
		});
		await CheckAsync(Count, "O4: the default limit and the hard cap apply", async () => {
			assert.equal(Service.list({ limit: 2 }).length, 2);
			const Capped = Setup({ limitMaximum: 2 }, DefaultGraph());
			await Capped.Context.workspaceOperate.proposeRename({
				path: "/repo/src/a.ts",
				name: "Alpha",
				to: "Beta",
				version: "v1",
			});
			await Capped.Context.workspaceOperate.proposeConnect({
				from: { path: "/repo/src/a.ts" },
				target: { path: "/repo/src/b.ts" },
				edge: "imports",
				version: "v1",
			});
			await Capped.Context.workspaceOperate.proposeReplace({
				path: "/repo/src/b.ts",
				span: { startLine: 1, endLine: 1 },
				content: "x",
				version: "v1",
			});
			assert.equal(Capped.Context.workspaceOperate.list({ limit: 50 }).length, 2);
			assert.equal(Capped.Context.workspaceOperate.list().length, 3);
		});
		Check(Count, "O4: the statistics are honest", () => {
			assert.deepEqual(Service.statistics(), {
				proposals: 3,
				refused: 0,
				sequence: 3,
				byKind: { rename: 1, connect: 1, replace: 1 },
			});
		});
	}

	// Group O5: the full-table refusal.
	{
		const Run = Setup({ maxProposals: 1 }, DefaultGraph());
		const Service = Run.Context.workspaceOperate;
		await Service.proposeRename({
			path: "/repo/src/a.ts",
			name: "Alpha",
			to: "Beta",
			version: "v1",
		});
		await CheckAsync(Count, "O5: a proposal into a full table is refused, never dropped", async () => {
			const Outcome = await Service.proposeConnect({
				from: { path: "/repo/src/a.ts" },
				target: { path: "/repo/src/b.ts" },
				edge: "imports",
				version: "v1",
			});
			assert.deepEqual(Outcome, {
				status: "refused",
				refusal: {
					kind: "connect",
					reason: "full",
					detail: "the proposal table is at maxProposals (1)",
				},
			});
			assert.deepEqual(LinesWith(Run, "refused full"), [
				"operate: refused full (1 live proposals)",
			]);
			assert.equal(Service.statistics().refused, 1);
		});
	}
	return Finish(Count, "Query-Withdraw-Observe");
};

// Standalone entry: `node Target/Test/Query-Withdraw-Observe/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Query-Withdraw-Observe`);
}
