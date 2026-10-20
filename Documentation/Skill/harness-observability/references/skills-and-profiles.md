# The Skills Homes, the Profile, and the Config Surface

> Source: SKILL.md, section 4, rules 2, 3, and 5. Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Three state homes sit under ~/.dsh, observable by reading their files:

1. **~/.dsh/skills/ - the GLOBAL skills home.** The loadable skills live
   here: task-routing, worker-strains, code-authoring, plugin-development,
   harness-observability (this skill). The project's OWN bundles live in the
   repository's Documentation/Skill/: instructional-writing, plugin-system,
   smoke-writing, idle-agent-protocol, orchestrator-batch. The orientation
   law of the project's session-orientation skill: orient from the repo's
   OWN skills FIRST - Documentation/Skill/ is the specialized truth;
   ~/.dsh/skills/ is the fallback.
2. **~/.dsh/profiles/ - the profile (desktop).** It holds:
   - the bundles (the live plugin family the profile runs);
   - the cordis.patch.yml (the agent-loop config - NEVER edit it while
     subagents run);
   - the settings.
3. **~/.dsh/settings.yaml.imported + the skills' provenance - the config
   surface.** The imported settings record and the per-skill provenance are
   the observable configuration trail: what the configuration was imported
   from and where each skill came from.

## Why: The Full Philosophy

1. **Two skill homes, ordered.** The global home (~/.dsh/skills/) holds the
   harness-wide skills; the repository holds its own specialized bundles
   under Documentation/Skill/. The order matters: repo skills are more
   specific to the current work, so they are loaded first, and the global
   home is the fallback - not the reverse.
2. **The profile is the runtime's configuration, on disk.** Bundles,
   patch files, and settings determine what the harness loads and how the
   agent loop is configured. Reading them answers "what is this profile
   actually running"; that is observable state, distinct from guessing from
   behavior.
3. **cordis.patch.yml is live and shared.** It configures the agent loop.
   Editing it while subagents run changes the rules underneath running
   workers - hence the never-edit-while-subagents-run rule. Changing the
   profile generally affects every session in it (see
   ./references/plugin-manager.md for the plugin/bundle changes).
4. **Provenance closes the audit loop.** settings.yaml.imported and the
   skills' provenance tell you where the current configuration came from -
   which matters when a behavior seems wrong and you need to know whether
   the skill, the import, or the profile is its source.

## Examples

### Good

- "Which skills exist?" - list ~/.dsh/skills/ AND the project's
  Documentation/Skill/, then load the repo's own bundle first.
- "Why is the agent loop behaving this way?" - read the profile's
  cordis.patch.yml and settings (read-only), then report.

### Bad

- Editing cordis.patch.yml while subagents are running - the loop config
  changes under live workers.
- Loading only ~/.dsh/skills/ and concluding the project has no specialized
  skills - the repo's Documentation/Skill/ bundles are missed.

## Exceptions

- The never-edit rule for cordis.patch.yml applies while subagents run;
  after they finish, profile changes are still profile-wide (they affect
  every session) and belong to the user-approved change paths.
- The global home is a fallback, not an invalid source: harness-wide skills
  legitimately live there.

## Failure Modes

- Treating ~/.dsh/skills/ as the complete skill inventory: the project's
  specialized bundles are missed and repo-specific guidance is not loaded.
- Editing the profile's patch file mid-delegation: running subagents change
  behavior mid-flight.
- Reporting configuration from memory instead of from the files: the
  profile's actual state is on disk and may differ from recollection.

## Arbiters

- The files themselves are the arbiter: the skills homes' directories, the
  profile's bundle list, cordis.patch.yml, and the settings are read from
  disk, never from recollection.
- The session-orientation skill is the arbiter of the load order
  (repo first, global fallback).
