# Bind-And-Decide - the bind path and the decision tests

This folder covers the exact-candidate binding, the constraint law, the bounded ring with its byte-exact capped line, and the human decision paths (approve / deny / revoke) with their refused transitions and the read surface.

## Scenarios

- B1: a successful bind records a PENDING binding with the exact candidate (id `ap-1`, sequence 1, no commitment yet) and the byte-exact `bound ap-1 /repo/a.ts fingerprint fp-1` line in the logger AND the durable file.
- B2: a candidate without its identity is rejected (decision `rejected`, byte-exact `rejected  (candidate identity incomplete)`), and a candidate without constraints is rejected with `no constraints` (the constraint law).
- B3: with `requireConstraints=false` a constraint-less candidate binds normally.
- B4: the ring caps at `maxBindings`, and the oldest binding is evicted FIFO with the byte-exact `capped ap-1 (maxBindings 2)` line, so the evicted binding leaves the ring but stays in the by-id map and the eviction never happens silently.
- D1: the approve records the COMMITMENT (who accepted responsibility) and the byte-exact `decided ap-1 approved by human-1` line (logger and durable file).
- D2: a changed constraint set at approval time REJECTS the approval (`rejected ap-1 (constraints changed)`), because the constraints travel with the approval and modifying them is a new candidate, not an amendment.
- D3: the deny records the byte-exact `decided ap-1 denied by human-2` line, approving a denied binding is refused (`refused ap-1 (approve on denied)`), and revoking a pending binding is refused (`refused ap-2 (revoke on pending)`).
- D4: the revoke supersedes an approval with the byte-exact `revoked ap-1 by human-4` line.
- D5: a decision on an unknown id logs `unknown ap-99` and returns undefined.
- Q1: the read surface, where `bindings()` is newest first, `bindings(1)` slices the head, `statistics()` is the exact triple, and every bound line lands in the durable ledger file exactly once.

## Fixtures

The fixtures use the shared Harness (fake ctx with the real factory and the real built Target).

Every scenario starts from an empty ledger.

## Expected ledger strings (byte-exact, `approve: ` prefix)

`bound <id> <path> fingerprint <fp>`, `rejected  (candidate identity incomplete)`, `rejected <path> (no constraints)`, `capped <id> (maxBindings <n>)`, `decided <id> approved by <who>`, `rejected <id> (constraints changed)`, `decided <id> denied by <who>`, `refused <id> (approve on denied)`, `refused <id> (revoke on pending)`, `revoked <id> by <who>`, `unknown <id>`.

## Expected count

18 PASS.
