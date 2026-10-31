# Dissection: the design pass on the manual sheet

The session is `c3b6f26c-81f6-4fbf-8feb-bf6697bb5fb4`, a delegated agent on the
`@cf/deepseek-ai/deepseek-v4.1-flash-1017` route at `max`. It took the study sheet at `/manual/`
(`Site/Source/pages/_Manual.astro` and `Site/Source/Stylesheet/Manual.scss`), which already carried
every fact, and gave it UI fidelity by reading the Corca corpus as text and the overtrue registry as
source, then editing the stylesheet in small slices with a compile between each.

The brief counted 216 tool calls and 190 steps. The decompressed log holds 217 `tool/call` events,
217 `tool/result` events, 191 steps, and 3 turns; the 217th call is the closing `send_message`
(call 217) and its step, so the brief's snapshot may simply predate it. This dissection classifies
all 217.

## How this was reconstructed

I decompressed the log with `zstd -dc` and parsed the JSONL into four streams: `tool/call` (the tool
name and the JSON `arguments`), `tool/result` (the text the agent saw), `assistant/message` (the
visible text and the `reasoning` blocks), and the turn and step boundaries. I read the call digest
end to end, the reasoning for every step that carried a decision, and the four large planning blocks
(steps 17, 29, 37, 47) in trimmed form, cross-checked against the calls they produced. Every clause
in the table below comes from a call's arguments or from its result. The `Pass-Log.md` was read only
afterwards, to compare the agent's own account with the record; where the two differ, the record
wins and the difference is noted.

## 1. Every tool call, in order

`Ph` is the phase: A audit, C corpus, S specimen, B first band, W write loop, V verification, F
follow-up. The phase definitions are in section 2.

