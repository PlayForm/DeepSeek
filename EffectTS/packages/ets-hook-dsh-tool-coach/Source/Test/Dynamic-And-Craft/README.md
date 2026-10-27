# Dynamic-And-Craft

What this test verifies.

## Intent

This folder covers the fetch/cache paths of the dynamic-instruction engine plus the detection craft library.

D2: a throwing `ctx.tools.schemas()` degrades the note to the STATIC tool table with the byte-exact fetch-failure line (exactly once, fetched per note), while the waterfall continues.

D3: the section table is capped at maxSectionTools rows, ordered by mapped-class priority (write, read, search, discovery, control) and topped up alphabetically from non-mapped live tools.

D4: the section cache rebuilds at sectionTtl judged calls and on tools/change, each path with its own ledger line, clearing the per-agent cache.

D5: fetchLive=false uses the static table only (never a fetch-failure line), and the volatile flips (fetchLive, maxSectionTools, threshold) land on the State through the P10 loader/volatile-update dispatch without a remount.

The craft battery classifies every obfuscated variant, the catch-all, and the exemption rows.

The assertions are moved verbatim from `Classic/smokes/tool-coach-smoke.mjs` (D2 + D3 + D4 + D5 + the craft battery).

## Scenario

- Group: D2 - the fetch failure (schemas() throws "registry exploded").
    - Check: "D2: the note degrades to the STATIC tool line (no live fixture marker)".
    - Check: "D2: the fetch-failure ledger line is byte-exact (exactly once - fetched per note)".
    - Check: "D2: the waterfall continues (the note never fails it)".
    - Check: "D2: the strike line is unchanged under the fallback".
- Group: D3 - the section cap (maxSectionTools=3), then D3b (cap 24).
    - Check: "D3: exactly maxSectionTools (3) rows".
    - Check: "D3: the rows follow the mapped-class priority (write tools first, then read) - no search/discovery/control rows".
    - Check: "D3b: the cap-24 table holds every mapped tool plus the top-up".
    - Check: "D3b: the mapped order is write, read, search, discovery, control (first appearance within a class)".
    - Check: "D3b: non-mapped live tools top up the table" (web_search, zzz_fixture).
    - Check: "D3b: the top-up is alphabetical".
- Group: D4 - the section cache (sectionTtl=2).
    - Check: "D4: the first build is silent".
    - Check: "D4: the TTL path logs 'section rebuilt (ttl 2)'".
    - Check: "D4: the tools/change path logs 'section rebuilt (tools/change)'".
    - Check: "D4: the registry tracks the live agent states".
    - Check: "D4: tools/change cleared the section cache".
    - Check: "D4: the post-invalidation rebuild is silent (only the two path lines exist)".
- Group: D5 - fetchLive=false + the volatile flips.
    - Check: "D5: fetchLive=false - the note uses the static table only".
    - Check: "D5: no fetch-failure line is ever logged with fetchLive=false".
    - Check: "D5: the fetchLive flip lands on the State without a remount".
    - Check: "D5: the maxSectionTools flip lands on the State".
    - Check: "D5: the threshold flip lands on the State".
    - Check: "D5: the flipped fetchLive is picked up on the next judged call (live text, no remount)".
    - Check: "D5: the flipped threshold=2 is picked up too (byte-exact strike line)".
- Group: the craft library - 17 classification checks (`craft: <command> -> <kind>/<class>`): 11 offense/write variants, 1 offense/search, 1 none (ssh), 1 exempt (git diff), 1 offense/write (journalctl redirect), 1 none (git stash), 1 offense/write (tracked file redirect), 1 offense/write (compound statement).

## Fixtures

The harness world: a fresh `Make(Validate({ logFile: Ledger, ... }))` per sub-group against the cleared harness tmpdir ledger, the `Post`/`Assemble` waterfall helpers, the live registry schema fixture (D3b's top-up and D5's flipped fetchLive need it), a throwing tools.schemas stub for D2/D5, the State.Registry probe for D4, and the pure `Detect` function with the actual DEFAULT_PATTERNS/DEFAULT_EXEMPTS for the craft battery.

The virtual clock is the judged-call counter: D4's TTL is crossed at calls=11 versus the first build at calls=9 (11-9 >= 2), with no timers involved.

## Expected ledger strings (byte-exact)

- `: schema fetch failed -> static fallback` (D2, exactly once)
- `: strike 3/3 bash read -> note read` (D2, unchanged under the fallback)
- `: section rebuilt (ttl 2)` and `: section rebuilt (tools/change)` (D4)
- `: strike 2/2 bash read -> note read` (D5, the flipped threshold)
- No `schema fetch failed` line at all with fetchLive=false (D5)
- The static tool line: `- read: <STATIC_TOOL_LINES.read.description> (key parameter: file_path).`

## Edge cases

- The cap boundary: maxSectionTools=3 yields only mapped tools (no top-up), while the cap 24 yields all 11 mapped plus the alphabetical top-up.
- The cache invalidation clears the per-agent sectionCache (probed via State.Registry), and the rebuild afterwards is silent.
- The volatile flips mutate the cells of the SAME validated config object and re-dispatch through the P10 listener, so the next judged call picks up the new values with no remount and no second activation line.
- The craft battery includes the catch-all classes (redirect to a tracked file, compound statements) and both non-offense kinds (none, exempt).

## Expected count

40 PASS.
