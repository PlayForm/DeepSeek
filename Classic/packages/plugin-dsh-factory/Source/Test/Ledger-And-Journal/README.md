# Ledger-And-Journal

This file states what the test verifies.

## Intent

This folder covers the durable-output machinery: `Append`, with the [ISO]-stamped ledger file line,
the module-prefixed logger line, the Enabled gate, and the never-throws posture; `Journal`, with the
P5 pre-bind buffer sink, the per-State fallback, and the silent containment of a storage failure;
and `Attach`, with the unload effects, which are the P1 jobs controller, the P2 inflight disposal
with the unload abort, and the P5 storage domain, which covers the shared `package_governance` v2
spec, the queue drain, the silent absent-facility skip, the loud failed-open ledger line, and the
disposer close.

These surfaces have their own folder because the ledger lines are byte-identical contracts and the
P5 posture is the storage safety story of the family.

This folder holds sections 8, 9, and 14 of the source suite, moved verbatim.

## Scenario

- Group: 8 - Append: byte-identical ledger semantics.
    - Check: "Append: [ISO] line + logger prefix + Enabled gate + never
      throws" - the file line matches
      `^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] smoke ledger line$`,
      the logger carries `smoke-flavor: smoke ledger line`, Enabled=false
      appends nothing with the byte length unchanged, and a bad ledger path
      never throws.
- Group: 9 - Journal: silent-skip + record paths.
    - Check: "Journal: pre-bind buffer sink + per-State fallback + storage
      failure contained (silent skip)" - a Journal call queues
      `{event, path, detail, at}` into the pre-bind buffer while the per-State
      queue stays empty; with the buffer retired and no shared sink, a
      throwing per-State Journal is contained silently.
- Group: 14 - Attach: P1 jobs + P2 inflight disposal + P5 storage.
    - Check: "Attach: P1 controller + P2 disposal + P5
      open/drain/silent-skip/close" - the effect labels are
      [smoke-flavor-jobs, smoke-flavor-inflight, smoke-flavor-storage]; the
      jobs controller is attached; the inflight effect aborts the in-flight
      pass and clears the map; the absent storage facility is a silent skip
      with the sink retired; the present stub domain opens with the SHARED
      `package_governance` spec (version 2, the events table with the
      ["activated","governed","dispatched","update-failed","excluded",
      "normalized"] vocabulary, per-record layout, compatibleVersions [1],
      backup-and-skip), the pre-open queue drains, records flow live, and the
      disposer closes the domain.
- Group: P5 open FAILURE -> the loud ledger line (the P5 fix).
    - Check: "Attach: P5 failed open -> loud ledger line, no throw, no sink
      bound" - a rejecting open leaves no domain handle and no shared sink and
      writes exactly the best-effort ledger line.
- Group: the `journalDomain` option (P5, the DECISION B addition).
    - Check: "Attach: P5 journalDomain option -> the State's own domain name"
      - the option transfers to `State.JournalDomain` and the Open declares
      the module's own distinct domain name, while the `package_governance`
      default stays the fallback for a module that does not set the option.

## Fixtures

- The Harness fake ctx and the REAL factory instance, the st1 State of the
  source suite rebuilt verbatim, and a fresh OS tmpdir root with `ledger.log`
  and `fail-ledger.log`.
- `services["jobs"]`, the P1 stub; `services["storageDomain"]`, first the
  recording stub whose `open` captures the domain spec and returns a
  put-recording table plus close, then the rejecting stub, then the option
  stub for the `journalDomain` check; the AbortController in the Inflight map;
  and the `effects` capture.
- The P5 journal stages (`factory.PendingJournal`/`factory.SharedJournal`) are
  reset at the start of the Attach group exactly as the source suite resets
  them at its section boundaries (makeCtx), because a stale buffer would leak
  the record of the Journal group into the drain of this group.

## Expected ledger strings (byte-exact)

- `smoke ledger line` sits behind the `[ISO ...]` stamp in the durable file,
  and the logger form is `smoke-flavor: smoke ledger line`.
- `storage journal open failed: version-mismatch` is asserted through includes
  on the durable file, which is the LOUD failed-open line.

## Edge cases

- Enabled=false appends nothing to the file, which the byte-length equality
  shows.
- A bad ledger path and a storage failure never throw.
- The absent facility is silent, with Open never called, while the failed open
  is loud.
- The v2 open contract covers the per-record layout, compatibleVersions [1],
  and backup-and-skip.

## Expected count

5 PASS.