| # | Ph | Tool | Target | For |
| --- | --- | --- | --- | --- |
| 1 | A | bash | repo root | Orient: `pwd` and list the working directory. |
| 2 | A | bash | `Source/pages/`, `Source/Stylesheet/` | Find the target page and stylesheet among the other pages. |
| 3 | A | read | `_Manual.astro` (whole) | Read the page to be redesigned, all 715 lines. |
| 4 | A | read | `Manual.scss` (whole) | Read the stylesheet to be redesigned, all 1064 lines. |
| 5 | C | bash | `Temporary/Corca/` | List the Corca shelf before reading it. |
| 6 | C | bash | `Temporary/Flywheel/`, `*-contracts.md` | List the other study sheets and the contracts. |
| 7 | C | read | `Specimens/Components.html` | Read the component specimen as markup. |
| 8 | C | read | `Specimens/Components.css` | Read the measured component CSS, the anatomy. |
| 9 | C | read | `Specimens/Flow.html` | Read the flow specimen: lanes, axis, percentage. |
| 10 | C | read | `Curated/Components.md` | Read the measured component inventory. |
| 11 | C | read | `Curated/Interaction-Model.md` | Read the interaction model. |
| 12 | C | read | `Curated/Design-Tokens.md` | Read the token mapping. |
| 13 | C | read | `Curated/State-Walk.md` | Read the state-walk method. |
| 14 | C | read | `Curated/Representations.md` | Read the representation model. |
| 15 | C | read | `Curated/Trace-UX-Model.md` | Read the trace's document shape. |
| 16 | C | read | `Compositions.md` | Read the operators and anti-combinations. |
| 17 | A | read | `Stylesheet/Global.css` | Read the token layer: surface, ink, accent, type, spacing. |
| 18 | A | read | `Stylesheet/Material.scss` | Read the cabinet mixins: slab, tray, label. |
| 19 | A | bash | component and layout inventory | List the site's components and layout, read the build config. |
| 20 | A | bash | `Source/`, `tsconfig.json` | Map the source tree and the alias config. |
| 21 | C | bash | Flywheel `Extracted/`, a contract | Inspect the Flywheel extractions and a contract head. |
| 22 | C | bash | overtrue registry and components | Inventory the registry: 113 compositions, 45 page components. |
| 23 | S | bash | overtrue line counts | Size the key compositions before reading them. |
| 24 | S | read | `event-timeline.tsx` | Read the timeline's row and marker mechanics. |
| 25 | S | read | `segmented-control.tsx` | Read the radio group, the mode switch's primitive. |
| 26 | S | read | `Specimens/States.html` | Read the state specimen, 118 cells. |
| 27 | S | read | `Specimens/Session.html` | Read the session specimen: rows, tabs, inspector. |
| 28 | S | read | `Specimens/Plugin.html` | Read the plugin specimen: default, interjection, result. |
| 29 | S | read | `Specimens/Trace-Prototype.html` | Read the trace prototype: line, gutter, band. |
| 30 | S | bash | `Observatory.html` structure | Locate the style, body, and script blocks. |
| 31 | S | bash | `Observatory.html` CSS | Read the observatory's component CSS. |
| 32 | S | bash | `Observatory.html` body | Read the inspector tabs and the explorer. |
| 33 | S | read | `detail-list.tsx` | Read the divided label/value row. |
| 34 | S | read | `steps.tsx` | Read the step rail and marker transitions. |
| 35 | S | read | `bullet-chart.tsx` | Read the readout anchored at the value. |
| 36 | S | bash | `tree-view.tsx` greps | Find the tree's current-row and focus mechanics. |
| 37 | S | bash | `log-stream.tsx` | Read the log's structure and sticky/gutter rules. |
| 38 | S | bash | `tree-view.tsx` rows | Read the row's ARIA and `data-state` markup. |
| 39 | S | read | `pages/harness.astro` | Read the recently designed page for house conventions. |
| 40 | S | bash | component list, `Line.scss` | Read the line's band, gutter, and paint-order comment. |
| 41 | S | bash | `SessionView.tsx` | Read the session island's shape and signals. |
| 42 | S | bash | `CopyButton.tsx` and its SCSS | Read the one existing island. |
| 43 | S | bash | `Layout/Base.astro` | Read the page shell: `main.page`, header, slot. |
| 44 | S | bash | `CopyButton` usages | Find where the island is mounted. |
| 45 | S | bash | `Lane.scss`, `SessionRecord.scss` | Read the percentage lane and the record band. |
| 46 | A | bash | git state of the manual files | Check whether the target is committed or dirty. |
| 47 | C | bash | Flywheel two-worlds sheet | Read the cross-world counterpart idea. |
| 48 | S | bash | contract section list | List the advanced component contract's sections. |
| 49 | S | bash | observatory contract head | Read the page contract's section list. |
| 50 | S | bash | contract state model | Read the independent state axes. |
| 51 | S | bash | `Curated/Primitives.md` | Read the harness primitive families. |
| 52 | S | bash | `Curated/Permutations.md` | Read the primitive-by-state permutation model. |
| 53 | S | bash | `SessionRecord.tsx` | Read the record row's markup and current state. |
| 54 | S | bash | `Icon.astro`, `Content/` list | Read the icon component and the content modules. |
| 55 | S | bash | `prettier.config.mjs` | Read the formatter's width, tabs, and quotes. |
| 56 | S | bash | `Documentation/` | Locate the design lab. |
| 57 | S | bash | `Design/` list, `Line.md` | List the storyboards; `Line.md` is missing. |
| 58 | S | bash | `Design/README.md`, `Flow.md` | Read the lab's conventions and the flow storyboard. |
| 59 | S | bash | `Flow.astro` | Read the site's flow component markup. |
| 60 | S | bash | `Flow.scss` head | Read the flow's grid, index, and 2px kind edge. |
| 61 | S | bash | `Flow.scss` tail | Read the `why` disclosure and the fail treatment. |
| 62 | S | bash | status-badge, ribbon-card, metric-group | Read the status dot, corner frame, metric group. |
| 63 | S | bash | stat-card, filter-bar greps | Find the stat card's slots and the chip focus ring. |
| 64 | S | bash | command-palette, deploy-pipeline, json-viewer | Find the focused row, the stage states, the copy. |
| 65 | B | write | `Documentation/Design/Pass-Log.md` | Write the thirteen exploration entries before the page. |
| 66 | B | write | `_Manual.astro` | Rewrite the whole page, same bands and facts, new states. |
| 67 | B | bash | `Base.astro` slot | Read the page shell's slot wrapper. |
| 68 | B | write | `Manual.scss` | Write the whole stylesheet: geometry, states, motion. |
| 69 | B | bash | compile `Manual.scss` | First compile to stdout with `sass`, exit 0. |
| 70 | B | bash | compiled CSS, `:has` rules | Inspect the compiled cross-highlight. |
| 71 | B | bash | compiled CSS, braces | A useless probe that matched the keyframes. |
| 72 | B | bash | compiled CSS, reduced motion | Inspect the compiled reduced-motion block. |
| 73 | B | bash | compiled CSS, mode states | Inspect the compiled mode state rules. |
| 74 | W | read | `_Manual.astro` 600+160 | Read back the decision spine after formatting. |
| 75 | W | read | `_Manual.astro` +120 | Read back the head and the modes. |
| 76 | W | bash | `Manual.scss` head, line count | Check the stylesheet after formatting. |
| 77 | W | bash | `&nbsp;` boundaries | Find the boundaries the formatter broke. |
| 78 | W | read | `_Manual.astro` 1000+40 | Read the note whose boundaries moved. |
| 79 | W | bash | `harness.astro` `&nbsp;` | Compare the site's own boundary pattern. |
| 80 | W | bash | parent `git show HEAD` | Try the parent repo's HEAD; empty. |
| 81 | W | bash | parent `git ls-files` | Check whether the page is tracked there. |
| 82 | W | bash | `Site/.git`, status | Discover that `Site` is its own repo. |
| 83 | W | bash | `Site` HEAD | Check the page's status; not in HEAD. |
| 84 | W | bash | `git show :path` | Extract the staged original: 715 lines and 1064. |
| 85 | W | bash | python word diff | Diff the visible text of the original and the new page. |
| 86 | W | bash | split list items | Inspect the formatter's `( ` breaks. |
| 87 | W | read | `_Manual.astro` 1135+60 | Read the two lists before editing them. |
| 88 | W | edit | `_Manual.astro` list 1 | Move the parens into the code spans. |
| 89 | W | edit | `_Manual.astro` list 2 | Move the parens into the code spans. |
| 90 | W | bash | python word diff | Re-diff: eight deletions, the conditions moved. |
| 91 | W | bash | grep the moved conditions | Verify the moved strings exist. |
| 92 | W | bash | grep escaped conditions | Verify the `&amp;&amp;` versions. |
| 93 | W | read | `_Manual.astro` 120+180 | Read back the modes and the canvas. |
| 94 | W | read | `_Manual.astro` 480+130 | Read back the artifact cards. |
| 95 | W | read | `_Manual.astro` 800+180 | Read back the registers. |
| 96 | W | read | `_Manual.astro` 980+200 | Read back the chain and the ledger. |
| 97 | W | read | `_Manual.astro` 1180+180 | Read back the pair and the run. |
| 98 | W | edit | `Manual.scss` copy import | Add the CopyButton import; failed, file changed since read. |
| 99 | W | read | `Manual.scss` +10 | Re-read the head so the edit is allowed. |
| 100 | W | edit | `Manual.scss` copy import | Retry the import; success. |
| 101 | W | bash | compile, grep copy-button | Compile 2; the copy rules appear. |
| 102 | W | bash | grep band-head selectors | Locate the band head and its 760 override. |
| 103 | W | read | `Manual.scss` 315+55 | Read the band head block. |
| 104 | W | edit | `Manual.scss` band head | Move the band index to the right of the label line. |
| 105 | W | read | `Manual.scss` 2024+30 | Read the 760 media query's band head. |
| 106 | W | edit | `Manual.scss` 760 band head | Keep the new columns at 760. |
| 107 | W | bash | compile, grep band head | Compile 3; inspect the emitted rules. |
| 108 | W | bash | grep cross-highlight | Locate the cross-highlight loop. |
| 109 | W | edit | `Manual.scss` cross-highlight | Keep the live node's accent name on hover. |
| 110 | W | bash | compile, sed the output | Compile 4; inspect the highlight. |
| 111 | W | bash | grep focus-visible | Locate the summary's focus rule. |
| 112 | W | read | `Manual.scss` 1080+55 | Read the caret and summary block. |
| 113 | W | bash | grep decision-summary | Find the summary block's line. |
| 114 | W | edit | `Manual.scss` summary press | Add the active press. |
| 115 | W | bash | grep reduced-motion | Locate the reduced-motion block. |
| 116 | W | edit | `Manual.scss` reduced motion | Add the press to the transform-none list. |
| 117 | W | bash | compile, grep summary active | Compile 5; the rule is emitted. |
| 118 | W | bash | grep `data-band="pair"` | Find the two pair bands. |
| 119 | W | read | `_Manual.astro` 921+6 | Read the first pair band's opening. |
| 120 | W | edit | `_Manual.astro` data-band | Rename the first pair band to `forms`. |
| 121 | W | bash | python balance check | Balance the markup; one false `</base>`. |
| 122 | W | read | `Pass-Log.md` 150+40 | Read the log entry to correct. |
| 123 | W | bash | grep log claims | Find the three claims to fix. |
| 124 | W | read | `Pass-Log.md` 138+30 | Read the accent-budget entry. |
| 125 | W | edit | `Pass-Log.md` accent | Four meanings becomes five, rejections added. |
| 126 | W | read | `Pass-Log.md` 205+30 | Read the mode-row entry. |
| 127 | W | edit | `Pass-Log.md` mode row | Correct the rejected list. |
| 128 | W | read | `Pass-Log.md` 245+20 | Read the audit entry. |
| 129 | W | edit | `Pass-Log.md` audit | Add Step 14 and the audit facts. |
| 130 | W | bash | grep 860 media query | Locate the 860 query. |
| 131 | W | edit | `Manual.scss` meta at 860 | Give the spec strip three columns. |
| 132 | W | bash | compile, ASCII, rule count | Compile 6; ASCII clean; ten rules. |
| 133 | W | bash | python sentence check | Check every original sentence; 15 false misses. |
| 134 | W | bash | grep owned and pair | Find the owned count and the pair div. |
| 135 | W | read | `_Manual.astro` 1139+4 | Read the owned div. |
| 136 | W | edit | `_Manual.astro` data-count | Remove the unused `data-count="two"`. |
| 137 | W | read | `_Manual.astro` 1208+4 | Read the pair div. |
| 138 | W | edit | `_Manual.astro` role group | Add `role="group"` to the pair. |
| 139 | W | bash | grep empty node | Find the empty node's sr-only text. |
| 140 | W | read | `_Manual.astro` 181+4 | Read the empty node. |
| 141 | W | edit | `_Manual.astro` sr-only | Change "no stage, off-path" to "empty, off-path". |
| 142 | V | bash | compile, balance, h1, JSX, ASCII | Compile 7 and the full check set; all clean. |
| 143 | V | bash | git diff stat, line counts | Summarize the two files and the log. |
| 144 | V | bash | git index state | Check what the index holds; the writes were staged. |
| 145 | V | bash | grep world-label | Locate the lane label rule. |
| 146 | V | edit | `Manual.scss` world label | Drop to 10px so the two-line name fits the 96px rail. |
| 147 | V | bash | compile, grep world label | Compile 8; the rule is emitted. |
| 148 | V | bash | count repeated elements | Count nodes, leaves, payloads, decisions, bands, modes. |
| 149 | V | send_message | parent | Report the pass, the files, and the states. |
| 150 | F | bash | curl `localhost:9999/manual/` | Read the user's live page; the dev server is the arbiter. |
| 151 | F | bash | plugin ledger, sessions | Read the real ledger lines and the recent sessions. |
| 152 | F | bash | `Content/Session.ts` head | Read the session content model. |
| 153 | F | bash | `Content/Session.ts` 120-300 | Read the records and the meta. |
| 154 | F | ask_user_question | user | Ask which content to cut; failed, owned by a live parent. |
| 155 | F | read | `_Manual.astro` 255+225 | Read the payload slots to condense them. |
| 156 | F | bash | session component sizes, usages | Size the island tree and find its usages. |
| 157 | F | bash | `SessionTree.tsx` | Read the tree's data imports. |
| 158 | F | bash | `Session.ts` exports | List the data exports and the helpers. |
| 159 | F | bash | `Session.ts` 900-1120 | Read the plugin list. |
| 160 | F | bash | `Session.ts` helpers | Read the helper implementations. |
| 161 | F | bash | `SessionDocument.tsx` | Read the document's data imports. |
| 162 | F | bash | `LaneStrip.tsx` | Read the lane's data imports. |
| 163 | F | bash | `InspectorLive.tsx` | Read the inspector; it reads no module data. |
| 164 | F | bash | `SessionRecord.tsx` | Read the current and plugin spans. |
| 165 | F | bash | `SessionView.scss`, spot grep | Read the view's grid and find the spot rule. |
| 166 | F | bash | grep spot, SCSS tail | Find the spot block. |
| 167 | F | read | `Session.ts` 100+40 | Read the interfaces before adding one. |
| 168 | F | read | `Session.ts` 918+30 | Read the plugin array's end. |
| 169 | F | edit | `Session.ts` | Add the `SessionData` interface. |
| 170 | F | edit | `Session.ts` | Add the `Session` default after the plugin array. |
| 171 | F | edit | `Session.ts` Timeline | Add the optional `Data` argument. |
| 172 | F | edit | `Session.ts` TotalOf | Add the optional `Data` argument. |
| 173 | F | edit | `Session.ts` TurnRecord, StepsOf | Add the data argument and the `StepsOf` derivation. |
| 174 | F | read | `SessionView.tsx` (whole) | Read the island before editing. |
| 175 | F | edit | `SessionView.tsx` | Add `Data?` and `Start?`, pass `Data` down. |
| 176 | F | write | `SessionTree.tsx` | Rewrite with `Data`; failed, not read. |
| 177 | F | read | `SessionTree.tsx` 20 | Read the head so the write is allowed. |
| 178 | F | write | `SessionTree.tsx` | Rewrite with the `Source` fallback. |
| 179 | F | read | `SessionDocument.tsx` 20 | Read the head. |
| 180 | F | write | `SessionDocument.tsx` | Rewrite with the `Source` fallback. |
| 181 | F | read | `LaneStrip.tsx` 20 | Read the head. |
| 182 | F | write | `LaneStrip.tsx` | Rewrite with the `Source` fallback. |
| 183 | F | write | `Content/Activation.ts` | Create the activation run; failed, the file exists. |
| 184 | F | bash | test `Activation.ts` | Discover the file already exists. |
| 185 | F | read | `Activation.ts` (whole) | Read the existing activation-line module. |
| 186 | F | write | `Content/Manual.ts` | Create the manual's own run instead. |
| 187 | F | read | `_Manual.astro` +10 | Read the frontmatter. |
| 188 | F | edit | `_Manual.astro` import | Import the Manual data. |
| 189 | F | read | `_Manual.astro` 1344+10 | Read the `SessionView` mount. |
| 190 | F | edit | `_Manual.astro` mount | Pass `Data={Manual} Start={7}`. |
| 191 | F | read | `Manual.scss` 1818+45 | Read the spot block. |
| 192 | F | edit | `Manual.scss` spot | Mark the selected record, not the gate's `__by`. |
| 193 | F | bash | compile, curl | Compile 9; read the live page: 200, 267 KB. |
| 194 | F | bash | python extract | Extract the session view; hit the CSS first. |
| 195 | F | bash | python visible text | Extract the visible text, skipping style and script. |
| 196 | F | bash | python run band | Inspect the run band's text. |
| 197 | F | bash | python lane | Inspect the lane's text. |
| 198 | F | bash | `FormatTick` | Read the tick formatter. |
| 199 | F | bash | formatters | Read the rest of the formatters. |
| 200 | F | read | `Manual.ts` 27+30 | Read the records before changing the durations. |
| 201 | F | edit | `Manual.ts` durations | Set 1.2s, 6s, 0.8s for an 0-8s axis. |
| 202 | F | read | `Manual.ts` 66+25 | Read the read record. |
| 203 | F | edit | `Manual.ts` read took | Set the read to 800ms. |
| 204 | F | read | `_Manual.astro` 1316+25 | Read the knob and no-op panel. |
| 205 | F | read | `_Manual.astro` 1340+12 | Read the run band head. |
| 206 | F | edit | `_Manual.astro` band title | Retitle to "One turn, the hook brought out". |
| 207 | F | bash | curl, checks | Read the live page again; the new title and the 0-8s axis. |
| 208 | F | skill | `design-pass` | Load the skill that now matches the task. |
| 209 | F | bash | `ls` skill references | Look for the references; the directory is empty. |
| 210 | F | bash | `Pass-Log.md` tail | Read the learned rules. |
| 211 | F | read | `Pass-Log.md` 504+20 | Read the verification step's tail. |
| 212 | F | edit | `Pass-Log.md` | Append Step 26, the parameterization. |
| 213 | F | read | `Pass-Log.md` 578+18 | Read rules 7 and 8. |
| 214 | F | edit | `Pass-Log.md` rule 8 | Add the parameterize-with-a-default lesson. |
| 215 | F | bash | island props | Verify the `Data` prop is serialized for hydration. |
| 216 | F | bash | compile, ASCII, h1, curl `/trace/` | Compile 10; ASCII clean; the trace page still renders the shared session. |
| 217 | F | send_message | parent | Report the follow-up. |

