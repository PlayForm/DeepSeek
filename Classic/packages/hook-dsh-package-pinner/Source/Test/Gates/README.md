# Gates

This test verifies the following behavior.

## Intent

The pinner's g1 gate set is its first line of defense, because events that are not a mutation-actor write of a package.json body must be handled with NO read, NO write, and NO ledger line.

The two gates that DO speak must speak exactly: the exclusion-first `skipped (excluded)` line (regex byte-format, file untouched) and the Stash idempotence gate, which must be silent even on an excluded path because idempotence precedes exclusion.

All of this is exercised through the REAL wired listener.

The assertions are moved verbatim from `Classic/smokes/pinner-smoke.mjs` section 4.

## Scenario

- Group: the g1 gate set (end-to-end through the real listener).
    - Sub: "gates: actor / kind / basename - no read, no write, no line"
    - Sub: "gates: exclusion-first -> skipped (excluded) line, file untouched"
    - Sub: "gates: Stash idempotence - silent re-emit, precedence over the excluded line"

## Fixtures

The harness Boot uses the real-token fs, with a `gates/` directory under the harness Root.

The exclusion fixture is a `node_modules/x/package.json` display path (never read).

The idempotence fixture seeds `st.Stash` with `g-dup` and fires both a plain and an excluded re-emit.

## Expected ledger strings (byte-identical)

- `[ISO] skipped (excluded) <.../node_modules/x/package.json>` (the regex form).

## Edge cases

- The three silent gates share one baseline (`before`), so any read, write, or line from any of them fails the check.
- The excluded-path fire must not even read the file.
- The re-emit on an excluded path stays silent (idempotence first).

## Expected count

3 PASS.
