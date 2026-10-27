# Journal-Compaction

What this test verifies.

## Intent

The suite covers the opt-in JSONL journal: `journalPath` wired into the store, the one-record-per-store
format, where a `{hash, type, size, ttlAt}` record carries a payload that is the base64 of the JSON
serialization of the content, and the boot compaction on a fake restart, where the corrupt and expired
records are dropped, one survives, and the entry is retrievable again.

It also covers the boot-compaction edges: an EMPTY journal file loads to an empty store without a
crash, an ALL-EXPIRED journal compacts away and is rewritten empty, and a MISSING journal file is NOT
created on boot, so the store stays memory-only until the first store.

It has its own folder because the journal is the durable tier of the store and its boot behavior is
the restart safety story.

The suite is Run 9 and Run 9b of the source suite, moved verbatim.

## Scenario

- Group: Run 9 - the JSONL journal (opt-in) round-trip + boot compaction.
    - Check: "journalPath is wired into the store".
    - Check: "the journal: exactly one JSONL record after one store".
    - Check: "the journal record carries {hash, type, size, ttlAt}".
    - Check: "the journal payload is the base64 of the content's JSON
      serialization".
    - Check: "boot compaction: the corrupt and expired records are dropped,
      one survives".
    - Check: "the journal survives the fake restart: the entry is retrievable
      again".
- Group: Run 9b - the journal's boot-compaction edges.
    - Check: "boot compaction edge: an EMPTY journal file loads to an empty
      store (no crash)".
    - Check: "boot compaction edge: an ALL-EXPIRED journal compacts to an
      empty store".
    - Check: "boot compaction edge: the all-expired file is rewritten empty".
    - Check: "boot compaction edge: a MISSING journal file is not created on
      boot (memory-only)".

## Fixtures

- The Harness fake ctx with the REAL factory and the REAL ccr apply, where the journal fixtures live
  at the fixed `/tmp/ccr-smoke-journal.jsonl` path, cleared by `Rm()` at the folder start and at the
  group boundary, plus the `/tmp/ccr-smoke-journal-absent.jsonl` path for the missing-file edge.
- The corruption fixture holds one broken line (a bare newline), one expired record (ttlAt in the
  past, payload base64 of "[]"), and one unparseable line ("{not json at all").
- The terminal content fixture (TerminalText with the "j" fill, 40 rows) keeps the same bytes across
  the store and the restart, so the hash matches.

## Expected ledger strings (byte-exact)

None, because the contract of the journal is the record format and the store stats rather than ledger
lines, and the store and compress lines belong to the Retrieve-And-Marker folder.

## Edge cases

- The corrupt and expired records are dropped at boot, and one record survives.
- The all-expired file is REWRITTEN EMPTY and not deleted.
- A missing journal file is not created on boot, so the store stays memory-only.
- The payload round-trip restores the exact original bytes from the base64 of the JSON serialization.

## Expected count

10 PASS.