## 2. The phases

| Phase | Calls | Count | What it did |
| --- | --- | --- | --- |
| A. The audit | 1-4, 17-20, 46 | 9 | Oriented, read the page and the stylesheet whole, read the token layer and the material mixins, inventoried the components, checked the git state of the target. |
| B. The corpus read | 5-16, 21-22, 47 | 15 | Listed the Corca shelf, read seven specimens and six curated documents and the compositions, then the Flywheel sheets and the overtrue inventory. |
| C. The specimen study | 23-45, 48-64 | 40 | Sized and read the overtrue compositions, read the remaining specimens and the contracts, read the site's own components and the formatter config. |
| D. The first band | 65-73 | 9 | Wrote the log's thirteen exploration entries, rewrote the whole page and the whole stylesheet in two writes, compiled once, inspected the compiled CSS. |
| E. The write loop | 74-141 | 68 | Read the page back after the formatter, recovered the original from the git index, diffed the facts, then edited band by band with a compile between. |
| F. The verification | 142-149 | 8 | Ran the closing check set, counted the repeated elements, checked the index state, fixed the lane label, reported. |
| G. The follow-up | 150-217 | 68 | Read the user's live page, tried to ask a scope question, parameterized the session island with a `Data` prop, authored a three-record activation run, verified against the running dev server. |

