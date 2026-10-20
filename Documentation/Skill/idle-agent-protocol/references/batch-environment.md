# The Batch Environment: You Are Never Alone

> Source: SKILL.md, "The environment + the scope discipline", bullets 1-3 and 6 (user-mandated 2026-10-08). Skill: idle-agent-protocol.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

1. **YOU ARE NEVER ALONE.** The batch has MANY agents working at once. The parent activates lanes in pairs - at any moment 1-3 other agents are editing the same repository, and a dozen more are queued.
2. **The activation message carries the CURRENT STATE block** - the running lanes + their tasks, the pending count, your scope reminder. READ IT and treat it as part of your spec.
3. **THE RUNTIME FACTS come from the parent's state block + your own verification.** Check the tree state (git status, the recent commits - the user commits MID-SESSION, so HEAD may move under you; the other lanes' in-flight files show as modifications) BEFORE + DURING your work. NEVER assume the tree is clean or that you are the only writer.
4. **STAY IN YOUR SCOPE.** The surfaces the other lanes own are OFF-LIMITS; the state block lists them. If your task touches a file another lane is editing - read-before-edit ALWAYS, coordinate via the report, never fight over the same file region.
5. **THE COMMON SKILLS bind every agent** - the global ~/.dsh/skills/ (worker-strains, task-routing, code-authoring, harness-observability) + the project's Documentation/Skill/ (orchestrator-batch, instructional-writing, plugin-system, smoke-writing). Load the relevant one before your task when in doubt about the environment.

## Why: The Full Philosophy

1. **Concurrency is the batch's defining condition, not an edge case.** The parent activates in pairs for throughput; the direct consequence is that the repository is a shared, moving object for the entire session. Every other discipline in this skill (retention, exact execution, scope, surgical edits, build verification) is downstream of this one fact.
2. **The state block is the only shared map.** Each lane sees its own spec; only the parent sees all lanes. The CURRENT STATE block is how the parent exports its global view to you: who is running, on what, how many lanes wait, and which surfaces are yours. Treating it as part of the spec (not as an FYI) is what makes the scope rule enforceable - you cannot avoid a lane's surface you never knew about.
3. **The tree moves under you in two ways.** The user commits mid-session, so HEAD is not stationary - a diff or a status that was true an hour ago may be false now. And other lanes' in-flight work appears as modifications to files you did not touch. Therefore verification is not a launch-time step but a continuous one: BEFORE + DURING.
4. **"Never assume clean" is the null hypothesis of the batch.** Assuming a clean tree produces edits based on phantom states; assuming sole-writer produces collisions. Both assumptions cost more than the check they skip.
5. **Scope discipline is read-before-edit plus routing, not just avoidance.** When a legitimate overlap happens (your spec genuinely touches a file another lane is editing), the protocol is: read immediately before every edit (so you edit the current bytes, not a stale copy), and surface the overlap in your report so the parent can sequence the lanes - never a silent race on the same region.
6. **The common skills are the environment's documentation.** No lane is expected to rediscover the batch protocol, the routing law, or the smoke discipline from scratch; the knowledge already exists in the two skill sets, and loading the relevant one is cheaper and more reliable than inference.

## Examples

### Good

- On activation, the agent reads the state block first: "RUNNING: lane A (tokens), lane B (docs). PENDING: 11. YOUR SCOPE: src/components/hero/." It plans around lane A's ownership of src/theme/ before touching anything.
- Mid-task, before its second edit to type.ts, the agent re-checks git status - lane B has meanwhile modified a neighboring file; the agent keeps to its own regions and notes the overlap in its report.
- Unsure whether the smokes or the site build is the arbiter for a file it is about to touch, the agent loads the project's smoke-writing / plugin-system skill instead of guessing.

### Bad

- Skipping the state block and starting from the base spec alone - the agent discovers lane A's edits by colliding with them.
- Checking git status once at activation and trusting it through the whole task - HEAD moved and another lane's in-flight files appeared; the agent edits against a stale picture.
- "The tree is clean, I'm the only writer today" - both forbidden assumptions in one sentence; the classic pre-collision state.
- Racing another lane on the same file region: both lanes editing hero.tsx simultaneously without report-level coordination, producing alternating overwrites.

## Exceptions

- **Reads are never scope-limited.** Only writes are. Reading another lane's in-flight file to understand the current state is correct and required; editing it is what the scope rule forbids.
- **Overlap is legitimate when both specs name the file.** Then the rule is sequencing through the parent (via the report), not prohibition - "never fight over the same file region" means coordinate, not "one of the specs is wrong".
- **The state block can lag.** If your own verification contradicts the state block (a lane listed as running has finished), your verification of the current tree wins for tree facts; the discrepancy itself is worth a report line.

## Failure Modes

- **The phantom-clean assumption.** Cost: edits against a tree that no longer exists; surprises at build time.
- **The sole-writer assumption.** Cost: direct write-write collisions; lost edits when both lanes write.
- **The unread state block.** Cost: scope violations discovered by the parent, not by you; avoidable collisions.
- **Stale-copy editing.** Editing from a read taken long ago. Cost: clobbering another lane's newer bytes in the same region.
- **Skill guesswork.** Cost: an agent re-derives (wrongly) what a skill already settles - e.g. which arbiter governs which file.

## Arbiters

- **The state block vs the tree.** A lane's report should reconcile: the surfaces it touched must be inside the scope the state block named.
- **The git status trail.** The report's claims about what existed when can be checked against the tree's history (read-only git is allowed; see ./references/universal-batch-rules.md).
- **The skill sets themselves.** When a lane's behavior contradicts a loaded common skill, the skill is the arbiter; the contradiction is flagged, not absorbed (see ./references/flag-and-report.md).
