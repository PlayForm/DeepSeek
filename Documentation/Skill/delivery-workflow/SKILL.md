---
name: delivery-workflow
description:
    "The reference-preserving multi-agent delivery loop: it frames the scope, runs the recon scouts,
    synthesizes the flight plan, decomposes the work into a GitHub board with an epic and real
    sub-issues, gates the scope, scaffolds the product, runs the implementation waves, runs the
    feedback and assurance passes, and records the lessons, all on low-cost lanes with a mandatory
    reference shelf and a staged git gcommit after each step."
whenToUse:
    "When the user asks for a multi-agent workflow, a flight plan, a new product surface, or a
    decomposition into GitHub issues and code; when external references must be preserved; when
    several low-cost lanes must be orchestrated with a commit after each step; and when a demo and a
    real system must be kept apart in the same tree."
version: 3.1.0
updated: 2026-10-28
---

# Delivery Workflow

This skill describes the loop that turns a user request into a reference shelf, a flight plan, a
GitHub board, a scaffolded product, implementation waves, and a recorded set of lessons, and its
defining division of labor is that the parent manages the process while the lanes reason and execute
the content.

The parent does not plan the content itself and does not wait for the lanes, because the parent's
value is in the frame, the decomposition, the verification, and the record, and each time the parent
starts to produce the content it becomes a second, uncoordinated worker whose output the lanes then
have to reconcile.

The loop keeps the references by design, which means that every external source that a lane reads
goes on the shelf before the lane returns, and the shelf is what lets a later session reconstruct
why a decision was made rather than guess from the finished artifact.

## How this document is used

This document records the practice in full so that a later session can read the precedent rather
than work it out again.

The corpus convention is that a reader reads a skill for precedent and the artifact itself stays
short.

## When this skill applies

| Scenario                                                                            | What is done                           |
| ----------------------------------------------------------------------------------- | -------------------------------------- |
| The request spans references, a plan, GitHub tasks, and code.                       | The workflow is loaded.                |
| The user names several agents, a workflow, a flight plan, or a decomposition.       | The workflow is loaded.                |
| A demo, a proof of concept, and a real product must be kept apart in the same tree. | The workflow is loaded.                |
| The task is a single delegation.                                                    | `worker-strains` is used instead.      |
| The task is the lane contract.                                                      | `idle-agent-protocol` is used instead. |
| The task is the queue.                                                              | `orchestrator-batch` is used instead.  |
| The task is the route.                                                              | `task-routing` is used instead.        |

## Size the scope before the waves

The parent counts the files and the lines in the instructed scope before it runs the first scout,
because a scope that is larger than one agent's context window has to be split before any lane
starts.

The split is a named file list per wave, not a priority order and not a vague "all", and each wave
fits one agent.

When the scope is larger than one agent, the waves run as a waterfall: one lane finishes its list,
the parent passes the state and the next list to the next lane, and the next lane starts only after
the previous one stops.

Each file in the scope gets a decision, either changed or left alone with a named reason, and "it
has no numbered rows" is not a reason to skip a file when the task is a prose rewrite.

A partial pass is reported as partial with the exact remaining list, and the parent continues the
waterfall until the scope is covered or the user stops it.

## The shape of the loop

The first step is the frame, where the parent records the user's scope, meaning the product, the
client, the demo, the provider, the public surface or its deliberate absence, and the references,
and it puts that frame into the root README and the flight plan before any agent runs.

A lane that starts without the frame invents its own scope, and the invention always costs more to
correct than the frame cost to write.

The second step is the recon, which runs two to four low-cost scouts in parallel: the reference
scout crawls the named URLs with `crawl4ai`, shelves them with `reference-intake` and
`source-pipeline`, and writes a research document; the local-source scout reads the finished project
that the user names and writes the pattern reference; the artifact scout inventories the mockups or
files that must be decomposed; and the architecture scout proposes the component or service model
from the three preceding outputs.

Each scout writes one research document under `Documentation/Research/`, and no scout commits,
because the recon gathers evidence rather than delivering.