The phases are not disjoint in time. The verification is woven through the write loop as one compile
per one or two edits, and the phase-F checks are the same checks run once more over the finished
file. The first band was never built on its own: the agent wrote the whole page and the whole
stylesheet in two calls, so the band-by-band discipline begins only in phase E, as a correction of
that first move.

### Phase A: the audit (calls 1-4, 17-20, 46)

It read the target whole before anything else (calls 3 and 4, 715 and 1064 lines), then the token
layer and the material mixins (17 and 18), then the component inventory and the alias config (19 and
20), then the git state of the two files (46). The audit's facts were assembled in the reasoning at
step 37 and written into the log only at call 129, after the code existed. That is a finding about
the record, not a defect of the pass: the audit was real, but the log's audit entry is a
reconstruction written from the finished page, not a contemporaneous note.

### Phase B: the corpus read (calls 5-16, 21-22, 47)

Fifteen calls, all reads of text. It read the seven specimens and the six curated documents, the
compositions, the Flywheel sheets, and the registry inventory. No image was opened; every specimen
was read as markup and CSS. The output of this phase is the mechanics list that the reasoning names
at step 17: the paint-order band, the lane's percentage track, the radio tabs, the gutter, the
current-row marker, the lamp, the spec strip, the ruled spine, the display pair, the disclosure, the
copy island.

