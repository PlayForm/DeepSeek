import assert from "node:assert/strict";
import FileSystem from "node:fs";
import * as Path from "node:path";
import { CheckAsync, Exists, Finish, Home, Make, MakeCounter, Seed } from "../Harness.js";
const Day = 864e5;
const Record_ = (Name, Fields = {}) => ({
  name: Name,
  useCount: 1,
  viewCount: 0,
  patchCount: 0,
  createdAt: Date.now() - 100 * Day,
  lastUsedAt: Date.now() - 40 * Day,
  lastPatchedAt: Date.now() - 40 * Day,
  state: "active",
  pinned: false,
  createdBy: "agent",
  archivedAt: null,
  ...Fields
});
const Store = (Entries) => {
  const Target = Path.join(Home, ".dsh", "lesson", "usage.json");
  FileSystem.mkdirSync(Path.dirname(Target), { recursive: true });
  FileSystem.writeFileSync(Target, JSON.stringify({ version: 1, entries: Entries }), "utf8");
};
const runTest = async () => {
  const Count = MakeCounter();
  await CheckAsync(Count, "C1: an idle agent-created entry goes stale", async () => {
    Store([Record_("idle-skill", { lastUsedAt: Date.now() - 20 * Day })]);
    const Run = Make();
    await Run.Service.Flush();
    const Moved = await Run.Service.Curate();
    assert.deepEqual(Moved.stale, ["idle-skill"], "twenty days is past the stale line");
    assert.equal(Run.Service.Status().stale, 1, "the record says stale");
  });
  await CheckAsync(Count, "C2: a long-idle entry is archived AND its directory moves", async () => {
    Seed("old-skill");
    Store([Record_("old-skill", { lastUsedAt: Date.now() - 40 * Day })]);
    const Run = Make();
    await Run.Service.Flush();
    const Moved = await Run.Service.Curate();
    assert.deepEqual(Moved.archived, ["old-skill"], "forty days is past the archive line");
    assert.equal(Exists("skills/old-skill"), false, "the directory left the corpus");
    assert.equal(Exists("skills/.archive/old-skill/SKILL.md"), true, "and landed in the archive");
  });
  await CheckAsync(Count, "C3: a pinned entry never moves", async () => {
    Store([Record_("pinned-skill", { lastUsedAt: Date.now() - 400 * Day, pinned: true })]);
    const Run = Make();
    await Run.Service.Flush();
    const Moved = await Run.Service.Curate();
    assert.deepEqual(Moved.stale, [], "no transition");
    assert.deepEqual(Moved.archived, [], "no archive");
  });
  await CheckAsync(Count, "C4: a user-created entry is out of the lifecycle's jurisdiction", async () => {
    Store([Record_("hand-written", { lastUsedAt: Date.now() - 400 * Day, createdBy: "user" })]);
    const Run = Make();
    await Run.Service.Flush();
    const Moved = await Run.Service.Curate();
    assert.deepEqual(Moved.archived, [], "authorship is a policy flag, and this one says no");
  });
  await CheckAsync(Count, "C5: a zero-use entry keeps its grace floor", async () => {
    Store([
      Record_("never-used", {
        useCount: 0,
        createdAt: Date.now() - 5 * Day,
        lastUsedAt: Date.now() - 5 * Day
      })
    ]);
    const Run = Make({ staleAfterDays: 3, archiveAfterDays: 3, neverUsedGraceDays: 14 });
    await Run.Service.Flush();
    const Moved = await Run.Service.Curate();
    assert.deepEqual(Moved.archived, [], "zero uses is not proof of disposability");
    assert.deepEqual(Moved.stale, ["never-used"], "but it does go stale");
  });
  await CheckAsync(Count, "C6: Restore brings an archived skill back and reactivates it", async () => {
    Seed("come-back");
    Store([Record_("come-back", { lastUsedAt: Date.now() - 40 * Day })]);
    const Run = Make();
    await Run.Service.Flush();
    await Run.Service.Curate();
    assert.equal(await Run.Service.Restore("come-back"), true, "the move back succeeds");
    assert.equal(Exists("skills/come-back/SKILL.md"), true, "the skill is in the corpus again");
    assert.equal(Run.Service.Status().active, 1, "and its record is active");
  });
  await CheckAsync(Count, "C7: a disabled service curates nothing", async () => {
    Store([Record_("idle-skill", { lastUsedAt: Date.now() - 400 * Day })]);
    const Run = Make({ enabled: false });
    await Run.Service.Flush();
    const Moved = await Run.Service.Curate();
    assert.deepEqual(Moved, { stale: [], archived: [] }, "the switch is the switch");
  });
  await CheckAsync(Count, "C8: the curation line is byte-exact", async () => {
    Store([Record_("stale-one", { lastUsedAt: Date.now() - 20 * Day })]);
    const Run = Make();
    await Run.Service.Flush();
    await Run.Service.Curate();
    const Lines = Run.Lines.map((Line) => Line.replace(/ \(logFile .*\)$/, ""));
    assert.deepEqual(Lines.slice(-2), ["lesson: stale stale-one", "lesson: curated 1 stale, 0 archived"]);
  });
  return Finish(Count, "Curate-Lifecycle");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Curate-Lifecycle`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
