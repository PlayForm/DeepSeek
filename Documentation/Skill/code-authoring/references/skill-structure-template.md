# The Canonical Skill Structure Template (All Skills)

> Source: the user's expanded mandate of 2026-10-20: rewrite every skill to the same style and structure - the main SKILL.md describes the skill, text references live in references/ next to the SKILL.md, scripts live in scripts/, every bullet and script explained fully in the references, all skills conform to one template.
> This file is the canonical definition of that template; every skill's SKILL.md points here for its structure.

## The Mandate (verbatim intent)

- The main skill is described in the SKILL.md (to whatever the limit
  allows - the summary + the pointers), but the references for it are
  placed inside a `references/` folder next to the SKILL.md.
- Each and every bullet point, rule, or script the skill uses is also
  explained better and more detailed - in the references. Nothing is
  condensed away: the references carry the full philosophy (rationale,
  derivation, examples good and bad, exceptions, failure modes,
  arbiters).
- `references/` for text, `scripts/` for scripts.
- All skills are rewritten to the SAME style of writing and the SAME
  structure - they must all look the same.

## The Directory Layout

```
<skill-name>/
  SKILL.md                  <- frontmatter + summary + pointer index
  references/               <- one markdown file per rule/topic (text)
  scripts/                  <- only if the skill uses scripts
```

## The SKILL.md Template (canonical shape)

```markdown
---
name: <skill-name>                    # unchanged
description: <existing description>   # unchanged
whenToUse: <existing whenToUse>       # unchanged (if present)
---

# <Skill Title> - Operating Manual

<2-3 line summary: what the skill governs and its status/mandate date.
The full philosophy lives in the references; this file is the index.>

## <Section 1 title>

1. **<Rule name>** - see ./references/<name>.md
   <one-line summary of the rule>
2. ...

## <Section 2 title>

- **<Rule name>** - see ./references/<name>.md
  <one-line summary>

## Application / Protocol (if the skill has one)

- **<Protocol point>** - see ./references/<name>.md
  <one-line summary>
```

## The Pointer Format (canonical, everywhere)

Every bullet in every SKILL.md is a pointer of the exact form:

```
see ./references/<name>.md
```

- One reference file per rule or topic; the reference set covers every
  rule - completeness is part of the template, not optional.
- The bullet keeps: bold rule name, the pointer, and a one-line summary.
  The summary orients; the reference carries the full body.
- Section-level intro paragraphs also get a reference when they carry
  content (a rationale, a status note), so no content exists only in
  the SKILL.md.

## The Reference File Template (canonical shape)

```markdown
# <Rule Title>

> Source: SKILL.md, <Section>, rule <n>. <mandate date if known.>
> This file carries the full philosophy; SKILL.md only points here.

## The Rule
<the rule stated precisely>

## Why: The Full Philosophy
<rationale, derivation, numbered arguments>

## Examples
### Good   <verbatim examples>
### Bad    <verbatim examples>

## Exceptions
<each documented exception and why it is documented>

## Failure Modes
<the concrete ways the rule gets broken and what each costs>

## Arbiters
<how compliance is checked: reviews, scans, smokes, ledgers>
```

Section headings flex per topic (a naming reference may have "The Six
Properties"; a protocol reference may have "The Protocol, Step by
Step") - the REQUIRED spine is: The Rule / the philosophy section /
examples / exceptions (when they exist) / failure modes / arbiters.
Style: ASCII only, tabs for indentation in code blocks, standard
markdown headers, tables, and ASCII diagrams.

## The Scripts Rule

If a skill uses scripts, each script lives in `scripts/` and its
purpose, inputs, outputs, and failure modes are explained in a
reference (the script file is code; the reference is its philosophy).
No script exists without an accompanying reference explaining it.

## The Conversion Protocol (per skill)

1. Read the skill's SKILL.md in full.
2. Preserve the frontmatter exactly (name, description, whenToUse).
3. Design the reference set: one file per rule/topic; expand each to
   the full depth - content facts, laws, and numbers are rewritten,
   never lost.
4. Create `references/` (and `scripts/` if needed).
5. Write the references via the write/edit tool API (never terminal
   passes; never git; ASCII + tabs).
6. Rewrite SKILL.md to the template: frontmatter + summary + pointer
   index.
7. Self-verify: every original rule has a pointer; every pointer has a
   file; the file reads back clean (no NUL bytes if a bulk pass was
   involved - see ./references/byte-verify-after-bulk.md).

## Why One Canonical Template

1. **Navigation is learnable once.** A user or agent that knows any
   skill's shape knows all of them: where the summary lives, where the
   philosophy lives, what a pointer means.
2. **Consistency is a discipline, not a preference** - the same
   reasoning that mandates one tool API for file changes mandates one
   structure for skill files: uniform artifacts are verifiable,
   diffable, and reviewable.
3. **Skills are the running system's instructions.** They load into
   future sessions; a uniform structure means future sessions parse
   intent (index) vs depth (references) the same way every time.

## Failure Modes

- Condensing during conversion: the reference file that summarizes
  instead of expands. The test: the reference must be LONGER and
  DEEPER than the original bullet, never shorter.
- Losing content: a number, date, or law from the original that
  neither the SKILL.md summary nor any reference carries. Conversion
  is rewrite, never loss.
- Pointer drift: a SKILL.md pointer to a file that does not exist, or
  a reference no pointer mentions. Every pointer resolves; every file
  is pointed to.
- Structural drift between skills: each conversion follows THIS file;
  no skill invents its own section order.
