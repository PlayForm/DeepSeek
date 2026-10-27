# Conversion artifacts: what a document loses on the way to Markdown

A document conversion fails in a different way than a crawl.

The text arrives, but the page furniture, the table geometry, and the typography arrive with it.

This file lists the artifacts that a converted PDF or a scan carries, so that a reader knows what to
distrust before quoting it.

The audit method is shared, and the catalog is split by owner.

## The rule

1. **The shared method.**

    Audit the converted Markdown before you quote it.

    The shared method and the defect catalog for Markdown belong to the `crawl4ai` skill and its
    `markdown-quality` reference: count the artifact, cite a line, and decide between a flag, a
    post-pass, and no action.

2. **The converter artifacts.**

    This file owns only the artifacts that a document converter adds: page headers and footers, OCR
    noise, table loss, ligatures, and hyphenation.

    Do not repeat the crawl catalog here.

3. **The scanned PDF.**

    A scanned PDF that exits 3 has no text to audit.

    Ask about OCR first, because an empty Markdown file is not a short document.

4. **The number quote.**

    Quote a number from a converted table or an OCR pass only after you check it against the page
    image (`office-render`).

    The Markdown does not keep the confidence that the converter had.

## The catalog

### Page headers and footers

The symptom looks like `Annual Report 2024` or `Page 7 of 42` in the middle of a paragraph, then the
sentence continues, then the same line appears again forty lines later.

The cause is that the PDF keeps a running head and a page number in the page frame, and the
converter reads the frame as body text and writes it at every page break.

The damage matters because the same line repeats once per page, a paragraph is cut in two, and a
careless summary counts the running head as content.

The remedy is a post-pass.

Drop any line that repeats on three or more pages, and drop a bare `Page N` or `N / M` line.

Check the first and last line of every page boundary, where the damage concentrates.

The evidence in a converted file is the same string at a regular interval, often with a number that
increments.

### OCR noise

The symptom looks like `1nformation`, `rn` where `m` belongs, `0` for `O`, a word split by a stray
space (`the quick brown fox` becomes `the quickbrown fox`), or a line of punctuation from a ruled
table.

The cause is that a scanned page has no text layer, so `--ocr hosted` guesses glyphs, and the guess
is wrong at small type, at low contrast, and on ligatures.

The damage matters because a quoted sentence with one wrong character is a misquote, and a number
with one wrong digit is a false fact.

The remedy is to ask for consent, run OCR, and then spot-check every number, name, and code
identifier against the page image.

Do not run OCR without a word to the user, and do not present OCR text as the words of the document.

The evidence in a converted file is exit 3 on the first attempt, then a body whose errors cluster in
small type, in tables, and in footnotes.

### Table loss

The symptom looks like a table with merged cells flattened into one column, a row whose cell count
differs from its header, a nested table turned into a run of lines, or a table that arrived as an
image and produced no text at all.

The cause is that GFM has no merged cells and no nested tables, so the converter picks a
rectangular approximation, and a table drawn as an image has no text to read.

The damage matters because a table read as data is wrong on every merged row, and the loss stays
invisible unless the header is counted.

The remedy is a post-pass that counts the cells per row (the `crawl4ai` checker does this), and a
read of the page image for any table whose numbers matter.

Do not repair the table by guessing the missing cell.

The evidence in a converted file is a header of three columns followed by rows of two, or a table
whose last column is empty on every row.

### Ligatures

The symptom looks like a word whose `fi` or `fl` pair arrived as one glyph, so `file` extracts as
U+FB01 plus `le`, and `flow` as U+FB02 plus `low`.

The cause is that the PDF embeds the ligature as one glyph (U+FB00 to U+FB06), and the converter
copies the codepoint instead of the letters.

The damage matters because `grep "file"` misses the U+FB01 form, a word count is wrong, and a search
index never matches the word.

The remedy is a post-pass that transliterates U+FB00 to U+FB06 to their letter pairs (`ff`, `fi`,
`fl`, `ffi`, `ffl`, `st`), then re-runs the search.

The evidence in a converted file is a word that renders correctly and fails to match a plain-ASCII
search for the same word.

### Hyphenation

The symptom looks like `hyphen-` at the end of a line and `ation` at the start of the next, or a
word broken as `con- sider` in the middle of a sentence.

The cause is that the PDF breaks a word at the margin with a hyphen, and the converter keeps the
hyphen and the line break, so the word no longer exists as one token.

The damage matters because a quoted sentence contains a hyphen that the author never wrote, and a
search for the whole word fails.

The remedy is a post-pass that joins `word-` plus a following lowercase word only when the joined
form is a plausible word and the hyphen sits at a line end.

Keep the hyphen for a genuine compound (`state-of-the-art`), and read the page image when you are in
doubt.

The evidence in a converted file is a line that ends in a hyphen followed by a line that starts
lowercase.

## What to do with the artifacts

1. **The count.**

    Count the artifacts first.

    The `crawl4ai` checker runs on any Markdown directory with `--all`, and it reports broken
    tables, invisible characters, and headings.

    It cannot see page headers, OCR substitutions, ligatures, or hyphenation, and that limit is why
    this file exists.

2. **The decision.**

    Decide per artifact: a flag when one exists (`--ocr hosted` for a scan, `-f <format>` for a
    misdetected file), a post-pass for the rest, and no action when the artifact costs a reader
    nothing.

3. **The re-check.**

    Re-run the check on the cleaned copy and compare the counts.

    A transform that does not move a count is not doing what its name says.

4. **The kept file.**

    Keep the converted file.

    The cleaned copy is a derivative, and the conversion output is the evidence.

## Limits

The converter reports success for a page that it could not read: a table image becomes silence, not
an error.

The catalog above is a list of symptoms, not a guarantee that a clean file is faithful.

When a document matters, open the page image and read the passage that you are about to quote.
