---
title: Harness UI Options Research (R-UI-2)
category: Researches
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Researches/HARNESS-UI-OPTIONS-RESEARCH.md
index: Documentation/INDEX.md
statuses:
    - name: the config chain verdict (the settings services + the volatile fields)
      state: resolved
      evidence: the asar sources and the family Config.ts files agree
    - name: the UI-powered options implementation (the config forms)
      state: open
      evidence: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md
    - name: the DOM-level GUI confirmation
      state: open
      evidence: the live GUI page was not reachable at query time
---

# HARNESS-UI-OPTIONS-RESEARCH - making the family's per-plugin config options UI-accessible and UI-powered

Author: R-UI-2 (research subagent). Date: 2026-10-20. Read-only research; this is the ONLY file
written.

Scope: the DeepSeek Harness Plugin Family's per-plugin config options (the governors'
policy/cooldown, the pinner's sections, the normalize flavors, the ccr thresholds, the tool-coach
tiers, the live-containers blocks). Are they UI-accessible today, and can they become UI-powered
(editable + controllable through the harness UI, including the live volatile reloads)?

Sources: the running harness implementation read in place from /Applications/DeepSeek
Harness.app/Contents/Resources/app.asar/dsh/ (never extracted), the harness documentation repo at
~/Developer/Documentation/Module/deepseek-harness/ (docs/user, docs/cordis-tutorial,
docs/subsystems, docs/cookbook), the family's Classic/packages/*/Source/Variable/Config.ts, the
desktop profile's cordis.patch.yml, and the live Host inspected through the harness's own inspect
providers.

Legend: `<DSH>` = /Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh `<DOCS>` =
~/Developer/Documentation/Module/deepseek-harness `<FAM>` =
/Volumes/CORSAIR/Developer/macOS/Application/PlayForm/DeepSeek/Classic/packages

## 1. THE FEASIBILITY VERDICT

### 1.1 Backend: the full UI-power chain already exists and is live

The harness ships a complete "per-plugin options" backend that needs NO family change:

- `<DSH>/node_modules/@deepseek-ai/dsh-settings/lib/index.js` (`SettingsForms`, the `settings`
  service; DOCS anchor: docs/subsystems/settings.md section 1):
    - `describe()` walks EVERY ACTIVE profile entry that is uniquely addressed by the root Include
      (via `configEditor.entries()`), takes the entry's Schemastery `Config` schema, and projects
      ONLY the schema-declared `.volatile()` fields into a form (`volatileForm()`), keyed by the
      profile patch id as the namespace (`ns`). Each descriptor carries the serialized schema
      (`schema.toJSON()`), resolved `value`, inherited `base`, the profile-layer `user` override,
      and a revision. `autoGenerate` defaults to true.
    - `update/replace/mutate` validate against the schema and refuse ANY field whose path is NOT
      under a volatile node (`isVolatilePath()`), then call `configEditor.edit(...)`.
- `<DSH>/node_modules/@deepseek-ai/dsh-config-editor/lib/index.js` (`configEditor` service; DOCS
  anchor: docs/subsystems/settings.md section 1,
  <DSH>/node_modules/@deepseek-ai/dsh-config-editor/README.md):
    - `edit()` writes the entry's full raw config into the ACTIVE profile's cordis.patch.yml under
      the entry's id (YAML comment- and `!!js`-preserving, revision-checked against higher layers),
      then re-reconciles the profile - the normal Loader path.
- `<DSH>/node_modules/@deepseek-ai/cordis-plugin-loader/lib/index.js` (`Entry.update()` +
  `_commitVolatile()`; DOCS anchor: docs/cordis-tutorial/05-config.md section"Volatile fields"):
    - On the reconciled patch change, if the ONLY changed key is `config` and the difference is
      schema-declared-volatile only (`equalExceptVvolent` semantics, `equal()` short-circuits on
      `schema.meta.volatile`), the Loader commits the new values into the RUNNING fiber's volatile
      references and emits one instance-local `loader/volatile-update` event - NO remount.
- The wire: `<DSH>/node_modules/@deepseek-ai/dsh-api-settings-controller/` exposes
  `settings.describe/update/replace/mutate` as `@Remote` methods (its zod schemas literally document
  `autoGenerate`: "Generate a page if no custom page is registered for this instance",
  `applies: "live"`).
