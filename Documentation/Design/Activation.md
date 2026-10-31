# Activation

## The claim

Every plugin of this family says one sentence when it loads, and the sentence is a template with
three rules. The machine draws the template once, states the rules that decide how a pair renders,
and then prints the exact lines four packages compose from it, so a reader can check the rules
against the strings rather than against a description of them.

The machine answers: **what does a plugin write when it activates, and which pairs did its source
leave out?**

## The sources

| Source | What was taken |
| --- | --- |
| `Site/Source/Component/Activation.astro` | The order: the template, the three rules as a definition list, the variants as an ordered list. The rule rows and the case rows are the component's own two lists, and `LineOf` builds every printed line. |
| `Site/Source/Stylesheet/Component/Activation.scss` | The geometry: the template as an inset mono band at the large type size, the rule row as `minmax(120px, 160px)` plus the body, the case as a slug label above a mono line at the small size, and `overflow-wrap: anywhere` so a long log path wraps instead of widening the page. |
| `Site/Source/Content/Activation.ts` | The three rules in the composer's own order, the four field lists, the ten slugs whose `Apply.ts` writes a line, and `LineOf`, which is the composer's rules written once so the page cannot disagree with the source. |
| `Classic/packages/lib-dsh-core/Source/Function/Activate.ts` | The composer the template belongs to: the `activated (...)` shape, the absent-field skip, the bare segment, and the empty string as a value. |
| `Site/Source/pages/package/[slug].astro` | The mount: an `Activation` section gated on `ActivationData.Slug.includes(Entry.Slug)`, with the lede quoted below. |
| `Temporary/Corca/Curated/Components.md` | The palette chip: mono, a small type size, an accent glyph on an accent-soft face. The template's slots are that chip, not a placeholder glyph. |
| `Temporary/component-page-composition-recipes.json` | M19.R01, term specimen: a visible specimen, its exact meaning, its supported fields, and its source. The band is that recipe with the source named in the history instead of on the page. |

The borrow is a mechanic (a specimen, then the rules that produce it, then the specimens the rules
produce), a geometry (a fixed label track and a wrapping mono body), and a state model (a pair is
absent, bare, or present, and the composer decides which).

## The copy

The section that mounts it prints `Activation` and `The one line this package writes when it loads,
as a template and as the strings the source composes from it.`

The machine prints, in order:

Template:

1. `activated (k1=v1, k2=v2, ...)`

Rules:

2. `absent field`
3. `A pair whose value is undefined is skipped, so a flavor with no replacement simply omits the pair.`
4. `bare segment`
5. `A pair with an empty key renders its value alone, which is how the governance trio leads with its flavor word.`
6. `present field`
7. `An empty string is a value, not an absence: the invisible flavor writes replacement= to say it removed the family.`

Variants:

8. `hook-dsh-normalize-quotes`
9. `activated (reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-quotes.log)`
10. `hook-dsh-normalize-invisible`
11. `activated (replacement=, reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-invisible.log)`
12. `hook-dsh-package-governor`
13. `activated (anywhere mode, logFile=~/.dsh/hook-dsh-package-governor.log, updateMode=chain, ncuBin=ncu, exclude=[], policyFile=(discovery))`
14. `hook-dsh-package-pinner`
15. `activated (pinner, logFile=~/.dsh/hook-dsh-package-pinner.log, keep=[@types/*])`

The machine prints no figure. The number of variants is the length of a list, and the page does not
state it, so the storyboard does not either.

## The layout

