# The Recitable Summary (What a Fresh Session Must Be Able to Say)

> Source: SKILL.md, section 7 ("The one-paragraph summary a fresh session
> must be able to recite"). Converted to the canonical skill structure on
> 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Every fresh session, after completing the loading order, must be able to
recite this one-paragraph summary:

> Orient from the repo's own skills (Documentation/Skill/ first, ~/.dsh/
> skills/ fallback), read README + Plans + Guides for the state, route every
> subagent to cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low, never
> mutate git (checks only; report READY-TO-COMMIT), write files only through
> the tool API (raw-write/edit for unicode glyphs - the normalize hooks are
> active), know the 25 published @playform packages at 0.0.1 (Classic +
> EffectTS + ets-base-dsh), and know that the next session's task is
> authoring ~/Developer/Application/PlayForm/Aphrodite/Site - the advanced
> iteration of this repo's Site/ workflows.

The summary is the compression of every law in this skill. Reciting it is
the self-test for orientation.

## Why: The Full Philosophy

1. **The summary is a checksum, not a replacement.** It compresses the
   loading order, the routing law, the git law, the file-write law, the
   published family, and the next task into one paragraph. A session that
   can produce it accurately has loaded all six; a session that garbles any
   clause has found its own gap. It is deliberately phrased so each clause
   maps to exactly one rule:
   - "repo's own skills ... fallback" -> the truth ordering
     (see ./references/repo-skills-first.md)
   - "README + Plans + Guides" -> the current state
     (see ./references/current-state-reading.md)
   - "cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low" -> the
     routing law (see ./references/routing-law.md)
   - "never mutate git (checks only; report READY-TO-COMMIT)" -> the git law
     (see ./references/git-law.md)
   - "tool API ... raw-write/edit ... normalize hooks" -> the file-write law
     (see ./references/file-write-law.md)
   - "25 published @playform packages at 0.0.1" -> the published family
     (see ./references/published-family.md)
   - "~/Developer/Application/PlayForm/Aphrodite/Site" -> the next task
     (see ./references/next-task-aphrodite.md)
2. **Recitation is cheap and catches the expensive failures.** Most
   orientation failures are omissions (a law not loaded, a path forgotten).
   The summary makes omission audible: a skipped law leaves a missing clause
   that is easy to notice in your own output.
3. **It fixes the vocabulary.** The summary states the exact route triple,
   the exact READY-TO-COMMIT wording, the exact package count and version,
   and the exact next-task path. Reciting it locks the canonical terms,
   preventing slow drift ("the GLM route", "some 20-something packages") in
   later speech and writing.

## Examples

### Good

- Before its first action, a fresh session writes out (internally or in its
  reply) the one-paragraph summary verbatim and confirms every clause is
  backed by something it actually read this session.
- A session asked "are you oriented?" answers with the summary, then
  proceeds.

### Bad

- A session paraphrases loosely ("I know the rules - route cheap, don't
  commit") and treats that as recitation; the loose form hides the exact
  path and count it never checked.
- A session recites the summary but cannot name the source it read for each
  clause - the recitation is memory of the skill text, not evidence of
  loading.

## Exceptions

- None documented. The recitation is a self-test, not a gate others must
  pass for the session; skipping it merely removes the session's own
  cheapest verification.

## Failure Modes

- Paraphrase drift: reciting an abbreviated version that silently drops a
  clause (most often the file-write law or the package count), so the
  self-test passes while the gap persists.
- Recite-without-load: producing the summary from the skill's own text
  without having read the underlying state documents - the checksum is
  computed over nothing.
- Clause-rule mismatch: reciting a clause but applying a different rule
  (e.g. saying READY-TO-COMMIT and still staging files) - the summary is
  then decoration, not discipline.

## Arbiters

- The verbatim text above is the reference recitation; deviations in facts
  (route triple, path, count, version) are errors, not style.
- The clause-to-reference mapping above: every clause must resolve to a
  reference in this skill (see SKILL.md's pointer index); an unmapped clause
  means the summary or the index has drifted.
- Session behavior is the final arbiter: the recited laws must match the
  session's first actions.
