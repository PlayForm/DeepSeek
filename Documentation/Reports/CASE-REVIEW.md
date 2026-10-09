# CASE-REVIEW - the case study's structural rationale (2026-10-07)

> The case-review agent's report (user mandate 2026-10-07): the review of the case study must
> emphasize THE STRUCTURE OF WHY IT WAS WRITTEN LIKE THIS - the structural rationale (why the
> architecture and the decisions are shaped the way they are), NOT the how (the process mechanics).
> Scope: `Site/Source/pages/case-study.astro`, `Documentation/Plans/CASE-STUDY-PLAN.md`, the third-pass
> summary (`Documentation/Plans/TOMORROW-REVIEW.md` §2.3), the handoff
> (`Documentation/Handoff/`: Overview, Packages 01-13, Register, Lessons), the reports
> (`Documentation/Reports/`), and the code (`Classic/packages/*`, `EffectTS/packages/*`, both
> `smokes/` trees, `Boilerplate/`, `Test/`, `Site/`). READ-ONLY everywhere except this file. Commit
> hashes verified against `git -C ~/.dsh log` (82 commits). Smoke counts counted from the scripts'
> `ok(`/`Check(` call sites (the suites print "N checks - ALL PASS" at runtime).

---

## 1. THE VERDICT

The case study explains most of the family's structural why, but not all of it, and it is strongest
exactly where the structure lives in a seam - the factory consolidation, the three-stage journal
routing, the gate inversion, the sequential fold, the per-record v2 domain - and weakest where the
structure lives in a naming or packaging decision: the reversed hierarchical naming, the
three-implementation split, and the tracing opt-in are each asserted as facts of the era without
their structural reason. The smoke-ledger contract - the family's central structural device - is
stated but not elevated: byte-identical ledger strings are the family's public interface, the only
observable that survives a framework port, and that is WHY renames are safe, the Effect-TS port is
provable, and the smokes are implementation-agnostic; the page treats this as decision 1 of 13
rather than the spine of the whole family. The port's purpose never appears: Register #13's three
goals (external traceability, ecosystem interop, hooking other transformers) are absent, so the
Effect-TS mapping reads as a release event, not as the structural claim it is. Where the page
lapses, it lapses into process ("executed in one session", the subagent quirks - fine in the
lessons, wrong in the phases) and into unverified arithmetic: the 15 -> 16 -> 17 method arc does
not match the actual 19-method surface and contradicts itself about which method is "the 16th";
the "~800" total is unattributed; the submodule structure is presented as achieved when register
#16 is explicitly NOT STARTED. Claim verification against the code: nearly every structural claim
checks out - the five-step executor merge, the sequential fold + fresh-stat guard, the v2
per-record domain + loud failure line, the patch-layer shadowing, the govern-marker inversion, the
stream gate's identity exemptions, the abort-signal fix, the #14 parallel marker, the tracing
opt-in, and every commit hash on the page (including one place where the page is right and the
plan is wrong: `49e5b3d`, not the plan's `49e5b3b`). The remaining failures are concentrated in
one habit: counting things that were never counted canonically (methods, checks, totals) and
quoting things that were never quoted verbatim. That is a structural finding in itself - the case
study's own numbers and excerpts are the least-structural artifacts on the page.

## 2. PER-SECTION STRUCTURAL-WHY ASSESSMENT

### The overview (Section 0)

- **Structural why exposed**: the smoke/live asymmetry is named as the story's spine ("what the
  suites caught, what only a restart could catch") - a structural claim about the verification
  regime, and honest ("which two theories died on the way to the truth").
- **How lapse**: none of consequence; the overview is mostly structural.
- **Unsupported/stale**: "~800 checks across twelve suites as the final count" is unattributed -
  the Effect-TS total is 808, the Classic is 795; both round to "~800" but the third-pass summary
  (TOMORROW-REVIEW §2.3) pins the intent to the Effect-TS total, which the page never says. "Zero
  assertion changes across refactors, renames and a framework port" needs the additive-coverage
  nuance: the Effect-TS suites add 13 checks (core +3, factory +7, governor +3), so "zero changes"
  means zero rewrites, not zero growth. The overview never announces the three-implementation
  structure (Boilerplate / Classic / EffectTS) even though the "framework port" sentence implies
  it - the triad's roles are the family's most visible structural fact.

### Phase I - the boilerplate era

- **Structural why exposed**: the duplication -> consolidation rationale (three hooks carrying six
  copies of the same machinery -> one factory service) and the transform-leaf contract ("the
  factory drives but never absorbs - each hook's transforms stay its identity") are the right
  structural beats, and they are the page's best statement of why the factory exists: the harness
  plugin seam is the only stable extension point, so everything shared lives behind ONE service
  and the hooks stay thin leaves.
- **How lapse**: the two live-verified fixes (inject/Config on the default export; apply must
  return nothing) are loader-contract facts stated as anecdotes; they ARE structural (the loader
  contract is a seam property) but the paragraph reads as folklore - the why (a returned value
  silently kills event delivery; named-only exports are shadowed) is present in one clause each,
  which is enough.
- **Unsupported/stale**: "it has since grown 15 -> 16 -> 17 methods" - the actual current surface
  is 19 callable methods (Library.ts lists Append/Match/Discover/Parse/ResolvePolicy/Gate/Write/
  GuardedWrite/Refresh/Continue/State/Wire/Attach/Journal/Schema/UpdateKey/Seam/RegisterGovern/
  Govern), the SCHEME numbers 17 sections with Write+GuardedWrite sharing §2.7 and UpdateKey
  absent, and the factory plugin page says "Nineteen methods" (plugin-dsh-factory.astro:13,139) -
  see Correction C1. The 15-method era figure itself is correct (Handoff Overview Package 3).

### Phase II - the audit and the fixes

- **Structural why exposed**: the three criticals are structural findings with structural fixes,
  and the type-import flip carries the best structural why on the page ("type-only imports are
  erased, so the consumers' only-Config-imports-the-factory posture survives the flip untouched" -
  the erased-at-build property is what makes the import topology durable).
- **How lapse**: "The rest of the queue executed in one session" is pure process; the module
  terminology rename's why (spec vocabulary vs code vocabulary; the `cargo flavor` literal
  survives because ledger strings are module-owned) is present but compressed. The smoke-archival
  beat ("the arbiter must not be disposable") is process-as-lesson and correctly placed.
- **Unsupported/stale**: Critical card 3 calls UpdateKey "the 16th method"; decision 8 calls
  Write "the 16th method" - the same ordinal, two different methods (C1). Everything else in the
  section verifies (commits 28ebc30, c6a72ce, 1ed3564, 3c29108, 060e3b6, 1fef4ca, 711d5b2 all in
  `git -C ~/.dsh log`).

### Phase III - going live

- **Structural why exposed**: the strongest structural section. The harness's one-open-per-name
  domain constraint -> the SharedJournal sink -> the boot-window PendingJournal buffer -> the
  per-state fallback ("three-stage routing") is a genuine architecture story, and the observation
  that the human ledgers were the only reason the loss was noticed is the honest structural
  counterpart (the journal is a convenience mirror, the ledger files are the record).
- **How lapse**: none material; the "await at dispatch, never await the job" beat is the jobs
  seam's semantics, structural.
- **Unsupported/stale**: the excerpt is NOT verbatim (see C3): the page's JournalExcerpt uses
  `...` and `<-` where Package-10.md:86-90 has the ellipsis character and `<-`; the plan's rule
  (all quoted ledger lines are the smoke-asserted contract) is violated by the page's own
  normalize-affected writing pipeline.

### Phase IV - the stream family

- **Structural why exposed**: the generalization's why (a fragile cross-bundle symlink workaround
  replaced by generic structural shapes with no dsh-llm dependency) is stated with commits and
  verified in the code (the core has zero dsh-llm imports; the flavors' StreamChunk/ContentBlock
  imports are type-only, erased at build). The three-way gate's structure (edit/raw-write pass by
  identity; the per-call raw marker) is described and honestly flagged as smoke-verified but
  unreachable from the structured tool interface at the time - exactly the plan's honest-voice
  rule.
