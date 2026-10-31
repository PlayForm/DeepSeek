# Flow

## The claim

One package's control flow in the site's own grammar: the stages in order, the branch stepped in
under the step that raised it, the store set in mono, the failure quiet and dashed, and the reason
for a row behind a disclosure so a long flow reads as labels rather than sentences. The machine draws
the order and the fork; it does not narrate them.

The machine answers: **in what order does this package's work happen, and where does it fork?**

## The sources

| Source | What was taken |
| --- | --- |
| `Site/Source/Component/Flow.astro` | The row list: a two-digit index, a body, a seam row drawn as a `Pipeline` of one stage, a `Badge` for every kind that is not a step, a `why` disclosure for a note, and a `Rule` callout beneath the list. |
| `Site/Source/Stylesheet/Component/Flow.scss` | The geometry of `.flow-line`: a `40px` index track (28px under 640px), a 2px left edge whose colour is the kind, the branch and the fail indented by the inset, the pass dotted, and the store's label in mono. |
| `Site/Source/Content/Current.ts` | The record shape, `Label`, `Kind`, `Note`, and the forty flows. The mounted instance is the governor's eleven stages, transcribed from its source and from the corpus diagram. |
| `Site/Source/pages/package/[slug].astro` | The mount: a `Flow` section gated on `CurrentFor(Entry.Slug) !== undefined`, with the lede quoted below. |
| `Site/Source/pages/harness.astro` | The precedent: the page that removed the `Flow` island as a second picture of the same stages, which is the reason this machine is rows and not a graph. |
| `Temporary/Corca/Curated/Components.md` | The line and gutter: a fixed number track outside the measure, a body that starts after it, and a band that says the line is addressable. The row's index track is that gutter. |
| `Temporary/component-page-composition-recipes.json` | M04.R05, incomplete recorded sequence: a start, events, a gap, a later event, with the missing end stated as incomplete rather than successful. The fail row follows that discipline. |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/trace-waterfall.tsx` | The span row with a start, a duration, and a critical path. The flow borrows the row's discipline and refuses the duration, because the source carries no clock. |

The borrow is a mechanic (the order is the picture), a geometry (a fixed index track and a body that
steps in for a branch), and a state model (a row is a seam, a step, a branch, a pass, a store, or a
failure, and the kind is the row's left edge).

## The copy

The section that mounts it prints `Flow` and `The order this package's work happens in, with the
branch that decides it inline, transcribed from the source and from the corpus where the corpus
draws it.`

The machine prints, for the mounted instance, in order:

1. `01`
2. `seam`
3. `fs/observed`
4. `02`
5. `Gate: the basename package.json, a mutation tool, a present observation, the stash, and the exclusion list`
6. `why`
7. `The gate writes nothing to the ledger; the module composes its own lines.`
8. `03`
9. `fail`
10. `skipped (excluded) <path>`
11. `why`
12. `Exclusion-first: the internals of a dependency are never governed.`
13. `04`
14. `Discover the nearest registry.json, and parse it`
15. `why`
16. `The walk-up is an auxiliary plain-fs probe; the governed manifest is never read here.`
17. `05`
18. `branch`
19. `No registry.json found, or it is unreadable`
20. `why`
21. `The chain pass is skipped, and the line says which of the two happened.`
22. `06`
23. `Chain pass: canonicalize every chain-governed pin to the resolved range`
24. `why`
25. `A dependency outside the chain is left where the author put it.`
26. `07`
27. `branch`
28. `The refusal guard: a non-dependency section would change`
29. `why`
30. `The rewrite is aborted, and the refusal names the section.`
31. `08`
32. `GuardedWrite replaceIfVersion, then re-emit fs/observed with the fresh version`
33. `why`
34. `The author sees its own bytes; the observation policy's version record is refreshed.`
35. `09`
36. `Update stage: npm-check-updates in process, or the ncu bin`
37. `why`
38. `A detached continuation off the settled chain pass, with the chain deps rejected.`
39. `10`
40. `branch`
41. `The circuit breaker: maxUpdateFailures in a row for one directory`
42. `why`
43. `The directory pauses, and the line carries the count.`
44. `11`
45. `store`
46. `~/.dsh/playform/<identity>.log`
47. `why`
48. `One global ledger, with the module identity as the line prefix.`
49. `Rule`
50. `The manifest is the only thing that changes: the listener never awaits, the chain pass and the update stage run as detached continuations, and the author is never told.`

A step row prints no badge, because a step is the default kind and the picture stays quiet where the
flow is ordinary. The other thirty-nine flows print their own labels and notes in the same grammar,
and their records live in `Site/Source/Content/Current.ts`.

