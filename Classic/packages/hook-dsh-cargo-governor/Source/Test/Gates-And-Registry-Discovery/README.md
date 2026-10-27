# Gates-And-Registry-Discovery

This file states what the test verifies.

## Intent

The suite covers the trigger gates of the cargo governor and its registry discovery lines.

The gates are its first line of defense, so a non-mutation actor, a truly missing actor (reads emit
too), an absent-kind probe, and a wrong basename must all be handled with NO ledger line.

The two gates that DO speak speak exactly: the exclusion-first `skipped (excluded) <path>` line with
no read and no write on a real file written under the node_modules path of the harness Root, and the
Stash idempotence gate, which blocks the governor's own re-emit of the `fresh-v2` version that the
write pre-registered, so hard that not even a read happens.

The registry discovery lines cover a missing `registry.json`, which produces
`no registry.json found for <path> - chain pass skipped`, and an unparseable one, which produces
`unreadable registry.json at <path> - chain pass skipped for <path>`.

The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` sections 4-5.

## Scenario

- Group: the actor + kind gates (end-to-end through the real listener).
    - Sub: "gate: actor + kind gates silent (reads emit too, absent probes)"
- Group: the basename gate.
    - Sub: "gate: basename gate silent for non-Cargo.toml"
- Group: exclusion-first.
    - Sub: "gate: exclusion-first -> `skipped (excluded) <path>`, no read, no
      write"
- Group: the Stash idempotence gate.
    - Sub: "gate: the Stash idempotence gate blocks our own re-emits (no
      read, no write)"
- Group: the registry discovery lines.
    - Sub: "g2: `no registry.json found for ... — chain pass skipped`"
    - Sub: "g2: `unreadable registry.json at ... — chain pass skipped for
      ...`"

## Fixtures

The harness builds per-scenario worlds with the `subprocess` SeamStub and the real Furnace.

The exclusion fixture writes a real `node_modules/x/Cargo.toml` file created with mkdir -p, the
idempotence fixture seeds the in-memory files map and a `registry.json` with `serde: 2.1.0`, and the
bad-registry fixture writes `{ nope` as the registry body.

## Expected ledger strings (byte-identical)

- `skipped (excluded) <path>` (the exclusion-first line, exactly one)
- `observed non-JSON/TOML Cargo.toml <path> — skipped` (U+2014; the missing
  content read behind a package.json display path)
- `no registry.json found for <path> — chain pass skipped` (U+2014)
- `unreadable registry.json at <registry path> — chain pass skipped for
  <path>` (U+2014)

## Edge cases

- The three silent gates each compare against the activation-line baseline, so any extra line fails.
- The idempotence check asserts that the read count AND the write count stay unchanged after the
  re-emit, plus exactly ONE governed line in total.
- The basename scenario fires a subdirectory `Cargo.toml` whose content read fails, and the gate still
  speaks the non-TOML line, because the discovery is downstream of the basename gate.

## Expected count

6 PASS.
