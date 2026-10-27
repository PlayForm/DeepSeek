# History-Producer - the recall store's producer

The completion spec's wave 2c re-spec for this package ([03-SUGGESTERS.md](../../../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)) found that the recall reader had no producer, so recall was always empty.

Now every judged call in a workspace is appended to the call history (the per-agent ring plus the durable tier: the `replay_history` KV domain when the harness provides storage, the JSON fallback otherwise), and a later call recalls the paths that accompanied a similar prior call.

## Scenarios

- H1: a sequence of judged calls fills the durable mirror and the agent's own ring (newest first), and every append logs the byte-exact `recorded` line with the bounded size at that append.
- H2: a later call recalls the historical companions and the note names them byte-exactly (the anchor first, then the paths recorded around it within `learnWindow` calls).
- H3: an empty store abstains honestly with no note, no claim, and the `store empty (starting fresh)` line.
- H4: the KV path survives a reopen, because the domain spec is `replay_history` v1, per-record, backup-and-skip, with NO `compatibleVersions`; the reopen restores the entries, and a call after the reopen recalls them.
- H5: the JSON fallback survives a reopen without any storage facility (the file is the store, the reopen restores it, and a call recalls).
- H6: `historyDepth` bounds the mirror and the agent ring.
- H7: a non-judged tool and a foreign-workspace call are never recorded.
- H8: the SEEDED store still wins (the fixtures' precedence), so a seeded record's recall beats the live history.
- H9: a failed domain open is loud (`store open failed: <reason>`) and degrades to the JSON fallback.

## Fixtures

The fixtures use the shared Harness (fake ctx, real factory, real built Target), the fake storage facility (the open capture, the map-backed tables, the version fence), and real temp store paths.

A fresh temp HOME and a fresh fallback-store path per mount keep every folder hermetic, so no scenario reads or writes the real `~/.dsh`.

No sleeps: every write is awaited through `State.Flush()`.

## Expected ledger strings (byte-exact, `replay-suggester: ` prefix)

```
recorded <intent> <path> (<n> in store)
store recovered <n> entries (replay_history)
store recovered <n> entries (file)
store empty (starting fresh)
store open failed: <reason>
store write failed: <reason>
```

## Expected count

17 PASS.
