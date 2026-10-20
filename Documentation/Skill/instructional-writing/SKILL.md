> Specialized working copy (repo): synced from ~/.dsh/skills/instructional-writing/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: instructional-writing
description: Writing files whose value is the presence of typographic characters the family's normalization behavior would normally rewrite (instructional prose, fixtures, demo examples). Hard rules: such files are written with the raw-write tool ONLY (its verbatim path - the normalized write would destroy the deliberate characters); the deliberate characters are NEVER replaced with ASCII stand-ins; the "this file has an em dash" style instructional notes stay truthful (the literal character is present).
whenToUse: Writing or editing any file in this repository whose body must carry literal typographic characters - Test fixtures, the fixtures-md/ and fixtures/ archives, README/site demo examples with before/after content - and for any question about where such fixtures live, how they document themselves, or how they are verified.
---

# Instructional Writing

This skill governs the files whose value is the presence of typographic characters that the family's normalization would normally rewrite: instructional prose, Test fixtures, the fixtures-md/ and fixtures/ archives, and demo examples with before/after content. The user mandate of 2026-10-07 set aside the usual normalization discipline for exactly these files; this SKILL.md is the index, and every rule's full philosophy lives in the reference files under ./references/.

## The Rules

1. **The mandate** - why instructional/fixture files deliberately carry typographic characters, and what the 2026-10-07 mandate establishes - see ./references/mandate.md
2. **Raw-write is the only writer** - the verbatim path vs the normalized write; these files are never plain-written - see ./references/raw-write-only-writer.md
3. **Read before overwrite** - raw-write refuses to overwrite a file it has not seen; read first, then write - see ./references/raw-write-read-before-overwrite.md
4. **Absolute paths** - raw-write resolves relative paths against the profile root; pass absolute paths for repo and workspace targets - see ./references/raw-write-absolute-paths.md
5. **The raw-write flags** - normalize re-applies the six transforms (for output demos); govern routes manifest writes through the governance chain - see ./references/raw-write-flags.md
6. **The deliberate character inventory** - every normalizable codepoint the fixtures carry, grouped by the transform it exercises - see ./references/deliberate-characters.md
7. **Truthful instructional notes** - a claim about a character must match the bytes; the "this file has an em dash" pattern; never ASCII stand-ins - see ./references/truthful-notes.md
8. **Fixture conventions** - locations (Test/, fixtures-md/, fixtures/), exclusivity of the archive, purpose lines, the Test/README.md index, the proof style - see ./references/fixture-conventions.md
9. **Verification** - read-only Python byte-checks after every write; the smokes' fixture assertions are the arbiter; no in-place rewrites - see ./references/verification.md
10. **Demo examples** - before/after content follows the fixture law; the exempt-edit pattern for subagents whose streams still normalize - see ./references/demo-examples.md
