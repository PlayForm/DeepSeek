# The Reasoning Record

A record sits beside every artifact: why it exists, what the producer reasoned, and what the
artifact cannot do.

## Purpose

A document is the result.

The reasoning that produced it is a second artifact, and it is not allowed to die in a conversation.

This reference defines that second artifact, the pairing that produces it, and the three rules that
keep it honest.

## The rule

1. **The record.**

    Every artifact of consequence gets a record.

    The record lives in a mirror tree, `Detail/` followed by the path of the artifact with the
    extension dropped.

    `Demo/Board/Render.py` mirrors to `Detail/Demo/Board/Render/`.

2. **The mirror.**

    The mirror holds deep documents, not a summary: `Reasoning.md` for why, `Limits.md` for what it
    cannot do, and `Architecture.md` for how.

    A mirror folder may hold any number, and a missing mirror is a gap and never a silent pass.

3. **The producer.**

    The producer never writes the record.

    See `worker-strains`, rule 8.

    The producer is result-oriented by design, so asking it to document its own reasoning turns the
    record into a summary of a summary.

4. **The record is not a review.**

    The MINUTEMAN does not fix, reopen, or revert the artifact.

    It records findings as `F-nn` with evidence and severity, a finding becomes a work item, and the
    artifact stays as the producer left it.

5. **The mask.**

    The record masks what the artifact may legitimately contain.

    An account id, a hostname, or a path that identifies a person becomes `<account-id>` plus a
    statement that it was masked.

    A reasoning record is not the place to copy an identifier.

## Provenance

Every claim in the record names its source:

1. **The decision.**

    A trace sequence number, for what the producer decided.

2. **The artifact.**

    A file and line, for what the artifact does.

3. **The inference.**

    The word `inference`, for what the MINUTEMAN reasoned past the evidence.

A claim with no source is not allowed.

A record reconstructed from artifacts alone says so at the top and never presents itself as a raw
trace.

Values that the MINUTEMAN re-ran itself are marked as re-run, with the date and the machine.

## Coverage

The mirror root prints `covered N of M`, where M is the number of artifacts in scope.

Partial coverage prints as partial.

This is the whole difference between a record and a claim of completeness: a boolean reviewer
reports "done" because it has no way to say "three of ten".

## Two heuristics the record exists to catch

1. **The symmetry.**

    Two documents written to look alike will be wrong alike.

    On 21 October 2026 a local/remote pair of manuals were made symmetric and inherited the same
    unverified values in the same rows.

    The symmetry carried the error instead of exposing it.

    Verify each variant independently, then align the shape.

2. **The status word.**

    A status word is only as strong as its column header.

    A table headed "Where it is settled" quietly redefined `green` from "verified" to "confirmable",
    and four rows rested on vendor documentation while they claimed verification.

    Name the column after the semantics, and keep the status vocabulary owned by one skill.

## The two incidents

1. **The false defect.**

    A parent reported 27 headings in a file, and the counted lines were shell comments inside fenced
    code blocks.

    The lane complied with the bad report and edited 26 lines for nothing.

    The lesson is two-sided: reproduce a defect with the owning checker before you report it, and
    reproduce it before you comply with it.

2. **The phantom remediation.**

    A lane reported that its workflow used a working command, and the command appeared nowhere in
    the artifact.

    The lesson: a report is a claim, not evidence, so the reviewer greps.

## When not to use

1. **The throwaway.**

    A throwaway scratch file, a probe, or a one-line fix with no decision in it.

    The record exists to preserve judgment, not keystrokes.

2. **The self-documenting artifact.**

    An artifact whose own document already carries the reasoning and the limits.

    Say so in the mirror root instead of writing a second copy.

## Verification

1. **The coverage line.**

    The mirror root prints `covered N of M`.

2. **The source.**

    Every claim carries a sequence number, a file and line, or `inference`.

3. **The mask.**

    No file under the mirror contains an unmasked identifier.

4. **The mtimes.**

    The artifacts carry mtimes older than the record, which is proof that the record did not modify
    what it audited.

5. **The arbiter.**

    The documents of the record pass the document arbiter.
