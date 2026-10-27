import assert from "node:assert/strict";
import Telemetry from "../../../Target/Function/Telemetry.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const Step = { type: "step/start", data: { time: 1e3 } };
const Message = (Time, Extra = {}) => ({
  type: "assistant/message",
  data: { time: Time, usage: { outputTokens: 200 }, ...Extra }
});
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "E4: two attempts between the step and the message are counted", () => {
    const One = Telemetry([Step, { type: "assistant/attempt" }, { type: "assistant/attempt" }, Message(3e3)], 0);
    assert.equal(One.Attempts, 2, `attempts ${One.Attempts}`);
  });
  Check(Count, "E4: the latency is the step-to-message distance and the rate follows", () => {
    const One = Telemetry([Step, Message(3e3)], 0);
    assert.equal(One.LatencyMs, 2e3, `latency ${One.LatencyMs}`);
    assert.ok(
      One.TokensPerSecond !== null && Math.abs(One.TokensPerSecond - 100) <= 1e-9,
      `rate ${One.TokensPerSecond}`
    );
  });
  Check(Count, "E4: a missing or empty stream yields a null first-token latency", () => {
    assert.equal(Telemetry([Step, Message(3e3)], 0).FirstTokenMs, null, "no stream field");
    assert.equal(
      Telemetry([Step, Message(3e3, { stream: [] })], 0).FirstTokenMs,
      null,
      "an empty stream"
    );
    assert.equal(
      Telemetry([Step, Message(3e3, { stream: [{ other: 1 }] })], 0).FirstTokenMs,
      null,
      "an absent time0"
    );
    assert.equal(
      Telemetry([Step, Message(3e3, { stream: [{ time0: 1500 }] })], 0).FirstTokenMs,
      1500,
      "the first stream record's time0"
    );
  });
  Check(Count, "E4: utilization is the surface over the window, null when the window is absent", () => {
    const Windowed = Telemetry(
      [Step, Message(3e3), { type: "request/context", data: { contextWindow: 1e3 } }],
      250
    );
    assert.equal(Windowed.ContextWindow, 1e3, `window ${Windowed.ContextWindow}`);
    assert.ok(
      Windowed.Utilization !== null && Math.abs(Windowed.Utilization - 0.25) <= 1e-9,
      `utilization ${Windowed.Utilization}`
    );
    const Blind = Telemetry([Step, Message(3e3)], 250);
    assert.equal(Blind.ContextWindow, null, "the window is absent");
    assert.equal(Blind.Utilization, null, "the utilization is unknown");
  });
  Check(Count, "E4: an unknown shape never throws and the attempts default to one", () => {
    const One = Telemetry(
      [null, 42, { type: "step/start" }, {}, { type: "assistant/message" }],
      0
    );
    assert.equal(One.Attempts, 1, `attempts ${One.Attempts}`);
    assert.equal(One.LatencyMs, null, "no readable times, no latency");
    assert.equal(One.ErrorCode, null, "no failure, no code");
  });
  return Finish(Count, "Telemetry");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Telemetry`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
