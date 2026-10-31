# Dissection: the templater that built the ellipsis study sheet

The subject is the session `1e54e4c6-7103-44bb-8930-1944f4efbef2`, a delegated lane whose label was
`Apply the Flywheel study design`. It was the templater: it built the study sheet at the dev-only
route `/manual/` for `hook-dsh-normalize-ellipsis`. The record is 572 events, 102 tool calls, 68
steps, and 19.6 minutes of wall clock from the first step to the last message.

One structural fact must be stated before anything else. The log contains a single harness turn
(`turn/start` at seq 6, `turn/end` at seq 570) and the instructions arrived as three spliced inbox
messages inside that turn. The "three turns" in this document are the three instruction waves, not
three harness turns. Each wave landed on a step boundary, and the agent saw it at the next step.

| Wave | Arrived | Seen at | What it asked for |
| --- | --- | --- | --- |
| 1 | seq 10 | step 1 | Rebuild the page's header and frame after six Flywheel reference images, keep the three views and the machines |
| 1b | seq 42 | step 4 | Correction: four named references are the authority; the header must carry an icon and a heading |
| 2 | seq 173 | step 18 | Build exactly the study-sheet shape: title band, subtitle, stamp, mode row, two-world canvas, three cards, footnote |
| 2b | seq 202 | step 20 | Add the decision spine, the sibling band, and the ledger band |
| 3 | seq 203 | step 21 | Stop designing from the description; read the plugin's actual source, ground every band, cut what cannot be grounded |

The agent also received three advisory notices, and none of them changed its course. The
`replay-suggester` at step 6 proposed re-reading two images it had already read; the `doc-suggester`
at step 8 proposed `Site/Source/Library/Content.ts`, which was never read; the `replay-suggester` at
step 23 proposed re-reading `Apply.ts`, `Global.css`, and `Material.scss`, all of which the agent had
already read or was about to read on its own plan. No call was spent on a notice as a directive.

## How this was reconstructed

I decompressed the log with `zstd -dc` and parsed the JSONL into four streams: `tool/call` (the tool
name and the JSON `arguments`), `tool/result` (the text the agent saw), `assistant/message` (the
visible text and the 58 `reasoning` blocks), and the step and inbox boundaries. I read every call's
arguments and result, the reasoning for every step that carried a decision, and the four large
planning blocks (steps 16, 20, 36, and 42) in full or in trimmed form. Every clause in the table
comes from a call's arguments, its result, or the reasoning of the step that produced it. The
`sass` and `grep` outputs quoted here are the ones the agent saw, not reconstructions.

## 1. Every tool call, in order

The target is truncated to its tail. The purpose is one clause, read from the call's arguments, the
step's reasoning, and the result.

