# World

## The claim

The same turn twice, aligned by stage: the harness alone in one column and the family in the other,
so a reader sees where the family changes the run and where it passes through. The intervention
column is derived from the behavior records, so the picture cannot claim a change the records do not
have.

The machine answers: **where does the family intervene in a turn, and where does it pass through?**

## The sources

| Source                                                                          | What was taken                                                                                                                                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Site/Source/Component/World.astro`                                             | The caption, the two legend keys, the stage rail, and the two columns. The intervention column is a `Map` built from the behavior records, so a stage is touched when any record names one of its seams. |
| `Site/Source/Stylesheet/Component/World.scss`                                   | The geometry: `minmax(140px, 200px)` for the stage title, `minmax(0, 1fr)` for the base, `minmax(0, 1.4fr)` for the family, one hairline between rows, and the accent-soft wash on a touched row.        |
| `Site/Source/Content/Turn.ts`                                                   | The twelve stages, their order, and the seams each one dispatches. The stage titles are the docs' titles, and the rail prints them in that order.                                                        |
| `Site/Source/Content/Behavior.ts`                                               | The thirty records that decide which rows are touched, and the slugs the family column prints.                                                                                                           |
| `Site/Source/pages/harness.astro`                                               | The mount: the `The turn` section, under the `StageRail`, with the note that the rail names what enters and leaves each stage.                                                                           |
| `Temporary/component-page-composition-recipes.json`                             | M04.R03, aligned worlds: a shared stage, a proposal and an execution, and explicit correspondence with no duration claim. The machine is that recipe with two columns instead of four.                   |
| `Temporary/Corca/Curated/Components.md`                                         | The matrix rules: a hairline between rows, no outer border around content, and one accent for the marked cell. The touched row is the marked cell.                                                       |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/trace-waterfall.tsx` | The span row aligned on one shared axis, with a status per span. The rail is that alignment with the stage as the axis instead of time.                                                                  |

