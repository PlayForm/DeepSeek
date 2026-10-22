import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
  Check,
  Finish,
  Fire,
  Flip,
  Ledger,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
  rm,
  Validate
} from "../Harness.js";
const Setup = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup({ debounceMs: 1e5 });
    Fire(Run, "/repo/src/a.ts", "1");
    Check(Count, "C1: without an override the Clock is the real clock (a finite stamp)", () => {
      const Entry = Run.State.Watch.get("/repo/src/a.ts");
      assert.equal(Number.isFinite(Entry.lastEventAt), true);
    });
  }
  {
    const Run = Setup({ debounceMs: 100, sweepIntervalMs: 1e3 });
    let Now = 1e3;
    Run.State.Now = () => Now;
    Fire(Run, "/repo/src/a.ts", "1");
    Check(Count, "C2: the watch stamps use the module's Clock, not the wall clock", () => {
      const Entry = Run.State.Watch.get("/repo/src/a.ts");
      assert.equal(Entry.lastEventAt, 1e3);
      assert.equal(Entry.nextSweepAt, 1100);
      assert.equal(Run.State.Sweeps, 0);
      assert.equal(Run.State.LastSweepAt, void 0);
    });
    Now = 1200;
    Fire(Run, "/repo/src/b.ts", "1");
    Check(Count, "C2: the overdue entry is swept at the next event with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "sweep "), [
        "monitor: sweep /repo/src/a.ts (200ms)"
      ]);
      const Entry = Run.State.Watch.get("/repo/src/a.ts");
      assert.equal(Entry.sweeps, 1);
      assert.equal(Entry.lastSweepAt, 1200);
      assert.equal(Entry.nextSweepAt, 2200);
      assert.equal(Run.State.Sweeps, 1);
      assert.equal(Run.State.LastSweepAt, 1200);
    });
    Check(Count, "C2: the sweep line lands in the durable ledger too", () => {
      assert.equal(LedgerWith("sweep /repo/src/a.ts (200ms)").length, 1);
    });
    Now = 1300;
    Fire(Run, "/repo/src/b.ts", "2");
    Check(Count, "C2: a fresh watch re-arms the deadline (no sweep before it)", () => {
      assert.deepEqual(LinesWith(Run, "sweep "), [
        "monitor: sweep /repo/src/a.ts (200ms)"
      ]);
      assert.equal(Run.State.Watch.get("/repo/src/b.ts").nextSweepAt, 1400);
    });
    Now = 2500;
    Fire(Run, "/repo/src/c.ts", "1");
    Check(Count, "C2: both overdue entries sweep, oldest first, one pass", () => {
      assert.deepEqual(LinesWith(Run, "sweep "), [
        "monitor: sweep /repo/src/a.ts (200ms)",
        "monitor: sweep /repo/src/a.ts (1500ms)",
        "monitor: sweep /repo/src/b.ts (1200ms)"
      ]);
      assert.equal(Run.State.Sweeps, 2);
      assert.equal(Run.State.LastSweepAt, 2500);
    });
  }
  {
    const Run = Setup({ debounceMs: 0, sweepIntervalMs: 0 });
    let Now = 100;
    Run.State.Now = () => Now;
    Fire(Run, "/repo/src/a.ts", "1");
    Check(Count, "C3: with a 0 debounce the first event sweeps its own entry (age 0)", () => {
      assert.deepEqual(LinesWith(Run, "sweep "), [
        "monitor: sweep /repo/src/a.ts (0ms)"
      ]);
    });
    Fire(Run, "/repo/src/a.ts", "2");
    Check(Count, "C3: the 0 interval sweeps at every checkpoint", () => {
      assert.deepEqual(LinesWith(Run, "sweep "), [
        "monitor: sweep /repo/src/a.ts (0ms)",
        "monitor: sweep /repo/src/a.ts (0ms)"
      ]);
      assert.equal(Run.State.Watch.get("/repo/src/a.ts").sweeps, 2);
    });
  }
  {
    const Run = Setup({ debounceMs: 1e5, sweepIntervalMs: 1e5 });
    let Now = 1e3;
    Run.State.Now = () => Now;
    Fire(Run, "/repo/src/a.ts", "1");
    Now = 1100;
    Fire(Run, "/repo/src/b.ts", "1");
    Check(Count, "C4: an all-quiet tree costs no sweep lines and no pass count", () => {
      assert.deepEqual(LinesWith(Run, "sweep "), []);
      assert.equal(Run.State.Sweeps, 0);
      assert.equal(Run.State.LastSweepAt, void 0);
    });
  }
  {
    const Run = Setup({ debounceMs: 1e5, maxWatch: 2 });
    Fire(Run, "/repo/src/a.ts", "1");
    Fire(Run, "/repo/src/b.ts", "1");
    Fire(Run, "/repo/src/c.ts", "1");
    Check(Count, "C5: the cap drops the OLDEST entry (the map head)", () => {
      assert.deepEqual([...Run.State.Watch.keys()], ["/repo/src/b.ts", "/repo/src/c.ts"]);
    });
    Check(Count, "C5: each drop is ledgered byte-exactly", () => {
      assert.deepEqual(LinesWith(Run, "capped"), [
        "monitor: capped /repo/src/a.ts (maxWatch 2)"
      ]);
      assert.equal(LedgerWith("capped /repo/src/a.ts (maxWatch 2)").length, 1);
    });
  }
  {
    const Run = Setup({ debounceMs: 1e5, maxWatch: 4 });
    Fire(Run, "/repo/src/a.ts", "1");
    Fire(Run, "/repo/src/b.ts", "1");
    Flip(Run.Raw["maxWatch"], 1);
    Run.CtxListeners["loader/volatile-update"](["maxWatch"]);
    Check(Count, "C6: the volatile flip refreshes the watch bound in place", () => {
      assert.equal(Run.State.MaxWatch, 1);
    });
    Fire(Run, "/repo/src/c.ts", "1");
    Fire(Run, "/repo/src/d.ts", "1");
    Check(Count, "C6: the new bound applies on the next events with the capped line", () => {
      assert.deepEqual([...Run.State.Watch.keys()], ["/repo/src/d.ts"]);
      assert.ok(LinesWith(Run, "capped").includes("monitor: capped /repo/src/b.ts (maxWatch 1)"));
      assert.ok(LinesWith(Run, "capped").includes("monitor: capped /repo/src/c.ts (maxWatch 1)"));
    });
  }
  {
    const BuiltDir = new URL("../../../Target/Function/", import.meta.url);
    const Files = FileSystem.readdirSync(BuiltDir).filter((F) => F.endsWith(".js"));
    const Sources = new Map(
      Files.map((F) => [
        F,
        FileSystem.readFileSync(new URL(F, BuiltDir), "utf8")
      ])
    );
    Check(Count, "C7: the built library contains NO setTimeout or setInterval", () => {
      for (const [Name, Source] of Sources) {
        assert.equal(/setTimeout|setInterval|setImmediate/.test(Source), false, Name);
      }
    });
    Check(Count, "C7: the clock fallback to Date.now() is present in the built Clock", () => {
      assert.equal((Sources.get("Clock.js") ?? "").includes("Date.now()"), true);
    });
  }
  return Finish(Count, "Watch-Sweep-Clock");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Watch-Sweep-Clock`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
