---
title: The CCR family gap report
category: Archive/CCR
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/CCR/CCR-FAMILY-GAP-REPORT.md
index: Documentation/INDEX.md
statuses:
    - name: the ccr hook derivation (Classic + EffectTS)
      state: implemented
      evidence: the derivation commit; both trees; live-proven
    - name: the gap analysis (the derivation checklist)
      state: resolved
      evidence: the report's items closed by the landing
    - name: the ccr live anomalies (the range parameter; the preview header count)
      state: open
      evidence: flagged in the 2026-10-20 live testing
---

# CCR-FAMILY-GAP-REPORT - deriving `dsh-hook-ccr` into Classic + EffectTS

Date: 2026-10-19 (Europe/Sofia). Explorer lane, read-only except this document. Reference bundle:
`Boilerplate/packages/dsh-hook-ccr/` (phases 1-3 built). Derived-bundle targets: `Classic/packages/`
and `EffectTS/packages/` (SPLICE-ETS naming, see below).

## Executive summary (the verdict in 5 lines)

1. **Zero base changes are required in Classic.** Every factory/core surface `dsh-hook-ccr` consumes
   exists verbatim in `Classic/packages/plugin-dsh-factory` and `Classic/packages/lib-dsh-core`
   (same method signatures, same `Activate` composer).
2. **Zero base changes are required in EffectTS.** The `ets-plugin-dsh-factory` keeps `State` (ets
   Library.ts:307), `Append` (:181), `Journal` (:338), and the standalone `Schema` compose helper
   (:133). `Activate` moved to `@playform/ets-base-dsh` (ets-base-dsh Library.ts:37) and is
   **byte-identical** to Boilerplate's core `Activate.ts` (diff verified empty).
3. The ONLY real work is **derivation mechanics**: package renames, import rewrites, a manifest deps
   block, and two new smoke suites. The import rewrites carry three name mappings, and ONE of them
   re-homes `Activate` to the base.
4. ONE Boilerplate-side plumbing fix is worth making. `dsh-hook-ccr/package.json` declares **NO**
   `@playform/dsh-hook-core` / `@playform/dsh-plugin-factory` dependency entries at ALL (it ONLY
   resolves them via workspace hoisting) - see §6.
5. Risk concentration: the EffectTS tree has drifted to `effect: 4.0.5` while SPLICE-ETS pins
   `4.0.2` (§7). ccr's waterfall event `tools/post-execute` comes from `@deepseek-ai/dsh-tools`,
   which is identical in ALL three trees, so NO Effect seam is needed. ccr needs **NO
   Stream/typed-envelope coverage**, ONLY the tracing-hygiene smoke mode.

## 1. The import map

What `dsh-hook-ccr` imports from the base family (grep over
`Boilerplate/packages/dsh-hook-ccr/Source`, ALL other imports are `@deepseek-ai/*`, `node:*`, or
intra-package aliases):

