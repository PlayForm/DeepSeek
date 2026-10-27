# Query-Withdraw-Observe - the observe side and the management surface tests

This folder covers the silent fs/observed fence tracker, the staleness rule's fence fallback, the withdrawal path, the filtered query, the honest statistics, and the full-table refusal.

## Scenarios

- O1: the fence tracker records foreign fs/observed events silently (no ledger noise, because the observe hook owns that line), ignores the hook's own actor, and never throws on a malformed event.
- O2: without a caller fence the observed version is used as the fence (a version is never invented, so no fence and no observation is refused `missing-version`), and a caller fence that contradicts the observed version is refused `stale-version` with the byte-exact `refused rename stale-version` line.
- O3: a withdrawal marks the proposal `withdrawn` and logs the byte-exact `withdrawn <id>` line, while an unknown id (or an already-withdrawn proposal) is a false return, never an error.
- O4: the query surface filters the list by kind, path, and status; the caller limit applies, the hard cap (limitMaximum) truncates any larger explicit limit (the default list uses limitDefault uncapped, per Query/List), and the statistics triple is honest (proposals, refused, sequence, byKind).
- O5: a proposal into a full table (maxProposals) is refused `full` with the byte-exact `refused full (1 live proposals)` line, never silently dropped, and the refused counter advances.

## Fixtures

The fixtures use the shared Harness (fake ctx with a FUNCTIONAL fs + a fake workspaceGraph + the REAL built factory + the REAL built plugin apply), and fs/observed events are fired through the ROOT listener.

## Expected ledger strings (byte-exact, `operate: ` prefix)

`refused rename stale-version`, `withdrawn <id>`, `refused full (<n> live proposals)`.

## Expected count

11 PASS.
