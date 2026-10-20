# The Three Strains

Each strain is a cultivation site: a surface, a protocol, and a failure
path. The route comes from `task-routing`; this file describes the work.

## EXPLORER

**Work:** read-only surveys, research, scans, archaeology, locating
surfaces, counting, comparing.

**Surface:** reads only. `read`, `grep`, `glob`, `ls`, `test -e`, and
read-only git checks. No writes, no builds, no package installs.

**Protocol:**
- Answer the question asked; do not expand the scope.
- Cite evidence with paths and line numbers.
- Verify existence claims against disk, not against docs.
- Report uncertainty explicitly; a guess marked as a guess is usable, a
  guess presented as a fact is not.

**Failure path:** the parent's adjudication corrects thin or wrong detail
for free. A survey that comes back unusably thin may be re-run once at
`high`; nothing else moves exploration off `low`.

**Typical spec:**

```text
Survey <surface>. Read-only. Answer: <questions>. For each answer, cite
the file and line. Do not propose changes. Report in the given table.
```

## CODER

**Work:** implementation, refactors, features, integration, migrations,
tests.

**Surface:** the write/edit tool API, the build, the tests, and read-only
git. Never a commit.

**Protocol:**
- Follow the spec's build and test commands exactly.
- Read before edit; one logical change per call.
- Run the arbiter after each touched file; never leave the tree broken.
- Report per item: before, after, and the `file:line` anchor.
- End with the printed arbiter result and READY-TO-COMMIT.
- On failure, the exact `ESCALATION: <reason>` section.

**Failure path:** the attempts ladder in `task-routing`. The parent owns
the escalation and supplies the failed artifacts.

**Typical spec:** the template in `task-routing`'s
`references/ladder-and-specs.md`, plus the file-write and git laws from
`code-authoring`.

## PLANNER

**Work:** planning, architecture, design, advanced debugging, decisions
about structure or direction.

**Surface:** the shared facts, the process record, and the design
documents. Read-only unless the plan explicitly authorizes an edit.

**Protocol:**
- State the decision, the alternatives, and the evidence.
- Separate what is known from what is assumed.
- Produce a plan that names the verification for each step.
- Do not implement while planning; implementation is a CODER task.

**Failure path:** owned by the main agent. Planning is never delegated to
the GLM tier; a plan that needs rework is re-run on the DeepSeek lane with
the failed plan as context.

**Typical spec:**

```text
Decide <question>. Read <surfaces>. Produce: the decision, the
alternatives with tradeoffs, the evidence, the risks, and the steps with
their verification. Do not edit files.
```

## Choosing the strain

| The request is...                          | Strain   |
| ------------------------------------------ | -------- |
| "Find", "survey", "how many", "where"      | EXPLORER |
| "Implement", "fix", "refactor", "add"      | CODER    |
| "Design", "decide", "plan", "why"          | PLANNER  |

If a request spans two strains, split it: the plan first, then the
implementation, then the verification. One spec that tries to do all three
produces a report that cannot be adjudicated.
