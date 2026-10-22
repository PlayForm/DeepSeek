---
title: The UI Family Implementation Plan - phase 0 (orientation, the mount-failure investigation, the live inspect)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-0-ORIENTATION.md
index: Documentation/INDEX.md
statuses:
	- name: the mount-failure investigation
		state: open
		evidence: this document - the cause and the GUI error surface to be resolved in phase 0
	- name: the five live-inspect captures
		state: open
		evidence: this document + the appendix - pending phase 0
	- name: the throwaway client install test
		state: open
		evidence: this document - exercises install_bundle + HMR + uninstall before real work
---

# PHASE 0 - ORIENTATION, THE MOUNT-FAILURE INVESTIGATION, THE LIVE INSPECT

> Granular document of the UI Family Implementation Plan. The parent hub:
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: start every later phase from verified live state, and close the mount-failure
  question before any client half is installed.

## 1. Exact locations

- **THE LIVE PROFILE**: ~/.dsh/profiles/desktop/cordis.patch.yml
- **THE LIVE PROFILE MODULES**: ~/.dsh/profiles/desktop/node_modules/@playform/
- **THE LIVE LEDGERS**: ~/.dsh/_.log (ccr.log, hook-dsh-tool-coach.log,
  hook-dsh-governor-package.log, hook-dsh-governor-cargo.log, hook-dsh-package-pinner.log,
  hook-dsh-normalize-_.log, plugin-dsh-normalize-file.log, live-containers log per its config)
- **THE HARNESS IMPLEMENTATION** (read-only): /Applications/DeepSeek
  Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/
- **THE DOCS ANCHORS**: <DOCS>/docs/subsystems/slots.md;
  <DOCS>/docs/cookbook/adding-a-settings-card.md sections 3-5;
  <DOCS>/docs/cookbook/adding-a-remote-api.md; <DOCS>/docs/subsystems/web-client.md (<DOCS> =
  ~/Developer/Documentation/Module/deepseek-harness)
- **THE FAMILY SKILL TRUTHS**: Documentation/Skill/plugin-system,
  Documentation/Skill/plugin-development, Documentation/Skill/smoke-writing (repo copies first;
  ~/.dsh/skills/ fallback).

## 2. Exact steps

1. Re-read the four research documents and this plan. Recite the brief.
2. Read the live profile patch (~/.dsh/profiles/desktop/cordis.patch.yml) and confirm: which of the
   13 bundles carry an explicit disabled flag; the exact row ids for EVERY family entry (these ids
   ARE the plugins.row.config keys and the whileServed namespaces later); whether tool-coach and
   live-containers rows default (R-UI-1 residual: they carry NO explicit disabled flag).
3. **THE MOUNT-FAILURE INVESTIGATION**: R-UI-1/R-UI-3 record that a prior client install attempt
   produced live-containers "fiberPhase:failed". Investigate the class before writing ANY client
   half: a. Query the host inspect providers for the live-containers entry's pluginManager/fiber
   status (cordis_inspect_query, host platform). b. Read the live-containers bundle's current
   cordis.patch.yml row and its Config (Classic/packages/hook-dsh-live-containers/) for a
   config-shape mismatch. The most likely cause: a patch row whose config does not validate against
   the schema => the fiber fails at mount. c. Determine whether the failure was (i) a config
   validation failure, (ii) a client-half load error, or (iii) an apply() throw. Record the cause in
   the risks document (the risk register) as RESOLVED with the evidence, or as an open risk with the
   mitigation. d. Verify the GUI's error surface: with the GUI open, find where fiberPhase:failed is
   displayed (the Plugins page row status / the shell overlay). Then EVERY later install failure is
   diagnosed in the GUI, not just in logs. This is also the "apply simulation" surface.
4. **THE LIVE INSPECT BASELINE**: with the Web GUI open (the page must stay open for the duration):
   a. cordis_inspect_query (client) Slots.listSubTree root:"plugins.detail.section"
    - capture the exact owner-prop bag of an existing entry (subject, t, and whatever else ships) -
      the R-UI-1 residual. b. Same for root:"plugins.row.config" and "plugins.bundle.config" (expect
      empty - that absence IS the gap). c. Same for root:"conversation.view" - capture the chat and
      trajectory entries' full props (label/locale/order/children) - the R-UI-3 residual. d.
      cordis_inspect_query (client) Service.listService - confirm ctx.reflect "pluginNavigation" is
      visible from a client provider. e. Save all five captures into the appendix document so later
      phases do not re-query.
5. Confirm the plugin_manager install path end-to-end with a THROWAWAY: install a minimal do-nothing
   client package (copy the shape from
   <DSH>/node_modules/@deepseek-ai/dsh-agent-preset/skills/cordis-plugin-
   development/templates/decoration/package.json + client.js). Verify the row appears in the GUI
   WITHOUT a restart, then remove it. This exercises install_bundle + HMR + uninstall on THIS
   profile before real work lands.

ANCHORS: plugins.detail.section/badge/actions, plugins.row.config, plugins.bundle.config,
plugins.item, plugins.bundle.activation (the nine child slots declared at
<DSH>/node_modules/@deepseek-ai/dsh-client-ui-plugin-manager/ lib/client.js:4411-4461; the
rowConfigKey at :27; the slot list at :30-34; pluginNavigation at :4465; the refresh events at
:4387-4394).

## 3. Acceptance

- A0.1 The five live-inspect captures exist as an appendix.
- A0.2 The mount-failure cause is recorded RESOLVED-with-evidence or open-with-mitigation in the
  risks document.
- A0.3 The throwaway client package installed, rendered, and uninstalled cleanly (no restart, no
  residue in the profile patch).
