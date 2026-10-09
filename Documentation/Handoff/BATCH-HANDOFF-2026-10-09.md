# BATCH HANDOFF - 2026-10-09 (the re-focus brief)

> The complete state for a NEW conversation: the project's final state, the IDLE
> agents + their specs, the user's feedback (addressed + pending), the decisions,
> and the future work. The new conversation loads the skills (idle-agent-protocol,
> orchestrator-batch, worker-strains, task-routing, harness-observability) + this
> brief + resumes the queue one lane at a time (or per the user's direction).

## 1. THE PROJECT STATE (green)

- The monorepo /Volumes/CORSAIR/Developer/macOS/Application/PlayForm/DeepSeek
  (branch Current - the user commits; the agents never commit).
- The family: 12 packages x 3 implementations (Boilerplate = the internal baseline,
  Classic + EffectTS = the releases) - the 24 smokes GREEN at Classic 733 /
  EffectTS 746 - the tsc-free build (the @playform/build-only process mirroring the
  NPM tools - the tsc -p forbidden - committed 1cab7a7/c206dad).
- The site: 21 pages green (the dark theme, 259 diagrams, the concept blocks, the
  showcases + the Compare sliders, the token systems, the mobile nav, the official
  marks incl. the Zhipu mark (landed 2026-10-09), the stats band, the hover-pause,
  the full-width use-cases, the deployment via the classical Cloudflare Pages, the
  footer + the JSON-LD "PlayForm Cloud" + the "DSH Family @ PlayForm" brand).
- The provenance: the hermes/Compress/Land/borrowed references REMOVED everywhere
  (the release surface + the residuals - the sweep-clean proof).
- The queue records: TOMORROW-REVIEW.md (the process record), the DUAL-SOURCE-
  BUNDLING.md, the BATCH-STATE-PLUGIN.md, the ROUTING-ENFORCER-PLUGIN.md, the
  CASE-STUDY-PLAN.md, the DSH-REGISTRY-LISTING.md.

## 2. THE IDLE AGENTS - ALL 8 LANES CLOSED (2026-10-09, this session)

The full queue landed + verified + closed (each Tasks/ file carries its record):
1. FILE-MENTION ALIGNMENT - VERIFIED (the baseline-source fix 5ddb6e2c: 74/76
   measurements at 0.0px drift via the committed baseline-measure.cjs; the 2
   pinner.log 1px cases recorded as the user's call).
2. EFFECT-CARD-FOOTER - VERIFIED (7fb6a862: the white glyph + the 16px footer
   clearance, both themes - no edits needed).
3. PIN-GOVERN COLORS - COMPLETE (the --color-pin-red token + the word-level
   treatment; committed 960fcede).
4. DESCRIPTIVE-TITLES - COMPLETE (the headline-lg grayed titles + the info
   icon; committed 960fcede).
5. HEADER-BRAND - COMPLETE (the rename across 27 files + the gap step;
   committed 960fcede).
6. PATH-MENTION - COMPLETE (the IsPathEmbedded rule + the hardcoded-span sweep;
   committed 960fcede).
7. ZHIPU-ICON - COMPLETE (the official Z.ai mark + 7 built placements;
   committed 0506601f).
8. ENGINE-PILL - COMPLETE (the lift-rule removal - measured -2.1..-2.6px before
   / 0.0..+0.5px after; committed 0506601f).

## 3. THE USER'S FEEDBACK - ADDRESSED (the requirements' resolutions)

| Feedback | Resolution |
|---|---|
| The typography (bigger, no text-xs, no JetBrains Mono, IBM Plex Mono) | Global.css tokens (13px floor, Inter + Plex) |
| The workbench broken | Seeds scope fix (the frontmatter/script split) |
| The Stitch comprehensiveness + dynamism | The full component inventory + the motion language + the hover-pause |
| The stream preview overflow | The bounded left-right stage (fixed heights, the trim guard) |
| The concept-block restructure (every page) | 260+ blocks + the Concept.astro + the diagram pipeline (259 diagrams) |
| The ASCII arrows -> icons | The ArrowIcon sweep (105+) |
| The RAW orange + only-RAW rule | The accent-orange token + the word-level RAW treatment (everywhere - the global sweep verified) |
| The FLAVOR labels + version chips (orange word, black badge, right-aligned) | The FlavorBadge + the --gap-icon + the cell grid + the black/white chip |
| The orange rails + the PAUSED split | The rail-orange + the PAUSED-word-only orange |
| The LIVE-DOT conflict | The tray markers only (the Dot prop removed structurally) |
| The logo (official Asset glyph) + the P avatar | The header's official glyph + the hamburger + the mobile nav (the contract fix) |
| The dark theme | The full token block + the toggle + the shiki bridge |
| The file icons + log chips | The file-type icons + the Mention renderer + the log chips (the path rule LANDED - lane 6) + the baseline alignment (lane 1 - the baseline-source fix verified 74/76 at 0.0px) |
| The unicode/code-token identity | The .code-token system + the Mention pass |
| The copyright + JSON-LD | "© 2025 PlayForm Cloud" everywhere |
| The provenance removal | The hermes/Compress/borrowed zero everywhere |
| The tsc -p forbidden | The @playform/build-only process (the NPM-tools mirror) |
| The grids' overflow | The minmax(0,1fr) sweep + 126/126 measured |
| The use-cases full width | The wide showcase cards + the Compare slider |
| The 2x2 wiring grid | The install-demo grid |
| The heading-after-text spacing | The section-kicker clearance rule |
| The line-break rendering | The paragraph spacing law (the blank-line separation) |
| The entity leaks | The real characters + the JS-expression props |
| The PIN/GOVERN/NORMALIZE colors | ADDRESSED (lane 3 - 2026-10-09: the --color-pin-red token #C62828/#E57373 + the word-level .word-pin/.word-govern/.word-normalize treatment - the kicker + the card titles + the identity labels; the control labels left neutral by judgment) |
| The descriptive titles | ADDRESSED (lane 4 - 2026-10-09: the headline-lg grayed descriptive titles + the created info mechanic icon on the left - the concept/era-story/showcase coverage, the SectionHeader h2s untouched) |
| The DSH Family @ PlayForm | ADDRESSED (lane 5 - 2026-10-09: the rename across 27 files + the header gap token step; committed 960fcede) |
| The Zhipu icon | ADDRESSED (lane 7 - 2026-10-09: the official Z.ai mark sourced from the docs.z.ai brand asset + the "zhipu" BrandIcon + 7 built marks across index/models/workbench/matrix) |
| The engine-pill alignment | ADDRESSED (lane 8 - 2026-10-09: the optical-lift rule removed - measured -2.13..-2.63px before / 0.0..+0.5px after; committed 0506601f) |
| The path-mention icon | ADDRESSED (lane 6 - 2026-10-09: the IsPathEmbedded rule - path-embedded mentions plain, the bare ones iconed; committed 960fcede) |
| The effect white-on-blue + the footer padding | ADDRESSED (lane 2 - 2026-10-09 verified: the white glyph + the 16px footer clearance, both themes, no edits needed - the fix committed 7fb6a862) |
| The info icon's scope (2026-10-09 - NEW feedback) | ADDRESSED (lane 4 RE-DISPATCH: the Showcase revert landed + verified - 0 info icons on the index's use-cases cards (was 3), the 45 kept on the case-study, the identity-word colors intact; the card titles restored to their card-name styling) |
| The hero tagline's top padding (2026-10-09 - NEW feedback) | ADDRESSED (the h1.hero__title gained padding-top: var(--space-xl) - 24px - the badge-row clearance, both themes, token-based; verified in the built CSS, the tagline byte-exact) |
| The DeepSeek mark on the battle-tested line (2026-10-09 - NEW feedback) | ADDRESSED (the deepseek mark before the DeepSeek V4 Flash mention on the battle-tested line - index:388 + models:114, symmetric to the zhipu one; verified in the built HTML: the mark sits right before the mention, the counts index deepseek 2/zhipu 1, models deepseek 3/zhipu 4) |
| The workbench engine selection inert (2026-10-09 - NEW feedback) | ADDRESSED (the Ingest-source pills now drive the simulation: the per-engine seed pools + tick rates - deepseek 900ms original seeds, glm 450ms flash seeds, raw 1400ms dirty seeds - the click handler switches the pool + cadence; headless click-through verified: distinct output per engine; the runtime pills' cosmetics + the nominal "120 tps" label recorded as the residuals) |
| The npm icon's size + padding (2026-10-09 - NEW feedback) | ADDRESSED (all 3 inline npm mentions - governor-package:223, governor-cargo:114, plugin-dsh-factory:542 - sized to 0.75em (the wide 3.12-aspect wordmark) + the new .page-hero__sub .brand-icon--npm margin-inline: var(--gap-icon) rule for the both-sides padding; the rule + the sizing verified in the built output, text bytes untouched) |
| The literal _ underscores in the prose (2026-10-09 - NEW feedback) | ADDRESSED (12/12 leaked "_The DeepSeek Harness Plugin Family for PlayForm._" runs - one per plugin page's page-hero sub - now render as the <em> emphasis, markup-level surgical (2 substitutions per file), the legit identifier underscores untouched; verified: zero literal underscore runs in the built output, the <em> on all 12 pages; the stale astro dev lock (port 10001, PID 21884) noted as the residual) |
| The info icons' right padding (2026-10-09 - NEW feedback) | ADDRESSED (the 15 info-icon placements - the Concept titles + the pinner page's 14 concept-block titles incl. "Family position" - the icon-title gap widened --gap-icon (4px) to --space-sm (8px) in both unit rules, the text pushed inward; verified in the built CSS (both rules carry gap:var(--space-sm)); the next step --space-md (12px) noted as available) |
| The setup page's JSON minified + the code blocks unhighlighted (2026-10-09 - NEW feedback) | ADDRESSED (the minified one-liner was the InstallDemo step-1 screen - the build's HTML minifier collapses newlines in regular element text; the screens now render as <pre> (InstallDemo + the same latent collapse fixed in Compare + Showcase), verified byte-exact in the built output (real newlines + the indents); the syntax highlighting was NOT broken - the live deployed page carries the shiki markup (151 refs/139 spans, both themes) - the user's report was a stale cache or the unhighlighted demo screen; appears on deploy) |
| The live-data dynamism (2026-10-09 - NEW feedback) | ADDRESSED - VERIFIED (the full-repo sweep found exactly ONE rendered hardcoded data literal: setup.astro's "All 733 + 746 smokes green" cell - now `All {Totals.Classic} + {Totals.EffectTS} smokes green` from Content.ts, the rendered bytes unchanged; every other version/count surface already flows from Content.ts (StatsBand, FlavorBadge, the page props) - verified StatsBand imports Totals/Versions, FlavorBadge renders Versions.Release, the drift-guard validates the pair) |
| The versions page's distinct purpose (2026-10-09 - NEW feedback) | PENDING (the versions page must STAND OUT as the release/operating-state page - the changelog maintained there + the operating set + the distinct visual, not a plain listing - the VERSIONS-PAGE lane seated) |
| The CLASSIC/EFFECT-TS marks enrichment (2026-10-09 - NEW feedback) | ADDRESSED (the versions hero line now carries the typescript + effect marks via the new additive PageHero "sub-1" slot; the every-page audit: the already-marked surfaces enumerated + the enrichment across index/versions/hook-dsh-core/setup/plugins (7 files); built counts verified (versions typescript 4 + effect 5 etc.); the residuals recorded: the plain-string props with no markup hook + the prose-narrative uses kept plain per the identity-word rule) |
| The header re-order (2026-10-09 - NEW feedback) | ADDRESSED (the nav re-ordered by importance + usage: Overview, Plugins, Workbench, Models, Versions, Setup, Flavors, Case Study - the rationale comment added; the footer + the mobile nav share the array so they match; the built pages verified; /matrix/ was never in the nav - flagged, out of scope) |
| The governor pipeline's long unformatted text (2026-10-09 - NEW feedback) | ADDRESSED (the graph-mechanics conversion landed: the new govpkg-pipeline.mmd diagram - fs/observed trigger → G1 gate (excluded → the ledger line) → G2 discovery → the detached contained G3 chain pass (canonicalize → GuardedWrite → the P3 re-emit) → G4 update stage (programmatic/bin dispatch → verify → the U2 refresh) → silence - rendered via the established pipeline (all labels present, 0 failures) and placed as the "The pipeline, gate by gate" Concept opening the How It Works section, diagram-first; the ASCII code block KEPT byte-exact right below as the reference text; built verification: 21 pages, the page carries 19/19 implemented diagrams) |
| The index's overflow (2026-10-09 - NEW feedback) | ADDRESSED - NO FIX NEEDED (the overflow was a TRANSIENT: the astro preview served the old index.html referencing the DELETED hashed CSS during the concurrent lane rebuilds - the page rendered unstyled (reads as massive overflow); the current build measured ZERO horizontal overflow at 375/768/803/1024/1280/1440, both themes (the only flags are the internally-scrollable trays, by design); a hard refresh resolves it; the recommendation: the lane rebuilds quiesce while the user is looking at 9999 - recorded; the measure script Scripts/index-overflow-measure.cjs added) |
| The batch-residuals fix-all (2026-10-09 - the decision) | ADDRESSED: the pinner.log 1px cases - verified a measurement artifact (real -0.83px, no stylesheet fix possible without regressing the 74 zeros; the script-formula lever is the user's call); the models pills +0.5px -> 0.0px (16/16 measured, the span-vs-button text-item root cause + the tag-qualified rule); the runtime pills WIRED (classic 1 chunk/tick vs the effect fibered 2 - headless-verified divergent + the status line); the "120 tps" honested everywhere (the workbench + the matrix/models sweep - zero tps copy in the built output); the info-icon gap 8->12px (--space-md in both unit rules, built-verified); the stale dev lock: PID 21884 already exited - nothing to kill |
| The separator dots (2026-10-09 - NEW feedback) | ADDRESSED (the REFINED direction: REPLACED with the designed grayed-out bigger dot - the new .dot-sep span (0.375em filled circle, --color-outline gray, both themes, aria-hidden) + the DotSep() renderer; 41 middots across 11 files swept - the kicker keeps the colored words with the gray dots between; built verified: zero raw "·" in any built page, the dot-sep spans per page, the kicker markup confirmed) |
| The URL switch dev/deployed (2026-10-09 - the decision) | ADDRESSED + verified (Links.Site + the astro config site: keyed on NODE_ENV - dev always http://localhost:9999 (the canonical/og:url/JSON-LD/brand verified in dev, zero canonical leakage), the build canonical https://deepseek.playform.cloud (zero localhost in Target, the sitemap https); the user's commit d038d2f6 captured it; the 404 has no URL surfaces; the port-9999 stale preview shows the pre-switch build until restarted) |
| The hero-line marks breaking the text (2026-10-09 - NEW feedback) | ADDRESSED (the root cause: the sub-1 slot rendered as a bare slot inside the flex-column .page-hero - each icon/text run became its own flex item, shattering the line; the fix: the slot renders inside <p class="page-hero__sub"> - the marks stay at the clean 1em prose size, one paragraph with the inline marks (verified in the built HTML); the everywhere check: the other 3 enrichment placements already render inside proper paragraphs) |
| The versions page's distinct purpose (2026-10-09 - NEW feedback) | ADDRESSED (the redesign: the purpose-leading framing ("RELEASE & OPERATING STATE" eyebrow), the OPERATING SET signature band (the Harness Blue ledger - CLASSIC/ EFFECT-TS rows + the honest PENDING ETS-* SPLICE row - not operating until the splice executes), THE RECORD changelog section (the root CHANGELOG.md rendered verbatim - byte-exactness programmatically verified), the state-rail invariants (the listing boxes gone), zero elevation + the tokens, both themes; built + verified (21 pages); the residual: the changelog constant bakes into the page - a build-time read could live-sync it later) |
| The deployed-site freshness (2026-10-09 - the WEBSITE-ADOPTION decision) | ADDRESSED (the diagnosis: NO publish step ever existed in Site/.github/workflows/Node.yml - the root cause of the lag; the RESOLVED approach: the wrangler/Cloudflare-deploy arm was RETRACTED per the user - Cloudflare Pages is AUTO-CONNECTED to the repository via the Pages dashboard integration, so NO workflow publish step, NO deploy command, NO Cloudflare secrets are required; the deploy truth: pushing Current (the user's commit + push) makes the Pages integration build + deploy Target automatically - the freshness fix is simply pushing Current; the residual: the uncommitted Site changes are what the deployed site is waiting on) |
| The DSH-registry listing (2026-10-09 - the future-work item) | ADDRESSED (Documentation/Guides/DSH-REGISTRY-LISTING.md authored fresh - the "filled template" did not exist; the 6 sections: the registry identity + the roster (12 current operating names byte-verified against both trees) + the pending splice namespaces + the byte-exact rule + the publish gates + the residuals (the keywords manifest pass + the GitHub topics are the user's/ npm-lane's calls)) |
| The theme-toggle 768-803px clip (2026-10-09 - the decision) | ADDRESSED + measured (the band rule @media 768-803.98px: the header inner padding 0 var(--gutter-sm) + the nav link padding var(--space-xs) var(--space-sm) - ~40px saved vs the 35.8px overflow; measured BEFORE clipped 35.8px@768 -> 0.8px@803 unclickable, AFTER clip-free + clickable all 8 cases (both themes), the <768 + >=804 layouts byte-untouched; committed by the user a3c54208 incl. the Scripts/toggle-clip-measure.cjs) |
| The underline crossing the space (2026-10-09 - NEW nit) | ADDRESSED (~115 padded anchors across 15 files trimmed flush - the dev-only divergence (the minifier already stripped it in prod); the whitespace lives OUTSIDE the anchors now, the hover underline ends at the last character; the bulk absorbed by the user's commit a3c54208, Base.astro's wordmark trim + the rebuild remain uncommitted; the two exempt cases recorded (the flex brand anchor + the no-underline chips)) |

## 4. THE DECISIONS + THE OPEN ITEMS

- The SYMLINK BREAK (any pnpm install re-links the Classic consumers to the
  EffectTS tree - the durable fix: distinct names per tree / a postinstall relink /
  a preinstall hook - the user's call).
- THE SPLICE PROPOSAL (2026-10-09 - the user's decision candidate, discussed
  with the orchestrator): completely unlink + splice the module family into TWO
  GROUPS - the classical (@playform/dsh-*, no effect) + the effect-ts powered
  (a distinct namespace, a NEW BASE `dsh-hook` carrying the shared effect
  plumbing) - killing the symlink break at the root (distinct names = no
  workspace collision; no postinstall relink/preinstall hooks needed). The two
  OPEN NAMING/REPO QUESTIONS for the user: (a) the registry-valid name for the
  base - "@playform/effect-ts/dsh-hook" as written is INVALID (a scope cannot
  contain "/") - the options: the base @playform/effect-ts + the group
  @playform/effect-ts-hook-dsh-core etc., or the separate scope
  @playform-effect-ts/dsh-hook + @playform-effect-ts/hook-dsh-core; (b) the
  "completely unlink" depth - distinct names within this monorepo fully unlink
  the graphs (names-only), or the EffectTS group moves to its own git repo
  (repos-too - more isolation, more CI duplication). Consequences: the
  DUAL-SOURCE-BUNDLING plan becomes SUPERSEDED (2x12+1 packages published
  separately instead of 12 with the toggle); the site + the READMEs + the
  workflows carry the group's new names (a rename-sweep lane); the smokes stay
  per tree (733/746). Pending the user's answers, the splice-plan lane (the
  planner grade - DeepSeek max, the routing law) turns it into the full plan.
- THE USER'S SPLICE DECISIONS (2026-10-09 - ALL ANSWERED + the lanes seated):
  (a) THE NAMESPACE: `ets-` as the standard pre-pendage in the @playform scope
  - @playform/ets-hook-dsh-core etc., the base @playform/ets-dsh-hook (the
  Effect-TS usage at the Hook for the DSH Core); (b) COMPLETELY UNLINK with the
  whole build triggered by REGULAR dependencies from inside this monorepo (no
  sh scripts); the packages stay NESTED here for development + publish to npm
  from this single repository (inter-dependent - the best case), with the
  per-package submodule repos as the LATER best-case migration; (c) NO DUAL-
  SOURCE BUNDLING - separate sources, separate names (DUAL-SOURCE-BUNDLING.md
  superseded). The lanes: SPLICE-PLAN (the planner - DeepSeek max) ->
  SPLICE-RENAME -> SITE-DOCS-RENAME -> SMOKES-AFTER-SPLICE, all seated IDLE.
- THE OTHER DECISIONS (2026-10-09): the ROUTING discipline stays a SKILL for
  now (the skills turn into mechanistic plugins later - the routing-enforcer +
  batch-state plugins stay in the future work); the FOOTER-LOGO dark-theme
  size increase + the URL-SWITCH (dev always http://localhost:9999, deployed
  the canonical) + the LIVE-DATA dynamism (the versions/counts pull the real
  values) + the VERSIONS-PAGE distinct purpose (the changelog + the operating
  set) + the DEPLOY-ARMING (the Cloudflare Pages freshness) + the DOGFOOD-
  TESTING plan (the ~/.dsh integration suites - no symlinks) - all seated.
- The theme-toggle 768-803px clip (the design call); the footer's dark-mode playform
  glyph; the Boilerplate baseline's NUL bytes (the restore-or-leave call); the
  TOMORROW-REVIEW.md's gcommit-hermes line (the process record - a future-pass
  candidate).
- The maxActiveSubagents is now 10 in ~/.dsh/profiles/desktop/cordis.patch.yml
  (2026-10-09 - raised from 1 per the user: the main conversation may launch up
  to 10 children, seated as IDLE agents (specs retained - they settle + release
  their pool slots), then dispatch work 2 lanes at a time via send_message; each
  lane may spawn AT MOST 2 child subagents - the per-root shared pool (10) is the
  hard backstop against the API flood). The change applied live in-session
  (verified: 2 concurrent verify agents admitted while 1 was still running).
- THE PAUSED-DISPATCH PROTOCOL (2026-10-09 - the rate-limit lesson): launching
  many agents is fine - they must sit PAUSED (never all talking to the API at
  once - that hit the rate limits mid-session). The orchestrator interrupts
  (interrupt_agent) any lane that would exceed the concurrent working set, and
  resumes (send_message) ONE lane at a time (max 1-2); the paused lanes keep
  their specs + their partial edits in the tree and resume from there
  (read-before-edit).
- THE ORCHESTRATOR'S NON-EXECUTION LAW (2026-10-09 - the user's nits, the slip
  lesson - now in the orchestrator-batch skill step 5): the orchestrator does
  NOT execute on the feedback - no builds (a stray orchestrator `astro build`
  aborted mid-run cleared Target/ once - restored from the user's committed
  state, no rebuild), no site edits, no measurement runs, NO surface-location
  investigation before relaying - the feedback goes to the idlers VERBATIM and
  the idlers investigate + locate + execute + build + verify (their own
  arbiters). The orchestrator's hands-on work: relaying verbatim + the records
  (the handoff, the Tasks/, the process records) + read-only spot-checks of the
  agents' reported claims over the committed/built output.
- THE BATCH'S COMMITS (2026-10-09 - the user committed as the lanes landed):
  960fcede (the rebrand + the descriptive titles + the identity words + the
  path-mention rule + the two measurement scripts) + 0506601f (the Zhipu mark +
  the engine-pill lift removal + the card icons) - the working tree is clean
  aside from the .astro build metadata. The lane residuals ledger: the 2
  pinner.log 1px baseline cases (lane 1), the models pills' +0.5px (lane 8),
  the plain-string PageHero/Description GLM mentions (lane 7 - covered by the
  adjacent marks) - all recorded in the Tasks/ files.
- The ROUTING DISCIPLINE: the recent lanes slipped to the parent-inherited DeepSeek
  route (the task-routing violation) - the explicit GLM routing is binding from
  here; the routing-enforcer plugin (the plan) automates it silently.

## 5. THE FUTURE WORK (recorded)

- The BATCH-STATE plugin (the pre-baked orchestration compiler - the full plan).
- The ROUTING-ENFORCER plugin (the silent auto-routing - the full plan - beside the
  batch-state, both the orchestration layer).
- The npm publishing agent (the dual-source layout ready - the 12 Classic-tree
  packages publish as-is - the workflows' publish steps armed behind the if:false).
- The Aphrodite session (tomorrow/next: the .md instruction files for the
  Aphrodite/Site - the red-on-black cybernetic style - the 10-agent plan recorded
  in TOMORROW-REVIEW §7 - NOT launched here).
- The DSH-registry listing (Documentation/Guides/DSH-REGISTRY-LISTING.md - the
  filled template - the dsh-plugin topic + the install command's final form once
  published).

## 6. THE SKILLS (the loadable manuals)

- Global (~/.dsh/skills/): task-routing, worker-strains (incl. the environment +
  the scope discipline), code-authoring (incl. the byte-integrity law + the
  surgical-edit), harness-observability (what the agent can see), plugin-development.
- Project (Documentation/Skill/): idle-agent-protocol, orchestrator-batch,
  instructional-writing, plugin-system, smoke-writing.