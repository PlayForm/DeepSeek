---
name: feedback-distillation
description:
    "Turn the user's corrections into dated, anonymised rules and skills: the roles, the public
    surface, the reference shelf, the links, the low-cost lanes, the board, the staged commits, the
    plugin hygiene, and the scope gate. Every future correction follows the same method."
whenToUse:
    "After a user correction or a repeated request; when a project handoff needs the lessons to
    carry over; when the user says to save the pattern; when a new delivery starts and the rules
    must be restated without private names."
version: 1.0.0
updated: 2026-10-28
---

# Feedback Distillation

The user's corrections are the most valuable input in the session.

This skill turns each one into a dated lesson, then into a rule, then into a skill.

The general rule holds no real name, no private path, and no project-specific identifier.

## When to use

- A user correction changes the scope, the roles, the files, or the workflow.
- The same request repeats across sessions.
- The user asks to save the pattern or to prepare a future pack.
- A new project starts and the old lessons must be loaded first.
- Do not use this skill for a single task instruction (the `delivery-workflow`), for the route
    (`task-routing`), or for the queue (`orchestrator-batch`).

## The method

1. **The capture.**

    Capture the correction as the user said it, not as you interpreted it.

2. **The role.**

    Name the role that it belongs to: the user, the client, the provider, the product, the demo, the
    repository, the board, or the operator.

3. **The anonymization.**

    Anonymize: remove the real names, the private paths, the client identity, and the product
    identity.

    Keep the role, the shape, and the consequence.

4. **The lesson.**

    Write the dated lesson in the project's Workflow lessons table, with the date and the evidence.

5. **The promotion.**

    Promote a repeated lesson to a rule in the AGENTS file or in the skill that it belongs to.

6. **The request class.**

    Add the future request class to `request-pack`, with the skill that it loads.

7. **The verification.**

    Verify: the rule is in the skill catalog, the tree's verifier prints PASS, and the lesson is
    dated.

## The feedback

The rows below are the anonymized requests from the delivery that produced this skill.

The roles stand in for the names, and the shape is the rule.

| The request | The lesson | The rule |
| --- | --- | --- |
| "The client is not the demo; the client and the provider develop the product together." | The client, the provider, the product, and the demo are four distinct roles. | The roles are named once and never collapsed. |
| "There is no public site yet; this is the operator surface." | A public surface that does not exist is named as absent, not implied. | The scope gate. |
| "Preserve every URL." | A page read but not shelved is a failed read. | The reference shelf: `crawl4ai`, `reference-intake`, `source-pipeline`, `anydoc`. |
| "The full source is in the module directory; use the reset script." | The local sources are reset before they are read. | The local sources: `--list`, then `--only <names>`; clone if missing. |
| "Use low-cost agents; you manage." | The lanes are low; the parent formalises, dispatches, verifies, and records. | `task-routing` and `orchestrator-batch`. |
| "The issues have links that go nowhere." | A plain path in an issue is a broken reference. | The link rule: files `blob/Current/<path>`, directories `tree/Current/<path>`. |
| "Disable the limiting plugins." | A failed or blocking plugin is disabled, not worked around. | The plugin hygiene. |
| "Save this as a repeatable pattern." | The pattern is a skill, not a conversation. | This skill and `request-pack`. |
| "Do not stop until everything is done." | The batch continues across rounds; the goal holds the objective. | The goal and the no-wait law. |
| "You are not to plan or reason; let them." | The agents reason about the content; the parent reasons about progress and needs. | The delivery loop. |

## The anonymization

- Replace a person with a role: the user, the client, the provider, the operator.
- Replace a product with a role: the product, the library, the surface, the demo.
- Replace a private path with a shape: the module directory, the reference shelf, the board.
- Keep the dates, the commit hashes, and the counts, because they are evidence rather than identity.
- A rule that needs a private name to make sense is not yet a rule.

## The future

Append a row for each correction.

When a row repeats three times, promote it to a rule in the skill that it belongs to and add the
request class to `request-pack`.

A skill that has not changed in a month is either complete or unused, so check which one it is.

## Verification

- The rule appears in the skill catalog and in the project's AGENTS or law.
- The dated lesson is in the project's Workflow table.
- `python3 Maintain/Verify.py` prints PASS.
- The anonymized rule reads correctly with no name put back in.

## References

`delivery-workflow`, `request-pack`, `orchestrator-batch`, `worker-strains`, `code-authoring`.
