# Tool

## The claim

The package's work is the calls it registers, so the machine is a register: the seam the names live
on, the count of them, and one plate per call with what it takes and what it hands back. The first
registered call takes the full width and the accent face, because it is the call a reader meets
first, and the rest share the tracks below it.

The machine answers: **what can a caller call, and what does each call take and return?**

## The sources

| Source                                                                       | What was taken                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Site/Source/Component/Tool.astro`                                           | The register: the seam band with the count, the rule, the field of plates, the entry plate, the two labelled facts under each name, and the note. The five records are the component's own table, keyed by package. |
| `Site/Source/Stylesheet/Component/Tool.scss`                                 | The geometry: two equal tracks for the plates, the entry plate spanning both, a 56 to 68px label track inside a plate, the accent slab for the entry, and the hover rule under a plate's bottom edge.               |
| `Site/Source/pages/package/[slug].astro`                                     | The mount: `Tool` inside the portrait section, gated on `Portrait.Shape === "tool"`, with the section title and the `Plugs into` lede above it.                                                                     |
| `Site/Source/Content/Portrait.ts`                                            | The five packages whose shape is a tool: `plugin-dsh-batch-edit`, `plugin-dsh-cost`, `plugin-dsh-cost-analysis`, `plugin-dsh-normalize-file`, and `plugin-dsh-workspace`.                                           |
| `Temporary/Corca/Curated/Components.md`                                      | The object-row grammar: a name as the head, then labelled facts, no cells and no column heads. A plate is that grammar with a border.                                                                               |
| `Temporary/component-page-composition-recipes.json`                          | M03.R01, evaluation cards: one object per card, the same model across cards and rows, and a count that comes from the data. The register is that recipe with a seam above it.                                       |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/kanban-board.tsx` | The card as the unit of comparison: a title, a description, and a footer of small facts. The plate borrows the unit and the ordering, not the drag.                                                                 |

The borrow is a mechanic (a register is compared, not read), a geometry (two tracks and a full-width
entry), and a state model (a call is registered or not, and the seam says where).

## The copy

The section that mounts it prints the portrait's own title and `Plugs into ...`.

The machine prints, for each package it is mounted with, in this order: the seam label, the seam,
the count, the calls label, the rule, one plate per call, and the note.

`plugin-dsh-batch-edit`:

1. `Seam`
2. `the tools seam: one tool, and the action is its first field`
3. `6`
4. `Calls`
5. `The tool is a machine rather than a call: open declares the scope, insert and remove move files in and out, commit runs the table, state re-presents, and close settles.`
6. `batch_edit, action=open`; `Takes`:
   `the paths or globs, and the prepared searches and operations`; `Returns`:
   `the machine id, the held files with their versions, and a miss listed rather than guessed`
7. `batch_edit, action=insert`; `the machine id, and more paths or globs`;
   `the same machine with the files added, and the lease unchanged`
8. `batch_edit, action=remove`; `the machine id, and the files to drop`;
   `the machine without them, and one removed line per file`
9. `batch_edit, action=commit`; `the machine id, the transition table, and an optional opfile`;
   `one outcome per file, or the typed job id when the inline deadline passes`
10. `batch_edit, action=state`; `the machine id`; `every held file, its state, and its version`
11. `batch_edit, action=close`; `the machine id`;
    `the machine closed, after the in-flight files settle`
12. `The held file's states are the flow below: observed, running, done, errored, and halted, with an external touch halting the file rather than being overwritten.`

`plugin-dsh-cost`:

1. `Seam`
2. `the commands service: one command, five verbs, and no model-visible surface`
3. `5`
4. `Calls`
5. `None of the five is a tool, and none enters the model context: a command renders its text outside the history.`
6. `/cost report`; `a scope: file, project, client, model, or session; and one UTC day`;
   `the rollup rows for that scope, or for the whole ledger when no day is named`
