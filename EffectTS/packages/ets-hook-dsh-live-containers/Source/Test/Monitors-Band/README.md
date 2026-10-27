# Monitors-Band - the wave-3 M-series band tests

The R-series byte-identity for the monitor stanza (the design section 6 grammar): every outcome line
byte-exact, the STALE flips, the recovered forms, the summary arithmetic, the token budget, the KV
stability and the fail-open renderer.

The glyphs are asserted as the RENDERED characters, because the source writes `\u2204` / `\u2205`
escapes.

## Scenarios

- B1: the full clean stanza byte-exact - the header, the summary band
  first, the band frame, the footer.
- B2: a settle-less version bump renders
  `~ STALE (file changed after check) | ... | now v<current>` with NO
  re-run; the false-pass guard: the summary counts the stale, never a
  clean (the R3 acceptance 5).
- B3: a non-zero exit renders `problem (!) ... | exit <n>` with the
  `tail (up to 2 KiB):` head block.
- B4: an infrastructure failure renders
  `check failed (infrastructure) (x) ... | <detail>`, never `!`; the
  sandbox denial renders `check denied (sandbox) (x)` with no detail slot.
- B5: a never-run set renders `not run yet (∅?) | enrolled <time> by
  <writer>`; an entry with no sets appends `| checks: none`.
- B6: a linked governance set renders the linked form with the observed
  facts (never a fabricated verdict).
- B7-B10: the recovered forms - fresh (`(recovered)` + the not-re-checked
  clause), time-stale (`~ STALE (not re-checked this session)`),
  recovered-after-a-mount-time-edit (both clauses), and the recovered
  problem outcome.
- B11: an oversized band is truncated to `bandCapBytes` with the byte-exact
  `monitor band truncated <path> (<kept> bytes)` ledger line.
- B12: two assemblies with no event render byte-identical stanzas (the KV
  stability).
- B13: the summary counts sum to the total and the trailing phrase mirrors
  the parenthetical.
- B14: the worst-state (primary) line renders first.
- B15: a long version token renders the 12-byte display cap with `..`.
- B16: a broken entry degrades to the ledger
  (`monitors render failed -> skipped`) and an empty part - fail-open.

## Fixtures

The shared Harness plus the wave-3 fixtures.

The results are injected directly into the entries (the fold is covered by the Jobs series), the
clock advances drive the time-stale transitions, and `ExpectedTime` computes the deterministic
HH:MM:SS bytes.

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`monitor band truncated <path> (<kept> bytes)`,
`monitors render failed -> skipped`.

## Expected count

22 PASS.
