---
name: manual-design
description:
    "The design pass on a dev-only study sheet under Site/Source/pages/: audit the accent and the
    band weights, read the Corca and overtrue corpora as text, give each band one geometry and one
    rule weight, add the states and micro-mechanics, and edit the stylesheet in slices with a sass
    compile between."
whenToUse:
    "After a study sheet carries every band and fact and still reads flat, or when a reviewer says
    it shows the mechanics but lacks design. Do not use to add, remove, or reorder bands."
version: 1.0.0
updated: 2026-10-31
---

# Design Pass

The content pass makes a study sheet true; this pass makes it good.

It takes a page whose bands and facts are already right and gives it the states, the interactions,
the micro-mechanics, the weight, and the geometry that make it feel built rather than assembled.

The information architecture is frozen: the pass changes how the page behaves, never what it says.

The worked example is the manual sheet at `/manual/`, `Site/Source/pages/_Manual.astro` and
`Site/Source/Stylesheet/Manual.scss`; its log is `Documentation/Design/Pass-Log.md`, and its record
is `Documentation/Design/Dissection-Design.md`.

The pass fails when the page becomes a set of identical hairline boxes, when a state is invented for
a control that cannot express it, or when a fact is lost to a rewrite.

## When to use

| Scenario | Action |
| --- | --- |
| Every band of a study sheet carries the same padding and the same 1px top rule. | Run the pass. |
| Every control has one hover and no focus, selected, current, or disabled state. | Run the pass. |
| One accent color appears in eleven places and names nothing. | Run the pass. |
| A reviewer says the page shows the mechanics but is lacking in design. | Run the pass. |
| A band is missing, duplicated, or out of order. | Stop; the content pass owns the bands. |
| A fact is wrong, ungrounded, or paraphrased. | Stop; the content pass owns the facts. |
| The page needs a data contract or a reusable component set. | Stop; component-pass or scenario-pass owns it. |
| The page is a published package page under `Site/Source/pages/package/`. | Stop; the site-authoring skill owns the lane. |

## The rules

1. **Audit the accent before you add a state.** Count every placement in the stylesheet and name the
   meaning it carries, then spend it on five meanings at most. The page is flat because one meaning
   owns eleven placements, not because the borders are light.

2. **Give each band one geometry and one rule weight.** A tray, a triptych, a ruled spine, a cell
   grid, a two-column split, a display pair, an embedded machine; 2px ink opens a page or a panel,
   1px strong separates the bands, and 1px line divides the inside of a machine.

3. **Use the native element for the state.** A radio group for one-of-N, `<details>` for a
   disclosure, `:has` for a dependent view. Write an island only for the clipboard, because the
   native element brings the keyboard behavior and the announcement for free.

4. **The paint-order trap is a comment and a z-index.** An absolutely positioned band that marks a
   row needs its content at `z-index: 1` or higher, and the comment beside the rule that says why.
   Without the lift the band hides the text it is pointing at.

5. **Put the focus ring on the thing the eye is on.** The mode's ring on the face, the node's ring
   on its marker, the decision's ring inside the row. A ring around a whole cell reads as a selected
   box and loses the state it is meant to show.

6. **A hover that only decorates is a defect; a hover that reveals a fact is an affordance.** A
   selectable row gets a band and a current marker, and an informational target gets a payload plate
   and no band. The difference tells a reader what can be clicked.

7. **An inspector needs a default subject.** Start the strip on the page's subject and let the
   pointer and the keyboard move it, because an empty inspector is a missing state, not a neutral
   one.

8. **Read the site's own components before a foreign one, and parameterize a shared machine with a
   default.** `Flow` has the disclosure and the 2px edge, `Line` the band and the trap, `Lane` the
   fill, and `CopyButton` the island; a page that needs a different subject from a shared island
   passes a `Data` prop with the module's own run as the fallback, rather than copying, editing, or
   deleting it.

9. **Verify with the arbiters the lane allows.** The `sass` compile, `pnpm Check`, the word diff
   against the index original, the ASCII scan, one `h1`, and no `{" "}`; read a running dev server,
   never start one.

10. **Write only the states the control has.** A reveal target has no selected state, a reading
    surface has no press; declare the expressible ones and say in the log why the rest are absent.

## The workflow

1. **Read the page and its stylesheet.** `Site/Source/pages/_Manual.astro` and
   `Site/Source/Stylesheet/Manual.scss` whole, then `Site/Source/Stylesheet/Global.css`,
   `Site/Source/Stylesheet/Material.scss`, and every component the page mounts.

2. **Audit.** Count the accent placements, the band weights, the controls, and their states; write
   the audit table and the acceptance list into `Documentation/Design/Pass-Log.md` before the first
   edit.

