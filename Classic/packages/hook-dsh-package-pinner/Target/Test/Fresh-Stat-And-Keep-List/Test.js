import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
  Boot,
  Check,
  Finish,
  Ledger,
  LedgerCount,
  LedgerHas,
  MakeContext,
  MakeCounter,
  LoggerLines,
  Root,
  Race,
  Settle,
  Write,
  token
} from "../Harness.js";
import * as Pinner from "../../../Target/Library.js";
import FactoryClass from "../../../../plugin-dsh-factory/Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  const World = Boot();
  const { ctx, listener, st } = World;
  const actor = { name: "edit" };
  {
    const raceDir = Path.join(Root, "race-before");
    const racePath = Write(
      Path.join(raceDir, "package.json"),
      JSON.stringify({ name: "s", dependencies: { a: "^1.0.0" } })
    );
    FileSystem.writeFileSync(
      racePath,
      JSON.stringify({ name: "s", dependencies: { a: "^1.0.0", authored: "^9.9.9" } })
    );
    const vAuthored = token(racePath);
    const writesAtRace = ctx.writes.length;
    listener(
      { targetKey: "race-before", displayPath: racePath },
      { kind: "present", version: "old-v9" },
      actor
    );
    await Settle(st);
    const Sub = "fresh-stat basis: a file advanced between the observation and the chain is incorporated (the old observed-version refusal is gone by design \u2014 the live fold-abort fix)";
    {
      Check(Count, Sub, () => {
        assert.equal(
          ctx.writes.length,
          writesAtRace + 1,
          "an advanced file no longer aborts the chain (fresh-stat basis, BY DESIGN)"
        );
        const raceWrite = ctx.writes.at(-1);
        assert.deepEqual(
          raceWrite.intent,
          { kind: "replaceIfVersion", version: vAuthored },
          "the chain guarded the CURRENT (fresh-stat) version, not the stale observed 'old-v9'"
        );
        const raced = JSON.parse(raceWrite.content);
        assert.equal(raced.dependencies.a, "1.0.0", "the pass's own pin applied on top");
        assert.equal(
          raced.dependencies.authored,
          "9.9.9",
          "the racing author's dep was read and incorporated (no clobber, no abort)"
        );
        assert.ok(
          LedgerHas(Ledger, `pinned ${racePath} (2 versions)`),
          "the pass's pinned line landed"
        );
        assert.ok(
          !LoggerLines.error.some((l) => l.includes(racePath)),
          "no suppression error for the advanced file"
        );
      });
    }
  }
  {
    const staleDir = Path.join(Root, "stale");
    const stalePath = Write(
      Path.join(staleDir, "package.json"),
      JSON.stringify({ name: "s", dependencies: { a: "^1.0.0" } })
    );
    const staleTarget = { targetKey: "stale", displayPath: stalePath };
    Race.Armed = {
      path: stalePath,
      content: JSON.stringify({ name: "s", dependencies: { a: "^2.0.0", racer: "^3.0.0" } })
    };
    const errsBefore = LoggerLines.error.length;
    const writesAtStale = ctx.writes.length;
    listener(staleTarget, { kind: "present", version: token(stalePath) }, actor);
    await Settle(st);
    const Sub = "stat\u2192write window: a racing write after the fresh stat still fails safely, contained logger-only";
    {
      Check(Count, Sub, () => {
        assert.equal(
          ctx.writes.length,
          writesAtStale,
          "the guarded write was REJECTED \u2014 no clobber"
        );
        assert.equal(
          LoggerLines.error.at(-1),
          "hook-dsh-pinner-package: continuation error (suppressed): FS_STALE_VERSION: " + stalePath,
          "the throw is contained: <module>: continuation error (suppressed)"
        );
        assert.equal(st.Inflight.size, 0, "Inflight cleaned after the contained throw");
        assert.equal(
          LedgerCount(Ledger, `pinned ${stalePath} (1 versions)`),
          0,
          "no pinned line for the rejected pass"
        );
        assert.equal(
          JSON.parse(FileSystem.readFileSync(stalePath, "utf8")).dependencies.a,
          "^2.0.0",
          "the racing write survived intact (no clobber)"
        );
        assert.equal(
          Race.Armed,
          null,
          "the race injector fired exactly once (the chain's fresh stat)"
        );
        assert.ok(errsBefore >= 0, "the error baseline was captured");
      });
    }
  }
  {
    const h1 = Path.join(Root, "keep1");
    const h1Path = Write(
      Path.join(h1, "package.json"),
      JSON.stringify({ dependencies: { tailwindcss: "^3.0.5", react: "^18.0.0" } })
    );
    Write(Path.join(h1, "pin-policy.json"), JSON.stringify({ keep: ["tailwindcss"] }));
    listener(
      { targetKey: "keep1", displayPath: h1Path },
      { kind: "present", version: token(h1Path) },
      actor
    );
    await Settle(st);
    const h1Out = JSON.parse(ctx.writes.find((w) => w.path === h1Path).content);
    FileSystem.unlinkSync(Path.join(h1, "pin-policy.json"));
    const Sub = "keep-list: pin-policy.json protects tailwindcss, others pinned";
    {
      Check(Count, Sub, () => {
        assert.equal(
          h1Out.dependencies.tailwindcss,
          "^3.0.5",
          "the keep-list protects the range as authored"
        );
        assert.equal(
          h1Out.dependencies.react,
          "18.0.0",
          "non-kept packages are pinned in the same pass"
        );
      });
    }
  }
  {
    const globalPolicy = Write(
      Path.join(Root, "global-policy.json"),
      JSON.stringify({ keep: ["g1"] })
    );
    const h2 = Path.join(Root, "keep2");
    const h2Path = Write(
      Path.join(h2, "package.json"),
      JSON.stringify({ dependencies: { g1: "^1.0.0", g2: "^2.0.0", other: "^3.0.0" } })
    );
    Write(Path.join(h2, "pin-policy.json"), JSON.stringify({ keep: ["g2"] }));
    const ctxG = MakeContext();
    new FactoryClass(ctxG);
    const cfgG = Pinner.Config({
      log: true,
      logFile: Path.join(Root, "ledger-keep2.log"),
      policyFile: globalPolicy
    });
    Pinner.apply(ctxG, cfgG);
    const stG = ctxG.__hookDshPinnerPackageState;
    ctxG.events.find((e) => e[0] === "fs/observed")[1](
      { targetKey: "keep2", displayPath: h2Path },
      { kind: "present", version: token(h2Path) },
      actor
    );
    await Settle(stG);
    const h2Out = JSON.parse(ctxG.writes.find((w) => w.path === h2Path).content);
    FileSystem.unlinkSync(Path.join(h2, "pin-policy.json"));
    FileSystem.unlinkSync(globalPolicy);
    const Sub = "keep-list: global policyFile \u222A dir sidecar (the union, not first-wins)";
    {
      Check(Count, Sub, () => {
        assert.equal(h2Out.dependencies.g1, "^1.0.0", "the global policy contributes to the union");
        assert.equal(h2Out.dependencies.g2, "^2.0.0", "the dir sidecar contributes to the union");
        assert.equal(h2Out.dependencies.other, "3.0.0", "unprotected packages pinned");
      });
    }
  }
  {
    const h3 = Path.join(Root, "keep3");
    const h3Path = Write(
      Path.join(h3, "package.json"),
      JSON.stringify({ dependencies: { regkept: "^1.0.0", other: "^2.0.0" } })
    );
    const registryA = Write(Path.join(Root, "registry.json"), JSON.stringify({ effectiveLatest: {} }));
    Write(Path.join(Root, "pin-policy.json"), JSON.stringify({ keep: ["regkept"] }));
    listener(
      { targetKey: "keep3", displayPath: h3Path },
      { kind: "present", version: token(h3Path) },
      actor
    );
    await Settle(st);
    const h3Out = JSON.parse(ctx.writes.find((w) => w.path === h3Path).content);
    FileSystem.unlinkSync(registryA);
    FileSystem.unlinkSync(Path.join(Root, "pin-policy.json"));
    const Sub = "keep-list: the sidecar co-located with the discovered registry.json is absorbed";
    {
      Check(Count, Sub, () => {
        assert.equal(
          h3Out.dependencies.regkept,
          "^1.0.0",
          "the registry-co-located sidecar contributes"
        );
        assert.equal(h3Out.dependencies.other, "2.0.0", "unprotected pinned");
      });
    }
  }
  {
    const h4 = Path.join(Root, "keep4");
    const h4Path = Write(
      Path.join(h4, "package.json"),
      JSON.stringify({ dependencies: { a: "^1.0.0" } })
    );
    const h4Sidecar = Write(Path.join(h4, "pin-policy.json"), "{ nope");
    listener(
      { targetKey: "keep4", displayPath: h4Path },
      { kind: "present", version: token(h4Path) },
      actor
    );
    await Settle(st);
    const h4Out = JSON.parse(ctx.writes.find((w) => w.path === h4Path).content);
    const Sub = "keep-list: unreadable sidecar \u2192 logged line + built-in default";
    {
      Check(Count, Sub, () => {
        assert.ok(
          LedgerHas(Ledger, `unreadable pin-policy.json at ${h4Sidecar} \u2014 using built-in default`),
          "the unreadable-policy line byte-format"
        );
        assert.equal(
          h4Out.dependencies.a,
          "1.0.0",
          "the unreadable source contributes nothing"
        );
        FileSystem.unlinkSync(h4Sidecar);
      });
    }
  }
  {
    const ctxA = MakeContext();
    new FactoryClass(ctxA);
    const ledgerA = Path.join(Root, "ledger-absent.log");
    Pinner.apply(
      ctxA,
      Pinner.Config({
        log: true,
        logFile: ledgerA,
        policyFile: Path.join(Root, "nope-policy.json")
      })
    );
    const h5 = Path.join(Root, "keep5");
    const h5Path = Write(
      Path.join(h5, "package.json"),
      JSON.stringify({ dependencies: { a: "^1.0.0" } })
    );
    ctxA.events.find((e) => e[0] === "fs/observed")[1](
      { targetKey: "keep5", displayPath: h5Path },
      { kind: "present", version: token(h5Path) },
      actor
    );
    await Settle(ctxA.__hookDshPinnerPackageState);
    const h5Out = JSON.parse(ctxA.writes.find((w) => w.path === h5Path).content);
    const Sub = "keep-list: configured-but-absent policyFile is silently not a source";
    {
      Check(Count, Sub, () => {
        assert.equal(
          h5Out.dependencies.a,
          "1.0.0",
          "pinned normally"
        );
        assert.equal(LedgerCount(ledgerA, "unreadable"), 0, "the absent policy logs NOTHING");
      });
    }
  }
  {
    const h6 = Path.join(Root, "keep6");
    const h6Path = Write(
      Path.join(h6, "package.json"),
      JSON.stringify({ dependencies: { leftpad: "^1.0.0", other: "^2.0.0" } })
    );
    const registryB = Write(
      Path.join(Root, "registry.json"),
      JSON.stringify({ effectiveLatest: { leftpad: "1.2.3" } })
    );
    listener(
      { targetKey: "keep6", displayPath: h6Path },
      { kind: "present", version: token(h6Path) },
      actor
    );
    await Settle(st);
    const h6Out = JSON.parse(ctx.writes.find((w) => w.path === h6Path).content);
    for (let i = 0; i < 3; i++) {
      listener(
        { targetKey: "keep6", displayPath: h6Path },
        { kind: "present", version: token(h6Path) },
        actor
      );
      await Settle(st);
    }
    const finalLeftpad = JSON.parse(FileSystem.readFileSync(h6Path, "utf8")).dependencies.leftpad;
    FileSystem.unlinkSync(registryB);
    const Sub = "the P3 interlock: chain names are always in the keep-list \u2014 the governor\xD7pinner ping-pong cannot start";
    {
      Check(Count, Sub, () => {
        assert.equal(
          h6Out.dependencies.leftpad,
          "^1.0.0",
          "the chain key is protected (the governor canonicalizes to ^resolved)"
        );
        assert.equal(h6Out.dependencies.other, "2.0.0", "non-chain packages pinned");
        assert.equal(
          finalLeftpad,
          "^1.0.0",
          "no ping-pong: the chain pin survives repeated passes"
        );
      });
    }
  }
  return Finish(Count, "Fresh-Stat-And-Keep-List");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Fresh-Stat-And-Keep-List`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
