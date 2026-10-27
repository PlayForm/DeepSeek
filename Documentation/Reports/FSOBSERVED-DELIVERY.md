---
title: The fs/observed delivery diagnosis
category: Reports
kind: report
date: 2026-10-06
status: complete
registry: Documentation/Reports/FSOBSERVED-DELIVERY.md
index: Documentation/INDEX.md
statuses:
    - name: the fs/observed delivery diagnosis (the asymmetry)
      state: resolved
      evidence: the one-line fix verified live in the same session
    - name: the node_modules skip logging
      state: implemented
      evidence: the excluded-skip line logs like the built-in control
---

# FS/OBSERVED DELIVERY - definitive diagnosis

Status:

- The fs/observed delivery diagnosis (the asymmetry): resolved (the one-line fix verified live in
  the same session)
- The node_modules skip logging: implemented (skipped (excluded) <path> logs like the built-in
  control)

> ONE of the four research reports migrated from the pre-restructure flat documentation folder - see
> also `../Handoff/Packages/Package-13.md` (the saga it resolved) and
> `../Handoff/Packages/Package-12.md` (the raw-write tool it concerns).

Date: 2026-10-06 - Read-only research; NO family files edited, NO commits.

Scope: why the plugin-registered `raw-write` tool's `fs/observed` event NEVER reaches the family's
governance listeners, while the built-in `write`/`edit` tools' events do.

## Verdict

**The event IS delivered.**

**Delivery was NEVER broken.**

The emit of `raw-write` dispatches on the shared root event bus and reaches EVERY listener, the
listeners of the family included.

What NEVER happens is a **ledger outcome**, because the g1 gate of the family rejects the _actor_ of
raw-write at step 2 and that outcome is silent:

- The **LIVE** `mutationTools` value of ALL three governance modules is
  `[write, edit, str_replace_editor]` - NO `"raw-write"`.
- The bundle **patch layers** (`cordis.patch.yml` inside each governance bundle) set `mutationTools`
  explicitly, and a patch layer's `config` **replaces the entry config wholesale**, so the schema
  default (which _does_ include `raw-write`, added in commit `3687d11`, 2026-10-05 17:20) is
  shadowed.
- `Gate` step 2 (`plugin-dsh-factory/Source/Function/Gate.ts:47`) returns
  `{ pass: false, reason: "actor" }`, and `Observe` logs **NOTHING** for that outcome
  (`hook-dsh-package-governor/Source/Function/Observe.ts:47-48` - ONLY `excluded` logs, at :42-44),
  hence "no gate outcome of ANY kind appears".
- The root-registration fix in `Wire.ts:39` was aimed at a misdiagnosis (scope isolation), and it is
  harmless and arguably the better posture, but it could NOT fix this.

**Recommendation (ONE fix):** add `"raw-write"` to `mutationTools` in the three bundle patch
layers - `hook-dsh-package-governor/cordis.patch.yml:21`,
`hook-dsh-package-pinner/cordis.patch.yml:20`, `hook-dsh-cargo-governor/cordis.patch.yml:29` - and
restart.

One-line config-manifest edits; zero architecture cost; the existing root-bus wiring then delivers
everything (the `excluded` line, the chain pass, the update stage, `governed`/`pinned` lines).

`mutationTools` is marked volatile (`x-cordis.volatile`), so it can also be hot-edited, while a
durable fix edits the bundle patch files.

If the user patch layer (`~/.dsh/profiles/desktop/cordis.patch.yml`) is used instead, the row must
repeat the **full** config object (patch config replaces wholesale,
`dsh-app-boot/lib/index.js:2760`).

## Live proof (this session, current boot = 01:17 local Oct 6, running the post-fix build)

1. **The built-in control.**

    Built-in `write` -> `/tmp/fso-probe/node_modules/ctrl/package.json`: ledger line
    `skipped (excluded) /tmp/fso-probe/node_modules/ctrl/package.json` at `2026-10-05T22:46:00.328Z`
    in `~/.dsh/governor.log`.

    Delivery + gate + exclusion logging ALL work.

2. **The raw-write.**

    `raw-write` -> `/tmp/fso-probe/node_modules/probe/package.json`: file created successfully,
    **NO** ledger line.

    Reproduces fact 4 exactly.

3. **The second raw-write.**

    A **second** `raw-write` to the same path succeeded ("Updated file") WITHOUT a fresh read.

    `dsh-fs-local/lib/index.js:871` throws `FS_NOT_OBSERVED` on `createIfAbsent` + existing file, so
    the intent must have been `replaceIfVersion` with the fresh version - i.e.
    `dsh-fs-observation-policy` (`lib/index.js:90-94`) **received and recorded THE FIRST raw-write's
    `fs/observed`**.

    The emit demonstrably dispatches on the shared bus.

    Resolves fact 5: the "write-grace" comes from the observation policy's per-owner record, fed by
    the raw-write's events.

## Why the dispatch model cannot produce the asymmetry (and doesn't have to)