| Import specifier (ccr site)                                                                                                       | Used for                                                                                                     | Classic equivalent                                                                                                                              | EffectTS equivalent                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@playform/dsh-plugin-factory` - `{ Schema as Compose }` runtime (`Source/Variable/Config.ts:35`)                                 | the standalone `Schema(shared?, module?)` compose helper; ccr calls `Compose(false, {...})` (`Config.ts:38`) | `@playform/plugin-dsh-factory` - same named export, used identically by `Classic/packages/hook-dsh-normalize-dash/Source/Variable/Config.ts:35` | `@playform/ets-plugin-dsh-factory` - same named export, `EffectTS/packages/ets-hook-dsh-normalize-dash/Source/Variable/Config.ts:35`                                                                      |
| `@playform/dsh-plugin-factory` - `import type Factory` default (`Source/Interface/Factory.ts:20`, `Source/Interface/State.ts:38`) | the Context augmentation `pluginFactory: Factory` (Factory.ts:25-29)                                         | `@playform/plugin-dsh-factory` (`Classic/.../Interface/Factory.ts:19`)                                                                          | `@playform/ets-plugin-dsh-factory` (`EffectTS/.../Interface/Factory.ts:19`)                                                                                                                               |
| `@playform/dsh-plugin-factory` - `{ State as Shared }` type (`Source/Interface/State.ts:39`)                                      | the shared State shape the ccr State intersects                                                              | `@playform/plugin-dsh-factory` (`Classic/.../Interface/State.ts:33`)                                                                            | `@playform/ets-plugin-dsh-factory` (`EffectTS/.../Interface/State.ts:57`; the type re-export resolves to `@playform/ets-base-dsh`, ets factory Library.ts:118)                                            |
| `@playform/dsh-hook-core` - `{ Activate }` runtime (`Source/Function/Apply.ts:57`)                                                | the activation-ledger-line composer (`Apply.ts:112-120`)                                                     | `@playform/lib-dsh-core` (`Classic/packages/lib-dsh-core/Source/Library.ts:29`)                                                                 | **`@playform/ets-base-dsh`**, not `ets-lib-dsh-core` (`EffectTS/packages/ets-base-dsh/Source/Library.ts:37`; consumed that way by `EffectTS/.../ets-hook-dsh-normalize-dash/Source/Function/Apply.ts:96`) |

Note the EffectTS asymmetry the derivation recipe must honor: in the ets tree, `Activate` (and
`Update`, `Block`, `Chunk`, `StreamGate`) live in the **base** package. `ets-lib-dsh-core` keeps
ONLY the contract helpers (`Section`...`Fullwidth`, ets core Library.ts:32-44) and does **NOT**
re-export `Activate` (grep: zero `Activate` in `ets-lib-dsh-core/Source/Library.ts`). The family's
own evidence: `ets-hook-dsh-normalize-dash` imports `{ Activate, StreamGate as Gate }` from
`@playform/ets-base-dsh` (Apply.ts:96) while importing `Replace, Dashes` from
`@playform/ets-lib-dsh-core` (Replace.ts:13).

Non-family imports stay identical in ALL trees: `@deepseek-ai/cordis`, `@deepseek-ai/dsh-llm`,
`@deepseek-ai/dsh-tools` (which supplies the `tools/post-execute` event types - ccr deliberately
does not re-declare them, Interface/Factory.ts:18-19), `@deepseek-ai/schemastery`, `node:crypto`,
`node:fs`.

## 2. Base-surface comparison

EVERY surface item the ccr bundle consumes, per tree (ALL verified in EACH factory's
`Source/Library.ts`):

| Surface item                                                                                           | Boilerplate (`dsh-plugin-factory`)                          | Classic (`plugin-dsh-factory`)                             | EffectTS (`ets-plugin-dsh-factory`)                                                                                                                                                              | Gap?                                     |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Standalone `Schema(shared?, module?)` compose helper, `false` = minimal block                          | Library.ts:105-120 (comment :98-104)                        | Library.ts:105 (same body, only import-path/comment diffs) | Library.ts:133-149 (identical signature, dashes-style comments)                                                                                                                                  | **No**                                   |
| `State(ctx, config, Setup)` builder - cell unwrap + shared fields + `fields` map + `module`            | Library.ts:235-244 → `Function/State.ts`                    | Classic Library.ts (same method)                           | Library.ts:307-314 → `Function/State.ts` (diff vs Boilerplate = import-path/type-source only)                                                                                                    | **No**                                   |
| `Append(state, message)` ledger - logger + `appendFileSync`, never throws                              | Library.ts:139-141                                          | same                                                       | Library.ts:181-184 (delegates into `LedgerService.use`, the Effect boundary; the module-facing string contract unchanged)                                                                        | **No**                                   |
| `Journal(state, event, path, detail, at?)` storage record                                              | Library.ts:265-267                                          | Library.ts:265-267                                         | Library.ts:338+ (same signature; effect-wrapped best-effort)                                                                                                                                     | **No**                                   |
| Type exports `State`/`Options`/`Gate`/`Transform`/`Output`/`Journal`                                   | Library.ts:90-95                                            | Library.ts:90-95                                           | Library.ts:118-123 (re-exported from `@playform/ets-base-dsh`)                                                                                                                                   | **No**                                   |
| `Activate([["k","v"],...])` composer (core hook)                                                       | `dsh-hook-core/Source/Library.ts:29`                        | `lib-dsh-core/Source/Library.ts:29`                        | `ets-base-dsh/Source/Library.ts:37` - file byte-identical to Boilerplate's (verified: `diff` of the two `Function/Activate.ts` = empty)                                                          | **No** (EffectTS: import source changes) |
| Context augmentation name `pluginFactory`                                                              | factory Library.ts:122+ / `super(Context, "pluginFactory")` | same                                                       | ets factory Library.ts:154-157 (`static inject = ["fs"]`, `super(Context, "pluginFactory")`) - the injector name matches ccr's `inject: ["pluginFactory", "tools"]` (`ccr Source/Library.ts:51`) | **No**                                   |
| Factory machinery ccr deliberately does NOT use (`Wire`, `Attach`, `Govern`, `Write`, `Match`, `Seam`) | present                                                     | present                                                    | present (ets Library.ts:246-260, 278-280; `Govern` steps live in the base registry)                                                                                                              | **No** (absence of use is fine)          |

ccr's exact consumption pattern, for the record:
`Factory.State<State>(Context, Options, { module: "ccr", fields: {16 mappings} })`
(`Apply.ts:76-96`), `State.Factory = Factory` (`:98`), `Factory.Append(State, Activate([...]))`
(`:112-120`), `Factory.Journal(State, "activated", "", ...)` (`:123-129`), later
`State.Factory.Append(State, ...)` for evictions/compressions (`:131`, `:157`, `:166`). ALL of this
is tree-portable unchanged.

## 3. The SPLICE-ETS derivation recipe (as it applies to ccr)

From `Documentation/Archive/Split/SPLICE-ETS.md` (508 lines) and `EffectTS/IMPLEMENTATION-PLAN.md`
(245 lines):

1. **Naming** (SPLICE-ETS §2, :67-121, esp. the post-execution naming note :14-20): the classical
   group is `@playform/hook-dsh-*` + `@playform/plugin-dsh-factory`; the EffectTS group is
   `@playform/ets-*` with the `ets-` pre-pendage + the base `@playform/ets-base-dsh`. So ccr derives
   to `@playform/hook-dsh-ccr` (dir `Classic/packages/hook-dsh-ccr`) and
   `@playform/ets-hook-dsh-ccr` (dir `EffectTS/packages/ets-hook-dsh-ccr`).
2. **Import rewrites** (§4.1 :256-270): the three rules - `@playform/dsh-hook-core` → group core;
   `@playform/dsh-plugin-factory` → group factory; and for EffectTS the **moved-plumbing rule**
   (`Activate`, `Gate`, `Update`, `Stream/*`) → `@playform/ets-base-dsh` (:266-267). For ccr that
   means exactly ONE line changes per tree beyond the two name swaps. The `Activate` import in
   `Source/Function/Apply.ts` moves to the base.
3. **The factory swap**: type-only (`Interface/Factory.ts`, `Interface/State.ts`) and the `Compose`
   import (`Variable/Config.ts:35`) take the group factory name. ccr uses **NO** Effect constructs
   directly. The factory shell stays a cordis `Service`. ALL Effect execution sits behind the four
   boundaries (IMPLEMENTATION-PLAN §1.2 :54-75, §1.4), so the ccr `Apply` body survives
   byte-identically.
4. **Additive EffectTS coverage** (IMPLEMENTATION-PLAN §2 "Smoke parity approach" :164-178;
   smoke-writing skill §4): the Classic assertions are copied byte-identically. The EffectTS suite
   may add coverage ONLY for the Stream pipeline / typed envelope / parallel marker. For ccr, whose
   waterfall is a plain `ctx.on("tools/post-execute", ...)` fiber (Apply.ts:137-141) with NO stream,
   NO queue and NO fork, the honest additive surface is just the **tracing mode**. A run with
   `FACTORY_SMOKE_TRACING=1` must produce byte-identical stdout + ledgers (smoke-writing
   SKILL.md:70-72; the knob exists in `EffectTS/smokes/factory-smoke.mjs:7,136`). A
   Stream/typed-envelope section would be vacuous for ccr - do NOT fabricate ONE (the
   vacuously-green trap).
5. **Smoke placement**: Classic suites live in `Classic/smokes/`, EffectTS suites in
   `EffectTS/smokes/` (SPLICE-ETS §3.2 :219-222, §6 :346-388). EACH suite is the Classic file with
   the import paths pointed at the group's built `Target/Library.js` (IMPLEMENTATION-PLAN :173-175).
   The reference suite is `Boilerplate/smokes/ccr-smoke.mjs` (714 lines; imports
   `../packages/dsh-hook-ccr/Target/Library.js` +
   `../packages/dsh-plugin-factory/Target/Library.js`, lines 7-8). Copy it twice, rewrite the two
   import paths + header comments per §6.2 (:362-380). Note the `Boilerplate/smokes/README.md` does
   NOT yet mention ccr (grep empty) - the totals sentence there will need the ccr row when the
   family rolls it into the canonical counts.
6. **Tracing hygiene rule** (IMPLEMENTATION-PLAN §3 :184-204): default = no-op tracer, zero cost.
   Spans NEVER alter ledger strings, ordering, or timing-sensitive gates. The trace must be
   removable with zero smoke changes. ccr's eviction/compression lines (`Apply.ts:131,157,166`) are
   plain `Append` calls on BOTH ets paths (`LedgerService.use` wraps, NEVER rewrites) - compliant by
   construction.
7. **Build order / gating**: `ets-base-dsh` L0 → group foundations L1 → consumers L2 (§3.3 :230-250,
   §5.1 :308-317). The consumer's built Target imports siblings **by name** with `bundle: false`. So
   the fresh install + `pnpm run build` + `pnpm test` gate is the arbiter (§6.3 :382-388).
8. **Disciplines** (§10 :497-508): `git mv` for ANY moved file. Byte-integrity on ledger strings and
   smoke assertions. NEVER commit (user commits). Documentation-only lanes stay documentation-only.

`EffectTS/IMPLEMENTATION-PLAN.md` adds nothing beyond SPLICE-ETS for this derivation except the §2
smoke-parity details and the §1.5 ledger-string rule ("every string in a module-owned `Lines` const,
byte-identical, asserted verbatim") - ccr already satisfies it via the `Activate` composer +
module-owned strings.

## 4. The gap work list (file-level, per tree)

### (a) Factory packages - **no change needed**

- `Classic/packages/plugin-dsh-factory/`: exposes `Schema` (:105), `State` (same builder method as
  Boilerplate, Library.ts:236-244 region), `Append` (:139-141), `Journal` (:265-267), and the type
  re-exports (:90-95). Nothing to add.
- `EffectTS/packages/ets-plugin-dsh-factory/`: exposes `Schema` (:133), `State` (:307), `Append`
  (:181), `Journal` (:338), types (:118-123). Nothing to add.
- Boilerplate-side base change that would help (optional, plumbing-only): NONE required by ccr
  itself - but see §6 for the ccr manifest fix.

### (b) Core hook packages - **no change needed, one import-source note**

- `Classic/packages/lib-dsh-core/` exports `Activate` (Library.ts:29) - used as-is.
- EffectTS: `Activate` is **NOT** in `ets-lib-dsh-core`. It comes from `@playform/ets-base-dsh`
  (Library.ts:37). The derived `ets-hook-dsh-ccr/Source/Function/Apply.ts` must change line 57 to
  `import { Activate } from "@playform/ets-base-dsh";`. Do **NOT** add an `Activate` re-export to
  `ets-lib-dsh-core`. The base is the single owner of the shared plumbing (SPLICE-ETS §2.3
  dependency rule :135-139). Adding a shim would diverge from the normalize-* precedent.

### (c) Smoke harness/fixtures - **new files, no base changes**

- `Classic/smokes/ccr-smoke.mjs` (NEW): copy `Boilerplate/smokes/ccr-smoke.mjs`, rewrite the two
  imports (`hook-dsh-ccr` / `plugin-dsh-factory` Targets) and the header's package names. Zero
  assertion changes.
- `EffectTS/smokes/ccr-smoke.mjs` (NEW): same copy. Import paths → `ets-hook-dsh-ccr` /
  `ets-plugin-dsh-factory`. Add the tracing-mode run (`FACTORY_SMOKE_TRACING=1` must yield
  byte-identical ledgers) as the sole additive coverage. NO Stream/envelope section for ccr.
- `EffectTS/packages/ets-hook-dsh-ccr` needs the `effect` runtime dep so the factory's Layer graph
  materializes at apply time; the smoke's fake-ctx pattern stays plain (IMPLEMENTATION-PLAN
  :166-169).
- `Boilerplate/smokes/README.md` + the two group READMEs: add the ccr suite rows/totals when the
  family adopts ccr into the canonical counts.

## 5. Package plumbing deltas (the derivation recipe's manifest section)

Compared manifests: `Boilerplate/packages/dsh-hook-normalize-dash/package.json` vs
`Classic/packages/hook-dsh-normalize-dash/package.json` vs
`EffectTS/packages/ets-hook-dsh-normalize-dash/package.json`, applied to ccr:

| Key                              | Boilerplate (ccr today)                                                                                                                                                 | Classic derived                                                                                                                   | EffectTS derived                                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                           | `@playform/dsh-hook-ccr`                                                                                                                                                | `@playform/hook-dsh-ccr`                                                                                                          | `@playform/ets-hook-dsh-ccr`                                                                                                                                             |
| `dependencies`                   | **absent** (see §6 fix)                                                                                                                                                 | `{"@playform/lib-dsh-core":"0.0.1","@playform/plugin-dsh-factory":"0.0.1"}` (mirror Classic normalize-dash :41-44)                | `{"@playform/ets-base-dsh":"0.0.1","@playform/ets-lib-dsh-core":"0.0.1","@playform/ets-plugin-dsh-factory":"0.0.1","effect":"4.0.5"}` (mirror ETS normalize-dash :38-43) |
| `main`/`types`/`exports`/`files` | `./Target/Library.js`, exports `.`, `./cordis.patch.yml`, `./SCHEME.md`, `./package.json`; `files: ["Target","cordis.patch.yml","README.md","SCHEME.md"]`               | identical shape                                                                                                                   | identical shape                                                                                                                                                          |
| `dsh.bundle.patch`               | `"./cordis.patch.yml"`                                                                                                                                                  | same                                                                                                                              | same                                                                                                                                                                     |
| `scripts.prepublishOnly`         | `Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts --TypeScript Configuration/TypeScript.noemit.json && tsc -p tsconfig.json && tsc-alias -f -p tsconfig.json`  | the group convention drops the tsc tail: `Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` (Classic normalize-dash :46) | same group convention (ETS normalize-dash :46)                                                                                                                           |
| devDeps                          | `@playform/build 0.3.4`, `@types/node 26.6.5`, `tsc-alias 1.9.8`, `typescript 7.0.2`, `@deepseek-ai/cordis 4.0.5`, `dsh-llm/dsh-tools 0.2.0-rc.2`, `schemastery 3.18.5` | same versions as Classic normalize-dash (`tsc-alias 1.9.7`, `cordis 4.0.4`, `schemastery 3.18.4`) - align to the group            | align to the ETS normalize-dash set                                                                                                                                      |
| `license`                        | `MIT`                                                                                                                                                                   | Classic group uses `CC0-1.0` (Classic normalize-dash :59)                                                                         | `CC0-1.0`                                                                                                                                                                |
| `repository`                     | absent                                                                                                                                                                  | present (`git+https://github.com/PlayForm/DeepSeek.git`)                                                                          | present                                                                                                                                                                  |
| `publishConfig`                  | absent                                                                                                                                                                  | `{"access":"public","provenance":true}`                                                                                           | same                                                                                                                                                                     |
| `cordis.patch.yml` `name:` field | `@playform/dsh-hook-ccr` (patch :51)                                                                                                                                    | `@playform/hook-dsh-ccr`                                                                                                          | `@playform/ets-hook-dsh-ccr`                                                                                                                                             |

## 6. Boilerplate-side fix worth making (one item)

`Boilerplate/packages/dsh-hook-ccr/package.json` declares **NO** dependency entries for
`@playform/dsh-hook-core` or `@playform/dsh-plugin-factory` (the manifest's ONLY `@playform` entry
is the devDep `@playform/build 0.3.4`, line 27). The imports resolve ONLY through the workspace
hoist, and the packages happen to be linked into `dsh-hook-ccr/node_modules/@playform/` manually.
EVERY existing Boilerplate consumer (e.g. `dsh-hook-normalize-dash`) - wait, it does not: the
Boilerplate normalize-dash manifest also carries them ONLY as hoisted workspace links. The real
hazard is publish-shaped: when ccr is derived into Classic/EffectTS, §5's `dependencies` blocks are
mandatory (exact `0.0.1` sibling pins, SPLICE-ETS §4.2 :277-279). The same explicit entries should
be added to the Boilerplate manifest so the reference package is standalone-installable like the
rest of the family (SPLICE-ETS §5.2 readiness rule :334-337).

## 7. Risks / open questions

1. **Effect version drift**: SPLICE-ETS pins `effect: 4.0.2` exactly across base + 12 ets packages
   (§9.4 :476-478), but the LIVE tree ships `effect: 4.0.5` in
   `ets-plugin-dsh-factory/package.json:32` and the normalize-dash manifest. The derived ccr should
   copy the **LIVE** pin (4.0.5) but flag the SPLICE doc for annotation.
2. **`dsh-hook-ccr` version skew**: ccr is at `0.1.0` while the family siblings are `0.0.1`. Decide
   whether the derived bundles keep `0.1.0` (ccr's own version) or normalize to the group's `0.0.1`.
   Nothing in SPLICE-ETS covers a new bundle's entry version.
3. **Smoke totals bookkeeping**: adding two ccr suites changes the family's 733/746 canonical totals
   quoted in SPLICE-ETS §6.1 and the CI comment lines. The derivation lane must amend the totals
   sentences (the doc treats them as fixed, :350-357).
4. **`Boilerplate/smokes/README.md` gap**: it does NOT yet list the ccr suite. The counts discipline
   (smoke-writing skill §4) assumes the README totals match the suites present.
5. **ccr's `State` extras are non-config fields** (`State.Store`, `State.Factory` assigned
   post-builder, Apply.ts:98-104). The ets `Build` assigns ONLY `Setup.fields` keys. Post-assignment
   on the returned object is tree-portable. The EffectTS smoke should assert the store still works
   through the fiber-hosted factory instance (the L1 `materialize()` runtime) rather than assuming
   the sync-path behavior.
6. **NO `ets-hook-dsh-ccr` exists yet** in `EffectTS/packages/` (dir listing verified) and NO
   `hook-dsh-ccr` in `Classic/packages/`. The derivation is fully greenfield at the bundle level.
   ONLY the bases are shared.

ESCALATION: none - the report is complete against the requested questions.
