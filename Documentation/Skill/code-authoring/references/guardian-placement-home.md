# Where the Guardian Note Lives: This Skill and Plugin-Development

> Source: SKILL.md, Section 1b, part 4. User-mandated 2026-10-04.

## The Rule

The guardian note lives in TWO places:

1. **This skill (code-authoring)** - the discipline's home. The
   discipline is what the guardian enforces, so the enforcement design
   belongs beside the rules it protects.
2. **Plugin-development** - because the guardian is a NEW PLUGIN
   ARCHETYPE: a discipline-enforcement hook. The plugin-development
   skill covers the API contract for all plugin kinds; the guardian
   extends that catalog with an archetype whose purpose is not
   capability but BEHAVIOR - steering agents away from forbidden
   execution patterns.

## Why Two Homes and Not One

1. **The two audiences never overlap by default.** An agent about to
   edit files loads code-authoring; a developer about to write a plugin
   loads plugin-development. The guardian must be visible to both:
   enforcement design to the former (so agents understand the denials
   they may receive), implementation contract to the latter (so the
   archetype gets built correctly).

2. **The discipline's home is the natural place for its enforcement.**
   A rule and its enforcement mechanism drift apart when documented in
   different systems. Keeping the guardian note here ties its evolution
   to the rules': if the forbidden patterns change, the guardian's
   detection list and this skill's Section 1 change together.

3. **Plugin-development owns the HOW.** The pre-execute waterfall, the
   allow/deny contract, ledger conventions, and packaging are
   plugin-development territory. This skill only records WHAT the
   guardian must do and WHY; it deliberately does not duplicate the
   API contract - that duplication would create two sources of truth.

## The Division of Content

| Concern | Home |
|---------|------|
| The forbidden patterns (the exact Section 1 lists) | code-authoring |
| The rationale (model-independence, self-teaching) | code-authoring |
| Modes A and B design intent | code-authoring (summary) + plugin-development (implementation notes when built) |
| The pre-execute contract, packaging, the archetype's API | plugin-development |

## Failure Modes

- The note surviving in only one skill: agents never see it, or plugin
  developers never build it.
- Duplication without a cross-reference: the two copies drift and one
  describes an obsolete guardian.
- This skill growing implementation detail: the discipline should stay
  readable; the API specifics belong to the plugin skill.
