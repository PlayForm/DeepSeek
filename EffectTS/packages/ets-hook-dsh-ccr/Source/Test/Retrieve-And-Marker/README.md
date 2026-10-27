# Retrieve-And-Marker

What this test verifies.

## Intent

The compression and retrieval contract.

The folder covers the marker replacement bytes, the strict marker parsing, the granular retrieval,
the auto-expand store path, the retention outcomes (TTL expiry, LRU budget eviction), the
compressFailures error tier, the full classifier/multiplier matrix, and the durable form of the
compressed line.

It is its own folder because the marker literal `<<<CCR:<24-hex>|<type>|<size>>>` and the retrieved
bytes are the core contract of the module with the model: the preview is the only thing the model
sees, and ccr_retrieve must restore the ORIGINAL bytes exactly.

This is the source suite's Runs 1b, 2, 3, 5, 5b, 6b, 7 and Run 8's compressed-file check, moved
verbatim.

## Scenario

- Group: Run 1b - the vacuously-green companion - a compressed case
  (autoExpand OFF).
    - Check: "oversized bash result is replaced (not passed through)".
    - Check: "replacement content is exactly [terminal:preview] + newline +
      the exact marker bytes".
    - Check: "round-trip: ccr_retrieve restores the ORIGINAL bytes for the
      marker's hash".
    - Check: "retrieval echoes hash/type/size from the stored entry".
    - Check: "compressed ledger line byte-exact: 'ccr: compressed bash
      terminal <bytes> -> <hash>'".
    - Check: "retrieval ledger line: 'ccr: retrieved <hash>'".
    - Check: "the compressed case writes NO stored line (compressed =/= 
      auto-expand store)" (the runtime label uses U+2260).
    - Check: "unknown hash -> the self-describing error (re-run the original
      tool; no fuzzy matching)".
    - Check: "unknown-hash ledger line: 'ccr: retrieval miss <hash>
      (unknown)'".
    - Check: "a 12-char hash PREFIX does not retrieve (no prefix or fuzzy
      matching)".
- Group: Run 2 - the marker contract details on a read result.
    - Check: "the marker parses strictly (24-hex hash, type, size)".
    - Check: "read result marker: the full-content hash, type 'file', the
      exact serialized size".
    - Check: "the preview line is the [file:...] type-tagged one-liner".
    - Check: "range {start:1,count:1} returns only the second line (granular
      retrieval)".
    - Check: "an out-of-range start clamps to an empty slice (never an
      error)".
- Group: Run 3 - auto-expand (default on) - stored, FULL content, no marker.
    - Check: "auto-expand: the downstream decision passes through (FULL
      content, no marker)".
    - Check: "auto-expand: NO marker reaches the model".
    - Check: "auto-expand: the entry is STILL retrievable by hash".
    - Check: "auto-expand ledger line: 'ccr: stored bash terminal <bytes> ->
      <hash>'".
    - Check: "auto-expand writes NO compressed line (nothing was replaced)".
    - Check: "above autoExpandLimitBytes the preview + marker replacement
      returns (preview hard-cut at 240 chars)".
- Group: Run 5 - TTL expiry.
    - Check: "TTL expiry (ttlSeconds: 0): retrieval reports the entry
      expired".
    - Check: "expired ledger line: 'ccr: retrieval miss <hash> (expired)'".
- Group: Run 5b - LRU budget eviction.
    - Check: "LRU eviction at budget: 'ccr: evicted <hash> (budget)' for the
      least-recently-used entry".
    - Check: "the evicted entry is gone (unknown hash)".
    - Check: "the surviving entry is still retrievable with the ORIGINAL
      bytes".
- Group: Run 6b - compressFailures=true: the error tier.
    - Check: "compressFailures=true: an oversized failure compresses with the
      error preview (first content line, hard-cut) and the |error| marker".
    - Check: "the failure's original content is retrievable".
- Group: Run 7 - all 7 classifier types hit their multiplier gates.
    - Check (x2): "'<Name>' -> type '<Type>' marker (x1 gate: 3000 bytes
      compresses)" for bash/terminal and read/file.
    - Check (x6): "'<Name>' -> type '<Type>' marker (x2 gate: 5000 bytes
      compresses)" for grep/grep, glob/paths, web_fetch/web, web_search/web,
      list/paths, search/grep.
    - Check (x3): "'<Name>' at 1500 bytes stays UNDER its x2 gate (2048) -
      multiplier respected" for grep, glob, web_fetch.
    - Check: "a non-table target with JSON content classifies as 'json'
      (shape fallback) and compresses at x1".
    - Check: "a non-table target with plain text classifies as 'default'
      (shape fallback) and compresses at x1".
    - Check: "a tool outside targets is never compressed (the allow-list)".
    - Check: "the error x8 gate: 5000 bytes compresses for terminal x1 but
      NOT for error x8 (gate 16384)".
    - Check: "a failure over the x8 gate (17000 > 16384) compresses with the
      |error| marker".
- Group: Run 8 - the durable ledger file.
    - Check: "the durable ledger file: '[ISO] compressed bash terminal
      <bytes> -> <hash>'".

## Fixtures

- The Harness fake ctx + the REAL factory + the REAL ccr apply, where each Run gets a fresh `Rm()` and its own `Make(Validate(...))` with the exact config of the source suite (autoExpand false for the marker paths, default for auto-expand, ttlSeconds 0, storeBudgetBytes 5000, compressFailures true, the extended `targets` list with "probe").
- The content helpers from the Harness (`HashOf` - the sha256-24 of the serialized bytes, `SizeOf`, `TextBlock`, `TerminalText`, `PlainText`, `Exec`, `NextAccept`).
- The strict marker regex `/^<<<CCR:([0-9a-f]{24})\|([a-z]+)\|(\d+)>>>$/`.

## Expected ledger strings (byte-exact)

- `ccr: compressed bash terminal <bytes> -> <hash>`.
- `ccr: retrieved <hash>`.
- `ccr: retrieval miss <hash> (unknown)`.
- `ccr: retrieval miss <hash> (expired)`.
- `ccr: evicted <hash> (budget)`.
- `ccr: stored bash terminal <bytes> -> <hash>`.
- `[ISO] compressed bash terminal <bytes> -> <hash>` in the durable file.

## Edge cases

- The out-of-range range start clamps to an EMPTY slice and never gives an error.
- A 12-char hash prefix does NOT retrieve, and unknown hashes get the self-describing error.
- The auto-expand preview is hard-cut at exactly 240 chars (19-char prefix + 221 fill).
- The x2 boundary: 1500 bytes passes through for grep/glob/web_fetch.
- The x8 error gate: 5000 bytes does not compress failures, and 17000 does.

## Expected count

45 PASS.
