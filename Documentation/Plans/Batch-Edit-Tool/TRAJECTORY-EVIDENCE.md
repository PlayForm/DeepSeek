---
title: The Batch Edit Tool - the trajectory evidence (the measured cost of one-edit-at-a-time)
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-22
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md
index: Documentation/INDEX.md
statuses:
	- name: the measured cost of one-edit-at-a-time (34 sessions, 811 mutations)
		state: resolved
		evidence: this document - the population, the finding, and the savings arithmetic
	- name: the three mutation shapes and their batch fit
		state: resolved
		evidence: this document section 6 - the wide sweep, the narrow rewrite, the interleaved edit-verify
	- name: the refusal rule for the interleaved shape
		state: open
		evidence: this document only - the interleaved-read count vs the explicit dependency marker
	- name: the three measurement questions (the cache reads, the refusal rule, the provider-level cost)
		state: open
		evidence: Documentation/Plans/Batch-Edit-Tool/RESIDUALS.md item 8 - tracked with the plan's residuals
	- name: the before/after measurement of a batch tool
		state: open
		evidence: no session in the measured population used a batch tool - the savings are arithmetic on observed costs
---

# THE BATCH EDIT TOOL - THE TRAJECTORY EVIDENCE (THE MEASURED COST OF ONE-EDIT-AT-A-TIME)

> Evidence document for the Batch Edit Tool research. The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. The companion hub:
> Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md. This document is the SINGLE OWNER of the
> measured figures - every other document cites this path and does not restate them. The population
> is anonymised on purpose: one workspace, one day, no names, no paths, no business context. Quote
> the numbers, not an origin.

---

## 1. The method

Every session log for one workspace on one day was decompressed and parsed. For each session: the
model and reasoning effort from its descriptor, the token usage summed from every assistant step,
the tool-call mix, and every file mutation in order (from the `edit`/`write` call arguments). A
"mutation" is one tool call that changes a file. A "run" is consecutive mutations to the same path
with no other path in between.

Token figures are the `inputTokens`, `outputTokens` and `cacheReadTokens` recorded per assistant
step and summed per session. `inputTokens` excludes the cached prefix; `cacheReadTokens` is reported
separately because prompt caching already absorbs most of the repeated prefix.

## 2. The population

| Measure                       | Value      |
| ----------------------------- | ---------- |
| Sessions                      | 34         |
| File mutations                | 811        |
| Input tokens                  | 27,853,959 |
| Output tokens                 | 2,389,086  |
| **Input tokens per mutation** | **34,345** |

The population includes one lead session, four planning/review lanes that never wrote, and 29
implementation lanes across sweeps, audits, documentation and crawls.

## 3. The finding: cost tracks round trips, not edits

Two lanes show it cleanly:

| Lane shape                                  | Mutations | Files touched | Longest run | Input tokens | Tokens per mutation |
| ------------------------------------------- | --------- | ------------- | ----------- | ------------ | ------------------- |
| Wide sweep (one edit per file, many files)  | 77        | 67            | 2           | 338,855      | **4,400**           |
| Narrow rewrite (repeated edits to one file) | 49        | 10            | 17          | 367,293      | **7,496**           |
| Narrow rewrite, worst observed              | 48        | 10            | 10          | 603,004      | **12,563**          |
| Whole-session total, all lanes              | 811       | -             | -           | 27,853,959   | **34,345**          |

The wide sweep is the _cheapest per mutation_ because its context stayed small. The narrow rewrites
are 2-3x more expensive per mutation, and the total figure is dominated by long sessions where the
conversation had already grown.

A 17-mutation run on one file means 17 step boundaries, each re-sending the whole conversation. The
edit payloads were small; the context was not.

## 4. Read-before-edit doubles the count

Lanes obeying read-before-edit spend two calls per mutation. Observed ratios were near 1:1 in the
sweep lanes (77 reads to 77 mutations; 49 to 49), and the read is a full tool result that enters the
context permanently.

So one logical file change currently costs: one read result + one edit call

- one step boundary + the re-send of everything before it.

## 5. What a batch tool would remove

Not the reads, and not the edits - **the step boundaries**. If N edits to N files arrive in one
call, the agent pays one boundary instead of N, and the conversation grows by one summary of the
batch instead of N file bodies.

The arithmetic that follows, using the measured 34,345 tokens per mutation as an upper bound and
4,400 as the wide-sweep floor:

| Batch size | Boundaries saved | Input tokens saved (floor) | Input tokens saved (bound) |
| ---------- | ---------------- | -------------------------- | -------------------------- |
| 5          | 4                | ~17,600                    | ~137,000                   |
| 10         | 9                | ~39,600                    | ~309,000                   |
| 20         | 19               | ~83,600                    | ~652,000                   |

Those are the savings for a single batch. The 811 mutations in this population were performed one at
a time.

## 6. The shape of the demand (and where the tool must refuse)

The mutation runs cluster into three shapes, and only two of them want a batch tool:

| Shape                                                   | Observed                           | Batch tool fit                                                |
| ------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------- |
| One edit across many files (sweep, rename, frontmatter) | 67 files in 77 mutations           | **Strong** - same operation, N targets                        |
| Many edits to one file (rewrite, repair, refactor)      | runs of 10-17                      | **Strong** - the file body is read once and rewritten once    |
| One edit, then verification, then another edit          | interleaved with `bash` and `read` | **Weak** - the agent must see the result before the next edit |

The third shape is where a batch tool must refuse rather than guess: when the next edit depends on
the previous result, batching removes the feedback the agent needs.

The mapping onto the tool's forms is the forms document's business
(Documentation/Plans/Batch-Edit-Tool/FORMS-AND-GOVERNANCE-LAYERS.md): the first two shapes are the
reason the one-shot search, the staged pipeline and the atomic batch exist; the third shape is the
reason the single-file tools stay the fallback.

## 7. The caveats

- One workspace, one day, 34 sessions. The per-mutation figure is a snapshot of this workload, not a
  constant.
- `inputTokens` excludes cache reads; a tool that reduces step count also reduces cache reads, so
  the true saving is larger than the table above.
- No session in this population used a batch edit tool, so the savings are arithmetic on observed
  costs, not a measured before/after.
- Mutations were counted from tool-call arguments; a call that failed still counts, so the figure is
  an upper bound on successful edits.

## 8. The open questions

The note's three questions, folded into the plan's tracked residuals
(Documentation/Plans/Batch-Edit-Tool/RESIDUALS.md item 8) so they are answered, not forgotten:

1. Does a batch tool reduce _cache reads_ in the same proportion, or does the larger single payload
   defeat the prefix cache?
2. What is the right refusal rule for the third shape - count of interleaved reads, or an explicit
   dependency marker?
3. Does a batch of 10 edits in one call cost less than 10 sequential edits at the provider level, or
   does the larger request simply move the cost?
