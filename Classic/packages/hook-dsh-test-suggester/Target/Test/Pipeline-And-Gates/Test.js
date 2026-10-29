import assert from "node:assert/strict";
import {
  Call,
  Check,
  CheckAsync,
  Finish,
  LedgerWith,
  LinesWith,
  MakeCounter,
  PreStep,
  Flip,
  Setup,
  Volatile
} from "../Harness.js";
const SUITE_ARGS = {
  file_path: "pkg/Source/Test/Foo/Test.ts",
  hint: "Run-Smokes says PASS"
};
const COUNTS_ARGS = { pattern: "expected count", query: "badge" };
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const Result = await Call(Run, "read", SUITE_ARGS);
    Check(Count, "P1: the suggest line is byte-exact (logger and durable ledger)", () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "test-suggester: suggest Suite 0.65 4 candidates call read"
      ]);
      assert.equal(LedgerWith("suggest Suite 0.65 4 candidates call read").length, 1);
    });
    await CheckAsync(Count, "P1: the note is one labeled frozen notice with the pack targets", async () => {
      const Note = Result.additionalContexts[0];
      assert.deepEqual(Note.source, {
        kind: "test-suggester",
        form: "notice",
        summary: "Suite 0.65"
      });
      assert.equal(
        Note.content[0].text,
        "[test-suggester] intent=Suite confidence=0.65\ntargets (4):\n- Source/Test/<Suite>/Test.ts - the assertion body - the suite that proves it\n- Source/Test/<Suite>/README.md - the expected count and the coverage notes\n- Maintain/Run/Smokes/Index.mjs - the aggregate runner - how the suites are invoked\n- README.md - the badge count, which must match the suite\nnote: one suite per folder: Test.ts asserts, README.md carries the count; Target/ is never edited."
      );
      assert.equal(Object.isFrozen(Note), true);
    });
  }
  {
    const Run = Setup();
    await Call(Run, "grep", COUNTS_ARGS);
    Check(Count, "P2: the Counts intent resolves statically and suggests", () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "test-suggester: suggest Counts 0.55 3 candidates call grep"
      ]);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    const Run = Setup();
    await Call(Run, "read", SUITE_ARGS, Agent);
    await Call(Run, "read", SUITE_ARGS, Agent);
    Check(Count, "P3: a repeat within the cooldown is suppressed with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "suppressed"), [
        "test-suggester: suppressed cooldown Suite"
      ]);
      assert.equal(LinesWith(Run, "candidates call").length, 1);
    });
    const Capped = Setup({ cooldownCalls: 0, maxNotesPerTurn: 1 });
    await Call(Capped, "grep", COUNTS_ARGS, Agent);
    await Call(Capped, "grep", COUNTS_ARGS, Agent);
    Check(Count, "P3: a note beyond the per-turn cap is suppressed", () => {
      assert.deepEqual(LinesWith(Capped, "suppressed"), [
        "test-suggester: suppressed cap Counts"
      ]);
    });
    await PreStep(Capped, Agent);
    await Call(Capped, "grep", COUNTS_ARGS, Agent);
    Check(Count, "P3: a user turn resets the per-turn counter and the note emits again", () => {
      assert.equal(LinesWith(Capped, "candidates call").length, 2);
    });
  }
  {
    const Run = Setup({ exclude: ["Maintain", "README.md"] });
    await Call(Run, "read", SUITE_ARGS);
    Check(Count, "P4: excluded candidates are filtered, the rest suggest", () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "test-suggester: suggest Suite 0.65 1 candidates call read"
      ]);
    });
    const All = Setup({ exclude: ["Source/Test", "Maintain", "README.md"] });
    await Call(All, "read", SUITE_ARGS);
    Check(Count, "P4: a fully excluded candidate set abstains as ambiguous", () => {
      assert.deepEqual(LinesWith(All, "abstained"), [
        "test-suggester: abstained ambiguous Suite 0.65"
      ]);
    });
  }
  {
    const Run = Setup({ maxNoteChars: 60 });
    const Result = await Call(Run, "read", SUITE_ARGS);
    Check(Count, "P5: a note longer than maxNoteChars is truncated with an ellipsis", () => {
      const Text = Result.additionalContexts[0].content[0].text;
      assert.equal(Text.endsWith("..."), true);
      assert.equal(Text.length, 62);
    });
  }
  {
    const Run = Setup();
    const Downstream = { kind: "block", feedback: "no", additionalContexts: [{ marker: "x" }] };
    const Result = await Call(Run, "read", SUITE_ARGS, void 0, Downstream);
    Check(Count, "P6: a block decision keeps its feedback and prepends the note", () => {
      assert.equal(Result.kind, "block");
      assert.equal(Result.feedback, "no");
      assert.equal(Result.additionalContexts.length, 2);
      assert.equal(Result.additionalContexts[0].source.kind, "test-suggester");
      assert.equal(Result.additionalContexts[1], Downstream.additionalContexts[0]);
    });
  }
  {
    const Run = Setup();
    Flip(Volatile(Run, "enabled"), false);
    Run.CtxListeners["loader/volatile-update"]([["enabled"]]);
    const Result = await Call(Run, "read", SUITE_ARGS);
    Check(Count, "P7: after the flip every call passes through unchanged", () => {
      assert.equal(Run.State.On, false);
      assert.equal(LinesWith(Run, "candidates call").length, 0);
      assert.equal(Result.kind, "allow");
    });
  }
  {
    const Run = Setup();
    await Call(Run, "read", SUITE_ARGS);
    await Call(Run, "grep", COUNTS_ARGS);
    Check(Count, "P8: the full scenario performs ZERO fs operations", () => {
      assert.equal(Run.Fs.reads.length, 0);
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.resolved.length, 0);
      assert.equal(Run.Fs.stats.length, 0);
    });
  }
  return Finish(Count, "Pipeline-And-Gates");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Pipeline-And-Gates`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
