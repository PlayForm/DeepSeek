# TASK: ENGINE-PILL ALIGNMENT (agent ccc68bb2)

## TEMPORARY CURRENT STATE (inspected 2026-10-09)
- STATUS: IDLE - never activated - no work done. The agent's session holds the
  spec. The current pills: the workbench's Runtime pills ("Classic Pipeline" with
  the typescript mark + "Effect-TS v4 Fiber" with the effect mark), the matrix's
  Architecture engine pills, the models page's engine pills - the icons sit
  misaligned against the pill text (the user's feedback).

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