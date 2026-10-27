# Journal-Compaction

What this test verifies.

## Intent

The opt-in JSONL journal.

The folder covers `journalPath` wired into the store and the one-record-per-store format, a `{hash,
type, size, ttlAt}` record whose payload is the base64 of the content's JSON serialization.

It covers the boot compaction on a fake restart: the corrupt and expired records dropped, one
surviving, the entry retrievable again.

It also covers the boot-compaction edges: an EMPTY journal file loads to an empty store without a
crash, an ALL-EXPIRED journal compacts away and is rewritten empty, and a MISSING journal file is NOT
created on boot (memory-only until the first store).

It is its own folder because the journal is the durable tier of the store and its boot behavior is
the restart safety story.

This is the source suite's Run 9 and Run 9b, moved verbatim.

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

- The Harness fake ctx + the REAL factory + the REAL ccr apply, with the journal fixtures at the fixed `/tmp/ccr-smoke-journal.jsonl` path (cleared by `Rm()` at the folder start and at the group boundary) and the `/tmp/ccr-smoke-journal-absent.jsonl` path for the missing-file edge.
- The corruption fixture: one broken line (a bare newline), one expired record (ttlAt in the past, payload base64 of "[]"), one unparseable line ("{not json at all").
- The terminal content fixture (TerminalText with the "j" fill, 40 rows), with the same bytes across the store and the restart so that the hash matches.

## Expected ledger strings (byte-exact)

None, because the journal's contract is the record format and the store stats, not ledger lines (the store and compress lines belong to the Retrieve-And-Marker folder).

## Edge cases

- The corrupt and expired records are dropped at boot, and one record survives.
- The all-expired file is REWRITTEN EMPTY, not deleted.
- A missing journal file is not created on boot, so the store stays memory-only.
- The payload round-trip: base64 of the JSON serialization restores the exact original bytes.

## Expected count

10 PASS.
