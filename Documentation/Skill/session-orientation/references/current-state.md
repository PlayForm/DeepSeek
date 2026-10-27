# The Current State

The repository states its own condition in five places.

Read them in this order, and read only what the task needs.

## 1. `README.md` - the family's public state

What it holds: the mission, the install routes, the two release groups, the package descriptions,
the tools, the configuration surface, the smoke table, the development scripts, the troubleshooting
notes.

Known drift: updated 2026-10-22 - the header and layout now reflect the full suite (51 Classic + 46
EffectTS packages, 359 smoke suites / 5,337 checks).

The tree is the arbiter; if the README and the directories disagree, the directories win.

## 2. `Documentation/INDEX.md` - the documentation map

What it holds: the tree, the registry of every document by section, the granular-split history, and
the untouched trees.

Use it to find a document without listing the tree.

Do not read it end to end.

## 3. `Documentation/Plans/` - the state of the work

Every plan carries YAML frontmatter with `status`.

The statuses are the routing signal:

| Status              | Meaning                                                       |
| ------------------- | ------------------------------------------------------------- |
| `active`            | The work in progress; read before touching its area           |
| `planned`           | Designed, not implemented; never describe as shipped          |
| `implemented (PoC)` | Built as a PoC; check the grades before claiming completeness |
| `researched`        | Research complete, decision pending                           |
| `complete`          | Done; keep as history                                         |
| `open`              | A question, not a commitment                                  |

Active at the last check: `DSH-MONOREPO-PLAN.md`, `TOMORROW-REVIEW.md`,
`BATCH-EDIT-TOOL-FEATURE.md`, `BATCH-EDIT-TOOL-SUGGESTIONS.md`, and the active Batch-Edit-Tool
topics.

Verify:

```sh
grep -H '^status: active' Documentation/Plans/*.md
```

The UI-Family, Workspace-Family, and orchestration plugin sets are now BUILT as PoCs (2026-10-22;
status `implemented (PoC)`).

Their completeness grades: Documentation/Reports/POC-GAP-ANALYSIS.md.

Do not claim "complete" without checking the grades.

## 4. `Documentation/Guides/` - the deep manuals

| Guide                         | Read when                                   |
| ----------------------------- | ------------------------------------------- |
| `Governor-SCHEME.md`          | The governor's design and the method ledger |
| `Governor-CASCADES.md`        | The cascade rules and the escalation paths  |
| `Governor-TRIO-GRAPH.md`      | How the three governance packages interact  |
| `Governor-README.md`          | The operator's view of the trio             |
| `DOGFOOD-TESTING.md`          | Running the family against itself           |
| `LIVE-TESTING-METHODOLOGY.md` | The live battery and its fixtures           |
| `DSH-REGISTRY-LISTING.md`     | The npm roster and the publish gates        |

The registry listing guide is dated 2026-10-10 and still says "never published".

Verify the publish state before repeating any claim about npm.

## 5. `Documentation/Reports/` and `Documentation/Researches/`

Reports are audits and diagnoses (case review, commonalization audit, file-content flavor design,
fs/observed delivery, P5 v2 diagnosis).

Researches are the research outputs behind the plans (family interactions, harness UI, normalize
overpass, tool coach).

Read them when a plan's rationale is not enough.

## The source of truth, in order

When documents disagree, use this order:

1. The package directories and manifests (`ls`, `package.json`).
2. The built site (`Site/Target/`) for site claims.
3. The smoke READMEs and their per-folder counts.
4. `Documentation/Plans/` frontmatter for work state.
5. `README.md`, the registry documents, and the guides last.

Documents lag; the tree does not.

A count in prose is a claim, not a fact.

## The reading timebox

For a fresh session: README (first 100 lines and the smoke table), INDEX (section headings), the
active plans named by the task, and one guide.

That is orientation.

Everything else is task-specific and waits until the task names it.
