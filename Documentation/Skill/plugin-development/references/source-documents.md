# Source Documents: Where the Truth Lives

> Source: SKILL.md, section 13 "References". This file carries the full
> source list; SKILL.md only points here.

## The Rule

The manual's claims are grounded in these sources. Citations in the
references use the `file.md:line` form against these documents.

- Core API docs: `docs/cordis-api/{events,context,fiber,registry,service}.md`
- User development guides:
  - `docs/user/develop/basic/{index,config,tool,publish}.md`
  - `docs/user/develop/framework/{index,events,service}.md` (when present)
- Concept docs: `docs/event-producer-consumer.md`, `docs/capability-seams.md`,
  `docs/architecture.md`, `docs/defensive-patterns.md`, `docs/glossary.md`
- Subsystem docs: `docs/subsystems/{filesystem,tools}.md`
- Cookbooks: `docs/cookbook/{extension-cookbook,adding-a-tool}.md`
- Live template: `@local/dsh-hook-package-governor`
  (`~/.dsh/profiles/desktop/bundles/dsh-hook-package-governor/`)

Additional referenced docs cited inside the references:
`docs/cordis-primer.md`, `docs/config-catalog.md`,
`docs/subsystems/boot.md`, `docs/tool-execution-pipeline.md`,
`docs/inherited.md`, `docs/session-projection.md`, `docs/jobs.md`,
plus `docs/user/develop/basic/config.md` and
`docs/user/develop/framework/index.md` (numbered-citation sources).

## Why: The Full Philosophy

1. The manual is verification-driven: its claims come from the framework's
   own documentation (cited by file and line) AND from live verification
   against the running host and a fully shipped production plugin. When a
   reference cites `file.md:line`, that is the checkable provenance.
2. The live template (`@local/dsh-hook-package-governor`) matters as much
   as the docs: several pitfalls (see ./references/pitfalls-catalog.md,
   items 15-18) were discovered only by shipping, and the governor's code
   is the working reference for listener-based policy, apply() discipline,
   root-context jobs and sandbox handling.
3. When documentation and live behavior disagree, the live behavior on this
   machine wins - and the discrepancy gets recorded (dates like
   2026-10-03 in the references mark such verifications).

## Examples

### Good

"Listeners must be synchronous recorders (filesystem.md:490-509)" - a
claim with a line-level source.

### Bad

"The framework probably buffers fs events" - an uncited guess presented as
fact.

## Exceptions

- Docs noted "(when present)" - the framework guides may not exist in a
  given checkout; the basic guides and the live template remain the
  baseline.

## Failure Modes

- Citing from memory instead of from the document: drift between what the
  skill claims and what the source says.
- Treating the docs as truth over observed live behavior when they
  conflict - the recorded verifications exist precisely because the docs
  were incomplete or misleading in places (see
  ./references/documented-gaps.md).

## Arbiters

- Any claim in any reference can be traced to a listed document by file
  and line, or to a dated live verification.
- The governor checkout at
  `~/.dsh/profiles/desktop/bundles/dsh-hook-package-governor/` is the
  executable arbiter for plugin-shape questions.
