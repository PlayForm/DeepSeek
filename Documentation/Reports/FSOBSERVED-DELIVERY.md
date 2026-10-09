# FS/OBSERVED DELIVERY - definitive diagnosis

> One of the four research reports migrated from the pre-restructure flat documentation folder — see also
> `../Handoff/Packages/Package-13.md` (the saga it resolved) and
> `../Handoff/Packages/Package-12.md` (the raw-write tool it concerns).

Date: 2026-10-06 · Read-only research; no family files edited, no commits. Scope: why the
plugin-registered `raw-write` tool's `fs/observed` event never reaches the family's governance
listeners, while the built-in `write`/`edit` tools' events do.

## Verdict

**The event IS delivered. Delivery was never broken.** The `raw-write` emit dispatches on the shared
root event bus and reaches every listener, including the family's. What never happens is a **ledger
outcome**, because the family's own g1 gate rejects the raw-write's _actor_ at step 2 and that
outcome is silent:

- The **live** `mutationTools` value of all three governance modules is
  `[write, edit, str_replace_editor]` - no `"raw-write"`.
- The bundle **patch layers** (`cordis.patch.yml` inside each governance bundle) set `mutationTools`
  explicitly; a patch layer's `config` **replaces the entry config wholesale**, so the schema
  default (which _does_ include `raw-write`, added in commit `3687d11`, 2026-10-05 17:20) is
  shadowed.
- `Gate` step 2 (`dsh-plugin-factory/Source/Function/Gate.ts:47`) returns
  `{ pass: false, reason: "actor" }`, and `Observe` logs **nothing** for that outcome
  (`dsh-package-governor-hook/Source/Function/Observe.ts:47-48` - only `excluded` logs, at :42-44).
  Hence "no gate outcome of any kind appears".
- The root-registration fix in `Wire.ts:39` was aimed at a misdiagnosis (scope isolation); it is
  harmless and arguably the better posture, but it could not fix this.

**Recommendation (one fix):** add `"raw-write"` to `mutationTools` in the three bundle patch
layers - `dsh-package-governor-hook/cordis.patch.yml:21`,
`dsh-package-pinner-hook/cordis.patch.yml:20`, `dsh-cargo-governor-hook/cordis.patch.yml:29` - and
restart. One-line config-manifest edits; zero architecture cost; the existing root-bus wiring then
delivers everything (the `excluded` line, the chain pass, the update stage, `governed`/`pinned`
lines). `mutationTools` is marked volatile (`x-cordis.volatile`), so it can also be hot-edited; for
a durable fix edit the bundle patch files. If the user patch layer
(`~/.dsh/profiles/desktop/cordis.patch.yml`) is used instead, the row must repeat the **full**
config object (patch config replaces wholesale, `dsh-app-boot/lib/index.js:2760`).

## Live proof (this session, current boot = 01:17 local Oct 6, running the post-fix build)

1. Built-in `write` → `/tmp/fso-probe/node_modules/ctrl/package.json`: ledger line
   `skipped (excluded) /tmp/fso-probe/node_modules/ctrl/package.json` at `2026-10-05T22:46:00.328Z`
   in `~/.dsh/governor.log`. Delivery + gate + exclusion logging all work.
2. `raw-write` → `/tmp/fso-probe/node_modules/probe/package.json`: file created successfully, **no**
   ledger line. Reproduces fact 4 exactly.
3. A **second** `raw-write` to the same path succeeded ("Updated file") without a fresh read.
   `dsh-fs-local/lib/index.js:871` throws `FS_NOT_OBSERVED` on `createIfAbsent` + existing file, so
   the intent must have been `replaceIfVersion` with the fresh version - i.e.
   `dsh-fs-observation-policy` (`lib/index.js:90-94`) **received and recorded the first raw-write's
   `fs/observed`**. The emit demonstrably dispatches on the shared bus. Resolves fact 5: the
   "write-grace" comes from the observation policy's per-owner record, fed by the raw-write's
   events.

## Why the dispatch model cannot produce the asymmetry (and doesn't have to)

Single realm, one event bus, no scope filter on plain emits:

- The host boots **one** cordis realm: `dsh-app-boot/lib/index.js:4053`
  (`const ctx = new Context()`; the second context at :4055 is a throwaway startup diagnostics
  context). No other `new Context` exists in the host; no `isolate` usage anywhere in the harness
  (grep over the whole asar); profile bundles mount into the same tree via the Loader
  (`cordis-plugin-loader/lib/index.js:471`, `Entry._init` at :460-462 → `registry.plugin`). Plugin
  contexts prototypally inherit services (`cordis/lib/index.js:1054`, `extend` at :1698): one
  `EventsService` instance for the whole tree.
