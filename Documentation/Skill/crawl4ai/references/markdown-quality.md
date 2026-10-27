# Markdown quality: the crawl defect catalog

This reference lists every artifact that a Crawl4AI capture can carry, so that a reader
can tell a usable page from one that only looks like Markdown and can find the remedy
for each.

The checker that produces the counts lives in `scripts/audit_crawl.py`.

The per-class counts below are a snapshot of the `Reference/` scan of the captured
source taken on 2026-10-22, before that corpus was re-crawled with the fixed pairing.

They show the shape of each defect, not the current totals: run the checker for live
numbers, and expect the classes that depend on page order (foreign bodies, provenance,
duplicates) to move while the site-specific link noise does not.

## The rule

1. **The audit first.**

    Run `audit_crawl.py <dir>` before you quote a crawled page.

    A crawl that exits 0 is a crawl that finished, not a crawl that is correct.

2. **The foreign body.**

    Treat `body belongs to another URL` as a stop sign: the page is another page's
    body.

    Re-crawl it, and never cite it.

3. **The cut tail.**

    Treat `page cut off at the character cap` as a missing tail.

    The page is usable up to the cut and silent after it.

4. **The repair copy.**

    Repair a defect in a copy, never in the captured file.

    The capture is the evidence, and a cleaned derivative is a new file.

5. **The clean class.**

    Report a class that is clean.

    "Zero error pages" is a finding, and it stops the next reader from re-running the
    check.

## The checker

The purpose is to count the defect classes below in a crawl output directory and to
print a `file:line` example for each, without loading page bodies into a context.

```bash
python3 <crawl4ai>/scripts/audit_crawl.py "<dir>"
```

The input is a directory.

A file is audited when it sits under a `pages/` directory or its frontmatter carries
`untrusted: true`, and repository prose counts as skipped.

`--all` audits every `.md`.

`--min-chars` moves the stub threshold (default 300), `--long-line` the long-line
threshold (default 1000), and `--max-examples` the examples per class (default 2).

The output is a volume line, then one table row per class that fired, with the page
count, the hit count, and a `file:line` example.

`--json` emits the same data plus the remedy of each class.

The checker reads only, and it never fetches and never writes.

Exit code `0` means that the scan completed, with defects reported and not fatal.

Exit code `2` means a usage error or a path that is not a directory.

Exit code `4` means `--strict` and at least one class fired.

Exit code `5` means no auditable Markdown under the target.

A page with no heading anchors cannot be cross-checked against its URL, so a shifted
body on such a site goes unreported, and the Lemonade pages with bare H1s are invisible
to that check.

The mismatch check needs a majority of at least two anchors, so a page whose headings
legitimately link elsewhere is not flagged, and a page with one anchor is not checked
at all.

## The catalog

The counts below are one measurement: 81 crawl pages under the `Reference/` tree of the
captured source, 2026-10-22, 1.78 M body characters.

Refresh them with the command above, because the class is the durable fact, not the
number.

### Zero-width and invisible characters (40 pages, 1112 hits)

The symptom looks like `## Tier 1[ZWSP](https://...#tier-1 "Direct link to Tier 1")`,
where `[ZWSP]` is one U+200B between the heading text and its anchor.

The cause is that the docs theme puts a zero-width space before the permalink anchor,
and the Markdown generator copies the DOM text node verbatim.

The damage matters because `grep "## Tier 1"` misses the heading, a tokenizer sees
`1(` glued together, and a diff of the page shows a phantom edit.

The remedy is a post-pass that drops U+200B, U+200C, U+200D, U+FEFF, U+2060, and
U+00AD.

The evidence is `Reference/<source>/pages/001-docs.md:10`.

### Heading anchor self-links (49 pages, 1231 hits)

The symptom looks like `## Install[](url#install "Direct link to Install")` from
Mintlify, or `## [Kernel namespaces](url#kernel-namespaces)` from Docusaurus.

The cause is that both themes wrap every heading in a permalink, and the generator
keeps the link plus its title attribute.

The damage matters because the heading text is duplicated in the link, a table of
contents built from the file lists the URL, and the `"Direct link to"` string pollutes
search results.

The remedy is a post-pass that strips the trailing `[...](...#... "Direct link to
...")`, or that unwraps a heading which is nothing but a link.

The evidence is `Reference/<source>/pages/001-engine-security.md:28` and
`Reference/<source>/pages/004-index.md:18`.

### Duplicate heading text (6 pages, 80 hits)

The symptom looks like two `### Commands` headings in one page, with different anchors
(`#commands` and `#commands-1`).

The cause is that the source page has two sections with the same title, and the theme
disambiguates the anchor, not the text.

