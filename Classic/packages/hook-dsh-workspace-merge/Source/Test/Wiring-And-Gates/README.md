# Wiring-And-Gates - the loader contract, wiring, and atomic gates tests

This folder covers the merge hook's loader contract, the service registration from apply, the live disabled posture (registered, silent, the volatile flip live), the fail-loud validation, the atomic gates in their frozen order, and the no-write preview.

## Scenarios

- G1: the default object carries exactly name/apply/Config/inject, and inject is `["pluginFactory", "fs"]`.
- G2: an enabled mount returns NOTHING from apply, exposes `ctx.__hookDshWorkspaceMergeState`, registers the `workspaceMerge` service (the preview/commit methods resolve on the context), declares the merge-storage effect, and the activation line is byte-exact: `merge: activated (domain=workspace_merge, mode=all-or-nothing)` (logger and durable file).
- G3: a disabled mount logs the honest `merge: disabled (enabled=false)` line and registers EVERY surface - the `workspace_merge` tool (captured through the fake tools host) and the merge-storage effect, beside the service; a disabled commit is refused with the `rejected` reply shape (`the merge is disabled (enabled=false)`, id `batch-disabled` for an unfenced batch) with ZERO new ledger lines, no sequence bump and no batch record, through both the tool execute and the service; and a volatile flip (`enabled` through the cosmokit cell plus the captured `loader/volatile-update` dispatch) acts on the very next call in both directions with no remount and no new activation line (the flip-on commit applies with its byte-exact lines when the policy is `auto`).
- G4: an empty domain fails loud with the module-prefixed error.
- G5: the atomic gates run in frozen order through the real service: an empty batch is rejected with the byte-exact `batch <id> rejected (empty batch)` line (logger and durable file), a missing version fence, a duplicate path, the size gate (`too many files (2 > 1)`), and the byte gate (`too many bytes (16 > 10)`) reject with their reasons, a version conflict rejects the whole batch in all-or-nothing mode with `conflict <path> (expected v1, observed v2)` and zero write calls, and every rejected attempt leaves a batch record (id, status, replies) and the honest statistics.
- G6: the no-write preview reports ready files with their bytes and the SHA-256 digest of the joined contents, reports a conflict per file, and makes zero write calls plus zero `batch` lines, so nothing is written, ever.

## Fixtures

The fixtures use the shared Harness (fake ctx with a FUNCTIONAL fs + the REAL built factory + the REAL built plugin apply).

## Expected ledger strings (byte-exact, `merge: ` prefix)

`activated (domain=workspace_merge, mode=all-or-nothing)`, `disabled (enabled=false)`, `batch <id> started (<n> files, <m> bytes)`, `batch <id> rejected (<reason>)`, `applied <path> version <v> (batch <id>)`.

## Expected count

18 PASS.
