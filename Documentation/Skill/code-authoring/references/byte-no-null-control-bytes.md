# Never Write NUL Bytes or Control Characters Into File Content

> Source: SKILL.md, Section 1c (Byte-integrity), rule 1. Post-incident 2026-10-07, user-mandated.

## The Incident That Mandated This Section

A live incident: a bulk markdown conversion (inline links -> reference
links) wrote NUL bytes (0x00) where the link TEXTS should be. 25 files
were corrupted. The refs, the definitions, and the prose survived; the
text segments became null runs; the files turned binary and the links
rendered broken.

The failure shape: the transformation script built each output line
from pieces, and where a piece was missing or mis-bound, a null byte
(or a null-separated join) took its place. Nothing in the write path
refused it. The write tool writes VERBATIM - so the bytes the script
assembled became the files' bytes, binary corruption and all.

## The Rule

Never write NUL bytes (0x00) or any control character - other than the
line feed `\n`, carriage return `\r`, and horizontal tab `\t` - into
file content. Text files are UTF-8 text, nothing else.

| Byte range | Status in file content |
|------------|------------------------|
| 0x00 (NUL) | NEVER |
| 0x01-0x08, 0x0B, 0x0C, 0x0E-0x1F (control chars) | NEVER |
| 0x7F (DEL) | NEVER |
| \n (0x0A), \r (0x0D), \t (0x09) | allowed (they are text structure) |
| valid UTF-8 printable content | allowed |
| BOM (U+FEFF), zero-width spaces, other invisibles | avoid - use ASCII discipline (see ./references/skill-structure-template.md, the ASCII + tabs rule) |

## Why the Write Path Cannot Save You

The write tool is deliberately transparent: it writes what it is given,
byte for byte. That transparency is a feature everywhere else in this
skill (no hidden transformations, no surprises between intent and disk)
and the reason this section exists here: the RISK SURFACE IS THE
CONTENT THE AGENT GENERATES OR ASSEMBLES BEFORE THE WRITE. The gate
must be in the agent's generation process, not in the tool.

## Why Binary Bytes in Text Files Are Never Acceptable

1. **They break every downstream reader.** Editors, diff tools, grep,
   the harness's own read tool, renderers - all treat 0x00 as "not
   text". A single NUL can make a whole file display as binary and be
   refused by text-processing pipelines.
2. **They are almost always a bug's signature.** Legitimate text content
   has no reason to contain 0x00. Their presence indicates a broken
   join, an uninitialized buffer, a wrong encoding conversion, or a
   C-string convention leaking into data (see
   ./references/byte-no-nul-conventions.md).
3. **They corrupt silently and spread.** The incident's corruption
   pattern (missing text replaced by null runs) is invisible in a
   casual read: the file "looks" structurally intact. Only a byte scan
   catches it - which is why Section 1c mandates one (see
   ./references/byte-verify-after-bulk.md).

## Failure Modes

- A string builder joins fragments with `\0` separators (the incident).
- A template renderer emits padding bytes for empty slots.
- An encoding conversion maps an unmappable character to 0x00.
- Copying content from a binary source (a compiled artifact, a
  data blob) into what should be a text file.

## Arbiters

- The post-write byte scan for any bulk transformation (mandatory, see
  ./references/byte-verify-after-bulk.md): zero 0x00 bytes, zero
  stray control characters, valid UTF-8.
- For single-file writes: the generated content is inspected before the
  write; if the generation process could produce nulls, the content is
  regenerated, not written and patched later.