The damage matters because a chunk titled by its heading is ambiguous, and a link to
`#commands` lands in the wrong section.

The remedy is to ignore the class, or to suffix the second occurrence in a post-pass,
because this is the site's authoring and not the error of the crawler.

The evidence is `Reference/<source>/pages/019-docs-user-guide-features-personality.md:585`,
which repeats line 408.

### Navigation and footer boilerplate (77 pages, 107 hits)

The symptom looks like `On this page`, `Table of contents`, `Back to top`, `Was this
helpful?`, `Ask Gordon`, `Copy Markdown`, `Show more`, a breadcrumb of `  * [](url)`
with empty link text, or a `Previous`/`Next` link pair.

The cause is that the chrome of the theme sits inside the element that the crawler
keeps, so the readability filter cannot tell it from body text.

The damage matters because every page starts or ends with lines that are not the page,
and a summary built by concatenation repeats them.

The remedy is a post-pass blocklist of the exact lines, or a crawler CSS selector that
excludes the chrome.

The scripts do not expose a selector, so the post-pass is the practical remedy.

The evidence is `Reference/<source>/pages/001-engine-security.md:9` and
`Reference/Lemonade/pages/001-docs.md:17`.

### Table row cell-count mismatch (23 pages, 206 hits)

The symptom looks like a header of `| OS | Methods | Notes |` followed by a row with
two cells, because the Notes cell was empty and the generator dropped it.

The cause is that the readability filter drops empty cells, and a table row whose cell
holds block content (a list, a code block) is flattened into fewer cells.

The damage matters because a table read as data is wrong on every row that lost a
cell, and the loss stays invisible unless the header is counted.

The remedy is to re-fetch the page with `read_url.py --filter raw`, or to read the
table as prose.

Do not repair the table by guessing the missing cell.

The evidence is `Reference/<source>/pages/006-docs-getting-started-platform-support.md:7`.

### Escaped pipes inside table cells (1 page, 1 hit)

The symptom looks like `| ... | "`<recipe>\|<stem>`" |`.

The cause is that a literal pipe inside a cell must be escaped in GFM, and this one is
escaped.

The class does no damage: it is correct Markdown, and the checker reports it so that a
reader can confirm that fact rather than assume it.

The remedy is to ignore it, and to verify by reading the cell before you treat it as
damage.

The evidence is `Reference/Lemonade/pages/026-docs-dev-adding-a-backend.md:13`.

### Unclosed code fence (5 pages, 5 hits)

The symptom looks like a file whose last line is inside a fence, so everything after
the opening marker renders as code.

The cause is that four of the five are pages truncated at the 50000-character cap,
which cuts mid-block, and the fifth is a fence inside a `<details>` block whose closer
the generator dropped.

The damage matters because the tail of the page is unreachable as Markdown, and a
reader who quotes the block quotes a fragment.

The remedy is to raise `--max-chars` and re-crawl, or to close the fence in a post-pass
after you check where the block should end.

The evidence is `Reference/<source>/pages/007-engine-security-protect-access.md:786`
and `Reference/Lemonade/pages/023-docs-dev-contribute.md:274`.

### Code fence without a language (62 pages, 1045 hits)

The symptom looks like a bare ` ``` ` where the page showed `bash`, `json`, or `yaml`.

The cause is that the site's highlighter stores the language in a DOM class or data
attribute, and the Markdown generator emits only the fence.

`--filter fit` drops the language too.

The damage matters because the block gets no syntax highlighting, and a reader must
infer the language before quoting the block, which is exactly where a wrong guess
enters a report.

The remedy is to ignore the class, or to infer the language in a post-pass and label
the fence.

The evidence is `Reference/<source>/pages/003-manuals.md:30`.

### Blank lines injected in code fences (38 pages, 678 hits)

The symptom looks like the opening fence, a blank line, the code, a blank line, and the
closing fence.

The cause is that the generator preserves the newline that the `<pre><code>` element
carries after the opening tag and before the closing one.

The damage matters because a copied block gains leading and trailing blank lines, and a
byte-exact comparison against the site's own snippet fails.

The remedy is a post-pass that drops a single leading and trailing blank line inside
each fence.

The evidence is `Reference/<source>/pages/001-docs.md:18`.

### Non-ASCII inside code blocks (32 pages, 111 hits)

The symptom looks like an em dash in a config comment, or a right-pointing prompt glyph
(U+276F) inside a shell block.

The cause is that the source page puts typographic characters inside `<code>`, and the
generator copies them.

The damage matters because pasting the block into a terminal fails or silently changes
the command, and `grep -- '--flag'` misses an em-dash variant.

The remedy is a post-pass that transliterates the glyphs inside fences only, or a quote
taken from the page instead of the file.

The evidence is `Reference/<source>/pages/007-docs-integrations-nous-portal.md:164`.

### Raw HTML remnants (1 page, 6 hits)

The symptom looks like `<sub>1</sub>` for a footnote, or a `<details><summary>` block.

The cause is that the source uses HTML where Markdown has no equivalent, and the
generator passes block-level HTML through.

The damage matters because a renderer that strips HTML loses the footnote or the whole
collapsible section, which may hold the answer.

The remedy is to re-crawl with `--filter raw` and strip the tags, or to read the HTML
of the page directly.

Keep the text, and drop the markup.

The evidence is `Reference/Lemonade/pages/023-docs-dev-contribute.md:148`.

### Stub or error page (0 pages today)

The symptom looks like `# This page crashed.` and nothing else, or a page under 300
body characters that reads like a browser error.

