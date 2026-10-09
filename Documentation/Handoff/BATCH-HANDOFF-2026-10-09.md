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
| The setup page's JSON minified + the code blocks unhighlighted (2026-10-09 - NEW feedback) | PENDING (https://deepseek.playform.cloud/setup/: the JSON code block renders minified (one line) while localhost shows the pretty form + the YAML/JSON blocks have NO syntax highlighting - dispatched to the PATH-MENTION agent: the minification cause + the highlighting path, the smallest faithful fixes) |

## 4. THE DECISIONS + THE OPEN ITEMS

- The SYMLINK BREAK (any pnpm install re-links the Classic consumers to the
  EffectTS tree - the durable fix: distinct names per tree / a postinstall relink /
  a preinstall hook - the user's call).
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