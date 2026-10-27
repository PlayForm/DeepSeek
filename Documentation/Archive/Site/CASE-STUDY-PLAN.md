---
title: The Case Study Dimension plan
category: Archive/Site
kind: one-shot-record
date: 2026-10-07
status: complete
registry: Documentation/Archive/Site/CASE-STUDY-PLAN.md
index: Documentation/INDEX.md
statuses:
    - name: the case-study research
      state: implemented
      evidence: the case-study narrative page; the 8-phase arc
    - name: the third-pass agent's output
      state: implemented
      evidence: the 13-row decision table and the lessons
    - name: the WHY-emphasis mandate
      state: resolved
      evidence: Documentation/Reports/CASE-REVIEW.md assessed the structural rationale
    - name: the attributed smoke totals (733 Classic / 746 EffectTS)
      state: implemented
      evidence: the page cites the attributed pair
---

# CASE-STUDY-PLAN - The Case Study Dimension

> One of the planning documents migrated to `Documentation/Plans/`.
>
> It holds the plan for the third dimension of the Site: the development story of the family as a
> case study that combines the integration techniques and showcases the decisions.
>
> The research agent wrote it in a read-only pass, and the third pass agent implements it.
>
> Sources: the Documentation handoff (`Documentation/Handoff/`, Packages 1-13), `git -C ~/.dsh log`
> (the boilerplate era chain), the docs reports (`Documentation/Reports/`: Commonalization-AUDIT,
> FSOBSERVED-DELIVERY, P5-V2-DIAGNOSIS, FileContent-FLAVOR-DESIGN), the plans
> (`Documentation/Plans/`: DSH-MONOREPO-PLAN), the brand brief (`Documentation/Brand/`: BRANDING),
> and the current state of the Site (`Site/Source/pages`, `Component`, `Layout`, `Reference/`).

---

## 1. THE STRUCTURE RECOMMENDATION

**One narrative page (`/case-study/`), not a section per phase.**

The arc is chronological and interlocking, because the decisions of each phase come from the
findings of the phase before, so per-phase pages would lose the through-line.

The page gets an in-page phase index (anchor links in a sticky badge row under the hero, matching
the eyebrow-row pattern of the Site) plus outbound links to the existing pages that demo the
technique in question.

- **Nav.**

    Add `{ Href: "/case-study/", Label: "Case Study" }` to the `Nav` array in
    `Site/Source/Layout/Base.astro`; between Models and Workbench reads best. The entry also appears
    in the footer links automatically. Reuse the existing `Current()` logic, which needs no change.

- **Length.**

    The page has about 8 sections of 200-400 words each, plus one artifact per section (a ledger
    excerpt, a table, or a before/after pair). The total page is about the size of `workbench.astro`
    (≤500 lines).

- **Tone - "truthfully".**

    The tone is technical, honest, and decision-focused. Every challenge states what actually
    happened (including the misdiagnoses and the live-only failures), then the decision, the
    technique, and the outcome. No marketing gloss covers the failures, because the misdiagnoses are
    the story: the two wrong theories of the fs/observed saga, the silent P5 open, and the shadowed
    config.

## 2. THE NARRATIVE ARC (the page's sections, in order)

### §0 Overview (hero)

The hero holds one paragraph.

The family grew from 5 bundles and 231 smoke checks (Package 2) to 12 packages and about 800 checks
(Package 13) across one commit era (`b259652 → 5982aa8`, all of Oct 3-6, 2026).

The smokes arbitrated every step, and live testing found every real bug, not the smokes.

The badges are `12 PACKAGES`, `12 SMOKE SUITES`, and `DUAL RELEASE`.

### §1 Phase I - The boilerplate era (the factory + the governance trio)

The setup had three independent hooks (package-governor, package-pinner, cargo-governor) plus the
mdash.

They were consolidated onto one factory service (15 methods), one transform contract, and
module-owned ledger strings.

_Source_: Handoff Package-01-03, Package-05; commits `49e5b3d`, `859f16a`, `018919c`.

- **Beat: challenge → decision → technique → outcome.**

    Duplicated machinery across four hooks led to building the factory as the service. The work
    added the `Wire`/`Attach`/`Continue` seam trio and the transform leaf contract. The outcome was
    5 green bundles, 231 checks, and byte-identical ledger strings.

