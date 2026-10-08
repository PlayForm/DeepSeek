# The Handoff — Register (the complete future-work register)

> User-requested consolidation (2026-10-05): all future work + the new rename item, in one register.
> Restructured from the HANDOFF's Package 12-REVISION-2; the sessions' context lives in
> [`Packages/Package-12.md`](Packages/Package-12.md) and
> [`Packages/Package-13.md`](Packages/Package-13.md).

---

## THE REGISTER (in rough priority order)

1. **The raw-write tool live confirmation** - the tool (mdash's Function/Write.ts + the Rewrite
   chain, the name-exemption) activates in the agent toolset at the next restart; verify it live (a
   raw write verbatim + a normalize:true write + the
   [fs/observed][dsh-fs]
   events for the governance hooks).
2. **The README dash-example pass** - rewrite the family's READMEs: normalized prose (the gate) +
   the dash-example sections with LITERAL em-dashes, landed via exempt edits (the user-designed
   workflow).
3. **The handoff maintenance** - keep this document current (the smoke counts, the commits, the
   queue).
4. **The cosmetic comment pass** - the agents' new comment prose came out with ASCII hyphens (their
   output streams are normalized); a style pass restores the em-dash prose in the new comments.
5. **THE MDASH RENAME (user-flagged)** - `dsh-hook-mdash` → `dsh-hook-normalize-dash` (the mdash is
   the naming outlier - its five siblings are all normalize-*; "mdash" is the typographic shorthand
   for em dash, the family's anchor name predating the convention). Scope: the module identity, the
   ledger prefix "mdash: " in every activation/count line, the log path ~/.dsh/mdash.log, the
   profile entry + [cordis.patch.yml][ours-cordis-patch] id, the smokes' assertions (the ledger strings change BY
   DESIGN - they are the module's own identity), the docs (README/SCHEME/Library comments), the
   smoke archive filename. The smokes are the arbiter (they get updated with the new prefix; every
   OTHER ledger string stays). Alternative kept on the table: keep "mdash" as the family's original.
   The user decides; if renamed, ONE agent does it.
6. **The commonalization pass (Package 12-REVISION)** - abstract the repeated machinery: the write
   paths (the built-in write tool's resolve→write-intent→policy→writeText→observed pipeline mirrored
   verbatim by the raw-write tool; the factory's GuardedWrite; the governance chain-pass writes)
   into ONE shared executor (the factory's natural home), plus the broader audit (the activation
   compositions, the smokes' fake-ctx harnesses across eleven suites, the deferred update-stage
   envelopes).
7. **The file-content normalizer flavor** - rewriting family characters in
   files ALREADY on disk (beyond the tool layer).
8. **P5 storage journaling for the normalize family** - the `normalized N ... char(s)` events into
   the shared
   [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain)
   (new event names → a domain version bump).
9. **The update-stage envelope extraction** - the governor/cargo Dispatch/Settle sharing via the
   core (the deferred P3 candidate).
10. **Further flavors** (optional) - bullets/dots, control characters, emoji, case - new siblings on
    the same machinery.
11. **The bump+pin follow-ups** - the next dependency review cycle (the toolchain can bump again;
    the @deepseek-ai family pins to the HOST ERA - verify from app.asar, never the stale
    ~/.dsh/profiles/node_modules, whose @deepseek-ai symlinks are broken; the registry's dsh-*
    "latest" dist-tag (0.0.1-rc.1) is stale - ignore it); the profile's stale node_modules cleanup
    (a future housekeeping, out of the family's scope).
12. **THE ANONYMIZATION + RELEASE-PREP PASS (user-requested 2026-10-06)** - the plugins are about to
    be released as SEPARATE REPOSITORIES under one "DeepSeek Harness Plugin Family for PlayForm".
    Scope: (a) COMPLETELY ANONYMIZE + DE-PERSONALIZE the release versions: remove every reference to
    the user's name and the personal use case from the twelve bundles' READMEs, SCHEME.md docs,
    Source comments, package.json descriptions, and the bundle [cordis.patch.yml][ours-cordis-patch] examples (the "just
    for me" language, the personal home paths, the volume paths, the user-specific fixture names).
    The RUNTIME ledger strings stay byte-identical (the smoke contract); the LIVE profile's own
    [cordis.patch.yml][ours-cordis-patch] values keep the user's paths (the release ships GENERIC defaults - the patch
    files' config values become per-user/example); (b) RE-STRUCTURE the READMEs BETTER with the
    README conventions (the badges, the install/usage/API/license skeleton) applied to the family's
    unified skeleton); (c) the release framing: each bundle = one repository, the family brand
    "DeepSeek Harness Plugin Family for PlayForm" in the README headers + the Where-It-Fits
    sections. Do this BEFORE the release; the smokes are NOT affected (docs + comments + release
    metadata only). The READMEs' literal In Action examples (the raw-write workflow) stay.
13. **THE EFFECT-TS V4 RE-IMPLEMENTATION (user-requested 2026-10-06, for TOMORROW 2026-10-07)** -
    completely re-implement the whole family with **Effect-TS version 4** (ALL of it has to be
    replaced with Effect-TS): the goals are (a) to be able to hook into OTHER TRANSFORMERS from the
    same ecosystem (the Effect ecosystem's processors/transformers), (b) EXTERNAL TRACE-ABILITY
    (Effect's tracing - the pipeline spans/tracing for the family's chains, the compositional loops,
    the ledgers), and (c) ECOSYSTEM INTERACTION (the Effect-TS ecosystem's interop). Constraint:
    KEEP THE CURRENT IMPLEMENTATION ONBOARD - the existing family stays live (the profile, the
    smokes, the ledgers) while the Effect-TS version is developed alongside (a dual implementation -
    the Effect-TS version ships as its own set of bundles/modules, smoke-covered, before any
    switchover; the swap to Effect-TS happens only after its smokes prove parity). The mapping
    surface to plan tomorrow: the core's pure helpers (Replace/ReplaceMap/the tables, the Update
    envelope, Activate, Suppress, the Stream gate) → Effect's pure pipeline/Effect/Stream
    constructs; the factory's service machinery (State/Append/Journal/
    Write/Govern/Continue/Refresh/Attach/Wire) → Effect services + layers
    - Effect's tracing; the governance chain (the compositional loops, the
      [fs/observed][dsh-fs]
      event path, the direct Govern path, the idempotence/ version guards) → Effect's typed
      effects + the tracing spans; the ledger strings stay the smoke contract (byte-identical) in
      BOTH implementations. Research first (the Effect v4 constructs + the DSH hook seams), then a
      coder package per bundle, the smokes as the arbiter, nothing committed by agents. THE RESEARCH
      SOURCES (user- pointed 2026-10-06): the local effect-ts v4.0.1 monorepo checkout
      (`packages/effect` the core (Effect/Layer/Stream/Fiber/Tracing), `packages/ai` the LLM
      integration, `packages/opentelemetry` the tracing, `packages/ platform` the fs/services,
      `packages/sql` + `packages/tools` the ecosystem transformers, `packages/vitest` the testing),
      the local effect-ts-website checkout (the docs site content), the local effect-ts-examples
      checkout (the worked examples incl. create-effect-app), plus the existing deepseek-harness
      docs checkout (the DSH seams the Effect-TS hooks must implement).
14. **THE PARALLEL-GOVERN TOGGLE (user-requested 2026-10-06, for BOTH the NORMAL and the EFFECT-TS
    versions)** - [the direct-govern path][ours-govern] is currently SEQUENTIAL (the awaited fold: each step's
    chain completes before the next reads - the live-verified race fix; the EVENT path is inherently
    concurrent, bounded by the version guards + the idempotence). Future: a per-call TOGGLE to run
    the direct-govern steps CONCURRENTLY (`Promise.all`) when the caller KNOWS the chain's
    propagation is race-free - the safety condition to document: the selected steps' writes must not
    conflict (same-file steps like canonicalize+pin on one package.json DO race - the version guards
    make the outcome nondeterministic; disjoint targets/basenames or verified transform disjointness
    are the parallel-safe cases). The default stays [the sequential fold][ours-govern]; the toggle rides the same
    `govern` flag shape (e.g. a `govern.parallel` marker or a separate option) in BOTH
    implementations - design it into the Effect-TS version's layer/effect composition from the start
    (Effect's `Effect.all`/`Fiber` concurrency is the natural home) and retrofit the normal version
    with the identical semantics; the smokes cover both modes (the sequential order assertions + the
    parallel race-verified scenarios).
15. **THE REVERSED HIERARCHICAL NAMING (user-requested 2026-10-06, for the NEW versions)** - reverse
    the hierarchical order of every package name so that, read as a sentence with each word a
    segment, it reads as "<kind> @ <platform> @ <role> @ <domain>": `dsh-hook-cargo-governor` →
    [hook-dsh-governor-cargo][ours-hook-dsh-governor-cargo] ("Hook @ DSH @ Governor @ Cargo"), applied to ALL:
    `dsh-plugin-factory` → [plugin-dsh-factory](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source); `dsh-hook-core` → `hook-dsh-core`;
    `dsh-hook-package-governor` → [hook-dsh-governor-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/Source); `dsh-hook-package-pinner` →
    [hook-dsh-pinner-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-pinner-package/Source); `dsh-hook-cargo-governor` → [hook-dsh-governor-cargo][ours-hook-dsh-governor-cargo]; the normalize
    family → `hook-dsh-normalize-{dash,quotes,ellipsis,spaces,invisible,fullwidth, file}`.
    Alphabetically the names then group perfectly: the kind (hook/plugin) first, the ROLE families
    contiguous (core, governor- cargo/governor-package, normalize-*, pinner-package,
    plugin-factory), the domain sorting within each family. The ORCHESTRATOR's PROPOSAL (user asked
    for a better nomenclature - decide): (a) the KIND TAXONOMY: `plugin-` (the factory service),
    `hook-` (the behavioral hooks), `lib-` for the pure core (`lib-dsh-core` - "Lib @ DSH @ Core" -
    it is not a hook); (b) the DOMAIN WORDING: `package` → `manifest` for the release clarity
    (`hook-dsh-governor-manifest`, `hook-dsh-pinner-manifest` - "Governor @ Manifest"; "package" is
    ambiguous), keep `cargo` as-is; (c) the README titles show the @-sentence hierarchy ("Hook @ DSH
    @ Governor @ Cargo") as the release identity. Applies to the new normal + Effect-TS versions
    (#13) - the current names stay until the release switchover.
16. **THE SUBMODULE STRUCTURE + THE GITIGNORES (user-instructed 2026-10-06)**
    - NO COMMITS FOR NOW (everything stays on disk; the user's repo was initialized at the monorepo
      root but nothing is committed yet). The future structure: each release package becomes a
      SEPARATE REPOSITORY, added to the parent as a SUBMODULE (the DeepSeek monorepo repo = the
      parent; the Classic + EffectTS packages + the Site + the Boilerplate are the submodule
      candidates - the user decides the exact set). The cleanup + the GITIGNORES per repository come
      with the submodule setup: each package repo's .gitignore (the node_modules, the per-bundle
      pnpm-lock? - the release packages' conventions; the EffectTS bundles' Target/ IS the publish
      artifact - decide), the monorepo parent's ignores (the docs? the Test? the scratch), and the
      submodule registration (git submodule add per package). The monorepo's full state
      (Boilerplate/Classic/EffectTS/ Site/Test/docs) remains unversioned until then - the user
      commits nothing; agents never commit (regime).

## THE REGIME (unchanged)

All development through coder subagents; the smokes are the arbiter; the USER commits; the desktop
profile carries the eleven packages.

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
[ours-cordis-patch]: https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml
[ours-govern]: https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts
[ours-hook-dsh-governor-cargo]: https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-cargo/Source
