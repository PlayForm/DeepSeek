# @playform/plugin-dsh-workspace-evidence

The workspace-evidence service: the DeepSeek Harness's validation objects + the evidence
dependencies + the four kinds of truth + the stale-validation invalidation (the family map's
EVIDENCE role, `Documentation/Plans/Workspace-Family/EVIDENCE.md`).

Phase 4 of the invisible flow (with semantics + approve): the evidence service validates the
workspace's claims - the qualified freshness, the OutcomeEvidence, the justified assertions.

- **The service**: `ctx.workspaceEvidence` - `validate(id, kind, subject, dependencies, verdict?)`
  records one validation object, `check(id)` reads its status, `invalidate(key)` is the explicit
  Acar seam, `list(status?)` and `statistics()` report.
- **The four kinds of truth** (the Representation-First research): reality, observation,
  representation, intent - different truth claims, different proof. The service owns the taxonomy
  and validates the kind at the call boundary.
- **The evidence dependencies**: every validation object declares its dependencies; when a
  dependency changes (an fs/observed event through the factory's Wire, or an explicit
  `invalidate(key)`), every dependent object goes stale in one pass (the incremental-computation
  principle - the Acar seam). A stale object is never guessed back to fresh: a revalidation is a new
  validation object, superseding the old.
- **The honesty rule**: the service records the caller's verdict; it never invents one. The sequence
  is the service's own monotonic counter - never a wall clock.
- **The idle-forever posture**: ships disabled (`enabled: false`), never appears in the profile's
  bundles, enables only by an explicit ACTIVATE.
- **The ledger**: its own strings, prefix `evidence:` (module-owned, byte-stable), one log per
  module (default `~/.dsh/evidence.log`).

Ledger lines (byte-stable): `disabled (enabled=false)`,
`validated <id> (<kind>, <subject>, N dependencies, <verdict>, sequence N)`,
`superseded <id> (sequence N)`, `stale <id> (dependency <key>)`, `no stale (dependency <key>)`,
`ignored <path> (own actor)`, `ignored <path> (excluded)`, `ignored <path> (absent observation)`,
`failed <path> (<reason>)`, `storage open failed: <reason>`.
