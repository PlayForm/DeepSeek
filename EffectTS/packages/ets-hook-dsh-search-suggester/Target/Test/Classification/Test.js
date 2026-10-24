import assert from "node:assert/strict";
import { AgentOf, CheckAsync, Finish, MakeCounter, Post, Setup } from "../Harness.js";
const Call = (Run, Id, Pattern, Path_ = "") => Post(Run, { name: "grep", arguments: { pattern: Pattern, path: Path_ }, agent: AgentOf(Id) });
const runTest = async () => {
  const Count = MakeCounter();
  const Run = Setup();
  const Cases = [
    // label, agent, pattern, path, the expected ledger line
    ["Version", "c1", "1.2.3", "package.json", "abstained low-confidence Version 0.84"],
    ["Path", "c2", "/Users/nikola/repo", "", "abstained low-confidence Path 0.66"],
    ["Ledger", "c3", "logFile", "", "abstained no-companions Ledger 0.66"],
    ["Config", "c4", "threshold", "", "abstained low-confidence Config 0.66"],
    ["Dependency", "c5", "peerDependencies", "", "abstained low-confidence Dependency 0.66"],
    ["Test", "c6", "error TS", "", "abstained low-confidence Test 0.66"],
    ["Symbol", "c7", "const Version", "", "abstained low-confidence Symbol 0.66"],
    ["Doc", "c8", "## Heading", "", "abstained low-confidence Doc 0.66"],
    ["Usage", "c9", "hook-dsh-ccr", "", "abstained low-confidence Usage 0.66"],
    ["Owner", "c10", "CONTRIBUTING", "", "abstained low-confidence Owner 0.66"]
  ];
  for (const [Label, Agent, Pattern, Path_, Line] of Cases) {
    await CheckAsync(Count, `C: the ${Label} intent wins its own literal`, async () => {
      await Call(Run, Agent, Pattern, Path_);
      assert.ok(
        Run.Lines.includes(`hook-dsh-search-suggester: ${Line}`),
        `missing ledger line: ${Line}`
      );
    });
  }
  await CheckAsync(Count, "C: equal evidence is broken by the pack priority", async () => {
    const Before = Run.Lines.filter((Line) => Line.includes("Usage")).length;
    await Call(Run, "c11", "README hook-dsh-");
    assert.ok(
      Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Doc 0.66")
    );
    assert.equal(Run.Lines.filter((Line) => Line.includes("Usage")).length, Before);
  });
  await CheckAsync(Count, "C: the higher evidence total beats the priority", async () => {
    await Call(Run, "c12", "1.2.3 version README");
    assert.ok(
      Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.80")
    );
  });
  await CheckAsync(Count, "C: the same call classifies identically twice", async () => {
    const Before = Run.Lines.filter(
      (Line) => Line.includes("low-confidence Version 0.84")
    ).length;
    await Call(Run, "c13", "1.2.3", "package.json");
    await Call(Run, "c14", "1.2.3", "package.json");
    const After = Run.Lines.filter(
      (Line) => Line.includes("low-confidence Version 0.84")
    ).length;
    assert.equal(After - Before, 2);
  });
  return Finish(Count, "Classification");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Classification`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
