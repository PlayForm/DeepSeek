# Pack-Driven

The convention suggester as an EXPLICIT pack consumer: the own pack of a temporary repo still speaks
when the session history is empty, a workspace without a pack abstains `no-history`, the signature of
the pack gates the workspace, and the built-in pack is never a candidate source.

## Scenarios

- P1: a temporary repo with `.dsh/pack.yml` (signature `docs/STYLE.md`, one
  `convention/Layout` intent targeting `GUIDE.md` and carrying its own
  caveat) emits the note naming ONLY the pack's target and caveat; the
  ledger counts one candidate.
- P2: the SAME workspace without the pack has no layer and abstains
  `abstained no-history  0.00`, with no `suggest` line.
- P3: a pack whose signature marker is absent does not resolve; the call
  abstains `foreign-workspace`.
- P4: a monorepo source write with no history abstains `no-history` and never
  names the built-in pack's targets - the built-in pack is not a fallback.

## Fixtures

The shared Harness (fake ctx, the real factory, the real built Target) plus `node:fs` temporary
trees under the OS temp dir.

Every temp tree carries a `.git` directory so the pack-independent workspace root resolves; the pack
is a real `.dsh/pack.yml` read by the strict YAML-subset parser in `@playform/ets-lib-dsh-pack`.

## Expected ledger strings (byte-exact, `convention-suggester: ` prefix)

`suggest Layout 0.87 1 candidates call write`,
`abstained no-history  0.00`,
`abstained foreign-workspace  0.00`.

## Expected count

5 PASS.