7. `/cost export`; `csv, json, or markdown, and an optional path`;
   `the bundle written, and the number of rows it carried`
8. `/cost annotate`; `an optional path, or every file the project knows`;
   `written or skipped per file, with the reason`
9. `/cost assess`; `an optional session`;
   `the spend bucketed as delivered, explored, reverted, overhead, and carry, with the cost per surviving line`
10. `/cost forecast`; `a day count, thirty by default`;
    `the daily rate per scope and key, projected with its confidence band`
11. `The ledger behind the verbs is one SQLite file: the effective-dated prices, the call and touch grain, the allocations, the day rollup, and the views the five verbs read.`

`plugin-dsh-cost-analysis`:

1. `Seam`
2. `the commands service: one command, over a ledger opened read-only`
3. `1`
4. `Calls`
5. `The plugin never writes a row, never creates a table, and registers no listener: the ledger keeps recording facts, and the judgement lives here.`
6. `/analysis`; `a scope: file, project, client, model, or session`;
   `the metric rows of the enabled families, or the empty-ledger line when the scope has none`
7. `The ledger plugin already owns the cost name, so this half registers analysis; the five families it renders are credit, effectiveness, lines, overhead, and cache.`

`plugin-dsh-normalize-file`:

1. `Seam`
2. `the tools seam for the file call, and the commands service for the one-shot overpass`
3. `2`
4. `Calls`
5. `One agent-chosen file per call: the tool reads, applies the family's six transforms with a count, and writes only when the count is above zero.`
6. `normalize-file`; `a path`;
   `the count and the fresh version, or the unchanged result when the count is zero`
7. `normalize-overpass`; `files, batch, results on or off, or scopes`;
   `the one-shot arm, armed for the next tool result or the next step`
8. `The six transforms are the dash, quote, ellipsis, space, invisible, and fullwidth tables, which is the same chain raw-write applies under its normalize flag.`

`plugin-dsh-workspace`:

1. `Seam`
2. `the tools seam: five tools over the graph, four of them reads`
3. `5`
4. `Calls`
5. `Every tool returns a compact table plus ids, never a file body, and the one tool that changes anything is the index trigger.`
6. `workspace_map`; `a path or module prefix, and a depth`;
   `the modules with their roles, the file count, the entry points, and the hot symbols`
7. `workspace_find`; `a name or pattern, a kind, and a limit`;
   `the matching nodes with id, path, span, and kind, and a cursor for the next page`
8. `workspace_expand`; `a node id, edge kinds, and a depth`;
   `the connected nodes and edges, and the kinds that are deferred`
9. `workspace_context`; `a node id or a query, and a token budget`;
   `the orientation packet, its eight sections, and its version`
10. `workspace_index`; `a path, and a file bound`;
    `the walk's counts: indexed, skipped, failed, and files`
11. `The index trigger runs first when the graph is empty: a map over an unindexed workspace reports zero files, honestly.`

## The layout

