# History-Producer - the recall store's producer

The wave 2c re-spec of the completion spec for this package ([03-SUGGESTERS.md](../../../../Documentation/Plans/Completion-Spec/03-SUGGESTERS.md)): the recall reader had no producer, so recall was always empty.

Now every judged call in a workspace is appended to the call history, in the per-agent ring plus the durable tier (the `replay_history` KV domain when the harness provides storage, the JSON fallback otherwise), and a later call recalls the paths that accompanied a similar prior call. The recall is the ONLY default candidate source: the recalled record is synthesized into the `Repeat` family per call, and the literal built-in pack is never consulted.

## Scenarios

- H1: a sequence of judged calls fills the durable mirror and the own ring of the agent (newest first), and every append logs the byte-exact `recorded` line with the bounded size at that append; the first call has no recall yet (it stays `replay`), and the later ones are judged `Repeat`.
- H2: a later call recalls the historical companions, and the note names them byte-exactly (the anchor first, then the paths recorded around it within `learnWindow` calls) with the synthesized caveat.
- H3: an empty store abstains honestly: no note, no claim, and the byte-exact `abstained no-history  0.00` line beside `store empty (starting fresh)`.
- H4: the KV path survives a reopen, because the domain spec is `replay_history` v1, per-record, backup-and-skip, with NO `compatibleVersions`; the reopen restores the entries, and a call after the reopen recalls them.
- H5: the JSON fallback survives a reopen without any storage facility (the file is the store, the reopen restores it, and a call recalls).
- H6: `historyDepth` bounds the mirror and the agent ring.
- H7: a non-judged tool and a foreign-workspace call are never recorded.
- H8: the SEEDED store still wins (the optional user seed keeps precedence): the recall of a seeded record beats the live history.
- H9: a failed domain open is loud (`store open failed: <reason>`) and degrades to the JSON fallback.

## Fixtures

The shared Harness (fake ctx, real factory, real built Target), the fake storage facility (the open capture, the map-backed tables, the version fence), and real temp store paths.

The recall is validated against the tree, so the recall-emitting mounts point the session cwd at a REAL temp workspace holding the `src/...` companions as regular files.

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
abstained no-history  0.00
```

## Expected count

17 PASS.
