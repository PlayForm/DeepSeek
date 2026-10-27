# Error-Paths

This file states what the test verifies.

## Intent

This folder covers the error paths of the tool: a missing file, a binary or undecodable target, and
a pre-aborted signal must reject with the own context prefix of the tool while they keep the error
code of the backend, and they must never write and never journal.

It has its own folder because error behavior is a contract with the caller, since a wrong prefix or
a silent write would break both the tool UX and the safety of the history.

This folder holds Run 3, Run 4, and Run 5 of the source suite, moved verbatim.

## Scenario

- Fixture: Run 1b's N>0 write, silent, whose own assertions live in
  Read-Write-Pipeline. It establishes journal record #1 and the write
  baseline against which every error check is measured.
- Group: Run 3 - a missing file is an error result, no write.
    - Check: "a missing file rejects with the tool's context prefix".
    - Check: "the missing-file error keeps the backend's code" (FS_NOT_FOUND).
    - Check: "a missing file: NO write".
    - Check: "a missing file: NO journal record".
- Group: Run 4 - a binary/undecodable target is an error result, no write.
    - Check: "a binary target rejects with the tool's context prefix".
    - Check: "the binary error keeps the backend's FS_NOT_TEXT code (the
      mime check, tool-shaped)".
    - Check: "a binary target: NO write".
- Group: Run 5 - a pre-aborted signal rejects, no write.
    - Check: "a pre-aborted signal rejects the call".
    - Check: "a pre-aborted signal writes NOTHING (no fs write after the
      abort)".
    - Check: "an aborted call: NO journal record".

## Fixtures

The fixtures are the harness fake ctx with the read/write fs seams, where readText throws
FS_NOT_FOUND for unknown keys, FS_NOT_TEXT for `.bin` paths, and "aborted before read" for
pre-aborted signals, and writeText throws "aborted before write", plus the REAL factory and the REAL
normalize-file apply.

The fixture writes the All6 content to `/tmp/normalize-file-smoke-fixture.txt`, which is Run 1b of
the source suite and stays silent.

The error targets are the exact paths of the source suite:
`/tmp/normalize-file-smoke-missing.txt`, `/tmp/normalize-file-smoke-image.bin`, and
`/tmp/normalize-file-smoke-abort.txt`.

## Expected ledger strings (byte-exact)

- `normalize-file: cannot read /tmp/normalize-file-smoke-missing.txt: ` is the
  rejection prefix, matched with `startsWith`.
- `normalize-file: cannot read /tmp/normalize-file-smoke-image.bin: ` is the
  rejection prefix, matched with `startsWith`.
- The backend codes `FS_NOT_FOUND` and `FS_NOT_TEXT` are matched with
  `includes`.

## Edge cases

- Every error path leaves the write count and the journal count untouched,
  which three absence controls show.
- The tool wraps the backend error with its own context prefix while it
  preserves the code of the backend, so both halves of the message are pinned.

## Expected count

10 PASS.