The cause is that the JavaScript of the site throws or the render times out, and
Crawl4AI still reports the crawl as successful, so the manifest hides it.

The damage matters because a citation from such a page is empty while the crawl report
says success.

Three captures in this corpus arrived this way and were re-fetched by hand.

The remedy is to re-fetch the page with `read_url.py`, and on an empty render to retry
with `--filter raw`, then with `--scan-full-page`.

Never accept a 200-character page as a short article.

The evidence is the history in `Reference/README.md:91`, and the class is clean in the
current tree.

### Page without an H1 (39 pages, 39 hits)

The symptom looks like a body that starts with `## Install`, with the page title only
in the frontmatter.

The cause is that the theme renders the title in a hero element outside the article
body, and the readability filter removes it.

The damage matters because chunking by H1 loses the page topic, and the frontmatter
title covers it only when `crawl_site.py` wrote the page.

The remedy is to ignore the class when the frontmatter title exists, and otherwise to
inject the title as an H1 in a post-pass.

The evidence is `Reference/<source>/pages/001-docs.md:8`.

### Page with several H1s (1 page, 1 hit)

The symptom looks like a second `# Contributors` heading halfway down the page.

The cause is that the source has more than one top-level section, and the theme would
have demoted it while the generator did not.

The damage matters because the outline has two roots, and a splitter produces two
documents.

The remedy is a post-pass that demotes every H1 after the first to H2.

The evidence is `Reference/Lemonade/pages/023-docs-dev-contribute.md:226`.

### Heading level jump (6 pages, 6 hits)

The symptom looks like `#### Deep` after `## Section`, or `### What can I help you
with?` before the `# Title` of the page.

The cause is that the chrome heading precedes the article H1, and the source itself
skips levels in places.

The damage matters little for a reader, and a strict outline builder warns about it.

The remedy is to ignore the class, unless the site is restructuring the page.

The evidence is `Reference/<source>/pages/002-index.md:20`.

### Headings collapsed onto one line (1 page, 1 hit)

The symptom looks like `### [Get started ...](url)### [Guides ...](url)### [Manuals
...]` on a single line.

The cause is that the generator concatenated adjacent card elements without a newline,
so four headings became one line of text.

The damage matters because three of the four sections vanish from the outline, and the
line runs to 700 characters.

The remedy is a post-pass split before `### `, or a re-crawl of the page with `--filter
raw`.

The evidence is `Reference/<source>/pages/002-index.md:20`.

### Absurdly long lines (13 pages, 31 hits)

The symptom looks like one line of 2499 characters holding a paragraph, a link, and the
next heading.

The cause is the same block-boundary collapse as above, plus tables that carry a whole
row on one line.

The damage matters because a diff review cannot see the change, and an editor wraps the
line into a false structure.

The remedy is to ignore the class, because long lines are a readability cost and not a
content error.

The evidence is `Reference/<source>/pages/007-docs-integrations-nous-portal.md:83`.

### Page cut off at the character cap (9 pages, 9 hits)

The symptom looks like `chars: 50000` in the frontmatter, a body of exactly 50000
characters that ends mid-word (`"defaul`), and an unclosed fence.

The cause is that `crawl_site.py` truncates each page at `--max-chars` (default 50000)
before it writes the file.

The manifest keeps the untruncated length, so `summary.md` does not show the loss.

The damage matters because the tail of a long page is silently absent, and this is the
most dangerous class, because nothing in the file or the manifest says "cut".

The remedy is to crawl with `--max-chars 0`, or to read the page with `read_url.py`
when the audit reports it.

Never assume that a page ends where the file ends.

The evidence is `Reference/<source>/pages/007-engine-security-protect-access.md:796`.

### Body belongs to another URL (40 pages, 40 hits)

The symptom looks like frontmatter `url: .../manuals`, `title: Content trust in
Docker`, and a body whose headings all link to `.../engine/security/trust`.

