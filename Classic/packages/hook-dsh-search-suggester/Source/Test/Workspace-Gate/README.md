Workspace-Gate - the workspace gate and the existence filter

The `tools/post-execute` listener against the fake ctx and REAL temp trees: a call with no workspace root abstains before detect/score, a rooted tree with no history abstains `no-history`, a committed history emits only the companions that exist, an emptied history abstains `no-companions`, and a foreign call never poisons the next in-workspace call.

## Scenarios

- G1: the FOREIGN tree (no `.git`, no `package.json`, no session cwd): the downstream decision comes back UNCHANGED with no note, the logger and durable forms carry the byte-exact `abstained foreign-workspace  0.00` line, no `suggest` line appears, and the foreign call does not touch the ring (no call, no note, no pending window); a service getter that THROWS still abstains with no logger warning.
- G2: a ROOTED tree (its own `package.json`) with no session history abstains `abstained no-history  0.00`.
- G3: the same rooted tree with a history committed through the projection drive (the anchor plus one companion that exists and one that does not), where the History note is byte-exact and names ONLY the companion that exists, and the `suggest History 0.87 1 candidates` line counts only the survivor.
- G4: a committed history whose whole companion set is absent abstains `abstained no-companions History 0.87`, both forms, with no note.
- G5: a foreign abstention followed by an in-workspace call still emits the History note, because the gate is per call and not sticky.

## The gate

The root is the PACK-INDEPENDENT repo root (the nearest ancestor carrying `.git` or `package.json`, from the call path plus the session cwd), resolved with `Root` of `@playform/lib-dsh-pack`; a call outside any workspace has no history to mine and abstains.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target) plus `node:fs` temp trees under a dedicated temp parent.

The optional service is injected as `Run.Context.workingDirectory = { get }`.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained foreign-workspace  0.00` (empty family, the no-signal shape), `abstained no-history  0.00`, `abstained no-companions History 0.87`, `suggest History 0.87 1 candidates`.

## Expected count

8 PASS.
