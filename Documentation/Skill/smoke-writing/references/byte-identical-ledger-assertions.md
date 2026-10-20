# Byte-Identical Ledger Assertions (The Contract)

> Source: SKILL.md, section "The assertion contract", rules 1 and 2.
> Mandate: the canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The ledger strings are asserted BYTE-IDENTICAL. They are the contract
between the code and every consumer that reads its observable output.
Two physical forms exist, and both are asserted exactly:

1. the logger-prefixed forms: `<module>: ...` - what the code emits
   through the logger seam;
2. the ledger file's forms: `[ISO] message` - what gets written to the
   ledger file (an ISO timestamp, a space, then the message).

Every OTHER assertion in every suite stays byte-identical through
every refactor.

## Why: The Full Philosophy

1. **Why bytes, not semantics.** "Same meaning" is a human judgment;
   byte identity is machine-checkable and admits no negotiation. The
   family's ledgers are read by tooling (handoffs, governance,
   debugging), by people (session after session), and diffed against
   prior runs - a byte that changes is a change someone must account
   for, so the suites force that accounting to be explicit.
2. **The two forms are one contract.** The `<module>: ...` logger form
   is the live view; the `[ISO] message` form is the durable view.
   Both derive from the same message body, so both are asserted - a
   suite asserting only one could miss a formatting change in the
   other path.
3. **Identity-driven strings are the documented exception.** The
   `<module>: ` prefixes and the logFile defaults are derived from the
   module's IDENTITY. They change ONLY when the module's identity
   changes - BY DESIGN. The precedent that fixed this interpretation:
   the mdash -> normalize-dash change, where the dash normalization
   altered emitted bytes and the suites were updated as part of an
   identity-level decision, not quietly. Nothing else may touch them.
4. **The asymmetry is the point.** 99% of refactors must leave every
   asserted byte alone; the 1% identity changes are loud, deliberate,
   and recorded (the mdash precedent is cited every time). If an
   assertion breaks and the author cannot name which identity changed,
   the change is wrong - see
   ./references/failing-smoke-means-change-is-wrong.md.

## Examples

### Good

- A suite asserts the exact string `pinner: pin verified` (with the
  module prefix) and the ledger form `[2026-10-20T09:00:00Z] pin
  verified` - both byte-identical across runs.
- A rename/identity change updates the `<module>: ` prefix in the
  suites in the same commit, with the reason recorded - the
  identity-driven exception exercised openly.

### Bad

- Loosening an assertion to a `contains("pin")` because the exact
  string is "brittle" - brittleness IS the feature.
- Normalizing the received string before comparing (trimming,
  re-spacing, case-folding) to make a diff disappear.
- Updating a message string in the suites because the code's output
  changed, without an identity-level justification - that is
  weakening (see ./references/additive-coverage-rule.md).

## Exceptions

- The `<module>: ` prefixes and the logFile defaults: change only with
  the module's identity, BY DESIGN, with the mdash -> normalize-dash
  precedent as the template for how such a change is done (openly,
  deliberately, suites updated in the same decision).
- Nothing else. There is no "minor formatting" escape hatch.

## Failure Modes

- Assertion drift by accumulation: each "harmless" update to an
  expected string moves the contract; after a dozen, nothing is
  guaranteed anymore.
- Timestamp handling mistakes: asserting the full `[ISO] message`
  line with a hardcoded timestamp that happens to match today's run -
  passes now, breaks (or is hand-edited) later; the timestamp slot
  must be pinned deterministically by the fake ctx, not by luck.
- Prefix copy-paste: asserting with another module's `<module>: `
  prefix - passes whenever both modules emit similar text, and hides
  a mis-routed message.

## Arbiters

- The suites themselves: byte equality is the assertion mode; any
  fuzzy matcher on a ledger string is a review rejection.
- The diff discipline: a suite diff that loosens or rewrites an
  expected string must carry the identity-change justification, or it
  is declined (the failing-smoke law is the enforcement arm).