- The browser half: `<DSH>/node_modules/@deepseek-ai/dsh-client-ui-settings/lib/client.js` owns one
  shared describe mirror (`ctx.configForms`), per-namespace form controllers with revision-fenced
  writes, and `whileServed` for pages that exist exactly while the Host serves the namespace.

So the chain "UI write -> settings service -> configEditor -> profile patch -> Loader reconcile ->
volatile-only commit -> live references + loader/volatile-update" is fully built, running, and
remote-reachable.

### 1.2 The family's schemas are already shaped for it

EVERY family module marks its hot knobs `.volatile()` (verified against the projected JSON schemas
of the LIVE entries via the harness Config inspect provider - e.g. entry `include:ccr` shows
`x-cordis: {volatile: true}` on log/logFile/thresholdBytes/multipliers/previewMaxChars):

- The factory's shared block marks `log`, `logFile`, `updateCooldownMs` and `mutationTools` volatile
  (`<FAM>/plugin-dsh-factory/Source/Function/Schema.ts`).
- ccr, tool-coach, live-containers, and the normalize flavors mark their tuning knobs volatile
  (tool-coach and live-containers: EVERY knob is volatile).
- The plugin code reads these through stable `.get()` references and reacts to
  `loader/volatile-update` - the live side is done.

### 1.3 The UI gap: no page is generated for the family today

The Plugins page (`<DSH>/node_modules/@deepseek-ai/dsh-client-ui-plugin-manager/lib/client.js`)
renders configuration ONLY from slot registrations that a plugin's own browser half makes:
`plugins.item` (official plugins), `plugins.bundle.config` (keyed by package name),
`plugins.row.config` (keyed by `<package>#<row id>`) (`configLedgerSource()` at lib/client.js:40,
slot rendering at :2818). There is NO generic fallback form: when NO entry exists for a row, the
row's config section renders empty and the row gets NO Configure control. `autoGenerate` is plumbed
through the wire but NO client page currently consumes it to auto-generate a form.

The family packages are hook plugins with NO browser half (NO `dsh.client` declaration, NO
`./client` export), so on the running desktop/web profile:

- Plugins sidebar -> the family bundles appear as "Installed plugins" bundles with enable/disable
  switches per row - but NO Configure control, NO options form.
- Settings -> Built-in plugins is the read-only inventory ONLY
  (`<DSH>/node_modules/@deepseek-ai/dsh-client-ui-settings-plugins/README.md`).
- Net: today the ONLY ways to change a family knob are (a) editing the profile's cordis.patch.yml by
  hand (which the loader HMRs live, including volatile-only hot commits), or (b) restart.

VERDICT: the family's options are UI-VISIBLE-ADJACENT but NOT UI-EDITABLE today (the editable
backend + wire exist and already describe the family's live values; the missing piece is a browser
half that renders them). Making them UI-powered is FEASIBLE WITH A SMALL, WELL-SUPPORTED ADDITION:
one family client half registering a `plugins.row.config` entry per family row (or one
`plugins.item`/`plugins.tab` "family control panel") over `ctx.configForms.whileServed`. NO harness
code changes are required; the harness's own docs prescribe exactly this pattern.

### 1.4 Doc anchors for the pattern (primary material)

- <DOCS>/docs/subsystems/settings.md - "Plugin Configuration Forms": the settings service projects
  volatile Config fields of active profile entries; the configuration editor persists edits through
  Cordis patches; `ctx.settings` (`SettingsForms.describe/update/replace/mutate`) and
  `ctx.settingsController` (`@Remote`) contracts; `settings/document-updated` event.
- <DOCS>/docs/cookbook/adding-a-settings-card.md - the cookbook for exactly this: section 1 declare
  `.volatile()` fields; section 2 unique profile entry ids (base bundle mounts settings +
  config-editor); section 3 "Change a field in Plugins and save. Verify the profile patch, the next
  consumer operation, unchanged plugin instance identity"; section 5 where the browser half rides: a
  package declares `dsh.client` and a built `./client` export in the client module system's lazy-CJS
  factory format, and a companion package registers into `plugins.item` through
  `ctx.configForms.whileServed` so the page exists while the Host serves the namespace.
