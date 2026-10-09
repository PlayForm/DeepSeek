# CASE-STUDY-PLAN — The Case Study Dimension

> One of the planning documents migrated to `Documentation/Plans/`. The plan for the Site's third
> dimension: the family's development story as a case study that COMBINES with the integration
> techniques and SHOWCASES THE DECISIONS. Written by the research agent (read-only pass); the third
> pass agent implements it. Sources: the Documentation handoff (`Documentation/Handoff/`, Packages
> 1–13), `git -C ~/.dsh log` (the boilerplate era chain), the docs reports
> (`Documentation/Reports/`: Commonalization-AUDIT, FSOBSERVED-DELIVERY, P5-V2-DIAGNOSIS,
> FileContent-FLAVOR-DESIGN), the plans (`Documentation/Plans/`: DSH-MONOREPO-PLAN) and the brand
> brief (`Documentation/Brand/`: BRANDING), and the Site's current state (`Site/Source/pages`,
> `Component`, `Layout`, `Reference/`).

---

## 1. THE STRUCTURE RECOMMENDATION

**One narrative page (`/case-study/`), not a section per phase.** The arc is chronological and
interlocking — each phase's decisions are caused by the previous phase's findings — so splitting
into per-phase pages loses the through-line. The page gets an in-page phase index (anchor links in
a sticky badge row under the hero, matching the Site's eyebrow-row pattern) plus outbound links to
the existing pages that demo the technique in question.

- **Nav**: add `{ Href: "/case-study/", Label: "Case Study" }` to the `Nav` array in
  `Site/Source/Layout/Base.astro` (between Models and Workbench reads best; it also auto-appears in
  the footer links). Reuse the existing `Current()` logic — no change needed there.
- **Length**: ~8 sections, each 200–400 words plus one artifact (a ledger excerpt, a table, or a
  before/after pair). Total page ≈ the size of `workbench.astro` (≤500 lines).
- **Tone — "truthfully"**: technical, honest, decision-focused. Every challenge is stated with what
  actually happened (including misdiagnoses and live-only failures), then the decision, the
  technique, the outcome. No marketing gloss over the failures — the misdiagnoses ARE the story
  (the fs/observed saga's two wrong theories, the silent P5 open, the shadowed config).

## 2. THE NARRATIVE ARC (the page's sections, in order)

### §0 Overview (hero)
One paragraph: the family grew from 5 bundles / 231 smoke checks (Package 2) to 12 packages /
~800 checks (Package 13) across one commit era (`b259652 → 5982aa8`, all of Oct 3–6, 2026) — every
step arbitrated by the smokes, every real bug found live, not by the smokes. Badges: `12 PACKAGES`,
`12 SMOKE SUITES`, `DUAL RELEASE`.

### §1 Phase I — The boilerplate era (the factory + the governance trio)
The setup: three independent hooks (package-governor, package-pinner, cargo-governor) + the mdash,
consolidated onto one factory service (15 methods), one transform contract, module-owned ledger
strings. *Source*: Handoff Package-01–03, Package-05; commits `49e5b3d`, `859f16a`, `018919c`.
- **Beat — challenge → decision → technique → outcome**: duplicated machinery across four hooks →
  build the factory as THE service → the `Wire`/`Attach`/`Continue` seam trio + the transform leaf
  contract → 5 bundles green, 231 checks, byte-identical ledger strings.
- *Site mapping*: plugins.astro + the plugin pages (the Seams table component exists for exactly
  this); the factory plugin page's 15→16→17 method arc.

### §2 Phase II — The audit findings & the fixes
The confirmation agent's three criticals (Package 4-REV): the `.d.ts` alias leak (TS2310 circular
bases), the nondeterministic build (the unawaited `exec()` race), the governor's live Inflight
collision. Then the executed queue: the Module rename, the Schema helper, the type-import flip, the
`@playform/hook-dsh-core` extraction, the P4 granularization. *Source*: Handoff Package-04 (REV),
09, 09-REV; commits `28ebc30`, `3c29108`, `060e3b6`, `1ed3564`, `c6a72ce`, `1fef4ca`, `e78c05c`,
`711d5b2`.
- **Beats** (each a decision card): type-only imports are erased → the "only Config imports the
  factory" posture survives the flip; the smoke-recovery pattern (the /tmp smokes lost once,
  replayed from session archives → archived to `~/.dsh/smokes/` forever after).
- *Site mapping*: Card grid of "finding → fix" pairs; badges per finding (`TYPE-ONLY`, `P0`, `P1`).

