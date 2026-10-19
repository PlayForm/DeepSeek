# SITE-UPDATE-BLUEPRINT - the implementation blueprint for the site update (2026-10-19)

> Status: BLUEPRINT (read-only analysis; the coder lanes execute it verbatim).
> Spec: `Documentation/Plans/SITE-UPDATE-NOTE.md`. The site is
> `Site/` (Astro static, source under `Site/Source/`, build output under
> `Site/Target/`). The four new family features are: (1) the CCR hook
> `hook-dsh-ccr`, (2) the granular volatile scopes + the live volatile
> toggles, (3) the overpass mechanism + the `normalize-overpass` command,
> (4) the tool-coach guardian `hook-dsh-tool-coach`.

---

## 0. The verified baseline (facts the lanes must not re-derive)

### 0.1 Page inventory (21 pages today, 23 after this work)

`Site/Source/pages/index.astro` (the landing page) + 8 top-level pages
(`plugins`, `flavors`, `matrix`, `models`, `setup`, `versions`, `workbench`,
`case-study`) + 12 plugin pages under `Source/pages/plugins/`
(`hook-dsh-core`, `plugin-dsh-factory`, `hook-dsh-package-governor`,
`hook-dsh-package-pinner`, `hook-dsh-cargo-governor`, the 6 stream flavors,
`hook-dsh-normalize-file`). This work adds exactly 2 new plugin pages
(`hook-dsh-ccr.astro`, `hook-dsh-tool-coach.astro`) -> **23 pages**. Every
hardcoded "twelve" on the site becomes "fourteen" (see 3.4).

### 0.2 The homepage section inventory (`index.astro`, 549 lines)

| Section | Lines (approx) | Content |
| --- | --- | --- |
| Eyebrow badges | 134-144 | ECOSYSTEM / CLASSIC / EFFECT-TS badges |
| Hero (split + live stream gate preview + 4 action buttons) | 154-212 | h1 at 155; action row at 206-211 |
| StatsBand | 217 | 12 PACKAGES / checks / 0.0.1 (values from `@Library/Content`) |
| Plugins (3 groups: Core & Factory, Governance, Normalize) | 220-276 | Cards with Href to `/plugins/<name>/` |
| Versions | 279-315 | CLASSIC vs EFFECT-TS cards |
| The use cases (3 Showcase cards: THE PIN, THE GOVERN, THE NORMALIZE) | 325-368 | THE PIN Showcase starts line 328 (Title line 331); THE GOVERN Showcase starts line 338 (Title line 341); THE NORMALIZE starts line 348 |
| Model independence | 371-399 | DeepSeek V4 Flash + GLM 5.3 Flash |
| Summary notation | 402-410 | "the twelve packages" wording |
| Style block | 414-425 | `.use-cases` stack |
| Script block | 427-549 | the live stream gate demo |

### 0.3 Component inventory (16 files, `Site/Source/Component/`)

ArrowIcon, Badge, BrandIcon, Card, CodeBlock, Compare, Concept, Configurator,
FlavorBadge, InstallDemo, PageHero, Seams, SectionHeader, Showcase, StatsBand,
Terminal, TerminalTray.

Key component contracts:

- `Showcase.astro` props: `Kicker, Title, Lead, Href?, Before?, After?,
  Mark? (default true), Fact?, FactLabel? (default "LEDGER"), Wide? (default
  false)`. It has NO bottom slot today - the supports-buttons need one (2a).
  The kicker gets identity-word coloring via the global `/\b(PIN|GOVERN|
  NORMALIZE)\b/` pattern (`word-pin` / `word-govern` / `word-normalize`
  classes) - if the CCR showcase uses a new kicker word (e.g. COMPRESS), it
  will simply render uncolored unless the pattern is extended (2c).
- `Card.astro` props: `Variant? ("default"|"white"|"primary"), Name?, Icon?,
  NameTone?, Sentence?, Desc?, Muted?, Install?, Tags?, Copy?, Href?` plus
  slots `badge`, `head`, default, `after`.
- `Badge.astro` props: `Variant? ("primary"|"muted"|"outline"|"active"|
  "classic"|"effect"|"flavor"), Dot?`.
- `SectionHeader.astro` props: `Title, Meta?`.
- `Concept.astro` props: `Id, Title, Diagram` + default slot.
- `Compare.astro` props: `Id, Flavor, Raw, Clean, Start`.
- `StatsBand.astro`: no props; pulls `Counts`, `Totals`, `Versions` from
  `@Library/Content` (auto-updates with the counts).
- `Terminal.astro` props: `Command?, Pkg?, Label?, Rail?`.
- `Configurator.astro`: the setup page's 12-toggle generator (roster, patch
  inserts, activation lines) - a significant update surface (3.8).

### 0.4 The interactivity patterns (there is NO `<details>`/accordion anywhere)

The site's only interactive patterns are class-toggle buttons driven by
small `<script>` blocks in the page: the plugins registry filter chips
(`plugins.astro`, `data-filter-chip` + `aria-pressed` + `is-active`), the
workbench engine pills (`workbench.astro`, `data-action="toggle"` +
`aria-pressed` + `engine-pill--active`), and the Configurator toggles
(`Configurator.astro`, `is-active`). The supports-buttons and the coachy
section's interactivity MUST follow this same pattern: a `<button type=
"button" aria-expanded="false" aria-controls="...">` toggling a
`.is-expanded` class + `aria-expanded` on the button, and `hidden` or a
class on the panel. No `<details>`; no framework; each page's own `<script>`
block.

### 0.5 The design tokens (`Site/Source/Stylesheet/Global.css`)

- Light theme: `--color-harness-blue: #0052ff`; `--color-accent-orange:
  #bf3003` (the RAW/stream signature - existing); `--color-pin-red: #c62828`
  (the PIN identity color - existing). Dark theme flips: `--color-accent-
  orange: #ff8a4c`, `--color-pin-red: #e57373`, `--color-harness-blue:
  #8ab0ff`.