| # | Tool | Target | What it was for |
| --- | --- | --- | --- |
| 1 | read | `Temporary/Flywheel/PlayForm-Decision-Outcomes-Study.png` | read the primary reference as text; rejected as a binary file |
| 2 | read | `Temporary/Flywheel/PlayForm-Plugin-Drawer-Study.png` | same attempt on the second reference; rejected as a binary file |
| 3 | read_image | `Temporary/Flywheel/PlayForm-Decision-Outcomes-Study.png` | read the primary reference as an image |
| 4 | read_image | `Temporary/Flywheel/PlayForm-Plugin-Drawer-Study.png` | read the second reference as an image |
| 5 | read_image | `Temporary/Flywheel/PlayForm-Semantic-Zoom-Study.png` | read the third reference |
| 6 | read_image | `Temporary/Flywheel/PlayForm-Stacked-Timelines-Diagram.png` | read the fourth reference |
| 7 | read_image | `Temporary/Flywheel/PlayForm-Difference-Lens-Manifest.png` | read the fifth reference |
| 8 | read_image | `Temporary/Flywheel/PlayForm-Story-Focus-Request.png` | read the sixth reference |
| 9 | read | `Temporary/Flywheel/PlayForm-Branch-and-Decision-Visual-Contract.json` | read the contract that names the marks and the modes |
| 10 | read | `Temporary/Flywheel/PlayForm-Observatory-Interactive-Concept.html` | read the first HTML concept for its composition rules |
| 11 | bash | `Site`: `ls -la`, `ls Source`, `wc -l` on the page and stylesheet | size the site and the two target files |
| 12 | bash | `head -c 3000 PlayForm-Two-Worlds-Four-Graph-Projections.html` | peek at the second concept's head only |
| 13 | read | `Site/Source/pages/_Manual.astro` | read the page, 214 lines, before changing it |
| 14 | read | `Site/Source/Stylesheet/Manual.scss` | read the stylesheet, 748 lines, before changing it |
| 15 | bash | `ls -R` of Component, Layout, Stylesheet, Library, Content, Script | inventory the site's components and styles |
| 16 | bash | `ls pages`; `cat Layout/Base.astro` | learn the page wrapper and the `main` the page sits in |
| 17 | bash | `wc -l Global.css Material.scss`; `ls Stylesheet` | locate the token and mixin files |
| 18 | bash | `cat Component/Icon.astro` | learn the package-mark component the header must use |
| 19 | read | `Site/Source/Stylesheet/Material.scss` | read the mixins |
| 20 | read | `Site/Source/Stylesheet/Global.css` | read the token set |
| 21 | bash | `grep manual` in `astro.config.ts` and `Scripts` | find the dev-only route gate |
| 22 | bash | `cat Component/PageHero.astro` | read the site's existing hero pattern |
| 23 | bash | `ls pages/package`; `sed` the slug page | find the package page's header markup |
| 24 | bash | `sed -n 1,140p pages/package/[slug].astro` | read the package page head |
| 25 | bash | `grep PageHero, Mark, Icon` in the package page | locate the icon usage |
| 26 | bash | `cat Stylesheet/Component/PageHero.scss` | read the hero's styles |
| 27 | bash | `cat Icon.scss`; `grep` the Link exports | read the mark's styles and the link helpers |
| 28 | bash | `sed SessionView.tsx`; `grep` the scss root | inspect the island root the page mounts |
| 29 | bash | `ls Public/Icon`; `grep` the ellipsis slug | confirm the package mark asset exists |
| 30 | bash | `sed -n 1,90p Library/Link.ts` | read the URL registry |
| 31 | bash | `grep -rln normalize-ellipsis` in Content and Library | find the subject's content records |
| 32 | bash | `sed -n 190,250p Content/Portrait.ts` | read the subject's portrait record |
| 33 | bash | `grep -A14` in Behavior, Arm, Activation | read the subject's behavior and arm records |
| 34 | bash | the gate, nested `main`, and the `box-shadow` idiom | check the gate, the page roots, and the shadow idiom |
| 35 | bash | `ls -la` and `find` the Classic package | list the package tree |
| 36 | bash | `find` the EffectTS twin; `ls Classic/packages` | list the twin and the family |
| 37 | read | `Classic/.../Source/Function/Apply.ts` | read the listener: seam, flags, dispatch, ledger line |
| 38 | read | `Classic/.../Source/Function/Normalize.ts` | read the table and the replace law |
| 39 | read | `Classic/.../Source/Function/Chunk.ts` | read the chunk classifier |
| 40 | read | `Classic/.../Source/Variable/Config.ts` | read every knob and its default |
| 41 | bash | `ls lib-dsh-core/Function`; `find` Chunk | locate the core's stream chunk dispatch |
| 42 | bash | `cat Function/Replace.ts Function/Block.ts` | read the package's thin delegates |
| 43 | read | `lib-dsh-core/Source/Stream/Chunk.ts` | read the real five-case dispatch |
| 44 | bash | `cat Stream/Block.ts Stream/Replace.ts Stream/Strip.ts` | read the core's block, replace, and strip |
| 45 | bash | `sed Function/Activate.ts`; `grep Ellipsis` | read the activation-line composer |
| 46 | bash | `cat Normalize/Ellipsis.ts`; `sed Normalize/Replace.ts` | read the character class and the replace law |
| 47 | bash | `grep on("llm/stream")`; `grep Append` | find the seam's listeners and the ledger prefix |
| 48 | bash | `grep -rln llm/stream`; registrations only | list every listener that registers on the seam |
| 49 | bash | `ls` the harness docs; `grep prepend` | locate the harness docs and the prepend rule |
| 50 | bash | `ls subsystems`; `grep waterfall` | find the waterfall section |
| 51 | bash | `sed -n 1,80p Test/Stream-Contract/Test.ts` | read the stream contract test |
| 52 | bash | `sed -n 80,260p Test/Stream-Contract/Test.ts` | read the assertions and the ledger line |
| 53 | bash | `grep activated, replacement` in Config-And-State and Overpass | read the activation line and the arms |
| 54 | bash | `grep __normalize, replacement "", name: edit` | hunt the marker, the empty replacement, the exemptions |
| 55 | bash | `diff` Normalize.ts and Apply.ts across the trees | diff the twin |
| 56 | bash | `grep hook-dsh-normalize` outside packages | find the family bundle order |
| 57 | bash | a loop over five siblings, `grep` the ledger line | read the sibling ledger strings |
| 58 | bash | `sed -n 1232,1260p subsystems/llm-streaming.md` | read the waterfall contract |
| 59 | write | `Site/Source/pages/_Manual.astro`, 29,951-character argument | first full rewrite of the page; rejected as stale |
| 60 | read | `Site/Source/pages/_Manual.astro`, 209 lines | re-read the file a parallel lane had replaced |
| 61 | bash | `ls -la`, `git status`, `head` of the stylesheet | establish what changed and who owns the design |
| 62 | write | `Site/Source/pages/_Manual.astro` | rewrite the page on the adopted `sheet__` design |
| 63 | read | `Site/Source/Stylesheet/Manual.scss`, 462 lines | read the parallel lane's stylesheet in full before overwriting |
| 64 | write | `Site/Source/Stylesheet/Manual.scss` | write the `sheet__` stylesheet |
| 65 | bash | non-ASCII, literals, `{" "}`, h1, ids | first self-check pass; two false positives |
| 66 | bash | token used/defined `comm` | first token check; the regex failed and produced nothing |
| 67 | bash | `grep .session-record` in the component scss | locate the session record's base styles |
| 68 | bash | token `comm` with a working pattern | re-run the token check correctly |
| 69 | bash | `sed -n 1,30p SessionRecord.scss` | read the record's base styles |
| 70 | bash | `grep ::after SessionRecord.scss` | confirm the pseudo-element is free |
| 71 | bash | `grep` the numeric entities in the page | locate the entities to replace |
| 72 | edit | `&#8230;` to `&hellip;` in the card value | replace a numeric entity with a named one |
| 73 | edit | `&#123;` to `&lbrace;` in the args line | same for the brace |
| 74 | edit | `&#8230;` to `&hellip;` in the plate glyph | same for the glyph |
| 75 | edit | `&#8594;` to `&rarr;` in the mid arrow | same for the arrow |
| 76 | edit | chain-hop `box-shadow` to `border-left` | remove the shadow property |
| 77 | edit | ledger-row `box-shadow` to `border-left` | remove the shadow property |
| 78 | edit | session-record `box-shadow` to a `::after` edge | remove the shadow property |
| 79 | bash | re-check ASCII, literals, braces, h1, views, imports | verify the edits and the imports |
| 80 | bash | find the `sass` binary; check the icon asset | confirm the compile tool and the mark asset |
| 81 | bash | `sass --no-source-map ... /dev/null` | compile the stylesheet as a syntax check |
| 82 | skill | `plugin-realisation` | load the matching skill, late, after the first build |
| 83 | bash | core imports in Overpass and StepBatch; core exports | resolve the core-versus-package split |
| 84 | write | `Site/Source/pages/_Manual.astro`, 32,003-character argument | third full rewrite, restructured to the skill's bands and four modes |
| 85 | bash | `grep` the old view selectors in the scss | find the selectors to rename |
| 86 | edit | view selectors to show, explain, focus, expand | rename the mode ids in the stylesheet |
| 87 | edit | add the card list rule | style the card list the new markup needs |
| 88 | bash | `grep` the two cards containers | locate the split band's container |
| 89 | edit | add `data-count="two"` to the split | fix the two-card grid |
| 90 | edit | add the `[data-count="two"]` rule | style the two-card grid |
| 91 | bash | `sass` plus ASCII, literals, h1, panels, modes | compile and verify the restructure |
| 92 | bash | tag balance for 13 tags | check the markup's tag balance; a false alarm on span |
| 93 | bash | span open and close, multiline closes | resolve the span false positive |
| 94 | edit | decision marker `border-radius: 0` | make the diamond a diamond |
| 95 | bash | `sass` plus ASCII, literals, tokens, h1, json | compile and re-run the checklist |
| 96 | bash | `git diff --stat`; `wc -l` | size the change for the report |
| 97 | bash | band labels and singular machine counts | verify each band and machine appears once |
| 98 | bash | `grep` two exact visible strings | locate the split and pair band boundaries |
| 99 | read | `Site/Source/pages/_Manual.astro` 555-594 | read the slice before editing it |
| 100 | edit | add the twin note to the split band | add the EffectTS note the source supports |
| 101 | bash | final `sass` plus all checks | final compile and checklist |
| 102 | send_message | parent session `session-d9a6aabb` | report files, sources, corrections, self-check |