- **How lapse**: minor; "The system normalizes itself" is the family's self-awareness beat and is
  well placed - but the page misses that its OWN ledger excerpt (C3) is a live instance of that
  beat.
- **Unsupported/stale**: the matrix page is named ("the workbench and the matrix pages run
  exactly these flavors live") but only workbench is linked; the plan's §4 asked for both (C12).

### Phase V - the raw-write saga

- **Structural why exposed**: the densest section and mostly structural. The misdiagnoses are
  named before the fix (emit-context, listener-scope) and refuted structurally ("the event IS
  delivered; the gate rejects the actor"); the patch-layer shadowing's why is the config-
  composition inversion (a patch layer replaces the entry config wholesale; the schema projection
  is the blind spot); the v2 migration's why (exact-equality version check + swallowed catch +
  never-drained buffer -> silence made it undiagnosable -> the loud line); the commonalization
  (three executors -> one shared five-step pipeline) with the per-step divergence table; the fold
  race then the deeper same-version bug and the stat-before-write guard - all verified against
  Commonalization-AUDIT §1, Function/Write.ts, Function/Govern.ts, Function/Open.ts.
- **How lapse**: the two-wrong-theories narrative is process by nature, but it is the plan's
  required honest voice and it terminates in the structural discovery - acceptable.
- **Unsupported/stale**: the abort-signal fix (the 13th decision row) is verified (Library.ts:
  230-236 + the dash suite's pre-aborted scenario, EffectTS/smokes/normalize-dash-smoke.mjs:787-
  807) but two Effect-TS comments still describe the pre-fix design (Library.ts:25-27,
  Function/Write.ts:49-50) - the code contradicts its own header (C10).

### Phase VI - the releases, the monorepo and the Site

- **Structural why exposed**: the dual-release rationale ("keep the working implementation
  onboard; the ledger strings stay the contract in both") is stated; the parallel-govern toggle
  designed-in-from-the-start is stated and verified in EffectTS (Govern.ts:23-30, 89-95).
- **How lapse**: this section is the structural weak point of the page. The Effect-TS port's
  PURPOSE (Register #13's goals: external traceability, ecosystem interop, hooking other
  transformers) never appears - the mapping is described as shipping mechanics, not as the reason
  the port exists (C5). The tracing opt-in (no-op default, best-effort, NodeSdk.layer + OTLP -
  Runtime.ts:26-49) appears nowhere except one table cell (C6). The naming inversion is stated as
  a property ("read as @-sentences, group alphabetically") not a why (C8).
- **Unsupported/stale**: "one repository per package under submodule structure" reads as achieved;
  Register #16 is NOT STARTED (no commits, everything on disk) and TOMORROW-REVIEW §3.1 lists it
  as open (C4). "Anonymized and de-personalized every bundle" glosses the known ncuBin residual
  (TOMORROW-REVIEW §3.3, a smoke-asserted code constant) (C14).

### The decision index (Section 7)

- **Structural why exposed**: the table's shape (Decision | Rationale | Technique/seam |
  Evidence) is the plan's payoff design, and the 13th row (the signal-mapping beat) is the most
  precisely structural content on the page - the seam-only signal forwarding vs the fiber
  interruption, byte parity preserved, verified in code. Rows 1-9 and 11 name real seams.
- **How lapse**: rows 10 and 12 name no seam ("The dependency-pin discipline"; "Package naming;
  the monorepo layout") - the plan's §4 rule ("the case study never describes a decision in the
  abstract") is violated exactly where the naming/packaging structure lives (C9). The evidence
  column mixes commit hashes with doc refs; it could carry file refs so the proof is locatable in
  the tree (E7).
- **Unsupported/stale**: "12 DECISIONS + 1 FIX" (the eyebrow) vs "13 DECISIONS" (the section
  Meta) is a label mismatch, harmless but noisy; the verdict row count is right (13 rows).

### The working lessons (Section 8)

- **Structural why exposed**: the smoke/live fidelity gap is stated in one structural line ("the
  smokes prove the mechanics; the live battery proves the wiring") - the two-layer verification
  regime is the family's architecture, not its process; the patch-layer shadowing as the
  meta-lesson (verify the LIVE effective config, never the schema projection) closes the saga
  structurally; the load-order lesson connects to the fold ("the fold plus the fresh-version
  writes make the order irrelevant").
- **How lapse**: the subagent quirks and the timestamp lessons are process by design - the plan's
  §8 explicitly lists them; they belong here, not in the phases.
- **Unsupported/stale**: the known-gaps register's items (the verifyCommand trap, the raw-marker
  unreachability beyond the one honest sentence, the #14 Classic parallel coverage) are not
  surfaced in the close's "backlog of decisions already designed" - a named backlog would be
  more structural than a vague one (E4).

## 3. CLAIM VERIFICATION

### Verified against the code and the record

- **The 5 bundles / 231 checks of the boilerplate era**: factory 30 + governor 70 + pinner 28 +
  cargo 58 + mdash 45 = 231 (Handoff Overview, the Package-2 table); the page's Phase 0 Meta and
  Phase I text are exact.
- **12 packages x 12 smoke suites x 3 implementations**: `Classic/packages/` and `EffectTS/
  packages/` hold the same 12 names; `Classic/smokes/`, `EffectTS/smokes/`, `Boilerplate/smokes/`
  hold 12 suites each (the #15 names, verified: hook-dsh-core, governor-cargo, governor-package,
  normalize-dash/-file/-quotes/-ellipsis/-spaces/-invisible/-fullwidth, pinner-package,
  plugin-dsh-factory).
- **The smoke counts**: per-suite call sites match TOMORROW-REVIEW §1 exactly - Classic core 14 /
  factory 34 / governor 78 / pinner 32 / cargo 62 / normalize-file 71 / six flavors 62 each /
  dash 132; EffectTS core 17 / factory 41 / governor 81, the rest identical. Totals: Classic and
  Boilerplate 795, EffectTS 808. The page's "~800" is defensible as the Effect-TS total (see the
  stale-claims list for the 733/671 figures).
- **The factory surface**: Write (the shared executor) and GuardedWrite (the guarded alias) at
  SCHEME.md §2.7, RegisterGovern at §2.16, Govern at §2.17 ("the SEQUENTIAL FOLD" per SCHEME);
  Function/Write.ts + Function/Govern.ts + Function/UpdateKey.ts exist; the 15-method era figure
  matches Handoff Package 3.
- **The shared five-step pipeline**: the Executors table on the page is a faithful rendering of
  Commonalization-AUDIT §1's inventory (resolve / fs/write-intent waterfall / sandbox policy /
  writeText / fs/observed; the raw-write's no-cwd-option divergence; the identical `next() =>
  undefined`; the P4 fence rooted at the target's own directory; the byte-identical emit shape;
  the factory's Refresh delegation) - Classic Function/Write.ts:53-72, EffectTS Function/Write.ts:
  1-13.
- **The sequential fold + the stat-before-write guard**: Function/Govern.ts:9,41,84,93 (the
  awaited fold); commit 5982aa8 ("guard the chain pass's write against a fresh stat"); the Stash
  pre-registration of the fresh version before the emit (Function/Write.ts:145-159).
- **The v2 journal domain**: Open.ts:93-100 (`layout: "per-record"`, `compatibleVersions: [1]`,
  `invalidRecords: "backup-and-skip"`), Open.ts:27-36 (the exact-equality version check of the
  single-layout parser), Open.ts:168-173 (the loud line: `storage journal open failed: ...`),
  Open.ts:138-150 (the SharedJournal bind + the PendingJournal pre-bind drain).
- **The three-stage routing**: Open.ts:46-58,138-150 - the factory-level SharedJournal, the
  pre-bind window buffer, the per-State fallback queue - plus EffectTS/IMPLEMENTATION-PLAN.md:66
  (the routing "stays in the shell").
- **The patch-layer shadowing**: FSOBSERVED-DELIVERY:18-23,90-96 documents the live pre-fix
  `mutationTools: [write, edit, str_replace_editor]` (schema default includes raw-write, commit
  3687d11, shadowed) and the one-line three-patch fix (affa730); the CURRENT patch layers carry
  the fixed value (governor-package/pinner-package/governor-cargo `cordis.patch.yml`, each
  `mutationTools: [write, edit, str_replace_editor, raw-write]`).
- **The govern-marker inversion + the escape hatch**: Gate.ts:51-57 (the `govern` field check -
  ALWAYS present on raw-write's wrapped actor, so the event path skips it with reason "govern";
  built-in write/edit execs carry no field and keep governing) and dash Function/Write.ts:19-51
  (no flag -> NO direct chain; the write still emits fs/observed on the root context).
- **The stream gate's exemptions**: hook-dsh-core Source/Stream/Chunk.ts:19-37 (name-exempt:
  edit/raw-write/normalize-file pass BY IDENTITY; the raw-marked `{"__normalize":false` opt-out)
  and Stream/Strip.ts (the marker remover, the two legal shapes).
- **The dependency-free core**: zero `@deepseek-ai/dsh-llm` matches in `Classic/packages/hook-dsh-
  core/Source/`; the flavors' StreamChunk/ContentBlock imports are type-only, erased at build
  (each flavor's Configuration/ESBuild.ts comment).
- **The Effect-TS abort-signal fix**: Library.ts:230-236 ("forwarded to the write SEAM only... it
  is NOT mapped onto the fiber... break the byte parity of the abort path... the dash smoke
  asserts 'aborted before write'") + EffectTS/smokes/normalize-dash-smoke.mjs:787-807 (the
  pre-aborted scenario: the call rejects, nothing is written).
- **The #14 parallel marker**: EffectTS Function/Govern.ts:23-30,47-48,79,89-95 (`{ steps,
  parallel }`; sequential DEFAULT; parallel opt-in via `Effect.all`; the safety condition -
  disjoint targets only, same-file steps race); IMPLEMENTATION-PLAN.md:14,86-93 ("designed in
  from the start").
- **The tracing opt-in**: EffectTS Function/Service/Runtime.ts:26-49,81-88 (no-op Tracer by
  default; the opt-in composes `@effect/opentelemetry`'s `NodeSdk.layer` with an OTLP exporter
  behind a BatchSpanProcessor; best-effort - an unloadable bundle degrades to the no-op Tracer;
  hygiene-proven per TOMORROW-REVIEW §1); the package.json pins `@effect/opentelemetry` 4.0.1.
- **The ledger strings as the cross-implementation contract**: spot-checked - the cargo's
  `["", "cargo flavor"]` ledger segment pair is identical (Classic Apply.ts:79 / EffectTS
  Apply.ts:97); the dash's activation line is composed by the core's Activate with the module's
  own field list (dash Apply.ts:69-86); the smoke suites assert the lines byte-exact (e.g. the
  versions page's per-package cards quote 14/34/78/32/62, matching the scripts).
- **Every commit hash on the page**: present in `git -C ~/.dsh log` - including `49e5b3d` (the
  page is RIGHT; the plan and the Handoff Overview carry the typo `49e5b3b`) and `018919c`,
  `b259652` (Oct 05), `5982aa8` (Oct 06) as the era's end.
- **The journal excerpt's source**: Package-10.md:86-90 - the lines and timestamps match
  (16:44:43.232 / .301 / .302, 16:45:42.178 / .196), but not the bytes (see below).
- **The site integrations**: the nav carries Case Study (Base.astro:22); versions.astro:39,62,90,
  125 ("The dual engine distribution... same twelve contracts, built twice... both at 0.0.1");
  the brand page is gone (no brand.astro in pages/); the workbench + matrix pages exist.
- **The audit's three criticals**: Finding/Fix pairs match Handoff Package-04 (REV) content and
  the commits (28ebc30 = the P0 deterministic declarations + named type exports; c6a72ce = the
  type-import flip; 1ed3564 = the UpdateKey collision fix).

### Not verified / stale / wrong

- **"15 -> 16 -> 17 methods" and "the 16th method"** (Phase I + decision 8 + Phase II card 3):
  the actual surface is 19 callable methods (Library.ts:38-55); the SCHEME numbers 17 sections
  (Write+GuardedWrite share §2.7) and omits UpdateKey; the factory plugin page says "Nineteen
  methods" (plugin-dsh-factory.astro:13,139); the page itself calls BOTH UpdateKey (card 3) and
  Write (decision 8) "the 16th method"; SCHEME.md:15 says "16 methods" and SCHEME.md:50 says
  "15 surface methods (+ 1 auxiliary)". The ordinal story is internally inconsistent and stale
  (C1).
- **The "~800" total**: unattributed on the page; TOMORROW-REVIEW §2.3's "Classic/Boilerplate
  733" is arithmetically wrong (795 - 62 = 733: exactly one flavor short - the §1 listing itself
  sums to 795); matrix.astro:191 carries "12 suites · 671 checks · ALL PASS", which matches
  neither 795 nor 808; plugin-dsh-factory.astro:312 says "30 checks" for the factory suite, which
  has 34 call sites today (the 30 was the Package-2 era count). Four different totals are in
  circulation; only 795/808 are real (C2).
- **"Zero assertion changes"**: the Effect-TS suites ADD 13 checks (core 17 vs 14, factory 41 vs
  34, governor 81 vs 78) - "zero changes" must read as "zero rewrites, additive coverage only"
  (C13).
- **The submodule structure as achieved** (Phase VI): Register #16 says NO COMMITS FOR NOW; the
  monorepo's gitignore only anticipates it; TOMORROW-REVIEW §3.1 marks it NOT STARTED (C4).
- **The journal excerpt verbatim rule**: the page's `...` and `<-` vs the handoff's ellipsis
  character and `<-` - the plan §6's "verbatim from the handoff/reports" rule is violated; the
  normalize family normalized the case study's own quote (C3).
- **The Effect-TS signal comments**: Library.ts:25-27 ("the RunOptions `signal` maps the harness
  abort to fiber interruption on the write path") and Function/Write.ts:49-50 ("mapped onto the
  fiber at the shell's runPromise boundary") describe the PRE-fix design that Library.ts:230-236
  and the dash smoke's pre-aborted scenario removed - the shipped code contradicts its own
  headers (C10).
- **"Anonymized and de-personalized every bundle"** (Phase VI): the known residual - the
  governor-package's `ncuBin` default VALUE, a smoke-asserted code constant (TOMORROW-REVIEW
  §3.3, Register #12's scope) - is not carried (C14).
- **The plan's hash typo**: CASE-STUDY-PLAN.md and Handoff Overview write `49e5b3b`; the log has
  `49e5b3d`. The PAGE is correct; the plan should be corrected when next touched (fold into C2's
  doc sweep or a standalone doc-fix package).

## 4. CORRECTIONS BATCH

> Landing form per the user's corrections process ("the review's findings land as new packages -
> agents + the smokes/site-build as the arbiter"): items that touch code land as NEW PACKAGES
> (a dedicated agent each, the smokes as the arbiter); items that touch only the site/docs land
> as site-build-arbitrated packages. Priority: P0 first.

- **C1 (P0) - THE METHOD-COUNT LEDGER - NEW PACKAGE.** Title: settle the factory surface's
  canonical count and numbering. Structural why it fixes: the "15 -> 16 -> 17" arc is narrative
  arithmetic, not structure - the surface grew by INSERTION (Write landed at §2.7, renumbering
  everything after it), plus aliases (GuardedWrite) and uncounted helpers (UpdateKey); an ordinal
  story cannot survive that; the canonical inventory (count, numbering, aliases) is the structural
  fact the case study, the SCHEME and the factory plugin page must all agree on. Scope:
  `Classic/packages/plugin-dsh-factory/SCHEME.md` (the §0 "16 methods" + §2 "15 (+1 auxiliary)"
  headers vs §2.1-2.17; add UpdateKey), `Site/Source/pages/plugins/plugin-dsh-factory.astro`
  (the "19 methods" line), `Site/Source/pages/case-study.astro` (Phase I's "15 -> 16 -> 17",
  Phase II card 3's "the 16th method", decision 8's "the 16th method"). Arbiter: the site build +
  the factory suite (the smoke asserts behavior, not counts - the count lives in the docs).

- **C2 (P0) - THE SMOKE-TOTAL LEDGER - NEW PACKAGE.** Title: one authoritative total, computed
  from the suites. Structural why: the totals are the era's quantitative spine ("231 -> ~800");
  four figures are in circulation (671 on matrix.astro, 733 in TOMORROW-REVIEW §2.3, 795 and 808
  in the scripts) and only the scripts are real; a single counted-and-printed source ends the
  drift. Scope: run all 36 suites, count the `ok(`/`Check(` call sites, fix `Site/Source/pages/
  matrix.astro:191` (671 -> the Classic total 795 or the attributed per-engine pair),
  `Documentation/Plans/TOMORROW-REVIEW.md` §1 + §2.3 (733 -> 795; keep the note that the case
  study's "~800" is the Effect-TS 808), `Site/Source/pages/plugins/plugin-dsh-factory.astro:312`
  ("30 checks" -> 34), `Site/Source/pages/case-study.astro:289` (attribute "~800" to the Effect-
  TS total + give the Classic total), and the plan's `49e5b3b` typo -> `49e5b3d` in the same
  sweep. Arbiter: the smokes (the suites print "N checks - ALL PASS").

- **C3 (P0) - THE VERBATIM EXCERPT RULE - site-build-arbitrated.** Title: restore the journal
  excerpt's exact bytes. Structural why: the plan's verbatim rule exists because the ledger lines
  ARE the smoke-asserted contract; the case study's own quote was normalized by the very family
  it describes - a self-inflicted demonstration of the normalize family (the page's Phase IV
  beat made literal). Scope: `Site/Source/pages/case-study.astro` JournalExcerpt - quote
  Package-10.md:86-90 byte-exact (the ellipsis character and the `<-` via the `\uXXXX` escape
  route per Lessons.md's reliable routes). Arbiter: the site build.

- **C4 (P1) - THE SUBMODULE OVERCLAIM - site-build-arbitrated.** Title: "one repository per
  package under submodule structure" -> "designed, pending register #16". Structural why: an
  un-started packaging structure presented as achieved undercuts the case study's truthfulness
  contract - the honest-voice rule the page otherwise keeps. Scope: `Site/Source/pages/
  case-study.astro` Phase VI + decision 12. Arbiter: the site build.

- **C5 (P1) - THE PORT'S WHY - site-build-arbitrated.** Title: state Register #13's three goals
  (external traceability, ecosystem interop, hooking other transformers) and the triad's roles
  (Boilerplate = the live truth, Classic = the anonymized release, EffectTS = the port). Why:
  the three-implementation structure is the family's most visible shape, and the page never
  explains why a second implementation exists - the mapping reads as an event, not as the
  structural claim it is (the ledger contract makes the port POSSIBLE; the goals make it
  NECESSARY). Scope: `Site/Source/pages/case-study.astro` overview + Phase VI + decision 11.
  Arbiter: the site build.

- **C6 (P1) - THE TRACING OPT-IN - site-build-arbitrated.** Title: surface the opt-in / no-op
  default / best-effort design (Runtime.ts:26-49) in prose. Why: external traceability is the
  port's purpose; the no-op default that never breaks the plugin is the structural answer to
  "why is tracing optional" - currently one table cell ("the tracing spans") carries the whole
  design. Scope: `Site/Source/pages/case-study.astro` Phase VI (or decision 11's technique).
  Arbiter: the site build.

- **C7 (P1) - THE LEDGER-AS-SPINE - site-build-arbitrated.** Title: elevate decision 1 from a
  row to the family's structural spine. Why: the byte-identical ledger strings are the public
  interface - the only observable that survives a framework port - which is WHY renames are safe
  (mechanics change, strings never), the port is provable, and the smokes are implementation-
  agnostic; the page states the mechanism everywhere but the reason nowhere. Scope:
  `Site/Source/pages/case-study.astro` overview + decision 1's rationale. Arbiter: the site
  build.

- **C8 (P1) - THE NAMING INVERSION'S WHY - site-build-arbitrated.** Title: decision 12's
  rationale is a property ("read as @-sentences, group alphabetically"), not a why. Add: kind-
  first ordering mirrors the consumer topology (hooks vs the factory service); role-contiguous
  grouping keeps the shared-machinery families together (governor-cargo/governor-package,
  normalize-*); the @-sentence is the release identity (the README titles, Register #15); and the
  inversion was only safe because the ledger strings are module-owned (the mdash -> normalize-dash
  rename, Register #5, is the proof). Scope: `Site/Source/pages/case-study.astro` Phase VI +
  decision 12. Arbiter: the site build.

- **C9 (P1) - THE SEAM-LESS ROWS - site-build-arbitrated.** Title: give decisions 10 and 12 a
  seam, per the plan's §4 rule ("the case study never describes a decision in the abstract").
  Row 10's seam: the dependency-pin discipline lives in the package.json dependency fields + the
  smokes' host-era assertions (verify from app.asar, never stale node_modules); row 12's seam:
  the monorepo layout + the package naming itself. Scope: `Site/Source/pages/case-study.astro`
  decision table. Arbiter: the site build.

- **C10 (P2) - THE STALE SIGNAL COMMENTS - NEW PACKAGE.** Title: fix the two Effect-TS comments
  that describe the pre-fix abort design. Why: the shipped code contradicts its own headers
  (Library.ts:25-27 and Function/Write.ts:49-50 vs Library.ts:230-236 + the dash smoke's
  pre-aborted scenario) - the exact kind of "verify the live effective config, never the
  projection" residue the family's own meta-lesson condemns, in the family's own release tree.
  Scope: `EffectTS/packages/ets-plugin-dsh-factory/Source/Library.ts:25-27`,
  `EffectTS/packages/ets-plugin-dsh-factory/Source/Function/Write.ts:49-50` (comments only; the
  behavior is already correct). Arbiter: the smokes (unchanged assertions) + the site build.

- **C11 (P2) - THE SCHEME INVENTORY - NEW PACKAGE.** Title: fold the SCHEME's self-inconsistency
  (16 / 15+1 / 17 sections, UpdateKey missing) into C1's canonical inventory. Why: the SCHEME is
  the factory's contract doc; three different counts in one file propagate the method-count
  confusion the case study repeats. Scope: `Classic/packages/plugin-dsh-factory/SCHEME.md` §0 +
  §2 headers. Arbiter: the site build.

- **C12 (P3) - THE MATRIX LINK - site-build-arbitrated.** Title: link matrix.astro from Phase
  IV (the plan's §4 asked for both demo pages). Why: the flavor family's structural story is the
  before/after payload pair - matrix.astro is the live demo of exactly that. Scope:
  `Site/Source/pages/case-study.astro` Phase IV. Arbiter: the site build.

- **C13 (P3) - THE "ZERO ASSERTION CHANGES" PRECISION - site-build-arbitrated.** Title: "zero
  assertion changes" -> "zero assertion rewrites; the port added 13 checks (core +3, factory +7,
  governor +3)". Why: the additive coverage is itself a structural fact - the port proved parity
  by EXTENDING coverage, not by rewriting assertions. Scope: `Site/Source/pages/case-study.astro`
  overview. Arbiter: the site build.

- **C14 (P3) - THE ANONYMIZATION CAVEAT - site-build-arbitrated.** Title: Phase VI's "every
  bundle" should carry the known ncuBin residual (a smoke-asserted code constant, TOMORROW-REVIEW
  §3.3). Why: the honest-voice rule applies to claims of cleanliness too. Scope:
  `Site/Source/pages/case-study.astro` Phase VI. Arbiter: the site build.

## 5. ENHANCEMENTS (discovered during verification; the site stays untouched)

- **E1 - The page as the family's self-demonstration**: C3's normalized excerpt is the live
  instance of Phase IV's "the system normalizes itself" beat - a before/after pair (the verbatim
  bytes vs what the writing pipeline produced) inside Phase III or IV would make the family's
  behavior land on the page's own body, the strongest possible demonstration of the normalize
  family's structural reach.
- **E2 - The gate's reason taxonomy as the decision language**: Gate.ts's seven reasons
  (target / govern / actor / kind / idempotent / basename / excluded - Gate.ts:44-71) are the
  family's structured vocabulary for "why did governance not run"; Phase V uses "the gate rejects
  the actor" once - naming the reason set (and that the pre-fix rejection was the actor reason,
  the post-marker rejection the govern reason) makes the misdiagnosis story structurally
  checkable instead of anecdotal.
- **E3 - The +13 additive coverage as parity proof**: the Effect-TS totals being HIGHER than the
  Classic's, with every shared assertion intact, is the port's strongest structural evidence -
  the page could state it as such (it currently implies the totals are equal).
- **E4 - A named backlog for the close**: the lessons section's "a backlog of decisions already
  designed" could name the register's open items (#14's Classic parallel smoke coverage, the
  ncuBin re-pin, the verifyCommand trap, #16's submodule structure) so the "next era" is concrete
  and the case study hands off to the register structurally.
- **E5 - The ordering-constraint removal**: the load-order lesson already connects to the fold;
  extending it to decision 2 ("the fold converges in ANY step order - the structure removes the
  ordering constraint instead of controlling it") would make the stat-before-write guard's why
  explicit.
- **E6 - Cross-referencing the versions-page cards**: versions.astro's per-package check counts
  (14/34/78/32/62...) match the scripts and are the page's only per-suite numbers; after C2 the
  case study's "~800" can point at them, making the totals verifiable from two pages.
- **E7 - File refs in the evidence column**: the decision table's evidence column is all commit
  hashes and doc names; adding tree paths (e.g. Function/Open.ts:93-100 for decision 5, Gate.ts:
  51-57 for decision 3, EffectTS/smokes/normalize-dash-smoke.mjs:787-807 for the abort-signal
  row) would make "where the proof lives in the tree" part of the page's structure, matching the
  mandate's seams emphasis.