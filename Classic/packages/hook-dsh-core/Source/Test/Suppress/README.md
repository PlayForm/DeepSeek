# Suppress

What this test verifies.

## Intent

`Suppress` composes the byte-identical suppression lines every governance module
logs when it swallows a benign failure: `<module>: <kind> error (suppressed): <cause>`.
It is its own folder because the suppression line is a CONTRACT string shared by
the governor, the pinner and the cargo modules - a wording change here silently
changes every module's ledger at once. The three shapes (continuation error,
listener error with a string cause, empty-message error) are the source suite's
section 2, moved verbatim.

## Scenario

- Group: Suppress - the suppression-line composer (module/kind/cause).
    - Check (one source ok group): the three suppression-line shapes.
        - Leaf: the continuation shape - `Suppress("package-governor", "continuation",
          new Error("boom"))` equals the continuation line.
        - Leaf: the listener shape with a string cause - `Suppress("package-pinner",
          "listener", "x")` equals the listener line.
        - Leaf: an empty-message error still composes the suppressed line - either
          the exact empty-cause line or at minimum the "(suppressed):" marker.

## Fixtures

None. Pure function calls against the REAL built `Target/Library.js`; no fs, no
ctx, no factory.

## Expected ledger strings (byte-exact)

- `package-governor: continuation error (suppressed): boom`
- `package-pinner: listener error (suppressed): x`
- `cargo-governor: listener error (suppressed): ` (with an empty cause; the
  assertion also accepts any line containing `(suppressed):` for this shape)

## Edge cases

- The cause can be an Error object or a plain string; both compose.
- An empty error message still yields the "(suppressed):" marker - the line is
  never empty even when the cause is.

## Expected count

1 PASS.
