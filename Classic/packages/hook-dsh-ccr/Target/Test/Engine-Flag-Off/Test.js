import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  MakeCounter,
  Make,
  Rm,
  Validate,
  Ledger,
  TextBlock,
  Exec,
  NextAccept,
  PlainText
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  const Run10 = Make(Validate({ logFile: Ledger }));
  {
    const Sub = "engine flag OFF (default): no engine runtime is built";
    Check(Count, Sub, () => {
      assert.ok(Run10.State.EngineRuntime === void 0);
    });
  }
  {
    const Sub = "engine flag OFF: NO agent/pre-step listener is registered (the engine's no-op posture; the extra listener is the State builder's P10 volatile-update refresh)";
    Check(Count, Sub, () => {
      assert.ok(
        Object.keys(Run10.Listeners).length === 2 && Run10.Listeners["agent/pre-step"] === void 0
      );
    });
  }
  {
    const Sub = "engine flag OFF: post-execute results are not observed";
    await CheckAsync(Count, Sub, async () => {
      await Run10.Listeners["tools/post-execute"](
        Exec("bash"),
        { isError: false, value: {}, content: TextBlock(PlainText(5e3)) },
        NextAccept
      );
      assert.ok(Run10.State.EngineRuntime === void 0);
    });
  }
  {
    const Sub = "engine flag OFF: no engine ledger lines";
    Check(Count, Sub, () => {
      assert.ok(!Run10.Lines.some((Line) => Line.startsWith("ccr: engine ")));
    });
  }
  Rm();
  const Run4 = Make(Validate({ autoExpand: false, logFile: Ledger }));
  for (const Name of [
    "write",
    "edit",
    "raw-write",
    "subagent",
    "ask_user_question",
    "ccr_retrieve"
  ]) {
    const Sub = `exempt tool '${Name}' passes through byte-identical (no marker, no store)`;
    await CheckAsync(Count, Sub, async () => {
      const Content = TextBlock(PlainText(5e3));
      const Result = { isError: false, value: {}, content: Content };
      const Decision = { kind: "accept" };
      const Out = await Run4.Listeners["tools/post-execute"](
        Exec(Name),
        Result,
        async () => Decision
      );
      assert.ok(Out === Decision);
    });
  }
  {
    const Sub = "exempt tools write NO ledger lines";
    Check(Count, Sub, () => {
      assert.ok(
        !Run4.Lines.some((L) => L.includes("compressed") || L.includes("stored"))
      );
    });
  }
  Rm();
  const Run6 = Make(Validate({ autoExpand: false, logFile: Ledger }));
  {
    const Sub = "a failing result passes through byte-identical with compressFailures=false";
    await CheckAsync(Count, Sub, async () => {
      const Content = TextBlock(PlainText(5e3));
      const Failure = { isError: true, error: { message: "boom" }, content: Content };
      const Decision = { kind: "accept" };
      const Out = await Run6.Listeners["tools/post-execute"](
        Exec("bash"),
        Failure,
        async () => Decision
      );
      assert.ok(Out === Decision);
    });
  }
  {
    const Sub = "a value-carrying accepted decision passes through (content is never replaced)";
    await CheckAsync(Count, Sub, async () => {
      const ValueDecision = { kind: "accept", value: { ok: true } };
      const Out2 = await Run6.Listeners["tools/post-execute"](
        Exec("bash"),
        { isError: false, value: { ok: true }, content: TextBlock(PlainText(5e3)) },
        async () => ValueDecision
      );
      assert.ok(Out2 === ValueDecision);
    });
  }
  {
    const Sub = "a block decision passes through (feedback is never compressed)";
    await CheckAsync(Count, Sub, async () => {
      const BlockDecision = { kind: "block", feedback: [{ type: "text", text: "no" }] };
      const Out3 = await Run6.Listeners["tools/post-execute"](
        Exec("bash"),
        { isError: false, value: {}, content: TextBlock(PlainText(5e3)) },
        async () => BlockDecision
      );
      assert.ok(Out3 === BlockDecision);
    });
  }
  return Finish(Count, "Engine-Flag-Off");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Engine-Flag-Off`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
