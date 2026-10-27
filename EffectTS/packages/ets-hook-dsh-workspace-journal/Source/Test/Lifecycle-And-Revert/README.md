# Lifecycle-And-Revert - the open/seal/revert/recover lifecycle

The journal-before-writes open, the seal transitions and their refusals, the byte-exact lifecycle ledger lines (logger and durable), the bounded ring cap with its eviction line, the truncated pre-image skip, the version-fenced revert with its conflict arms, and the boot recovery pass.

## Scenarios

- L1: open records the batch and the entries before any write; the open line is byte-exact (logger and durable file), and the queries read the open batch.
- L2: seal verified closes the applying batch byte-exactly, while sealing a terminal or unknown batch is refused with the byte-exact line.
- L3: the revert replays backward (removed, then restored) with the per-file report, the absent pre-image removal, the fenced restore through the executor of the factory (the exact write content and intent), and the byte-exact summary line; the batch ends `reverted`.
- L4: a stale-version write is a conflict (never a silent overwrite); a vanished file is a conflict; a truncated pre-image is skipped; unknown and recovery-required batches are refused, each with its byte-exact line.
- L5: the ring caps at maxBatches, and the eviction is ledgered byte-exactly (`capped b1 (maxBatches 2)`).
- L6: an observed write on an applying batch advances progress (`observed <path> in <id> (progress <n>)`); the boot pass marks applying batches recovery-required byte-exactly, with the exact reason; a second pass reports nothing; and a zero-progress batch reads `0/1`.

## Expected ledger strings (byte-exact, `journal: ` prefix)

`opened b1 (2 files)`, `sealed b1 verified`, `sealed b1 recovery-required (...)`, `seal failed ...`, `reverted b1 (2 files)`, `reverted b1 /b (already absent)`, `reverted b1 /a (fence ok)`, `reverted b1 /a (conflict: ...)`, `reverted b1 /a (skipped: pre-image over maxEntryBytes)`, `revert failed ...`, `capped b1 (maxBatches 2)`, `observed /a in b1 (progress 1)`, `recovery-required b1 (applying at boot with 2/2 writes observed)`.

## Expected count

20 PASS.
