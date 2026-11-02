import assert from "node:assert/strict";
import FileSystem from "node:fs";
import Configuration from "../../../Target/Variable/Configuration.js";
import { Check, Finish, Knobs, MakeCounter } from "../Harness.js";
const Member = (Value, Key) => {
  if (typeof Value !== "object" || Value === null) return void 0;
  return Reflect.get(Value, Key);
};
const Cell = (Value) => {
  if (typeof Value !== "object" || Value === null || !("get" in Value)) return Value;
  const Reader2 = Value.get;
  return typeof Reader2 === "function" ? Reader2.call(Value) : Value;
};
const Values = (Given) => {
  const Map_ = /* @__PURE__ */ new Map();
  if (typeof Given !== "object" || Given === null) return Map_;
  for (const Key of Object.keys(Given)) Map_.set(Key, Reflect.get(Given, Key));
  return Map_;
};
const Scalars = {
  enabled: false,
  logFile: "~/.dsh/playform/plugin-dsh-skill-learn.log",
  domain: "skillLearn",
  storagePath: "~/.dsh/skill-learn/usage.json",
  statePath: "~/.dsh/skill-learn/state.json",
  ledgerPath: "~/.dsh/skill-learn/ledger.jsonl",
  blobRoot: "~/.dsh/skill-learn/blobs",
  snapshotRoot: "~/.dsh/skill-learn/snapshots",
  reportsRoot: "~/.dsh/skill-learn/reports",
  snapshotKeep: 5,
  skillsRoot: "~/.dsh/skills",
  archiveRoot: "~/.dsh/skills/.archive",
  agreementPath: "~/.dsh/AGENTS.md",
  intervalIterations: 15,
  maxOperations: 8,
  maxOperationsPerRun: 4,
  maxWritesPerSession: 6,
  digestTail: 24,
  digestUserChars: 300,
  digestAssistantChars: 200,
  maxInputChars: 12e4,
  maxTokens: 4e3,
  maxSkillChars: 1e5,
  staleAfterDays: 14,
  archiveAfterDays: 30,
  curateIntervalHours: 168,
  consolidate: false,
  provider: "",
  model: ""
};
const Policy = {
  read: "auto",
  index: "auto",
  record: "auto",
  suggest: "auto",
  write: "auto",
  commit: "approve",
  spawn: "approve",
  message: "auto"
};
const Paths = [
  "logFile",
  "storagePath",
  "statePath",
  "ledgerPath",
  "blobRoot",
  "snapshotRoot",
  "reportsRoot",
  "skillsRoot",
  "archiveRoot",
  "agreementPath"
];
const Numbers = [
  "snapshotKeep",
  "intervalIterations",
  "maxOperations",
  "maxOperationsPerRun",
  "maxWritesPerSession",
  "digestTail",
  "digestUserChars",
  "digestAssistantChars",
  "maxInputChars",
  "maxTokens",
  "maxSkillChars",
  "staleAfterDays",
  "archiveAfterDays",
  "curateIntervalHours"
];
const Flags = ["enabled", "consolidate"];
const Texts = ["domain", "provider", "model"];
const Resolved = Values(Configuration({}));
const Default = (Key) => Cell(Resolved.get(Key));
const Reader = Knobs({});
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "P1: `enabled` is false in both the schema and the reader", () => {
    assert.equal(Default("enabled"), false, "the idle-forever posture");
    assert.equal(Reader.enabled, false, "a loaded plugin ships disabled");
  });
  Check(Count, "P2: `write` is auto, and `commit` and `spawn` stay approve", () => {
    const FromSchema = Default("policy");
    assert.equal(Member(FromSchema, "write"), "auto", "the review publishes behind the fence");
    assert.equal(Member(FromSchema, "commit"), "approve", "the plugin never commits");
    assert.equal(Member(FromSchema, "spawn"), "approve", "and never spawns an agent");
    assert.equal(Reader.policy.write, "auto");
    assert.equal(Reader.policy.commit, "approve");
    assert.equal(Reader.policy.spawn, "approve");
  });
  Check(Count, "P3: the eight policy verdicts are the shipped posture", () => {
    assert.deepEqual(Default("policy"), Policy, "the schema fills the block");
    assert.deepEqual(Reader.policy, Policy, "and the reader carries it");
  });
  Check(Count, "P4: the ten path defaults are the family's own", () => {
    for (const Key of Paths) {
      assert.equal(Default(Key), Scalars[Key], `${Key} is the shipped path`);
      assert.equal(typeof Scalars[Key], "string", `${Key} is a path`);
    }
  });
  Check(Count, "P5: the fourteen numeric defaults are the shipped budgets", () => {
    for (const Key of Numbers) {
      assert.equal(Default(Key), Scalars[Key], `${Key} is the shipped number`);
      assert.equal(typeof Scalars[Key], "number", `${Key} is a number`);
    }
  });
  Check(Count, "P6: the two booleans and the three strings are the shipped values", () => {
    for (const Key of [...Flags, ...Texts]) {
      assert.equal(Default(Key), Scalars[Key], `${Key} is the shipped value`);
    }
  });
  Check(Count, "P7: the identity places agree", () => {
    const Manifest = JSON.parse(
      FileSystem.readFileSync(new URL("../../../package.json", import.meta.url), "utf8")
    );
    const Name = Member(Manifest, "name");
    assert.equal(Name, "@playform/plugin-dsh-skill-learn", "identity place one: the package name");
    assert.equal(Default("domain"), "skillLearn", "identity place three: the service name and ledger prefix");
    assert.equal(
      Default("logFile"),
      `~/.dsh/playform/${String(Name).replace("@playform/", "")}.log`,
      "identity place four: the log file default is the package's own name"
    );
    const Patch = FileSystem.readFileSync(new URL("../../../cordis.patch.yml", import.meta.url), "utf8");
    assert.equal(
      Patch.includes(`id: ${String(Name).replace("@playform/", "")}`),
      true,
      "the loader entry id is the package's short name"
    );
    assert.equal(Patch.includes(`name: "${String(Name)}"`), true, "and the row names the package in full");
    assert.equal(Patch.includes("domain: skillLearn"), true, "the patch and the schema agree on the domain");
  });
  Check(Count, "P8: the knob reader agrees with the schema's 29 scalar defaults", () => {
    assert.deepEqual(
      Object.fromEntries(Object.entries(Reader).filter(([Key]) => Key !== "policy")),
      Scalars,
      "one table, two readers: a drift in either one fails here"
    );
  });
  Check(Count, "P9: a partial override merges, a bad number falls back, and a cell is unwrapped", () => {
    assert.deepEqual(
      Knobs({ policy: { write: "approve" } }).policy,
      { ...Policy, write: "approve" },
      "a partial override replaces one verdict and keeps the rest"
    );
    assert.equal(Knobs({ digestTail: "nonsense" }).digestTail, 24, "a string is not a tail");
    assert.equal(Knobs({ maxOperations: 99 }).maxOperations, 8, "the prompt states eight, so eight is the ceiling");
    assert.equal(Knobs({ staleAfterDays: 0 }).staleAfterDays, 1, "the day thresholds are floored at one");
    assert.equal(Knobs({ enabled: { get: () => true } }).enabled, true, "a volatile cell is unwrapped before it is read");
  });
  return Finish(Count, "Policy-Defaults");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  await runTest();
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