## 2. The phases

The seven phases below are call ranges. They do not align with the instruction waves, and that is the
first thing the log teaches: the instructions changed under the agent while it was still reading.

### Phase A: the references (calls 1-12, steps 1-6)

The agent read the six reference images first, before touching the page. It used `read` twice (calls
1-2) and was told the file was binary, then switched to `read_image` (calls 3-8). It read the visual
contract (call 9), the first HTML concept (call 10), sized the site (call 11), and took only the head
of the second HTML concept (call 12). This phase produced no artifact. It produced the frame
vocabulary: title band, stamp, mode row, two-world tracks, circles, squares, diamonds, three cards,
footnote.

### Phase B: the site harvest (calls 13-34, steps 7-20)

The agent read the page (214 lines) and the stylesheet (748 lines) in full, then the tokens and
mixins, then the components the page already uses, then the site's own hero pattern, then the
subject's content records, then the gate. The purpose was to write in the site's idiom rather than
invent one: the icon comes through `Icon.astro`, the page sits inside `Base.astro`, the facts come
from the content records, the route stays behind the `injectRoute` gate. The phase ends with the
`box-shadow` idiom check (call 34), which anticipates the "no shadow" rule.

### Phase C: the package harvest (calls 35-58, steps 21-35)

This phase exists because of wave 3. The agent read the package tree, then `Apply.ts`, `Normalize.ts`,
`Chunk.ts`, `Config.ts`, then followed the delegation into `lib-dsh-core` (calls 41-46), then found
every listener on the seam (calls 47-48), then read the harness's waterfall section (calls 49-50 and
58), then the tests for the exact strings (calls 51-54), then diffed the twin (call 55), then read
the sibling ledger lines (call 57) and the bundle order (call 56). By the end of step 35 the agent had
the five-case dispatch, the three name exemptions, the defaults, the exact ledger line, the activation
line, and the registration-order fact.

