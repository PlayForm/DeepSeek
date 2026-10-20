# The Session Records (~/.dsh/sessions/)

> Source: SKILL.md, section 4, rule 1. Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

~/.dsh/sessions/ holds the SESSION RECORDS: every subagent's transcript as
zstd-compressed JSONL, one file per session named session.v4.jsonl.zstd.
Decompress with the zstd CLI, then read the JSONL lines (one JSON object per
line).

The directory keying: directories are keyed by the working directory, with
the path separators flattened into dashes - the dashed directory for
/Volumes/.../DeepSeek holds this project's sessions.

The line types:

- session - the session header
- subagent/descriptor - the subagent descriptor
- sandbox/mode - the sandbox mode in force
- approval/policy - the approval policy in force
- subagent/model-selection-policy - the model-selection policy
- turn/start - the turn boundary (open)
- step/start - the step boundary
- user/message - the user's message
- assistant/message - the assistant's message, WITH the per-message usage:
  inputTokens, outputTokens, totalTokens
- tool/call - a tool invocation
- tool/result - a tool result
- turn/end - the turn boundary (close)

The usage tally: computed by summing the usage fields over the
assistant/message lines. totalTokens is the PER-CALL CONTEXT TOTAL - the
context-processing measure, not the sum of novel tokens.

## Why: The Full Philosophy

1. **The transcript is the ground truth of what happened.** Memory,
   summaries, and reports are compressions; the session file is the
   record. When a question is "what actually occurred in that session",
   the answer is in the JSONL, not in anyone's recollection.
2. **Subagent usage is computable; main-session usage is not here.** The
   per-message usage is recorded in the SUBAGENT session files only; the
   main session's usage is displayed app-side (see
   ./references/honest-limits.md). So a token report over
   ~/.dsh/sessions/ is a report about subagents - saying otherwise is a
   factual error, not a simplification.
3. **totalTokens is a context measure, not a burn measure.** Each call's
   totalTokens reflects the whole context that call processed. Summing it
   across messages yields total context processed (the right denominator
   for cost estimates of context-heavy work), but calling it "tokens
   generated" double counts every re-processed context. inputTokens and
   outputTokens are the finer split when the distinction matters.
4. **zstd is part of the format, not an obstacle.** The compression keeps
   the transcript store small; the zstd CLI decompresses on demand. Read
   the decompressed text with the file tools, never the raw .zstd bytes.
5. **The line vocabulary is stable and typed.** Session framing (session,
   subagent/descriptor), runtime policy (sandbox/mode, approval/policy,
   subagent/model-selection-policy), turn and step boundaries, message
   traffic (user/message, assistant/message), and tool traffic (tool/call,
   tool/result) - a reader can filter to exactly the type it needs.

## Examples

### Good

- Token report per subagent: zstd -d session.v4.jsonl.zstd, then sum the
  usage fields over the assistant/message lines.
- Timeline reconstruction: filter the turn/start, step/start, and
  turn/end lines.
- Sandbox question: read the sandbox/mode and approval/policy lines - the
  policy in force at record time is in the file, not in memory.

### Bad

- Reading the .zstd bytes as text - compressed garbage, not a transcript.
- Summing totalTokens across messages and reporting it as "tokens
  consumed/generated" - it double counts every re-processed context.
- Including the main session in a tally built from these files - the main
  session's usage is not recorded here.

## Exceptions

- The main session's own usage is the standing exception (see
  ./references/honest-limits.md): these files cover subagent sessions;
  the main session's usage is displayed app-side only.
- These are transcripts, not live state: the live conversations of other
  sessions are separate even though their files exist on disk.

## Failure Modes

- Reading compressed bytes directly: the reader sees binary noise and may
  conclude the format is unreadable.
- Misreporting totalTokens as generation volume: token accounting that
  inflates output by orders of magnitude.
- Assuming the directory layout is flat or by date: it is keyed by the
  working directory (dashes for path separators); the wrong directory
  yields the wrong project's sessions.

## Arbiters

- The session file itself is the arbiter of what happened in a session:
  every claim about a past session traces to its JSONL lines.
- The assistant/message usage fields are the arbiter of per-message token
  numbers; the sum over them is the arbiter of the subagent tally.
