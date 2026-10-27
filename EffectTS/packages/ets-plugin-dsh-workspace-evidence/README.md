# @playform/plugin-dsh-workspace-evidence

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/EVIDENCE](../../../Documentation/Plans/Workspace-Family/EVIDENCE.md)

## The role

The workspace-evidence service: the DeepSeek Harness's validation objects + the evidence
dependencies + the four kinds of truth + the stale-validation invalidation (the family map's
EVIDENCE role, `Documentation/Plans/Workspace-Family/EVIDENCE.md`).

Phase 4 of the invisible flow (with semantics + approve): the evidence service validates the
workspace's claims - the qualified freshness, the OutcomeEvidence, the justified assertions.

- **The service**: `ctx.workspaceEvidence` - `validate(id, kind, subject, dependencies, verdict?)`
  records one validation object, `check(id)` reads its status, `invalidate(key)` is the explicit
  Acar seam, `list(status?)` and `statistics()` report.

- **The four kinds of truth** (the Representation-First research): reality, observation,
  representation, intent - different truth claims, different proof.

    The service owns the taxonomy and validates the kind at the call boundary.

- **The evidence dependencies**: every validation object declares its dependencies; when a
  dependency changes (an fs/observed event through the factory's Wire, or an explicit
  `invalidate(key)`), every dependent object goes stale in one pass (the incremental-computation
  principle - the Acar seam).

    A stale object is never guessed back to fresh: a revalidation is a new validation object,
    superseding the old.

    A **repeat event** - the same path carrying the same version within the coalescing window - runs
    no pass and records no line: that file state's invalidation already ran (the version token
    identifies the state).

    The guard (`Function/Duplicate`, the monitor's clock pattern - no timer, 2 s, the `State.Now`
    test seam overrides it) is on the listener only; the explicit `invalidate(key)` calls are never
    coalesced.

- **The honesty rule**: the service records the caller's verdict; it never invents one.

    The sequence is the service's own monotonic counter - never a wall clock.

- **The idle-forever posture**: ships disabled (`enabled: false`), never appears in the profile's
  bundles, enables only by an explicit ACTIVATE.
- **The ledger**: its own strings, prefix `evidence:` (module-owned, byte-stable), one log per
  module (default `~/.dsh/playform/ets-plugin-dsh-workspace-evidence.log`).

## The ledger

Ledger lines (byte-stable): `disabled (enabled=false)`,
`validated <id> (<kind>, <subject>, N dependencies, <verdict>, sequence N)`,
`superseded <id> (sequence N)`, `stale <id> (dependency <key>)`, `no stale (dependency <key>)`,
`ignored <path> (own actor)`, `ignored <path> (excluded)`, `ignored <path> (absent observation)`,
`failed <path> (<reason>)`, `storage open failed: <reason>`.

A coalesced repeat event (the repeat-event guard) records nothing and adds no line.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This package's actions are read-only and record, all AUTOMATIC; it has NO gated action (no file
write, no batch commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount; a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The plan

- [Workspace-Family/EVIDENCE](../../../Documentation/Plans/Workspace-Family/EVIDENCE.md) - the
  evidence role.
- The idle-forever posture: ships disabled (`enabled: false`), never appears in the profile's
  bundles, enables only by an explicit ACTIVATE.

## License

CC0-1.0.
