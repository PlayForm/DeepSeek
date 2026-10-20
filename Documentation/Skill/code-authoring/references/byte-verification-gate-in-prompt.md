# The Verification Gate Is Part of the Prompt

> Source: SKILL.md, Section 1c (Byte-integrity), rule 5. Post-incident 2026-10-07, user-mandated.

## The Rule

Every bulk-transformation agent spec must mandate the byte-level scan
as an arbiter, in addition to the content/rendering checks. The gate is
part of the PROMPT - written into the delegation itself, not left to
the agent's judgment or to this skill being loaded.

## Why the Gate Lives in the Prompt

1. **The same logic as the discipline binding.** Subagents do not
   inherit skills automatically (see
   ./references/subagents-bound-to-discipline.md). A verification
   requirement that lives only in a skill file may never reach the
   agent doing the bulk pass. The prompt is the guaranteed channel.

2. **Verification is a completion condition, not a suggestion.** An
   agent spec defines "done". If the byte scan is not part of "done",
   the agent's definition of done ends at "the script ran" - the exact
   gap that produced the 25 corrupted files of 2026-10-07. The spec
   must define done as: transformed AND scanned clean AND spot-checked.

3. **Arbiter status changes behavior.** "Please also check the files"
   is advisory. "The byte scan is the arbiter: the task is not
   complete until it passes" is a gate. Agents respond differently to
   gates because a gate has a failure state the agent must resolve
   before reporting.

## What the Prompt Clause Contains

```
VERIFICATION GATE (mandatory before reporting done):
- After the bulk transformation, run a byte-level scan of EVERY file
  you touched: zero 0x00 bytes, zero stray control characters (outside
  \t \n \r), valid UTF-8. A scripted bytes-read (e.g. Python) is the
  sanctioned tool for this scan.
- The scan must pass with zero findings; on any finding, diagnose,
  fix via the write/edit tool API, re-scan.
- Additionally spot-check transformed regions with the read tool to
  confirm the segments read back as the intended text.
- Report: files touched, scan result, spot-check result.
```

## The Two Layers of Verification and Why Both Are Required

| Layer | Checks | Catches |
|-------|--------|---------|
| Byte-level scan | the bytes are clean text | NUL bytes, control bytes, invalid UTF-8, truncation |
| Content/rendering checks | the text is the intended text | wrong replacements, missing segments, broken links, semantic drift |

Neither substitutes for the other: the scan can pass on a file whose
content was wrongly transformed, and a content review can miss binary
bytes. The incident failed BOTH layers (nobody scanned bytes; nobody
read the corrupted regions); the mandate requires both going forward.

## Failure Modes

- The spec says "verify your work" without naming the scan - the agent
  verifies what is convenient.
- The scan is in the prompt but the agent reports before running it -
  the reporting discipline (report the scan result) makes the omission
  visible.
- The scan runs but findings are "fixed" by filtering output rather
  than fixing the source transformation - the fix must go through the
  tool API against the real content, and the underlying builder bug
  must be corrected, not masked.

## Arbiters

- Delegation review: every bulk-transformation prompt contains the
  verification-gate clause.
- Subagent report review: the report names the scan and its result; a
  report lacking the scan result is incomplete and sent back.