- _Site mapping_.

    Link plugins.astro and the plugin pages, because the Seams table component exists for exactly
    this case. Link the factory plugin page's 15→16→17 method arc.

### §2 Phase II - The audit findings & the fixes

The confirmation agent raised three criticals (Package 4-REV): the `.d.ts` alias leak (TS2310
circular bases), the nondeterministic build (the unawaited `exec()` race), and the live Inflight
collision of the governor.

Then came the executed queue: the Module rename, the Schema helper, the type-import flip, the
`@playform/lib-dsh-core` extraction, and the P4 granularization.

_Source_: Handoff Package-04 (REV), 09, 09-REV; commits `28ebc30`, `3c29108`, `060e3b6`, `1ed3564`,
`c6a72ce`, `1fef4ca`, `e78c05c`, `711d5b2`.

- **Beats (each a decision card).**

    Type-only imports are erased, so the posture that only Config imports the factory survives the
    flip. The smoke-recovery pattern: the /tmp smokes were lost once and replayed from the session
    archives, and they are archived to `~/.dsh/smokes/` from then on.

- _Site mapping_.

    Use a Card grid of "finding → fix" pairs with a badge per finding (`TYPE-ONLY`, `P0`, `P1`).

### §3 Phase III - Going live (the P5 journal saga)

The first live battery (Package 10) covered the interlock, real `cargo upgrade` jobs, and the mdash
counts.

It produced the P5 finding: the harness storage domain allows one open per name, so the shared
domain was single-winner per boot.

The fix was the SharedJournal sink (`952eaa1`) plus the PendingJournal boot-window buffer
(`aa53c91`), and live testing confirmed it on the third boot (Package 10-FINAL).

_Source_: Handoff Package-10-10-FINAL.

- **Beat.**

    The human ledgers remained the complete record while the structured journal silently lost
    modules. The fix was the three-stage routing: shared sink → pre-bind buffer → per-State
    fallback.

- _Site mapping_.

    Use Terminal blocks that show the actual journal records from Package 10-FINAL (the
    `activated`/`governed`/`dispatched` lines). Add a before/after pair: "one module's records"
    versus "all four modules' records".

### §4 Phase IV - The stream family (six flavors + the gate)

The mdash generalizes into the normalize family: core machinery that is generic over structural
shapes, with no dsh-llm dependency because a durable design replaced the symlink workaround.

The phase added five new flavor bundles, the tool-args gate, and then the three-way gate.

The edit exemption is live-proven, and the per-call raw marker is smoke-verified but unreachable, as
the document states honestly.

_Source_: Handoff Package-11-12; commits `98be27b`, `c2beb06`, `ad4c2c3`, `68afdcd`, `1d827ad`,
`9d6e195`, `bb9a6fd`.

- **Beat.**

    The system normalized itself: the comment prose of the agents came out hyphenated. The user
    canceled the cosmetic pass, with the rule that em dashes appear only in README examples and
    never in code.

- _Site mapping_.

    Link workbench.astro and matrix.astro, the interactive demos of exactly this phase. Add
    before/after payload pairs like the RawPayload/CleanPayload pair of matrix.astro.

### §5 Phase V - The raw-write saga, commonalization & granular control

This is the densest phase (Package 13), and it began with the raw-write tool and the fs/observed
interlock failure.

Two misdiagnoses (emit-context and listener-scope) fell to FSOBSERVED-DELIVERY: "the event IS
delivered; the gate rejects the actor".

The real blocker was the patch-layer shadowing of `mutationTools`.

The phase then added the mdash→normalize-dash rename, normalize-file, and the P5 v2 migration
failure with its fix (per-record layout, `compatibleVersions: [1]`,
`invalidRecords: "backup-and-skip"`, and the LOUD failure line).

It closed with the shared write executor (the 17th method `Write`), the Update envelope, the
Activate composer, the granular flags (`normalize`, `govern`), the governance marker, the sequential
fold, and the fresh-version stat.

