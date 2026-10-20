# The Tracing Hygiene Rule (FACTORY_SMOKE_TRACING=1)

> Source: SKILL.md, section "The parity discipline", rule 3. Mandate:
> the canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The tracing-on mode - `FACTORY_SMOKE_TRACING=1` - must produce output
that is BYTE-IDENTICAL to tracing-off, on both channels:

1. the STDOUT of the suite runs, and
2. the LEDGERS the runs write.

The spans (the tracing instrumentation) must never alter the strings,
their ORDERING, or their TIMING in any observable artifact. This is
the hygiene rule.

## Why: The Full Philosophy

1. **Why tracing must be invisible.** Tracing exists to debug and
   observe the runs; the ledger strings are the contract (see
   ./references/byte-identical-ledger-assertions.md). If turning
   tracing on changed the strings, then (a) the contract would fork
   into a traced and an untraced version, (b) any bug found while
   tracing would be a bug in a modified world, and (c) the suites
   could no longer certify the code that actually runs in LIVE
   (untraced). The instrumentation must be a window, not a lens.
2. **Why stdout AND ledgers.** The two channels are produced by
   different paths (the logger seam's emission vs the ledger file's
   write). Tracing could corrupt one and not the other - e.g. inject a
   span line into stdout while leaving the ledger clean, or shift a
   write order in the ledger only. Asserting both channels closes the
   side door.
3. **Why the three properties - strings, ordering, timing.**
   - Strings: the byte-identity contract, directly.
   - Ordering: spans that wrap steps can reorder emissions (a span's
     end-line before the next step's line); order is part of the
     ledger's meaning.
   - Timing: spans add overhead that can flip a timestamp slot or an
     elapsed ordering; if a suite's assertion depends on timing, a
     traced run can fail or - worse - silently record different bytes.
4. **How it is verified in practice.** The suites run twice in the
   hygiene check: once with `FACTORY_SMOKE_TRACING=1`, once without;
   the stdout and the ledgers are compared byte-for-byte. Any
   difference is a tracing defect in the code, fixed in the code -
   never papered over in the assertions.

## Examples

### Good

- A new span wraps a write step; the hygiene double-run shows both
  stdouts and both ledgers identical; the span ships.
- A tracing bug injects a span line into stdout during development;
  the hygiene check catches the diff; the span emission is moved out
  of the contract path.

### Bad

- Making the suite's expectations "tracing-aware" (a conditional
  expected string) - the contract now depends on an environment flag.
- Filtering span lines out before comparing "so the comparison is
  fair" - the comparison must be of the full artifacts.
- Ordering the span lines into the ledger because "they are useful" -
  useful output that changes the contract is LIVE-only, not suite
  output.

## Exceptions

- Tracing output may go to a channel the contract does not read (a
  separate trace sink), provided the two contracted channels - stdout
  and ledgers - remain byte-identical. The exception defines the
  design pressure: instrumenting means routing observation OUT of the
  contracted paths.

## Failure Modes

- The flag-dependent suite: assertions that pass untraced and fail
  (or pass differently) traced - the exact fork the rule forbids.
- Timing leakage: a suite asserting an elapsed-derived value that
  tracing overhead changes - the run flaps only under tracing.
- Partial hygiene: comparing stdout but not the ledgers (or vice
  versa) - half the artifact surface rots while the check stays green.

## Arbiters

- The double-run comparison: full stdout and full ledgers, traced vs
  untraced, byte-for-byte; the comparison is part of the family's
  routine suite procedure whenever tracing-related code changes.
- The suites' own byte-identity (see
  ./references/byte-identical-ledger-assertions.md): any span effect
  on contracted bytes fails a suite immediately.