## The layout

```
+----------------------------------------------------------------------+
| FLOW                                                                 |
| the order, the branch inline, the reason behind a disclosure         |
+----------------------------------------------------------------------+
| 01 | seam  fs/observed                                               |
|    | why                                                             |
+----------------------------------------------------------------------+
| 02 | Gate: the basename, a mutation tool, a present observation      |
|    | why                                                             |
+----------------------------------------------------------------------+
| 03 | fail  skipped (excluded) <path>        indented, dashed         |
|    | why                                                             |
+----------------------------------------------------------------------+
| 04 | Discover the nearest registry.json, and parse it                |
+----------------------------------------------------------------------+
| 05 | branch  No registry.json found, or it is unreadable             |
|    | why                                                             |
+----------------------------------------------------------------------+
| 06 | Chain pass: canonicalize every chain-governed pin               |
+----------------------------------------------------------------------+
| 07 | branch  The refusal guard                                       |
+----------------------------------------------------------------------+
| 08 | GuardedWrite replaceIfVersion, then re-emit                     |
+----------------------------------------------------------------------+
| 09 | Update stage: npm-check-updates in process, or the ncu bin      |
+----------------------------------------------------------------------+
| 10 | branch  The circuit breaker                                     |
+----------------------------------------------------------------------+
| 11 | store  ~/.dsh/playform/<identity>.log                           |
+----------------------------------------------------------------------+
| RULE   the manifest is the only thing that changes                   |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The index track is 40px and the body takes the rest; the branch and the
fail step in by the inset, so the left edge records the fork without a connector; the seam row is the
one row on the accent edge, and the store row is the one row whose label is mono. The rule is a
callout below the list, not a caption above it.

## The machines

Flow adds the order. Scheme states the laws that decide whether the flow runs at all, and Activation
prints the line the plugin writes on load; neither draws the sequence of work between the seam and
the ledger.

| Neighbour on the same page | What it already says | What Flow must not say |
| --- | --- | --- |
| Scheme | the pipeline as a composition and the laws around it | the flow as a second pipeline. The scheme's pipe has no branch; this has four. |
| Activation | the load line | the load as a stage |
| Surface | the registrations | the listener as a row |
| Detail | the tables the package reads | the table as a store row |

The failure row is the machine's honest edge: it is drawn quiet and dashed, because it is a path not
taken rather than a state the reader must find. When the record is absent the section is not
rendered.

## The decisions

| Decision | The alternative rejected | Why |
| --- | --- | --- |
| Rows | The graph island, `Site/Source/Component/Graph/Flow.tsx` | The harness page removed the island as a second picture of the same stages: two drawings of one fact is the defect the compound rule names. The rows also need no client bundle to lay out their labels. |
| The branch steps in under the step that raised it | A branch column beside the main line | The condition belongs to the step that raised it. A column would separate the two facts that have to be read together. |
| The seam row is a `Pipeline` of one stage | A label and a chip written in this file | `Pipeline` is the site's pairing of a stage label and a seam chip, and a seam row is exactly that pairing. Reusing the atom keeps the chip's shape from drifting. |
| The reason is behind `why` | The note under every row | A fifteen-stage flow would read as fifteen labels and fifteen sentences. The disclosure keeps the picture a picture and the reason one click away. |
| The fail row is quiet and dashed | The warn face, as `Bundle` uses | A failure path is not a failure that happened. Warn would make the row the loudest thing in a flow where it is the path not taken. |
| The store row's label is mono | A badge alone | The ledger path is the fact, and a path is set in mono everywhere else on the site. |
| No arrows between rows | A connector line between stages | The list order is the order. A connector would have to guess the row height, and the CSS cannot know it. |
| The kind is the row's left edge | A badge on every row | The badge is the label for a fork, a store, or a failure; a step needs none. The edge carries the kind for every row, so the badge can stay quiet. |
| The flow carries no duration | The waterfall's start and duration columns | The source carries no clock. A duration would be invented, and the harness page's cascade already says that its widths are a share rather than a measurement. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on every package page with a `Current` record, forty of them,
inside the `Flow` section. The page that proves the full grammar is
`/package/hook-dsh-package-governor`, whose eleven stages use every kind: a seam, five steps, three
branches, a fail, and a store.

What is not drawn yet: the `ets-` twins' Effect runtime, which is the dispatch and the scope fork
around the same listeners rather than a different flow, and the loop back from the update stage to
the observation, which the source writes as a re-emit and the flow draws as one step.
