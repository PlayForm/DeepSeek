// Source/Test/Storage-Domain/Test.ts - the storage-domain PRIMARY store and
// the JSON fallback: the byte-exact domain spec (name/version/layout/tables,
// NO compatibleVersions), the open, the per-mutation round-trip (the spliced
// proposals, the gates, the members and the idle queue land in their tables,
// and a clear deletes them), the reopen (restart) restoring the board, the
// absent-facility fallback still writing and reading the JSON state file, and
// the domain-version failure mode (a loud line, then the JSON fallback).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
	Check,
	CheckAsync,
	Finish,
	FakeStorage,
	Ledger,
	LinesWith,
	Make,
	MakeCounter,
	Seed,
	StateFile,
	Validate,
	rm,
} from "../Harness.js";

/** The canonical proposal fixture (the batch contract the pass-on emits). */
const Proposal = (): any => ({
	id: "prop-1",
	intent: "version-bump",
	targets: [{ path: "/tmp/pkg.json", version: "v1", why: "version 1.0.0 -> 2.0.0" }],
	operations: [
		{
			kind: "replace",
			path: "/tmp/pkg.json",
			find: '"version": "1.0.0"',
			replace: '"version": "2.0.0"',
			why: "version 1.0.0 -> 2.0.0",
		},
	],
	preview: { entries: [], changes: 1, skipped: [] },
	digest: "digest-1",
	revision: 1,
	expiresAt: 4_000_000_000_000,
	confidence: 0.9,
	origin: "agent-a",
});

/** The board entry the state file / the proposals table holds. */
const Entry = (): any => ({ proposal: Proposal(), status: "proposed", at: 1_000_000 });

/** The gate the state file / the gates table holds. */
const Gate = (): any => ({ name: "build", state: "green", owner: "" });

/** One inbox message carrying the text (the harness's UserMessage shape). */
const Message = (Id: string, Text: string): any => ({
	id: Id,
	role: "user",
	content: [{ type: "text", text: Text }],
	source: { kind: "user" },
});

/** The durable splice the agent-loop appends (the session/event channel). */
const Splice = (Run: any, Text: string, Id = "msg-1"): void => {
	Run.CtxListeners["session/event"](
		{ id: "agent-a" },
		{
			type: "agent/inbox/spliced",
			data: { target: "next-step", start: 0, inserted: [Message(Id, Text)] },
		},
	);
};

/** The proposal block the pass-on renders (the cross-package wire). */
const ProposalBlock = (Value: any): string =>
	`[BATCH PROPOSAL - ${Value.id}]\n${JSON.stringify(Value)}`;

/** A fresh mount over a fresh ledger and a fresh state file, with the
 *  optional fake KV facility attached BEFORE apply. */
const Mount = (Config: Record<string, unknown> = {}, Store?: any): any => {
	rm();
	try {
		FileSystem.rmSync(StateFile);
	} catch {
		/* no store yet */
	}
	return Setup(Config, Store);
};

/** A REOPEN: a fresh ledger but the state file SURVIVES (the restart
 *  scenarios - the fallback's durable store outlives the process). */
const Reopen = (Config: Record<string, unknown> = {}, Store?: any): any => {
	rm();
	return Setup(Config, Store);
};

/** The apply over the (already prepared) fixture state. */
const Setup = (Config: Record<string, unknown> = {}, Store?: any): any =>
	Make(Validate({ logFile: Ledger, enabled: true, stateFile: StateFile, ...Config }), (Context: any) => {
		if (Store !== undefined) {
			Context.storageDomain = Store.facility;
		}
	});