### Phase D: the first build and the stale-write recovery (calls 59-64, steps 36-41)

Call 59 is the first full page write, composed after 1.96 minutes of reasoning. It failed with
`FS_STALE_VERSION`: the file had changed since it was read. Call 60 re-read the file and found a
different design, written at 05:55 by a parallel lane. Call 61 checked the timestamps and the git
status. The agent decided to adopt the parallel design rather than overwrite it (calls 62 and 64).
This is the most important decision in the log: it chose continuity with another lane's work over its
own 30,000-character draft.

### Phase E: the self-review loop (calls 65-81, steps 42-50)

The agent ran its own checklist against the new files. Call 65 flagged entities as literal colours and
call 66's token comparison returned nothing; call 68 re-ran the token check with a working pattern and
calls 71-75 removed the entity false positive by switching to named entities. Calls 76-78 removed the
three `box-shadow` declarations in favour of a border and a pseudo-element. Call 80 found the local
`sass` binary and call 81 compiled the stylesheet for the first time, 17 calls after the stylesheet
was written.

### Phase F: the skill load and the restructure (calls 82-90, steps 51-57)

Call 82 loaded `plugin-realisation` after the build was already done. The skill's band list and its
four readings changed the page: call 84 is the third full write, replacing the three view names with
four modes, and calls 85-90 renamed the stylesheet selectors and fixed the two-card grid. This phase
is rework caused by a late read, not by a new instruction.

### Phase G: the verify and the finish (calls 91-102, steps 58-68)

The agent compiled and re-ran the checklist (call 91), resolved a tag-balance false alarm (calls
92-93), fixed the diamond's radius (call 94), compiled again (call 95), sized the diff (call 96),
checked that each band and each singular machine appears once (call 97), located two band boundaries
by their visible text (call 98), read the slice (call 99), added the twin note (call 100), ran the
final compile and checklist (call 101), and reported to the parent (call 102).

## 3. The turns

### Turn 1: the header and the frame (steps 1-17)

**Asked.** Rebuild the page's header and frame after six Flywheel reference images, keep the three
views and the machines, use the site's tokens only, no `{" "}`, no `.mjs`, one `h1`, keep the dev-only
gate, edit with the tools. The correction at step 4 named four different authority references and
added two requirements the first brief lacked: an icon and a heading.

**Decided.** Read every allowed image before any page file; read the page and the stylesheet in full;
find the site's own hero pattern rather than invent one; take the icon through `Icon.astro`; keep the
facts in the page rather than importing a data module. The step 4 reasoning is explicit about the
conflict between the two lists of references, and the agent chose the allowed list, which meant
`PlayForm-Expanded-Branch-Comparison.png` was never read.