The cause is that `/crawl` returns its results in completion order and not in request
order, and `crawl_site.py` used to pair the response with the request by position.

The `url` and `title` of the result traveled with the body, which is why the
frontmatter title names a third page.

The damage matters because the file, its URL, and its body disagree.

Every quote from such a page is attributed to the wrong source, and no reader can
detect it without this check.

The remedy is fixed in `crawl_site.py`, which now pairs on the `url` of the result
(verified 2026-10-22: 5 URLs, 5 results, completion order shuffled).

Re-crawl any older tree before you cite it.

The evidence is `Reference/<source>/pages/003-manuals.md:8` and
`Reference/<source>/pages/038-docs-user-guide-messaging-homeassistant.md:11`.

### Duplicate page body (1 page, 1 hit)

The symptom looks like two files whose bodies are byte-identical after whitespace
normalization, under different URLs.

The cause is that the same mispairing gave two requests the same body, and one of the
two was later re-fetched by hand.

The damage matters because two citations look like two sources and are one.

The remedy is to re-crawl the pair and keep the file whose URL matches the body.

The evidence is `Reference/<source>/pages/008-docs-getting-started-quickstart.md:8`,
which is identical to `006-docs-getting-started-platform-support.md`.

### Page without a provenance block (4 pages, 4 hits)

The symptom looks like a page that starts with `On this page` or a breadcrumb, with no
`---` header, so no `url`, `title`, `depth`, `chars`, or `untrusted`.

The cause is that a hand rewrite of the page from the `read_url.py` stdout keeps the
body and drops the header.

The damage matters because the page cannot be traced to a URL or audited for
provenance, and `--resume` will fetch it again.

The remedy is to keep the header: re-fetch with `crawl_site.py`, or write the header by
hand from the URL and the date.

The evidence is `Reference/<source>/pages/013-docs-user-guide-features-memory.md:1`.

## The split: systematic, site-specific, one-off

1. **The systematic class.**

    The tool or the generator produces it on every crawl, so the script or the
    post-pass must handle it: body belongs to another URL, duplicate body, page cut off
    at the cap, fence without a language, and blank lines injected in fences.

2. **The site-specific class.**

    The docs framework or the authoring of this site produces it, so the class recurs
    on every crawl of that framework: zero-width characters, heading anchor self-links,
    no H1, boilerplate, table cell loss, duplicate headings, raw HTML, non-ASCII in
    code, collapsed headings, long lines, several H1s, and heading jumps.

3. **The one-off class.**

    A page crashed, a file was hand-edited, or the escape is correct: stub page,
    provenance missing, escaped pipe, and one of the five unclosed fences.

    Do not build a rule on it.

A systematic defect belongs in the tool.

A site-specific defect belongs in the post-pass, or in a note that says "this site does
that".

A one-off defect belongs in the report and nowhere else.

## The remedy ladder

1. **The filter flag.**

    A filter flag is the first choice, when one exists.

    `--filter raw` keeps tables, code languages, and nav, and `--filter fit` prunes nav
    but loses table cells and fence languages.

    `--scan-full-page` helps a renderer that never settles.

    `--max-chars 0` helps the truncation class.

    No flag removes zero-width characters or heading anchors.

2. **The post-pass.**

    A post-pass is the second choice, for everything else.

    Read the captured file, write a cleaned copy, and never edit in place.

    The order matters: strip invisibles, unwrap heading anchors, drop boilerplate
    lines, close or trim fences, then transliterate code glyphs.

    Splitting a collapsed heading comes last, because it changes line numbers.

3. **The ignore case.**

    Ignore the class when it costs a reader nothing: long lines, a missing H1 with a
    frontmatter title, a missing fence language, a duplicate heading that the source
    itself wrote, or a correct escaped pipe.

The two highest-value post-pass transforms fit in ten lines:

```python
import re

INVISIBLE = re.compile("[\u200b\u200c\u200d\ufeff\u2060\u00ad]")
ANCHOR = re.compile(r'\[([^\]]*)\]\((?:[^)]*)#[^)]*"[^"]*"\)\s*$')

def clean_line(line):
    line = ANCHOR.sub("", line)
    return INVISIBLE.sub("", line)
```

Run it over a copy, then re-run the audit on the copy and compare the counts.

A transform that does not move a count is not doing what its name says.

## Limits

The audit reads files, not the live site.

It cannot tell a paragraph that the source never wrote from one that the filter
deleted, and it can only count what is missing relative to the structure of the page
itself.

It cannot see a body shifted to a URL that has no heading anchors, and it cannot see a
table cell that was empty in the source.

When a page matters, read it and compare it with the live URL.