Single realm, ONE event bus, NO scope filter on plain emits:

- The host boots **ONE** cordis realm (`dsh-app-boot/lib/index.js:4053`, where
  `const ctx = new Context()` and the second context at :4055 is a throwaway startup diagnostics
  context), NO other `new Context` exists in the host, NO `isolate` usage exists anywhere in the
  harness (grep over the whole asar), and the profile bundles mount into the same tree through the
  Loader (`cordis-plugin-loader/lib/index.js:471`, `Entry._init` at :460-462 -> `registry.plugin`),
  where plugin contexts prototypally inherit services (`cordis/lib/index.js:1054`, `extend` at
  :1698) with ONE `EventsService` instance for the whole tree.
- `EventsService.dispatch` (`cordis/lib/index.js:258-264`) applies the `Context.filter` **ONLY**
  when the first dispatch argument is an object or a function (a `thisArg` carrier, e.g.
  `scopeTarget` for `tools/*`), so a plain `emit("fs/observed", target, ...)` with a string first
  argument makes `thisArg = null` and **ALL** hooks on the bus fire, regardless of which context
  registered them (`register`, :334-343).
- BOTH emitters use the identical plain form: the built-in tools
  `ctx.emit("fs/observed", target, {kind:"present",version}, exec)`
  (`dsh-tool-fs/lib/index.js:360,590,743,1031`) and the shared executor of the factory
  `State.Context.root.emit("fs/observed", Target, {kind:"present",version}, Over.actor)`
  (`plugin-dsh-factory/Source/Function/Write.ts:165-169`, where the compiled
  `Target/Function/Write.js` is byte-equivalent and built Oct 6 01:00), while `dsh-tools` passes the
  same exec object to EVERY tool (`lib/index.js:3136`, `:3310`) and the exec carries `.name` = the
  called name.
- A simulation with the bundled cordis 4.0.4 copy of the family (byte-identical to the asar copy,
  `diff` clean) confirmed that a module-ctx listener hears `root.emit`, a sibling plugin's
  `ctx.emit`, and its own re-emits alike, so there is NO scope isolation on the bus, and the
  rationale in `Wire.ts:4-10` ("a listener registered on one plugin's context hears only that
  plugin's emissions") is **NOT** a real cordis mechanism, because the pre-fix "module-scope
  registration" also delivered fine.

With delivery excluded by code, simulation, and the LIVE policy evidence, the ONLY remaining
discriminator between the working control and the silent raw-write is the **gate input**
(`Actor.name` vs the LIVE tool list of the module), which is the bug.

## The live `mutationTools` (why fact 6's verification missed it)

- The deployed schema default **includes** `raw-write`:
  `hook-dsh-package-governor/Target/Variable/Config.js` -
  `mutationTools:["write","edit","str_replace_editor","raw-write"]`.
- But the bundle patch layer overrides it at `hook-dsh-package-governor/cordis.patch.yml:21` with
  `mutationTools: [write, edit, str_replace_editor]`, and the pinner (:20) and the cargo governor
  (:29) do the same.
- Bundle layers compose at boot in the `dsh.profile.bundles` order over an empty root, then the user
  patch, then the `--patch` overlays (`dsh-app-boot/lib/index.js:460-478`, `bundlePatchFiles` :495,
  `composeEntries` :989-996), and a patch `config` replaces the config of the entry **wholesale**
  (`dsh-app-boot/lib/index.js:2760`), so the schema default NEVER applies.
- The inspect Config provider projects the **schema** of the plugin (the defaults) and NOT the
  resolved entry config, which is how the projected list "verified" as `[..., raw-write]` while the
  LIVE value lacks it, and the composed `profiles/desktop/cordis.yml` is an empty `[]` (the tree is
  composed as patch layers in memory) while the user `cordis.patch.yml` has NO governor rows, so the
  bundle layers were the missed place.

## Historical consistency (the ledger, all timestamps UTC)

- `governor.log`/`pinner.log` lines for `raw-write-probe/package.json` (`15:58:42Z`, `19:25:19Z`,
  including `pinned ... (1 versions)`): positive controls - writes through **built-in** tools
  (`write`/`edit` in LIVE list). Two gate passes per round = two built-in events.
- The ONLY `skipped (excluded)` lines (17:34Z, 17:50Z) are built-in writes into `.dsh` paths - actor
  check passes, exclusion check reached.
- NO `excluded`/`governed` line ever followed a raw-write: the gate exits at step 2, silently,
  before the exclusion check that is the ONLY logging outcome.

## Expected behavior after the one-line fix

- A `raw-write` of a `package.json` outside the excluded segments runs the full chain: the
  `no registry.json found ...` / `governed` lines, the update stage, and the `pinned` lines.
- A `raw-write` into a `node_modules` segment logs `skipped (excluded) <path>`, so the probe that
  failed LIVE now logs, exactly like the built-in control did.
- NO other change is needed, because `Wire.ts:39` root registration, the root emit of the shared
  executor, and the Stash idempotence gate ALL stay as they are.
