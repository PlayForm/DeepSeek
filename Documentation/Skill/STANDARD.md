# The Skill Corpus Standard (v2, 2026-10-20)

This document is the specification every skill in this repository follows.
It replaces the v1 template (SKILL.md as a pointer index) with a rule: the
SKILL.md is the operating manual, and the references are the depth.

## 1. What a skill is for

A skill is loaded so the agent can ACT correctly without re-deriving the
rules. It answers four questions, in this order:

1. Should I use this skill at all? (the trigger)
2. What must I do, in what order? (the workflow)
3. What must I never do? (the prohibitions)
4. How do I know I am done? (the verification)

A skill that only says "read these references" fails question 2. A skill
that restates another skill's rules fails the single-owner rule (section 6).

## 2. The corpus map (one owner per domain)

| Skill                  | Owns                                                                 | Does not own                                  |
| ---------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| `session-orientation`  | First-load order, repository map, current-state pointers, law index   | The laws themselves (each has an owner below) |
| `code-authoring`       | File-write tool discipline, byte integrity, git checks-only, code style | Plugin contracts, routing, smokes            |
| `plugin-development`   | The DSH/Cordis plugin API: dispatch, anatomy, config, services, tools | The family's bundle conventions               |
| `plugin-system`        | The family contract: inventory, bundle anatomy, build, ledger, ownership | The generic Cordis API                       |
| `smoke-writing`        | The smoke suites: harness pattern, assertions, traps, parity          | Build and ledger ownership (plugin-system)    |
| `task-routing`         | Model catalog, difficulty classification, routing table, ladder       | Strain definitions, batch bookkeeping         |
| `worker-strains`       | The three strains, spec-writing, cultivation, delegation loop         | The model policy (task-routing)               |
| `orchestrator-batch`   | The parent's batch loop: queue, reconfiguration, verification, report | The child's idle behavior                     |
| `idle-agent-protocol`  | The idle child's contract: retain, wait, execute, report              | The parent's queue                            |
| `harness-observability`| What the agent can see and how to inspect it                          | What to do with the facts                     |
| `instructional-writing`| Files whose value is literal typographic characters                   | Ordinary prose and code                       |
| `site-authoring`       | The Site/ lane: build, structure, design system, content, deploy      | Plugin code and smokes                        |

## 3. The SKILL.md specification

### 3.1 Frontmatter

```yaml
---
name: <skill-name>              # exactly the directory name, kebab-case
description: <what it does>. <when to load it>.   # one or two sentences
whenToUse: <exact triggers>. <stop conditions>.   # one or two sentences
version: 2.0.0
updated: 2026-10-20
---
```

The description is the retrieval surface: it must contain the words a
future request would use (the task nouns and verbs), not a slogan.

### 3.2 Body sections (in this order, none omitted)

1. **Title + purpose** - one paragraph: the decision this skill governs and
   the failure it prevents. No history unless the history is a rule.
2. **When to use** - bullets; include "Do not use for:" with the owner of
   the excluded work.
3. **The rules** - numbered, imperative, each one action. The reason is a
   clause, not a paragraph.
4. **The workflow** - numbered steps with exact paths and commands. Ends
   with the verification gate.
5. **Decision table** - the branches a reader will actually face.
6. **Verification** - the arbiter command and its expected output; what a
   failure means.
7. **Anti-patterns** - a table: the mistake, the cost, the correct move.
8. **References** - a table: file, what it covers, when to read it.

A SKILL.md longer than ~160 lines is hiding a reference. Move the depth,
keep the decision.

### 3.3 Self-sufficiency test

Before shipping a SKILL.md, answer: could an agent with no other context
complete the common case from this file alone? If no, the missing rule
belongs in the body, not in a reference.

## 4. The reference specification

- One topic per file, kebab-case, under `references/`.
- The file opens with a one-sentence purpose, then the rule, then the
  detail (inventory, examples, incident, environment notes).
- A reference may be long; a reference may not be vague. Every claim is
  verifiable or marked as history.
- No reference exists without a pointer from its SKILL.md; no pointer
  exists without a file.
- Scripts live in `scripts/` and get a reference that states purpose,
  inputs, outputs, and failure modes.

## 5. Voice and style

- Second person, imperative: "Run", "Do not", "Verify".
- One idea per sentence. Short sentences win.
- Active voice. Name the actor.
- No hedging ("should probably", "may want to"), no rhetoric, no slogans.
- ASCII only: hyphen-minus, straight quotes, three dots. The normalize
  hooks are active; a deliberate glyph needs `raw-write` (see
  `instructional-writing`).
- Tables for enumerable decisions; numbered lists for order; bullets for
  unordered sets.
- Tabs for indentation; lines at or under 100 characters.
- Do not write "the full philosophy lives in the references" or any other
  meta-commentary about the corpus.

## 6. The single-owner rule

A rule is stated in exactly one skill - its owner (section 2). Every other
skill that needs the rule names the owner and the action, and stops. If two
skills disagree, the owner wins and the other is corrected in the same
change set.

Cross-references use the skill name and the file, never a relative path
across skill directories: `see the task-routing skill, routing table`.

## 7. The fact policy

Facts drift. State a drifting fact with its verification command and the
date it was last verified:

```text
The family ships 15 Classic packages and 16 EffectTS packages (incl. the
base). Verify: `ls Classic/packages EffectTS/packages`.
```

Never copy a drifting fact into a second skill. Point to the owner or the
source file (a manifest, a smoke README, `Site/Source/Library/Content.ts`).

## 8. The authoring workflow

1. Read the skill's current SKILL.md and every reference it points to.
2. Decide what the skill owns (section 2) and what moves out.
3. Draft the SKILL.md to section 3; draft the references to section 4.
4. Write every file with the `write`/`edit` tool API. Never use terminal
   content operations (see `code-authoring`).
5. Verify: frontmatter parses, every pointer resolves, every reference is
   pointed to, no rule is duplicated across skills, ASCII is clean.
6. Install: write the same content to the repo copy
   (`Documentation/Skill/<name>/`) and the global copy
   (`~/.dsh/skills/<name>/`). The two are byte-identical; the repo copy
   wins by policy, not by a marker.

## 9. The verification checklist (run before reporting done)

- [ ] `name` equals the directory name.
- [ ] `description` names the task, `whenToUse` names the trigger.
- [ ] Every section of section 3.2 is present.
- [ ] Every `./references/<file>.md` pointer resolves to a real file.
- [ ] Every file under `references/` is pointed to by the SKILL.md.
- [ ] No rule appears in two skills (the ownership table, section 2).
- [ ] No drifting fact lacks a verify command.
- [ ] The content is ASCII (no curly quotes, dashes, ellipsis glyphs).
- [ ] The repo copy and the global copy are byte-identical.

## 10. Provenance

v1 (the pointer-index template) was written 2026-10-20 and is preserved in
git history. v2 replaces it because a pointer index forces a reference read
for every decision, and because the same rules had drifted into three or
four skills. The recreation is dated 2026-10-20.
