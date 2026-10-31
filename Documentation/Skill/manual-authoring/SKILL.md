---
name: manual-authoring
description:
    "The content pass on a plugin's study sheet: read the plugin's source in both trees, the core it
    delegates to, the tests, and the harness docs; extract the facts and the exact strings; lay out
    the bands and the copy; build the page with edits and sass compiles; verify every claim against
    the source."
whenToUse:
    "When a plugin has no study sheet, when a band cannot name its source, or when a fact in the
    sheet is ungrounded or paraphrased. Do not use for the design pass or the published package
    pages."
version: 1.0.0
updated: 2026-10-31
---

# Content Pass

The content pass makes a study sheet true; the design pass makes it good.

It reads the plugin's source in both trees, the core it delegates to, the tests, the harness docs,
and the diagrams, and it builds a page whose every band names its source and whose every string is
quoted.

The pass fails when a band cannot name a file, when a string is a paraphrase of a README, or when a
twin tree's difference is silently dropped.

The worked example is the ellipsis sheet at `/manual/`; its dossier is
`Documentation/Showcase/hook-dsh-normalize-ellipsis.md`; its record is
`Documentation/Design/Dissection-Templater.md`.

## When to use

| Scenario                                                       | Action                                         |
| -------------------------------------------------------------- | ---------------------------------------------- |
| A plugin has no study sheet.                                   | Run the pass.                                  |
| A band of a sheet cannot name the file it came from.           | Run the pass on that band.                     |
| A string in the sheet is a paraphrase of a README.             | Run the pass; quote the test or `Config.ts`.   |
| The Classic and EffectTS trees differ and the sheet is silent. | Run the pass; carry the difference.            |
| The sheet is flat and needs states and interactions.           | Stop; the design pass owns it.                 |
| The sheet needs a data contract or a reusable component set.   | Stop; component-pass or scenario-pass owns it. |
| The page is a published package page.                          | Stop; the site-authoring skill owns the lane.  |

## The rules

1. **Every band names its source.** A band that cannot name a file in the package, the core, the
   tests, or the harness docs is cut, not softened.

2. **Read both trees.** `Classic/packages/<slug>/Source/` and
   `EffectTS/packages/ets-<slug>/Source/`; a twin that differs is a fact the sheet carries.

3. **Follow the delegation.** The package's `Function/` files are thin; read the core
   (`lib-dsh-core/Source/`) that decides the behavior.

4. **Quote the exact string.** A ledger line, an activation line, a default, or an empty-string rule
   comes from the test or `Config.ts`, never from a README.

5. **The dossier first.** `Documentation/Showcase/<slug>.md` holds the claim, the sources, the copy,
   the layout, and the history; build from it, and append a dated section when the design changes.

6. **Borrow the frame, never the skin.** The title band, the stamp, the mode row, the two-world
   canvas, the decision spine, the cards, and the ledger take their geometry from `Temporary/Corca/`
   and the site's own components; never the palette, the radius, the font, or the shadow.

7. **Keep the sheet's rules.** One `h1`, ASCII, no `{" "}`, the site's tokens, and the dev-only
   route behind the `DevRoute` gate.

8. **Load this skill before the first write.** The templater loaded it after the build and paid a
   third full rewrite.

9. **Build with edits and compiles.** A full page write is allowed only after the source harvest,
   and a write rejected as stale is re-read before the retry.

10. **Verify against the source, not the memory.** The compile, `pnpm Check`, `dum prepublishOnly`,
    and a grep for every quoted string.

## The workflow

1. **Read the dossier and this skill.** `Documentation/Showcase/<slug>.md`, then the page and the
   stylesheet.

2. **Harvest the package.** `Classic/packages/<slug>/Source/`, the twin, `Config.ts`, the tests, the
   core it delegates to, the harness docs under
   `~/Developer/Documentation/Module/deepseek-harness/docs/`, and the diagram under `Diagram/`.

