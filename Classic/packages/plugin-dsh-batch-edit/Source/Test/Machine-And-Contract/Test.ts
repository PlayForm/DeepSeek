// Source/Test/Machine-And-Contract/Test.ts - the loader contract, the
// IDLE-forever cold mount, the byte-exact activation line, the fail-loud
// validation, the machine lifecycle (open / insert / remove / state / close)
// with their byte-exact ledger lines, the grammar parsers, the miss listing,
// and the machinesPerAgent cap.
import assert from "node:assert/strict";
import Plugin, { apply, Config, inject, name } from "../../../Target/Library.js";
import * as Machine from "../../../Target/Function/Machine.js";
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

/** A standard enabled mount over the given file fixture (the ledger always
 * goes to the harness's own temp file, never the user's home). */
const Setup = (
	Files: Record<string, string> = { "a.txt": "hello\nworld\n" },
	Raw: Record<string, unknown> = {},
): any => {
	rm();
	return Make(Validate({ ...Raw, enabled: true, logFile: Ledger }), Files);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group M1: the loader contract.
	{
		const Run = Setup();
		Check(Count, "M1: the default export carries name, apply, Config and inject", () => {
			assert.equal(Plugin.name, name);
			assert.equal(Plugin.apply, apply);
			assert.equal(Plugin.Config, Config);
			assert.deepEqual(Plugin.inject, inject);
		});
		Check(Count, "M1: the identity is the package name and the inject list is the four services", () => {
			assert.equal(name, "plugin-dsh-batch-edit");
			// `fs` joined the list after the 2026-10-22 live dogfood caught
			// `cannot get property "fs" without inject`: the machine reads
			// State.Context.fs (Machine/Ops/Tools), and the fake-ctx smoke
			// provided get("fs"), masking the missing declaration.
			assert.deepEqual(inject, ["fs", "pluginFactory", "tools", "jobs"]);
		});
		Check(Count, "M1: apply returns NOTHING (a returned value kills event delivery)", () => {
			assert.equal(Run.Returned, undefined);
		});
	}

	// Group M2: the IDLE-forever cold mount.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger }));
		Check(Count, "M2: a cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["plugin-dsh-batch-edit: disabled (enabled=false)"]);
		});
		Check(Count, "M2: the disabled mount still registers the tool and the root observer (both no-op via On)", () => {
			assert.equal(Run.Tool.name, "batch_edit");
			assert.deepEqual(Object.keys(Run.RootListeners), ["fs/observed"]);
		});
		await CheckAsync(Count, "M2: the disabled tool refuses loudly", async () => {
			await assert.rejects(
				() => Run.Tool.execute({ action: "open" }, Exec()),
				/plugin-dsh-batch-edit is disabled \(enabled=false\)/,
			);
		});
	}

	// Group M3: the enabled mount's wiring.
	{
		const Run = Setup();
		Check(Count, "M3: the activation line is byte-exact", () => {
			assert.deepEqual(Run.Lines, [
				`plugin-dsh-batch-edit: activated bundle ${process.env.VERSION_PACKAGE} (machinesPerAgent 2, opsPerCommit 64, deadlineMs 120000, strictMode false, interceptBash false)`,
			]);
		});
		Check(Count, "M3: the fs/observed observer sits on the ROOT context only", () => {
			assert.deepEqual(Object.keys(Run.RootListeners), ["fs/observed"]);
			assert.notEqual(Run.Root, Run.Context);
		});
		Check(Count, "M3: the pre-step listener sits on the ctx; no pre-execute listener while intercept is off", () => {
			assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update", "agent/pre-step"]);
		});
		Check(Count, "M3: the State probe carries the contract fields", () => {
			assert.equal(Run.State.On, true);
			assert.equal(Run.State.MachinesPerAgent, 2);
			assert.equal(Run.State.OpsPerCommit, 64);
			assert.equal(Run.State.Deadline, 120000);
			assert.equal(Run.State.Strict, false);
			assert.equal(Run.State.Intercept, false);
			assert.deepEqual(Run.State.Checksets, []);
			assert.equal(Run.State.Counter, 0);
			assert.equal(Run.State.Ledger, Run.State.Ledger);
			assert.equal(Run.State.Module, "plugin-dsh-batch-edit");
			assert.equal(typeof Run.State.Factory.Write, "function");
		});
	}

	// Group M4: the fail-loud validation.
	{
		Check(Count, "M4: a deadlineMs below 1000 fails loud at load", () => {
			assert.throws(
				() => Setup({}, { deadlineMs: 999 }),
				/plugin-dsh-batch-edit: deadlineMs must be >= 1000 and <= 120000/,
			);
		});
		Check(Count, "M4: a deadlineMs above 120000 fails loud at load", () => {
			assert.throws(
				() => Setup({}, { deadlineMs: 200000 }),
				/plugin-dsh-batch-edit: deadlineMs must be >= 1000 and <= 120000/,
			);
		});
		Check(Count, "M4: machinesPerAgent 0 fails loud at load", () => {
			assert.throws(
				() => Setup({}, { machinesPerAgent: 0 }),
				/plugin-dsh-batch-edit: machinesPerAgent must be >= 1/,
			);
		});
		Check(Count, "M4: opsPerCommit 0 fails loud at load", () => {
			assert.throws(
				() => Setup({}, { opsPerCommit: 0 }),
				/plugin-dsh-batch-edit: opsPerCommit must be >= 1/,
			);
		});
	}

	// Group M5: the open path.
	{
		const Run = Setup({ "a.txt": "hello\nworld\n" });
		await CheckAsync(Count, "M5: open resolves, versions and adopts the files with the byte-exact lines", async () => {
			const Out = await Run.Tool.execute(
				{
					action: "open",
					files: ["a.txt"],
					searches: ["s=hello"],
					ops: ["file=a.txt search=s op=replace with=hi"],
				},
				Exec(),
			);
			assert.equal(Out.machine, "mach-1");
			assert.deepEqual(Out.state, [{ file: "a.txt", status: "observed", version: "v1" }]);
			assert.deepEqual(Out.misses, undefined);
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine opened mach-1 (1 files, scope=a.txt)"));
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: inserted a.txt at version v1"));
		});
		await CheckAsync(Count, "M5: a missing file is listed as a miss, never guessed", async () => {
			const Out = await Run.Tool.execute(
				{ action: "open", files: ["a.txt", "nope.txt"], searches: [], ops: [] },
				Exec(),
			);
			assert.deepEqual(Out.misses, undefined); // the open output carries the machine, the record carries the misses
			const MachineRecord = Run.State.Machines.get("agent-a")?.get("mach-2");
			assert.deepEqual(MachineRecord?.misses, ["nope.txt"]);
			assert.ok(!Run.Lines.some((L: string) => L.includes("inserted nope.txt")));
		});
	}

	// Group M6: the grammar parsers.
	{
		Check(Count, "M6: ParseSearches parses the literal and the simple regex forms", () => {
			const Searches = Machine.ParseSearches(["name=pattern", "re=re:/a+b/gi"]);
			const Literal = Searches.get("name");
			const Regex = Searches.get("re");
			assert.equal(Literal?.regex, false);
			assert.equal(Literal?.matcher, "pattern");
			assert.equal(Regex?.regex, true);
			assert.equal(Regex?.matcher instanceof RegExp, true);
			assert.equal((Regex?.matcher as RegExp).flags, "gi");
		});
		Check(Count, "M6: ParseOp parses the full grammar including the multi-word with and the mode", () => {
			const Op = Machine.ParseOp("file=a.txt search=s op=replace with=hello world mode=first");
			assert.deepEqual(Op, { file: "a.txt", search: "s", op: "replace", with: "hello world", mode: "first" });
			const Counted = Machine.ParseOp("file=* search=s op=replace with=x mode=2");
			assert.equal(Counted.mode, 2);
		});
		Check(Count, "M6: ParseOp fails loud on a malformed line", () => {
			assert.throws(() => Machine.ParseOp("search=s op=replace"), /plugin-dsh-batch-edit: malformed op "search=s op=replace" - file=<selector> is required/);
			assert.throws(() => Machine.ParseOp("file=a search=s op=nope"), /plugin-dsh-batch-edit: malformed op "file=a search=s op=nope" - unknown op mode "nope"/);
		});
		Check(Count, "M6: ParseOps enforces the configured cap", () => {
			assert.throws(
				() => Machine.ParseOps(["file=a search=s op=replace with=x"], 0),
				/plugin-dsh-batch-edit: 1 ops exceed opsPerCommit 0 - use the opfile path/,
			);
		});
	}

	// Group M7: the insert / remove / state / close lifecycle.
	{
		const Run = Setup({ "a.txt": "one\n", "b.txt": "two\n" });
		await CheckAsync(Count, "M7: open then insert adds only the new cells with the byte-exact line", async () => {
			await Run.Tool.execute({ action: "open", files: ["a.txt"], searches: [], ops: [] }, Exec());
			const Out = await Run.Tool.execute({ action: "insert", machine: "mach-1", files: ["a.txt", "b.txt"] }, Exec());
			assert.equal(Out.state.length, 2);
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: inserted b.txt at version v1"));
			const Inserted = Run.Lines.filter((L: string) => L.includes("inserted a.txt at version v1"));
			assert.equal(Inserted.length, 1); // the re-insertion is a renewal, not a new process
		});
		await CheckAsync(Count, "M7: remove drops files with the byte-exact line", async () => {
			const Out = await Run.Tool.execute({ action: "remove", machine: "mach-1", files: ["b.txt"] }, Exec());
			assert.equal(Out.state.length, 1);
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: removed b.txt"));
		});
		await CheckAsync(Count, "M7: state re-presents every held file", async () => {
			const Out = await Run.Tool.execute({ action: "state", machine: "mach-1" }, Exec());
			assert.equal(Out.machine, "mach-1");
			assert.deepEqual(Out.state, [{ file: "a.txt", status: "observed", version: "v1" }]);
		});
		await CheckAsync(Count, "M7: close marks the machine closed with the byte-exact line; further inserts refuse", async () => {
			const Out = await Run.Tool.execute({ action: "close", machine: "mach-1" }, Exec());
			assert.equal(Out.machine, "mach-1");
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: machine closed mach-1"));
			await assert.rejects(
				() => Run.Tool.execute({ action: "insert", machine: "mach-1", files: ["b.txt"] }, Exec()),
				/plugin-dsh-batch-edit: unknown machine "mach-1"/,
			);
			await assert.rejects(
				() => Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec()),
				/plugin-dsh-batch-edit: unknown machine "mach-1"/,
			);
		});
	}

	// Group M8: the machinesPerAgent cap.
	{
		const Run = Setup({ "a.txt": "x\n" }, { machinesPerAgent: 1 });
		await CheckAsync(Count, "M8: a second open beyond the cap fails loud with the contract phrasing", async () => {
			await Run.Tool.execute({ action: "open", files: ["a.txt"] }, Exec());
			await assert.rejects(
				() => Run.Tool.execute({ action: "open", files: ["a.txt"] }, Exec()),
				/plugin-dsh-batch-edit: 1 open machines reach machinesPerAgent 1 - close one first/,
			);
		});
	}
	return Finish(Count, "Machine-And-Contract");
};

// Standalone entry: `node Target/Test/Machine-And-Contract/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Machine-And-Contract`);
}