/** The persisted JSON fallback file, parsed. */
const ReadFile = (): any => JSON.parse(FileSystem.readFileSync(StateFile, "utf8"));

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group D1: the domain spec and the open.
	{
		const Store = FakeStorage();
		const Run = Mount({}, Store);
		await Run.State.Pending;
		Check(Count, "D1: the spec is name/version/layout/tables with NO compatibleVersions", () => {
			assert.equal(Store.spec.name, "batch_state");
			assert.equal(Store.spec.version, 1);
			assert.equal(Store.spec.layout, "per-record");
			assert.equal(Store.spec.invalidRecords, "backup-and-skip");
			for (const Table of ["members", "queue", "proposals", "gates"]) {
				assert.ok(Store.spec.tables[Table] !== undefined, Table);
			}
			// The family's learned rule: `[1]` against version 1 is rejected by
			// the library, so the spec must declare NO compatibleVersions.
			assert.equal(Store.spec.compatibleVersions, undefined);
		});
		Check(Count, "D1: the open binds the domain and the effect closes it on dispose", () => {
			assert.deepEqual(Run.Effects, ["batchstate-storage"]);
			assert.equal(Run.Disposers.length, 1);
			assert.equal(Store.closed, false);
			Run.Disposers[0]();
			assert.equal(Store.closed, true);
		});
	}

	// Group D2: the per-mutation round-trip through the domain.
	{
		const Store = FakeStorage();
		const Run = Mount({}, Store);
		await Run.State.Pending;
		Splice(Run, ProposalBlock(Proposal()));
		Run.Context.batchstate.setGate("build", "green");
		Run.Context.batchstate.setTask("a", "Building the parser");
		Run.Context.batchstate.queue("a");
		await Run.State.Pending;
		Check(Count, "D2: the spliced proposal lands in the proposals table keyed by id", () => {
			const Proposals = Store.tables.get("proposals") as Map<string, unknown>;
			assert.equal((Proposals.get("prop-1") as any).proposal.intent, "version-bump");
			assert.equal((Proposals.get("prop-1") as any).status, "proposed");
			assert.ok(Store.writes.some(([Table, Key]: [string, string]) => Table === "proposals" && Key === "prop-1"));
		});
		Check(Count, "D2: the gate lands in the gates table keyed by name", () => {
			const Gates = Store.tables.get("gates") as Map<string, unknown>;
			assert.deepEqual(Gates.get("build"), { name: "build", state: "green", owner: "" });
			assert.ok(Store.writes.some(([Table, Key]: [string, string]) => Table === "gates" && Key === "build"));
		});
		Check(Count, "D2: the member and the idle queue land in their tables", () => {
			const Members = Store.tables.get("members") as Map<string, unknown>;
			const Queue = Store.tables.get("queue") as Map<string, unknown>;
			assert.equal((Members.get("a") as any).task, "Building the parser");
			assert.equal((Members.get("a") as any).status, "active");
			assert.deepEqual(Queue.get("__queue"), ["a"]);
		});
		await CheckAsync(Count, "D2: a clear DELETES the records from the domain, never resurrects them", async () => {
			Run.Context.batchstate.clear();
			await Run.State.Pending;
			assert.equal((Store.tables.get("proposals") as Map<string, unknown>).size, 0);
			assert.equal((Store.tables.get("gates") as Map<string, unknown>).size, 0);
			assert.equal((Store.tables.get("members") as Map<string, unknown>).size, 0);
			assert.deepEqual((Store.tables.get("queue") as Map<string, unknown>).get("__queue"), []);
			assert.ok(Store.deletes.length > 0);
		});
	}

	// Group D3: the reopen (restart) restores the board from the domain.
	{
		const Store = FakeStorage();
		const First = Mount({}, Store);
		await First.State.Pending;
		Splice(First, ProposalBlock(Proposal()));
		First.Context.batchstate.setGate("build", "green");
		await First.State.Pending;
		const Second = Mount({}, Store);
		await Second.State.Pending;
		Check(Count, "D3: a reopen restores the proposals and the gates from the domain", () => {
			assert.equal(Second.State.Proposals.get("prop-1")?.proposal.intent, "version-bump");
			assert.equal(Second.State.Gates.get("build")?.state, "green");
			assert.ok(Second.Lines.includes("batchstate: recovered (0 members, queue 0)"));
			assert.deepEqual(Second.Lines.slice(0, 2), [
				`batchstate: activated (batch=default, stateFile=${StateFile})`,
				"batchstate: recovered (0 members, queue 0)",
			]);
		});
		Check(Count, "D3: the restored proposal is still the live read", () => {
			assert.equal(Second.Context.batchstate.getProposals().length, 1);
			assert.ok(Second.Context.batchstate.getContext("a").includes("GATES: build green"));
		});
		await CheckAsync(Count, "D3: a write in the open window survives the recovery", async () => {
			const Seeded = FakeStorage();
			Seeded.seed("gates", "seeded", { name: "seeded", state: "red", owner: "" });
			const Window = Mount({}, Seeded);
			// BEFORE the detached open resolves: a live gate report (the
			// store's copy must merge, never clobber it).
			Window.Context.batchstate.setGate("build", "green");
			await Window.State.Pending;
			assert.deepEqual([...Window.State.Gates.keys()].sort(), ["build", "seeded"]);
			assert.equal(Window.State.Gates.get("build")?.state, "green");
			assert.deepEqual(
				[...(Seeded.tables.get("gates") as Map<string, unknown>).keys()].sort(),
				["build", "seeded"],
			);
		});
	}

	// Group D4: the absent-facility fallback (the JSON state file still works).
	{
		const Run = Mount();
		Splice(Run, ProposalBlock(Proposal()));
		Run.Context.batchstate.setGate("build", "green");
		Check(Count, "D4: without a facility the JSON state file is the store", () => {
			const Raw = ReadFile();
			assert.equal(Raw.proposals[0].proposal.id, "prop-1");
			assert.deepEqual(Raw.gates, [Gate()]);
			assert.deepEqual(Run.Effects, []);
		});
		const Second = Reopen();
		Check(Count, "D4: without a facility the JSON recovery restores the board", () => {
			assert.equal(Second.State.Proposals.get("prop-1")?.proposal.intent, "version-bump");
			assert.equal(Second.State.Gates.get("build")?.state, "green");
			assert.ok(Second.Lines.includes("batchstate: recovered (0 members, queue 0)"));
		});
	}

	// Group D5: the domain-version failure mode.
	{
		Seed(
			JSON.stringify({
				members: [],
				queue: [],
				proposals: [Entry()],
				gates: [Gate()],
			}),
		);
		const Store = FakeStorage({ version: 2 });
		const Run = Reopen({}, Store);
		await Run.State.Pending;
		Check(Count, "D5: a domain-version mismatch is loud and degrades to the JSON fallback", () => {
			assert.deepEqual(LinesWith(Run, "storage open failed"), [
				"batchstate: storage open failed: version-mismatch: stored 2, declared 1",
			]);
			assert.equal(Store.spec, undefined);
			assert.equal(Run.State.Proposals.get("prop-1")?.proposal.intent, "version-bump");
			assert.ok(Run.Lines.includes("batchstate: recovered (0 members, queue 0)"));
		});
		await CheckAsync(Count, "D5: the degraded mount keeps writing the JSON fallback, never the domain", async () => {
			Run.Context.batchstate.setGate("smokes", "red", "coder-a");
			await Run.State.Pending;
			const Raw = ReadFile();
			assert.deepEqual(
				Raw.gates.map((One: any) => [One.name, One.state]),
				[
					["build", "green"],
					["smokes", "red"],
				],
			);
			assert.deepEqual(Store.writes, []);
		});
	}

	// Group D6: the domain knob.
	{
		const Store = FakeStorage();
		const Run = Mount({ domain: "batch_state_test" }, Store);
		await Run.State.Pending;
		Check(Count, "D6: the domain knob renames the domain", () => {
			assert.equal(Store.spec.name, "batch_state_test");
		});
		Check(Count, "D6: an invalid domain name fails loud at load", () => {
			assert.throws(
				() => Mount({ domain: "Batch-State" }),
				/batchstate: domain must be a lowercase unit name/,
			);
		});
	}

	return Finish(Count, "Storage-Domain");
};

// Standalone entry: `node Target/Test/Storage-Domain/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Storage-Domain`);
}
