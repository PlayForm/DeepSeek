import assert from "node:assert/strict";
import { Check, Finish, Make, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "N1: a disabled service never comes due", () => {
    const Run = Make({ enabled: false, intervalTurns: 1 });
    const Ticks = [Run.Service.Tick({}), Run.Service.Tick({}), Run.Service.Tick({})];
    assert.deepEqual(
      Ticks.map((Tick) => Tick.due),
      [false, false, false],
      "a disabled service answers but never asks for a review"
    );
    assert.deepEqual(Ticks[0], { due: false, count: 0 }, "the counter stays at zero");
  });
  Check(Count, "N2: the interval fires exactly on its turn and resets", () => {
    const Run = Make({ intervalTurns: 3 });
    const Agent = {};
    assert.equal(Run.Service.Tick(Agent).due, false, "turn 1 is early");
    assert.equal(Run.Service.Tick(Agent).due, false, "turn 2 is early");
    const Due = Run.Service.Tick(Agent);
    assert.equal(Due.due, true, "turn 3 is due");
    assert.equal(Due.count, 3, "the firing tick reports the count it fired on");
    assert.equal(Run.Service.Tick(Agent).due, false, "the counter reset after firing");
    assert.equal(Run.Service.Tick(Agent).count, 2, "and counts again from one");
  });
  Check(Count, "N3: intervalTurns 0 disables the nudge without disabling the service", () => {
    const Run = Make({ intervalTurns: 0 });
    assert.equal(Run.Service.Tick({}).due, false, "no interval, no review");
    assert.equal(Run.Service.Status().total, 0, "the service still answers");
  });
  Check(Count, "N4: Reset clears one agent's counter and leaves the other alone", () => {
    const Run = Make({ intervalTurns: 2 });
    const Left = {};
    const Right = {};
    Run.Service.Tick(Left);
    Run.Service.Tick(Right);
    Run.Service.Reset(Left);
    assert.equal(Run.Service.Tick(Left).due, false, "the reset agent restarts at one");
    assert.equal(Run.Service.Tick(Left).count, 2, "and reaches two on its next turn");
  });
  Check(Count, "N5: each agent counts independently", () => {
    const Run = Make({ intervalTurns: 2 });
    const Left = {};
    const Right = {};
    Run.Service.Tick(Left);
    assert.equal(Run.Service.Tick(Right).due, false, "the second agent is on its own clock");
    assert.equal(Run.Service.Tick(Left).due, true, "the first agent is due on its own count");
  });
  return Finish(Count, "Nudge-Cadence");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Nudge-Cadence`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
