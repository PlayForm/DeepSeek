# The Corpus

This file maps each corpus this repository carries to the mechanic a design pass takes from it, and
to what it must not take.

## The rule

Read the specimens as text, the HTML and the CSS, never the picture.

Name the mechanic in three words and take its measurement with it.

Take the mechanic, the measurement, and the state model; never the palette, the radius, the font, or
the shadow.

Read the site's own components before any foreign one, because the house grammar wins.

Write the take and the rejection per source before the band that uses it.

## The detail

| Corpus                                                         | Read it for                                                                                                                                        | Do not take                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `Temporary/Corca/Specimens/`                                   | The line and gutter, the paint-order band, the percentage track, the radio tabs, the current-row marker, the inspector.                            | The palette, the radii, the shadows, the display faces. |
| `Temporary/Corca/Curated/`                                     | The measured anatomy, the token mapping, the interaction model, the state walk, the trace model.                                                   | The token values.                                       |
| `Temporary/Corca/Compositions.md`                              | The operators and the anti-combinations.                                                                                                           | The frame.                                              |
| `Temporary/Flywheel/`                                          | The title band, the mode row, the two-world canvas, the three cards.                                                                               | The illustrative stamp's type.                          |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/`   | The geometry and the state models: waterfall rows, gauge arcs, timeline ticks, register rows, tree rows, log lines.                                | The component, the Tailwind class, the dependency.      |
| `~/Developer/Documentation/Module/ui/src/components/overtrue/` | Page-level arrangement.                                                                                                                            | The component.                                          |
| `Site/Source/Component/`, `Site/Source/Stylesheet/Component/`  | The house grammar: `Flow`'s disclosure and 2px edge, `Line`'s band and trap, `Lane`'s fill, `SessionRecord`'s current band, `CopyButton`'s island. | Nothing; extend it.                                     |
| `Documentation/Showcase/<slug>.md`                             | The sheet's claim, layout, machines, data, and history.                                                                                            | Nothing; it is the content pass's source.               |

The manual sheet's mechanics list, with its source: the paint-order band and the line (`Line.scss`,
`Specimens/Components.css`), the percentage track (`Specimens/Flow.html`, `Lane.scss`), the radio
tabs (`segmented-control.tsx`), the gutter (`Specimens/Session.html`), the current-row marker
(`tree-view.tsx`, `SessionRecord.scss`), the lamp (the site's registers), the spec strip
(`metric-group.tsx`), the ruled spine (`Flow.scss`), the display pair (`Specimens/Plugin.html`), the
disclosure (`Flow.astro`), and the copy island (`CopyButton.tsx`).

The rejections that matter: the pill radius (the site is square), the shadows and the blur (zero
elevation), the Geist and Peano faces (the site's type), the `oklch` palette (the site's tokens),
and the 720px measure for the mono tables (a seven-column track needs the sheet's full width).

The evidence is `Documentation/Design/Dissection-Design.md`, section 2, phase B, and
`Documentation/Design/Pass-Log.md`, Steps 1-13.
