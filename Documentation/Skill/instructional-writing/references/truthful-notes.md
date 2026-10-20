# Truthful Instructional Notes: Claims Must Match Bytes

> Source: SKILL.md Section 2, the second bullet, expanded to full philosophy.

## The Rule

When a fixture file makes an instructional claim about its own contents, the
claim must be true at the byte level. The pattern is the self-describing note:
"this file has an em dash" - and the file actually has one, as a literal
U+2014 in its bytes.

The corresponding hard rule: the deliberate characters are NEVER replaced with
ASCII stand-ins, and this applies to the quoted instructional notes themselves.
A note that names a character must contain that character, not a lookalike.

## Why (the full rationale)

- These files teach by example. A reader who sees the sentence "this file has
  an em dash" is supposed to check the bytes and find the em dash. If the
  sentence is there but the character was substituted, the file teaches the
  wrong lesson: that the discipline is about wording, not bytes.
- The self-describing pattern is what makes the fixtures self-verifying: prose
  claim + byte reality can be checked mechanically (the verification
  byte-checks look for the codepoint the claim names). A false claim breaks
  that contract and can make a check vacuous - the check confirms a character
  the file no longer really features.
- The prohibition on stand-ins extends to the notes because the notes are the
  most tempting place to substitute: writing about a character feels like the
  one place a hyphen "would be fine". It is not. The note is part of the
  fixture's demonstration.

## Good vs bad

- GOOD: a fixture whose body says it contains a curly double quote pair, and
  whose bytes contain literal U+201C and U+201D, with the byte-checks passing.
- BAD: the same sentence with a straight quote pair in the bytes. The prose
  claims one thing; the bytes say another.
- BAD: hedging the claim so it becomes unfalsifiable ("this file may contain
  an em dash"). Claims should be definite, because definite claims are what
  the byte-checks can enforce.

## Writing guidance

- Phrase claims in the same register as the file's other content: short,
  definite, byte-verifiable. "This file has an em dash" is the model.
- One claim per character or character-group keeps the mapping between prose
  and bytes one-to-one, which is what makes a failed byte-check point at a
  specific sentence.
- When a file demonstrates the normalized OUTPUT instead (a raw-write call
  with the normalize selection applied), its notes must say THAT - the
  truthful note describes what the bytes actually are, in both directions.

## Exceptions

- None. Truthfulness is the one rule with no tool-level exception: whatever
  the write path was, the prose describes the actual bytes.

## Failure modes

- The note was written before the content changed (for example, a re-write
  that switched the fixture to a normalized demonstration), and the old claim
  survived into the new bytes.
- A copy of the fixture was made and edited without re-reading it, leaving a
  stale claim about a character that is no longer present.
- The claim was true of the composed content but the write path normalized it
  (a plain write), so the claim became false at landing time.

## Arbiters

- The byte-checks enforce the specific claim-to-byte mappings.
- The smoke suites read the fixtures as documents; a reviewer (human or agent)
  cross-checking claim against bytes is the qualitative arbiter.