### Phase C: the specimen study (calls 23-45, 48-64)

The largest reading phase, 40 calls. It sized the overtrue files before reading (23), read the
compositions the brief named, read the site's own components (Line, Lane, SessionRecord, Flow,
CopyButton, Base), read the contracts' state model, and read the formatter config. The decisive find
was the site's own `Flow` component: its `why` disclosure, 40px index, and 2px kind edge became the
decision spine's grammar (calls 59-61), which is why rule 8 exists.

### Phase D: the first band (calls 65-73)

Nine calls. It wrote the log's thirteen exploration entries before touching the page (65), then the
page (66, 47,916 characters), then the stylesheet (68, 45,993 characters), then compiled (69), then
inspected the compiled CSS (70-73). The "first band" is inside calls 66 and 68; no band was built
alone. The phase's real output is 94 KB of source and one compile, and its real cost is the 75-call
correction tail that phases E and F exist to pay.

### Phase E: the write loop (calls 74-141)

Sixty-eight calls. It read the page back after the formatter (74-78, 93-97), recovered the original
from the git index (80-84), diffed the facts (85, 90-92, 133), and ran ten band groups (86-147; the
last two cycles are counted in phase F because they double as the closing checks). The
loop proper is described in section 3. Its shape is the point: after the big write, the agent never
re-read a whole file again; it grepped, read a slice, edited one block, compiled, and grepped the
next selector.

### Phase F: the verification (calls 142-149)

Eight calls. The closing check set (142: compile, markup balance, one `h1`, no `{" "}`, ASCII), the
diff stat and line counts (143), the index state (144), the last design fix (146: the lane label at
10px), the element counts (148), and the report to the parent (149). The verification is not a
separate activity in this pass; it is the loop's fifth move run over the whole file one last time.

### Phase G: the follow-up (calls 150-217)

Sixty-eight calls. It read the user's live page and the plugin's real ledger (150-151), read the
session data model (152-173), tried and failed to ask a scope question (154), parameterized the
session island with a `Data` prop and a `Session` default (169-190), authored the three-record
activation run (186), fixed the axis and the title (198-206), appended Step 26 and extended rule 8
in the log (210-214), and verified against the running dev server (193-197, 207, 215-216). The
follow-up is a different kind of work from the pass: it is data plumbing, not design, and it is the
only part of the record where the agent reads a rendered page.

## 3. The write loop

This is the mechanic that made the page good, and it did not exist at the start. The agent's first
move was two writes of 47,916 and 45,993 characters (calls 66 and 68) and one compile (69). The loop
begins only after that, when the agent has to repair, verify, and refine what the two writes made.
Its unit is one band.

### The cycle

Each cycle is five moves, in this order:

