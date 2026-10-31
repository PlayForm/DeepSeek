# Family

## The claim

Seven comment syntaxes cover seventy-five extensions, and the count column is the sum of the chips
beside it, so the printed total cannot disagree with the rows. The machine is a matrix: the syntax
at the left, every extension it covers as a chip, the refinement beneath the chips when the family
has one, and a figure down the right edge that a reader can add up.

The machine answers: **which comment syntax does an extension use, and what refinement does that
family need?**

## The sources

| Source | What was taken |
| --- | --- |
| `Site/Source/Component/Family.astro` | The table: a hidden caption, three column heads, one row per family, a chip per extension, a note under the chips when the family has one, and a footer whose total is `Family.reduce` over the rows. |
| `Site/Source/Stylesheet/Component/Family.scss` | The geometry: `table-layout: fixed`, a 184px lead track (128px under 720px), an 84px count track (64px under 720px), a hairline between rows, an inset head and foot, and chips that wrap inside their cell. |
| `Site/Source/Content/Detail.ts` | The record: seven families, their extensions in the source's order, three refinements, and the four extensions the filter leaves alone. Transcribed from `Source/Function/Detect.ts`. |
| `Site/Source/pages/package/[slug].astro` | The mount: inside the `Detail` section, under the lede `The comment syntax the scanner knows, and the extensions it leaves alone.` |
| `Temporary/Corca/Curated/Components.md` | The chip: a hairline box, a small mono type size, no radius language of its own. The extension chips are that grammar at the table's own scale. |
| `Temporary/component-page-composition-recipes.json` | M02.R03, boundary matrix: the matrix as the shape for a rule that holds between two vocabularies. The families are that matrix with a count instead of a verdict. |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/detail-list.tsx` | The term and detail row: a lead track, a wider value track, and one hairline between rows. The family row is that geometry inside a table. |

The borrow is a mechanic (a matrix where one axis is a string and the other is a list), a geometry
(a fixed lead track and a wrapping body), and a state model (an extension belongs to exactly one
family, and the count is the length of the list).

## The copy

The section that mounts it prints `Detail` and `The comment syntax the scanner knows, and the
extensions it leaves alone.`

The machine prints, in order:

1. `The comment syntax families, the extensions each one covers, and the refinement each one needs` (the caption, visually hidden)
2. `Syntax`
3. `Extensions`
4. `Count`
5. `// + /* */`
6. the thirty-five chips: `ts`, `tsx`, `mts`, `cts`, `js`, `jsx`, `mjs`, `cjs`, `c`, `h`, `cc`, `cpp`, `cxx`, `hpp`, `hh`, `cs`, `java`, `kt`, `kts`, `swift`, `go`, `rs`, `scala`, `php`, `dart`, `css`, `scss`, `sass`, `less`, `proto`, `groovy`, `gradle`, `vue`, `svelte`, `zig`
7. `php also reads # and Scan refuses #[; cs also has @"..." verbatim strings; js, ts, go, vue and svelte have backtick template strings`
8. `35`
9. `#`
10. the twenty chips: `py`, `pyi`, `rb`, `sh`, `bash`, `zsh`, `fish`, `pl`, `pm`, `r`, `yml`, `yaml`, `toml`, `ini`, `cfg`, `conf`, `tf`, `hcl`, `nix`, `cmake`
11. `boundary-sensitive: # opens a comment only at the start of the line or after whitespace (YAML and TOML require it); rb also has the full-line =begin/=end block; py and pyi have triple-quoted docstrings`
12. `20`
13. `--`
14. the four chips: `sql`, `lua`, `hs`, `elm`
15. `lua has the --[[ ]] block; hs and elm have the {- -} block`
16. `4`
17. `;`
18. the five chips: `lisp`, `clj`, `cljs`, `scm`, `asm`
19. `5`
20. `%`
21. the four chips: `tex`, `erl`, `hrl`, `matlab`
22. `4`
23. `<!-- -->`
24. the six chips: `html`, `htm`, `xml`, `svg`, `xsl`, `plist`
25. `6`
26. `# + <# #>`
27. `ps1`
28. `1`
29. `All extensions`
30. `75`

The three families with no note print no note: the machine renders nothing where the record has no
`Note`, so the `;`, `%`, `<!-- -->`, and `# + <# #>` rows are chips and a count only.