The third step is the synthesis, where one lane reads the research and writes the flight plan under
`Documentation/Plans/`, covering the goal, the catalog, the phases, the milestones, the acceptance,
the risks, the open questions, and the issue decomposition as structured JSON.

The fourth step is the decomposition, where one lane creates the repository-linked board, the epic,
and the real sub-issues with their labels, milestones, Target dates, and the Table, Kanban, and
Roadmap views, and the sub-issues are nested under the epic as `subIssues` rather than listed as a
task list, and no lane edits repository files during this step.

The fifth step is the gate, where the parent reconciles the plan and the issues with the latest user
scope, and anything out of scope is parked with a comment rather than deleted, while the plan, the
README, and the epic body are corrected in the same pass.

The sixth step is the scaffold, where one lane creates the product or library skeleton, the tokens,
the contracts, the first primitives, the tests, and the build, updates the law and the verifiers for
the new code layer, and commits only its own files.

The seventh step is the waves, where one lane per cluster runs with one named arbiter such as the
build, the test suite, the state matrix, the accessibility pass, or the link audit, and a wave
starts only after its predecessor's arbiter is green.

The eighth step is the feedback, where one or two lanes review the components and file the findings
as nested issues, and the fix is a variant-table diff rather than a component fork.

The ninth step is the record, where the parent updates the plan statuses, the README, the index, the
review residuals, and this skill's lessons, and the goal closes only when the prototype is built,
tested, and verified.

## The laws that govern the loop

Reference is mandatory, so each URL that a lane reads, receives, or finds goes on the shelf in the
project's `Reference/` before the lane returns, with the `Archive/HTML`, `Archive/Documents`, `Raw`,
`statuses.json`, `fetch-errors.log`, and `README.md` structure, and documents route through
`anydoc`, because a page read but not shelved is a failed read.

The route is low, so each lane runs `cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low`, while
the parent runs the planning, the adjudication, and the read-only checks.

No waiting is allowed, so the parent never sleeps, polls, or reads a lane's output path to learn
whether it started, and the lane's result is the only progress signal, and with no own work left the
parent ends the turn while the goal rounds continue the batch.

Two lanes are active at a time, or a workflow runs the fan-out when the user asks for one, and in
either case the parent still verifies.

The commit is staged, so after each lane the parent stages only that lane's files and runs
`git gcommit`, the local AI commit alias; the retired variants of the commit alias must never be
used. The parent never uses `git add -A`, never commits another lane's files, and never pushes,
while a lane may commit its own files with `git gcommit` when its spec says so.

The board is the queue, so one issue is one deliverable with one acceptance check, the epic and the
sub-issues are the plan, the milestones are the delivery targets, and the Target dates place the
items on the roadmap.

The scope gate wins, so a user correction overrides the plan and the issues, the out-of-scope work
is parked with a comment, and the plan, the README, and the epic body are corrected in the same
pass.

The local sources are reset first, so the finished source modules in the directory that the user
names are refreshed with `Reset.sh --list` and then `Reset.sh --only <names>` before they are read,
and a missing module is cloned there rather than borrowed from elsewhere.

The plugins are kept hygienic, so the plugins whose `fiberPhase` is `failed` are disabled together
with the ones that strip or block the work, while the guards that enforce the law are kept.

## The GitHub decomposition

The board, the epic, the sub-issues, the links, the labels, the milestones, the Target dates, and
the parking rule are all part of one structure, and the table below records the rule for each object
so that the decomposition is consistent across runs.

| Object       | The rule                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| Board        | Owned by the organization, linked to the repository, private; Table, Kanban, and Roadmap views; a Target date field |
| Epic         | One issue naming the outcome; labels for the kind; the closing milestone                                            |
| Sub-issues   | One per deliverable, nested under the epic (`subIssues`), each with one acceptance check                            |
| Links        | Every file path in an issue body is a markdown link: files `blob/Current/<path>`, directories `tree/Current/<path>` |
| Labels       | A small type set: design, build, assurance, defect, document                                                        |
| Milestones   | The delivery targets, one per shippable state, dated only when the state is near                                    |
| Target dates | One per item from its milestone; the roadmap's axis                                                                 |
| Parking      | A comment and a close with `not planned`; never a delete                                                            |