The borrow is a mechanic (two worlds read down one axis), a geometry (three columns with the
comparison in the widest one), and a state model (a stage is touched or it passes through, and the
row's wash says which).

## The copy

The section that mounts it prints `The turn` and
`A turn is zero or more steps, and a step is one model request plus the tools it calls. One entry per stage, in the order the turn reaches it; a seam the family uses is lit, and a seam it does not use stays quiet.`

The machine prints, in order:

1. `The same turn twice: what the harness does alone, and what changes when the family listens at a seam.`
   (the caption)
2. `the harness alone`
3. `with the family`
4. `Queue`; `agent/inbox/inserted`; `passes through`
5. `Claim`; `agent/inbox/claimed`; `passes through`
6. `Assemble`; `system-prompt/assemble`; `hook-dsh-live-containers`
7. `Pre-step`; `agent/pre-step`; `passes through`
8. `Request`; `agent/request`; `passes through`
9. `Bind`; `no seam`; `passes through`
10. `Admit`; `no seam`; `passes through`
11. `Stream`; `llm/stream`;
    `hook-dsh-normalize-dash, hook-dsh-normalize-ellipsis, hook-dsh-normalize-fullwidth, hook-dsh-normalize-invisible, hook-dsh-normalize-quotes, hook-dsh-normalize-spaces`
12. `Settle`; `agent/request-error`; `passes through`
13. `Execute`; `tools/pre-execute`;
    `hook-dsh-workspace-govern, hook-dsh-workspace-operate, hook-dsh-ccr, hook-dsh-comment-filter, hook-dsh-convention-suggester, hook-dsh-doc-suggester, hook-dsh-edit-suggester, hook-dsh-graph-suggester, hook-dsh-replay-suggester, hook-dsh-search-suggester, hook-dsh-test-suggester, hook-dsh-tool-coach`
14. `Close step`; `no seam`; `passes through`
15. `Close turn`; `agent/turn-stopping`; `hook-dsh-lesson-nudge`

The machine prints no figure. It counts nothing, so no count appears in the copy or on the face; the
harness page's `StatBand` above it carries the counts.

## The layout

```
+----------------------------------------------------------------------+
| WORLD                                                                |
| the same turn twice, aligned by stage                                |
+----------------------------------------------------------------------+
| CAPTION  what the harness does alone, what changes with the family   |
| [ the harness alone ]  [ with the family ]                           |
+----------------------+------------------------+----------------------+
| Queue                | agent/inbox/inserted   | passes through       |
+----------------------+------------------------+----------------------+
| Claim                | agent/inbox/claimed    | passes through       |
+----------------------+------------------------+----------------------+
| Assemble             | system-prompt/assemble | hook-dsh-live-...    |
+----------------------+------------------------+----------------------+
| Pre-step             | agent/pre-step         | passes through       |
+----------------------+------------------------+----------------------+
| Request              | agent/request          | passes through       |
+----------------------+------------------------+----------------------+
| Bind                 | no seam                | passes through       |
+----------------------+------------------------+----------------------+
| Admit                | no seam                | passes through       |
+----------------------+------------------------+----------------------+
| Stream               | llm/stream             | six normalize hooks  |
+----------------------+------------------------+----------------------+
| Settle               | agent/request-error    | passes through       |
+----------------------+------------------------+----------------------+
| Execute              | tools/pre-execute      | twelve hooks         |
+----------------------+------------------------+----------------------+
| Close step           | no seam                | passes through       |
+----------------------+------------------------+----------------------+
| Close turn           | agent/turn-stopping    | hook-dsh-lesson-...  |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The title track is 140 to 200px, the base column takes one share and the
family column 1.4 shares, so the comparison is the widest thing on the row; the hairline between
rows is the grid's own background showing through, and a touched row takes the accent-soft wash.
Under 720px the three columns stack, because a comparison at a third of the width is not a
comparison.

## The machines

World adds the comparison across a whole turn. The `StageRail` above it says what each stage takes
in and gives out; this says what changes at each stage when the family listens.

| Neighbour on the same page | What it already says                                  | What World must not say          |
| -------------------------- | ----------------------------------------------------- | -------------------------------- |
| StageRail                  | what enters and leaves each stage, with its seams lit | the same seams lit a second time |
| Matrix                     | which plugin changes what, per seam                   | a per-plugin row                 |
| Cascade                    | the share of a call                                   | the share of a turn              |
| Anchor                     | the page's sections                                   | a fourth column of links         |

The rail is the turn's path, so the two seams that are not on the path, `batch/proposed` and
`fs/observed`, have no row. A package that answers only at those seams is absent from this picture,
which is the honest consequence of the axis being the turn.

## The decisions

| Decision                                            | The alternative rejected                          | Why                                                                                                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two columns on one stage list                       | Two separate turns drawn one after the other      | The stages are the same and a second copy would double the height of the page for one comparison. The columns are the two worlds, and the stage list is the axis they share.                                           |
| The intervention column is derived from the records | A hand-written list of interventions              | A typed list could claim a change the records do not have. Derived, the picture is a projection of `Behavior.ts` and cannot disagree with the seam pages.                                                              |
| The base column prints the first seam only          | Every seam a stage dispatches                     | The `Execute` row dispatches four seams, and printing all four would wrap the column and break the row's alignment. The first seam is the stage's entry, and the family column carries the hooks at every one of them. |
| `passes through` is a word                          | An empty cell                                     | A blank cell reads as missing data. The word is the machine's claim about the stage, and it is the claim the whole picture is for.                                                                                     |
| `no seam` is a word                                 | An empty cell                                     | The same reason, and it also distinguishes a stage with no seam from a stage whose seam the family ignores.                                                                                                            |
| A touched row takes the accent-soft wash            | A badge per intervention                          | The wash marks the row once; the slugs are the names. A badge would add a second mark to a row that already has one.                                                                                                   |
| The stage titles are the docs' titles               | The seam names as row titles                      | The stage is the unit of the turn and the seam is an address inside it. A rail of seam names would be the `Matrix` page, not a turn.                                                                                   |
| The legend has two keys                             | Column heads over the two worlds                  | The caption already says what the two columns are, and the keys are shorter than two heads. A head row would add a fourth line above twelve rows.                                                                      |
| The rail stops at the path's seams                  | Adding `batch/proposed` and `fs/observed` as rows | Neither is on the turn's path, so neither has a stage. Adding them would invent a position for a seam the harness dispatches elsewhere.                                                                                |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on `/harness`, inside the `The turn` section, directly under the
`StageRail`. The page that proves it is the harness page, and the records it reads are
`Site/Source/Content/Turn.ts` and `Site/Source/Content/Behavior.ts`.

What is not drawn yet: the arms, which the family registers beyond the seams its READMEs document,
and the second run. The two worlds are two columns of one stage list, not two executions, so a
reader who wants to see the family's own run has to read the seam pages. The arms are the larger
gap, because the rail's four touched rows are the documented seams and the family also registers
arms at others.
