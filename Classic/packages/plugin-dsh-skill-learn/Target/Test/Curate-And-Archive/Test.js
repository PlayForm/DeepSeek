import assert from "node:assert/strict";
import * as Path from "node:path";
import Archive, { Restore } from "../../../Target/Function/Archive.js";
import Curate from "../../../Target/Function/Curate.js";
import { Rows } from "../../../Target/Function/Ledger.js";
import Usage from "../../../Target/Function/Usage.js";
import { CheckAsync, FakeFs, Finish, Home, Knobs, MakeCounter, Seed, State } from "../Harness.js";
const Body = (Name) => `---
name: ${Name}
description: what it does
---

# ${Name}

A step.
`;
const Live = (Name) => Path.join(Home, ".dsh", "skills", Name, "SKILL.md");
const Archived = (Name) => Path.join(Home, ".dsh", "skills", ".archive", Name, "SKILL.md");
const Now = /* @__PURE__ */ new Date("2026-11-02T12:00:00.000Z");
const Day = 864e5;
const Ago = (Days) => new Date(Now.getTime() - Days * Day);
const Scene = async (Tag, Names) => {
  const Fs_ = FakeFs();
  const Configuration_ = Knobs({ ...State(Tag) });
  for (const Name of Names) Seed(Fs_, Name, Body(Name));
  const Store = new Usage(Configuration_.storagePath);
  await Store.Load();
  return { Fs_, Store, Configuration_ };
};
const Record = (Store, Name, Created, Used) => {
  Store.Created(Name, Created);
  Store.Seeded(Name, Created);
  if (Used !== null) Store.Use(Name, Used);
};
const runTest = async () => {
  const Count = MakeCounter();
  await CheckAsync(Count, "R1: a pinned record is skipped entirely, seeding included", async () => {
    const Scene_ = await Scene("r1", ["kept"]);
    Scene_.Store.Created("kept", Ago(40));
    Scene_.Store.Pinned("kept", true);
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.checked, 1, "the record is examined");
    assert.equal(Counts.seeded, 0, "but never seeded");
    assert.equal(Counts.markedStale, 0, "and never moved");
    assert.equal(Counts.archived, 0);
    assert.equal(Scene_.Store.Get("kept")?.state, "active", "the pin is absolute");
    assert.equal(Scene_.Store.Get("kept")?.firstSeenAt, null, "the clock was not anchored either");
  });
  await CheckAsync(Count, "R3: a record with no clock is seeded and does not transition", async () => {
    const Scene_ = await Scene("r3", ["fresh"]);
    Scene_.Store.Created("fresh", Now);
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.seeded, 1, "one full window, never an age from the epoch");
    assert.equal(Scene_.Store.Get("fresh")?.firstSeenAt, Now.toISOString());
    assert.equal(Counts.markedStale, 0, "seeding is not a transition");
    assert.equal(Counts.archived, 0);
  });
  await CheckAsync(Count, "R5: the anchor is the activity stamp, never `createdAt`", async () => {
    const Scene_ = await Scene("r5", ["old-use"]);
    Scene_.Store.Created("old-use", Now);
    Scene_.Store.Seeded("old-use", Now);
    Scene_.Store.Use("old-use", Ago(40));
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.archived, 1, "a fresh creation stamp does not save an old use");
    assert.equal(Scene_.Store.Get("old-use")?.state, "archived");
  });
  await CheckAsync(Count, "R6: a zero-use record inside the grace floor is forced active", async () => {
    const Scene_ = await Scene("r6", ["grace"]);
    Scene_.Store.Created("grace", Now);
    Scene_.Store.Seeded("grace", Now);
    Scene_.Store.State("grace", "stale", Now);
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.reactivated, 1, "zero uses inside the floor is absence of evidence");
    assert.equal(Counts.archived, 0, "so it is never archived");
    assert.equal(Scene_.Store.Get("grace")?.state, "active");
  });
  await CheckAsync(Count, "R7: a record past the archive cutoff is archived", async () => {
    const Scene_ = await Scene("r7", ["aged"]);
    Record(Scene_.Store, "aged", Ago(40), Ago(40));
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.archived, 1);
    assert.equal(Scene_.Store.Get("aged")?.state, "archived");
    assert.equal(Scene_.Store.Get("aged")?.archivedAt, Now.toISOString());
    assert.equal(Scene_.Fs_.Text(Archived("aged")), Body("aged"), "the archive holds the copy");
    assert.equal(
      (Scene_.Fs_.Text(Live("aged")) ?? "").includes("disable-model-invocation: true"),
      true,
      "and the live file is neutralized"
    );
    const Rows_ = await Rows(Scene_.Configuration_);
    assert.equal(Rows_.length, 1, "one ledger row for one transition");
    assert.equal(Rows_[0]?.action, "archive");
    assert.equal(Rows_[0]?.actor, "curator");
  });
  await CheckAsync(Count, "R8: a record past the stale cutoff becomes stale", async () => {
    const Scene_ = await Scene("r8", ["mid"]);
    Record(Scene_.Store, "mid", Ago(20), Ago(20));
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.markedStale, 1);
    assert.equal(Counts.archived, 0, "twenty days is past stale and short of archive");
    assert.equal(Scene_.Store.Get("mid")?.state, "stale");
  });
  await CheckAsync(Count, "R9: a stale record whose anchor moved back becomes active", async () => {
    const Scene_ = await Scene("r9", ["back"]);
    Record(Scene_.Store, "back", Ago(20), Now);
    Scene_.Store.State("back", "stale", Now);
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.reactivated, 1);
    assert.equal(Scene_.Store.Get("back")?.state, "active");
  });
  await CheckAsync(Count, "R10: an archived record is terminal", async () => {
    const Scene_ = await Scene("r10", ["done"]);
    Record(Scene_.Store, "done", Ago(40), Ago(40));
    Scene_.Store.State("done", "archived", Ago(40));
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.archived, 0, "no arm reaches archived");
    assert.equal(Counts.markedStale, 0);
    assert.equal(Scene_.Store.Get("done")?.state, "archived", "only Restore leaves it");
  });
  await CheckAsync(Count, "C1: one transition per pass - a deep record is archived, never staled first", async () => {
    const Scene_ = await Scene("c1", ["jump"]);
    Record(Scene_.Store, "jump", Ago(40), Ago(40));
    const Counts = await Curate(Now, Scene_.Store, Scene_.Fs_, Scene_.Configuration_);
    assert.equal(Counts.markedStale, 0, "R7 fires before R8 and the chain stops there");
    assert.equal(Counts.archived, 1);
    assert.equal(Scene_.Store.Get("jump")?.state, "archived");
  });
  await CheckAsync(Count, "C2: the cutoffs are inclusive and the floor is one day", async () => {
    const Edge = await Scene("c2a", ["edge"]);
    Record(Edge.Store, "edge", Ago(20), Ago(14));
    const Counts = await Curate(Now, Edge.Store, Edge.Fs_, Edge.Configuration_);
    assert.equal(Counts.markedStale, 1, "exactly fourteen days is stale: the cutoff is inclusive");
    const Floor = await Scene("c2b", ["hour"]);
    Floor.Store.Created("hour", Ago(0.04));
    Floor.Store.Seeded("hour", Ago(0.04));
    Floor.Store.Use("hour", Ago(0.04));
    const Floored = Knobs({ ...State("c2b"), staleAfterDays: 0, archiveAfterDays: 0 });
    const FlooredCounts = await Curate(Now, Floor.Store, Floor.Fs_, Floored);
    assert.equal(FlooredCounts.markedStale, 0, "zero is floored to one day");
    assert.equal(FlooredCounts.archived, 0);
    assert.equal(Floor.Store.Get("hour")?.state, "active");
  });
  await CheckAsync(Count, "C3: a second archive of the same skill takes the stamped suffix", async () => {
    const Fs_ = FakeFs();
    const Configuration_ = Knobs({ ...State("c3") });
    const Content = Body("twice");
    Seed(Fs_, "twice", Content);
    const First = await Archive("twice", Fs_, Configuration_);
    assert.equal(First.ok, true, "the first archive landed");
    assert.equal(First.path, Path.join(Home, ".dsh", "skills", ".archive", "twice"));
    Fs_.Put(Live("twice"), Content);
    const Second = await Archive("twice", Fs_, Configuration_);
    assert.equal(Second.ok, true, "the second archive landed");
    assert.match(Path.basename(Second.path), /^twice-\d{14}$/, "a collision takes the 14-digit stamp");
    assert.equal(
      Fs_.Text(Archived("twice")),
      Content,
      "the first copy is never overwritten: every copy is createIfAbsent"
    );
    assert.equal(Fs_.Text(Path.join(Second.path, "SKILL.md")), Content, "and the second copy holds the bytes");
  });
  await CheckAsync(Count, "C4: a flat restore drops the flag, and a live file it did not neutralize is refused", async () => {
    const Fs_ = FakeFs();
    const Configuration_ = Knobs({ ...State("c4") });
    const Content = Body("restored");
    Seed(Fs_, "restored", Content);
    const Archived_ = await Archive("restored", Fs_, Configuration_);
    assert.equal(Archived_.ok, true, "the archive exists");
    const Result = await Restore("restored", Fs_, Configuration_);
    assert.equal(Result.ok, true, "the restore landed");
    assert.equal(Result.outcome, "restored");
    assert.equal(Result.path, Live("restored"));
    assert.equal(Fs_.Text(Live("restored")), Content, "the flag is gone and the bytes are back");
    const Again = await Restore("restored", Fs_, Configuration_);
    assert.equal(Again.ok, false, "a second restore is refused");
    assert.equal(
      Again.outcome,
      "destination-exists",
      "a live file this pass did not neutralize is never clobbered"
    );
  });
  return Finish(Count, "Curate-And-Archive");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  await runTest();
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
