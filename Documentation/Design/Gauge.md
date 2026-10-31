# Gauge

## The claim

One quantity against its ceiling, drawn as a semicircle: the accent arc is the value's share, the
line colour is the remainder, and the number in the middle is the caller's own figure rather than
the clamped ratio. The ceiling is named below the arc, so the picture states both numbers without a
legend.

The machine answers: **how much of the ceiling does this quantity use?**

## The sources

| Source                                                                          | What was taken                                                                                                                                                                                          |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Site/Source/Component/Gauge.astro`                                             | The semicircle arithmetic (centre 130, baseline 128, radius 96), the clamped ratio, the two arc paths, the readout, the foot with the ceiling and the note, and the `meter` role with its three values. |
| `Site/Source/Stylesheet/Component/Gauge.scss`                                   | The geometry: a 280px maximum plot, a 12px stroke, the readout at 38% of the plot, the value at the second display size, and a foot above a hairline with the ceiling and the note centred.             |
| `Site/Source/pages/tutorial.astro`                                              | The mount: the `Measure` section, beside the `Curve` chart, with `Curve.Threshold` as the value, `Curve.Ceiling` as the ceiling, the label `The threshold`, and the note computed by the page.          |
| `Site/Source/Content/Curve.ts`                                                  | The two numbers the mounted instance prints: `1024` for the gate and `102400` for the ceiling, both from the compressor's README.                                                                       |
| `Site/Source/Library/Preview.astro`                                             | The three states the library draws: under the ceiling, at the ceiling, and over it, with the note that the arc clamps and the readout does not.                                                         |
| `Temporary/Corca/Curated/Components.md`                                         | The chip and the small label: a small mono figure beside a label, no shadow, no radius language of its own. The foot is that grammar.                                                                   |
| `Temporary/component-page-composition-recipes.json`                             | M14, readiness evidence: a quantity stated against the bound it must satisfy. The gauge is that recipe as one arc.                                                                                      |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/radial-gauge.tsx`    | The arc with a start angle, a sweep, a thickness, and named zones. The site borrows the sweep and the thickness and refuses the zones, because the compressor's README names one ceiling and no bands.  |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/segmented-meter.tsx` | The meter as segments with labels, which the gauge refuses: a semicircle with one boundary is the honest shape for one ceiling.                                                                         |

The borrow is a mechanic (a share drawn as an arc), a geometry (a semicircle with the figure in the
hollow), and a state model (under, at, and over the ceiling, where over is drawn clamped and printed
true).

## The copy

The section that mounts it prints `Measure` and
`The one number the site can measure without a live run: how much of a tool result reaches the model, and where the two curves part.`

The machine prints, in order:

1. `1 KB` (the value)
2. `The threshold` (the label)
3. `ceiling` (the foot's label)
4. `100 KB` (the ceiling)
5. `1.0% of the ceiling` (the note, composed by the page)
6. `The threshold` (the meter's label, for assistive technology)
7. `1 KB of 100 KB` (the meter's value text)

The machine's own fixed strings are the three units it can print, `B`, `KB`, and `MB`, the word `of`
between the two figures in the value text, and the label `ceiling`. The figures and the note are the
caller's, and the three states in the library print:

1. `20 KB` of `100 KB`, label `Bytes the model reads`, note `Above the 1 KB gate, below the ceiling`
2. `100 KB` of `100 KB`, label `Bytes the model reads`, no note
3. `128 KB` of `100 KB`, label `Bytes the model reads`, note `The arc clamps; the readout does not`

The machine prints no percentage of its own. The note on the tutorial page is a string the page
composes, and the storyboard records it as the page's copy rather than the machine's.

## The layout

```
+----------------------------------------------------------------------+
| GAUGE                                                                |
| one quantity, one ceiling, one semicircle                            |
+----------------------------------------------------------------------+
|                    +--------------------------+                      |
|               +----+                          +----+                 |
|            +--+                                    +--+              |
|          +-+        1 KB                              +-+            |
|         |           The threshold                       |            |
|         +-----------------------------------------------+            |
|             arc 12px, radius 96, a 260 by 150 box                    |
+----------------------------------------------------------------------+
|                          ceiling  100 KB                             |
|                    1.0% of the ceiling                               |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The plot is capped at 280px and the arc is drawn in a 260 by 150 box, so
the semicircle keeps its proportions; the readout sits at 38% of the plot height, inside the hollow
of the arc, and the foot is a centred column under a hairline. The remainder arc is drawn first and
the fill over it, so a value of zero still leaves the full track visible.

## The machines

Gauge adds the ceiling. `Cascade` says where a share of a call goes, `StatBand` says how many of
something there are, and this is the only machine that puts a quantity against a bound.

| Neighbour on the same page | What it already says                              | What Gauge must not say       |
| -------------------------- | ------------------------------------------------- | ----------------------------- |
| Curve                      | the two curves of bytes read, as the result grows | a second curve inside the arc |
| StatBand                   | counts with notes                                 | the quantity as a count       |
| Scenario                   | the three moments, each with its property         | the property as a measure     |
| Table                      | the knobs and their defaults                      | the ceiling as a default      |

When the ceiling is zero or negative the ratio is zero and the machine draws the remainder only,
which is the honest shape for a bound it cannot divide by.

## The decisions

| Decision                             | The alternative rejected                                 | Why                                                                                                                                                                     |
| ------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A semicircle                         | A full ring                                              | A share of a ceiling reads as a fraction of a half. A full ring invites a share of a whole, which is a different claim, and the hollow centre is where the figure goes. |
| No zones on the arc                  | The registry's named zones                               | The compressor's README names one ceiling and no bands. Zones would be a scale the source does not have, and a reader would read a verdict the page never made.         |
| The value is printed in the middle   | A tooltip or a legend                                    | The number is the point of the machine. A tooltip would hide it behind a hover and a legend would put it outside the picture.                                           |
| The arc clamps, the readout does not | Clamping both                                            | The over-ceiling state has to show the true quantity, `128 KB`, while the arc stays full. Clamping the readout would hide the overshoot the state exists to show.       |
| The ceiling is named below the arc   | A second arc for the ceiling                             | Two arcs would double the ink for one ratio. A named figure under the picture states the bound in the same glance.                                                      |
| The unit follows the size            | Printing bytes always                                    | `102400 B` is a number a reader has to convert. The unit is chosen from the magnitude, and the decimal appears only when the division is not exact.                     |
| The machine computes no percentage   | Printing `1.0% of the ceiling` from inside the component | The percentage is a sentence about the data, and the page that owns the data owns the sentence. The machine stays a meter, and the note is a prop.                      |
| `role="meter"` with three values     | `role="img"` with a label                                | A meter is the correct semantics for a quantity against a bound, and the values make the figure readable to assistive technology without reading the arc.               |
| No tick marks on the arc             | Ticks at a quarter, a half, and three quarters           | The only boundary the data has is the ceiling. Ticks would invent three more, and the machine would look like a scale it is not.                                        |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on `/tutorial`, inside the `Measure` section, beside the `Curve` chart,
and on the dev component route `/library/gauge` with three states. The page that proves the mounted
instance is the tutorial, where the gate is drawn against the ceiling it sits under.

What is not drawn yet: a second threshold. The tutorial compares the `1 KB` gate to the `100 KB`
ceiling, and the sentence that explains the gap between them is the note rather than a mark on the
arc. A reader who wants to see both bounds at once gets one arc and a sentence.