_Source_: Handoff Package-13; commits `b259652 → 5982aa8`; reports `Documentation/Reports/` -
FSOBSERVED-DELIVERY, P5-V2-DIAGNOSIS, Commonalization-AUDIT, FileContent-FLAVOR-DESIGN.

- **Beats.**

    The three-executors table of the Commonalization-AUDIT led to one shared executor. The fold race
    (`d7a3c93`) hid a deeper bug: every step wrote `replaceIfVersion(<the SAME observed version>)`,
    so only the first write could succeed. The stat-before-write guard (`5982aa8`) fixed it.

- _Site mapping_.

    Use a Seams table for the five-step write pipeline (resolve → write-intent → policy → writeText
    → fs/observed), with the three executors as rows that converge. Use Terminal blocks for the live
    matrix outcomes: no flag → no chain; `govern: ["canonicalize","pin"]` → governed and pinned with
    no dispatch; `govern: true` → the full chain.

### §6 Phase VI - The releases, the monorepo & the Site

The phase covered the dual-release strategy (Classic and EffectTS from one boilerplate,
DSH-MONOREPO-PLAN §1), the anonymization and the Aphrodite README borrow (#12), and the Effect-TS
mapping (#13: the Stream gate, the services and layers, the tracing).

It added the parallel-govern toggle designed in from the start (#14), the reversed hierarchical
naming (#15, the @-sentences), version 0.0.1, the submodules (#16), and the Site itself as the
integration showcase.

_Source_: Handoff Package-12 (REV) / Package-13; `Documentation/Plans/DSH-MONOREPO-PLAN.md`;
`Documentation/Brand/BRANDING.md`.

- _Site mapping_.

    Link versions.astro, where the dual-engine cards exist, and brand.astro.

### §7 The decision index (the showcase table)

The section holds a summary table, the payoff of the page.

The columns are **Decision | Rationale | Technique (the seam it lives in) | Evidence**.

The working-lessons strip follows (below).

### §8 The working lessons (the honest close)

The lessons start with the smoke/live fidelity gap: live testing found every real bug.

Load order is not profile-list order.

The timestamp confusion (epoch UTC versus local +03) also appears.

The subagent quirks include normalization, one file per response, and the crash pattern.

The meta-lesson is the patch-layer shadowing: verify the live effective config, never just the
schema projection.

_Source_: Handoff Package-05, 12, 13 "working lessons", collected in
`Documentation/Handoff/Lessons.md`.

## 3. THE DECISION INDEX (§7's rows - the canonical list)

| #   | Decision                                                                                                     | Rationale                                                                                                                                                                                                        | Technique / seam                                                                                                                              | Evidence                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Module-owned ledger strings; smokes as the arbiter                                                           | Byte-identical strings make renames safe and behavior provable; the literal `activated (cargo flavor, ...)` survives every refactor                                                                              | The transform contract + smoke harness; renames change mechanics, never strings                                                               | Handoff Package-02 / Package-05.5, Package-04.1; `3c29108`, `e106a98`, `66bfd81` |
| 2   | Stat-before-write version guard                                                                              | In a multi-step fold every step wrote against the SAME observed version - only the first write could succeed; the fresh stat makes the fold converge in ANY step order                                           | GuardedWrite / `replaceIfVersion` intent + U₂ refresh                                                                                         | `5982aa8`; Handoff Package-13 §8                                                 |
| 3   | Wrapped-actor governance marker + the direct path                                                            | The raw-write's actor carries `{...exec, govern}`; the gate's `govern` reason makes direct governance the ONLY channel (event path skips marked actors); no flag → no chain (the escape hatch)                   | The Gate's actor step + `Factory.Govern` (17th-method era) + `GovernSteps` registry                                                           | `2c8764e`, `83ba8e5`, `e69c5d3`; Handoff Package-13 §7                           |
| 4   | The sequential fold (await each step's chain); #14 parallel toggle designed but gated                        | Detached chains raced (nondeterministic writes); same-file steps (canonicalize+pin on one package.json) DO race - parallel only when disjointness is proven                                                      | The direct-govern fold in the write executor's continuation                                                                                   | `d7a3c93`, `140faa0`; register #14                                               |
| 5   | Per-record P5 domain + the loud failure line                                                                 | The v2 open failed silently against the v1 file (exact-equality version check) and buffered every record into a never-drained buffer; silence made it undiagnosable                                              | Storage domain v2 spec: `layout:"per-record"`, `compatibleVersions:[1]`, `invalidRecords:"backup-and-skip"` + one ledger line on open failure | `4c0e83b`, `756d566`; P5-V2-DIAGNOSIS                                            |
| 6   | Patch layers carry the live config (add `raw-write` to the three bundle patch layers)                        | Patch config REPLACES entry config wholesale, shadowing schema defaults; the Config inspect provider projects the SCHEMA - the verification blind spot                                                           | `cordis.patch.yml` bundle layers + `mutationTools` gate input                                                                                 | `affa730`; FSOBSERVED-DELIVERY                                                   |
| 7   | Explicit tools over background rewriters                                                                     | Background rewriting breaks the edit old-string contract and interleaves with bounded passes (the hermes `normalize-tabs.sh` cautionary tale); normalize-file is visible, opt-in, no-op → no write               | The tools seam (`ctx.tools.register`) + the stream gate's name-exemption                                                                      | FileContent-FLAVOR-DESIGN; `48f9515`                                             |
| 8   | One shared write executor owned by the factory                                                               | Three executors duplicated the same five-step pipeline (resolve → write-intent → policy → writeText → fs/observed); the factory is the only home both tool-style and continuation-style writes already depend on | `Factory.Write` (the 16th→17th-method arc; GuardedWrite as the guarded alias)                                                                 | Commonalization-AUDIT; `91293d2`                                                 |
| 9   | The core as pure delegate; the stream dispatch durably dependency-free                                       | A cross-bundle symlink workaround for a nominal-type clash was fragile; generic structural shapes survive every narrowing                                                                                        | `Stream/Chunk` + `Stream/Block` (no dsh-llm import)                                                                                           | `98be27b`, `c2beb06`; Handoff Package-11                                         |
| 10  | Host-era pins; verify from app.asar, never the stale node_modules; the registry's `latest` dist-tag is stale | The @deepseek-ai family pins must match the running host                                                                                                                                                         | The dependency-pin discipline                                                                                                                 | register #11; Handoff Register #11                                               |
| 11  | Dual release: Classic live-first, EffectTS ships only after smokes prove parity                              | Keep the working implementation onboard; the ledger strings stay the contract in BOTH implementations                                                                                                            | The Stream gate, the services + layers, the tracing spans                                                                                     | register #13; DSH-MONOREPO-PLAN; versions.astro                                  |
| 12  | The reversed hierarchical naming + version 0.0.1 + submodules                                                | Names read as `@`-sentences and group alphabetically; one repo per package                                                                                                                                       | Package naming; the monorepo layout                                                                                                           | registers #15/#16; BRANDING §2                                                   |

## 4. THE INTEGRATION-TECHNIQUES COMBINATION (how each decision is presented THROUGH its seam)

The "Technique" column of every decision row links to the seam it lives in.

The section that tells the decision embeds the mechanics of the seam inline, because the case study
never describes a decision in the abstract.

- **llm/stream waterfall → decisions 7, 9, 11.**

    The seam covers the dispatch of the flavors, the three-way tool-args gate (edit, raw-write, and
    normalize-file pass by identity, and the raw marker is stripped), and the
    passthrough-by-identity of Chunk/Block. Demo: workbench.astro, matrix.astro.

- **fs/observed → decisions 1, 2, 6.**

    The seam covers the trigger of the governance hooks, the raw-write interlock, and the per-owner
    record of the observation policy (the write-grace). Demo: the §5 Seams table.

- **tools → decisions 3, 7.**

    The seam covers `ctx.tools.register` (raw-write, normalize-file), the actor gate, and the
    mutationTools list.

- **the write executor → decisions 2, 3, 4, 8.**

    The seam covers the five-step shared pipeline, the P4 fence versus the standing policy, and the
    Stash idempotence gate.

- **storage domain → decision 5.**

    The seam covers single-open enforcement, the v2 migration, and the three-stage routing. Demo:
    the §3 journal excerpts.

- **jobs → the update stage as a real harness job.**

    The seam covers the governor-update dispatch and the awaited promise that resolves at dispatch,
    never awaiting the job. Demo: the §3 live battery lines.

The plan names three inversions explicitly.

The actor gate inverts the event path into a direct path (decision 3).

The schema-default versus patch-layer inversion caused decision 6.

The user's "defaults off, profile on" pattern is the third (`1d827ad`).

## 5. CONTENT MAPPING (section → source → page/component → style)

| Section             | Primary source                                                                                                                  | Site target                                  | Style elements                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| §0 Overview         | Handoff Package-02 + Package-13 (smoke counts)                                                                                  | new `pages/case-study.astro`                 | PageHero; Badge row (`12 PACKAGES`, `DUAL RELEASE`)                                                             |
| §1 Boilerplate era  | Handoff Package-01-03, 05; `49e5b3d`, `859f16a`                                                                                 | links to plugins.astro + factory plugin page | Seams table (the 15-method surface); Card grid of the 5 original bundles                                        |
| §2 Findings & fixes | Handoff Package-04 (REV), 09; P6 pitfalls 20-25                                                                                 | case-study page                              | finding→fix Card pairs; Badge per finding; Terminal for the `28ebc30` fix commit chain                          |
| §3 Going live       | Handoff Package-10-10-FINAL                                                                                                     | case-study page                              | Terminal blocks with real journal records; before/after pair (1 module vs 4 modules); the jobs envelope callout |
| §4 Stream family    | Handoff Package-11-12; `98be27b`...`9d6e195`                                                                                    | links to workbench + matrix                  | before/after payload pairs (RawPayload/CleanPayload pattern); flavor Badge strip                                |
| §5 Saga & control   | Handoff Package-13; FSOBSERVED-DELIVERY; P5-V2-DIAGNOSIS; Commonalization-AUDIT; FileContent-FLAVOR-DESIGN; `b259652 → 5982aa8` | case-study page                              | Seams table (the 5-step pipeline × 3 executors); Terminal for the live matrix; challenge→decision→outcome Cards |
| §6 Releases & site  | DSH-MONOREPO-PLAN; BRANDING; registers #12-#16                                                                                  | links to versions.astro + brand.astro        | the two version Cards reused; the @-sentence motif                                                              |
| §7 Decision index   | §3 table above                                                                                                                  | case-study page                              | the summary table (the Seams table component generalized, or a dedicated table)                                 |
| §8 Lessons          | Handoff Package-05, 12, 13 "working lessons" (`Documentation/Handoff/Lessons.md`)                                               | case-study page                              | short Muted Cards, one per lesson; no decoration (the BRANDING clean-header rule)                               |

## 6. IMPLEMENTATION NOTES (for the third pass agent)

- **New files.**

    The work creates `Site/Source/pages/case-study.astro`, plus optionally
    `Component/Decision.astro` for the challenge→decision→technique→outcome card and
    `Component/Beat.astro` if the finding→fix pairs repeat. Prefer extending
    `Card`/`Seams`/`Terminal` first, and add a component only if a pattern repeats ≥3 times.

- **BRANDING constraints.**

    Keep blue and white only, clean headers, and no decoration. The existing tokens in
    `Stylesheet/Global.css` (`--space-*`, `--color-*`) cover everything, so no new colors are
    necessary.

- **Terminal reuse.**

    `Terminal.astro` takes `Command` + `Label`, which makes it usable for ledger excerpts through
    `Label="LEDGER"` or `Label="JOURNAL"`. The copy button remains harmless for excerpts.

- **Verbatim quotes.**

    Every ledger line and record quoted in the page must be verbatim from the handoff and the
    reports, because they are the smoke-asserted contract. Commit hashes link the narrative to
    `git -C ~/.dsh log`.

- **Honest-voice checklist.**

    Name each misdiagnosis before the fix (the two fs/observed theories, the "harness wiring"
    suspicion, and the timestamp scare). State what remains open (the unreachable path of the raw
    marker and the optional watch arm deferred). Never claim that the smokes caught what only live
    testing caught.

- **Read-only scope.**

    The plan honors the read-only reminder: this file is the only write, and nothing was committed.
