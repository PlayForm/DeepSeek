# Ribbon

## The claim

A band of labelled positions with one mark per event, and a bracket over the window the marks
occupy. The machine says where a run's events landed on a labelled band, and how much of the band the
run used, without claiming a clock it does not have.

The machine answers: **where in the turn did the events land, and how much of the band did the run
occupy?**

## The sources

| Source | What was taken |
| --- | --- |
| `Site/Source/Component/Ribbon.astro` | The band, the axis, the ticks, the marks, the window bracket, and the caption. The window is derived: its left edge is the first mark's position and its right edge the last, and a band whose marks reach both ends selects the whole band. |
| `Site/Source/Stylesheet/Component/Ribbon.scss` | The geometry: a 120px plot, a 24px band at 54px, the axis at 66px, the window bracket 8px tall at 36px with its label 18px above, the ticks at 78px, and a 7px mark at 66px with a 19px hit area. |
| `Site/Source/Component/Lane.astro` and `Site/Source/Content/Lane.ts` | The mechanic the machine borrows: a relative track, every position a percentage, an axis of labels under it. The ribbon is that mechanic with instants instead of spans. |
| `Site/Source/Library/Preview.astro` | The only mount, and the fixture it draws: four ticks from `turn/start` to `turn/end`, and four marks, one of them a warn. |
| `Site/Source/Library/Component.ts` | The registry entry: the two props, the three states (`Tick`, `Mark`, `Warn`), and the summary the dev route prints. |
| `Documentation/Component/README.md` | The composition the machine was built for: a session is a `Trace` plus `Lane`, `Ribbon`, and `Inspector`. The session page that would mount it is not composed. |
| `Temporary/Corca/Curated/Components.md` | The line band and the chip: a small mark on a relative track, a label under it, and a hit area larger than the mark. |
| `Temporary/component-page-composition-recipes.json` | M04.R05, incomplete recorded sequence: a start, events, a gap, a later event, with the missing end stated as incomplete rather than successful. The bracket is the honest version of that idea: it says what the band actually covers. |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/tick-bar.tsx` | The segmented bar with a fill and a formatted readout, which the ribbon refuses: the ribbon's marks are events, not a quantity, so there is no fill to complete. |

The borrow is a mechanic (positions on a labelled band), a geometry (a strip with an axis beneath
it), and a state model (a mark is ok or warn, and the window is the span the marks cover).

## The copy

The machine's only mount is the dev component route, so the copy below is the fixture the library
draws, and it is the copy a page would inherit.

The machine prints, in order:

1. `A band of 4 labelled tick: turn/start, step/start, step/end, turn/end; 4 event, with the bracket marking the window the marks occupy` (the figure's label, for assistive technology)
2. `4 event` (the window's label)
3. `turn/start`
4. `step/start`
5. `step/end`
6. `turn/end`
7. the four mark titles: `step/start`, `read`, `write`, `step/end`
8. `The bracket is the window the marks occupy; a warn mark is drawn in the caution colour.`

The third mark is the warn one. The count prints the singular unit `event` at every size, and the
storyboard records the string as it appears.

## The layout

```
+----------------------------------------------------------------------+
| RIBBON                                                               |
| a labelled band, one mark per event, the window bracketed            |
+----------------------------------------------------------------------+
|                          4 event                                     |
|        +---------------------------------------------+               |
|        |            the window bracket               |               |
|        +---------------------------------------------+               |
| +------------------------------------------------------------------+ |
| |                    the band, 24px, at 54px                       | |
| +------------------------------------------------------------------+ |
| |            |                         |                         |   |
| turn/start step/start               step/end              turn/end   |
|   o                o        o                             o          |
|  5%               30%      45%                           90%         |
+----------------------------------------------------------------------+
| CAPTION  the bracket is the window; a warn mark takes the caution    |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The plot is a 120px relative track; the band is a 24px strip at 54px and
the axis a hairline at 66px, so the marks sit on the axis rather than on the band's centre. The
window bracket floats 18px above the band with its label above that, and the ticks hang under the
axis with their labels at the small mono size. The fixture's positions are 0, 4, 12, and 20 for the
ticks and 1, 6, 9, and 18 for the marks, so the window runs from 5% to 90% of the band.

## The machines

Ribbon adds the instant. `Cascade` draws stages as shares of a call, `Lane` draws actors as spans,
and this draws single events as positions with a bracket around the run.

| Neighbour on the same page | What it already says | What Ribbon must not say |
| --- | --- | --- |
| Cascade | the stages of a call as cumulative shares | a duration per stage. A ribbon mark is an instant. |
| Lane | who was busy, when, and for how long | a second lane per actor |
| Constellation | how many listeners answer a seam | the listeners as marks |
| Flow | the order of the work | the work as positions on a band |

No content page mounts this machine today. The session page that the component documentation
describes as `Trace` plus `Lane` plus `Ribbon` plus `Inspector` is not composed, so the machine is
reachable only at `/library/ribbon`. That is a mount gap, not a design gap: the machine's own copy,
geometry, and states are complete.

## The decisions

| Decision | The alternative rejected | Why |
| --- | --- | --- |
| Positions are percentages of the band | An SVG with a fixed viewBox | A viewBox scales the labels with the drawing, so a narrow screen would shrink the tick labels below the site's type scale. Percentages keep the type size and let the strip follow the width. |
| The window is the span the marks occupy | A fixed window of the whole band | A run that fills a third of the band is the interesting case. A fixed window would print the same bracket for every run and say nothing. |
| The window's label is the mark count | The window's duration | There is no clock. The `At` values are positions on a band, not milliseconds, and a duration would be arithmetic on invented units. |
| A warn mark takes the caution colour | The accent colour | The accent belongs to the bracket, which is the machine's claim. A warn mark in the accent would compete with it, and the caution colour is the site's word for a fact that needs attention. |
| Marks are dots | Spans, as `Lane` draws them | The ribbon is about instants; `Lane` already draws spans and answers a different question. Two span machines on one page would be the duplicate the compound rule names. |
| The caption states the bracket and the warn colour | A legend with two entries | Two facts fit one sentence. A legend would add a row of chrome above a strip that is already only 120px tall. |
| The fixture is authored | Capturing a real turn | The site has no live run, and a captured log would bring a clock and a set of events that change with every session. The authored positions are the shape, and the caption does not claim time. |
| The machine was built before its page | Waiting for the session page to compose first | The strip is one of the three pictures the component documentation names for a session, and the geometry had to be decided against a real fixture. The library route is a mount, and it is the honest one until the session page exists. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted only on the dev component route, `/library/ribbon`, through
`Site/Source/Library/Preview.astro`, with a four-tick and four-mark fixture. No content page mounts
it, so there is no page that proves it in the shipped site; the library route is the page that
proves the geometry.

What is not drawn yet: the session page, which is the mount this machine was built for, and a real
clock, which the machine deliberately does not have. The first is the gap that matters, because a
machine reachable only from the dev route is a machine no reader meets.