- Surfaces: `--color-surface-container-lowest: #ffffff`,
  `--color-surface-container-low: #f8fafc`; hairlines:
  `--color-outline-variant: #e2e8f0`; inks `--color-ink #0b0f19`,
  `--color-ink-secondary #475569`, `--color-ink-muted #64748b`.
- Typography: `--font-sans: "Inter"...`, `--font-mono: "IBM Plex Mono"...`
  (NO JetBrains Mono anywhere). Size floor: `--text-label-sm: 13px` - the
  smallest token; there is NO `text-xs`; every mono label uses
  `--text-label-sm` + its leading/weight/tracking tokens.
- Utilities that already exist and MUST be reused: `.is-orange` (orange
  text), `.flavor-prefix`, `.rail-orange` (2px orange top rail),
  `.word-pin` (red), `.word-govern` (blue), `.word-normalize` (muted),
  `.anom` (anomaly chip), `.flow-tag--raw`.
- Zero elevation everywhere: no shadows, no gradients; 1px hairlines;
  `--radius-*` radii.

Coachy red/orange decision: **no new hue is needed.** The coachy section
reuses the two sanctioned non-blue tokens already in the system -
`--color-pin-red` (#c62828 / dark #e57373) and `--color-accent-orange`
(#bf3003 / dark #ff8a4c). Optionally alias them for local clarity inside the
coachy section's CSS (e.g. `.coach { --coach-red: var(--color-pin-red);
--coach-orange: var(--color-accent-orange); }`) so the section reads as its
own palette while staying byte-equal to the system tokens. Both are
contrast-verified on white and on #f8fafc by the existing token comments.

### 0.6 `Site/package.json` scripts (the verification protocol's commands)

```json
"Run": "astro dev --host",
"Diagrams": "node Source/Content/Mermaid/Render.mjs",
"Drift": "node Scripts/Drift-Guard.mjs",
"prepublishOnly": "astro build"
```

The build (`prepublishOnly`, outDir `./Target`) is the ONLY verification.
`Run` (the dev server) is forbidden. There is also `pnpm Drift` (the drift
guard) - run it after touching `@Library/Content` values.

---

## 1. THE CHANGE MATRIX (per page)

### 1.1 `Site/Source/pages/index.astro`

| # | Change | Where | Detail |
| --- | --- | --- | --- |
| I1 | Supports-buttons under THE PIN | Showcase card lines 328-337 | Pass the new `SupportsButton` into a new `slot="supports"` (2a). Content: the PIN use case (2a.3). |
| I2 | Supports-buttons under THE GOVERN | Showcase card lines 338-347 | Same pattern; content: the GOVERN use case (2a.3). |
| I3 | New 4th Showcase: THE COMPRESS (CCR) | Insert after line 347 (after the GOVERN card, before the NORMALIZE card), or after the NORMALIZE card at line 363 | Kicker "THE COMPRESS", Title "Big tool output, one line and a marker", Lead summarizing `tools/post-execute` compression + `ccr_retrieve`, `Before`/`After` pair: a multi-line terminal result -> the one-line preview + `<<<CCR:<hash>|terminal|5231>>>` marker, Fact: a real ledger line (`ccr: compressed <tool> <callId> ...` - byte-exact from the CCR README/SCHEME ledger strings). Href `/plugins/hook-dsh-ccr/`. |
| I4 | New coachy tool-coach section | Insert after the use-cases section (after line 368), before the Model independence section | Full design in 2c. Distinct structure + red/orange palette. |
| I5 | Add CCR + tool-coach cards to the Plugins section | Lines 220-276 | New group "Guardians" (kicker `p.section-kicker` "Guardians & Compression", grid--2) holding the two new cards, each `Href="/plugins/<name>/"` with a Badge (CCR: "ROLE: COMPRESSOR", tool-coach: "ROLE: COACH" - or, to keep the red identity, the coach badge uses the outline variant; see 2c). |
| I6 | Copy sweep: "twelve" -> "fourteen" | Lines 16-17 comment, 128-131 (`Base Title`/`Description` - keep "twelve TypeScript packages"? NO: update to "fourteen TypeScript packages ... and the new CCR compressor and tool-coach guardian"), line 408 "the twelve packages" -> "the fourteen packages" | Every visible "twelve". |
| I7 | Versions section copy | Lines 279-315 | "The same twelve contracts" -> "The same fourteen contracts" (both release cards mention the count). |
| I8 | Homepage mention of the granular scopes + overpass | Inside the THE NORMALIZE Showcase's Lead or as a short paragraph after the use-cases stack (lines 348-367) | One sentence: the six stream flavors plus normalize-file now expose the volatile `scopes` surface (conversation / reasoning / toolInput / toolResults / files / batch, `toolResultsExempt`) with live `loader/volatile-update` toggles, and the overpass arms (`tools/post-execute` tool results + `agent/pre-step` step batch) reachable through the `normalize-overpass` command. |

### 1.2 `Site/Source/pages/plugins.astro` (the registry)

| # | Change | Where | Detail |
| --- | --- | --- | --- |
| R1 | Two new registry entries | Add a `Guardians` array after the `Governance` array (line 62), mirroring the entry shape: `Name, Role, Tags, Sentence, Desc, Install` | CCR: tags "ccr compression retrieve hook", Desc = the gate sentence (targets allow-list, thresholdBytes x multipliers, auto-expand, `ccr_retrieve`, the LRU store). tool-coach: tags "coach guardian terminal hook", Desc = the four-tier sentence. Install rows use `Versions.Release`. |
| R2 | New section "Guardians" | After the Governance section (line 259), before Normalize | `SectionHeader Title="Guardians" Meta="2 PLUGINS"` + grid--2 with white Cards + badges (CCR "ROLE: COMPRESSOR", coach "ROLE: COACH"). |
| R3 | Filter chips | Lines 180-199 | Add two chips: `data-filter-chip="ccr"` (CCR) and `data-filter-chip="coach"` (coach). The chip logic (lines 842-857) matches on tags, so the tags added in R1 make it work with no script change. |
| R4 | Counts | Lines 155, 177, 203 and all `{Counts.Packages}` references come from `@Library/Content` | Update `Content.ts` (3.4): Packages 12 -> 14; add Groups.Guardians = 2; add per-suite counts CCR / Coach (Classic + EffectTS, from the SCHEMes: ccr suite and tool-coach 129 checks - read the exact totals from `Classic/packages/hook-dsh-ccr/SCHEME.md` section 7 and the tool-coach SCHEME "129 checks"). |
| R5 | PageHero copy | Lines 158-163 | "The twelve TypeScript plugins" -> "The fourteen TypeScript plugins"; the Sub's "all twelve packages" -> "all fourteen". |
| R6 | Ontological registry table | Lines 124-143, 297-326 | Add two rows (CCR seq 11, coach seq 12, or after normalize; coordinates `@playform/hook-dsh-ccr` / `@playform/hook-dsh-tool-coach`); Rules: CCR "Tool results - compress - cache - retrieve", coach "Terminal judge - coach ladder - deny". |
| R7 | Seams table | Lines 357-460 | Add rows: the `tools/post-execute` waterfall -> "ccr compression; the normalize flavors' tool-results overpass arm; tool-coach tier-1 notes"; the `agent/pre-step` batch -> "the flavors' step-batch overpass arm"; `commands` -> "normalize-overpass"; `ctx.tools.schemas()` under the tool layer row -> "tool-coach's dynamic instruction fetch". |
| R8 | Smoke baseline table | Lines 483-633 | Add CCR and tool-coach rows with the Classic counts from Content.ts; note the new suites in the EffectTS paragraph (638-646). |
| R9 | Failure-cases / architecture Concepts | Lines 661-817 | Optional but recommended: one Concept for the overpass vs ccr marker guard ("the `<<<CCR:` marker guard makes any load order safe" - from the normalize READMEs) in "The architecture in action". |

### 1.3 `Site/Source/pages/plugins/hook-dsh-ccr.astro` (NEW)

Mirror the governor page template (`hook-dsh-package-governor.astro`,
706 lines) section-for-section:

1. Eyebrow badges: "PLUGIN DETAIL" / "ROLE: COMPRESSOR" / "GATE:
   tools/post-execute".
2. `page-hero`: h1 `hook-dsh-ccr`; the @-sentence (add
   `Families.Ccr` to `@Library/Content`); the summary from the README:
   hooks the `tools/post-execute` waterfall, replaces oversized tool output
   with a one-line type-aware preview plus the
   `<<<CCR:<sha256-24>|<type>|<size>>>` marker, keeps the original
   retrievable through the registered `ccr_retrieve` tool; ported from
   Aphrodite's CCR pipeline; auto-expand returns full content while it is
   cheap.
3. Terminal + inspect-card (Event: `tools/post-execute`; Injects: fs,
   pluginFactory, commands; Release badge).
4. "Where It Fits": a hook child of plugin-dsh-factory + hook-dsh-core;
   sibling table: the normalize flavors' tool-results overpass arm vs the
   ccr compression on the same waterfall, with the marker guard ordering
   note (the `<<<CCR:` marker guard makes any load order safe; the
   normalize overpass is the OUTERMOST prepend, so ccr sees the normalized
   bytes).
5. "In the DeepSeek Harness" (Seams component): `tools/post-execute` (the
   only point that can legally replace model-visible output for all
   tools), `ctx.tools.register` (`ccr_retrieve`), `commands` (probe-once),
   the ledger/session, the in-memory store (no SQLite - the JSONL journal
   decision).
6. "The Problem": every agent turn floods the context with raw tool
   output; a proxy cannot reach the tool result; `tools/post-execute` can.
7. "How It Works": the gate order table from SCHEME.md - exempt identity
   -> failure pass -> targets allow-list -> size <= thresholdBytes x
   multiplier -> auto-expand store-and-return-full -> compress+store+mark;
   the multipliers (terminal 1, error 8, grep 2, paths 2, rest 1); the
   preview hard-cut at `previewMaxChars` (240); the sha256-24 LRU
   (`storeBudgetBytes` 256 MiB, `ttlSeconds` 3600, optional `journalPath`
   JSONL); `ccr_retrieve(hash, range?)` exact-hash matching with the
   self-describing miss error; the waterfall discipline (next() first,
   fail-open, prepend).
8. "The Config": the CodeBlock YAML patch example + the field table from
   SCHEME.md (`log/logFile`, `targets` (bash, glob, grep, read, web_fetch,
   web_search, list, search), `exempt` (write, edit, raw-write, subagent,
   ask_user_question, ccr_retrieve), `thresholdBytes` 2048 (volatile),
   `inlineThresholdBytes`, `autoExpand` true, `autoExpandLimitBytes`
   102400, `compressFailures` false, `multipliers` (volatile),
   `previewMaxChars` 240 (volatile), `ttlSeconds` 3600,
   `storeBudgetBytes`, `journalPath` ""; mark the volatile cells).
9. "In Action": a real bash result (142 lines, exit 0) -> the one-line
   preview + marker; the model calling `ccr_retrieve` with the marker's
   hash; the auto-expand case (small result returned FULL, no marker).
10. "The Ledger": the activation line `ccr: activated (bundle 0.0.1,
    targets 8, budget 268435456)` + the per-compress line (byte-exact from
    SCHEME.md 6).
11. "Known limits" + "Related plugins" (factory, core, normalize-file) +
    the license/SCHEME.md footer, mirroring the governor page's closing
    block.

### 1.4 `Site/Source/pages/plugins/hook-dsh-tool-coach.astro` (NEW)

Same template, but the page SHOULD carry the coachy accents (the
`rail-orange` terminal rail, orange/red kicker words) to preview the
homepage section:

1. Eyebrow badges: "PLUGIN DETAIL" / "ROLE: COACH" / "GATE: terminal tool
   calls (bash, pwsh)".
2. `page-hero`: h1 `hook-dsh-tool-coach`; the @-sentence (`Families.Coach`);
   the one-sentence rule: the terminal runs COMMANDS, the tools handle
   CONTENT; why: terminal file edits are invisible to `fs/observed` (the
   governor/pinner/normalize trigger fires only on tool-layer writes).
3. Terminal + inspect-card (Events: `tools/post-execute`, `tools/pre-
   execute`, `system-prompt/assemble`; Release badge; every knob volatile).
4. "Where It Fits": a hook child of the factory; the sibling table row
   noting it shares the `tools/post-execute` waterfall with ccr and the
   overpass arms (order safety via the marker guard + append-only notes).
5. "The four tiers" table (the README's table, verbatim facts):
   Tier 0 ledger-only (every offense); Tier 1 `tools/post-execute`
   additionalContexts note at `threshold` (3) strikes within `window` (8),
   `cooldown` (10); Tier 2 `system-prompt/assemble` persistent "Tool
   discipline" section at `escalateThreshold` (6), off after `cleanWindow`
   (12), the live-fetched tool table <= `maxSectionTools` (8); Tier 3
   `tools/pre-execute` deny at `enforceThreshold` (4), off by default
   (`enforce: 'off'`; `write` denies write-class only, `all` adds read and
   search; discovery/control never denied).
6. "Detection is deliberately adversarial": the normalization pipeline
   (heredoc bodies stripped, `$(...)`/backticks -> `<sub>`, `$VAR` ->
   `<var>`, `$IFS` -> space, quote layers removed), the intent-marker scan,
   the craft library, the catch-all (any write-intent marker on a
   non-/dev/null path), per-pipeline exemptions (`git diff > patch.txt` is
   exempt; a bare `echo x > tracked.md` is not), the five classes
   (write/read/search/discovery/control) with class-priority resolution.
   NOTE: render the `<sub>`/`<var>` sentinels as escaped text or a
   placeholder; see TRAPS (6.2).
7. "The dynamic instruction engine": every note names the correct tool
   with its LIVE registry data fetched through `ctx.tools.schemas()` (name,
   first sentence <= 120 chars, primary parameter key); tier 2 caches for
   `sectionTtl` (20) judged calls and rebuilds on `tools/change`; any
   fetch failure degrades to the static `STATIC_TOOL_LINES` table and logs
   `schema fetch failed -> static fallback`; `fetch: false` is the escape
   hatch. This is the page's interactive centerpiece (2c's demo lives on
   the homepage; here a Concept + a CodeBlock of a real note suffices).
8. "The Config": the SCHEME.md 5 field table (log/logFile, enabled,
   judgeTools ['bash','pwsh'], threshold 3, window 8, cooldown 10,
   escalateThreshold 6, cleanWindow 12, enforce 'off', enforceThreshold 4,
   exemptPatterns, patternTable, notes {first, persistent, ...},
   maxSectionTools 8, sectionTtl 20) + the fail-loud validation list;
   every cell volatile - "a flip lands on the next judged call".
9. "In Action": a `cat file.txt` stream -> the tier-1 note (a UserMessage
   naming the correct tool with its live description); the escalation to
   the persistent section; the tier-3 deny reason as the lesson.
10. "The Ledger": the ten byte-exact strings (SCHEME.md 6, prefix
    `hook-dsh-tool-coach: `): offense, strike <n>/<threshold> <tool>
    <class> -> note <tool>, cooldown suppressed <n> <tool> <class>,
    escalated persistent section, persistent section cleared, section
    rebuilt, denied <tool> <class> -> use, exempt, schema fetch failed ->
    static fallback, disabled (enabled=false).
11. "Related plugins" + license + SCHEME.md footer.

### 1.5 The existing plugin pages needing edits

| Page | Changes |
| --- | --- |
| `hook-dsh-normalize-file.astro` | Add a "The scopes surface" section (or extend "The Config"): the volatile `scopes` table (conversation on / reasoning on / toolInput off / toolResults off / files on / batch off), `toolResultsExempt` defaults (read, edit, raw-write, normalize-file, ccr_retrieve, subagent, ask_user_question), the live `loader/volatile-update` refresh ("a flip lands without remounting"), and the file hook's `normalize-overpass` command table INCLUDING `files <path...>` (the file hook owns the sweep; the stream flavors decline it). |
| `hook-dsh-normalize-{dash,quotes,ellipsis,spaces,invisible,fullwidth}.astro` (6 pages) | Add the same scopes/overpass section, adapted: the `files <path...>` row reads "declined - the sweep is owned by the normalize-file hook"; the flavor's own overpass ledger lines (`normalized N char(s) in tool result <toolName> <callId>` / `in step batch (turn T step S)`). Keep it one compact section per page (one Concept + the two tables), not a full rewrite. |
| `hook-dsh-package-pinner.astro` | No feature change, but the Related-plugins grid should link the two new pages, and the "Where It Fits" sibling table already lists the trio - fine. Verify the supports-button facts (2a.3) match this page's claims. |
| `hook-dsh-package-governor.astro` | Same as pinner (links + consistency). Optionally one Concept noting the CCR/overpass siblings now share the `tools/post-execute` waterfall. |
| `plugin-dsh-factory.astro` | Add the volatile-refresh fact: the factory's State now keeps the raw config's `{ get }` cells and registers a `loader/volatile-update` listener that refreshes State fields in place (the granular plan's fix) - this belongs in "How It Works" / the Config section. Also Related links. |
| `hook-dsh-core.astro`, the remaining flavor pages | Related links only if desired; core: mention the shared scopes shape if the README does. |

### 1.6 `Site/Source/pages/matrix.astro`

- The matrix demo models the six stream flavors. Add (a) a caption row /
  note under "Active flavor gate hooks" (line 138) listing the two arms the
  overpass adds (tool results, step batch) and the scopes gating; (b) a
  short paragraph in "The suites behind this demo" (line 257) noting the
  new CCR and tool-coach suites exist but are not part of the stream demo.
- Keep the demo itself untouched (the lanes must not destabilize it).

### 1.7 `Site/Source/pages/flavors.astro`

- "The seven flavors" section (line 88): keep, but add a paragraph noting
  the granular `scopes` surface each flavor now shares and the overpass
  arms; link `/plugins/hook-dsh-ccr/` as the consumer-side companion on the
  same waterfall.
- "The two roles" section (line 137, Governance): extend to mention the
  third role family - the guardian/coach - linking the tool-coach page.

### 1.8 `Site/Source/pages/versions.astro`

- "The operating set" (line 107): 12 -> 14 packages; add the two new
  bundles to the roster table with both releases.
- "The record" (line 127): add the changelog entries for the four new
  features (ccr, tool-coach, scopes, overpass) with the same date format
  as the existing entries (read the existing rows for the format).
- "Shared invariants" (line 144): add "every knob of the two new plugins is
  volatile" and "the smokes cover the new suites" lines.

### 1.9 `Site/Source/pages/workbench.astro`

- The interactive stream-gate demo stays untouched. Add a text-only note in
  the page hero area or after the demo: the workbench models the
  conversation arm (`llm/stream`); the family's other arms (tool input,
  tool results, step batch, files) are configurable via the volatile
  `scopes` surface, and tool output can additionally be compressed by the
  CCR hook. Link the two new plugin pages.

### 1.10 `Site/Source/pages/setup.astro`

- The Configurator roster must grow from 12 to 14 toggles (see 3.8).
- "Optional by default" section (line 463): add rows/paragraphs for the new
  off-by-default surfaces: `scopes.toolInput/toolResults/batch` default
  off; the overpass arms opt-in; `enforce: 'off'` for the coach; ccr's
  `compressFailures` off and `journalPath` empty by default.
- The patch-entry examples in the Configurator and the install-demo
  fragments must gain the two new `insert:` bodies (from the packages'
  real `cordis.patch.yml` files - read
  `Classic/packages/hook-dsh-ccr/cordis.patch.yml` and
  `Classic/packages/hook-dsh-tool-coach/cordis.patch.yml` byte-exactly).

### 1.11 `Site/Source/pages/models.astro`

- "What applies to every model" (line 80): add one sentence covering the
  new features as engine-independent: the scopes/overpass arms and the CCR
  compression are engine-independent transforms; the tool-coach's coaching
  is engine-independent behavior. Small edit only.

### 1.12 `Site/Source/pages/case-study.astro`

- Add a short "Phase V - The guardians" closing subsection (one Concept
  after the Phase IV section at line 654 or at the end of the phases):
  the CCR port from Aphrodite, the tool-coach's adversarial detection, the
  scopes/overpass widening of the normalize family - each one-paragraph,
  matching the page's narrative voice. Do NOT renumber the existing
  phases.

### 1.13 Global sweep (grep targets)

`grep -rn "twelve" Site/Source` after the edits must return only
intentional historical references (the case study's Phase I "five bundles
to twelve packages" is historical - keep it). Also update:
`Site/Source/pages/index.astro` hero Description (line 130),
`plugins.astro` Sub, any `Counts.Packages` interpolation (auto), and the
`Manifest.json`/`Base.astro` nav if they enumerate pages (they enumerate
routes only via the nav links list at `Base.astro` ~191 - verify whether
new plugin pages need nav entries: the plugin pages are not in the primary
nav today, so no nav change).

---

## 2. THE COMPONENT PROPOSALS

### 2a. The supports-buttons

**(a) Component**: new file `Site/Source/Component/SupportsButton.astro`
plus a one-line addition to `Showcase.astro`. Do NOT overload Card; the
buttons live inside the two homepage Showcase cards.

`Showcase.astro` change: render `<slot name="supports" />` between the
pair/slot area and the Fact block (or after the Fact block - choose after
the Fact, so the ledger line stays attached to the story and the button row
closes the card):

```astro
{Fact && ( ... existing ... )}
<slot name="supports" />
```

`SupportsButton.astro` sketch (props: `Manifests: string[]` - rendered as
one chip-button per manifest; `Detail: string[]` - the expanded lines):

```astro
---
// SupportsButton: the "supports:" chip row + the click-to-expand panel.
// The site's established interactivity pattern (no <details>): a class-
// toggle button with aria-expanded, like the registry filter chips.
interface Props {
	Manifests: string[];
	Detail: string[];
}
const { Manifests, Detail } = Astro.props;
const Id = `supports-${Manifests.join("-").toLowerCase()}`;
---
<div class="supports">
	<span class="supports__label">supports:</span>
	{Manifests.map((Manifest) => (
		<button
			type="button"
			class="supports__chip"
			data-supports-toggle
			aria-expanded="false"
			aria-controls={Id}
		>{Manifest}</button>
	))}
	<div class="supports__panel" id={Id} hidden>
		{Detail.map((Line) => <p class="supports__line" set:html={Line} />)}
	</div>
</div>
<style>...</style>
<script>
	// Each chip toggles the shared panel; aria-expanded mirrors the state.
	document.querySelectorAll<HTMLElement>("[data-supports-toggle]").forEach((Chip) => {
		Chip.addEventListener("click", () => {
			const Panel = document.getElementById(Chip.getAttribute("aria-controls") ?? "");
			const Open = Chip.getAttribute("aria-expanded") === "true";
			// Close all chips in this group; open the clicked one.
			Chip.parentElement?.querySelectorAll<HTMLElement>("[data-supports-toggle]").forEach((Other) => {
				Other.setAttribute("aria-expanded", "false");
				Other.classList.remove("is-open");
			});
			if (!Open) {
				Chip.setAttribute("aria-expanded", "true");
				Chip.classList.add("is-open");
			}
			if (Panel) Panel.hidden = Open;
		});
	});
</script>
```

Styling laws: mono chips at `--text-label-sm` (13px floor), the chip look
matching `.filter-chip` / `.engine-pill` (hairline border
`--color-outline-variant`, `--surface-container-low` fill, `is-open`
state = `--color-harness-blue` border + `--surface-container-low`
background, like `.filter-chip` hover), panel = `--surface-container-low`
tray, radius-md, zero elevation. The row sits at the card's bottom, right-
aligned label "supports:" in `--color-ink-muted` mono uppercase.

**(b) Usage in `index.astro`**:

THE PIN Showcase (lines 328-337): add as a child element

```astro
<SupportsButton
	Manifests={["package.json"]}
	Detail={[...the PIN detail lines below...]}
	slot="supports"
/>
```

THE GOVERN Showcase (lines 338-347): same with `Manifests={["package.json",
"Cargo.toml"]}` and the GOVERN detail lines.

**(c) The EXACT use-case content (from the REAL manifest facts)**

The label per the user mandate reads as the manifest chips themselves; the
row's leading text is literally "supports:". The user's example text
("supports: Cargo.toml, package.json") applies to the GOVERN box; the PIN
box displays what the pinner actually handles.

PIN detail lines (the pinner, `hook-dsh-package-pinner`):

- package.json - the pinner's ONLY gate. Every ranged dependency version in
  any agent-written package.json is rewritten to its static version:
  `"@playform/build": "^0.3.4"` -> `"@playform/build": "0.3.4"`.
- Protected by the pin-policy keep-list: `pin-policy.json` keeps named
  ranges as authored - keep-list wins.
- Pure pin pass: no ncu, no jobs, no subprocess, no cooldown. A fully
  pinned manifest leaves the governor's update stage nothing to do.
- Exclusion-first: paths containing node_modules / .git / .dsh / .pnpm /
  .store are skipped silently (`skipped (excluded) <path>`).
- Cargo.toml is NOT handled by the pinner - the family's Cargo coverage
  lives in `hook-dsh-cargo-governor` (link it).

GOVERN detail lines (the governor + its Rust sibling):

- package.json - the chain pass canonicalizes chain-governed pins to the
  effective registry's resolved versions (`"0.4.1"` -> `"^0.4.5"` for a dep
  in the nearest `registry.json`), then the update stage runs
  `npm-check-updates` (programmatic by default, or the absolute `ncuBin`
  binary) as a detached, contained continuation in the jobs envelope.
- The cordis-trap guard: ncu's reject list is always
  `policy.reject` + the chain-governed dep names - a chain pin is never
  bumped to public npm latest.
- Cargo.toml - handled by `hook-dsh-cargo-governor` (the same
  architecture): surgical rewrites on the raw TOML lines (never a TOML
  stringify - comments survive), full-version normalization
  (shorthand padded, `pinStyle "exact"`), and the update stage driven by
  `cargo upgrade --exclude` through the `ctx.subprocess` seam.
- Silence: the transcript shows only what the author wrote; the ledger
  shows what actually happened (`governed <path> -> <version>`).

Both panels end with a link line to the respective plugin page.

### 2b. The two new plugin pages

Outlines in 1.3 and 1.4. Template = `hook-dsh-package-governor.astro`:
Base import block, eyebrow badges, `page-hero`, Terminal + inspect-card,
setup-page pointer paragraph, "Where It Fits" (Concept + sibling table),
"In the DeepSeek Harness" (Seams), "The Problem", "How It Works", "The
Config" (Concept + CodeBlock YAML + field table), "In Action", "The
Ledger", "Known limits" (optional), "Related plugins" + footer. Both new
pages must register in `@Library/Content`: `Families.Ccr` and
`Families.Coach` sentences (byte-accurate from the READMEs' H1 subtitles).

### 2c. The coachy tool-coach homepage section

Position: `index.astro`, a new `<section class="section coach">` right
after the use-cases section (after line 368). Design:

- **Palette**: red/orange only against the blue system - the section root
  sets local aliases: `--coach-red: var(--color-pin-red)` and
  `--coach-orange: var(--color-accent-orange)`; a `2px` orange top rail on
  the section's cards (reuse `.rail-orange`), red for the "whistle/verdict"
  accents. Blue appears ONLY as links (system rule: links stay
  `--color-primary`).
- **Structure (deliberately different from every other section)**: the
  other sections are header-then-grid. This one is a two-column
  "coaching board": a narrow left rail (the tier ladder, vertical, sticky
  at desktop) and a wide right stage (the interactive judge demo). No
  SectionHeader - instead a custom header block: an orange kicker line
  `THE COACH` (the word COACH may take `.is-orange` or a new
  `.word-coach` span colored `--coach-orange`; extend the
  `IdentityPattern` in Showcase/SectionHeader ONLY if the lane touches
  those components - optional), an Inter h2 "A guardian that coaches the
  model, tier by tier", and one lead sentence.
- **Left rail - the tier ladder**: four steps, each a small hairline card:
  Tier 0 LEDGER (every offense, silent), Tier 1 NOTE
  (`tools/post-execute` notice, threshold 3 / window 8 / cooldown 10),
  Tier 2 SECTION (persistent system-prompt section at 6, cleaned after 12),
  Tier 3 DENY (`tools/pre-execute`, optional, off by default). The active
  tier in the demo highlights in red/orange; clicking a tier card focuses
  the stage's explanation.
- **Right stage - the judge demo (the interactive element)**: a small set
  of clickable bash-call cards, each showing a terminal command; clicking
  one "judges" it: clean commands (e.g. `pnpm test`) flash blue-muted
  "EXEMPT"; content commands (e.g. `cat config.json`,
  `sed -i 's/a/b/' app.ts`, `echo x > notes.md`) flash the red verdict
  "WRITE" or "READ" + the coaching note text naming the correct tool with
  its LIVE-fetch description style ("use the edit tool - ..." ). One
  verdict tray (a `TerminalTray`-styled surface with the orange rail) that
  accumulates strikes: 3 same-class strikes show the Tier-1 note line, 6
  show the Tier-2 section line, and a "TIER 3 (enforce)" toggle chip lets
  the user arm denies - a denied call then renders the deny reason line.
  All copy comes from the README/SCHEME facts (the ten ledger strings, the
  note format `{kind: 'tool-coach', form: 'notice', summary: '<tool>
  <class> x <n>'}`).
- **Copy outline**: (1) the one-sentence rule; (2) why the harness cannot
  see terminal edits (`fs/observed` fires only on tool-layer writes); (3)
  the four tiers; (4) detection is deliberately adversarial (one sentence:
  normalization, intent markers, the catch-all); (5) the dynamic
  `ctx.tools.schemas()` fetch ("every note names the correct tool with its
  live registry description"); (6) the CTA link chip
  `MEET THE COACH -> /plugins/hook-dsh-tool-coach/` and, nearby, the CCR
  card link if I3's COMPRESS showcase is not enough.
- **Markup**: reuse `TerminalTray` for the verdict tray geometry; build
  the ladder + call cards as a page-local markup block styled in the
  page's `<style>` (do NOT create new shared components for a one-page
  layout; the SupportsButton is the only new shared component).
- **Accessibility**: buttons with `aria-pressed`; the verdict tray
  `role="status" aria-live="polite"`; everything at the 13px mono floor
  minimum; reduced-motion: no flashing animations (the global guard stills
  transitions - rely on class changes, not keyframes).

---

## 3. THE README-UPDATE LIST

### 3.1 Drift flags (found while reading)

1. **`Classic/packages/hook-dsh-tool-coach/README.md` H1 + release wording
   DRIFT (confirmed by diff)**: the Classic README's H1 is
   `# @playform/ets-hook-dsh-tool-coach` and the body says "the EffectTS
   release; the Classic twin behind Effect v4" - the file is a byte-copy of
   `EffectTS/packages/ets-hook-dsh-tool-coach/README.md` except the final
   smoke line. FIX for the README lane: H1 ->
   `# @playform/hook-dsh-tool-coach`; the release sentence ->
   "the Classic release; the EffectTS twin behind Effect v4" (mirror of the
   EffectTS file's wording); verify the install snippet says
   `pnpm add @playform/hook-dsh-tool-coach` (it currently does - it
   happens to be correct).
2. **`Classic/packages/hook-dsh-ccr/README.md` H1** is correct
   (`# @playform/hook-dsh-ccr`). No drift.
3. EffectTS twins' H1s verified correct (`ets-hook-dsh-tool-coach`,
   `ets-hook-dsh-ccr`).

### 3.2 READMEs needing NEW functionality sections

The granular scopes + overpass sections already exist in the Classic
normalize-family READMEs and the EffectTS stream-flavor twins (verified:
`ets-hook-dsh-normalize-dash/README.md` carries the overpass section;
`ets-hook-dsh-normalize-file/README.md` carries the scopes section). The
remaining README work:

| README | Addition |
| --- | --- |
| `Classic/packages/hook-dsh-tool-coach/README.md` | The drift fix (3.1). No new sections needed (its content is current). |
| `EffectTS/packages/ets-hook-dsh-tool-coach/README.md` | None (it is the source of the copy). |
| `Classic/packages/hook-dsh-ccr/README.md`, `EffectTS/packages/ets-hook-dsh-ccr/README.md` | None structurally; optional one-line cross-reference to the normalize flavors' overpass arm ("the ccr hook and the flavors' tool-results arm share the `tools/post-execute` waterfall; the `<<<CCR:` marker guard makes any load order safe") if the lane wants parity with the normalize READMEs. |
| `Classic/packages/hook-dsh-normalize-file/README.md` + its 6 flavor siblings + the EffectTS twins | Already carry scopes/overpass - verify only (no edits expected). |
| Governor/pinner/cargo-governor/core/factory READMEs (both trees) | Optional one-line mentions of the volatile-refresh fix if the factory README does not already document the `loader/volatile-update` State listener (the README lane checks `Classic/packages/plugin-dsh-factory/README.md` for a volatile section and adds one if missing). |

### 3.3 The README lane rule

README edits are documentation-only; the smokes assert ledger strings, not
README text, so the README lane cannot break the arbiter - but it must not
touch `Source/` either.

### 3.4 The site content library (`Site/Source/Library/Content.ts`)

- `Counts.Packages: 12` -> `14`.
- `Counts.Groups`: add `Guardians: 2` (and update the type at line 140).
- Add `Counts.Ccr` and `Counts.Coach` (`{ Classic: N, EffectTS: N }`) with
  the REAL suite totals read from
  `Classic/packages/hook-dsh-ccr/SCHEME.md` (section 7) and the tool-coach
  SCHEME (129 checks; the Classic suite total is in its SCHEME line -
  the lane reads both and copies the numbers byte-exactly).
- `Totals.Classic` / `Totals.EffectTS` increase by the new suites' checks
  (the StatsBand, the plugins page, the versions page, and the drift guard
  all consume these - run `pnpm Drift` after the change).
- Add `Families.Ccr` and `Families.Coach` @-sentences.

### 3.5 `Site/Source/Component/Configurator.astro`

- Add the two packages to the roster (Builtins entries: name, the real
  `cordis.patch.yml` insert body from each package, the activation ledger
  line, and the ets- name mapping - mirror the existing entries' shape at
  lines ~145-160 and the ets map at line ~267).
- The toggle groups (line ~304) gain a "Guardians" group.
- The default selection stays unchanged (opt-in like the rest).

---

## 4. THE VERIFICATION PROTOCOL (for every coder lane)

1. **The build is the arbiter**: `cd Site && pnpm prepublishOnly`
   (astro build, outDir `./Target`). Zero errors required. If
   `Source/Content/Mermaid` changed: `pnpm Diagrams` first (the new pages
   should NOT need new diagrams - avoid the Mermaid pipeline in this work).
2. **Drift guard**: `cd Site && pnpm Drift` after any `Content.ts` value
   change (the counts/totals are cross-checked against the pages).
3. **Built-output greps** (verify in `Site/Target/`, never the source
   alone):
   - `grep -rl "hook-dsh-ccr" Site/Target/` - the new page exists
     (`Target/plugins/hook-dsh-ccr/index.html`), the registry and the
     homepage link it.
   - `grep -rl "hook-dsh-tool-coach" Site/Target/` - same.
   - `grep -o "supports:[^<]*" Site/Target/index.html` (and the CSS
     bundle) - the supports chips render; `aria-expanded="false"` present
     in the built HTML.
   - `grep -c "CCR:" Site/Target/index.html` >= 1 - the CCR marker shows
     in the COMPRESS showcase.
   - `grep -o "fourteen packages\|14 PACKAGES" Site/Target/index.html`
     and the plugins page equivalent.
   - `grep -o "coach" Site/Target/index.html | wc -l` - the coachy section
     renders; then grep the built CSS for `--coach-red`/`.rail-orange`
     usage in the coach block.
   - `grep -rL "overpass" Site/Target/plugins/hook-dsh-normalize-dash/` -
     must be EMPTY (the overpass section reached the built flavor pages).
4. **Forbidden**: the dev server (`pnpm Run`), any `tsc` invocation, any
   git mutation (checks only: `git status` / `git diff` / `git log`).
5. **The family arbiter is untouched**: the site lanes modify ONLY
   `Site/**` and the plugin READMEs (`Classic/packages/*/README.md`,
   `EffectTS/packages/*/README.md`). They must NOT touch any
   `Source/`, `Configuration/`, `cordis.patch.yml`, smoke suite, or
   package.json of a family package. If a lane believes a family file
   must change, it escalates instead.
6. **READY-TO-COMMIT reporting**: each lane reports the exact file list +
   suggested commit message; the user commits.

---

## 5. THE LANE SPLIT PROPOSAL

Three lanes with disjoint file surfaces:

**Lane A - the homepage + components + the two new pages** (the structural
lane):
`Site/Source/Component/SupportsButton.astro` (new),
`Site/Source/Component/Showcase.astro` (the one slot line),
`Site/Source/pages/index.astro`, `Site/Source/pages/plugins/hook-dsh-ccr.astro` (new),
`Site/Source/pages/plugins/hook-dsh-tool-coach.astro` (new).
Delivers: I1-I6 + R-linked homepage bits, the coachy section, the two new
pages.

**Lane B - the site-wide description sweep + the data layer**:
`Site/Source/Library/Content.ts`, `Site/Source/Component/Configurator.astro`,
`Site/Source/pages/plugins.astro`, `plugins/hook-dsh-normalize-*.astro` (7
pages), `plugins/hook-dsh-package-{governor,pinner}.astro`,
`plugins/plugin-dsh-factory.astro`, `matrix.astro`, `flavors.astro`,
`versions.astro`, `workbench.astro`, `setup.astro`, `models.astro`,
`case-study.astro`. Delivers: R1-R9, 1.5-1.13, 3.4-3.5.
RISK NOTE: Lanes A and B both touch `index.astro` copy ("twelve ->
fourteen") - to keep surfaces disjoint, Lane A owns ALL of `index.astro`
including its copy sweep (I6), and Lane B owns every other page.

**Lane C - the READMEs**:
`Classic/packages/*/README.md` + `EffectTS/packages/*/README.md` only
(the tool-coach drift fix + the optional cross-references + the factory
volatile-section check). Tiny lane; can run last; no build impact (but the
site does not render the READMEs, so no rebuild needed after C).

Sequencing: Lane B's Content.ts numbers are referenced by Lane A's pages
(Families.Ccr/Coach sentences, Counts) - Lane B first, or Lane A stubs the
import and Lane B fills it. Simplest: **Lane B first** (data + sweep),
then Lane A (structure), then Lane C (READMEs), then a final full build +
the grep protocol once.

---

## 6. THE TRAPS

1. **The normalize-hook glyph rules**: the `write` tool normalizes streamed
   content (dashes, curly quotes, ellipsis, unicode spaces, fullwidth). The
   site source files are FULL of unicode (em dashes in the ledger strings,
   the `->` arrows as `→` glyphs, curly quotes in the demo seeds). When a
   lane edits an existing `.astro` file, it MUST use the `edit` tool
   (identity-exempt) with exact unicode `old_string` - never re-`write`
   whole existing files, or the em dashes/arrows inside untouched code
   (e.g. `governed <path> → 42` in `GovernFact`, the hero script's seeds)
   would silently become ASCII and the page copy would drift from the
   ledgers. NEW files (the two new pages, SupportsButton) may be `write`n
   if authored ASCII-safe (use `->` in new copy, ASCII quotes); any REAL
   unicode glyph copied from a README (the `→` in ledger examples, the
   em dashes in the governor-style pages) must land via `edit` or be
   written with the raw-write exemption path.
   The `<<<CCR:...>>>` marker itself is pure ASCII - safe everywhere.
   The coach README's sentinel `<sub>`/`<var>` glyphs: in Astro/JSX text
   they would parse as HTML tags - escape them (`&lt;sub&gt;`) or use the
   strings "sub"/"var" with set:html-safe code spans.
2. **Typography laws**: minimum font size token is `--text-label-sm`
   (13px). NEVER a raw `font-size: 12px` or `text-xs`, never JetBrains
   Mono; mono text always carries the token quartet
   (`--text-label-sm` + `--leading-label-sm` + `--weight-label-sm` +
   `--tracking-label-sm`) as the existing rules do.
3. **Absolute-link rule**: repo targets use
   `https://github.com/PlayForm/DeepSeek/tree/Current/...` (via
   `Link(Links.OurRepo, path)` / `Link(Links.DeepSeekHarness, path)` in
   the pages - reuse the `@Library/Links` helpers, never raw relative
   paths).
4. **Tabs formatting**: `.astro`/`.ts` files indent with TABS (the site
   source does); YAML blocks (patch examples, README code fences) use
   SPACES as the family's YAML does. The new README YAML additions keep
   spaces.
5. **The page-count statement**: the site is 21 pages today; after this
   work it is 23. Any lane-written copy that says "twelve packages" must
   become "fourteen" EXCEPT the historical case-study sentence ("From five
   bundles to twelve packages" - keep) and any byte-exact ledger/README
   quotation.
6. **Zero elevation**: no shadows/gradients anywhere new - hairlines,
   flat fills, the `--radius-*` tokens only.
7. **The byte-exact ledger strings**: every ledger line shown on the site
   (CCR's `ccr: activated (bundle 0.0.1, targets 8, budget 268435456)`,
   the coach's ten strings, the overpass lines) must be copied byte-exact
   from the SCHEMes/READMEs - these are the family's public interface; a
   paraphrased ledger line is a defect.
8. **The overpass vs ccr ordering fact** (easy to get wrong): the
   normalize flavors' tool-results overpass arm is the OUTERMOST prepend
   (`{ prepend: true }`), so the ccr compression sees the NORMALIZED
   bytes; the `<<<CCR:` marker guard makes any load order safe. State it
   exactly this way wherever both features appear together.