### §3 Phase III — Going live (the P5 journal saga)
The first live battery (Package 10): the interlock, real `cargo upgrade` jobs, the mdash counts —
and the P5 finding: the harness storage domain enforces ONE open per name, so the shared domain was
single-winner per boot. Fix: the SharedJournal sink (`952eaa1`) + the PendingJournal boot-window
buffer (`aa53c91`); live-confirmed on the third boot (Package 10-FINAL). *Source*: Handoff
Package-10–10-FINAL.
- **Beat**: "the human ledgers remained the complete record" while the structured journal silently
  lost modules — the three-stage routing (shared sink → pre-bind buffer → per-State fallback).
- *Site mapping*: Terminal blocks showing the actual journal records from Package 10-FINAL
  (the `activated`/`governed`/`dispatched` lines); a before/after pair: "one module's records" vs
  "all four modules' records".

### §4 Phase IV — The stream family (six flavors + the gate)
The mdash generalizes into the normalize family: core machinery generic over structural shapes
(no dsh-llm dependency — the symlink workaround replaced by a durable design), five new flavor
bundles, the tool-args gate, then the three-way gate (edit exemption — live-proven; the per-call
raw marker — smoke-verified but unreachable, honestly stated). *Source*: Handoff Package-11–12;
commits `98be27b`, `c2beb06`, `ad4c2c3`, `68afdcd`, `1d827ad`, `9d6e195`, `bb9a6fd`.
- **Beat**: "the system normalizes itself" — the agents' own comment prose came out hyphenated; the
  cosmetic pass was CANCELLED by the user (em-dashes only in README examples, never in code).
- *Site mapping*: links to workbench.astro and matrix.astro (the interactive demos of exactly this
  phase); before/after payload pairs like matrix.astro's RawPayload/CleanPayload.

