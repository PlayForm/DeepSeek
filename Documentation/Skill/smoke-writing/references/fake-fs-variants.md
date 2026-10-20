# The Fake fs Variants (Capturing fs vs Real-token fs)

> Source: SKILL.md, section "The harness pattern", rule 2. Mandate:
> the canonical skill-structure conversion of 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The fake fs is the one part of the fake ctx that VARIES per suite, and
it varies in two sanctioned shapes:

1. **The capturing fs** - the default: the fs seam is a recorder whose
   arrays (`reads`, `writes`, `intents`, `observations`) collect every
   fs call the code makes; assertions read those arrays.
2. **The real-token fs** - the pinner's suite: the fs is exercised
   with ACTUAL tokens so the version guards are exercised against real
   file content, not a recorded fiction.

Every suite picks one of the two; a third shape needs a documented
reason before it is added.

## Why: The Full Philosophy

1. **The fs is the boundary with real side effects**, so it is the
   seam where the fake/real decision actually matters. Recording calls
   (capturing fs) proves the code ISSUES the right calls; executing
   them with real tokens (real-token fs) proves the code CORRECTLY
   REACTS to what the filesystem returns.
2. **The two variants test different sides of the contract.** The
   capturing fs answers "what does the code request?" (the writes, the
   intents, the observations). The real-token fs answers "what does the
   code do when the file content disagrees with the expectation?" -
   which is what a version guard must survive in LIVE.
3. **Why the pinner is special.** The pinner's whole job is version
   guarding - deciding from real file bytes whether a pin is current.
   A capturing fs would let the suite assert "the pinner issued a
   read", but never "the pinner correctly rejected a stale pin". Only
   real tokens exercise that decision. Hence the exception is pinned
   to that suite, not offered as a general alternative.
4. **Uniformity elsewhere.** Every non-pinner suite uses the capturing
   fs so their assertions stay deterministic and byte-identical: the
   arrays are in-memory, order-stable, and free of environment noise.

## Examples

### Good

- A governor suite asserts `fs.writes` contains exactly the expected
  write intents, in order, byte-identical - capturing fs.
- The pinner's suite writes actual files with actual version tokens
  through its real-token fs, then asserts the guard accepts the
  matching token and rejects the stale one.

### Bad

- A non-pinner suite swaps in a real-token fs "for realism" - its
  assertions become environment-dependent and its byte-identical
  contract collapses.
- The pinner's suite downgrades to the capturing fs to save setup -
  the version guards go unexercised and the vacuously-green risk
  returns.
- Assertions that read a capturing-fs array by index without asserting
  the length first - a shorter array silently shifts every index.

## Exceptions

- The real-token fs is documented for the pinner's suite only. Any new
  suite that wants real tokens must argue why the capturing fs cannot
  represent the behavior, and the argument becomes part of this file.

## Failure Modes

- Variant mixing inside one suite: half the assertions assume
  recording, half assume execution; the suite passes only when the
  two cancel out.
- Capturing arrays never asserted (the suite writes through the fs
  seam and never checks `writes`/`intents`) - recording that nothing
  reads is the same as not recording.
- Real-token fs with a leaked temp state between runs - a suite that
  passes on a clean tree and fails (or passes wrongly) on a dirty one.

## Arbiters

- Review: every suite states in its harness setup which fs variant it
  uses and why; the pinner is the only sanctioned real-token suite.
- The byte-identical contract (see
  ./references/byte-identical-ledger-assertions.md) is the passive
  arbiter: a suite that drifts because its fs was swapped produces
  non-deterministic output and fails the identity.
