import assert from "node:assert/strict";
import Judge from "../../../Target/Function/Judge.js";
import Parse from "../../../Target/Function/Parse.js";
import { Check, Finish, Make, MakeCounter, Seed } from "../Harness.js";
const Corpus = (Present = [], Pinned = []) => ({
  exists: (Name) => Present.includes(Name),
  pinned: (Name) => Pinned.includes(Name)
});
const Skill = (Name, Extra = "") => `---
name: ${Name}
description: what it does
---

# ${Name}

${Extra}`;
const Op = (Fields) => Fields;
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "R1: a fenced reply parses to its operations", () => {
    const Reply = [
      "```json",
      JSON.stringify({ note: "one lesson", ops: [Op({ op: "patch", name: "a", body: "b" })] }),
      "```"
    ].join("\n");
    const Parsed = Parse(Reply, 8);
    assert.equal(Parsed.ok, true, "the fence is tolerated");
    assert.equal(Parsed.ok === true ? Parsed.proposal.ops.length : -1, 1, "one operation");
    assert.equal(Parsed.ok === true ? Parsed.proposal.note : "", "one lesson", "the note survives");
  });
  Check(Count, "R2: `Nothing to save.` is an empty proposal, not an error", () => {
    const Parsed = Parse('{ "note": "Nothing to save.", "ops": [] }', 8);
    assert.equal(Parsed.ok, true, "it parses");
    assert.equal(Parsed.ok === true ? Parsed.proposal.ops.length : -1, 0, "and carries no operations");
  });
  Check(Count, "R3: an unknown operation kind is a parse FAILURE", () => {
    const Parsed = Parse('{ "ops": [{ "op": "rewrite", "name": "a", "body": "b" }] }', 8);
    assert.equal(Parsed.ok, false, "the closed set is enforced");
    assert.match(Parsed.ok === false ? Parsed.error : "", /unknown operation kind/, "and named");
  });
  Check(Count, "R4: `support` without a file is a parse failure", () => {
    const Parsed = Parse('{ "ops": [{ "op": "support", "name": "a", "body": "b" }] }', 8);
    assert.equal(Parsed.ok, false, "the file is required");
    assert.match(Parsed.ok === false ? Parsed.error : "", /without a `file`/, "and named");
  });
  Check(Count, "R5: more operations than the cap are cut to the cap", () => {
    const Ops = [1, 2, 3].map((Index) => Op({ op: "patch", name: `s${Index}`, body: "b" }));
    const Parsed = Parse(JSON.stringify({ ops: Ops }), 2);
    assert.equal(Parsed.ok === true ? Parsed.proposal.ops.length : -1, 2, "two survive the cap");
  });
  Check(Count, "R6: prose around the object is sliced away", () => {
    const Parsed = Parse('Here is my review:\n{ "ops": [] }\nHope that helps.', 8);
    assert.equal(Parsed.ok, true, "the object is found");
  });
  Check(Count, "R7: a non-object reply is a parse failure", () => {
    const Parsed = Parse("[]", 8);
    assert.equal(Parsed.ok, false, "an array is not a proposal");
  });
  Check(Count, "J1: a non-kebab name is refused", () => {
    const Verdict = Judge(
      { ops: [Op({ op: "create", name: "Bad_Name", body: Skill("Bad_Name") })] },
      Corpus()
    );
    assert.equal(Verdict.rejected[0]?.rule, "name-shape", "the shape rule refuses it");
  });
  Check(Count, "J2: a session-artifact name is refused", () => {
    const Verdict = Judge(
      { ops: [Op({ op: "create", name: "fix-thing-2026", body: Skill("fix-thing-2026") })] },
      Corpus()
    );
    assert.equal(Verdict.rejected[0]?.rule, "name-artifact", "a dated fix name is not a class");
  });
  Check(Count, "J3: create over an existing skill is refused (the write fence's judge half)", () => {
    const Verdict = Judge(
      { ops: [Op({ op: "create", name: "present", body: Skill("present") })] },
      Corpus(["present"])
    );
    assert.equal(Verdict.rejected[0]?.rule, "exists", "a create never overwrites");
  });
  Check(Count, "J4: patch on a missing skill is refused", () => {
    const Verdict = Judge(
      { ops: [Op({ op: "patch", name: "absent", body: Skill("absent") })] },
      Corpus()
    );
    assert.equal(Verdict.rejected[0]?.rule, "missing", "a patch never invents a skill");
  });
  Check(Count, "J5: a pinned skill is off-limits even to a patch", () => {
    const Verdict = Judge(
      { ops: [Op({ op: "patch", name: "present", body: Skill("present") })] },
      Corpus(["present"], ["present"])
    );
    assert.equal(Verdict.rejected[0]?.rule, "pinned", "the pin wins");
  });
  Check(Count, "J6: a body whose frontmatter names another skill is refused", () => {
    const Verdict = Judge(
      { ops: [Op({ op: "patch", name: "present", body: Skill("someone-else") })] },
      Corpus(["present"])
    );
    assert.equal(Verdict.rejected[0]?.rule, "frontmatter", "the body must be this skill's file");
  });
  Check(Count, "J7: incident narration dressed as a rule is refused", () => {
    const Verdict = Judge(
      {
        ops: [
          Op({
            op: "patch",
            name: "present",
            body: Skill("present", "UPDATE: actually the flag was wrong.")
          })
        ]
      },
      Corpus(["present"])
    );
    assert.equal(Verdict.rejected[0]?.rule, "narrative", "a rule must stand without the incident");
  });
  Check(Count, "J8: a negative claim without a fix is refused", () => {
    const Verdict = Judge(
      {
        ops: [
          Op({ op: "patch", name: "present", body: Skill("present", "The formatter is broken.") })
        ]
      },
      Corpus(["present"])
    );
    assert.equal(Verdict.rejected[0]?.rule, "negative-claim", "a constraint is not a lesson");
  });
  Check(Count, "J9: the same claim WITH the fix is accepted", () => {
    const Verdict = Judge(
      {
        ops: [
          Op({
            op: "patch",
            name: "present",
            body: Skill("present", "The formatter is broken until `npm install` runs in the root.")
          })
        ]
      },
      Corpus(["present"])
    );
    assert.equal(Verdict.accepted.length, 1, "the fix makes it a rule");
    assert.equal(Verdict.rejected.length, 0, "and nothing is refused");
  });
  Check(Count, "J10: a support path outside the three kinds is refused", () => {
    const Verdict = Judge(
      {
        ops: [
          Op({ op: "support", name: "present", file: "notes/x.md", body: "x" })
        ]
      },
      Corpus(["present"])
    );
    assert.equal(Verdict.rejected[0]?.rule, "support-path", "only references/templates/scripts");
  });
  Check(Count, "J11: the same operation twice is refused as a duplicate", () => {
    const Op_ = Op({ op: "patch", name: "present", body: Skill("present") });
    const Verdict = Judge({ ops: [Op_, Op_] }, Corpus(["present"]));
    assert.equal(Verdict.accepted.length, 1, "the first lands");
    assert.equal(Verdict.rejected[0]?.rule, "duplicate", "the second is refused");
  });
  Check(Count, "J12: the service's judge reads the LIVE corpus (a seeded directory exists)", () => {
    Seed("seeded-skill");
    const Run = Make();
    const Verdict = Run.Service.Judge({
      ops: [Op({ op: "patch", name: "seeded-skill", body: Skill("seeded-skill") })]
    });
    assert.equal(Verdict.accepted.length, 1, "the seeded directory counts as existing");
  });
  Check(Count, "J13: the service's judge honours a pin set through the service", () => {
    Seed("pinned-skill");
    const Run = Make();
    Run.Service.Pin("pinned-skill");
    const Verdict = Run.Service.Judge({
      ops: [Op({ op: "patch", name: "pinned-skill", body: Skill("pinned-skill") })]
    });
    assert.equal(Verdict.rejected[0]?.rule, "pinned", "the pin reaches the judge");
  });
  return Finish(Count, "Parse-And-Judge");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Parse-And-Judge`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
