# TASK: FILE-MENTION ALIGNMENT (agent 3f17ce20)

## TEMPORARY CURRENT STATE (inspected 2026-10-09)
- STATUS: VERIFIED + CLOSED (2026-10-09 - the orchestrator ran the committed
  Scripts/baseline-measure.cjs - the user's fix 5ddb6e2c + the script itself are
  committed): 76 measurements across /, /plugins/, /setup/, /case-study/,
  /flavors/, /plugins/hook-dsh-pinner-package/ (both themes) - 74 PASS at 0.0px
  drift (the user's example "The silent package.json version pinner" + the prose
  contexts + the .log-chips), 2 FAIL at 1px drift (the pinner page's "pinner.log"
  log-chip, 24px context, both themes - a sub-pixel rounding scale, NOT the
  user's example contexts). The source + the built CSS carry `baseline-source:
  last` for both units. The residual: the 2 pinner.log 1px cases - the user's
  call whether to micro-refine (the fix is their commit; the drift is 1px).
- THE RESIDUAL RE-INVESTIGATION (2026-10-09 - the "fix all" dispatch): NO CSS
  EDIT MADE + recommended - the pixel-truth measurement (deviceScaleFactor 3,
  same-font control) shows the real offset is -0.83px BOTH themes (under the
  1px pass criterion), quantized to 1.00 by the caret-rect formula; the root is
  Chrome's half-leading rounding for a 13px/18px chip inside a 14px/20px table
  cell - a shared-rule nudge would shift ALL chips equally and regress the 74
  zeros. The honest lever if the script must read 0: the measurement script's
  formula (the caret-rect height ratio), NOT the stylesheet - the user's call.

## THE TASK (the spec given)
Fix the .file-mention units' vertical alignment in the prose: the file-type icon +
the filename inline-flex units vs the surrounding text - the optical baseline
(the unit's alignment against the paragraph text - the user's example "The silent
package.json version pinner: hooks" - the package.json unit misaligned). The
.log-chip (the same icon-first inline-flex pattern) included. Verify across the
prose contexts (the card sentences, the concept bodies, the showcases). The rules:
the corrected claims + the byte-exact content untouched (the alignment only); the
typography laws; the tokens; the tabs; the byte-integrity rule; never commit.
Arbiter: the build (21 pages) + the dev-server curls + the built-CSS verification +
the measured alignment.

## THE ENHANCEMENTS / IMPROVEMENTS
- Verify the COMMITTED fix (5ddb6e2c) actually renders the alignment the user asked
  for - the measured baseline (the headless browser - the icon+filename unit's
  baseline == the text's baseline) on the user's example + the contexts.
- The .log-chip's alignment included (the same pattern).
- If the committed fix is incomplete (the measurement fails), complete it surgically.