- <DOCS>/docs/cordis-tutorial/05-config.md section"Volatile fields" - the loader volatile-commit
  contract (paths arrays, `.get()`, what invalid candidates do).
- <DOCS>/docs/user/develop/basic/config.md - the Config schema basics the family already follows.
- Harness package READMEs (in-place): dsh-client-ui-plugin-manager (section"Configuration pages" -
  the three slots, the `form.state`/`form.mutate(operations, expectedRevision)` the page owner
  supplies, and the code sample registering `plugins.row.config`), dsh-client-ui-settings-plugins
  (sectionthe `settings.plugins.tab` shell), dsh-config-editor (sectionKnown limitations).

## 2. THE GAP MAP - which family knobs are UI-editable today vs which need the surface

Today NOTHING is UI-editable (NO browser half). The map below shows what the existing backend WOULD
expose through a client half once one exists, split volatile (live-editable, NO remount - the
settings-service path) vs plain (structural: excluded from settings forms; a write requires a
full-config edit through configEditor, which remounts the plugin on apply).

Per-module (Config.ts sources under <FAM>/<pkg>/Source/Variable/Config.ts):

| Module (entry id)         | Volatile (live-editable through the settings path)                                                                                                                                                | Plain (needs a full-config path or stays file-only)                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hook-dsh-package-governor | log, logFile, updateCooldownMs, mutationTools (factory shared block)                                                                                                                              | strict, maxUpdateFailures, ncuBin, updateMode, policyFile, exclude                                                                                                |
| hook-dsh-package-pinner   | log, logFile (shared block)                                                                                                                                                                       | sections, mutationTools list membership, policyFile, exclude                                                                                                      |
| hook-dsh-cargo-governor   | log, logFile, updateCooldownMs, mutationTools (shared block)                                                                                                                                      | strict, maxUpdateFailures, cargoBin, updateMode, policyFile, keepFile, exclude                                                                                    |
| hook-dsh-normalize-* (7)  | log, logFile, replacement, normalizeReasoning, normalizeToolArguments (per-flavor counts 4-5)                                                                                                     | (none significant - the flavors are essentially fully live)                                                                                                       |
| hook-dsh-ccr              | log, logFile, thresholdBytes, multipliers (whole object incl. its 8 leaves), previewMaxChars                                                                                                      | targets, exempt, inlineThresholdBytes, autoExpand, autoExpandLimitBytes, compressFailures, ttlSeconds, storeBudgetBytes, journalPath, contextEngine + its 3 knobs |
| hook-dsh-tool-coach       | ALL knobs (17 cells): enabled, judgeTools, threshold, window, cooldown, escalateThreshold, cleanWindow, enforce (+threshold), exemptPatterns, notes block, fetchLive, maxSectionTools, sectionTtl | (none - fully volatile)                                                                                                                                           |
| hook-dsh-live-containers  | ALL knobs (28 cells): enabled, sectionName, refresh, ttlCalls, separator, sectionBudgetBytes, blocks (array), detach policy, failsafes trio, suggester block                                      | (none - fully volatile)                                                                                                                                           |
| plugin-dsh-factory        | n/a (build tool, not a hot knob surface)                                                                                                                                                          | n/a                                                                                                                                                               |

Key gaps to close, in order of impact:

1. THE SURFACE GAP (blocking): NO browser half / NO slot registration for any family row -> NO
   Configure control anywhere in the UI.
2. THE PLAIN-FIELD GAP: the governors' policy knobs (strict, policyFile, exclude, sections,
   ncuBin/cargoBin, updateMode) and ccr's structural knobs are NOT expressible through the settings
   service (its writes hard-fail "Config field ... is not volatile"). UI-editing them requires
   either (a) a small host-side remote wrapper around `configEditor.edit()` (configEditor has NO
   @Remote methods today), or (b) reclassifying the knob as `.volatile()` in the family schema when
   remounting is actually harmless, or (c) leaving them file-only.
3. THE AUTOGENERATE GAP: `autoGenerate: true` is advertised on the wire but NO client page consumes
   it to auto-generate forms; until one does, EACH family row needs an explicit `plugins.row.config`
   registration.
4. THE BUILD GAP: the family's factory does NOT build client bundles (`clientBundle` tsdown preset
   is harness-internal; the family must emit the lazy-CJS factory format `./client` itself, per
   cookbook section 5).