- `EventsService.dispatch` (`cordis/lib/index.js:258-264`) applies the `Context.filter` **only**
  when the first dispatch argument is an object/function (a `thisArg` carrier, e.g. `scopeTarget`
  for `tools/*`). A plain `emit("fs/observed", target, ...)` has a string first argument →
  `thisArg = null` → **all** hooks on the bus fire, regardless of which context registered them
  (`register`, :334-343).
- Both emitters use the identical plain form: built-in tools
  `ctx.emit("fs/observed", target, {kind:"present",version}, exec)`
  (`dsh-tool-fs/lib/index.js:360,590,743,1031`); the factory's shared executor
  `State.Context.root.emit("fs/observed", Target, {kind:"present",version}, Over.actor)`
  (`dsh-plugin-factory/Source/Function/Write.ts:165-169`; compiled `Target/Function/Write.js` is
  byte-equivalent, built Oct 6 01:00). `dsh-tools` passes the same exec object to every tool
  (`lib/index.js:3136`, `:3310`); the exec carries `.name` = the called name.
- Simulation with the family's own bundled cordis 4.0.4 copy (byte-identical to the asar copy,
  `diff` clean) confirmed: a module-ctx listener hears `root.emit`, a sibling plugin's `ctx.emit`,
  and its own re-emits alike - there is no scope isolation on the bus. The rationale in
  `Wire.ts:4-10` ("a listener registered on one plugin's context hears only that plugin's
  emissions") is **not** a real cordis mechanism; the pre-fix "module-scope registration" also
  delivered fine.

With delivery excluded by code + simulation + the live policy evidence, the only remaining
discriminator between the working control and the silent raw-write is the **gate input**:
`Actor.name` vs the module's live tool list. That is the bug.

## The live `mutationTools` (why fact 6's verification missed it)

- Deployed schema default **includes** `raw-write`:
  `dsh-package-governor-hook/Target/Variable/Config.js` -
  `mutationTools:["write","edit","str_replace_editor","raw-write"]`.
- But the bundle patch layer overrides it: `dsh-package-governor-hook/cordis.patch.yml:21` →
  `mutationTools: [write, edit, str_replace_editor]`. Same in the pinner (:20) and the cargo
  governor (:29).
- Bundle layers compose at boot in `dsh.profile.bundles` order over an empty root, then the user
  patch, then `--patch` overlays (`dsh-app-boot/lib/index.js:460-478`, `bundlePatchFiles` :495,
  `composeEntries` :989-996). Patch `config` replaces the entry's config **wholesale**
  (`dsh-app-boot/lib/index.js:2760`), so the schema default never applies.
- The inspect Config provider projects the plugin's **schema** (defaults), not the resolved entry
  config - that is how the projected list "verified" as `[..., raw-write]` while the live value
  lacks it. The composed `profiles/desktop/cordis.yml` is an empty `[]` (the tree is composed as
  patch layers in memory), and the user `cordis.patch.yml` has no governor rows - the bundle layers
  were the missed place.

## Historical consistency (the ledger, all timestamps UTC)

- `governor.log`/`pinner.log` lines for `raw-write-probe/package.json` (`15:58:42Z`, `19:25:19Z`,
  including `pinned ... (1 versions)`): positive controls - writes through **built-in** tools
  (`write`/`edit` ∈ live list). Two gate passes per round = two built-in events.
- The only `skipped (excluded)` lines (17:34Z, 17:50Z) are built-in writes into `.dsh` paths - actor
  check passes, exclusion check reached.
- No `excluded`/`governed` line ever followed a raw-write: the gate exits at step 2, silently,
  before the exclusion check that is the only logging outcome.

## Expected behavior after the one-line fix

- `raw-write` of a `package.json` outside excluded segments → full chain: the
  `no registry.json found ...` / `governed` lines, the update stage, `pinned` lines.
- `raw-write` into a `node_modules` segment → `skipped (excluded) <path>` - the probe that failed
  live now logs, exactly like the built-in control did.
- No other changes needed: `Wire.ts:39` root registration, the shared executor's root emit, and the
  Stash idempotence gate all stay as they are.
