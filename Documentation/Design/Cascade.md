# Cascade

## The claim

The stages of one call as shares of it, each bar starting where the one above it ended, so the
staircase is the order and the width is the share. The machine prints the cumulative point at the
end of each row, which is the only figure it has, and its caption says the widths are a share rather
than a measurement.

The machine answers: **where does the time in one call go, and how much of it does each step take?**

## The sources

| Source                                                                          | What was taken                                                                                                                                                                            |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Site/Source/Component/Cascade.astro`                                           | The head row, the stage list, the track and the bar, the elapsed figure, and the caption. `Left` and `Wide` clamp the drawing only; the elapsed value prints the caller's own arithmetic. |
| `Site/Source/Stylesheet/Component/Cascade.scss`                                 | The geometry: a three-track grid at `minmax(110px, 170px)`, the track, and a `56px` elapsed column; an 18px track; a bar with a 2px left edge in the accent; the head hidden under 720px. |
| `Site/Source/pages/harness.astro`                                               | The mount: the `Cascade` in the `The call` section, under the `Sequence` strip, with the authored `Timing` array and the four stages mapped from `Step`.                                  |
| `Site/Source/Content/ToolCall.ts`                                               | The four stages: the gate, the body, the result, and the record, with the seam each one dispatches at. The stage titles and the notes are that record's strings.                          |
| `Temporary/Corca/Curated/Components.md`                                         | The line's gutter and measure: a fixed label track outside the measure, a body that starts after it, a hairline between rows.                                                             |
| `Temporary/component-page-composition-recipes.json`                             | M04.R03, aligned worlds: shared stage coordinates and no duration claim from them. The cascade is that discipline applied to one call.                                                    |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/trace-waterfall.tsx` | The span row with a start, a duration, and a share of the whole. The cascade borrows the share and refuses the measured duration, because the source carries no clock.                    |

The borrow is a mechanic (a waterfall read as a staircase), a geometry (a fixed label track, a
flexible track, a fixed figure column), and a state model (a stage starts where the last ended, and
the cumulative point is the row's own fact).

## The copy

The section that mounts it prints `The call` and
`The model asks for a tool, and the harness decides 4 times: whether the call may run, what body runs, what the model reads back, and what is frozen as the record.`

The machine prints, in order:

1. `Stage`
2. `Share`
3. `Elapsed`
4. `The gate`
5. `tools/pre-execute`
6. `14% of the call` (the bar's title)
7. `14%`
8. `The body`
9. `tools/execute`
10. `56% of the call`
11. `70%`
12. `The result`
13. `tools/post-execute`
14. `22% of the call`
15. `92%`
16. `The record`
17. `tools/result`
18. `8% of the call`
19. `100%`
20. `Each bar starts where the one above it ended. The widths are a share of the call, not a measured duration.`

## The layout

```
+----------------------------------------------------------------------+
| CASCADE                                                              |
| one call, four stages, each bar starting where the last ended        |
+----------------------------------------------------------------------+
| STAGE 110 to 170px          | SHARE, flexible        | ELAPSED 56px  |
+-----------------------------+------------------------+---------------+
| The gate                    | [====            ]     |          14%  |
| tools/pre-execute           |                        |               |
+-----------------------------+------------------------+---------------+
| The body                    |      [=========  ]     |          70%  |
| tools/execute               |                        |               |
+-----------------------------+------------------------+---------------+
| The result                  |                [===]   |          92%  |
| tools/post-execute          |                        |               |
+-----------------------------+------------------------+---------------+
| The record                  |                  [=]   |         100%  |
| tools/result                |                        |               |
+-----------------------------+------------------------+---------------+
| CAPTION  a share of the call, not a measured duration                |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The label track is 110 to 170px and holds the stage and its seam, the
track takes the rest, and the elapsed column is 56px so the figures form a column at the right edge.
The bar is absolutely positioned inside the track at its `At` with its `Width`, so the staircase
comes from the data and not from a connector.

## The machines

Cascade adds the share. `Sequence` names the four decisions a call passes, `Flow` draws a package's
order, and this is the only machine that puts a proportion on a stage.

| Neighbour on the same page | What it already says                           | What Cascade must not say               |
| -------------------------- | ---------------------------------------------- | --------------------------------------- |
| Sequence                   | the four decisions the harness makes at a call | the decisions as a second set of stages |
| World                      | where the family intervenes in a turn          | the family's share of a call            |
| State                      | the call's life and its exits                  | the exits as stages                     |
| RoleList                   | the parts of the message                       | the message as a share                  |

When the caller passes no stage the machine renders an empty list and the caption, which is the
honest state for a call the page cannot measure.

## The decisions

| Decision                                | The alternative rejected                  | Why                                                                                                                                                             |
| --------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cumulative bars                         | Four bars from zero                       | The order is the claim. Bars from zero would compare four independent shares and lose the fact that each stage starts where the last one ended.                 |
| No connector between bars               | A waterfall connector line                | A connector would have to know the row height, and the CSS cannot. The staircase already reads as a cascade without one.                                        |
| The drawing clamps, the figure does not | Clamping both                             | A caller can overshoot a hundred percent, and the figure has to be the caller's arithmetic. Clamping it would hide the overshoot the caption warns about.       |
| The elapsed is `At` plus `Width`        | The duration alone                        | A reader wants the cumulative point: where the call has got to after this stage. The duration is already the bar's width and its title.                         |
| The widths are authored                 | Measuring the log                         | The log carries no clock. The caption says the widths are a share, and the harness page authors them beside the stages so the two cannot drift apart silently.  |
| The seam is the row's note, in mono     | The seam in the label                     | The label is the stage's name and the seam is its address. Two type faces keep the two facts apart, and the mono face is how the site sets an identifier.       |
| The head is hidden under 720px          | Keeping the head when the rows stack      | Under 720px the grid becomes one column, and the heads would name columns that no longer exist.                                                                 |
| The bar's title is the width            | A title naming the stage's seam           | The note already prints the seam. The title is the one place the width is stated as a phrase, so it states the share.                                           |
| The caption is always printed           | Printing it only when a caller overshoots | The caption is the machine's honesty about its own data, and it belongs to the shape rather than to a state. A reader should not have to overshoot to learn it. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on `/harness`, inside the `The call` section, under the `Sequence`
strip. The page that proves it is the harness page, and the data it draws is the four stages of
`Site/Source/Content/ToolCall.ts` with the authored `Timing` array beside them.

What is not drawn yet: a measured duration, which the machine deliberately refuses, and the approval
branch, which `ToolCall.ts` names as a branch of the gate rather than a fifth stage. The second is
the gap a reader would notice first, because the gate can return `ask` and the cascade has no row
for the prompt that follows.