## The next waves

The parent prepares the waves from the flight plan and the board, and then launches one lane per
cluster when the previous arbiter is green, because a wave that starts before its predecessor is
green inherits a broken tree and its own arbiter cannot tell the new failure from the old one.

| Wave       | Ships                                                    | The arbiter                  |
| ---------- | -------------------------------------------------------- | ---------------------------- |
| Scaffold   | the skeleton, the tokens, the contracts, the harness     | the build and the test suite |
| Primitives | the component clusters and their variant tables          | the cluster matrix tests     |
| Families   | the real pages and their state matrices                  | the built route's states     |
| Feedback   | the review findings as nested issues                     | the variant-table diff       |
| Assurance  | the state matrix, accessibility, role gating, versioning | the named check per issue    |

## The lessons

The pattern is only as good as the last correction, so a dated row is appended after each run, and
the rows below record what the first full run taught rather than what the plan expected it to teach.

| Date       | Lesson                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-26 | The recon scouts read thirteen pages and saved none; the reference rule is now mandatory, and the Web shelf preserved 87 sources.        |
| 2026-10-26 | Six workflow agents filed a board, an epic, and 24 real sub-issues; the parent verified the `subIssues` count rather than the epic body. |
| 2026-10-26 | The scope gate parked the cafe demo issues; the product surface was the Control Panel, not a public site.                                |
| 2026-10-26 | Six plugins failed with missing `inject` and tool-output contracts; the comment filter and the tool coach were disabled.                 |
| 2026-10-26 | `batch_edit` applied zero on a path sweep; `edit` per file is the fallback.                                                              |

## The design document is the lane spec

A lane that cannot see the conversation and cannot run commands is only as good as the document it
reads. On 2026-10-27 three sequential lanes built a complete package from one design document that
carried the table definitions, the two formulas, the file list and the build order; each lane read
the same document and its output fitted the previous lane's without a reconciliation pass.

The rule: write the design with the exact strings, the exact schema and the exact arithmetic in it,
point every lane at the document, and put only the lane's scope and its arbiter in the brief. A
paraphrase in the brief is where the drift enters, because the lane cannot check the paraphrase
against the source.

| Date       | Lesson                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-27 | Three lanes built one package from a design document carrying the DDL and the formulas; no reconciliation pass was needed.                        |
| 2026-10-27 | A write-only lane that cannot build needs the strict flags and the exact signatures in the spec; two builds failed on `noUncheckedIndexedAccess`. |
| 2026-10-27 | Fixtures passed 56 checks while the live replay found a directory ranked as a file and every edit reading `+0/-0`.                                |

## Verification

The loop ran correctly when the plan's statuses and the README name the same scope, when the board
has the epic and the sub-issues nested and the Target dates are set, when
`python3 Maintain/Verify.py` prints PASS, and when each lane's arbiter printed its result and the
parent grepped the artifact for each claimed fix.

## Anti-patterns

| Mistake                                                         | Cost                                                       | Do instead                                                        |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| A recon scout reads pages and shelves none.                     | The evidence disappears with the session.                  | Shelve every URL before the scout returns.                        |
| The parent plans the content instead of the process.            | The parent becomes a second, uncoordinated worker.         | Frame, decompose, verify, and record only.                        |
| A public site is implied when the product is the Control Panel. | The scope expands into a surface the user did not ask for. | Name the public site as absent.                                   |
| The board is a flat task list instead of nested sub-issues.     | The decomposition cannot be verified.                      | Nest the sub-issues under the epic.                               |
| The scope gate is skipped after a correction.                   | The out-of-scope work is smuggled into the plan.           | Park the out-of-scope work and correct the plan in the same pass. |
| A failed plugin is left enabled.                                | The hook strips or blocks the work.                        | Disable the failed plugin and keep the guards.                    |

## References

The loop depends on `idle-agent-protocol`, `orchestrator-batch`, `task-routing`, `worker-strains`,
`crawl4ai`, `reference-intake`, `source-pipeline`, and `code-authoring`, and each of those skills
owns a part of the procedure that this skill only coordinates.
