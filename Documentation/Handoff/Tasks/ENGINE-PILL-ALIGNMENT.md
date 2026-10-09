# TASK: ENGINE-PILL ALIGNMENT (agent ccc68bb2)

## TEMPORARY CURRENT STATE (inspected 2026-10-09)
- STATUS: COMPLETE + VERIFIED (2026-10-09 - the IDLE-lane activation + two
  resumes after the deaths/pauses; landed in the user's commit 0506601f):
  the headless geometry (Scripts/engine-pill-measure.cjs - committed) measured
  the icon/dot optical centers -2.13..-2.63px ABOVE the text ink centers with
  the .engine-pill .brand-icon/.dot optical-lift rule (margin-block
  -0.1875em) - the lift was the CAUSE, not the counter-fix; the fix removed
  those two selectors from the shared lift rule in Global.css (the other lift
  contexts untouched) + the measured verdict documented in the rule's comment.
  AFTER: workbench 0.0px, matrix 0.0px, models +0.5px, both themes - inside
  the ±0.5px badge-lane class. Coverage: the .engine-pill pattern exists only
  on workbench/matrix/models + the shared CSS - the fix covers all. Built
  verification: 21 pages + the preview curls 200. NEVER committed by the lane
  (the user committed). Residual: the models pills' +0.5px (line-height/font
  context, within the tolerance).

## THE TASK (the spec given)
The user: "'Runtime: Classic Pipeline / Effect-TS v4 Fiber' icons TypeScript and
Effect-TS are not vertically aligned to the text". The engine pills' icons (the
typescript + the effect marks + the others in the pill contexts) perfectly
vertically aligned to the text - the measured optical center == the text's center
(the vertical-align/margin/offset per the pill's flex layout - the precision of
the earlier badge-icon lane: the measured -2.20px -> +0.24px class - the
verification with the geometry measurement: the headless browser, the icon's
optical center vs the text's ink-bbox center). The coverage: the workbench +
the matrix + the models pills. The rules: the corrected claims + the byte-exact
content untouched; the typography laws; the tokens; the tabs; the byte-integrity
rule; never commit. Arbiter: the build (21 pages) + the dev-server curls + the
measured alignment verification.

## THE ENHANCEMENTS / IMPROVEMENTS
- The engine-pill alignment ALSO covering the pills on the OTHER pages (the
  "everywhere" doctrine - the pills' pattern search).
- The .engine-pill .brand-icon optical-lift rule (the icon-margins lane's
  -0.1875em) - verify it is the cause or the counter-fix - the measurement first.