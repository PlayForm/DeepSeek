# Guardian Mode A: Surface the Error (Deny With a Structured Reason)

> Source: SKILL.md, Section 1b, part 2. Future note - implementation deferred (user-mandated 2026-10-04).

## The Design

When the guardian detects a terminal file-edit command, it DENIES the
call with a structured reason: the guardian's own ledger entry plus the
pre-execute decision. The agent reads the denial, infers that the
pattern is forbidden, and rephrases the work through the tool API.

The constraint becomes SELF-TEACHING from the plugin's own feedback,
independent of any skill text.

## Why Denial With a Reason Beats a Silent Failure

1. **A bare failure teaches nothing.** If the command simply fails with
   "permission denied", the model concludes the path is wrong, not the
   method - and retries variants of the same violation. The structured
   reason is the difference between an obstacle and a lesson.

2. **The reason carries the alternative.** The denial's text should say
   what TO do, not only what not to do: "terminal file edits are
   forbidden; use the write/edit tool API" (with the skill's rule
   referenced). The model then has both the prohibition and the path in
   one message.

3. **The ledger makes enforcement auditable.** Every denial is recorded
   with: the command, the matched pattern family, the session/agent, and
   the decision. This gives the discipline its first mechanical arbiter:
   the guardian's ledger shows exactly when and where the model tried
   to bypass the tools - data no session-log review can produce as
   reliably.

4. **Contextual learning is stronger than upfront prose.** The skill
   text must compete for the model's attention across a whole session.
   The denial arrives at the moment of temptation, attached to the
   exact command the model wanted to run. Feedback at the point of
   failure generalizes better than instruction at the point of load.

## The Denial Contract (what the structured reason contains)

```
decision: deny
detector: <pattern family, e.g. "sed -i on source file">
command:  <the offending command string>
reason:   file content changes must go through the write/edit tool
          API (code-authoring skill, Section 1); terminal edits are
          invisible to the plugin system's fs/observed chain
retry:    re-express the change as an edit tool call (read the file
          first; copy the exact bytes into old_string)
```

## What Mode A Does Not Do

- It does not rewrite or execute anything on the agent's behalf (that
  is Mode B - see
  ./references/guardian-mode-b-silent-rewrite.md).
- It does not deny deletions (`rm` stays allowed), builds, tests, or
  reads of process output.
- It does not depend on the model having loaded any skill: the reason
  text is self-contained.

## Failure Modes

- The model argues with the denial or retries trivially-disguised
  variants - each retry is another logged denial, which is the desired
  visibility, and the pattern families should cover the common
  disguises.
- The reason text is too vague ("not allowed") - the retry guidance is
  what makes the denial productive; vague denials produce frustrated
  loops instead of rephrasing.
