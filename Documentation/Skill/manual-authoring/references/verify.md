# The Content Verification

This file lists the arbiters a content pass runs before it reports, and what each failure means.

## The rule

Compile the stylesheet, run the site's checks and the build when the lane allows, grep every quoted
string in the page, scan the bytes for non-ASCII, and check one `h1` and no `{" "}`.

Say what you could not verify; a page that was never rendered is unverified, and the report says so.

## The detail

The compile is `cd Site && ./node_modules/.bin/sass --no-source-map
Source/Stylesheet/Manual.scss > /tmp/manual.css`, and it must exit 0.

`pnpm Check` runs `Site/Scripts/Check.ts` against `Site/Target/`, and it is the seven-check scan the
site-authoring skill owns; read that skill's Verification section for the checks and the known
compressor noise.

`dum prepublishOnly` runs the `prepublishOnly` script (`node Scripts/Prepare.ts && astro
build`). The `/manual` route exists only when the `DevRoute` integration in
`Site/astro.config.ts` is on (`SITE_DEV=1` or `NODE_ENV=development`).

The quoted-string grep is the content pass's fact check: for every string in the copy list, grep the
source file named in the dossier, and a string that does not grep is a lost fact.

The ASCII scan is `LC_ALL=C grep -n '[^ -~]'` on every file written.

A failure means: a compile failure is a syntax error; a Check failure is a built-page defect; a
missing string is a lost fact; an ungrounded band is a cut band; and an ASCII hit is a glyph.

The evidence is `Documentation/Design/Dissection-Templater.md`, section 5, and
`Documentation/Design/Pass-Log.md`.