**Changed course.** At step 4, when the correction arrived mid-harvest: the agent stopped treating
the first list as complete and re-planned the header around an icon and a heading. At step 18, when
wave 2 arrived before it had written anything: the design target changed from "header and frame" to
"the whole study-sheet shape", and the agent had to re-decide the page's structure with no artifact
to show for the first 17 steps.

### Turn 2: the shape (steps 18-20)

**Asked.** Build exactly the study-sheet shape: a title band with a subtitle and a `CONCEPT /
ILLUSTRATIVE` stamp, a mode row of five pills with the three views inside it, a two-world canvas, an
`SELECTED / SOURCE / LAYER` caption, three cards, a footnote. Then show the plugin's full variability
(replacement values, flags, exemptions, twin, boundary). Then add the decision spine, the sibling
band in waterfall order, and the ledger band.

**Decided.** The agent checked the site's content records first (calls 31-33) and found they could not
support the variability claims: the portrait carries a role, a plugs line, four `does` lines, and a
shape, and nothing about flags or exemptions. It decided to verify the claims in the monorepo instead
of drawing them, and it found several of them wrong: the stream exemptions are three tool names, not
"an edit call, a raw-marked call, or a listed tool result"; `live-containers` is at
`system-prompt/assemble`, not on `llm/stream`; the seam's listener does not prepend.

**Changed course.** At step 21, when wave 3 arrived and turned the design brief into a source-first
brief. The agent abandoned the design-from-description route before writing a single file, which is
why the first write (call 59) is already source-grounded.

### Turn 3: the source (steps 21-68)

**Asked.** Read the plugin's actual source in both trees and the harness docs, then rebuild the sheet
so every diamond is a branch in `Apply.ts` or the functions it calls, every string comes from a test
or `Config.ts`, the sibling band lists the real listeners in the documented order, the knob shows the
real default and the real empty-string behaviour, and any band that cannot be grounded is cut. Report
which file each band came from.

**Decided.** Read the package, then the core it delegates to, then the tests, then the harness docs,
then the twin; answer the seven questions in reasoning before drawing; keep the sheet's structure
from the parallel lane and correct its facts rather than start again.

**Changed course.** At step 37, when the first write was rejected because the file had changed under
it: the agent re-read, adopted the parallel design, and rebuilt on it. At step 51, when the
`plugin-realisation` skill appeared in the catalog: loading it changed the mode row from three views
to four readings, which forced a third full write (call 84) and a selector rename in the stylesheet
(calls 85-86). The agent disclosed the deviation in its report and offered to relabel the panels.

## 4. The mistakes

1. **Calls 1-2, the wrong reader for an image.** The agent called `read` on two PNGs and got
   "cannot read: binary file" twice. Calls 3-4 repeated the same reads with `read_image`. Two wasted
   calls, and the fix was available in the tool list from the start. The old skill's advice to "read
   the images with the read tool" is the direct cause.
2. **Call 12, a head-only read of a reference.** The second HTML concept was read with
   `head -c 3000`, which returns the document head and not the composition rules the brief said it
   holds. The file was never read again. A reference that is opened but not read is not a source.
3. **The reference that was never read.** `PlayForm-Expanded-Branch-Comparison.png` was named in the
   step 4 correction as one of the four authority references and was read zero times. The step 4
   reasoning shows this was a deliberate choice to honor the original "only these images" list, but
   the result is that one of the four authorities never entered the frame.
4. **Call 59, the stale write.** A 29,951-character page write, composed over 1.96 minutes, was
   rejected because the file had changed since call 13 read it, 46 calls and about 10 minutes
   earlier. The draft was lost entirely. The recovery (calls 60-62) is correct, but the loss was
   avoidable with a re-read immediately before the write.
5. **Calls 65-66, two checks that did not check.** Call 65's literal-colour grep matched `&#8230;`
   as a hex colour, a false positive; call 66's `^\s*--` pattern does not work in `grep -E`, so the
   defined-token set was empty and the comparison was meaningless. Call 68 re-ran the token check
   with a correct pattern, and calls 71-75 removed the entity false positive. Two calls spent on
   checks that could not fail.
6. **Calls 76-78, a self-correction of the first draft.** The stylesheet written at call 64 used
   `box-shadow: inset` for three accent edges, after the agent had already read the "no shadow" rule.
   The edits replaced them with `border-left` and a `::after` edge. The rule was known and not
   applied at write time.
