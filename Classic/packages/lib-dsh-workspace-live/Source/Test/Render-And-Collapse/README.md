# Render-And-Collapse - the section framer and the budget collapse tests

The library's render/collapse half, tested as pure functions against the
real built `Target/Library.js`.

## Scenarios

- R1: the fixed frame - byte-exact with the version stamp
  (`- t @ v2 ---`), byte-exact without one, and an empty section renders as
  the empty string (the caller drops it - the stable-until-event rule).
- C1: the budget collapse - a generous budget keeps every section framed
  and uncollapsed; the overflow section collapses to its one-line
  version-stamped summary (`s2 (focus) collapsed: two @ v5`), never
  dropped; a zero budget collapses everything.

## Fixtures

The shared Harness (the counter plus the real built library exports - the
library is pure, so there is no fake ctx, no fs, and no clock).

## Expected format (byte-exact)

The frame
`--- WORKSPACE SECTION <id> (<kind>) - <title>[ @ <version>] ---` /
body / `--- END WORKSPACE SECTION <id> ---`; the summary
`<id> (<kind>) collapsed: <title>[ @ <version>]`.

## Expected count

7 PASS.