## The layout

```
+----------------------------------------------------------------------+
| FAMILY                                                               |
| seven syntaxes, seventy-five extensions, one count per row           |
+----------------------------------------------------------------------+
| SYNTAX 184px      | EXTENSIONS, chips that wrap      | COUNT 84px    |
+-------------------+----------------------------------+---------------+
| // + /* */        | 35 chips, eight per line         |             35|
|                   | one note under the chips         |               |
+-------------------+----------------------------------+---------------+
| #                 | 20 chips                        |              20|
|                   | one note                         |               |
+-------------------+----------------------------------+---------------+
| --                | 4 chips                         |               4|
|                   | one note                         |               |
+-------------------+----------------------------------+---------------+
| ;                 | 5 chips                         |               5|
+-------------------+----------------------------------+---------------+
| %                 | 4 chips                         |               4|
+-------------------+----------------------------------+---------------+
| <!-- -->          | 6 chips                         |               6|
+-------------------+----------------------------------+---------------+
| # + <# #>         | 1 chip                          |               1|
+-------------------+----------------------------------+---------------+
| All extensions    |                                 |              75|
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The lead track is 184px and the count track 84px, both fixed, so the
extensions get every column the other two do not take; under 720px the lead drops to 128px and the
count to 64px, and the chips wrap one or two per line. The table is `table-layout: fixed` because
one row holds thirty-five chips and auto layout would let that row set the width of the other six.

## The machines

Family adds the matrix: the site's only table whose axis is a language feature rather than a
package. It is the machine that makes the comment filter's scope legible before the reader meets the
four extensions the filter refuses.

| Neighbour on the same page | What it already says | What Family must not say |
| --- | --- | --- |
| Absent | the four extensions the filter leaves alone, and why | the same four as chips with no row |
| Flow | the scanner's order of work | the family as a step |
| Surface | the listeners the package registers | the syntax table again as a surface |
| Table | a generic three-column table with a caption | a second copy of this matrix under a generic head |

When the record is absent the section is not rendered, and the page falls back to its own sections
rather than printing an empty table.

## The decisions

| Decision | The alternative rejected | Why |
| --- | --- | --- |
| A table with a fixed lead and a fixed count track | One wrapped field of seventy-five chips | A field loses the two facts the reader came for: which syntax a chip belongs to, and how many chips a family has. The count column is the machine's whole arithmetic. |
| The refinement sits under the chips | A fourth column for the note | The notes are prose, and a fourth column would set the table's width from the longest one, starving the chips. Under the chips, a note takes the width the row already has. |
| The total is a `reduce` over the rows | A transcribed total of 75 | Two figures that can disagree will disagree. The footer is the length of the data, so the printed total is the sum by construction. |
| `table-layout: fixed` | Auto layout | The row with thirty-five chips would set the width of every other row, and the syntax column would be as wide as the longest chip run. Fixed tracks make the matrix stable across families. |
| The chips wrap inside the cell | A scrolling cell | A family with thirty-five extensions would hide two thirds of them behind a scrollbar the reader has no reason to expect. A row that grows is the honest shape for a list that long. |
| One ink for every chip | A hue per family | A hue would imply a grouping or an order the source does not have. The syntax string is already the grouping, and the site spends its accent elsewhere on this page. |
| The counts are right-aligned | Left-aligned figures | A column of figures with different digit lengths only reads as a column when the digits are right-aligned. The head, the rows, and the total share that edge. |
| The caption is visually hidden | A visible caption | The section lede already says what the table is. A visible caption would print the same sentence twice, once in the prose and once in the table. |
| The note is one cell, not a rowspan | A note row under the family | A rowspan would put the note in the syntax track, where it would read as a second syntax. It belongs to the extension cell, because it refines the extensions. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on `/package/hook-dsh-comment-filter`, inside the `Detail` section,
above the `Absent` panel. The page that proves it is that package page, and the record it draws is
the `Syntax` entry of `Site/Source/Content/Detail.ts`.

What is not drawn yet: the boundary rule that makes `#` context-sensitive is one clause inside a
note rather than a column of its own, and the twin `ets-hook-dsh-comment-filter` reads the same
record through the `ets-` prefix, so its page shows this matrix without a second transcription. The
four absent extensions are the next machine down the page, not a state of this one.