1. **Locate.** A `grep -n` on the source for the selector or attribute the band owns. The grep is
   chosen to return every hit, including the base rule and its media override: call 102 greps
   `&__band-head|&__band-index|&__band-body|&__band-label|&__band-row` and gets six lines, 318 to
   349 and 2026. Call 118 greps `data-band="pair"` and gets both pair bands, 923 and 1183.
2. **Read the slice.** A `read` with `offset` and `limit` around the hit, never the whole file. The
   slice is 4 to 6 lines when the change is an attribute (calls 119, 135, 137, 140), 30 to 60 lines
   when the change is a block (calls 103, 105, 112, 87). In the loop proper, 13 slice reads for 17
   edits, median slice about 40 lines.
3. **Edit one block.** One `edit` call, one band, one change. When the band needs two places (the
   desktop rule and the 760 override, the press and the reduced-motion guard), the agent edits them
   as two calls in the same cycle (104 and 106; 114 and 116).
4. **Compile.** One `sass` compile to `/tmp/manual.css`, with the exit code printed. The agent
   compiled 5 times inside the loop for 17 edits, roughly once every three edits, and 8 times in
   turn 1 in total.
5. **Grep the emitted selector.** After the compile, a grep on the compiled CSS to prove the rule
   survived the nesting and the `@for`: call 107 greps
   `sheet__band-head|sheet__band-body|sheet__band-label`, call 110 reads the compiled highlight,
   call 117 greps `sheet__decision-summary:active`. This is the check that catches a nested rule
   that compiled to the wrong selector.

Then the next grep. The next selector is never found from memory or by re-reading the file; it is
found by grepping the source for the thing the band owns.

### The formatter is a co-author

The `write` and `edit` tools reformat the file after the write. The agent discovered this at step 53,
when the page it wrote as 1300 lines came back as 1370 with every attribute broken across lines.
Two consequences run through the loop:

- The formatter broke `(Overpass, StepBatch)` into `( Overpass, StepBatch)` by wrapping after the
  open paren. The agent fixed it by moving the parens inside the `<code>` spans (calls 88 and 89),
  which is the one edit in the loop that changes the rendered text on purpose.
- The formatter changes the file between the read and the edit. Call 98 failed with "file changed
  since it was read"; the recovery was a fresh `read` of ten lines (99) and the same edit again
  (100). After that, every edit cycle begins with a read of the slice it is about to touch.

### The fact checks inside the loop

The loop is not only visual. Twice the agent stopped the edits to prove the facts survived:

- The word diff (call 85) compared the visible text of the staged original (`git show :path`, 715
  lines) with the new page: 957 words against 1184. The eight reported entries were five deletions
  of condition strings that moved from the summary into the disclosure, plus three replace entries
  that were word-alignment artifacts around those moves. Call 90 re-ran it after the paren fix:
  1180 words, eight entries, and the greps at 91-92 proved every moved string was present.
- The sentence check (call 133) was too coarse, because the inserted UI words break the sentence
  boundaries; it reported 15 false misses and the agent fell back to the word diff.

### The band groups

| Band | Calls | Edits | Slice reads | Compiles | What changed |
| --- | --- | --- | --- | --- | --- |
| Split lists | 86-92 | 2 | 1 | 0 | Parens into the code spans, verified by the word diff. |
| Copy import | 98-101 | 2 (1 failed) | 1 | 1 | `@use "Component/CopyButton"`. |
| Band head | 102-107 | 2 | 2 | 1 | Index to the right of the label, 760 override. |
| Cross-highlight | 108-110 | 1 | 0 | 1 | Live node keeps its accent name. |
| Decision press | 111-117 | 2 | 1 | 1 | Active press plus the reduced-motion guard. |
| Band attribute | 118-121 | 1 | 1 | 0 | `pair` renamed to `forms`. |
| Log corrections | 122-129 | 3 | 4 | 0 | Three entries corrected against the code. |
| Meta at 860 | 130-132 | 1 | 0 | 1 | Three columns for the spec strip. |
| Markup a11y | 133-142 | 3 | 3 | 1 | Unused attribute, `role="group"`, sr-only text. |
| World label | 145-147 | 1 | 0 | 1 | 10px label for the 96px rail. |

Ten groups, seventeen edits, thirteen slice reads, five compiles. The mean is 1.7 edits per band,
the median is 1. The largest band (the markup a11y pass) is three edits in one group; the smallest
is one edit and no read, found by grep alone.

### What the loop implies

The loop is cheap per cycle and expensive to enter. A cycle costs about 5 calls (grep, read, edit,
compile, grep) and one to two minutes; the whole loop of ten bands cost 62 calls and about 12
minutes. The expensive part is the 75-call entry (calls 74 to 85 plus the read-backs), which exists
only because the two big writes came first. If the first band had been written, compiled, and
checked before the second, the formatter, the paren break, the `&nbsp;` question, and the missing
copy import would have surfaced in the first ten calls instead of the sixtieth.

## 4. The turns

### Turn 1: the design pass (steps 1-127, calls 1-149, 29.4 minutes)

Asked: read the visual corpora widely, keep the bands and the facts, and give every interactive
element its states, its interactions, the micro-mechanics, the detail fidelity, and guarded motion;
write `Pass-Log.md` as a second deliverable with a `Read/Took/Decided/Built` entry per decision and
a closing set of five to ten learned rules; obey the binding rules (site tokens only, no `{" "}`,
`&nbsp;` at every boundary, no `.mjs`, one `h1`, ASCII, no fact or band changes, edit tools only).

