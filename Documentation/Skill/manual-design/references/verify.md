# The Verification

This file lists the arbiters a design pass runs before it reports, and what each failure means.

## The rule

Compile the stylesheet, balance the markup with a parser, diff the visible text against the staged
original, grep every moved string, scan the bytes for non-ASCII, and check one `h1` and no `{" "}`.

Run `pnpm Check` and `dum prepublishOnly` when the lane allows the build; read a running dev server,
never start one; and say what you could not verify.

## The detail

The compile is
`cd Site && ./node_modules/.bin/sass --no-source-map Source/Stylesheet/Manual.scss > /tmp/manual.css`,
and it must exit 0.

The balance is an HTML parser over the page with the frontmatter stripped and the void elements
skipped. The `</base>` report is a known false positive, because the parser lowercases the `<Base>`
component to the void `base`.

The fact diff uses `git show :Source/pages/_Manual.astro` as the original when the file is staged
and not committed, then a word-level `difflib.SequenceMatcher` over the visible text, then a grep
for every deletion. The manual sheet went from 957 words to 1180, with five condition strings moved
into the disclosure and three alignment artifacts around them.

`pnpm Check` runs `Site/Scripts/Check.ts` against `Site/Target/`, and it is the seven-check scan the
site-authoring skill owns: links, structure, spacing, plural, islands, library, and design. Read the
site-authoring skill, Verification, for the build and the known compressor noise.

`dum prepublishOnly` runs the `prepublishOnly` script (`node Scripts/Prepare.ts && astro build`).
The `/manual` route is injected by the `DevRoute` integration in `Site/astro.config.ts` only when
`SITE_DEV=1` or `NODE_ENV=development`, so a production build has no manual page to check.

The ASCII scan is `LC_ALL=C grep -n '[^ -~]'` on every file written; the page's entities carry the
typography.

A failure means: a compile failure is a syntax error; a balance error other than `</base>` is a
markup defect; a word-diff deletion that does not grep is a lost fact; a `pnpm Check` failure is a
built-page defect; and a missing `Target/manual/index.html` is a closed `DevRoute` gate.

The evidence is `Documentation/Design/Dissection-Design.md`, sections 5 and 7.
