# Error-Paths

What this test verifies.

## Intent

The tool's error paths: missing files, binary/undecodable targets, and pre-aborted signals must
reject with the tool's own context prefix while keeping the backend's error code, and they must
never write or journal.

This is its own folder because error behavior is a contract with the caller - a wrong prefix or a
silent write would break both the tool UX and history safety.

The source suite's Run 3, Run 4, and Run 5 are moved verbatim.

## Scenario

- Fixture: Run 1b's N>0 write (silent; its own assertions live in Read-Write-Pipeline).

    It establishes journal record #1 and the write baseline that every error check is measured
    against.
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

The harness fake ctx (the read/write fs seams: readText throws FS_NOT_FOUND for unknown keys,
FS_NOT_TEXT for `.bin` paths, and "aborted before read" for pre-aborted signals; writeText throws
"aborted before write") + the REAL factory + the REAL normalize-file apply.

The fixture writes the All6 content to `/tmp/normalize-file-smoke-fixture.txt` (the source suite's
Run 1b, silent).

The error targets are the source suite's exact paths: `/tmp/normalize-file-smoke-missing.txt`,
`/tmp/normalize-file-smoke-image.bin`, `/tmp/normalize-file-smoke-abort.txt`.

## Expected ledger strings (byte-exact)

- `normalize-file: cannot read /tmp/normalize-file-smoke-missing.txt: ` (the
  rejection prefix, matched with `startsWith`).
- `normalize-file: cannot read /tmp/normalize-file-smoke-image.bin: ` (the
  rejection prefix, matched with `startsWith`).
- The backend codes `FS_NOT_FOUND` and `FS_NOT_TEXT` (matched with
  `includes`).

## Edge cases

- Every error path leaves the write count and the journal count untouched - three absence controls.
- The tool wraps the backend error with its own context prefix while preserving the backend's code,
  and both halves of the message are pinned.

## Expected count

10 PASS.