3. **Answer the questions in writing.** The seam, the dispatch, the kind, the replace law, the
   flags, the exemptions, the default, the empty-string rule, the ledger line, the activation line,
   the sibling order, and the twin difference.

4. **Lay out the bands.** The claim, the title band, the subtitle, the stamp, the mode row, the
   two-world canvas, the decision spine, the registers, the split, the cards, the ledger, and the
   run; name the machine and the source for each.

5. **Write the copy.** The exact strings, in the order the page prints them, with no paraphrase.

6. **Build.** Write the page and the stylesheet with the `write` and `edit` tools, compile with
   `cd Site && ./node_modules/.bin/sass --no-source-map Source/Stylesheet/Manual.scss > /tmp/manual.css`,
   and grep every quoted string in the page.

7. **Verify.** `pnpm Check` and `dum prepublishOnly` when the lane allows; the ASCII scan; one `h1`;
   no `{" "}`; the counts; and a read of a running dev server if one exists.

8. **Record the history.** Append a dated section to the dossier with the whole layout, not a diff,
   and report the files and the source of each band.

The pass ends at the verification gate: the compile exits 0, every quoted string greps, `pnpm Check`
exits 0, and the built page exists when the gate is open.

## Decision table

| Situation                               | Action                                            |
| --------------------------------------- | ------------------------------------------------- |
| A band cannot name its source.          | Cut the band.                                     |
| The source and the README disagree.     | The source wins; the README is not evidence.      |
| The twin differs from the Classic tree. | Carry the difference as a fact.                   |
| A fact lives only in a test.            | Quote the test string.                            |
| The dossier's layout is stale.          | Append a dated section with the whole new layout. |
| The sheet is flat.                      | Stop; the design pass owns the states.            |
| The page needs a data contract.         | component-pass or scenario-pass owns it.          |
| The page is published.                  | site-authoring owns the lane.                     |
| A write is rejected as stale.           | Re-read the file, then retry.                     |

## Verification

- `cd Site && ./node_modules/.bin/sass --no-source-map Source/Stylesheet/Manual.scss > /tmp/manual.css`
  exits 0.
- `cd Site && pnpm Check` exits 0; it is the seven-check built-output scan the site-authoring skill
  owns.
- `dum prepublishOnly` exits 0, and the built page exists in `Site/Target/` when the `DevRoute` gate
  in `Site/astro.config.ts` is open (`SITE_DEV=1` or a dev server).
- Every quoted string appears in the source file named in the dossier; grep each one.
- The ASCII scan is empty, the page has one `h1`, and the `.astro` has no `{" "}`.
- The counts of bands and machines match the dossier.

A compile failure is a syntax error; a Check failure is a built-page defect; a missing string is a
lost fact; an ungrounded band is a cut band; and a stale write is a lost draft.

## Anti-patterns

| Mistake                                      | Cost                            | Do instead                               |
| -------------------------------------------- | ------------------------------- | ---------------------------------------- |
| Read the README instead of the source.       | A plausible false fact.         | Read the package and the core.           |
| Paraphrase a ledger line.                    | A string the page cannot prove. | Quote the test.                          |
| Load the skill after the build.              | A third full rewrite.           | Load it before the first write.          |
| Write the page in one 30,000-character call. | A stale write loses the draft.  | Harvest, then write, then compile.       |
| Draw the frame from the picture.             | A borrowed look.                | Read the specimen CSS.                   |
| Cut a band to make the page fit.             | A fact disappears.              | Cut only an ungrounded band, and say so. |

## References

| File                    | Covers                                                                       | Read when               |
| ----------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| `references/harvest.md` | The package, the core, the tests, the harness docs, the twin, the questions. | Before the first write. |
| `references/sheet.md`   | The band inventory, the dossier schema, the copy list.                       | Laying out the sheet.   |
| `references/build.md`   | The write loop, the compile checkpoints, the stale-write rule.               | Building.               |
| `references/verify.md`  | The arbiters, the quoted-string grep, the counts.                            | Before the report.      |
