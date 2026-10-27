# Monitors-Band - the wave-3 M-series band tests

The R-series byte-identity for the monitor stanza (the grammar of design
section 6): every outcome line byte-exact, the STALE flips, the recovered
forms, the summary arithmetic, the token budget, the KV stability, and the
fail-open renderer. The glyphs are asserted as the RENDERED characters (the
source writes `\u2204` / `\u2205` escapes).

## Scenarios

- B1: the complete clean stanza is byte-exact: the header, the summary band
  first, the band frame, and the footer.
- B2: a version bump with no settle renders
  `~ STALE (file changed after check) | ... | now v<current>` and NO re-run
  happens; the false-pass guard: the summary counts the stale and never a
  clean (the R3 acceptance 5).
- B3: a non-zero exit shows `problem (!) ... | exit <n>` with the
  `tail (up to 2 KiB):` head block.
- B4: an infrastructure failure shows
  `check failed (infrastructure) (x) ... | <detail>` and never `!`; a sandbox
  denial shows `check denied (sandbox) (x)` with no detail slot.
- B5: a set that never ran shows `not run yet (∅?) | enrolled <time> by
  <writer>`, and an entry with no sets adds `| checks: none`.
- B6: a linked governance set shows the linked form with the observed facts
  (never a verdict that is fabricated).
- B7-B10: the recovered forms - fresh (`(recovered)` plus the not-re-checked
  clause), time-stale (`~ STALE (not re-checked this session)`), recovered
  after a mount-time edit (both clauses), and the recovered problem outcome.
- B11: an oversized band is cut to `bandCapBytes` with the byte-exact ledger
  line `monitor band truncated <path> (<kept> bytes)`.
- B12: two assemblies with no event produce stanzas that are byte-identical
  (the KV stability).
- B13: the summary counts add up to the total, and the trailing phrase mirrors
  the parenthetical.
- B14: the worst-state (primary) line comes first.
- B15: a long version token shows the 12-byte display cap with `..`.
- B16: a broken entry degrades to the ledger line
  (`monitors render failed -> skipped`) and an empty part - fail-open.

## Fixtures

The shared Harness plus the wave-3 fixtures; the results go directly into the
entries (the Jobs series covers the fold), the clock advances cause the
time-stale transitions, and `ExpectedTime` computes the HH:MM:SS bytes
deterministically.

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`monitor band truncated <path> (<kept> bytes)`,
`monitors render failed -> skipped`.

## Expected count

22 PASS.