Decided: read the corpus before touching the page, write the log's exploration entries first, then
rewrite the page and the stylesheet whole, then verify and correct in slices. The agent chose the
big write because the page was 715 lines and the stylesheet 1064, and it judged a full rewrite
cheaper than 20 band edits.

Where it changed course:

- The formatter discovery (steps 53-57). The page came back reformatted, the `&nbsp;` boundaries sat
  at line ends, and the agent spent four calls comparing the pattern with `harness.astro` before
  deciding the site's own precedent was acceptable. It changed course only for the parens, which it
  fixed in the source.
- The original's location (calls 80-84). The agent assumed the page was committed in the parent
  repo; it was not, and `Site` was its own repo with the page staged, not committed. The original
  came from `git show :path`.
- The band head (calls 102-107). Reading the compiled CSS showed the index indenting the machine
  under it; the agent moved the index to the right of the label line and then had to fix the 760
  override it had written an hour earlier.
- The cross-highlight (call 109). The hover rule was stepping the live node's accent name to ink,
  which erased the one meaning the accent carries on the canvas; the fix excludes the live node.
- The state set (step 88). The brief asked for "every state" on every interactive element; the agent
  decided a reveal target has no selected state and a reading surface has no press, declared the
  disabled mode without an instance, and wrote the reasoning into the log.
