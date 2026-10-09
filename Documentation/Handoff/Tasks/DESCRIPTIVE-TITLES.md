# TASK: DESCRIPTIVE-TITLES (agent 050c666b)

## TEMPORARY CURRENT STATE (inspected 2026-10-09)
- STATUS: IDLE - never activated - no work done. The agent's session holds the
  spec. The current state (the global-sweep verified): the section-header h2 =
  the headline-md 20px ink; the concept h3 plain; the showcase title the
  headline-md - the descriptive-title treatment not yet applied.

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