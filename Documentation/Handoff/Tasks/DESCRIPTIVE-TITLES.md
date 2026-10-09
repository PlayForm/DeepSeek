# TASK: DESCRIPTIVE-TITLES (agent 050c666b)

## STATUS: LANDED + VERIFIED + SCOPED (2026-10-09 - the orchestrator's spot-check: the .concept__title headline-lg/--color-on-surface-variant rule confirmed in the built Badge CSS; the handoff matrix item 11 flipped to ADDRESSED; the user's scope feedback (the info icon was only meant for the case-study descriptive titles) landed as the SHOWCASE REVERT - verified: 0 info icons on the index's use-cases cards (was 3), the 45 kept on the case-study, the identity-word colors intact)
- The treatment: every descriptive title now renders at the headline-lg scale
  (28px/36px, weight 600, tracking -0.015em — one full step above the
  section-header's headline-md) in the muted `--color-on-surface-variant` tone
  (dark theme flips via the token), with the info icon on the LEFT through the
  flex layout + the `--gap-icon` token; the icon inherits the muted tone via
  currentColor.
- The info icon: CREATED — the `info` mechanic added to
  Source/Component/BrandIcon.astro (the circled-i, viewBox cropped to "1 1 22 22",
  stroke-width 1.375 = the family's crop-compensated 1.5-on-24, currentColor,
  round caps/joins — same optics as the chain glyph).
- The coverage: the Concept titles (case-study + setup/versions/models/matrix/
  flavors/plugins + 13 plugin pages — the era-story titles included), and the
  pinner page's 14 `concept-block__title` h3s. The Showcase use-case card titles
  were REVERTED after user feedback (the icon was only meant for the
  case-study-style pages' titles-before-paragraphs, not the index's card names):
  Showcase.astro restored to the pre-lane headline-md/on-surface card-title
  styling, no icon; the lane-3 identity-word coloring on those cards kept. The
  SectionHeader h2s untouched, per spec.
- The shared law: the scale/tone block in Source/Stylesheet/Global.css
  (.concept__title) + the per-component layout in Concept.astro and the pinner
  page's scoped styles.
- Verified: npx astro build — 21 pages; the built HTML carries the
  brand-icon--info svg (viewBox "1 1 22 22", stroke 1.375) inside every
  concept__title h3 and the headline-lg/on-surface-variant rule in the built CSS;
  dev-server curls 200 on /, /case-study/, /plugins/hook-dsh-pinner-package/,
  /versions/, /setup/, /flavors/ (45 info icons in the served case-study).
- Residual: InstallDemo step titles and Card package names left as-is (not
  descriptive headings, by judgment); the coverage-matrix item 11 can be marked
  ADDRESSED by the orchestrator.

## THE TASK (the spec given)
The user: "on the case-study page and other pages like it: descriptive titles like
'The one-line fix and the standing lesson' before the paragraph need a LARGER
heading formatting such as 'The one-line fix and the standing lesson:' possibly a
little GRAYED OUT, with an INFORMATION ICON on the side (left)". (1) The LARGER
heading formatting - the descriptive titles (the concept-block titles + the
case-study's era-story titles + the other pages' descriptive titles) at a size
above the current h3 (the site's heading scale - the headline-md/lg - your call
per the design's hierarchy, the typography laws held); (2) the GRAYED-OUT tone -
the muted color (the ink-muted/on-surface-variant - the dark theme flips via the
token); (3) the INFORMATION ICON on the LEFT - the info icon (the circled-i / the
info glyph in the site's stroke family - the 24-grid, 1.5 stroke, currentColor -
like the other mechanics icons - create it if missing + place it left of the
titles, the inline-flex, the --gap-icon, the optical alignment); (4) the COVERAGE
- the descriptive titles across the case-study + the other pages (the concept
titles + the era-story titles + the card titles that read as the descriptive
headings - the section headers (the SectionHeader component) stay as they are).
The rules: the corrected claims + the byte-exact content untouched; the typography
laws; the tokens; the tabs; the byte-integrity rule; never commit. Arbiter: the
build (21 pages) + the dev-server curls + the built-HTML/CSS verification.

## THE ENHANCEMENTS / IMPROVEMENTS
- The info icon's consistency with the mechanics-icon family (the same stroke
  weight + the grid).
- The descriptive-title style also covering the showcase titles' pattern (the
  "THE PIN"-style card titles - the judgment).
- The global-sweep's coverage matrix marks this item PENDING-QUEUED - after this
  lane lands, re-verify the matrix's item 11.