## 3. THE DESIGN - the per-plugin options surface

### 3.1 Package shape

One new family package, e.g. `ui-dsh-family-panel` (browser half only; the cookbook's
companion-package pattern):

- package.json:
    - `"main"`/`"exports"`: `.` -> an empty Host `apply` (a Loader row the client module system
      serves the browser half for), `./client` -> the built client.
    - `"dsh": { "client": { "platform": "web", "inject": ["@deepseek-ai/dsh-client-ui-settings"] } }`.
- Host half: `export function apply() {}` (no-op), so the row exists in the composition.
- Client half (`./client` in the client module system's lazy-CJS factory format):
    - `ctx.configForms.whileServed(FAMILY_NAMESPACES, register)` where FAMILY_NAMESPACES = the
      family's profile patch ids (package-governor, package-pinner, cargo-governor, normalize-dash,
      ..., ccr, tool-coach, live-containers). The page then exists exactly while the Host serves
      them (i.e. while the family is composed) and withdraws when a row is switched off.
    - Register into the Plugins page's `plugins.row.config` slot once per family row (key:
      `"<package>#<row id>"`) so EACH family row on its bundle page gets a Configure control; and/or
      a single `plugins.item` entry ("Family control panel") that renders ALL family namespaces
      under one save.
    - Rendering: read `ctx.configForms.describe()` for each namespace; the descriptor already
      carries the serialized schema, resolved value, base layer (what the composition supplies), and
      user layer. Rehydrate the schema with `new Schema(json)` (schemastery) and render it - either
      by reusing ui-primitives' `SettingsFormModel` + `ConfigField` (the same widgets the official
      Subagent/shell pages use) or a small generic renderer over the schema envelope. Save via
      `form.mutate(operations, expectedRevision)` (revision-fenced; conflicts preserve drafts).
    - Status/ledger strip: per namespace show `form.state` (writable/revision), the user-vs-base
      delta (which fields the profile patch overrides), and the `applies: "live"` marker; listen to
      `settings/document-updated` to refresh. This is the "per-plugin ledger/status display" without
      any new backend.

### 3.2 Data flow

1. User edits a volatile knob in the form -> `configForms.get(ns).mutate([op], revision)` -> Remote
   `settings.mutate`.
2. Host `settings` service validates the path is volatile, calls `configEditor.edit(entry, ...)`:
   writes the id-keyed `config:` override into `~/.dsh/profiles/<profile>/cordis.patch.yml`
   (comment/`!!js`-preserving, atomic, higher-layer-checked), then re-reconciles.
3. Loader `Entry.update()` sees a config-only change; `equalExceptVolatile` says volatile-only;
   `_commitVolatile()` resolves the candidate through the plugin's `internal/config` hook, commits
   into the running references, emits instance-local `loader/volatile-update` with the changed
   paths. The plugin's next operation reads the new value via `.get()` - NO remount, NO restart.
4. `settings/document-updated` folds the answer into the browser mirror; the form and any ledger
   strip refresh; a refusal (invalid value, stale revision, higher-layer override) restores the file
   and reports, leaving live values unchanged.
5. Plain-field edits (phase 2): a tiny host-side companion service (`familyConfigBridge`) exposing
   one `@Remote editFull(ns, patch)` that calls `ctx.configEditor.edit()` directly (it is already a
   Host service on the running composition; `dsh-base/cordis.patch.yml` composes both
   `config-editor` and `settings`). Its write goes through the same patch + Loader path, but the
   ordinary-field difference triggers the normal update lifecycle (remount) - surfaced in the UI as
   "applies on remount".

### 3.3 Registration surface summary

- Per-row: `plugins.row.config` key `@playform/<pkg>#<row id>` (rows are the family's Loader rows
  inside each bundle).
- Optional aggregate: `plugins.item` entry id `family-panel` listed under the Plugins page's
  Built-in plugin settings, or a `settings.plugins.tab` for a Settings-side panel.
- Optional ledger chips: `plugins.detail.section`/`plugins.detail.badge` on family bundle pages
  (subject `{kind:'bundle'|'row'}`) for live status.

## 4. MINIMAL PROOF-OF-CONCEPT PATH

The smallest change that makes the family's options UI-editable, NO harness edits:

