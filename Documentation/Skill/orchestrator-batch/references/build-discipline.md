# Build Discipline: The Lanes' Arbiter Form and the No-Build Law

> Source: SKILL.md, two sources:
> (a) "The loop", step 5, "THE LANES' ARBITER FORM" (the user's side note,
>     2026-10-09);
> (b) "THE FORMALIZED ORCHESTRATION MODEL", points 5 (THE NO-BUILD LAW, the
>     Aphrodite site batch) and 6 (THE DEPLOY ALIGNMENT, the DeepSeek-exact
>     form, 2026-10-10).
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

There are TWO build-discipline regimes, per batch; the orchestrator states
which applies when the lanes are briefed:

### Regime A - the lanes' arbiter form (the user's side note, 2026-10-09)

The lanes do NOT launch the dev server (no `astro dev` / `astro preview` -
the port conflicts) and run NO tsc checks and NO git checks. When a build is
needed, the lane runs:

```
cd Site && pnpm prepublishOnly
```

(the site's build script), plus the built-HTML/CSS verification over `Target/`,
plus the measured checks - and that is ALL.

### Regime B - the no-build law (the Aphrodite site batch, 2026-10-10)

The agents NEVER run `prepublishOnly` - the USER's own build is the arbiter.
The fast guards only:

```
pnpm run Drift
```

plus the targeted greps. Never the dev server, never tsc.

### The deploy alignment (both regimes; the DeepSeek-exact form)

`prepublishOnly` = "astro build" only. The Docs/Diagrams/Drift scripts are
LOCAL manual commands - run before committing to keep the committed deploy
sources fresh - and the deploy builds purely from the committed state.

## Why: The Full Philosophy

1. **Why no dev server, ever:** `astro dev` / `astro preview` bind ports.
   Two lanes, or a lane plus the user, launching dev servers collide on
   ports and produce confusing "is it broken or is it the other server?"
   failures. Verification never needs a server: the built output is the
   evidence.
2. **Why no tsc checks:** tsc is slow, duplicates what the build already
   proves, and invites lanes to "fix" type errors outside their surface.
   The build's success is the type gate.
3. **Why no git checks:** lanes do not own the repository state - the user
   commits mid-session and the index state is theirs (see
   arbiters-are-the-lanes-own.md). A lane running git commands races the
   user's commits and can report phantom states.
4. **Why Regime A still allows a build:** some lanes genuinely cannot verify
   without building (HTML/CSS verification runs over `Target/`). The 2026-10-09
   form scopes that build to exactly one script - `pnpm prepublishOnly` from
   `Site/` - so it is reproducible and identical across lanes.
5. **Why Regime B bans even the build:** in the Aphrodite batch, the USER's
   own build is the arbiter - a lane-built artifact could differ from the
   user's deployed reality and produce false "fixed"/"broken" verdicts. The
   fast guards (`pnpm run Drift` + targeted greps) give the lane cheap,
   build-free evidence.
6. **Why the deploy alignment matters:** the deploy must be reproducible
   from the committed state alone. If Docs/Diagrams/Drift outputs were
   generated at deploy time, the deploy would depend on local machine state;
   running them locally BEFORE committing keeps the committed sources the
   single truth.

## Examples

### Good

- Regime A lane verifies its fix: `cd Site && pnpm prepublishOnly`, then
  checks the built HTML/CSS in `Target/` and the measured checks, then
  reports the numbers.
- Regime B lane verifies its fix: `pnpm run Drift`, a targeted grep for the
  changed selector, and a report stating the user's build will arbitrate.
- Before committing doc changes: run the Docs/Diagrams/Drift scripts locally
  so the committed deploy sources are fresh.

### Bad

- A lane launching `astro dev` to "check the page visually" - port
  conflicts, and the served dev output is not the built truth.
- A Regime B lane running `prepublishOnly` anyway - it then argues with the
  user's build verdict using a different artifact.
- A lane running `git status` / `git log` as part of verification and
  reporting commit-state conclusions.

## Exceptions

- The orchestrator may name the regime per batch; a mixed batch (both
  repository types) states the regime per lane in each brief.
- The user's direct instruction overrides a ban for that one act (e.g. the
  user asks a lane to run the build in a Regime B batch) - explicit only.

## Failure Modes

- Port conflicts from dev servers: two listeners, half-broken pages,
  misdiagnosed "regressions".
- Regime confusion: a Regime A lane in a Regime B batch builds an artifact
  the user's build then contradicts - a wasted cycle and a false dispute.
- Deploy drift: Docs/Diagrams/Drift outputs not regenerated before
  commit - the deploy then builds from stale committed sources.

## Arbiters

- Regime A: the lane's report must show the `pnpm prepublishOnly` run, the
  built-HTML/CSS checks over `Target/`, and the measured checks - and must
  NOT show any dev server, tsc, or git invocation.
- Regime B: the lane's report must show `pnpm run Drift` and the targeted
  greps only; any `prepublishOnly` run is a violation (the user's build is
  the arbiter).
- The deploy alignment is checked at the deploy: the deploy must build from
  the committed state; if it needed uncommitted local outputs, the
  pre-commit regeneration was skipped.
