# Pack-Driven

The test suggester as an EXPLICIT PACK CONSUMER: the pack of a temporary repo still speaks when the session history is empty, a workspace without a pack abstains `no-history`, the workspace root gates the pack rather than its declared signature, and the built-in pack never drives this monorepo.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (signature `docs/STYLE.md`, one `test/Suite` family targeting `SUITE.md` and carrying its own caveat) emits the note naming ONLY the target and caveat of the pack, and the ledger counts one candidate.
- P2: the SAME workspace without the pack has no pack layer and no history, so the call abstains `no-history  0.00`, with no `suggest` line.
- P3: a pack whose signature marker is absent still resolves, because the root gates the pack and not the signature; its one companion does not exist in the tree, so the call abstains `no-companions Suite 0.87`.
- P4: the monorepo path with no history abstains `no-history` instead of naming the built-in pack's companions, because `Resolve(root, { builtin: false })` never falls back to the literal pack.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary trees under the OS temp dir.

The pack is a real `.dsh/pack.yml` read by the strict YAML-subset parser in `@playform/ets-lib-dsh-pack`.

Every temp tree carries a `package.json` marker, because the workspace root is pack-independent.

## Expected ledger strings (byte-exact, `test-suggester: ` prefix)

`suggest Suite 0.87 1 candidates call read`, `abstained no-companions Suite 0.87`, `abstained no-history  0.00`.

## Expected count

5 PASS.