```
+----------------------------------------------------------------------+
| TOOL                                                                 |
| the seam, the count, and one plate per call                          |
+----------------------------------------------------------------------+
| SEAM   the seam sentence, mono, small        |        6  CALLS       |
+----------------------------------------------------------------------+
| RULE   one sentence, the measure                                     |
+----------------------------------------------------------------------+
| +----------------------------------------------------------------+   |
| | ENTRY PLATE, both tracks                                       |   |
| | name mono, accent                                              |   |
| | Takes .....................  Returns .....................     |   |
| +----------------------------------------------------------------+   |
| +------------------------------+  +------------------------------+   |
| | plate, one track             |  | plate, one track             |   |
| | Takes ....                   |  | Takes ....                   |   |
| | Returns ..                   |  | Returns ..                   |   |
| +------------------------------+  +------------------------------+   |
| +------------------------------+  +------------------------------+   |
| | plate                        |  | plate                        |   |
| | Takes ....                   |  | Takes ....                   |   |
| | Returns ..                   |  | Returns ..                   |   |
| +------------------------------+  +------------------------------+   |
| +------------------------------+                                     |
| | plate, alone                 |                                     |
| | the sixth call, alone        |                                     |
| +------------------------------+                                     |
+----------------------------------------------------------------------+
| NOTE   one paragraph, above a hairline, the measure                  |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The plates sit on two equal tracks, so five calls make an entry plate, two
rows of two, and a final plate alone; the entry spans both tracks and is the only accent face on the
shape. The band puts the seam at the left and the count at the right on one baseline, and the rule
and the note both cap at the measure so a long sentence does not run the full width.

## The machines

Tool adds the callable surface. Flow says what the package does to what passes, Service says what it
provides to other plugins, and this says what a caller can type and what comes back.

| Neighbour on the same page | What it already says                        | What Tool must not say                                                                        |
| -------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Flow                       | the order the package's work happens in     | the calls as stages                                                                           |
| Service                    | the methods a consumer calls on the context | the same names as a contract. A tool is called by the model; a service is called by a plugin. |
| Surface                    | every registration the README documents     | the calls again as surface rows                                                               |
| Configuration              | the knobs the tool reads                    | a take or a return as a knob                                                                  |

The seam is a field rather than a constant because the family registers two kinds of callable. A
model-facing tool is registered on the tools seam; the cost family's surface is five verbs on the
commands service, which the README says is not a tool and never enters the model context. Printing a
command as a tool would be a lie a reader would catch, so the register names its own seam.

When the record is absent the machine renders nothing, so a portrait with a shape of tool and no
register shows no band. There is no placeholder.

## The decisions

| Decision                                 | The alternative rejected                        | Why                                                                                                                                                                        |
| ---------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A field of plates                        | A table with column heads                       | A call's takes and returns are sentences, not cells. In a table the longest sentence would set the column and the other four calls would read as short rows.               |
| The first call is the entry plate        | Six equal plates                                | The register has an entry: the call a caller meets first, and in the batch edit's case the one that opens the machine. Marking it is the register's own claim about order. |
| The entry takes the accent face          | Marking the entry with a badge                  | The accent face is the loudest surface on the shape, and the entry is the one call that deserves it. A badge would add a word to a name that already carries the action.   |
| The seam is a field                      | The constant `the tools seam`                   | The cost family's five verbs are commands, not tools. A constant would print a false seam on three of the five pages the machine is mounted on.                            |
| Two tracks, one under 720px              | One column always                               | The register is compared, and comparison wants the plates side by side. Under 720px the comparison is lost anyway, so the track collapses.                                 |
| The note is a paragraph under the plates | A seventh plate                                 | The note is about the register, not about one call. As a plate it would compete with the calls for the same grammar.                                                       |
| The hover rule only                      | A selected state on a plate                     | Nothing on the page is selectable and the site cannot invoke the tool. The rule says the call is addressable; a selection would promise a result.                          |
| The call count is the length of the list | A transcribed figure per package                | Two figures that can disagree will disagree. The band's count is `Call.length`, so the number and the plates are the same fact.                                            |
| The action is part of the name           | One plate per action, with the action as a fact | The action is the first field of the call and the tool is one tool. Splitting the name would print six tools where the source registers one.                               |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on five package pages inside the portrait section:
`/package/plugin-dsh-batch-edit`, `/package/plugin-dsh-cost`, `/package/plugin-dsh-cost-analysis`,
`/package/plugin-dsh-normalize-file`, and `/package/plugin-dsh-workspace`. The page that proves the
entry plate is the batch edit's, because its six calls make the entry span and the remaining five
fill the tracks.

What is not drawn yet: the argument schemas the harness admits, which are the tool definitions
rather than the calls, and the batch edit's typed job id path, which is one clause inside the commit
plate's return rather than a fork of its own.
