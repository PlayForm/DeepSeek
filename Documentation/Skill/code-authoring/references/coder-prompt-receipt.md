# Coder Agents Receive This Discipline in Their Prompt

> Source: SKILL.md, Section 3 (Application), bullet 1.

## The Rule

Coder agents receive this discipline in their prompt: the skill's
rules, verbatim, plus the one-file-per-response protocol when relevant.

## Why the Prompt, Verbatim

1. **The subagent's context is the prompt.** It does not inherit this
   conversation, this skill's load state, or the orchestrator's memory.
   The prompt is the only guaranteed delivery channel (full philosophy:
   ./references/subagents-bound-to-discipline.md).

2. **Verbatim, not paraphrased.** Paraphrasing is lossy in exactly the
   wrong way: the paraphrase tends to keep the intent and drop the
   boundary cases (the `rm` carve-out, the read-side prohibition, the
   byte-scan gate). The rules were sharpened by incidents; each clause
   exists because something happened. A summary re-opens every settled
   question.

3. **Plus the one-file-per-response protocol when relevant.** For tasks
   where response discipline matters (large restructures, multi-file
   edits), the prompt adds the working protocol: one file per response
   so each write/edit is verifiable in isolation, no batched
   heredoc-style payloads. "When relevant" is the orchestrator's
   judgment; file-heavy coding tasks are the relevant case.

## What the Delivery Contains (the checklist)

- The tool discipline: content edits and reads through the tool API
  only; the forbidden terminal commands named; `rm` carve-out.
- Read-before-edit and the mismatch recovery protocol.
- The writing style rules that apply to the task (atomization, naming,
  defaults, bindings, guards, hierarchy).
- Byte-integrity rules when content is generated or transformed.
- Git checks-only when the work is in a repo.
- The verification expectations: the agent verifies its own changes and
  reports precisely what it changed.

## Failure Modes

- The prompt says "follow the code-authoring skill" and nothing more -
  the subagent may not load it; the delivery is the prompt itself.
- The prompt carries a shortened "summary of rules" - boundary cases
  fall out (see above).
- The orchestrator delivers the discipline but not the verification
  expectation - the subagent reports "done" without self-verification.

## Arbiters

- Delegation review: every coder prompt contains the discipline block
  (see the verbatim block in
  ./references/subagents-bound-to-discipline.md).
- Subagent log review: the behavior matches the delivered rules.
