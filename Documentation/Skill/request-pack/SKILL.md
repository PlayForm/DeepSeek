---
name: request-pack
description:
    "The future request classes and the skill each one loads: continue the delivery, add the
    components, build the pages, preserve the references, link the issues, restructure, rename,
    create the board, prepare the plan, review, assure, clean the plugins, save the pattern, and
    launch many agents. A one-line request translated into a procedure, an output, and an arbiter."
whenToUse:
    "When a user request is terse and matches a class in the pack; when a new delivery starts; when
    a handoff must say which skill a future request loads; when the user asks to prepare the next
    pack of requests."
version: 1.0.0
updated: 2026-10-28
---

# Request Pack

A one-line request is a class, not an improvisation.

This pack translates each class into the skill that owns it, the output that it must produce, and
the arbiter that proves it.

The roles are generic: the user, the client, the provider, the product, and the demo.

## When to use

- A request is short and matches a row below.
- A new delivery starts and the same requests are expected again.
- A handoff must name the skill that a future request will load.
- The user asks to prepare the next pack.
- Do not use this skill for a request that is genuinely new, because you classify it with
  `feedback-distillation` first and then add a row here.

## The translation

| The request                            | The skill or rule                                 | The output                                           | The arbiter                               |
| -------------------------------------- | ------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| "Continue the delivery."               | `delivery-workflow`                               | the next wave from the board and the plan            | the wave's printed result                 |
| "Add the next components or patterns." | the component catalog and the cluster tests       | the library's next cluster                           | the cluster's matrix tests                |
| "Build the pages or the families."     | the shell and the state matrix                    | the operator surface's next family                   | the built route's states                  |
| "Preserve these references."           | `crawl4ai`, `reference-intake`, `source-pipeline` | the shelf with the new sources                       | the shelf's index and status table        |
| "Link the issues or the docs."         | the link rule                                     | every path as a markdown link                        | a sampled link resolves                   |
| "Restructure the repository."          | the law and the migration table                   | the moved tree                                       | the tree's verifier                       |
| "Rename the product or the roles."     | the naming law and the scope gate                 | the corrected docs and boards                        | the same names in every artifact          |
| "Create the board or the milestones."  | the GitHub decomposition                          | the board, the epic, the sub-issues                  | the sub-issue count and the Target dates  |
| "Prepare a flight plan."               | the plan                                          | the phases, the milestones, the issue specs          | the plan's statuses and the issue payload |
| "Review the work."                     | the feedback loop                                 | the findings as nested issues                        | the variant-table diff                    |
| "Run the assurance."                   | the checks                                        | the state matrix, the accessibility, the version     | the named check per issue                 |
| "Clean the plugins."                   | the plugin hygiene                                | the profile with the failed and blocking plugins off | the plugin list shows them disabled       |
| "Save the pattern."                    | `feedback-distillation`                           | a dated, anonymized skill                            | the skill catalog and the tree's verifier |
| "Launch many agents."                  | the workflow and the low lanes                    | the results                                          | each lane's arbiter                       |

## The frame

Each row runs inside the same frame, and the frame keeps a terse request safe:

1. **The roles.**

    The user, the client, the provider, the product, the demo.

    A request that names one role does not silently change another.

2. **The references.**

    The agent shelves any URL that the request brings before it answers, because a page read but not
    shelved is a failed read.

3. **The board.**

    The work is an issue with one acceptance check, on a board, with a milestone and a Target date,
    and the epic and the sub-issues hold the plan.

4. **The lanes.**

    The agents are low-cost and idle-launched, and the parent formalises, dispatches, verifies, and
    records.

    The parent never waits.

5. **The commits.**

    Each step stages only its own files and runs the custom commit, and a lane never pushes and
    never stages another lane's files.

6. **The scope gate.**

    A user correction overrides the plan and the issues, and the lane comments on the item that is
    out of scope and corrects the plan in the same pass.

## The future pack

The table above is the pack.

When a future request does not match a row, do not stretch the row: add a new one with its skill,
its output, and its arbiter, then promote the rule with `feedback-distillation`.

A pack that grows without a new arbiter is a wish list.

## Verification

- The class's skill is in the catalog and loads.
- The output exists where the row says.
- The arbiter printed its result.
- The agent shelves and links the request's own references.

## References

`delivery-workflow`, `feedback-distillation`, `orchestrator-batch`, `task-routing`,
`worker-strains`, `crawl4ai`, `reference-intake`, `source-pipeline`.
