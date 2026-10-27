# Render-And-Collapse - the section framer and the budget collapse tests

This folder covers the library's render and collapse half, tested as pure functions against the real built `Target/Library.js`.

## Scenarios

- R1: the fixed frame is byte-exact with the version stamp (`- t @ v2 ---`), byte-exact without one, and an empty section renders as the empty string (the caller drops it, following the stable-until-event rule).
- C1: the budget collapse keeps every section framed and uncollapsed under a generous budget, collapses the overflow section to its one-line version-stamped summary (`s2 (focus) collapsed: two @ v5`) and never drops it, and collapses everything under a zero budget.

## Fixtures

The fixtures use the shared Harness (the counter plus the real built library exports, and the library is pure, so there is no fake ctx, no fs, and no clock).

## Expected format (byte-exact)

The frame `--- WORKSPACE SECTION <id> (<kind>) - <title>[ @ <version>] ---` / body / `--- END WORKSPACE SECTION <id> ---`; the summary `<id> (<kind>) collapsed: <title>[ @ <version>]`.

## Expected count

7 PASS.
