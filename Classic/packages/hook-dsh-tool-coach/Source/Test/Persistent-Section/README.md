# Persistent-Section

This test verifies the following behavior.

## Intent

Tier 2 of the coaching ladder is the persistent system-prompt section.

At the escalation threshold (6 strikes since the note) the section turns on with its byte-exact line, and the system-prompt/assemble waterfall then appends EXACTLY one section - named `hook-dsh-tool-coach`, headed by the verbatim `Tool discipline (persistent, from tool-coach):` text, with the `${command}`-filled fixed rules and a live-fetched tool table capped at maxSectionTools rows (5) ordered by mapped-class priority - while contexts, tools, and variables stay deep-equal untouched (PTC + structured-output preserved).

The first build logs no rebuild line, and 12 clean judged calls clear the section with its byte-exact line, returning the assembly untouched afterwards.

The assertions are moved verbatim from `Classic/smokes/tool-coach-smoke.mjs` (R4).

## Scenario

- Group: the escalation and the section content.
    - Sub: "R4: the escalation line fires at the 6th strike since the note"
    - Sub: "R4: the assembled sections are base + the coach's" / "the base section untouched" / "the appended section is the coach's"
    - Sub: "R4: the section text starts with the verbatim heading"
    - Sub: "R4: contexts, tools and variables are DEEP-EQUAL untouched (PTC + structured-output preserved)"
    - Sub: "R4: the ${command} fill lands in both fixed rules" (read + mutate rules)
    - Sub: "R4/D1: no literal ${ placeholder remains in the composed section"
    - Sub: "R4: the tool table has exactly maxSectionTools (5) rows"
    - Sub: "R4: the first row is the write-class mapped tool (edit), live description"
    - Sub: "R4: the third row is the read-class mapped tool with the LIVE description" (the `(live fixture)` marker)
    - Sub: "R4: the cap holds - with 11 mapped tools the 5 rows are all mapped (the top-up appears in D3b)"
- Group: the first-build silence and the clean-window clearing.
    - Sub: "R4: the FIRST section build logs no rebuild line"
    - Sub: "R4: 12 clean judged calls clear the section: 'persistent section cleared (12 clean calls)'"
    - Sub: "R4: after the clean window the assembly has NO coach section (returns untouched)"
    - Sub: "R4: the clean git status calls wrote no NEW offense lines"

## Fixtures

The fixtures use the harness world: one `Make(Validate({ logFile: Ledger }))` with the live registry schema fixture, 9 judged cat offenses to cross the note + escalation, then two `Assemble` waterfall passes (Before/After) around the 12 clean `git status` calls.

The table rows are parsed from the section text by the `| tool | purpose |` splitter, exactly as the source suite did.

## Expected ledger strings (byte-exact)

- `: escalated persistent section (8 strikes)`
- `: persistent section cleared (12 clean calls)`
- The absence assertions: NO `: section rebuilt` line on the first build, no new `: offense bash read` lines from the clean window.

## Edge cases

- The one-section invariant holds: exactly one appended section, base untouched, contexts/tools/variables untouched, so any extra section or field mutation fails.
- The cap holds: 11 mapped tools exist but only 5 rows are written (all mapped, no `zzz_fixture` top-up inside the cap).
- The first build is silent, and only the TTL and tools/change rebuild paths log (covered in Dynamic-And-Craft).

## Expected count

16 PASS.
