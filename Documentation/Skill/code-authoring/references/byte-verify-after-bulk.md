# After Any Bulk Text Transformation: Verify the Written Bytes Before Reporting Done

> Source: SKILL.md, Section 1c (Byte-integrity), rule 4. Post-incident 2026-10-07, user-mandated.

## The Rule

After ANY bulk text transformation - multi-file conversions, rewrites,
replacements, renames of markup - verify the WRITTEN BYTES before
reporting done:

1. a byte-level scan of every touched file: zero `\x00`, zero stray
   control characters, valid UTF-8 (e.g. a Python bytes-read check);
2. a spot-check that the transformed segments read back as the intended
   text (via the read tool, per the read-side discipline).

A transformation is not complete until the files pass the byte scan.

## Why the Byte Scan Is Mandatory, Not Optional

1. **The incident's lesson.** The 2026-10-07 conversion (see
   ./references/byte-no-null-control-bytes.md) was reported done
   after the transformation script exited cleanly. 25 files were
   binary. "The script ran without errors" verified nothing about the
   bytes.

2. **Success of the process is not success of the artifact.** A bulk
   transformation has two independent success conditions, and the first
   proves nothing about the second:
   - the process ran (exit code 0, all files touched);
   - the artifact is intact (the bytes are what was intended).
   Only condition 2 is the deliverable.

3. **Text-level reads can miss byte corruption.** A null run in a
   markdown file may render invisibly; a reader sees "roughly the
   right text" and moves on. The byte scan reads the file AS BYTES,
   which no text-level check does. This is also the sanctioned
   exception to the read-side discipline (see
   ./references/never-terminal-content-reads.md): the scan is a
   scripted bytes-read because the read tool cannot report byte
   values.

## The Scan, Concretely

A small Python check over the touched files, run once after the bulk
pass:

```python
import sys, pathlib
bad = []
for p in map(pathlib.Path, sys.argv[1:]):
    b = p.read_bytes()
    if b"\x00" in b:
        bad.append((str(p), "NUL byte"))
    controls = set(b) - set(b"\t\n\r") - set(range(0x20, 0x7F)) - set(b for b in [])
    # full UTF-8 + control check:
    try:
        b.decode("utf-8")
    except UnicodeDecodeError as e:
        bad.append((str(p), f"invalid UTF-8: {e}"))
    if any(c < 0x20 and c not in (9, 10, 13) for c in b) or 0x7F in b:
        bad.append((str(p), "stray control byte"))
if bad:
    for p, why in bad:
        print(f"FAIL {p}: {why}")
    sys.exit(1)
print("byte scan: PASS")
```

Non-ASCII UTF-8 content is allowed by this scan when the file's
discipline permits it (the code-authoring skill files themselves are
ASCII-only; repo source may legitimately hold other UTF-8). The scan's
non-negotiable findings: NUL bytes, control bytes outside \t\n\r, and
invalid UTF-8.

## The Spot-Check

The byte scan proves the files are clean text; it does not prove the
TRANSFORMATION is right. Spot-check with the read tool: open a sample
of touched files at the regions the transformation targeted and confirm
the segments read back as intended text (e.g. the converted links point
where they should, the renamed symbols are renamed everywhere).

## The Order of Operations

```
bulk transformation (tool API writes, not terminal passes)
   |
   v
byte scan over every touched file  -----> FAIL: diagnose, fix, re-write, re-scan
   |
   v
spot-check reads of transformed regions
   |
   v
report done (only now)
```

Note the first box: the transformation itself must already go through
the write/edit tool API - the scan is the verification layer on top of
the channel discipline, not a substitute for it.

## Failure Modes

- Scanning only a sample of files - the corruption was in the 24 not
  sampled. Every touched file, no exceptions.
- Reporting done after the transformation but before the scan - the
  exact incident pattern.
- Scanning and finding nothing because the scan itself has a bug
  (e.g. decoding errors swallowed) - the scan must fail loudly (exit
  non-zero, print every finding).
