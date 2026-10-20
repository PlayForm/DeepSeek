# Never Build File Content Through NUL-Terminated or NUL-Separated Conventions

> Source: SKILL.md, Section 1c (Byte-integrity), rule 2. Post-incident 2026-10-07, user-mandated.

## The Rule

Never build file content through NUL-terminated or NUL-separated string
conventions. Specifically:

- no `printf '%s\0'` output flowing into file content,
- no `find -print0` / `xargs -0` output piped into file content,
- no C-string truncation (content that stops at a NUL because some layer
  treated it as a terminator),
- no byte-buffer padding leaking into text,
- generally: if a pipeline or a string builder could emit a null byte,
  do not use it to produce file content.

## Why These Conventions Exist (and Why They Must Not Touch Files)

NUL as a separator and terminator is a systems-programming convention:
C strings end at 0x00; `find -print0` and `xargs -0` use NUL separation
because filenames may contain every other character. The convention is
correct IN ITS DOMAIN: as an interchange format between two shell
stages that both understand it.

The failure happens when the convention LEAKS across its domain
boundary - from process plumbing into file content:

```
SAFE:   find . -print0 | xargs -0 rm        (NUL as plumbing between stages)
UNSAFE: find . -print0 > manifest.txt       (NUL written INTO a text file)
UNSAFE: printf '%s\0' "$fragment" >> file   (same leak, printf flavor)
```

The incident of 2026-10-07 (see
./references/byte-no-null-control-bytes.md) was exactly this leak:
a transformation's internal joining convention used NUL separation, and
the separator bytes ended up in the written markdown.

## The Deeper Failure: C-String Truncation

A second, sneakier leak: content PASSES THROUGH a layer that treats NUL
as a terminator. Consequences:

- Content after the first NUL is silently DROPPED - the file is
  truncated mid-sentence with no error.
- Or the layer stops reading at the NUL and the tail is reinterpreted
  as garbage.
Either way the written file differs from the intended content, and the
difference is invisible in a text-level review.

## The Practical Rules

1. Keep NUL-based plumbing strictly between cooperating stages and
   never aim its output at a file.
2. When a fragment may be empty or missing, join with a REAL text
   separator (or fail loudly) - never with `\0`.
3. Treat "this builder might emit a null byte" as a hard stop: change
   the builder, do not filter its output afterward. A filter that
   strips NULs hides the bug while normalizing the symptom; the next
   builder bug may leak a different control byte.

## Examples

### Good

```
# plumbing only - NUL stays between the two stages
find assets -name '*.tmp' -print0 | xargs -0 rm

# text assembly uses text separators
line="${label}=${value}"   # both fragments are verified text
```

### Bad

```
printf '%s\0' "$text" > out.md
find . -print0 > list.txt
python: b"\x00".join(fragments) written to a text file
```

## Arbiters

- The post-write byte scan (zero 0x00) catches the leak after the fact;
  the design rule is to keep NUL out of the content path entirely so
  the scan confirms rather than rescues.
- Pipeline review: any command chain whose output lands in a file must
  not contain `-print0`, `-0`, `%s\0`, or equivalent byte conventions.