3. **Read the corpus.** `Temporary/Corca/Specimens/`, `Temporary/Corca/Curated/`,
   `Temporary/Corca/Compositions.md`, `Temporary/Flywheel/`, and
   `~/Developer/Documentation/Module/ui/src/registry/overtrue/`. Read the specimens as HTML and CSS,
   never as pictures, and write the take and the rejection per source.

4. **Study the specimens.** For each band, name the mechanic, read the registry composition for its
   state model, and take the measurement; read the site's own component before any foreign one.

5. **Write the first band.** One band, its geometry, its weight, its states; compile with
   `cd Site && ./node_modules/.bin/sass --no-source-map Source/Stylesheet/Manual.scss > /tmp/manual.css`;
   grep the emitted selector; read the slice back.

6. **Run the slice loop for every remaining band.** Grep the selector in the stylesheet, read a 4 to
   60 line slice, edit one block, compile, grep the emitted selector, re-read after the formatter,
   and log the band.

7. **Verify.** The compile, the markup balance, the word diff against `git show :path`, the moved
   strings, the ASCII scan, one `h1`, no `{" "}`, and the element counts; run `pnpm Check` and
   `dum prepublishOnly` when the lane allows the build.

8. **Log and report.** Finish `Documentation/Design/Pass-Log.md` with the ten learned rules, and
   report the files, the states per band, and the mechanics refused.

The pass ends at the verification gate: the compile exits 0, the word diff reports only moved
strings, `pnpm Check` exits 0, and the built page count is unchanged.

## Decision table

| Situation | Action |
| --- | --- |
| A band has the same top rule as its neighbor. | Assign a rung of the weight ladder; 2px ink for the opener. |
| A control has one hover. | Add the states the control has; use the native element first. |
| A band can be empty. | Give the inspector a default subject. |
| A shared island shows another page's data. | Add a `Data` prop with the module's own run as the default. |
| A nested rule compiles to the wrong selector. | Grep the compiled CSS and fix the nesting. |
| The formatter changed the file under the edit. | Re-read the slice, then edit. |
| The target is staged and not committed. | `git show :path` is the original for the word diff. |
| The build is forbidden. | The `sass` compile, the word diff, and the ASCII scan are the arbiters; say what you could not verify. |
| A dev server is already running. | `curl http://localhost:9999/manual/` and read the rendered text; do not start one. |
| The page needs less content. | The content pass owns the content; parameterize the run, do not cut the bands. |

## Verification

- `cd Site && ./node_modules/.bin/sass --no-source-map Source/Stylesheet/Manual.scss > /tmp/manual.css`
  exits 0.
- The word diff against `git show :Source/pages/_Manual.astro` reports only the moved strings; grep
  every deletion to prove it is present.
- `cd Site && pnpm Check` exits 0 after a build; it is the seven-check built-output scan, and the
  site-authoring skill owns the checks.
- `dum prepublishOnly` exits 0, and `Site/Target/manual/index.html` exists when the `DevRoute`
  integration in `Site/astro.config.ts` is on (`SITE_DEV=1` or a dev server).
- The ASCII scan is empty, the page has one `h1`, and the `.astro` has no `{" "}`.
- The counts of bands, nodes, leaves, decisions, and modes match the log.

A compile failure is a syntax error; a Check failure is a built-page defect; a word-diff
deletion is a lost fact or a moved string; an ASCII hit is a glyph; a missing
`Target/manual/index.html` means the `DevRoute` gate was closed.

## Anti-patterns

| Mistake | Cost | Do instead |
| --- | --- | --- |
| Write the whole page and stylesheet in two calls. | 94 KB of formatted source and a 75-call correction tail. | Write one band, compile, then extend. |
| Add a hover to every row. | Nothing reads as clickable or read-only. | A band for selectable rows, a plate for informational ones. |
| Spend the accent on every state. | No accent means anything. | Budget five meanings. |
| Copy a shared island for a different subject. | Two machines drift. | A `Data` prop with the default. |
| Skip the emitted-selector grep. | A nested rule compiles wrong. | Grep the compiled CSS. |
| Trust a sentence-substring fact check. | 15 false misses. | Word diff against the index original. |
| Start `astro dev`. | Dev output is not evidence. | Read a running server, or build. |

## References

| File | Covers | Read when |
| --- | --- | --- |
| `references/audit.md` | The accent budget, the weight ladder, the state inventory, the acceptance list. | Before the first edit. |
| `references/corpus.md` | The corpus map with this repository's paths and what to take from each. | Before the band pass. |
| `references/bands.md` | The seven geometries, the state set, the native elements, the trap and the ring. | Per band. |
| `references/loop.md` | The slice loop, the formatter rule, the band-group counts, the stale-read recovery. | After the first band compiles. |
| `references/verify.md` | The arbiters, the word diff, the checks, the dev-server read. | Before the report. |
| `references/log.md` | The Pass-Log schema, the evidence pointers, the learned rules. | From the first read. |
