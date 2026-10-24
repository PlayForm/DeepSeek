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
  rm
} from "../Harness.js";
const Proposal = () => ({
  id: "prop-1",
  intent: "version-bump",
  targets: [{ path: "/tmp/pkg.json", version: "v1", why: "version 1.0.0 -> 2.0.0" }],
  operations: [
    {
      kind: "replace",
      path: "/tmp/pkg.json",
      find: '"version": "1.0.0"',
      replace: '"version": "2.0.0"',
      why: "version 1.0.0 -> 2.0.0"
    }
  ],
  preview: { entries: [], changes: 1, skipped: [] },
  digest: "digest-1",
  revision: 1,
  expiresAt: 4e12,
  confidence: 0.9,
  origin: "agent-a"
});
const Entry = () => ({ proposal: Proposal(), status: "proposed", at: 1e6 });
const Gate = () => ({ name: "build", state: "green", owner: "" });
const Message = (Id, Text) => ({
  id: Id,
  role: "user",
  content: [{ type: "text", text: Text }],
  source: { kind: "user" }
});
const Splice = (Run, Text, Id = "msg-1") => {
  Run.CtxListeners["session/event"](
    { id: "agent-a" },
    {
      type: "agent/inbox/spliced",
      data: { target: "next-step", start: 0, inserted: [Message(Id, Text)] }
    }
  );
};
const ProposalBlock = (Value) => `[BATCH PROPOSAL - ${Value.id}]
${JSON.stringify(Value)}`;
const Mount = (Config = {}, Store) => {
  rm();
  try {
    FileSystem.rmSync(StateFile);
  } catch {
  }
  return Setup(Config, Store);
};
const Reopen = (Config = {}, Store) => {
  rm();
  return Setup(Config, Store);
};
const Setup = (Config = {}, Store) => Make(Validate({ logFile: Ledger, enabled: true, stateFile: StateFile, ...Config }), (Context) => {
  if (Store !== void 0) {
    Context.storageDomain = Store.facility;
  }
});
const ReadFile = () => JSON.parse(FileSystem.readFileSync(StateFile, "utf8"));
const runTest = async () => {
  const Count = MakeCounter();
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
        assert.ok(Store.spec.tables[Table] !== void 0, Table);
      }
      assert.equal(Store.spec.compatibleVersions, void 0);
    });
    Check(Count, "D1: the open binds the domain and the effect closes it on dispose", () => {
      assert.deepEqual(Run.Effects, ["batchstate-storage"]);
      assert.equal(Run.Disposers.length, 1);
      assert.equal(Store.closed, false);
      Run.Disposers[0]();
      assert.equal(Store.closed, true);
    });
  }
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
      const Proposals = Store.tables.get("proposals");
      assert.equal(Proposals.get("prop-1").proposal.intent, "version-bump");
      assert.equal(Proposals.get("prop-1").status, "proposed");
      assert.ok(Store.writes.some(([Table, Key]) => Table === "proposals" && Key === "prop-1"));
    });
    Check(Count, "D2: the gate lands in the gates table keyed by name", () => {
      const Gates = Store.tables.get("gates");
      assert.deepEqual(Gates.get("build"), { name: "build", state: "green", owner: "" });
      assert.ok(Store.writes.some(([Table, Key]) => Table === "gates" && Key === "build"));
    });
    Check(Count, "D2: the member and the idle queue land in their tables", () => {
      const Members = Store.tables.get("members");
      const Queue = Store.tables.get("queue");
      assert.equal(Members.get("a").task, "Building the parser");
      assert.equal(Members.get("a").status, "active");
      assert.deepEqual(Queue.get("__queue"), ["a"]);
    });
    await CheckAsync(Count, "D2: a clear DELETES the records from the domain, never resurrects them", async () => {
      Run.Context.batchstate.clear();
      await Run.State.Pending;
      assert.equal(Store.tables.get("proposals").size, 0);
      assert.equal(Store.tables.get("gates").size, 0);
      assert.equal(Store.tables.get("members").size, 0);
      assert.deepEqual(Store.tables.get("queue").get("__queue"), []);
      assert.ok(Store.deletes.length > 0);
    });
  }
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
        "batchstate: recovered (0 members, queue 0)"
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
      Window.Context.batchstate.setGate("build", "green");
      await Window.State.Pending;
      assert.deepEqual([...Window.State.Gates.keys()].sort(), ["build", "seeded"]);
      assert.equal(Window.State.Gates.get("build")?.state, "green");
      assert.deepEqual(
        [...Seeded.tables.get("gates").keys()].sort(),
        ["build", "seeded"]
      );
    });
  }
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
  {
    Seed(
      JSON.stringify({
        members: [],
        queue: [],
        proposals: [Entry()],
        gates: [Gate()]
      })
    );
    const Store = FakeStorage({ version: 2 });
    const Run = Reopen({}, Store);
    await Run.State.Pending;
    Check(Count, "D5: a domain-version mismatch is loud and degrades to the JSON fallback", () => {
      assert.deepEqual(LinesWith(Run, "storage open failed"), [
        "batchstate: storage open failed: version-mismatch: stored 2, declared 1"
      ]);
      assert.equal(Store.spec, void 0);
      assert.equal(Run.State.Proposals.get("prop-1")?.proposal.intent, "version-bump");
      assert.ok(Run.Lines.includes("batchstate: recovered (0 members, queue 0)"));
    });
    await CheckAsync(Count, "D5: the degraded mount keeps writing the JSON fallback, never the domain", async () => {
      Run.Context.batchstate.setGate("smokes", "red", "coder-a");
      await Run.State.Pending;
      const Raw = ReadFile();
      assert.deepEqual(
        Raw.gates.map((One) => [One.name, One.state]),
        [
          ["build", "green"],
          ["smokes", "red"]
        ]
      );
      assert.deepEqual(Store.writes, []);
    });
  }
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
        /batchstate: domain must be a lowercase unit name/
      );
    });
  }
  return Finish(Count, "Storage-Domain");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Storage-Domain`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