### §5 Phase V — The raw-write saga, commonalization & granular control
The densest phase (Package 13): the raw-write tool; the fs/observed interlock failure; TWO
misdiagnoses (emit-context, listener-scope) refuted by FSOBSERVED-DELIVERY ("the event IS
delivered; the gate rejects the actor") → the real blocker: the patch-layer shadowing of
`mutationTools`. Then the mdash→normalize-dash rename, normalize-file, the P5 v2 migration
failure + fix (per-record layout, `compatibleVersions: [1]`, `invalidRecords:
"backup-and-skip"`, the LOUD failure line), the shared write executor (the 17th method `Write`),
the Update envelope, the Activate composer, the granular flags (`normalize`, `govern`), the
governance marker, the sequential fold + the fresh-version stat. *Source*: Handoff Package-13;
commits `b259652 → 5982aa8`; reports `Documentation/Reports/` — FSOBSERVED-DELIVERY,
P5-V2-DIAGNOSIS, Commonalization-AUDIT, FileContent-FLAVOR-DESIGN.
- **Beats**: the Commonalization-AUDIT's three-executors table → one shared executor; the fold race
  (`d7a3c93`) then the deeper bug — every step wrote `replaceIfVersion(<the SAME observed
  version>)` so only the first write could succeed → the stat-before-write guard (`5982aa8`).
- *Site mapping*: Seams table for the five-step write pipeline (resolve → write-intent → policy →
  writeText → fs/observed) with the three executors as rows converging; Terminal blocks for the
  live matrix outcomes (no-flag → no chain; `govern: ["canonicalize","pin"]` → governed+pinned,
  no dispatch; `govern: true` → the full chain).

### §6 Phase VI — The releases, the monorepo & the Site
The dual-release strategy (Classic + EffectTS off one boilerplate, DSH-MONOREPO-PLAN §1), the
anonymization + Aphrodite README borrow (#12), the Effect-TS mapping (#13: the Stream gate, the
services + layers, the tracing), the parallel-govern toggle designed in from the start (#14), the
reversed hierarchical naming (#15, the @-sentences), version 0.0.1, the submodules (#16), and the
Site itself as the integration showcase. *Source*: Handoff Package-12 (REV) / Package-13;
`Documentation/Plans/DSH-MONOREPO-PLAN.md`; `Documentation/Brand/BRANDING.md`.
- *Site mapping*: links to versions.astro (the dual-engine cards exist) and brand.astro.

### §7 The decision index (the showcase table)
A summary table — the page's payoff. Columns: **Decision | Rationale | Technique (the seam it
lives in) | Evidence**. Then the working-lessons strip (below).

### §8 The working lessons (the honest close)
The smoke/live fidelity gap (every real bug found LIVE); load-order ≠ profile-list order; the
timestamp confusion (epoch UTC vs local +03); the subagent quirks (normalization, one-file-per-
response, the crash pattern); the patch-layer shadowing as the meta-lesson: verify the LIVE
effective config, never just the schema projection. *Source*: Handoff Package-05, 12, 13 "working
lessons" — collected in `Documentation/Handoff/Lessons.md`.

## 3. THE DECISION INDEX (§7's rows — the canonical list)

| # | Decision | Rationale | Technique / seam | Evidence |
|---|----------|-----------|------------------|----------|
| 1 | Module-owned ledger strings; smokes as the arbiter | Byte-identical strings make renames safe and behavior provable; the literal `activated (cargo flavor, …)` survives every refactor | The transform contract + smoke harness; renames change mechanics, never strings | Handoff Package-02 / Package-05.5, Package-04.1; `3c29108`, `e106a98`, `66bfd81` |
| 2 | Stat-before-write version guard | In a multi-step fold every step wrote against the SAME observed version — only the first write could succeed; the fresh stat makes the fold converge in ANY step order | GuardedWrite / `replaceIfVersion` intent + U₂ refresh | `5982aa8`; Handoff Package-13 §8 |
| 3 | Wrapped-actor governance marker + the direct path | The raw-write's actor carries `{…exec, govern}`; the gate's `govern` reason makes direct governance the ONLY channel (event path skips marked actors); no flag → no chain (the escape hatch) | The Gate's actor step + `Factory.Govern` (17th-method era) + `GovernSteps` registry | `2c8764e`, `83ba8e5`, `e69c5d3`; Handoff Package-13 §7 |
| 4 | The sequential fold (await each step's chain); #14 parallel toggle designed but gated | Detached chains raced (nondeterministic writes); same-file steps (canonicalize+pin on one package.json) DO race — parallel only when disjointness is proven | The direct-govern fold in the write executor's continuation | `d7a3c93`, `140faa0`; register #14 |
| 5 | Per-record P5 domain + the loud failure line | The v2 open failed silently against the v1 file (exact-equality version check) and buffered every record into a never-drained buffer; silence made it undiagnosable | Storage domain v2 spec: `layout:"per-record"`, `compatibleVersions:[1]`, `invalidRecords:"backup-and-skip"` + one ledger line on open failure | `4c0e83b`, `756d566`; P5-V2-DIAGNOSIS |
| 6 | Patch layers carry the live config (add `raw-write` to the three bundle patch layers) | Patch config REPLACES entry config wholesale, shadowing schema defaults; the Config inspect provider projects the SCHEMA — the verification blind spot | `cordis.patch.yml` bundle layers + `mutationTools` gate input | `affa730`; FSOBSERVED-DELIVERY |
| 7 | Explicit tools over background rewriters | Background rewriting breaks the edit old-string contract and interleaves with bounded passes (the hermes `normalize-tabs.sh` cautionary tale); normalize-file is visible, opt-in, no-op → no write | The tools seam (`ctx.tools.register`) + the stream gate's name-exemption | FileContent-FLAVOR-DESIGN; `48f9515` |
| 8 | One shared write executor owned by the factory | Three executors duplicated the same five-step pipeline (resolve → write-intent → policy → writeText → fs/observed); the factory is the only home both tool-style and continuation-style writes already depend on | `Factory.Write` (the 16th→17th-method arc; GuardedWrite as the guarded alias) | Commonalization-AUDIT; `91293d2` |
| 9 | The core as pure delegate; the stream dispatch durably dependency-free | A cross-bundle symlink workaround for a nominal-type clash was fragile; generic structural shapes survive every narrowing | `Stream/Chunk` + `Stream/Block` (no dsh-llm import) | `98be27b`, `c2beb06`; Handoff Package-11 |
| 10 | Host-era pins; verify from app.asar, never the stale node_modules; the registry's `latest` dist-tag is stale | The @deepseek-ai family pins must match the running host | The dependency-pin discipline | register #11; Handoff Register #11 |
| 11 | Dual release: Classic live-first, EffectTS ships only after smokes prove parity | Keep the working implementation onboard; the ledger strings stay the contract in BOTH implementations | The Stream gate, the services + layers, the tracing spans | register #13; DSH-MONOREPO-PLAN; versions.astro |
| 12 | The reversed hierarchical naming + version 0.0.1 + submodules | Names read as `@`-sentences and group alphabetically; one repo per package | Package naming; the monorepo layout | registers #15/#16; BRANDING §2 |

## 4. THE INTEGRATION-TECHNIQUES COMBINATION (how each decision is presented THROUGH its seam)

Every decision row's "Technique" column links to the seam it lives in, and the section that tells
the decision embeds the seam's mechanics inline — the case study never describes a decision in the
abstract:

- **llm/stream waterfall** → decisions 7, 9, 11: the flavors' dispatch, the three-way tool-args
  gate (edit/raw-write/normalize-file pass by identity; the raw marker stripped), Chunk/Block
  passthrough-by-identity. Demo: workbench.astro, matrix.astro.
- **fs/observed** → decisions 1, 2, 6: the governance hooks' trigger, the raw-write interlock, the
  observation policy's per-owner record (the write-grace). Demo: the §5 Seams table.
- **tools** → decisions 3, 7: `ctx.tools.register` (raw-write, normalize-file), the actor gate,
  the mutationTools list.
- **the write executor** → decisions 2, 3, 4, 8: the five-step shared pipeline; the P4 fence vs
  the standing policy; the Stash idempotence gate.
- **storage domain** → decisions 5: single-open enforcement, the v2 migration, the three-stage
  routing. Demo: the §3 journal excerpts.
- **jobs** → the update stage as a real harness job (the governor-update dispatch, the awaited
  promise resolving AT dispatch, never awaiting the job). Demo: the §3 live battery lines.

The inversions to name explicitly: the actor gate inverting the event path into a direct path
(decision 3); the schema-default vs patch-layer inversion that caused decision 6; the user's
"defaults off, profile on" pattern (`1d827ad`).

## 5. CONTENT MAPPING (section → source → page/component → style)

| Section | Primary source | Site target | Style elements |
|---------|---------------|-------------|----------------|
| §0 Overview | Handoff Package-02 + Package-13 (smoke counts) | new `pages/case-study.astro` | PageHero; Badge row (`12 PACKAGES`, `DUAL RELEASE`) |
| §1 Boilerplate era | Handoff Package-01–03, 05; `49e5b3d`, `859f16a` | links to plugins.astro + factory plugin page | Seams table (the 15-method surface); Card grid of the 5 original bundles |
| §2 Findings & fixes | Handoff Package-04 (REV), 09; P6 pitfalls 20–25 | case-study page | finding→fix Card pairs; Badge per finding; Terminal for the `28ebc30` fix commit chain |
| §3 Going live | Handoff Package-10–10-FINAL | case-study page | Terminal blocks with real journal records; before/after pair (1 module vs 4 modules); the jobs envelope callout |
| §4 Stream family | Handoff Package-11–12; `98be27b`…`9d6e195` | links to workbench + matrix | before/after payload pairs (RawPayload/CleanPayload pattern); flavor Badge strip |
| §5 Saga & control | Handoff Package-13; FSOBSERVED-DELIVERY; P5-V2-DIAGNOSIS; Commonalization-AUDIT; FileContent-FLAVOR-DESIGN; `b259652 → 5982aa8` | case-study page | Seams table (the 5-step pipeline × 3 executors); Terminal for the live matrix; challenge→decision→outcome Cards |
| §6 Releases & site | DSH-MONOREPO-PLAN; BRANDING; registers #12–#16 | links to versions.astro + brand.astro | the two version Cards reused; the @-sentence motif |
| §7 Decision index | §3 table above | case-study page | the summary table (the Seams table component generalized, or a dedicated table) |
| §8 Lessons | Handoff Package-05, 12, 13 "working lessons" (`Documentation/Handoff/Lessons.md`) | case-study page | short Muted Cards, one per lesson; no decoration (the BRANDING clean-header rule) |

## 6. IMPLEMENTATION NOTES (for the third pass agent)

- New files: `Site/Source/pages/case-study.astro` (+ optionally `Component/Decision.astro` for the
  challenge→decision→technique→outcome card and `Component/Beat.astro` if the finding→fix pairs
  repeat). Prefer extending `Card`/`Seams`/`Terminal` first; only add a component if a pattern
  repeats ≥3 times.
- Keep the BRANDING constraints: blue/white only, clean headers, no decoration. Existing tokens in
  `Stylesheet/Global.css` (`--space-*`, `--color-*`) cover everything; no new colors.
- Terminal reuse: `Terminal.astro` takes `Command` + `Label` — usable for ledger excerpts by
  setting `Label="LEDGER"` / `Label="JOURNAL"`. The copy button remains harmless for excerpts.
- All ledger lines and records quoted in the page must be verbatim from the handoff/reports (they
  are the smoke-asserted contract); commit hashes link the narrative to `git -C ~/.dsh log`.
- The honest-voice checklist: name each misdiagnosis before the fix (the two fs/observed theories,
  the "harness wiring" suspicion, the timestamp scare); state what remains open (the raw marker's
  unreachable path, the optional watch arm deferred); never claim the smokes caught what only live
  testing caught.
- READ-ONLY reminder honored in this plan: this file is the only write; nothing committed.
