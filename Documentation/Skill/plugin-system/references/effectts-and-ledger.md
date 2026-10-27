# The EffectTS Variant and the Ledger Law

## The variant

The EffectTS tree implements the same contract behind Effect 4.0.5:

- a Cordis shell with the same `name`, `apply`, `Config`, and `inject` surface;
- Effect services and layers for the behavior;
- tracing that defaults to a no-op.

The two trees carry different npm names (`@scope/hook-dsh-*` versus `@scope/ets-hook-dsh-*`), so
they never collide in a graph.

They never mix in one dependency graph: the EffectTS `Update` returns Effect envelopes, not the
Classic dispatch envelope.

## The ledger law

Every activation line, refusal line, chain-pass line, and journal record is byte-identical:

- across the two trees;
- across refactors within a tree;
- across the smoke and the live profile.

Rename mechanics, never strings.

## The one exception

An identity change by design - a package rename that is itself the deliverable - changes that
module's own strings: the `<module>: ` prefixes and the default `logFile`.

That is a rename, recorded as a rename, and the smoke's identity assertions change with it.

It is the only sanctioned reason for a ledger string to differ.

## The tracing rule

In the EffectTS tree, running a suite with `FACTORY_SMOKE_TRACING=1` must produce byte-identical
stdout and ledgers.

The spans may not alter the strings, the ordering, or the timing the assertions depend on.

The rerun is the additive coverage for the tracing path.

## How the law is enforced

The smoke suites assert the strings byte-identically.

The Classic and EffectTS suites are the same assertion sets; the EffectTS suites add coverage
(factory +7, governor +3; core at parity at 14) on the same contract.

The smoke discipline itself lives in `smoke-writing`.

## Failure modes

- **A "wording improvement" in shared machinery**: every module's ledger changes at once.
- **A partial rename**: old and new identities interleave in one ledger.
- **Tracing that changes output**: the tracing rerun diffs and the parity claim breaks.
- **Mixing the trees**: an envelope mismatch at runtime.
