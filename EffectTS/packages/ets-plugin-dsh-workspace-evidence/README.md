# @playform/plugin-dsh-workspace-evidence

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/EVIDENCE](../../../Documentation/Plans/Workspace-Family/EVIDENCE.md)

## The role

The workspace-evidence service supplies the validation objects of the DeepSeek Harness, the evidence
dependencies, the four kinds of truth, and the stale-validation invalidation (the EVIDENCE role of
the family map, `Documentation/Plans/Workspace-Family/EVIDENCE.md`).

Phase 4 of the invisible flow (with semantics + approve): the evidence service validates the claims
of the workspace - the qualified freshness, the OutcomeEvidence, and the justified assertions.

- **The service.**

    The service is `ctx.workspaceEvidence`: `validate(id, kind, subject, dependencies, verdict?)`
    records one validation object, `check(id)` reads its status, `invalidate(key)` is the explicit
    Acar seam, and `list(status?)` and `statistics()` report.

- **The four kinds of truth** (the Representation-First research).

    The four kinds are reality, observation, representation, and intent - different truth claims
    with different proof.

    The service owns the taxonomy and validates the kind at the call boundary.

- **The evidence dependencies.**

    Every validation object declares its dependencies, and when a dependency changes (an fs/observed
    event through the Wire of the factory, or an explicit `invalidate(key)`), every dependent object
    goes stale in one pass (the incremental-computation principle - the Acar seam).

    The service never guesses a stale object back to fresh: a revalidation is a new validation
    object that supersedes the old.

    A **repeat event** (the same path carrying the same version within the coalescing window) runs
    no pass and records no line, because the invalidation of that file state already ran (the
    version token identifies the state).

    The guard (`Function/Duplicate`, the clock pattern of the monitor - no timer, 2 s, the
    `State.Now` test seam overrides it) is on the listener only, and the explicit `invalidate(key)`
    calls are never coalesced.

- **The honesty rule.**

    The service records the verdict of the caller and never invents one.

    The sequence is the monotonic counter of the service, never a wall clock.

- **The idle-forever posture.**

    The plugin ships disabled (`enabled: false`), never appears in the bundles of the profile, and
    enables only by an explicit ACTIVATE.

- **The ledger.**

    The ledger uses its own strings with the prefix `evidence:` (module-owned, byte-stable), one log
    per module (default `~/.dsh/playform/ets-plugin-dsh-workspace-evidence.log`).

## The ledger

Ledger lines (byte-stable): `disabled (enabled=false)`,
`validated <id> (<kind>, <subject>, N dependencies, <verdict>, sequence N)`,
`superseded <id> (sequence N)`, `stale <id> (dependency <key>)`, `no stale (dependency <key>)`,
`ignored <path> (own actor)`, `ignored <path> (excluded)`, `ignored <path> (absent observation)`,
`failed <path> (<reason>)`, `storage open failed: <reason>`.

A coalesced repeat event (the repeat-event guard) records nothing and adds no line.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of this package are read-only and record, all AUTOMATIC.

It has NO gated action (no file write, no batch commit, no spawn), so the block documents the
posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The plan

- [Workspace-Family/EVIDENCE](../../../Documentation/Plans/Workspace-Family/EVIDENCE.md) - the
  evidence role.
- **The idle-forever posture.**

    The plugin ships disabled (`enabled: false`), never appears in the bundles of the profile, and
    enables only by an explicit ACTIVATE.

## License

CC0-1.0.
