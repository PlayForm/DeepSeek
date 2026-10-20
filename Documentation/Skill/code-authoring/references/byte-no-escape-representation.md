# Never Generate Content Containing the Escape-Representation of Null

> Source: SKILL.md, Section 1c (Byte-integrity), rule 3. Post-incident 2026-10-07, user-mandated.

## The Rule

Never generate content containing the escape-representation of null. If
generated text contains a `\0` (or any control-escape) that could
materialize as a real byte, regenerate or fix it BEFORE the write. A
model emitting `\x00` bytes is a WRITE-INTEGRITY FAILURE, not
acceptable output.

## The Two Layers of the Problem

There are two distinct levels where null can appear, and the rule binds
both:

1. **The literal byte (0x00) in the generated payload.** Covered by the
   previous rules - see ./references/byte-no-null-control-bytes.md
   and ./references/byte-no-nul-conventions.md.

2. **The ESCAPE FORM in the generated text** - the characters backslash
   and zero forming `\0`, `\x00`, `\u0000`, `${'\0'}` - in a context
   where SOME LATER LAYER interprets escapes. This layer is the trap:
   the content looks like harmless text at generation time, and the
   byte materializes when the content is consumed by an interpreter
   (a shell, a template engine, a JSON parser in string context, a
   regex compiler).

## Why the Escape Form Is Dangerous Even When "Just Text"

```
Generated content:   echo "a\0b" >> data.md      (escape form, looks inert)
     |
     v
Consumed by shell:   \0 inside double quotes -> shell may emit NUL or error
     |
     v
data.md now contains or loses bytes
```

The escape form is a latent byte. The write tool would store the four
characters `\`,`0` verbatim - safe. The danger is every downstream
interpreter that treats the escape as its meaning. A file that contains
latent escapes is a file whose safety depends on who reads it and how.

## The Model's Own Responsibility

The rule addresses the generator directly: A MODEL EMITTING `\x00`
BYTES IS A WRITE-INTEGRITY FAILURE. That phrase sets the standard:

- producing escape forms that could materialize is not a small slip;
  it is categorized as an integrity failure of the write, on the same
  level as producing the actual byte;
- the remedy is BEFORE the write: regenerate or fix the content. It is
  not "write it and patch after" - the write of known-suspect content
  is itself the violation.

## What Counts as "Could Materialize"

| Content contains | Interpreted by | Materializes as |
|------------------|----------------|-----------------|
| `\0`, `\x00`, `\u0000` | shell (double quotes), many template engines, C-family string literals | NUL byte |
| `\0` inside a regex pattern | regex compilers | match-any-null or error |
| `\u0000` in JSON strings consumed by parsers | JSON parsers | U+0000 in the decoded string |
| Any `\a \b \v \f` style control escapes headed for an interpreter | interpreters | control bytes |

If the destination is plain UTF-8 text and the consumer is a human or a
markdown renderer, escapes still fail the spirit of the rule: text
files should not carry latent byte semantics.

## The Fix Path

1. Detect: the generated content contains `\0`-family escapes.
2. Decide: is the escape meaningful for the destination? (In this
   workspace's text files: effectively never.)
3. Regenerate or edit the content to the intended literal text.
4. Then write.
5. If the escape was intentional (e.g. the file is ABOUT escapes, like
   a reference documenting `\0`), ensure the representation is inert in
   every consumer context - e.g. inside a fenced code block that no
   interpreter evaluates, with the ASCII discipline of the skill's
   structure rules.

## Arbiters

- Pre-write inspection of generated content for escape forms
  (`\0`, `\x00`, `\u0000`).
- The post-write byte scan (Section 1c rule 4) as the backstop for the
  cases where an interpreter ran between generation and disk.
