# Gate-Write-Refresh

This file states what the test verifies.

## Intent

This folder covers the write path: `Gate`, the full g1 matrix that decides whether an fs/observed
event may proceed; `GuardedWrite`, the ONE shared write executor with the replaceIfVersion intent,
the two sandbox postures and the P4 fence, the fresh-version Stash pre-registration, and the
abort-signal forwarding; and `Refresh`, the same-actor fs/observed re-emit with best-effort
containment.

These three surfaces have their own folder because the reason strings of the gate and the
intent/fence shapes of the write are contracts that every update engine of every module rides on,
and the negative controls, the six failing gate reasons and the bus-down refresh, matter as much as
the pass.

This folder holds sections 7, 10, and 11 of the source suite plus the empty-tool-list and
abort-signal edge checks, moved verbatim.

## Scenario

- Group: 7 - Gate: the full g1 matrix.
    - Check: "Gate: full g1 matrix
      (target/govern/actor/kind/idempotent/basename/excluded/pass)" - a null
      target gives reason "target"; a missing or grep actor gives "actor"; an
      absent kind gives "kind"; a Stash hit gives "idempotent"; a Cargo.toml
      basename gives "basename"; an excluded segment gives "excluded"; the
      happy path gives `{pass: true, path}`; a non-mutation tool with the
      `mutationToolsField` option gives "actor"; the wrapped actor of
      raw-write with the `govern` marker (false, true, an array) gives the
      silent event-path skip with reason "govern"; a bare `raw-write` NAME
      alone keeps the actor check, because the marker is the gate.
- Group: 10 - GuardedWrite: both sandbox postures + version guard.
    - Check: "GuardedWrite: replaceIfVersion intent + both P4 postures + Stash
      pre-registration" - the bare backend writes with the replaceIfVersion
      intent against "v1" and NO fence; the workspace-write backend fences
      rooted at the directory of the file itself; the fresh version is
      pre-registered in the Stash of the State.
- Group: 11 - Refresh: same-actor re-emit.
    - Check: "Refresh: P3/U2 re-emit with the same actor + best-effort" - the
      fs/observed re-emit carries the target, the fresh observation, and the
      SAME actor; a throwing emit bus is contained.
- Group: Gate with an EMPTY tool list fails the actor gate (reads emit too).
    - Check: "Gate: empty mutation-tool list -> actor gate fails".
- Group: GuardedWrite forwards the abort signal.
    - Check: "GuardedWrite: abort signal forwarded" - the signal reaches
      ctx.fs.writeText.

## Fixtures

- The Harness fake ctx and the REAL factory instance, the st1 State of the
  source suite rebuilt verbatim with exclude ["x"] and the volatile
  mutationTools cell, a `proj` directory in the temp root, the Gate fixtures
  (`target`, `actor`, `present`, `base`) verbatim, `st3` with the `zwrite`
  tool, and `stE` with an empty tool list.
- The `writes` capture of the fake fs records every writeText call with its
  path, content, intent, signal, and fence, `emitted` records the re-emit, and
  the sandbox posture flips by mutating `ctx.fs.sandboxMode` exactly as the
  source suite does.

## Expected ledger strings (byte-exact)

None, because this folder is fs/emit-bound: it writes `{}` payloads through the capturing fs and
asserts no ledger lines.

The `pass` reason strings, "target", "actor", "kind", "idempotent", "basename", "excluded", and
"govern", are the contract, and the checks above assert them verbatim.

## Edge cases

- Each of the six failing gate reasons is asserted with its exact string.
- The govern marker skips REGARDLESS of its value, false included, because the
  direct path is the governance channel.
- The bare backend produces no fence, and the confined backend fences at the
  directory of the file itself.
- The Stash pre-registration and the abort-signal forwarding are both covered.

## Expected count

5 PASS.
