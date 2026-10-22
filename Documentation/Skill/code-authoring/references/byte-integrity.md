# Byte Integrity: No NUL Bytes, No Stray Controls

The rule: content never carries NUL bytes or control characters outside `\n`, `\r`, and `\t`. The
write tool writes verbatim, so the risk lives in the content generated before the write, not in the
tool.

## The incident

On 2026-10-07 a bulk markdown conversion wrote NUL bytes into 25 files. The files looked correct in
prose and failed as soon as a parser read them. The conversion had used a NUL-separated record
convention because it was convenient for the script, and the bytes survived into the output.

## The rules

1. Never write a NUL byte (`0x00`) into file content.
2. Never write control characters other than `\n`, `\r`, `\t`.
3. Never build content through NUL-terminated or NUL-separated conventions: `printf '%s\0'`,
   `find -print0` into a file, C-string truncation, buffer padding.
4. Never generate the escape representation of NUL (`\0`, `\x00`, `\u0000`) in content that could
   materialize it.
5. After any bulk transformation, scan every touched file before reporting done.

## The scan

Run it as a command, not as a content read:

```sh
python3 -c '
import pathlib, sys
bad = []
for p in sys.argv[1:]:
    b = pathlib.Path(p).read_bytes()
    if b"\x00" in b:
        bad.append((p, "NUL"))
        continue
    try:
        b.decode("utf-8")
    except UnicodeDecodeError:
        bad.append((p, "invalid UTF-8"))
for p, why in bad:
    print(f"{why}: {p}")
sys.exit(1 if bad else 0)
' file1 file2 ...
```

A clean run prints nothing and exits zero. Any output is a failure to fix before the next step.

## Spot-check

After the scan, read one touched file and compare the changed span with the intent. The scan proves
the bytes are structurally valid; the spot check proves they are the right bytes.

## Why NUL is the signature

A NUL byte is not a formatting choice. It is the marker of content assembled by a pipeline that used
a C-string convention somewhere. When it appears, the correct response is to regenerate the content
through the tool API, not to strip the bytes afterwards.

## The verification gate in prompts

Every bulk-transformation spec includes the scan as an arbiter:

```text
After the transformation, run the byte scan over every touched file and
report its output. A non-zero exit or any printed line fails the task.
```

The gate is part of the task, not an optional check.
