import assert from "node:assert/strict";
import FileSystem from "node:fs";
import * as Path from "node:path";
import Apply from "../../../Target/Function/Apply.js";
import {
  CheckAsync,
  Exists,
  FakeLlm,
  Finish,
  Home,
  Make,
  MakeCounter,
  Messages,
  Read,
  Seed
} from "../Harness.js";
const Roots = { skillsRoot: "~/.dsh/skills", archiveRoot: "~/.dsh/skills/.archive" };
const Clean = () => {
  for (const Directory of ["lesson", "skills"]) {
    FileSystem.rmSync(Path.join(Home, ".dsh", Directory), { recursive: true, force: true });
  }
};
const Skill = (Name, Extra = "") => `---
name: ${Name}
description: what it does
---

# ${Name}

${Extra}`;
const Reply = (Name, Extra = "") => JSON.stringify({
  note: "one lesson",
  ops: [{ op: "create", name: Name, body: Skill(Name, Extra), reason: "the run needed it" }]
});
const Snapshot = [
  { role: "user", text: "add the flag to the loader" },
  { role: "assistant", text: "done - the loader takes --flag now" },
  { role: "user", text: "good, remember that the loader reads it before config" }
];
const Agent = { options: { provider: "fake-provider", model: "fake-model" } };
const runTest = async () => {
  const Count = MakeCounter();
  const Case = async (Label, Assertions) => {
    Clean();
    await CheckAsync(Count, Label, Assertions);
  };
  await Case("A1: the shipped posture PROPOSES - nothing lands, the queue grows", async () => {
    const Llm = FakeLlm(Reply("loader-flag"));
    const Run = Make({}, (Context) => {
      Context.llm = Llm;
    });
    const Result = await Run.Service.Review({ Agent, Messages: Snapshot, Session: "s-1" });
    assert.equal(Result.outcome, "proposed", "a review proposes by default");
    assert.deepEqual(Result.applied, [], "nothing applied");
    assert.deepEqual(Result.proposed, ["loader-flag"], "the operation is queued");
    assert.equal(Exists("skills/loader-flag/SKILL.md"), false, "the corpus is untouched");
    assert.equal(Run.Service.Pending().length, 1, "the queue holds it");
    assert.notEqual(Result.report, "", "the run wrote a report");
  });
  await Case("A2: Accept lands a queued proposal and empties its row", async () => {
    const Llm = FakeLlm(Reply("accept-me"));
    const Run = Make({}, (Context) => {
      Context.llm = Llm;
    });
    await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.equal(Run.Service.Pending().length, 1, "queued");
    assert.equal(await Run.Service.Accept("accept-me"), true, "acceptance succeeds");
    assert.equal(Exists("skills/accept-me/SKILL.md"), true, "the file landed");
    assert.match(Read("skills/accept-me/SKILL.md"), /# accept-me/, "with the proposed body");
    assert.equal(Run.Service.Pending().length, 0, "and the queue is empty");
  });
  await Case("A3: write:auto lands the accepted operation itself", async () => {
    const Llm = FakeLlm(Reply("auto-landed"));
    const Run = Make({ policy: { write: "auto" } }, (Context) => {
      Context.llm = Llm;
    });
    const Result = await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.equal(Result.outcome, "applied", "the review applied its own operation");
    assert.deepEqual(Result.applied, ["auto-landed"], "and reports it");
    assert.equal(Exists("skills/auto-landed/SKILL.md"), true, "the file exists");
    assert.equal(Run.Service.Pending().length, 0, "nothing was queued");
  });
  await Case("A4: an agreement operation is ALWAYS queued, even under write:auto", async () => {
    const Llm = FakeLlm(
      JSON.stringify({
        ops: [{ op: "agreement", name: "terse-answers", body: "Answer in one sentence." }]
      })
    );
    const Run = Make({ policy: { write: "auto" } }, (Context) => {
      Context.llm = Llm;
    });
    const Result = await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.deepEqual(Result.proposed, ["terse-answers"], "the agreement is a proposal");
    assert.deepEqual(Result.applied, [], "and never applied");
    assert.equal(Exists("AGENTS.md"), false, "the user's agreement file is untouched");
  });
  await Case("A5: the write fence refuses a create over an existing skill", async () => {
    Seed("taken");
    const Refused = await Apply({ op: "create", name: "taken", body: Skill("taken") }, Roots);
    assert.equal(Refused.ok, false, "the create is refused");
    assert.equal(Refused.ok === false ? Refused.error : "", "exists", "with the fence's reason");
  });
  await Case("A6: the write fence refuses a patch on a missing skill", async () => {
    const Refused = await Apply({ op: "patch", name: "absent", body: Skill("absent") }, Roots);
    assert.equal(Refused.ok, false, "the patch is refused");
    assert.equal(Refused.ok === false ? Refused.error : "", "missing", "with the fence's reason");
  });
  await Case("A7: no llm service is `unavailable`, never a throw", async () => {
    const Run = Make();
    const Result = await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.equal(Result.outcome, "unavailable", "the outcome class is explicit");
    assert.equal(Result.detail, "no llm service", "and the reason is named");
  });
  await Case("A8: no model route is `unavailable`", async () => {
    const Run = Make({}, (Context) => {
      Context.llm = FakeLlm(Reply("never-reached"));
    });
    const Result = await Run.Service.Review({ Agent: {}, Messages: Snapshot });
    assert.equal(Result.outcome, "unavailable", "no route, no call");
    assert.equal(Result.detail, "no model route", "and the reason is named");
  });
  await Case("A9: a provider failure is `failed`, with the cause", async () => {
    const Run = Make({}, (Context) => {
      Context.llm = FakeLlm("", { fail: true });
    });
    const Result = await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.equal(Result.outcome, "failed", "the failure is classified");
    assert.match(Result.detail ?? "", /model call failed: provider exploded/, "with the cause");
  });
  await Case("A10: an unparseable reply is `failed`, not an empty proposal", async () => {
    const Run = Make({}, (Context) => {
      Context.llm = FakeLlm("I could not find anything worth saving today.");
    });
    const Result = await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.equal(Result.outcome, "failed", "a broken reply is a failed review");
    assert.match(Result.detail ?? "", /unparseable reply/, "and says so");
  });
  await Case("A11: `Nothing to save.` is `nothing`, with no queue and no write", async () => {
    const Run = Make({}, (Context) => {
      Context.llm = FakeLlm('{ "note": "Nothing to save.", "ops": [] }');
    });
    const Result = await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.equal(Result.outcome, "nothing", "an explicit empty answer");
    assert.equal(Run.Service.Pending().length, 0, "nothing queued");
    assert.deepEqual(Messages(Run).slice(1), ["lesson: nothing to save"], "and one ledger line");
  });
  await Case("A12: the request carries the digest, the prompt and the agent's route", async () => {
    const Llm = FakeLlm(Reply("routed"));
    const Run = Make({}, (Context) => {
      Context.llm = Llm;
    });
    await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.equal(Llm.Calls.length, 1, "exactly one model call");
    const Request = Llm.Calls[0];
    assert.equal(Request.provider, "fake-provider", "the agent's provider");
    assert.equal(Request.model, "fake-model", "the agent's model");
    const Sent = Request.messages?.[0]?.content?.[0]?.text ?? "";
    assert.match(Sent, /USER: add the flag to the loader/, "the digest is sent");
    assert.match(Sent, /Review the conversation above/, "the prompt is sent");
    assert.match(Sent, /Reply with ONE JSON object/, "including the reply contract");
  });
  await Case("A13: the knobs override the route when they name one", async () => {
    const Llm = FakeLlm(Reply("knob-routed"));
    const Run = Make({ provider: "knob-provider", model: "knob-model" }, (Context) => {
      Context.llm = Llm;
    });
    await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.equal(Llm.Calls[0]?.provider, "knob-provider", "the knob wins over the agent");
    assert.equal(Llm.Calls[0]?.model, "knob-model", "both fields");
  });
  await Case("A14: the proposed-review ledger lines are byte-exact", async () => {
    const Llm = FakeLlm(Reply("ledger-line"));
    const Run = Make({}, (Context) => {
      Context.llm = Llm;
    });
    await Run.Service.Review({ Agent, Messages: Snapshot });
    assert.deepEqual(
      Messages(Run).slice(1),
      ["lesson: queued create ledger-line", "lesson: review proposed (0 applied, 1 queued, 0 refused)"],
      "the queue line then the run line"
    );
  });
  return Finish(Count, "Apply-And-Pending");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Apply-And-Pending`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
