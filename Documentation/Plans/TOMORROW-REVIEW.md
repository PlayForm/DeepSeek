# TOMORROW-REVIEW - The Descriptive Plan (preserved 2026-10-07 for tomorrow's review)

> The complete state + the plan for the next session. The user will run the
> whole process again - this document is the descriptive reference: what
> exists, what is in flight, what is missing, and how tomorrow's process
> runs. Originally preserved at the monorepo root; now migrated into
> `Documentation/Plans/` with the rest of the documentation tree.

---

## 1. THE CURRENT STATE (what exists)

**The monorepo** (`~/Developer/Application/PlayForm/DeepSeek/` - the git
repo inited by the user, everything STAGED or MODIFIED, NOTHING COMMITTED -
the user holds all commits):

| Area | State |
|---|---|
| **Boilerplate/** | The reference: 12 bundles + 12 smokes (the original `~/.dsh` copies, the personal paths intact - the internal baseline, NOT anonymized; decision pending: gitignore it or its own private submodule) |
| **Classic/** | The release: 12 packages under the #15 names (`plugin-dsh-factory`, `hook-dsh-core`, `hook-dsh-governor-package`, `hook-dsh-pinner-package`, `hook-dsh-governor-cargo`, `hook-dsh-normalize-*`), anonymized (#12 - zero personal references in the release docs; one residual: the governor's `ncuBin` default VALUE, a smoke-asserted code constant), the Aphrodite-borrowed READMEs, v0.0.1, all 12 smokes green (core 14 / factory 34 / governor 78 / pinner 32 / cargo 62 / normalize-file 71 / six flavors 62 each / dash 132) |
| **EffectTS/** | The release: all 12 packages on Effect v4.0.1, parity-green (core 17 / factory 41 / governor 81 / pinner 32 / cargo 62 / normalize-file 71 / six flavors 62 each / dash 132 - the same assertions as the Classic + additive coverage), the opt-in tracing (`@effect/opentelemetry` NodeSdk + OTLP, no-op default, hygiene-proven), the #14 parallel marker (sequential default), v0.0.1 |
| **Site/** | An Astro fork of PlayForm/Starter (the user merged Fork/Current into Current); the build fixed (the @Stylesheet alias wiring + the CSS-chunk pruning fix); the Reference + Stitch adaptations woven in (9+ pages: index, plugins/products, versions, flavors, models, workbench, matrix, package detail, brand - the brand page being removed per the user); the Cloudflare readiness (wrangler.toml, _headers, 404, the deployment README) - THE CORRECTNESS AGENT IS MID-PASS (the Products→Plugins rename + the real package-docs adoption + the direction updates + the content-voice rule + the /brand/ removal) |
| **Test/** | The family-only fixture archive: `fixtures/manifest/` (the governed-chain, governed-test, cargo-fixture, the sandbox-root manifest), `fixtures/markdown/` (the mdash, raw-marker, raw-write, tool-args, granular-normalize, normalize-file proof fixtures), `probes/raw-write-probe/` + the README index - the unrelated experiments (the coder/locktree/prun trees, the node_modules litter) removed |
| **Documentation/** | The handoff restructured into `Handoff/` (Overview, Packages/ 01–13, the 16-item Register, the Lessons), the reports (AUDIT/DELIVERY/DIAGNOSIS/FLAVOR-DESIGN in `Reports/`), the plans (this document, the monorepo plan, the CASE-STUDY-PLAN in `Plans/`), the Governor guides (`Guides/`), the BRANDING (`Brand/`), and the skill tree (`Skill/`) |
| **Formatting** | The monorepo standard: TABS everywhere (the Land + Aphrodite merged config - useTabs/tabWidth 4, printWidth 100; YAML must stay spaces - the spec constraint), the .prettierrc/.prettierignore/.editorconfig/.npmrc/.gitignore + Maintain/Format.sh + the format scripts |
| **The live `~/.dsh` family** | Untouched and live through every restart - the 12 bundles + the profile |

**The smoke counts** (the three implementations, all green):

```
Boilerplate: core 14 / factory 34 / governor 78 / pinner 32 / cargo 62 /
             normalize-file 71 / six flavors 62 each / dash 132
Classic:     the same counts (the identical assertion sets)
EffectTS:    core 17 / factory 41 / governor 81 / pinner 32 / cargo 62 /
             normalize-file 71 / six flavors 62 each / dash 132
```

## 2. THE IN-FLIGHT WORK (when this document is written)

1. **The Site correctness pass** (cc3ece2f) - COMPLETE: the
   Products→Plugins rename, the twelve `/plugins/<package>/` pages from
   the REAL Classic READMEs, the usage/integration emphasis (the
   before/after showcases + the truthful injection points - the Seams
   tables), the functionality-adapted content (the real benchmarks:
   "12 suites · 671 checks · ALL PASS" (Classic) + the exposed failure
   cases + the solutions), the content-voice rule, the /brand/ removal,
   and the `/setup/` page (the 4-step profile wiring + the configurable
   surface + the optionality + the ledgers table). 20 pages.
2. **The case-study research** - COMPLETE
   (`Documentation/Plans/CASE-STUDY-PLAN.md`).
3. **The third pass case-study agent** (76a9cc4a) - COMPLETE: the
   `/case-study/` narrative page (the 8-phase arc + the in-page index +
   the 13-row decision table incl. the signal-mapping beat + the
   lessons), the nav (Overview, Plugins, Setup, Versions, Flavors,
   Models, Case Study, Workbench), the setup page's truthfulness
   completions (the pnpm-workspace trap, the removed --dump-config
   claim), the site at 21 pages. Precision: the smoke totals - Classic/
   Boilerplate 733 checks, EffectTS 808 (~800) - the case-study's
   "~800" refers to the EffectTS total.
4. **The Test/ rebuild** (65e17808) - COMPLETE: the curated family-only
   archive (fixtures/manifest + fixtures/markdown + probes + the README
   index), the unrelated experiments removed, the kept fixtures moved
   not rewritten.
5. **The skill tree** - COMPLETE: `instructional-writing`,
   `plugin-system`, `smoke-writing` - each a `<name>/SKILL.md` bundle
   under `Documentation/Skill/` (the project's skills home - loadable
   via the filesystem provider's scanned roots; the TOMORROW process
   verifies the loadability from that location); the raw-marker-fixture2
   restored with its literal typography via the raw-write tool.

## 3. THE KNOWN MISSING / THE OPEN DECISIONS (the "missing quite a lot")

1. **The submodule structure (#16)** - each release package becomes a
   separate repository, added as submodules; the per-repo gitignores;
   the monorepo's own gitignore currently anticipates it. NOT STARTED.
2. **The Boilerplate's gitignore decision** - exclude it from the
   parent repo (the internal reference stays personal) or a private
   submodule.
3. **The governor's `ncuBin` residual** - the CORSAIR path in the
   governor-package's Config default (a smoke-asserted code constant) -
   re-pin + rebuild when the releases must be fully clean.
4. **The naming refinements (#15)** - the `lib-`/`manifest` proposals
   (lib-dsh-core vs hook-dsh-core, manifest vs package) - UNDECIDED;
   the Site + the READMEs currently use the user's exact approved names.
5. **The releases' polish** - the per-package publish configs (the
   registry, the publish flow), the license/attribution per repo, the
   CHANGELOGs.
6. **The site's remaining feedback** - the review of the correctness
   agent's output (the user's directions: the usage/integration demos,
   the before/after showcases, the truthful injection points, the
   functionality-adapted benchmarks, the case-study third pass).
7. **The known engineering gaps** (the working lessons):
   - The smoke/live fidelity gap (the smokes prove the mechanics; the
     live battery proves the wiring - the live findings came from the
     battery, not the smokes);
   - The load-order nondeterminism (the pinner activates before the
     governor at this boot - the fold + the fresh-version writes make
     the order irrelevant, but the registration order isn't controlled);
   - The `update stage` verifyCommand failures (the documented cordis
     registry trap - the vendored forks);
   - The subagent stalls (the reading-loop pattern - the recovery: the
     scaffold-first + bounded-reading prompts);
   - The local/UTC timestamp confusion in the storage records.
8. **The register's still-open items**: #12's residuals, #13's
   follow-ups (the EffectTS's per-package polish - the READMEs'
   "zero runtime dependencies" line for the core), #14 (the parallel
   smoke coverage in the Classic), #16 (above).

## 4. TOMORROW'S PROCESS (the re-run)

The user will run the whole process again - the review-driven pass:

1. **The review**: the user reviews the preserved state (this document +
   the handoff + the site) - the staged/modified tree (nothing
   committed), the correctness agent's output, the case-study third
   pass's output.
2. **The case-review agent's mandate** (user-set 2026-10-07): the review
   of the case study must EMPHASIZE THE STRUCTURE OF WHY IT WAS WRITTEN
   LIKE THIS - the structural rationale (why the architecture/decisions
   are shaped the way they are), NOT the HOW (the process mechanics).
3. **The site fixes**: the `/workbench/` page does not work (user-flagged
   2026-10-07 - reproduce on the dev server, repair or rebuild per the
   designed functionality); the site's remaining feedback per the
   directions. THE TYPOGRAPHY DIRECTION (user-set 2026-10-07, for the
   site-fix agent): INCREASE THE FONT SIZES, NEVER text-xs (no tiny
   10-12px text); NO JetBrains Mono - use another open-source + sharper
   mono where a mono is genuinely needed (IBM Plex Mono - the
   CodeEditorLand/WebSite's choice), otherwise a great SANS for the
   larger headings + NORMAL TEXT SIZES for the smaller ones; borrow
   heavily from `~/Developer/Application/CodeEditorLand/WebSite`'s
   design (its type system + conventions).
4. **The corrections**: the review's findings land as new packages
   (agents + the smokes/site-build as the arbiter).
5. **The finishing work**: the submodule structure (#16), the gitignores,
   the ncuBin re-pin, the naming refinements, the releases' publish
   polish (the per-repo conventions: the CC0 LICENSE + CONTRIBUTING +
   CODE_OF_CONDUCT + CHANGELOG - adopted at the monorepo root, carried
   to each repository).
6. **THE FULL-FILE ANONYMIZATION SCAN** (user-instructed 2026-10-07):
   the user removed the "~/Developer/" links and text themselves - an
   ANOTHER ANONYMIZATION AGENT runs tomorrow to scan ALL files for the
   remaining personal references (the "~/Developer/", the
   "/Volumes/CORSAIR", the "/Users/nikola", the "Nikola" mentions, the
   personal use-case language) and removes them (the smokes/site-build
   as the arbiter; the smoke-asserted code constants (the ncuBin value)
   re-pinned + rebuilt per the decision).
7. **THE GRANULAR INCONSISTENCY SCAN** (user-instructed 2026-10-07) -
   the MOST GRANULAR agent to discover the inconsistencies + the
   peculiar details missed. CONCRETE STARTING RESIDUES (quantified):
   - THE CC0 ADOPTION: 49 files still carry "MIT" - the 24 package.json
     `"license": "MIT"` fields (Classic + EffectTS), the READMEs'
     shields.io license badges (MIT), the Site's badge references - the
     CC0 sweep.
   - The code inconsistencies: the cross-implementation drifts, the
     stale version badges, the remaining absolute paths in the
     non-asserted places, the old-name residues outside the Boilerplate,
     the README/SCHEME/package.json mismatches, the EffectTS-vs-Classic
     doc drift, the peculiar details (the stale counts, the leftover
     references) - sweep EVERYTHING + report the full findings with the
     fixes (the smokes/site-build as the arbiter).
8. **THE TERM-LINKING AGENT** (user-instructed 2026-10-07): a separate
   agent links the technical terms - `LlmRuntime`, the `StreamChunk`
   vocabulary, the `fs/observed` + `fs/write-intent` events, the
   `llm/stream` waterfall, the dsh-* packages, the cordis Context, the
   storage domain, the seams - ACROSS the website + the READMEs + the
   documentation into the ACTUAL `https://github.com/deepseek-ai/
   deepseek-harness` repository, using the
   `https://github.com/deepseek-ai/deepseek-harness/tree/master/...`
   links (the agent verifies the repo's actual tree paths first - the
   terms map to the matching source files/dirs; every linked term
   resolves; no dead links; the surrounding prose unchanged).
9. **THE OUR-REPO TERM-LINKING AGENT** (user-instructed 2026-10-07,
   AFTER item 8): a second linking agent maps the SAME terms (the ones
   we use in OUR code repository - LlmRuntime, the stream vocabulary,
   the events, the seams...) to OUR OWN repository's tree -
   `https://github.com/PlayForm/DeepSeek/tree/Current` links (the
   monorepo's GitHub repo, the Current branch) - each term links to the
   matching source in our tree (the packages' Source files, the docs,
   the site).
10. **THE LYCHEE LINK-CHECKING METHODOLOGY AGENT** (user-instructed
   2026-10-07): a separate agent FULLY implements the link-checking
   methodology through lychee - exactly like the
   `~/Developer/Application/CodeEditorLand/Land` lychee setup does
   (the lychee.toml + the report conventions - read Land's lychee.toml
   + the lychee-report.md as the reference) - WITHOUT disclosing the
   source: the methodology adopted (the config, the CI/script, the
   report format) for the DeepSeek project, no attribution to Land.
   The full link verification across the site + the READMEs + the docs
   (incl. the two linking agents' links) with the report generated.
11. **THE DISCLOSURE-CLEANUP AGENT** (user-instructed 2026-10-07):
   a cleanup pass over the disclosure/attribution statements - e.g.
   where the docs/site say "borrowed from" / "adopted from X" - even
   though the sources are the USER'S OWN projects
   (`~/Developer/Application/CodeEditorLand/*`, the style repositories
   like Aphrodite, Compress, and the others): the disclosure passes
   get cleaned per the user's preference (the attribution statements
   adjusted or removed where the sources are the user's own - the
   methodology stays, the attribution prose cleaned; the site's
   DESIGN.md's source attribution + the docs' "adopted from" notes are
   the starting points).
12. **The live battery**: the whole family re-verified live (the ledgers,
   the interlock, the escape hatch, the direct-govern, the v2 domain)
   after any source change - the `~/.dsh` originals stay live.
13. **The commit protocol**: the user commits (incrementally per folder
   with `git gcommit-hermes` when they decide); the agents never commit.
14. **THE README AGENT** (user-instructed 2026-10-07, in the queue AFTER
   the corrections): the monorepo root `README.md` + the other READMEs
   (EffectTS/README.md, Boilerplate/README.md - both MISSING - and the
   alignment of the existing Classic/README.md + Test/README.md) - in
   the STRUCTURE + STYLE of `~/Developer/Application/PlayForm/Aphrodite`
   (its section flow: Install, The Problem, How It Works, Architecture,
   Tools, Configuration, Performance, Contributing, License) but with
   the DeepSeek style (the terse, factual, hyphenated voice; the tabs
   formatting; the @-sentence vocabulary; the ledger-string contract;
   the VERIFIED smoke totals 733 Classic / 746 EffectTS - never the
   stale 671/795/808 figures; NO attribution prose - Aphrodite is the
   user's own; NO personal paths) - describing FULLY what the plugins
   do (the 12 packages, the three implementations, the seams, the
   stream gate, the governance chains).
15. **THE NPM PUBLISHING AGENT** (user-instructed 2026-10-07 - LATER,
   a separate future session): allow publishing the packages to npmjs
   for easy installation. NOT dispatched in this batch.
16. **THE RESTRUCTURING AGENT** (user-instructed 2026-10-07, in the queue
   AFTER the corrections agent, applied SYSTEMATICALLY ON EACH PAGE):
   the diagram-first concept-block treatment - one independently
   explainable concept per block, each block in the order: a visible
   diagram placeholder (dashed, with a stable `data-diagram` id +
   implementation instructions for a future diagram agent) → a short
   descriptive heading → one or two short paragraphs explaining only
   that concept. Preserve technical meaning, identifiers, literals,
   caveats ("may"/"only"/"never"); separate ownership, composition,
   policy, activation, entry points; keep sequential steps together;
   no repetition; semantic elements + CSS gaps for spacing (never <br>
   or line breaks); <code> for identifiers; quotes of ledger strings
   stay byte-exact. PLUS: replace ALL ASCII arrows (the "→" and "->"
   glyphs) with actual colored visual icons (an inline SVG arrow icon
   in the Harness Blue, sized to the text) except where the arrow is
   part of a code/ledger literal. The site-wide sweep: every page's
   dense prose + every arrow occurrence (191 "→" + 82 "->" measured).
17. **THE DIAGRAM-IMPLEMENTATION AGENT** (noted for a later batch): the
   diagram placeholders get implemented as real diagrams per their
   data-diagram ids + embedded instructions. NOT dispatched yet.
18. **THE SYNTAX-HIGHLIGHTING AGENT** (user-instructed 2026-10-07, in
   the queue AFTER the restructuring agent): add syntax highlighting to
   the code/JSON/YAML blocks on the site pages (e.g. /setup/ - the JSON
   currently looks unhinted). BORROW the
   ~/Developer/Application/CodeEditorLand/WebSite approach (verified:
   Astro markdown + Shiki, `syntaxHighlight: "shiki"`, `theme:
   "github-dark"`, the `--shiki-dark` CSS-variable bridge in its
   Base.astro) - adapted for the site's manual <pre><code> blocks in
   .astro pages (e.g. Shiki's codeToHtml in the frontmatter, or the
   markdown route) - with the DeepSeek style (the Harness Blue voice,
   the bumped typography, IBM Plex Mono for code). No attribution
   prose (the WebSite is the user's own).

## 5. THE RUNNING FACTS (for the re-run)

- The family: 12 packages × 3 implementations (Boilerplate / Classic /
  EffectTS) + the Site + the Test archive + the Documentation tree.
- The names: the #15 reversed hierarchical naming (the @-sentences:
  Hook @ DSH @ Governor @ Cargo...).
- The versions: all release packages at 0.0.1.
- The ledger strings: the byte-identical smoke contract across all
  three implementations.
- The formatting: tabs everywhere (YAML excepted).
- The regime: development through coder subagents; the smokes + the
  site build as the arbiters; the user commits; nothing committed by
  agents.
