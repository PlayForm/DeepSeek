# Pin-Pass-And-No-Ops

What this test verifies.

## Intent

This folder covers the core value proposition of the pinner, end to end.

The pin pass observes a package.json through the real-token fs, reads it with the abort signal of the pass, and applies the range law: strip exactly one leading `^`/`~`/`=` prefix in each of the four sections, and leave everything else untouched (static, `*`, empty, comparison, compound, protocol, file:, link:, git+, npm: alias, and non-string values), with the documented `^1.*` -> `1.*` edge.

Then it lands the guarded write (`replaceIfVersion` at the fresh-stat version, task-owned abort signal) with the serialization of the trio.

The version-coherence machinery follows: the Stash pre-registration, the byte-identical `pinned <path> (7 versions)` line, the P-sub-3 same-actor re-emit, and the re-entrant no-op.

The next guarded write of the author at the fresh version must not leak a stale-version error.

The three no-op paths (already pinned, non-JSON, vanished) close the folder: all silent, writes-none.

The assertions are moved verbatim from `Classic/smokes/pinner-smoke.mjs` sections 5-6.

## Scenario

- Group: the pin pass - the range law across all four sections.
    - Check: "the range law: strip ^/~/= one leading prefix, everything else untouched, all four sections".
    - Check: "the pin pass: guarded write + Stash pre-registration + the P-sub-3 same-actor re-emit".
    - Check: "re-entrancy: the P-sub-3 re-emit is a silent no-op (no rewrite loop)".
    - Check: "version coherence: the author's next guarded write succeeds at the fresh version".
- Group: the invariant of the refusal guard plus the no-op paths.
    - Check: "no-op paths: no changes to pin / observed non-JSON / vanished - all silent writes-none".

## Fixtures

The harness Boot runs with the real-token fs.

A full 15-range `author` manifest sits in `pin-basic/package.json` (real file, real token).

The no-op fixtures under `noops/` are a pinned manifest, a `{ nope` manifest, and a ghost (never-written) path.

The await-free property is captured between the fire and the settle (`writesAtFire`).

## Expected ledger strings (byte-identical)

- `pinned <path> (7 versions)` (byte-identical; the count 7 is part of the contract: caret/tilde/equals/wildcard + dev/peer/optional)
- `no changes to pin for <path>`
- `observed non-JSON package.json <path> - skipped` (U+2014)

## Edge cases

- The listener is await-free, so no write happens before the settle.
- Exactly one governed read happens, and it carries the abort signal of the pass.
- Exactly one `pinned` line appears (no duplicate from the re-emit).
- The re-entrant pass at the fresh version does no read, no write, and no line.
- The next `replaceIfVersion` write of the author at the fresh version must not reject (no stale-version leak).
- Inflight is empty after every no-op path.

## Expected count

5 PASS.
