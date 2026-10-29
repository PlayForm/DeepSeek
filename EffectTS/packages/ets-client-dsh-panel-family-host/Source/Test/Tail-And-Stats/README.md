# Tail-And-Stats - the endpoint tests

The suite covers the tail and stats endpoints against real files in a disposable
log root.

## Scenarios

- T1: the tail slicing - the last N lines, a larger request that returns every
  line, the `maxLines` cap that bounds the request, and the read-only
  guarantee (the log bytes and the directory listing stay unchanged after the
  calls).
- T2: the tail validation - a namespace outside the family module-name pattern
  (path separators, dots, uppercase) is rejected with the byte-exact message
  and never sanitized; non-positive and non-integer line counts are rejected; a
  missing log is `not-found` with the byte-exact
  `log "<namespace>.log" is unreadable: ` prefix.
- S1: the ccr stats - the exact summary `{ok, ccrLog, bytes, lines}` for a
  6-byte three-line fixture, the bytes untouched after the call, and a missing
  ccr log is `not-found` with the byte-exact `ccr log is unreadable: ` prefix.

## Fixtures

The shared Harness holds the real-file fixtures (`Put`, `Bytes`, `Names`) in a
disposable temp log root.

## Expected ledger strings (byte-exact)

`host: activated (enabled=true)` (from the enabled mounts).

## Expected count

10 PASS.
