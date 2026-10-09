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
  marks incl. the Zhipu pending, the stats band, the hover-pause, the full-width
  use-cases, the deployment via the classical Cloudflare Pages, the footer + the
  JSON-LD "PlayForm Cloud").
- The provenance: the hermes/Compress/Land/borrowed references REMOVED everywhere
  (the release surface + the residuals - the sweep-clean proof).
- The queue records: TOMORROW-REVIEW.md (the process record), the DUAL-SOURCE-
  BUNDLING.md, the BATCH-STATE-PLUGIN.md, the ROUTING-ENFORCER-PLUGIN.md, the
  CASE-STUDY-PLAN.md, the DSH-REGISTRY-LISTING.md.

## 2. THE IDLE AGENTS (queued - all specs retained in their contexts)

Activate ONE at a time (the user's rule: max 1-2, the ~/.dsh maxActiveSubagents is
now 1 - the concurrency flood's fix). Each activation carries the STATE BLOCK (the
running lanes + the pending + the scope) + the surgical-edit + the build-verified
disciplines + the EXPLICIT GLM routing (provider=cloudflare-workers-ai,
model=@cf/zai-org/glm-5.3-flash, effort high - the ROUTING DISCIPLINE IS BINDING:
omission = the violation - the routing-enforcer plugin will automate it later).

1. FILE-MENTION ALIGNMENT (3f17ce20) - RE-DISPATCH (died mid-investigation, no
   edits): the .file-mention units' baseline vs the prose text ("The silent
   package.json version pinner" example) - the .log-chip same pattern.
2. EFFECT-CARD-FOOTER (91c4d5d9) - RE-DISPATCH (died on the 502 mid-verification;
   its edits landed - verify + finish): the effect mark WHITE on the blue cards +
   the footer links' top padding.
3. PIN-GOVERN COLORS (ae5cc62c): PIN red (a new contrast-checked token) / GOVERN
   the Harness Blue / NORMALIZE the gray - the use-cases kicker + the card titles +
   the identity labels - the word-level RAW-style treatment.
4. DESCRIPTIVE-TITLES (050c666b): the case-study + the site's descriptive titles -
   the larger heading + the grayed tone + the info icon on the left.
5. HEADER-BRAND (c2c51b2f): the logo's right padding + the rename to "DSH Family
   @ PlayForm" across the header/og/JSON-LD/titles (the user's naming judgment:
   "DSH Family @ PlayForm").
6. PATH-MENTION (4f3579f8): the file-icon renderer skips the path-embedded
   filenames ("~/.dsh/profiles/<name>/package.json" - the full path gets no icon;
   the bare mentions keep theirs; the log-chip same rule).
7. ZHIPU-ICON (d5a5e3f5): the official Zhipu AI mark beside the GLM/flash-model
   mentions (the models/index/workbench/matrix) - the official-marks discipline.
8. ENGINE-PILL (ccc68bb2): the workbench/matrix/models engine pills' icons
   vertically aligned to the text (the measured optical-center check).

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
| The file icons + log chips | The file-type icons + the Mention renderer + the log chips (the path rule pending) |
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
| The PIN/GOVERN/NORMALIZE colors | PENDING (lane 3) |
| The descriptive titles | PENDING (lane 4) |
| The DSH Family @ PlayForm | PENDING (lane 5) |
| The Zhipu icon | PENDING (lane 7) |
| The engine-pill alignment | PENDING (lane 8) |
| The path-mention icon | PENDING (lane 6) |
| The effect white-on-blue + the footer padding | PENDING (lane 2) |

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
  (read-before-edit). The final arbiter after ALL lanes settle: one clean
  `cd Site && npx astro build` over the whole tree + the spot sweep.
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