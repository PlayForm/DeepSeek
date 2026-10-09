# SUGGESTIONS LEDGER - 2026-10-09 (recorded, user-curated)

> The improvement suggestions for the site's requirements, trimmed per the user's
> directives: NO screenshots, NO performance work (the minifier covers it), NO
> colorblindness (aria only), the drift-guard is IMPORTANT. Plus the new
> CONFIGURATOR requirement.

## 1. The recorded improvements (the kept suggestions)

1. THE FLUID TYPE SCALE: the headline/display sizes via clamp() - the smooth
   scaling instead of the breakpoint jumps. The tabular numerals for the mono
   data (the counts, the totals, the ledger digits align columnar). The tighter
   display tracking for the hero-size type only.
2. THE ORANGE AS THE LIVE-WRITING LANGUAGE: the pending/paused/writing states
   share the accent-orange - one meaning, consistent everywhere. The hover-pause
   gains the cursor affordance (the pause glyph follows the cursor over the
   streams) + the PAUSED transition eased.
3. THE TRAY MARKERS' SEMANTIC STATE: the first marker's soft pulse during the
   live writing (the markers' one-indicator language deepened). THE ARIA: the
   trays' aria-live announcements on the state changes (the pause/resume
   announced) - the aria is the accessibility priority.
4. THE FLAVOR CELLS' KEYBOARD + FOCUS: the chips' focus rings + the flavor
   grid keyboard-navigable; the version chip's semantic group (the flavor + the
   version as one labelled unit for the screen readers).
5. THE DARK THEME'S CODE-TOKEN CONTRAST: the #F8FAFC tray's dark-mode audit
   (the token text's contrast at the 13px floor). The toggle's persistence
   indicator (the pinned vs the OS-following state visible).
6. THE INTERACTIVE DIAGRAMS: the hover highlights the related nodes (the same
   pre-baked SVGs, a tiny overlay script) + the diagram nodes linking to the
   source files (the tree/Current links - the diagrams as navigation).
7. THE MARKS' LINK AFFORDANCES: the hover states for the linked brand marks +
   the alt-texts verified for the meaningful placements.
8. THE COMPARE'S STEP MARKERS + SNAP POINTS: the 25/50/75 snap positions (the
   drag's 0.00% tracking stays) - the demos more instructive.
9. THE DRIFT-GUARD IS IMPORTANT (the user's emphasis): the drift-guard's
   extension - the copyright + the brand string + the totals' cross-checks
   already; ADD the ledger-line samples' byte-verification + the content-
   integrity checks wired into the CI gate (the workflows' checks).
10. THE ARIA PASS (the accessibility priority): the streams' aria-live regions
    (the raw/clean panes' updates announced at a sane rate), the trays' state
    announcements, the semantic groups - NO colorblind work (per the user).

## 2. THE CONFIGURATOR (the new requirement - user-mandated 2026-10-09)

THE FEATURE: the website gains a CONFIGURATOR - the user chooses which plugins
to install/set up (the family's packages) + the website GENERATES a ONE-CLICK
INSTALL-ALL from pnpm that the user runs INSIDE his ~/.dsh folder.

THE DESIGN (the setup page's interactive configurator):
- THE SELECTION: the 12 packages (the core, the factory, the governance trio,
  the 7 normalize flavors) as the selectable toggles + the ENGINE choice
  (CLASSIC vs EFFECT-TS - the dual-source toggle) + the profile name.
- THE GENERATED OUTPUT (live, as the user selects): (1) the one-click
  INSTALL-ALL command block - the pnpm command(s) the user runs inside the
  ~/.dsh folder - the family's install form per the dual-source layout
  (`pnpm add @playform/<pkg>` per the selected packages + the engine's
  condition - a single copyable block); (2) the profile wiring - the bundles
  list JSON + the cordis.patch.yml inserts (the setup page's existing 4-step
  flow, GENERATED from the selection); (3) the verification lines (the
  activation ledgers the user checks).
- THE FIDELITY: the generated commands reflect the CURRENT truth (the
  once-published qualifiers - the npm publishing pending - the command block
  truthful), the content library + the Links registry for the dynamic values,
  the copy-trigger + the COPIED feedback (the existing patterns), the byte-
  exactness (the generated output's correctness is the arbiter).
- THE STATE: the selection persists (the URL query or the localStorage - the
  configurator's state shareable).

## 3. The ledger's placement

- This ledger feeds the next session's optional enhancements (the handoff's
  §3 pending additions) - the configurator is a NEW feature lane (the setup
  page's interactive configurator - the plugin selection + the generated
  one-click install-all).