```
+----------------------------------------------------------------------+
| ACTIVATION                                                           |
| one line, one template, three rules, four proofs                     |
+----------------------------------------------------------------------+
| TEMPLATE   inset band, mono, large type                              |
|            activated (k1=v1, k2=v2, ...)                             |
+----------------------------------------------------------------------+
| RULE       name track 120 to 160px, the rule beside it               |
| absent field     one row, one hairline                               |
| bare segment     one row, one hairline                               |
| present field    one row, one hairline                               |
+----------------------------------------------------------------------+
| VARIANT    one case per package, the slug above the line             |
| hook-dsh-normalize-quotes                                            |
|   activated (reasoning=on, toolArgs=off, logFile=...)                |
| hook-dsh-normalize-invisible                                         |
|   activated (replacement=, reasoning=on, toolArgs=off, ...)          |
| hook-dsh-package-governor                                            |
|   activated (anywhere mode, logFile=..., updateMode=chain, ...)      |
| hook-dsh-package-pinner                                              |
|   activated (pinner, logFile=..., keep=[@types/*])                   |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The template band is one line and takes the inset face; the rules are a
two-track grid with a 120 to 160px label; the variants are a single column, because the line is long
and a second column would force the mono body to wrap at half the measure.

## The machines

Activation adds the one thing no other machine on the package page draws: the words a package
prints at load. Flow says what the work is, Scheme says when the plugin may act, and this says what
it announced on the way in.

| Neighbour on the same page | What it already says | What Activation must not say |
| --- | --- | --- |
| Flow | the order of the work | the load line as a stage of the flow |
| Scheme | the laws that decide whether the plugin acts | the field list of the line |
| Configuration | the knobs the README documents, with defaults | the same fields again as pairs. The line shows the values one package passes; the table shows every knob and its default. |
| Install | the command that installs the package | the confirmation a reader looks for after the install |

When the package is not in the slug list the section is not rendered, so a package with no composer
call shows no line and no empty band.

## The decisions

| Decision | The alternative rejected | Why |
| --- | --- | --- |
| The template comes first | The variants first, then the rules | The shape has to be known before the proof reads as proof. One line of shape and then four lines of evidence is the order a reader can check; four lines first would be four facts with no frame. |
| Four variants, though ten packages write a line | Deriving the other six lines from their READMEs | A README quotes a line, not the field list the composer was handed. Deriving would invent the pairs, and the page would print a string the source does not compose. |
| The empty string prints as `replacement=` | Skipping an empty value, the way an undefined one is skipped | The invisible flavor's whole claim is that it removed the family, and the bare key is how the composer says so. Skipping it would erase the one rule the third entry exists to explain. |
| The bare segment prints its value alone | Printing `=anywhere mode` | The source passes an empty key, and the composer's second rule is exactly that case. The page shows what the rule produces, not what a tidier template would. |
| The rules are three prose rows | A key and value table of the composer's options | The rules are about absence and presence, and a table has a cell for every row. A cell cannot be absent, so the table would have to show an empty one and the point would be lost. |
| The line is one mono colour | Highlighting the keys and the values differently | A reader compares the four strings character by character. Colour would rank the pairs and pull the eye to the longest line, which is not the interesting one. |
| The template's slots take the accent-soft chip | A placeholder glyph such as `k1` | The source writes `k1=v1`, and a brace would be a syntax the composer does not have. The chip marks a slot without changing the string. |
| The section is gated on a slug list | Rendering an empty band on every package page | An empty activation band reads as a plugin that printed nothing, which would be a claim the page cannot support. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on the ten package pages whose `Apply.ts` calls the composer:
`hook-dsh-normalize-dash`, `hook-dsh-normalize-quotes`, `hook-dsh-normalize-ellipsis`,
`hook-dsh-normalize-spaces`, `hook-dsh-normalize-invisible`, `hook-dsh-normalize-fullwidth`,
`hook-dsh-package-governor`, `hook-dsh-package-pinner`, `hook-dsh-cargo-governor`, and
`hook-dsh-tool-coach`, inside the `Activation` section. The page that proves it is the governor's,
because its line is the longest and exercises the bare segment.

What is not drawn yet: the six lines the other packages compose, which the site does not transcribe,
and the log path's own default. The four variants are the ones whose field lists exist in the
content module; the other six are named by the gate and not shown, which is the honest state rather
than a complete one.
