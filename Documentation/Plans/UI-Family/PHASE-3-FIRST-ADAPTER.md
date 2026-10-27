---
title: The UI Family Implementation Plan - phase 3 (the first adapter: hook-dsh-tool-coach)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-3-FIRST-ADAPTER.md
index: Documentation/INDEX.md
statuses:
	- name: the tool-coach adapter (the first, with the marker-usage rule)
		state: open
		evidence: this document - the ladder section, the form POC, the marker rule (R5/R6)
---

# PHASE 3 - THE FIRST ADAPTER: HOOK-DSH-TOOL-COACH

> This is a granular document of the UI Family Implementation Plan.
> The parent hub is Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: prove the entire chain with ONE bundle.
- **THE THREE DELIVERABLES**: (a) a client half that registers its ladder section into the central registry, (b) the first plugins.row.config form, whose schema is 100% volatile and is therefore the easiest whileServed proof, and (c) the marker-usage teaching rule (R5/R6 from R-INTERACT, done here while the bundle is open).

## 1. Exact locations

- Classic/packages/hook-dsh-tool-coach/
    - package.json: add "dsh.client" {platform:"web", inject: ["@deepseek-ai/dsh-client-locale"]} and the "./client" export.
    - NEW Source/Client/ (or Library-side client module) -> built ./client
    - Source/Variable/Config.ts: add the panel block (panel: Schema.object({ enabled: boolean().default(true), density: string().default("compact") })), which is the own toggle gate.
    - Source/Variable/Patterns.ts + Source/Function/: the marker-usage rule (see step 4), host-side, with no client involvement.
    - Source/Test/: the additive smoke coverage (marker rule + panel gate).
- The form POC rides on the SAME client half: ctx.configForms.whileServed(["hook-dsh-tool-coach"], register) with ctx.slots.inject("plugins.row.config", ...) keyed "@playform/hook-dsh-tool-coach#<row id from the live profile patch>", which is the row id captured in phase 0 step 2.

## 2. Exact steps

1. **Add the panel Config block and the client-half scaffold.**

    Keep inject = [] toward the central package, with the contract via import type only, and make the adapter no-op when ctx.reflect.get("playformFamilyPanel") is absent.

2. **Implement the ladder section (mount "family-tab", order 30).**

    Render the coach's strike and escalation state from the section's own read of the coach's ledger tail via the phase 5 endpoint, or, for this phase, from the coach's runtime state exposed through the section props.
    Pick the simplest data path that does not require the Typert endpoint yet, because the ladder can be static-structure plus counts in phase 3 and live tails arrive in phase 5.

3. **Build the form POC (this is the R-UI-2 POC verbatim).**

    - Register the plugins.row.config slot via whileServed.
    - Render the form from ctx.configForms.describe() for the namespace: rehydrate Schema from the descriptor's serialized schema, then show the current value, the base, the user provenance, and the revision.
    - Save via form.mutate(operations, expectedRevision), which is revision-fenced.

4. **Add THE MARKER RULE (R5+R6, host-side, while the bundle is open).**

    - Add a detection row: ANY tool result containing "<<<CCR:" teaches "extract the 24-hex hash and call ccr_retrieve {hash, range?}".
    - Re-scope the "grep ccr.db / sqlite3 ledger" teaching text to point at the harness grep tool on the plain-text ~/.dsh/*.log ledgers for search intent, and use ccr_retrieve ONLY when a marker or hash is in hand.
    - Add additive smoke coverage: the existing ledger strings stay byte-identical and untouched, and the new rule gets its own assertions.

5. **Build, install, and restart once.**

    Build the package, keep the smokes green, install the bundle via install_bundle, and restart the harness ONCE.
    The R-UI-2 finding applies: the client half is discovered on composition, so ONE restart suffices and HMR keeps it live afterwards.

6. **Run the four verification steps (the R-UI-2 POC verification).**

    - Plugins -> the coach bundle -> the row shows Configure, and the form renders.
    - Edit a volatile knob (threshold) and save: the profile patch (~/.dsh/profiles/desktop/cordis.patch.yml) gains the id-keyed override with the comments and !!js preserved, and the coach's next operation uses the new value with unchanged instance identity (hook-dsh-tool-coach.log and loader/volatile-update prove it).
    - An invalid value is refused, and both the file and the live value stay unchanged.
    - A restart persists and reloads the saved value.

7. **Verify the cascade (the R-UI-3 POC steps).**

    Disable the central bundle, so the tab disappears and the adapter is dormant, then re-enable it, so the tab returns; then flip the coach's panel.enabled, so only the coach section goes and the others are unaffected.

8. **Write the ready-to-publish note for the family.**

    The client-half pattern that this adapter proves is the template for phases 4-5.

ANCHORS: R-UI-3 section 4 (the POC); R-UI-2 section 4 (the POC); <DOCS>/docs/cookbook/adding-a-settings-card.md sections 3-5; <DOCS>/docs/subsystems/settings.md ("Plugin Configuration Forms"); the chain anchors: <DSH>/node_modules/@deepseek-ai/dsh-settings/lib/index.js (describe -> volatileForm), dsh-config-editor/lib/index.js (edit -> cordis.patch.yml), cordis-plugin-loader/lib/index.js (Entry.update -> _commitVolatile -> loader/volatile-update); dsh-api-settings-controller (settings.describe/update/replace/mutate @Remote); dsh-client-ui-settings/lib/client.js (ctx.configForms, whileServed); R-INTERACT section 5.2 (R5, R6).

## 3. Acceptance

- A3.1 The coach's ladder section renders in the family tab, and the cascade gates (central off, adapter off, panel.enabled off) each behave per R-UI-3 A2-A4.
- A3.2 The coach's volatile knobs are editable in the GUI with the full R-UI-2 acceptance chain (patch override, no remount, revision-fenced, restart-persistent).
- A3.3 The marker-usage rule fires on a "<<<CCR:" result, observable in hook-dsh-tool-coach.log, and the re-scoped ledger-search text is live.
- A3.4 The coach's existing smokes stay byte-identical, the new coverage is additive, and the runner total matches.