7. **Calls 92-93, a false alarm on tag balance.** The heuristic reported 140 open spans against 125
   closes. Call 93 showed that 15 closing tags were written as `</span` followed by a newline, so the
   count was wrong, not the markup. One call to raise a false alarm, one to dismiss it.
8. **Call 84, the third full write.** The page was written in full three times (59 failed, 62, 84)
   because the skill was loaded at call 82, after the build. The third write changed the mode row
   from the three views to four readings and forced the stylesheet renames at calls 85-86. The rework
   is traceable to a single ordering mistake: the skill that governs the page was read after the page
   was built.
9. **Calls 88-90 and 94, defects caught by the checklist rather than by the draft.** The two-card
   split sat in a three-column grid until call 88 found it, and the decision marker inherited a
   border radius until call 94. Both are small, both were caught, and both show that the draft was
   not read as a rendering.

## 5. The rhythm

**The counts.** 102 calls: 16 `read`, 6 `read_image`, 61 `bash`, 4 `write`, 13 `edit`, 1 `skill`, 1
`send_message`. Of the 61 bash calls, 49 are harvest (read-only inspection of the site, the package,
the docs, and the git state), 8 are verification, and 4 are stylesheet compiles.

**Reads against writes.** 22 reads (16 text, 6 image) against 16 successful mutations (3 writes, 13
edits), a ratio of about 1.4 to 1. The ratio is misleading on its own, because the harvest and the
build occupy different halves of the session: calls 1-58 are 58 calls with zero mutations, and calls
59-101 are 43 calls with 17 mutation attempts (40 percent of the calls in that window). The agent
spent 57 percent of its calls before the first build and 42 percent after it.

**The length of the write loop.** The first successful write is call 62 at 11.9 minutes; the last
edit is call 100 at 19.2 minutes. The write loop is 39 calls and 7.3 minutes, with 16 mutations, 4
compiles, and 6 verification passes. That is one mutation every 2.4 calls and one compile every 4
mutations.

**Did it compile between edits?** Partly, and later than it should have. The stylesheet was written
at call 64 and first compiled at call 81, 17 calls and 7 edits later. After that the compiles came at
calls 91, 95, and 101: after a 4-edit batch, after a single edit, and after a single edit. The agent
compiled at batch boundaries, never between individual edits, and the first batch ran uncompiled for
the longest stretch.

**The thinking.** The session is 19.6 minutes for 68 steps, and the model's reasoning dominates the
gaps: step 20 spent 3.3 minutes and 115,976 characters deciding how to handle the conflicting
briefs; step 36 spent 2.0 minutes and 52,834 characters composing the write that was then rejected;
step 16 spent 1.1 minutes on the site's hero pattern. The build was composed in one long reasoning
block rather than grown by edits, which is why its rejection cost so much.

**What the rhythm implies for scheduling.** First, the harvest is two thirds of the calls and
produces no artifact, so a lane must be budgeted as a long read followed by a short build; judging it
by visible output at the halfway point will call a healthy lane idle. Second, the build is an
edit-shaped loop with compile checkpoints, not a single write; a lane that writes once and verifies
once is the five-step sketch the skill warns about. Third, the expensive failure was a stale write,
so the read must be refreshed at the moment of writing, not at the moment of planning. Fourth, the
skill load belongs at the start of the build, not after it; the late load cost a full rewrite and two
stylesheet edits.

**What it never did.** It never built the site, never rendered the page, and never looked at it. The
brief forbade the build and the agent said so in its report. Every verification in the log is static:
greps, counts, a token comparison, a tag balance, and a `sass` compile. The page's actual appearance
was unverified when the lane finished.

## 6. What the log does not show

- No `design-pass` and no `component-pass`. The three-pass model in the skill was not run past the
  first pass: the page was never given a states and interactions pass, and it was never componentized
  or given a data contract.
- No build, no render, no screenshot, no browser check. The `:target` switching was verified by
  grepping the ids and the mode links, not by clicking them.
- No `SCHEME.md` (the agent checked and it does not exist in this package), no full read of
  `Overpass.ts`, `StepBatch.ts`, `Command.ts`, or `Source/Interface/Config.ts`, and no read of the
  Corca specimen corpus or the overtrue component corpus that the skill's research phase lists. The
  exemption band is grounded through the core dispatch and `Config.ts`, not through the arm files.
- No unused-token or dead-selector audit. The token check only asked whether every `var()` is
  defined.
- No use of the second HTML concept beyond its head, and no read of the fourth authority reference.
