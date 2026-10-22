# The Routing Table and Difficulty Classification

The effort follows the task's actual difficulty. File count, task label, and stakes are not
difficulty.

## The two classes

| Class      | Signals                                                                                        | Tier   |
| ---------- | ---------------------------------------------------------------------------------------------- | ------ |
| Mechanical | Complete spec; no ambiguity; lookup-and-replace; rename; conversion; a guarded exceptions list | `low`  |
| Semantic   | Naming judgment; authored prose; design decisions; ambiguous refactor; integration             | `high` |

The mechanical class covers multi-file sweeps. The semantic class covers one-line judgment calls.
Classify the operation, not its size.

## The table

| Task                                                | Model                      | Effort |
| --------------------------------------------------- | -------------------------- | ------ |
| Exploration, any, always                            | `glm-5.3-flash`            | `low`  |
| Coding, trivial or mechanical                       | `glm-5.3-flash`            | `low`  |
| Coding, routine or semantic                         | `glm-5.3-flash`            | `high` |
| Coding, exhaustive verification (user request only) | `glm-5.3-flash`            | `max`  |
| Planning, architecture, design, advanced debugging  | `deepseek-v4.1-flash-1017` | `max`  |
| Deepest reasoning (the ceiling)                     | `deepseek-v4.1-flash-1017` | `max`  |

The table is total: every task maps to one row. If a task seems to fit none, apply the tie-breaker:
exploration to `low`; anything producing code to the ladder; anything deciding architecture or plans
to the main agent.

## Examples

| Task                                                      | Row                    |
| --------------------------------------------------------- | ---------------------- |
| Survey the repo for TODO comments                         | Exploration, `low`     |
| Fix a typo in one config line                             | Trivial, `low`         |
| Rename `getX` to `fetchX` in 40 files with a guarded list | Mechanical, `low`      |
| Add a rate limiter across three modules                   | Semantic, `high`       |
| Author the design doc's philosophy section                | Semantic, `high`       |
| Redesign the plugin event bus                             | Planning, DeepSeek max |
| User asks for an exhaustive check at max                  | Exhaustive, `max`      |

## The main agent's lane

The main agent runs the DeepSeek lane at `max`; that is the planning and advanced lane, not a
delegation target. Planning should be owned by the main agent or delegated to the DeepSeek lane,
never to the GLM tier.

## Pinned roles

The agent-loop's pinned roles must match the table:

| Role       | Model                      | Effort |
| ---------- | -------------------------- | ------ |
| `explorer` | `glm-5.3-flash`            | `low`  |
| `coder`    | `glm-5.3-flash`            | `high` |
| `planner`  | `deepseek-v4.1-flash-1017` | `max`  |

A pin that disagrees with the table is drift; fix the pin, not the table.

## Exploration

Exploration is `low` without stakes-based exceptions. The one permitted re-run is a single `high`
attempt when a survey comes back unusably thin and feeds a coding task. An explicit user request for
archaeology may use `max`; nothing else moves exploration off `low`.

## Failure modes

- **Category reflex**: "coding means high" or "multi-file means high". Cost: mechanical sweeps pay
  1.5-3x for no correctness gain.
- **Lane confusion**: planning on GLM (quality loss) or exploration on DeepSeek (5.8x cost).
- **Row invention**: a "sensitive exploration" row that does not exist. The table is closed;
  changing it is a policy change.