- The accent budget (calls 123-125). The log said four meanings; the stylesheet had five. The agent
  corrected the log to five rather than the stylesheet to four, because the fifth (the proof
  plate's copy control) was a real meaning.

### Turn 2: the permission note (1 step, 0 calls, 0.3 minutes)

Asked: "can also use the raw-write tool if you're encountering errors with the built in ones."

Decided: nothing needed it. The agent replied that the write and edit calls went through, apart from
the one stale read on `Manual.scss`, which it had resolved by re-reading. It did not start new work
and did not use `raw-write`. The reply also named the formatter as the reason the `&nbsp;` boundaries
sit at line ends.

### Turn 3: the follow-up (steps 1-63, calls 150-217, 11.9 minutes)

Asked: "the `http://localhost:9999/manual/#show`, needs less content, not less simplicity and it
needs to showcase a run (or a turn) where the plugin was activated." Two interjections arrived
mid-turn: "this is the import `SessionView` from `@Component/SessionView.tsx`; component I'm talking
about" and "but it's being shown. (as it should, just needs to be parameterized)."

Decided, first: read the live page and the plugin's real ledger, then cut content and condense the
payload strip. The agent read 225 lines of the payload block (call 155) in preparation for the cut,
and tried to ask the user which content to remove (call 154); the question failed because the agent
is owned by a live parent, so it decided to act on the least destructive reading and report the
ambiguity.

Where it changed course:

- The interjections redirected the plan. The SessionView is the component; it is shown; it needs
  parameterization. The agent abandoned the content cut, kept every band, and made the run the
  thing that changes (steps 5-8).
- The data model (calls 158-173). The helpers read the module arrays directly, so the agent added a
  `SessionData` interface, a `Session` default, and an optional `Data` argument on six helpers, then
  passed `Data?` through the four child components. The trace and package pages keep the default.
- The activation file (calls 183-186). The agent assumed `Content/Activation.ts` was free; it
  existed and holds the activation-line content. The write failed, the agent read the file, and it
  created `Content/Manual.ts` instead.
- The axis (calls 198-203). The rendered lane rounded a 1.4s run to three identical "1s" ticks, so
  the agent re-authored the durations to 1.2s, 6s, and 0.8s for an 0-8s axis.
- The title (calls 204-206). "The whole run" was no longer true of a one-turn run, so the band
  title became "One turn, the hook brought out".

## 5. The mistakes and the recoveries

| # | Calls | The mistake | The recovery |
| --- | --- | --- | --- |
| 1 | 66, 68 | Wrote the whole page and stylesheet in two calls, then discovered the formatter had rewritten both. | Read the files back in eleven slices (74-78, 93-97) and started the slice loop. |
| 2 | 77-79 | Four calls spent on whether the formatter's `&nbsp;` line breaks double the space. | Compared with `harness.astro`, accepted the site's own precedent, fixed only the parens. |
| 3 | 80-83 | Four calls looking for the original in the parent repo's HEAD, then in `Site`'s HEAD. | `git show :path` (84) read the staged original. |
| 4 | 86-89 | The formatter broke `(Overpass, StepBatch)` into `( Overpass, StepBatch)`, a visible text change. | Two edits moved the parens into the code spans; the word diff (90) proved the text was whole. |
| 5 | 98 | Edited `Manual.scss` after the formatter changed it; the edit was rejected. | Re-read ten lines (99), retried the same edit (100). |
| 6 | 71 | `grep -n "{"` on the compiled CSS, which matched the keyframes and told the agent nothing. | None; a wasted call. |
| 7 | 121 | The parser balance check reported `stray </base>`. | Recognized the `Base` component lowercased to the void `base`; recorded it as a known artifact. |
| 8 | 133 | The sentence-substring check reported 15 missing sentences. | Recognized the insertions broke the sentence boundaries; fell back to the word diff. |
| 9 | 154 | `ask_user_question` is unavailable to an agent owned by a live parent. | Decided the least destructive reading and put the open question in the final result. |
| 10 | 176 | Rewrote `SessionTree.tsx` after reading it with `bash cat`, not the read tool; rejected. | Read 20 lines with the read tool (177), retried (178). |
| 11 | 183-184 | Assumed `Content/Activation.ts` was a new file; it existed. | Read it (185), chose `Content/Manual.ts` (186). |
| 12 | 209 | Looked for the `design-pass` skill's references; the directory was empty at the time. | Proceeded on the skill text and the log's own rules. |

The pattern behind mistakes 1, 2, 4, 5, and 7 is one cause: the two big writes put 94 KB of
formatted source between the agent and the first compile. The pattern behind 9, 10, and 11 is
another: the agent acted on an assumption about a file or a tool that one cheap check would have
settled. The recoveries are all cheap; the mistakes are all avoidable by checking first.

## 6. The rhythm

| Measure | Turn 1 | Turn 2 | Turn 3 | Total |
| --- | --- | --- | --- | --- |
| Steps | 127 | 1 | 63 | 191 |
| Tool calls | 149 | 0 | 68 | 217 |
| bash | 82 | 0 | 28 | 110 |
| read | 45 | 0 | 17 | 62 |
| edit | 18 | 0 | 14 | 32 |
| write | 3 | 0 | 6 | 9 |
| send_message | 1 | 0 | 1 | 2 |
| other | 0 | 0 | 2 | 2 |
| Compiles | 8 | 0 | 2 | 10 |
| Curls of the live page | 0 | 0 | 4 | 4 |
| Wall clock | 29.4 min | 0.3 min | 11.9 min | 41.6 min |
| Calls per minute | 5.1 | - | 5.7 | 5.2 |

The ratios that matter for scheduling:

- **Reads to writes.** 62 reads and 45 bash calls that carry a grep against 31 successful edits and
  7 successful writes. The pass is a reading pass that occasionally writes; the reading is not
  overhead, it is the work.
- **Edits per band.** 1.7 on average, 1 at the median, 3 at most. A band is one block, not a
  campaign.
- **Compiles per edit.** 0.44 across turn 1 (8 compiles, 18 edit calls), 0.29 inside the loop. The compile is the cheapest
  arbiter available when the build is forbidden: one call, under two seconds, and it catches every
  Sass error and every nested selector that compiles to the wrong shape.
- **The entry cost.** 64 calls before the first write, 87 before the first page edit. Most of that
  is the corpus and the specimen study, which a second page in the same house does not need to
  repeat.
- **The correction tail.** The two big writes took 2 calls; the correction and verification took 75
  (74-148). The loop is not slower than the big write; it is the only part that produced a correct
  page.

### Scheduling the same pass on another page

Budget, for a page of the same size (about 1,300 lines of markup and 2,000 of stylesheet) in the
same house:

1. **Audit and corpus, 20 to 30 calls.** Reuse the notes from this pass: the mechanics list, the
   corpus map, and the site's own component inventory are already written down. Read the target page
   and stylesheet whole, the token layer, and the site's own components; skip the shelf.
2. **First band, 3 to 5 calls.** Write one band, compile it, grep the emitted selector, and read it
   back. Do not write the page.
3. **The loop, 50 to 60 calls.** Eight to ten bands at 5 calls each: grep, slice read, edit (one or
   two), compile, emitted-selector grep. Expect 1.7 edits per band and one compile per two edits.
4. **The log, 3 to 6 calls.** One entry per band as you go, not at the end.
5. **Verification, 6 to 10 calls.** Compile, parser balance, word diff against the index original,
   ASCII scan, one `h1`, no `{" "}`, and a read of the running page if one exists.
6. **Total: 80 to 110 calls, 20 to 25 minutes** at the observed 5 calls per minute, against the 217
   calls and 42 minutes this pass took. The saving comes from two places: the corpus is not re-read,
   and the correction tail does not exist because the first band is compiled before the second is
   written.

The three failure modes to schedule against: the big write (it converts 2 calls into 75), the
formatter (it invalidates every read and rewrites every boundary), and the assumption about a file
or a tool (one check settles it; skip the check and pay for a retry).

## 7. What the log does not show

- **The page itself.** No screenshot, no render, and no browser in turn 1. Every visual claim in
  the pass rests on the compiled CSS, the reasoning, and the agent's reading of the markup. The
  follow-up reads the user's running server, but only as HTML text through `curl` and a parser;
  nobody looked at a picture of the page.
- **A type check.** The compile is Sass only. The follow-up's TypeScript changes are checked by the
  dev server rendering a 200, not by `tsc`; a type error that does not throw at render time would
  survive.
- **The private reasoning.** The log stores the visible text and the reasoning blocks, not the
  model's internal deliberation. The reasoning blocks are the agent's own narration, and the large
  planning blocks (steps 17, 29, 37, 47) are where the design was actually decided.
- **A commit.** Nothing was committed in either repo. The Site repo's index holds the agent's writes
  because the tooling stages them; the working tree is the deliverable.
- **The log's own count.** The report at call 149 says "25 steps"; Step 26 was appended at call 212.
  The final log has 26 steps and 10 learned rules.
- **The measurements that came from taste.** The 96px rail, the 72px mark plate, the 40px band
  index, the 10px micro scale: the log gives reasons for some, and the reasoning gives more, but the
  exact numbers are not derivable from the corpus alone. A later agent should copy the numbers from
  the stylesheet, not re-invent them.
- **The Pass-Log's rules are not independently validated.** The same agent that did the work wrote
  them. This dissection re-derives each one from the calls, and the skill gives every rule the call
  numbers that paid for it, so the next agent can check the evidence instead of trusting the rule.
