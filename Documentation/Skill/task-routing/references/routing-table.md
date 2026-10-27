# The Routing Table and Difficulty Classification

The effort follows the task's reasoning demand, and most tasks demand very little.

## The rule

**Start at `low`. Raise only on a named signal.**

The default is not a compromise; it is the correct tier for the majority of delegated work, because
the catalog model at `low` is capable and the effort token controls deliberation, not competence.

Three demand tiers, not two:

| Tier         | The task...                                                       | Effort |
| ------------ | ----------------------------------------------------------------- | ------ |
| Mechanical   | has a complete spec, or retrieves and reports a known source      | `low`  |
| Judgment     | must decide something under a constraint, or reconcile a conflict | `high` |
| Constitutive | decides what later work assumes (law, architecture, adjudication) | `max`  |

"Constitutive" is the main agent's lane.

It is not a delegation target.

The boundary that matters most: **the design belongs to the parent; the implementation of a
specified design is coding.**

A lane handed the interfaces, the file layout and the contracts is doing semantic coding even when
the change is large or novel.

Only the act of deciding those contracts is constitutive.

## The closed table

| Task class                                                 | Model                      | Effort          |
| ---------------------------------------------------------- | -------------------------- | --------------- |
| Exploration, any, always                                   | `glm-5.3-flash`            | `low`           |
| Coding, mechanical (a complete spec)                       | `glm-5.3-flash`            | `low`           |
| Coding, semantic (the design is given by the parent)       | `glm-5.3-flash`            | `high`          |
| Coding, exhaustive verification (an explicit user request) | `glm-5.3-flash`            | `max`           |
| The parent's planning, architecture, design, adjudication  | `deepseek-v4.1-flash-1017` | `max`           |
| The delegated red-tree diagnosis or advanced debugging     | `deepseek-v4.1-flash-1017` | `max`           |
| The fallback, only when the cheap route is NOT permitted   | `deepseek-v4.1-flash-1017` | the SAME effort |

The table is total: every task maps to one row.

If a task seems to fit none, apply the tie-breaker: exploration to `low`; anything producing code to
the ladder; anything deciding architecture or plans to the main agent.

There is no fourth model, no other effort token, and **no DeepSeek `high` row**.

## The preset catalog

Find the shape.

Take its tier.

Do not reason from the label.

### `low` - the default

| Preset                                           | Why low                                 |
| ------------------------------------------------ | --------------------------------------- |
| Retrieve from a known corpus, cite file:line     | reading and quoting, no judgment        |
| Mechanical sweep with a complete spec            | rename, path replace, frontmatter block |
| Small code change with an obvious diff           | a constant, a guard, an off-by-one      |
| Add a test from an explicit expected behavior    | the spec is the work, not the model     |
| Doc edits: typos, links, cross-references        | local, verifiable, reversible           |
| Formatting, ASCII, lint, prettier pass           | deterministic                           |
| Transcribe or extract into a table               | fidelity, not invention                 |
| Shape data: JSON to table, CSV cleanup           | transformation with a stated target     |
| Inventory, counting, manifest building           | enumeration                             |
| Run a known checker and report its output        | execution                               |
| Write a report from evidence already collected   | assembly                                |
| Summarise a page or a diff                       | compression of given material           |
| Add a CLI flag that follows an existing pattern  | the pattern is the spec                 |
| Wire a config value through existing plumbing    | the seam already exists                 |
| Run the final verification of a known-green tree | execution of a stated battery           |

### `high` - judgment under a constraint

| Preset                                             | Why it needs deliberation                          |
| -------------------------------------------------- | -------------------------------------------------- |
| Diagnose a bug from a failure with no stated cause | form a hypothesis, then disprove it                |
| Root-cause a defect in a tool or script            | the cause is not where the symptom is              |
| Refactor across files, behavior must not change    | every move has a correctness condition             |
| Author a spec another agent will execute           | an incomplete spec fails silently                  |
| Review another lane's artifact adversarially       | the job is to find what the producer cannot        |
| Reconcile two sources that disagree                | decide which is right and say why                  |
| Design a name or an API inside a convention        | the cost lands later                               |
| Design a benchmark or an experiment                | the method is the deliverable                      |
| Plan a migration with order and rollback           | sequence and reversal are the content              |
| Threat-model a system                              | enumerate what is not defended                     |
| Formalize an ambiguous request into scope          | the ambiguity is the task                          |
| Choose between two viable options                  | the trade-off is the work                          |
| Implement a specified design across many files     | the contracts are given; the execution is the work |

### `max` - constitutive, main agent only

| Preset                                     | Why it cannot be delegated cheaply          |
| ------------------------------------------ | ------------------------------------------- |
| Author or amend a law, standard, or policy | it constrains every later decision          |
| Make an architecture decision              | later work inherits it                      |
| Adjudicate a dispute between lanes         | someone must be wrong, and it must be named |
| Decide what the product is                 | it reframes the work below it               |
| Diagnose a whole-tree red gate             | the failure model is the deliverable        |

