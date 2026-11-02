# Usage-And-Ledger

This folder covers the usage store and the audit ledger: the thirteen fields and their writers, the
reuse watermark, the corrupt-store posture, the atomic save, the blob dedup, and the snapshot
rotation.

## Intent

The usage store is the curator's whole input, so its thirteen fields, the writers that own each one,
and the reuse watermark are the contract. Two postures matter more than the fields:

- **A corrupt store is quarantined, never overwritten.** Hermes reads a corrupt or unreadable store
  as `{}`, and the next successful bump rewrites the whole file with a map holding one record, which
  silently loses every other record. Here a read failure moves the file to
  `<storagePath>.corrupt-<YYYYMMDDHHMMSS>` and starts from an empty store, one line names the error
  and the quarantine path, and the quarantined bytes stay on disk for inspection and for a manual
  merge. When the move itself fails, the store refuses to save, so the next write cannot destroy the
  only copy.
- **Writes are atomic and ordered.** One promise chain, so a load always precedes a write and two
  saves cannot interleave, and each save lands through a temporary file and a rename.

`lastActivityAt` is derived at read time from the two activity stamps and is never persisted, so a
reader never sees a stale value. `createdBy` is a POLICY FLAG rather than a provenance claim: it
answers "may autonomous curation archive this?", not "who wrote it".

The ledger half is the other mechanism this package needs. Blobs are content-addressed and
deduplicated, so a hundred rows touching one unchanged file cost one blob. A rotation keeps the
newest `snapshotKeep` manifests and never prunes a PROTECTED one, because a revert's safety snapshot
must survive its own pass; the blob sweep then keeps every blob a retained manifest or a retained
ledger row still names.

## Scenario

- "U1: a fresh record carries exactly the thirteen fields" - the key set, and every value at its
  zero.
- "U2: a use increments the count, stamps the time, and reports the first use".
- "U3: the reuse watermark moves only after a patch" - generation 1 on the first use after a patch,
  and no second move at the same generation.
- "U4: a patch moves the count and the generation together".
- "U5: a create rewrites the record from zero with the curation flag".
- "U6: the seed, the state and the pin write only their own field" - and an untracked name is never
  created.
- "U7: a corrupt store is quarantined and never overwritten" - the error, the quarantine path, the
  surviving bytes, the moved-away original, and the fresh store the next save writes.
- "U8: a non-object root is quarantined and a non-record entry is dropped" - the root case, and a
  mixed store where the record that parses is kept and the two that do not are dropped rather than
  coerced.
- "U9: the save is atomic and serialized" - two concurrent saves both land, no `.tmp` file survives,
  and the store parses.
- "U10: identical bytes cost one blob, and a row names the digest" - one file for two captures, and
  the row's `before` manifest names the address.
- "U11: the rotation keeps `snapshotKeep` and protects the newest" - a protected id outside the
  window survives, then the window prunes exactly the oldest.

## Fixtures

The fixtures are the shared Harness: a state root per scenario under
`<Home>/.dsh/skill-learn/<tag>/`, a fake corpus for the snapshot walk, and the real built
`Target/Function/{Usage,Ledger,Snapshot}.js` leaves.

The store, the ledger, the blobs and the snapshots are the plugin's own files and are written with
`node:fs`, so every assertion here reads the real temp home. No two checks share a state root.

## Expected ledger strings (byte-exact)

None of the service's own lines: `Source/Library.ts` owns the `usage store unreadable` line. This
folder asserts the quarantine PATH and the store's own `error` text, which is what that line prints.

## Expected count

11 PASS.
