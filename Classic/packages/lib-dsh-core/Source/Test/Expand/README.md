# Expand

What this test verifies.

## Intent

`Expand` resolves the leading tilde in a config-supplied path to the user's
home directory: the bare `"~"` becomes the home itself, the `"~/x"` form
becomes `join(home, "x")`, and every other path (absolute, relative, empty)
passes through unchanged. It is its own folder because the expansion is the
liveness contract of every config-supplied write path - the desktop profile
configures `logFile: ~/.dsh/<name>.log` for all 49 `@play` rows, and an
unexpanded `"~"` makes the writer's `appendFileSync` fail ENOENT silently
under its catch. The helpers of the writer modules (the factory's Append,
the journals, the ccr store) call this exactly once at their write site.

## Scenario

- Group: Expand - the tilde expansion (home, home/child, unchanged paths).
    - Check (one source ok group): the five shapes.
        - Leaf: the bare tilde - `Expand("~")` equals the (redirected) home.
        - Leaf: the home-prefixed form - `Expand("~/a/b")` equals
          `join(home, "a/b")`.
        - Leaf: an absolute path passes through unchanged - `Expand("/abs")`
          is `/abs`.
        - Leaf: a relative path passes through unchanged - `Expand("rel")`
          is `rel`.
        - Leaf: the empty path passes through unchanged - `Expand("")` is `""`.

## Fixtures

- A fresh OS temp directory (`mkdtempSync`, prefix `expand-smoke-`) assigned
  to `process.env.HOME` for the duration of the check - `os.homedir()`
  honors `$HOME` on POSIX, so the assertions run against the temp home and
  never touch the real one. The original value is restored in a `finally`
  (or deleted, if it was unset).

## Expected ledger strings (byte-exact)

None - `Expand` is a pure path function; it emits no ledger lines.

## Edge cases

- A tilde not at the start of the path (e.g. `a~b`) is not a home reference;
  the function passes it through (covered by the relative/absolute leaves'
  shared default arm).
- The `$HOME` restoration covers both the set and the unset original.

## Expected count

1 PASS.