## What never raises the tier

- **File count.** A 65-file sweep is still a sweep.
- **Output length.** A long report from short evidence is assembly.
- **Number of tools touched.** Tool breadth is not reasoning depth.
- **Stakes.** Importance is a reason to verify, not to deliberate.
- **The word "coding".** Most code changes are mechanical.
- **Prose.** Writing documentation is assembly when the facts are decided.
- **A large or novel change with a complete spec.** Size is not ambiguity.

## The raise signals

Move up one tier only when one of these is true, and name which one:

1. A `low` attempt failed, and the failure is described rather than "it did not work".
2. The spec contains an ambiguity that reading the repository cannot resolve.
3. The task requires holding two constraints that pull against each other.
4. The output was rejected on judgment, not on format.
5. A wrong answer produces a wrong decision rather than a wrong character.

If none applies, the task stays where it is.

"It feels important" is not a signal; it is the anti-pattern this table exists to prevent.

## When the cheap route is unavailable

A session may restrict the allowed models.

If the GLM tier is not permitted, route to `deepseek-v4.1-flash-1017` at the **same effort tier** -
not higher.

The effort token measures reasoning demand.

Raising it because the model changed confuses two independent variables and buys nothing.

And the reverse error is the one that has actually been measured: routing the semantic coding to the
DeepSeek lane while the cheap route WAS permitted.

## The Agent Teams caveat

`spawn_teammate` has no `provider`/`model`/`reasoning_effort` fields.

A durable teammate runs on the profile's subagent default - the expensive lane.

Route the mechanical and semantic coding lanes via `subagent`/`subagent_fork` with the explicit
triple; when the durable, messageable room is genuinely needed, spawn the teammate, state in its
spec that it runs on the default, and record that in the report.

## Calibration evidence

Measured on 21-22 October 2026, on this harness, across a 24-lane batch:

| Lane                                           | Effort  | Outcome                                              |
| ---------------------------------------------- | ------- | ---------------------------------------------------- |
| Frontmatter sweep, 65 documents                | `high`  | succeeded; a complete-spec sweep would pass at `low` |
| Reference rename, 43 paths in 14 files         | default | succeeded                                            |
| Retrieval from an 83-page corpus, one question | `low`   | correct answer with seven citations                  |
| Markdown audit, 21 defect classes              | `high`  | found a result-ordering bug no checker could see     |
| Site crawl, four sources                       | `high`  | found two crashed captures and a title misalignment  |

The pattern: **retrieval and sweeps succeed at the bottom; audits and root-causing need the
middle.**

No lane in that batch needed `max` except the ones the main agent kept.

Measured again on 24 October 2026, the first full program run under this policy:

- 11 lanes on the GLM `low` (sweeps, enables, docs) - correct, all first-attempt successes.
- 24 lanes on the DeepSeek `high` - 16 semantic coding that belonged on the GLM `high`, 4 mechanical
  that belonged on the GLM `low`, and 1 red-tree diagnosis that justified the DeepSeek lane at
  `max`. The over-routing cost 2x the input and 2.4x the output per lane with no measured
  correctness gain.
- 4 durable teammates on the `spawn_teammate` default, because the tool has no route field.

The cause: the fallback clause read as a license plus the semantic judgment tier mapped to the
DeepSeek model - a row invention.

The binding correction: the cheap route is permitted unless the profile forbids it, the semantic
judgment tier is the GLM at `high`, and the DeepSeek appears only at `max` or as the same-effort
fallback.

## Pinned roles

The agent-loop's pinned roles must match the table:

| Role       | Model                      | Effort |
| ---------- | -------------------------- | ------ |
| `explorer` | `glm-5.3-flash`            | `low`  |
| `coder`    | `glm-5.3-flash`            | `high` |
| `planner`  | `deepseek-v4.1-flash-1017` | `max`  |

A pin that disagrees with the table is drift; fix the pin, not the table.

## Failure modes

- **Category reflex**: "coding means high", "multi-file means high". Cost: mechanical sweeps pay
  1.5-3x for no correctness gain.
- **Model compensation**: raising effort because the permitted model is not the preferred one. The
  two variables are independent.
- **Lane confusion**: planning on GLM, or exploration on DeepSeek at `max`.
- **Stakes inflation**: treating a client-facing document as constitutive. It is important to
  verify, not to deliberate.
- **Row invention**: a "sensitive exploration" row, or a "DeepSeek high" row for the semantic
  coding. The catalog is closed; adding a preset is a policy change.
- **Design/coding confusion**: treating a specified implementation as architecture and sending it to
  the DeepSeek lane. Cost: 2x-2.4x for the same result.
- **The default-room trap**: a teammate room with no routes, silently on the expensive lane.
