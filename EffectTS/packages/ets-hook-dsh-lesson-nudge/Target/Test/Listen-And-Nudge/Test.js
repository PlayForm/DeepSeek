import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  FakeAgent,
  FakeLesson,
  Finish,
  Make,
  MakeCounter,
  Settle,
  Status
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "L1: a `running` transition never ticks the service", () => {
    const Lesson = FakeLesson({ due: true });
    const Run = Make({}, (Context) => {
      Context.lesson = Lesson;
    });
    Status(Run, { agent: FakeAgent(), status: "running" });
    assert.equal(Lesson.Calls.tick.length, 0, "the running edge is not a review moment");
  });
  Check(Count, "L2: an idle transition ticks, and an early turn stops there", () => {
    const Lesson = FakeLesson({ due: false });
    const Agent = FakeAgent();
    const Run = Make({}, (Context) => {
      Context.lesson = Lesson;
    });
    Status(Run, { agent: Agent, status: "idle" });
    assert.equal(Lesson.Calls.tick.length, 1, "the cadence is asked");
    assert.equal(Lesson.Calls.review.length, 0, "and the answer was not due");
    assert.equal(Agent.Tasks.length, 0, "no maintenance task was claimed");
  });
  await CheckAsync(Count, "L3: a due transition reviews INSIDE runMaintenance", async () => {
    const Lesson = FakeLesson({ due: true, snapshot: [{ role: "user", text: "the session" }] });
    const Agent = FakeAgent("session-7");
    const Run = Make({}, (Context) => {
      Context.lesson = Lesson;
    });
    Status(Run, { agent: Agent, status: "idle" });
    await Settle();
    assert.equal(Agent.Tasks.length, 1, "the maintenance phase was claimed");
    assert.equal(Lesson.Calls.review.length, 1, "and the review ran");
    const Input = Lesson.Calls.review[0];
    assert.deepEqual(Input.Messages, [{ role: "user", text: "the session" }], "the service's snapshot");
    assert.equal(Input.Session, "session-7", "the session id is passed through");
    assert.equal(Input.Signal instanceof AbortSignal, true, "the maintenance signal is forwarded");
    assert.equal(Run.Lines.at(-1), "hook-dsh-lesson-nudge: reviewed proposed (0 applied, 1 queued)");
  });
  Check(Count, "L4: a missing lesson service is ONE warn, not a throw per transition", () => {
    const Run = Make();
    const Agent = FakeAgent();
    Status(Run, { agent: Agent, status: "idle" });
    Status(Run, { agent: Agent, status: "idle" });
    assert.equal(Run.Warns.length, 1, "the warn is once per process");
    assert.match(Run.Warns[0], /no lesson service/, "and it names the reason");
    assert.equal(Agent.Tasks.length, 0, "nothing was claimed");
  });
  Check(Count, "L5: the per-session cap stops further reviews", () => {
    const Lesson = FakeLesson({ due: true });
    const Agent = FakeAgent();
    const Run = Make({ maxReviewsPerSession: 1 }, (Context) => {
      Context.lesson = Lesson;
    });
    Status(Run, { agent: Agent, status: "idle" });
    Status(Run, { agent: Agent, status: "idle" });
    assert.equal(Agent.Tasks.length, 1, "one review only");
    assert.ok(
      Run.Lines.some((Line) => Line.includes("cap reached (1 reviews)")),
      "and the cap is in the ledger"
    );
  });
  Check(Count, "L6: an agent that cannot run maintenance is skipped, not crashed", () => {
    const Lesson = FakeLesson({ due: true });
    const Run = Make({}, (Context) => {
      Context.lesson = Lesson;
    });
    Status(Run, { agent: { session: { id: "no-maintenance" } }, status: "idle" });
    assert.ok(
      Run.Lines.some((Line) => Line.includes("skipped (agent cannot run maintenance)")),
      "the skip is named in the ledger"
    );
  });
  Check(Count, "L7: a throwing service never breaks the status emit", () => {
    const Run = Make({}, (Context) => {
      Context.lesson = {
        Tick: () => {
          throw new Error("service exploded");
        },
        Snapshot: () => [],
        Review: async () => ({ outcome: "failed", applied: [], proposed: [] })
      };
    });
    assert.doesNotThrow(() => {
      Status(Run, { agent: FakeAgent(), status: "idle" });
    }, "the listener is fail-open");
    assert.match(Run.Warns[0] ?? "", /the transition passes unnudged/, "and warns");
  });
  Check(Count, "L8: a disabled hook stays registered but never nudges", () => {
    const Lesson = FakeLesson({ due: true });
    const Run = Make({ enabled: false }, (Context) => {
      Context.lesson = Lesson;
    });
    Status(Run, { agent: FakeAgent(), status: "idle" });
    assert.equal(Lesson.Calls.tick.length, 0, "the service is never asked");
    assert.deepEqual(Run.Lines, ["hook-dsh-lesson-nudge: disabled (enabled=false)"], "one proof line");
  });
  Check(Count, "L9: the activation line is byte-exact", () => {
    const Run = Make({ maxReviewsPerSession: 5 });
    assert.deepEqual(
      Run.Lines,
      [`hook-dsh-lesson-nudge: activated (bundle=${"0.2.1"}, cap=5)`],
      "the ledger answers 'did it activate' on its own"
    );
  });
  await CheckAsync(Count, "L10: two agents keep separate caps", async () => {
    const Lesson = FakeLesson({ due: true });
    const Left = FakeAgent("left");
    const Right = FakeAgent("right");
    const Run = Make({ maxReviewsPerSession: 1 }, (Context) => {
      Context.lesson = Lesson;
    });
    Status(Run, { agent: Left, status: "idle" });
    Status(Run, { agent: Right, status: "idle" });
    await Settle();
    assert.equal(Left.Tasks.length, 1, "the first agent reviewed");
    assert.equal(Right.Tasks.length, 1, "and the second had its own budget");
  });
  return Finish(Count, "Listen-And-Nudge");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Listen-And-Nudge`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
