# Gate-Write-Refresh

What this test verifies.

## Intent

The write path: `Gate` (the full g1 matrix that decides whether an fs/observed event may proceed),
`GuardedWrite` (the ONE shared write executor - the replaceIfVersion intent, the two sandbox
postures with the P4 fence, the fresh-version Stash pre-registration, and the abort-signal
forwarding), and `Refresh` (the same-actor fs/observed re-emit with best-effort containment).

They are their own folder because the gate's reason strings and the write's intent/fence shapes are
contracts that every module's update engine rides on, and the negative controls (the six failing
gate reasons, the bus-down refresh) are as important as the pass.

This is the source suite's sections 7, 10, and 11 plus the empty-tool-list and abort-signal edge
checks, moved verbatim.

## Scenario

- Group: 7 - Gate: the full g1 matrix.
    - Check: "Gate: full g1 matrix
      (target/govern/actor/kind/idempotent/basename/excluded/pass)" - null
      target -> reason "target"; missing/grep actor -> "actor"; absent kind ->
      "kind"; a Stash hit -> "idempotent"; a Cargo.toml basename -> "basename";
      an excluded segment -> "excluded"; the happy path -> `{pass: true,
      path}`; a non-mutation tool with the `mutationToolsField` option ->
      "actor"; the raw-write's wrapped actor with the `govern` marker (false,
      true, an array) -> the silent event-path skip with reason "govern"; a
      bare `raw-write` NAME alone keeps the actor check (the marker is the
      gate).
- Group: 10 - GuardedWrite: both sandbox postures + version guard.
    - Check: "GuardedWrite: replaceIfVersion intent + both P4 postures + Stash
      pre-registration" - the bare backend writes with the replaceIfVersion
      intent against "v1" and NO fence; the workspace-write backend fences
      rooted at the file's own directory; the fresh version is pre-registered
      in the State's Stash.
- Group: 11 - Refresh: same-actor re-emit.
    - Check: "Refresh: P3/U2 re-emit with the same actor + best-effort" - the
      fs/observed re-emit carries target, the fresh observation and the SAME
      actor; a throwing emit bus is contained.
- Group: Gate with an EMPTY tool list fails the actor gate (reads emit too).
    - Check: "Gate: empty mutation-tool list -> actor gate fails".
- Group: GuardedWrite forwards the abort signal.
    - Check: "GuardedWrite: abort signal forwarded" - the signal reaches
      ctx.fs.writeText.

## Fixtures

- The Harness fake ctx + the REAL factory instance; the source suite's st1 State rebuilt verbatim
  (exclude ["x"], the volatile mutationTools cell); a `proj` directory in the temp root; the Gate
  fixtures (`target`, `actor`, `present`, `base`) verbatim; `st3` with the `zwrite` tool and `stE`
  with an empty tool list.
- The `writes` capture from the fake fs records every writeText call (path, content, intent, signal,
  fence); `emitted` records the re-emit; the sandbox posture is flipped by mutating
  `ctx.fs.sandboxMode` exactly as the source suite does.

## Expected ledger strings (byte-exact)

None - this folder is fs/emit-bound; it writes `{}` payloads through the capturing fs and asserts no
ledger lines.

(The `pass` reason strings - "target", "actor", "kind", "idempotent", "basename", "excluded",
"govern" - are the contract, and they are asserted verbatim above.)

## Edge cases

- The six failing gate reasons, each asserted with its exact string.
- The govern marker skips REGARDLESS of its value (false included) - the direct path is the
  governance channel.
- The bare backend produces no fence, and the confined backend fences at the file's own directory.
- The Stash pre-registration and the abort-signal forwarding.

## Expected count

5 PASS.
