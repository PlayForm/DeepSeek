---
title: Harness UI Plugin Research (R-UI-1)
category: Researches
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Researches/HARNESS-UI-PLUGIN-RESEARCH.md
index: Documentation/INDEX.md
statuses:
    - name: the verdict (the Plugins page's child slots are extensible)
      state: resolved
      evidence: the asar sources and the slot docs agree
    - name: the implementation (the family's client plugins)
      state: open
      evidence: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md
---

HARNESS-UI-PLUGIN-RESEARCH Question: can a PLUGIN modify the harness Web UI to better display the
@playform family (13 bundles currently shown as generic plugin-manager rows)?

0. VERDICT

YES - first-class and supported. The harness Web UI is itself assembled from client plugins, and the
Plugins page (the thing that today renders the family as generic rows) declares child slots exactly
so that OTHER plugins can extend it. NO fork, NO DOM hacks, NO patching of the harness checkout, and
the registration surface is ctx.slots.inject() + ctx.slots.register() from a package's "./client"
export.

The user-cited doc path ~/Developer/Documentation/deepseek-harness does NOT exist. The real
documentation repo is ~/Developer/Documentation/Module/deepseek-harness/ (full harness doc
monorepo), and the running implementation is read in place from /Applications/DeepSeek
Harness.app/Contents/Resources/app.asar/dsh/.

1. SEAMS / ANCHORS

Doc anchors (all paths relative to ~/Developer/Documentation/Module/deepseek-harness/):

- docs/subsystems/slots.md - the slot system. Key sections: "Declaration and lifecycle"
  (ctx.slots.inject for foreign packages, ctx.slots.register to contribute; declaring a child is the
  owner's job), "Cardinality and scope" (list vs keyed vs single; additive = new list id or
  unoccupied key), "Component inputs" (what a registered component receives: t, subject/inject face,
  hooks), "Extension rules".
- docs/cookbook/adding-a-settings-card.md - THE recipe for this exact case: section 4 "Contribute to
  another plugin's page": plugins.detail.actions (control at page head), plugins.detail.badge (tag
  by title), plugins.detail.section (section under the page's own content). EVERY entry receives the
  page's subject - {kind:'bundle',pkg} | {kind:'row',pkg,row} | {kind:'item',id} - and returns null
  for subjects it has nothing for. Section 3: custom plugin pages receive form.state and
  form.mutate(operations, expectedRevision) from the Plugins page owner; volatile config edits go
  through ConfigEditor + volatile HMR. Section 5 "Where the browser half rides": the module system
  scans enabled Loader entries for packages declaring dsh.client and serves each one's built
  ./client export; the client file must be the lazy-CJS factory format
  (window.**ModuleLoader**.load({id, factory(require)})).
- docs/cookbook/adding-a-remote-api.md - five steps to expose a Host service as
  ctx.remote.<namespace> (TypertRemoteService + @Remote decorators, RemoteError code table,
  generated descriptors). Needed only for live ledger data.
- docs/subsystems/web-client.md - browser boot (window.**DSH_BOOT**, lazy-CJS module table), remote
  communication (ctx.remote methods, ctx.remote.$on).
- docs/cordis-tutorial/01-first-plugin.md - the minimal plugin shape.

Code anchors (app.asar .../node_modules/@deepseek-ai/..., read in place):

- dsh-client-ui-plugin-manager/lib/client.js - the Plugins page. line 27 rowConfigKey(bundle,rowId)
  -> "<bundle>#<rowId>" lines 30-34 SLOTS = ["plugins.item","plugins.bundle.config",
  "plugins.row.config"] lines 4402-4410 shell.overlay refresh toast registration lines 4411-4461
  ctx.slots.inject("main", ...) declares the Plugins page with these children (all scope "root"):
  plugins.add.actions list plugins.tab list plugins.item list plugins.bundle.activation keyed
  plugins.bundle.config keyed (key = bundle package name) plugins.row.config keyed (key =
  "<pkg>#<rowId>") plugins.detail.actions list plugins.detail.badge list plugins.detail.section list
  <-- family panel anchor line 4465 ctx.reflect.provide("pluginNavigation", {openBundle}) - a client
  service other plugins can call to deep-link into a bundle's detail view. line 4477
  sidebar.panellist registration (the "Plugins" tab itself). lines 4387-4394 live invalidation:
  ctx.remote.$on("plugin-manager/changed") etc. - the page already refreshes on Host plugin changes.
- dsh-agent-preset/skills/cordis-plugin-development/templates/decoration/ package.json + client.js -
  the working minimal package shape for a client (dsh.client {platform:"web", immediately:true,
  inject:[...]}, exports "./client", ./locale/*.json, ./icon; index.js exports apply(){}).

Data surfaces confirmed live (host inspect):

- Config.listConfigs name:"@playform/hook-dsh-tool-coach" -> entry include:hook-dsh-tool-coach,
  status "schema", full JSON schema with EVERY knob marked x-cordis.volatile (log, enabled,
  judgeTools, threshold, window, cooldown, escalateThreshold, enforce, enforceThreshold,
  exemptPatterns, patternTable, notes, fetchLive, maxSectionTools, sectionTtl). So "the knobs" are
  already machine-readable; they are simply NOT surfaced as forms today.
- remote namespaces the Plugins page already injects (client.js inject list, lines 4360-4366):
  remote, remote.pluginManager, remote.pluginInventory, remote.pluginRegistryProbe - live
  bundle/row/status data without ANY new endpoint. (Client-side inspect queries for the live slot
  tree timed out in this session - the GUI page was NOT connected; verified the declarations from
  source instead. Open the page and re-run cordis_inspect_query Slots.listSubTree to get the live
  tree.)

Family state for the panel (host-side, ~/.dsh/):

- 13 installed bundles under ~/.dsh/profiles/desktop/node_modules/@playform/ (plugin-dsh-factory;
  hook-dsh-package-governor, -package-pinner, -cargo-governor, -ccr, -tool-coach, -live-containers;
  hook-dsh-normalize- {file,dash,quotes,ellipsis,spaces,invisible,fullwidth}) - all disabled:false
  in the profile patch except tool-coach/live-containers rows (tool-coach row listed without
  disabled -> default; live-containers present).
- Ledger files: ~/.dsh/{governor,pinner,ccr,tool-coach,...}.log and hook-dsh-*.log tails (e.g.
  tool-coach logs "section rebuilt", "offense ..." lines) - what a family panel would stream;
  host-side files ONLY.

2. CURRENT DISPLAY OF THE FAMILY + LIMITS

Today EACH of the 13 bundles appears in the Plugins page as one generic installed-bundle row (name,
version tag, enable/disable, per-row enable/disable, and source info). The limits are:

- NO grouping, because factory, governors, 7 normalize flavors, ccr, and tool-coach are flat and
  indistinguishable from ANY third-party row.
- NO knobs, because the volatile Configs of the family (verified above) are NOT shown, since the
  family bundles register NO plugins.row.config / plugins.bundle.config forms, so nothing about
  threshold/enforce/exemptPatterns is editable in the UI.
- NO live state beyond enabled/disabled (via remote.pluginManager + the "plugin-manager/changed"
  event), because there are NO ledger tails, NO fiberPhases, NO recent offenses, and NO "section
  rebuilt" activity.
- The Settings > builtin plugins page (dsh-client-ui-settings-plugin-inventory) ONLY covers built-in
  namespaces and NOT @playform.

3. DESIGN SKETCH - THE FAMILY PANEL

One new package: @playform/dsh-family-panel (client half + optional Host half).

Registration surface (all additive, per slots.md extension rules):

- plugins.detail.section (list, id "playform-family"): when the subject is ANY @playform bundle,
  render a "PlayForm family" section with the family roster (the 13 bundles grouped: factory,
  governors, normalize flavors, ccr, tool-coach), EACH with live enabled state from
  remote.pluginManager and a deep-link via ctx.reflect "pluginNavigation".openBundle for
  cross-navigation.
- plugins.detail.badge (id "playform-family-badge"): a small "family" tag on EACH of the 13 bundle
  pages.
- plugins.row.config / plugins.bundle.config keyed by EACH family package: knob form(s) bound to the
  Config schema, where volatile fields update live through ConfigEditor + volatile HMR
  (loader/volatile-update) with NO restart.

Data sources:

- Live enable/row/status data: ctx.remote.pluginManager (already injected into the page, while the
  family panel injects "@deepseek-ai/dsh-api-remotes" itself and subscribes
  ctx.remote.$on("plugin-manager/changed")).
- Knobs: the host Config system (the forms that the Plugins page owner wires with form.state /
  form.mutate), where the values are volatile and therefore current and live.
- Ledger tails + fiberPhases: host files, where the Host half of the same package (a service in the
  same bundle) reads ~/.dsh/*.log tails and family state and must be a Typert remote endpoint per
  adding-a-remote-api.md (declare the @Remote method, generate descriptors, consume
  ctx.remote.<namespace>) to reach the browser, and that generation pipeline lives in the harness
  repo, so an external package must reproduce the build (the same caveat the docs make for the
  clientBundle format), while the alternative v1 shortcut is to expose ONLY what the existing remote
  namespaces already carry and defer the ledgers.

4. MINIMAL PROOF-OF-CONCEPT PATH

Smallest UI plugin that adds the family panel:

1. Package shape (copy templates/decoration/): package.json: name "@playform/dsh-family-panel",
   exports {".": "./index.js", "./client": "./client.js", "./locale/*.json", "./icon":
   "./icon.svg"}, dsh.bundle.patch "./cordis.patch.yml", dsh.client {platform:"web",
   immediately:true, inject:["@deepseek-ai/dsh-api-remotes",
   "@deepseek-ai/dsh-client-locale","@deepseek-ai/dsh-client-ui-layout"]}. index.js: export function
   apply() {} (empty host half). cordis.patch.yml: one row named after the package, disabled:false.
   client.js: lazy-CJS factory; in apply(ctx): ctx.slots.inject("plugins.detail.section", () =>
   ctx.slots.register( {name:"plugins.detail.section", id:"playform-family",
   locale:"dshFamilyPanel"}, FamilySection)); FamilySection({t, subject}) returns null unless
   subject.kind === "bundle" && subject.pkg.startsWith("@playform/"), otherwise renders the roster
   card. For v1 keep it static-roster + enable states; NO new endpoint, NO timers. Clean up any
   listeners with ctx.effect/ctx.on and return disposers. client.js is hand-written in the lazy-CJS
   format (small enough); locale/en.json for the strings; icon.svg original.
2. Install: plugin_manager install_bundle with the absolute package directory. Live profile =>
   changes apply immediately (HMR); NO restart expected - the restart reasons (host modules touched,
   package moved, unmanaged plugin) do NOT apply to a pure client-only package.
3. Verify: open the GUI, open Plugins > any @playform bundle; the family section renders. Confirm
   registration with client inspect Slots.listSubTree root:"plugins.detail.section" (requires the
   page open; timed out this session - re-check with the page connected). Uninstall removes
   everything cleanly (slot registration follows Cordis effect lifetimes).
4. v2 increments: knob forms via plugins.row.config; ledger tails via a Host Half + Typert remote
   endpoint; filter/notify via ctx.remote.$on events.

5. ACCEPTANCE CRITERIA

A1 EACH of the 13 @playform bundle detail pages shows the family section with the family roster and
the group of the bundle (factory/governor/normalize/ccr/tool-coach), while non-@playform subjects
render nothing. A2 Enable/disable of a family bundle in the manager reflects in the section without
a reload (plugin-manager/changed event). A3 At least one family knob (e.g. tool-coach enforce or
threshold) is editable in the UI and the live value changes without a restart (volatile HMR). A4
(v2) A ledger tail (e.g. hook-dsh-tool-coach.log last N lines) is visible and refreshes while the
page stays open. A5 NO harness checkout file is modified, the whole feature lives in one package,
and uninstall restores the stock Plugins page exactly. A6 ALL visible strings route through the
client locale service, and the icon is original.

6. RESIDUALS

- The client inspect queries (Slots.listSubTree, Service.listService) timed out this session because
  the GUI page was NOT connected, so the live-tree verification and the exact owner props of
  plugins.detail.section entries (beyond the documented subject) must be confirmed with the page
  open before implementation.
- The exact prop bag of plugins.detail.section is documented in adding-a-settings-card.md (subject +
  t), but the runtime shape of the inject face should be read from the live tree (or the d.ts of the
  page) when building.
- Ledger streaming needs the Typert remote generation pipeline, and an external package must
  reproduce that build itself (a documented caveat), so the cost is nontrivial and deferred from v1
  deliberately.
- The tool-coach and live-containers rows in the profile patch have NO explicit disabled flag
  (default behavior), so confirm their row state in the UI when populating the roster.
- The user-named path ~/Developer/Documentation/deepseek-harness does NOT exist, and this report
  uses ~/Developer/Documentation/Module/deepseek-harness/.
