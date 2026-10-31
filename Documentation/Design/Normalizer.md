# Normalizer

## The claim

One family, one table, one law: the address arrives, the character becomes another, and the printed
count is the length of the rows. The band names the family and its size at display scale, the table
holds the address, the name, and the result, and the family's rule is one sentence beneath it.

The machine answers: **what does this flavor map, what does it become, and where does the address
come from?**

## The sources

| Source                                                                          | What was taken                                                                                                                                                                                      |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Site/Source/Component/Normalizer.astro`                                        | The band with the family and the tally, the five column heads, the arrow between the two glyph cells, the `removed` label for an empty result, the conditional name column, and the rule paragraph. |
| `Site/Source/Stylesheet/Component/Normalizer.scss`                              | The geometry: the family at the display size, the count at the largest mono size in the accent ink, 56px glyph cells (44px under 720px), a 1% arrow track, and the rule under a strong hairline.    |
| `Site/Source/Content/Table.ts`                                                  | The six records: the family name, one entry per code point with its name and its result, and the rule sentence. Transcribed from `lib-dsh-core/Source/Normalize`.                                   |
| `Site/Source/pages/package/[slug].astro`                                        | The mount: a `Table` section gated on `TableFor(Entry.Slug) !== undefined`, one page per normalize flavor.                                                                                          |
| `Temporary/Corca/Curated/Components.md`                                         | The table rules: no outer border, dividers drawn as hairlines, a chip's scale for the small type. The glyph cell borrows the card's inset face, not its radius.                                     |
| `Temporary/component-page-composition-recipes.json`                             | M19.R03, bounded playground: input, then the supported rule, then output, with no claim that the page ran anything. The table is that recipe as rows.                                               |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/trace-waterfall.tsx` | The span row at fixed columns with tabular figures, one row per fact. The address and name columns follow that discipline: a fixed address, a figure set in mono, one row per code point.           |

The borrow is a mechanic (a mapping table where both sides are visible at once), a geometry (a fixed
address column and a fixed glyph cell), and a state model (a code point maps to a character or to
nothing, and nothing has its own label).

## The copy

The section that mounts it prints `Table`.

The machine prints, for each family it is mounted with, in this order: the family name, the count,
the unit, the caption, the heads, one row per code point, and the rule.

Dash:

