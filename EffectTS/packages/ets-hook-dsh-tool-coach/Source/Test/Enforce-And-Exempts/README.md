# Enforce-And-Exempts

This test verifies the following behavior.

## Intent

This folder covers the outer edges of the ladder: tier 3 (opt-in enforce) and tier 0's exemptions.

Under `enforce: "write"` the tier-3 deny fires for the write class at the threshold with the byte-exact NOTE_DENIED reason (carrying the fetched edit entry, U+2014 before it), the denied ledger line is byte-exact, and the read class stays allowed.

Under `enforce: "all"` the read class is denied too, and under `enforce: "off"` nothing is ever denied.

The exemptions behave as follows: the carve-out patterns (cat|jq) log their exempt line exactly once per pattern per agent, `enabled: false` is the full passthrough (the byte-exact disabled line, with every listener returning next() untouched), and an emptied pattern table is the N=0 passthrough.

The assertions are moved verbatim from `Classic/smokes/tool-coach-smoke.mjs` (R5 + R6).

## Scenario

- Group: R5 - enforce.
    - Sub: "R5: the tier-1 note fired at the write-class threshold on the way" (7 sed -i offenses under enforce=write)
    - Sub: "R5/D1: the deny reason is the byte-exact NOTE_DENIED text with the fetched edit entry" (the full `Blocked by tool-coach: ...` sentence)
    - Sub: "R5: the denied ledger line is byte-exact: 'denied bash write <sed row> -> use edit'"
    - Sub: "R5: read class is NOT denied under enforce='write'"
    - Sub: "R5: under enforce='all' the read class IS denied"
    - Sub: "R5: under enforce='off' nothing is ever denied"
- Group: R6 - exempt + enabled=false + N=0.
    - Sub: "R6: rm/git commit/cp/echo/python script.py write NO lines (not even exempt)"
    - Sub: "R6: the cat|jq carve-out logs the exempt line once: 'exempt bash <carve-out>'"
    - Sub: "R6: the exempt line is deduped per distinct pattern per agent" (cat f.json|jq then cat g.json|jq - same pattern row, one line)
    - Sub: "the durable ledger file carries the [ISO] exempt line"
    - Sub: "R6: the disabled ledger line is byte-exact: 'disabled (enabled=false)'"
    - Sub: "R6: enabled=false - every listener returns next() untouched (full passthrough)"
    - Sub: "R6: enabled=false writes no offense lines"
    - Sub: "R6: an emptied pattern table = N=0 passthrough"
    - Sub: "R6: N=0 writes no offense lines"

## Fixtures

The fixtures use the harness world: a fresh `Make(Validate({ logFile: Ledger, ... }))` per sub-scenario (six applies: enforce=write, enforce=all, enforce=off, default, enabled=false, patternTable=[]) against the cleared harness tmpdir ledger, the `Pre`/`Post` waterfall helpers, and the pattern-row locators from the actual DEFAULT_PATTERNS/DEFAULT_EXEMPTS (so the expected strings cannot drift from the table).

## Expected ledger strings (byte-exact)

- `: strike 3/3 bash write -> note edit` (the tier-1 note on the way to the deny)
- The deny reason: `Blocked by tool-coach: "sed -i s/x/y/ f" is forbidden (write-class bash pattern). Use the edit tool for this operation instead` + U+2014 + ` Edit an existing UTF-8 text file by replacing literal text. (key parameter: old_string). Then rerun only the legitimate command parts (build/test/git), if any.`
- `: denied bash write <sed row> -> use edit` (the row containing `\bsed\b`)
- `: exempt bash <carve-out>` and its durable `] exempt bash <carve-out>` form (the row containing `jq`)
- `hook-dsh-tool-coach: disabled (enabled=false)`

## Edge cases

- enforce='write' scopes the deny to the write class only (cat stays allowed), 'all' widens it, and 'off' disables the tier entirely.
- The exempt dedup is per distinct pattern row per agent, so a second matching command logs nothing.
- enabled=false short-circuits BEFORE detection (not even an offense line), while the empty pattern table keeps detection armed but with zero patterns (the N=0 rule).

## Expected count

15 PASS.
