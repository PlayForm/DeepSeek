# Constellation

## The claim

One event at the centre and one dot per listener on a ring: the breadth is read before the names,
because the count is the ring's caption and the dots fill the circle beneath it. The machine answers
the seam page's first question, which is how many hands answer here, before the page asks who they
are.

The machine answers: **how many hands answer at this seam, and which of them are documented?**

## The sources

| Source | What was taken |
| --- | --- |
| `Site/Source/Component/Constellation.astro` | The geometry as arithmetic: centre 50, radius 36, a 40 degree gap, the arc from -70 to 250 degrees, an even step between listeners, one listener at 90 degrees, and the dot's title. |
| `Site/Source/Stylesheet/Component/Constellation.scss` | The surface: a square plot at a 420px maximum, the ring at a 14% inset, the count at 18%, the source dot at the centre, the event label at 58%, a 7px dot with a 19px hit area, and a hollow dot for an undocumented listener. |
| `Site/Source/Content/Behavior.ts` | The listeners and their effects: thirty hooks across seven seams. The mounted instance is the ten at `tools/post-execute`. |
| `Site/Source/Content/Hook.ts` | The derived seam to family map, so the ring and the table below it read the same records. |
| `Site/Source/pages/behavior/[seam].astro` | The mount: the `Fan` section, with the lede `One event, many hands. The same listener list the table below details, drawn as the dispatch it is.`, above the `Fanout` list. |
| `Temporary/Corca/Curated/Components.md` | The rule that a visible mark is small and its hit area is larger, and the chip's scale for a label. The 7px dot and the 19px target are that rule. |
| `Temporary/component-page-composition-recipes.json` | M17.R05, selected neighborhood: the selected object, the relations that touch it, and the unrelated topology muted but inspectable. The ring is that idea with every relation equally close. |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/dot-plot.tsx` | One dot per value, one value per column, in order. The ring is that grammar bent into a circle, with the index as the angle. |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/radial-gauge.tsx` | The ring with a start angle and a sweep, which is the geometry the constellation refuses: the ring here is a list, not a measure, so it has no filled arc. |

The borrow is a mechanic (a fan-out drawn as positions rather than bars), a geometry (a ring with a
reserved arc for its caption), and a state model (a listener is documented or an arm, and the dot's
fill says which).

## The copy

The section that mounts it prints `Fan` and `One event, many hands. The same listener list the table
below details, drawn as the dispatch it is.`

The machine prints, in order:

1. `tools/post-execute: one event, 10 listener, one dot each on the ring` (the figure's label, for assistive technology)
2. `10 listener`
3. `tools/post-execute`
4. ten dot titles, in the order the records list them: `hook-dsh-ccr: rewrite`, `hook-dsh-comment-filter: rewrite`, `hook-dsh-convention-suggester: advise`, `hook-dsh-doc-suggester: advise`, `hook-dsh-edit-suggester: advise`, `hook-dsh-graph-suggester: advise`, `hook-dsh-replay-suggester: advise`, `hook-dsh-search-suggester: advise`, `hook-dsh-test-suggester: advise`, `hook-dsh-tool-coach: advise`

A dot whose listener is not documented prints its title with the word ` arm` appended, and is drawn
hollow. The seam page passes no undocumented listener today, so no title on it carries the suffix;
the state exists in the machine and is exercised by the library preview.

The count prints the singular unit `listener` at every size, and the `Fanout` list below prints the
same string from its own file. The storyboard records the string as it appears.

## The layout

```
+----------------------------------------------------------------------+
| CONSTELLATION                                                        |
| one event, every listener, one dot each                              |
+----------------------------------------------------------------------+
|                             10 listener                              |
|                              o     o     o                           |
|                    o                               o                 |
|                  o                 +                 o               |
|                    o     tools/post-execute        o                 |
|                              o     o     o                           |
|  ring at 36 percent, 7px dots, 19px target                           |
+----------------------------------------------------------------------+
| a square plot, 420px maximum, the ring keeps its shape at any width  |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The plot is a square, capped at 420px, so the ring is a circle at every
width; the count sits in the arc the dots leave at the top, the source dot at the centre, and the
event label just under it. Ten dots sit on the arc from -70 to 250 degrees, forty degrees short of a
full circle, so the top of the ring stays empty for the count.

## The machines

Constellation adds breadth. Every other machine on the seam page is a list; this is the only one
that says how long the list is before the reader reads it.

| Neighbour on the same page | What it already says | What Constellation must not say |
| --- | --- | --- |
| Fanout | the same listeners, with their links, as a spine | the dot's identity as a link. The ring has no room for ten links; the list below is where a reader clicks. |
| Hook | every hook at the seam, with its effect and configuration | the configuration as a second ring |
| Default | what the harness does at the seam alone | the harness's own listeners as dots |
| Table | every seam in the repository | a second ring for a second seam |

When the seam has one listener, the machine puts it at 90 degrees rather than at the top, because
the count and the event label already occupy the top and the centre. When the record is absent the
section still renders, with an empty ring and a count of zero, because a seam with no listener is a
fact the page should state.

## The decisions

| Decision | The alternative rejected | Why |
| --- | --- | --- |
| A ring | A bar chart of listeners per seam | The question is breadth and identity at one seam, not magnitude across seams. A bar chart would compare seams, and the page is about one. |
| The dots leave the top to the count | Dots starting at twelve o'clock | The count is the ring's caption and the first fact a reader needs. Starting at the top would put a dot in the caption's seat. |
| A 40 degree gap | A full circle | A dot at the top would collide with the count at 18%. The gap is the caption's room, and it is the same gap on both sides so the ring reads as symmetric. |
| A single listener sits at 90 degrees | A single listener at the start angle | One dot at the top would sit under the count. At the bottom it is alone and legible, and the event label above it still names the seam. |
| Percentages, not an SVG viewBox | An SVG with a fixed coordinate space | A viewBox scales the labels with the drawing, so a narrow screen would shrink the type below the site's scale. Percentages keep the type size and let the geometry follow the width. |
| A 7px dot with a 19px hit area | A 14px dot | A larger dot turns the ring into a pie chart and invites a share reading the machine does not have. The visible mark stays small and the target is large. |
| An undocumented listener is hollow | The same dot for every listener | The page's table marks an arm as a listener the source registers without documenting it. The ring has to agree with the table below it, and the fill is the only channel the dot has. |
| The dot's identity is a title | A label beside every dot | Ten labels on a ring would overlap at any width. The title gives the name on hover and the fan-out below gives it in a line. |
| The unit is one string, `listener` | A pluralized unit at counts above one | The machine has no branch for the plural, and `Fanout` prints the same string. The cost is visible at ten listeners, and fixing it is a site-wide change rather than this machine's decision. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on the seven seam pages, inside the `Fan` section, above the `Fanout`
list: `/behavior/llm-stream`, `/behavior/system-prompt-assemble`, `/behavior/tools-pre-execute`,
`/behavior/tools-post-execute`, `/behavior/fs-observed`, `/behavior/batch-proposed`, and
`/behavior/agent-status`. The page that proves the fullest ring is `tools/post-execute`, with ten
listeners.

What is not drawn yet: the arms. The seam page's `Hook` list is derived from the behavior records,
which do not carry an arm flag, so every dot on a seam page is filled even where the table below adds
an arm the README does not document. The hollow state exists and the library preview exercises it;
the seam page does not yet pass it.