1. `Dash`
2. `24`
3. `code points`
4. `The Dash family: 24 code points, the character each one arrives as, the character it becomes, and its address.`
5. `Arrives`
6. `Maps to` (visually hidden, the arrow's head)
7. `Becomes`
8. `Code point`
9. `Name`
10. the twenty-four rows, in the source's order: `U+058A` Armenian hyphen becomes `-`; `U+05BE`
    Hebrew punctuation maqaf becomes `-`; `U+1400` Canadian syllabics hyphen becomes `-`; `U+1806`
    Mongolian todo soft hyphen becomes `-`; `U+2010` Hyphen becomes `-`; `U+2011` Non-breaking
    hyphen becomes `-`; `U+2012` Figure dash becomes `-`; `U+2013` En dash becomes `-`; `U+2014` Em
    dash becomes `-`; `U+2015` Horizontal bar becomes `-`; `U+2E17` Double oblique hyphen becomes
    `-`; `U+2E1A` Hyphen with diaeresis becomes `-`; `U+2E3A` Two-em dash becomes `-`; `U+2E3B`
    Three-em dash becomes `-`; `U+2E40` Double hyphen becomes `-`; `U+2E5D` Supplementary
    punctuation hyphen becomes `-`; `U+301C` Wave dash becomes `-`; `U+3030` Wavy dash becomes `-`;
    `U+30A0` Katakana-Hiragana double hyphen becomes `-`; `U+FE31` Presentation form for vertical em
    dash becomes `-`; `U+FE32` Presentation form for vertical en dash becomes `-`; `U+FE58` Small em
    dash becomes `-`; `U+FE63` Small hyphen-minus becomes `-`; `U+FF0D` Fullwidth hyphen-minus
    becomes `-`
11. `No context rule and no lookahead: every dash code point becomes the configured replacement, ASCII hyphen-minus by default, so a chunk boundary cannot change the result; an edit call, a raw-marked call, and a listed tool result pass by identity.`

Quotes:

1. `Quotes`
2. `8`
3. `code points`
4. `The Quotes family: 8 code points, the character each one arrives as, the character it becomes, and its address.`
5. the same five heads
6. the eight rows: `U+2018` Left single quotation mark becomes `'`; `U+2019` Right single quotation
   mark becomes `'`; `U+201A` Single low-9 quotation mark becomes `'`; `U+201B` Single
   high-reversed-9 quotation mark becomes `'`; `U+201C` Left double quotation mark becomes `"`;
   `U+201D` Right double quotation mark becomes `"`; `U+201E` Double low-9 quotation mark becomes
   `"`; `U+201F` Double high-reversed-9 quotation mark becomes `"`
7. `No context rule and no replacement knob: every typographic quote code point becomes its straight ASCII counterpart; an edit call, a raw-marked call, and a listed tool result pass by identity.`

Ellipsis:

1. `Ellipsis`
2. `1`
3. `code point`
4. `The Ellipsis family: 1 code point, the character each one arrives as, the character it becomes, and its address.`
5. the same five heads
6. `U+2026` Horizontal ellipsis becomes `...`
7. `No context rule: the horizontal ellipsis becomes the configured replacement, the ASCII three-dot sequence by default; an edit call, a raw-marked call, and a listed tool result pass by identity.`

Spaces:

1. `Spaces`
2. `16`
3. `code points`
4. `The Spaces family: 16 code points, the character each one arrives as, the character it becomes, and its address.`
5. the same five heads
6. the sixteen rows, each becoming a plain space: `U+00A0` No-break space; `U+1680` Ogham space
   mark; `U+2000` En quad; `U+2001` Em quad; `U+2002` En space; `U+2003` Em space; `U+2004`
   Three-per-em space; `U+2005` Four-per-em space; `U+2006` Six-per-em space; `U+2007` Figure space;
   `U+2008` Punctuation space; `U+2009` Thin space; `U+200A` Hair space; `U+202F` Narrow no-break
   space; `U+205F` Medium mathematical space; `U+3000` Ideographic space
7. `No context rule: every non-ASCII space in the Zs category becomes the configured replacement, the plain ASCII space by default; an edit call, a raw-marked call, and a listed tool result pass by identity.`

Invisible:

1. `Invisible`
2. `13`
3. `code points`
4. `The Invisible family: 13 code points, the character each one arrives as, the character it becomes, and its address.`
5. the same five heads
6. the thirteen rows, each printing `removed`: `U+00AD` Soft hyphen; `U+200B` Zero-width space;
   `U+200C` Zero-width non-joiner; `U+200D` Zero-width joiner; `U+200E` Left-to-right mark; `U+200F`
   Right-to-left mark; `U+202A` Left-to-right embedding; `U+202B` Right-to-left embedding; `U+202C`
   Pop directional formatting; `U+202D` Left-to-right override; `U+202E` Right-to-left override;
   `U+2060` Word joiner; `U+FEFF` Zero-width no-break space
7. `No context rule: every zero-width, joiner, bidi, and BOM code point is removed, because the replacement default is the empty string; an edit call, a raw-marked call, and a listed tool result pass by identity.`

Fullwidth:

1. `Fullwidth`
2. `94`
3. `code points`
4. `The Fullwidth family: 94 code points, the character each one arrives as, the character it becomes, and its address.`
5. four heads, because this family's source names no code point: `Arrives`, `Maps to`, `Becomes`,
   `Code point`
6. ninety-four rows, one per code point from `U+FF01` to `U+FF5E` inclusive, each becoming its ASCII
   counterpart: the block is contiguous, and the result is the code point minus `U+FEE0`
7. `No context rule and no replacement knob: the whole FULLWIDTH FORMS block maps one code point at a time to its ASCII counterpart; an edit call, a raw-marked call, and a listed tool result pass by identity.`

The arriving glyph is decoded from the address at render time and is not transcribed in this file,
because the storyboard is ASCII and the address is the fact. The result is transcribed where it is
ASCII; where the result is a space, the row says so, and where it is nothing, the row says
`removed`.

## The layout

```
+----------------------------------------------------------------------+
| NORMALIZER                                                           |
| one family, one table, one law                                       |
+----------------------------------------------------------------------+
| Dash                                             24  CODE POINTS     |
+---------+------+---------+------------+------------------------------+
| ARRIVES |      | BECOMES | CODE POINT | NAME                         |
+---------+------+---------+------------+------------------------------+
| 56x56   |  ->  | 56x56   | U+2014     | Em dash                      |
| glyph   | 1pct | glyph   | mono       | small, muted                 |
+---------+------+---------+------------+------------------------------+
| 56x56   |  ->  | removed | U+200B     | Zero-width space             |
+---------+------+---------+------------+------------------------------+
| one row per code point, a hairline between rows                      |
+----------------------------------------------------------------------+
| RULE    one sentence, the measure, above a strong hairline           |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The two glyph tracks are 1% of the table with a 56px minimum cell, so the
address and the name take every remaining column and the arrow never moves; the band puts the family
at the left and the tally at the right on one baseline. The table has no outer border in the
corpus's sense: the grid is one hairline box around the rows, and the rule sits outside it.

## The machines

Normalizer adds the evidence a rewrite claim needs: the character that arrives and the character
that leaves, side by side, with the address that proves the first. Every other machine on a package
page describes behavior; this one shows the mapping itself.

| Neighbour on the same page | What it already says                      | What Normalizer must not say            |
| -------------------------- | ----------------------------------------- | --------------------------------------- |
| Family                     | the syntax families of the comment filter | a second matrix of extensions           |
| Flow                       | the order the hook works in               | the mapping as a stage                  |
| Transform                  | a before and after pair for one example   | one example dressed as a table          |
| Activation                 | the line the flavor writes on load        | the replacement value as a printed pair |

When the record is absent the section is not rendered, so a package that is not a normalize flavor
shows no table.

## The decisions

| Decision                                                       | The alternative rejected                 | Why                                                                                                                                                                                                                  |
| -------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The glyph is decoded from the address at render time           | Storing the character beside the address | The address is the source's fact. A stored glyph could disagree with it, and a table whose two columns disagree is worse than no table.                                                                              |
| `removed` is printed where the result is empty                 | An empty cell                            | An empty cell reads as missing data. The invisible family's result is a deliberate deletion, and the label is the only way to say so inside a grid.                                                                  |
| The name column appears only when the source names code points | Always printing a name column            | The fullwidth block has no names in the source. An empty column would be five hundred pixels of nothing, and a reader would look for the names that are not there.                                                   |
| The unit follows the count                                     | Always `code points`                     | The ellipsis family has one row, and `1 code points` is a defect the site's own checker exists to catch. The unit is chosen from the count, so the band reads correctly at every size.                               |
| The count sits at the display scale in the accent ink          | A quiet count in the head                | The count is the family's size and the first thing a reader wants. It is also the one figure the machine prints, so it gets the one display-scale slot.                                                              |
| The table maps the default replacement                         | Drawing the configured replacement       | The site cannot read a profile's configuration, and the page is static. Printing a configured value would be a claim about a machine the site has never seen.                                                        |
| The rule is one sentence under the table                       | A rule per row                           | The rule is the family's, not the row's. Repeating it per row would print the same sentence twenty-four times in the dash family.                                                                                    |
| The storyboard names addresses, not glyphs                     | Pasting the characters into this file    | The storyboard is ASCII by rule, and the machine decodes the glyph at render. The address is the durable fact; the glyph is the rendering.                                                                           |
| The fullwidth family is stated as a range                      | Transcribing ninety-four rows            | The block is contiguous from `U+FF01` to `U+FF5E` and every result is the code point minus `U+FEE0`. The range is exact, the count checks it, and ninety-four transcribed rows would be a second copy of the source. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on six package pages, inside a `Table` section:
`hook-dsh-normalize-dash`, `hook-dsh-normalize-quotes`, `hook-dsh-normalize-ellipsis`,
`hook-dsh-normalize-spaces`, `hook-dsh-normalize-invisible`, and `hook-dsh-normalize-fullwidth`,
with the `ets-` twins reading the same records through the prefix. The page that proves the largest
family is the fullwidth one, and the page that proves the `removed` label is the invisible one.

What is not drawn yet: the gate the rule sentence names, which is three exemptions (an edit call, a
raw-marked call, and a listed tool result) and is stated rather than drawn. The machine shows what a
flavor maps; it does not show when the flavor is allowed to run.