1. Pick ONE fully-volatile module - `hook-dsh-tool-coach` or `hook-dsh-live-containers` (EVERY knob
   is volatile; the settings service covers 100% of their fields).
2. Add a client half to THAT package ONLY (cookbook section 5 shape): package.json gains `./client`
   export + `dsh.client` (`inject: ["@deepseek-ai/dsh-client-ui-settings"]`); build `./client` as
   the lazy-CJS factory format script (one file, `factory(require)`; hand-rolled or a small tsdown
   config copied from the harness's `packages/client/tsdown.client.ts` pattern - the family's
   plugin-dsh-factory gets a `client` build step added only if hand-rolling is unacceptable).
3. The client registers exactly one slot:
   `ctx.configForms.whileServed(['<entry id>'], () => ctx.slots.inject('plugins.row.config', () => ctx.slots.register({ name: 'plugins.row.config', key: '@playform/hook-dsh-tool-coach#<row id>', locale: '...' }, ({ form }) => <SchemaForm from form.state / form.mutate>)))`.
4. Restart the harness ONCE (profile change: the client half is discovered by the client module
   graph on composition; HMR then keeps it live).
5. Verify per cookbook section 3: open Plugins -> the package -> the row -> Configure; edit
   `threshold`/`enforce`/a live-containers knob; Save; confirm (a) the profile's cordis.patch.yml
   gained the id-keyed override, (b) the plugin's very next operation uses the new value with
   unchanged instance identity (the family logs + `loader/volatile-update` prove it), (c) an invalid
   value is refused with neither file nor live value changed, (d) restart restores the saved value.

That single row proves the entire chain end to end. Phase 2 clones the same half to the remaining
family rows (or folds them into one panel package); phase 3 adds the plain-field bridge service for
the governors' policy knobs.

Residual constraints to know before building:

- ONLY entries uniquely addressed by the root Include are editable - true for EVERY family row in
  the desktop profile (each id appears once).
- Edits target the active profile patch ONLY; home patches / CLI overlays are read-only precedence
  (configEditor README sectionKnown limitations).
- The desktop profile's family rows currently carry FULL explicit configs, so EVERY field shows as
  user-overridden; values edited in the UI update those overrides IN PLACE.
- The client page lives ONLY while the host row is enabled (`dsh-client-modules` attaches the half
  to the row) - a switched-off family row loses its page, which is the desired behavior.

## 5. ACCEPTANCE CRITERIA

1. Plugins -> <family package> -> row shows a Configure control; its page renders a form generated
   from the entry's projected schema (volatile fields only for phase 1), with current values,
   base-vs-user provenance, and a revision.
2. Saving a volatile knob:
    - writes the id-keyed `config:` override into ~/.dsh/profiles/<profile>/cordis.patch.yml
      (comments and `!!js` preserved);
    - commits into the running plugin WITHOUT remounting (instance identity unchanged; the next
      operation uses the new value - verified against the module's ledger log or
      `loader/volatile-update` observability);
    - is revision-fenced: a concurrent change yields a conflict that preserves the draft; an invalid
      value is refused with file AND live value unchanged.
3. Switching the family row off removes the page; switching it on restores it (whileServed
   semantics), with NO orphaned registration.
4. Survives restart: values persist in the profile patch and reload correctly.
5. Phase 2 (plain fields): the governors' policy knobs become editable through the bridge with an
   explicit "applies on remount" marker, and the remount is observable in the UI's row status.
6. NO harness source changes are required for phases 1-2; ANY harness-side gap found during the POC
   is filed as a documented residual, NOT a local monkey-patch.

## 6. RESIDUALS / OPEN QUESTS

- NO client page currently consumes `autoGenerate`; a generic auto-form would remove the need for
  per-row registrations but is harness work, NOT family work.
- `configEditor` has NO @Remote surface; the plain-field bridge (section 3.2 step 5) is a new
  family-host service and the ONLY place a family package must be trusted with full-config writes.
- The family's factory currently has NO client build step; the POC hand-builds one `./client` file,
  then the factory gains a reusable `clientBundle` step.
- The live GUI page was NOT reachable from this session for a DOM-level confirmation (client inspect
  queries timed out with the page closed); the Plugins-page behavior was verified from the shipped
  client bundle source and package READMEs instead.
