# Apply-And-Fences - the version-fenced apply path

The apply path through the fake governed fs: the version fence, the honest
failure modes, and the journal for every outcome.

## Scenarios

- A1: the happy path - a fenced edit applies, the reported version is the
  post-edit sha256, the file content changed, and the `applied` journal
  record carries `version <sha>` byte-exactly.
- A2: the version fence - content changed since prepare is a `conflict`
  ("content changed since prepare"), never a silent overwrite; with
  `stopOnConflict` (default) the run stops at the first conflict and the
  second target is never resolved.
- A3: an absent target conflicts with "target absent".
- A4: an operation that no longer matches conflicts with
  "1 operation(s) no longer match"; a target with no operations conflicts
  with "no operations for target".
- A5: a fs edit failure lands as `recovery-required` with the error detail
  (FS_STALE_VERSION) and the file is untouched.
- A6: with `stopOnConflict: false` the run continues and reports each
  remaining target honestly (one conflict, one applied).
- A7: chained operations each receive the previous version (the version
  guard inside the fs's critical section); `maxTargets` bounds the run to
  the first targets.

## Fixtures

The shared Harness plus `FakeFs` (the capturing fs with a real
version-guarded editText over a content map) and `Sha` (the fence's own
sha256). No fake clock: the journal's `at` field is asserted as a number
only.

## Expected journal strings (byte-exact, one JSON line per event)

`applied` / `version <sha>`, `conflict` / `content changed since prepare`,
`conflict` / `target absent`,
`conflict` / `1 operation(s) no longer match`,
`conflict` / `no operations for target`,
`recovery-required` / `Error: FS_STALE_VERSION`.

## Expected count

11 PASS.
