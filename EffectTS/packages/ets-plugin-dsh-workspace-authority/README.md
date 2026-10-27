# @playform/plugin-dsh-workspace-authority

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/AUTHORITY](../../../Documentation/Plans/Workspace-Family/AUTHORITY.md)

## The role

The workspace-authority service supplies the authority step of the invisible flow of the workspace
family: operate proposes → the govern gates → **the authority licenses** → the approve binds.

The service keeps the **three separate authority records** (v4.1 section 3.9, which corrects the
conflation in the corpus) and owns the **eviction dispositions**.

The plugin ships **disabled** (the idle-forever posture): the service registers and reads honestly,
but it refuses grants, leases, and evictions with a byte-stable ledger line until enabled.

## The three records (never one object)

| Record     | Question              | Fields                                                                     |
| ---------- | --------------------- | -------------------------------------------------------------------------- |
| Capability | what the actor may do | holder, resource, permitted operations, expiration, delegation, revocation |
| Lease      | for how long          | holder, resource, acquisition, expiry (lazy expiry sweep)                  |
| Residency  | what stays in store   | resource, kind, **weight** (representation-only field), promoted flag      |

The license/weight conflation is a logged pitfall: priority, retention, and permission are never
interchangeable.

The capability carries no weight, and the policy reads the weight only to order candidates.

## The eviction dispositions

The dispositions are `keep` · `defer` · `evict` · `discard` · `promote`, and the policy table
decides them (rules per resource kind, with defaults, TTLs, and the revocation timing).

**The license decides, and the weight only ranks.**

Two shields force `keep`: an open non-expired lease, and an active capability (a revoked one shields
only within the revocation grace).

`evict` keeps the record in the graveyard, so the record stays recoverable, and `discard` removes it
permanently.

## Service

`ctx.workspaceAuthority` (registered from apply):

- `grant({holder, resource, operations, expiresAt?, delegation?})` → capability
- `revoke(id)` · `authorize(holder, resource, operation)` → boolean
- `acquire(holder, resource, kind?, ttlMs?)` → lease · `release(id)`
- `residence(resource, kind, weight)` → residency record
- `evict(resources?)` → `{resource, disposition}[]`
- `statistics()` → counts

## The configuration (all volatile)

| Field                      | Default                                                           | Meaning                                                            |
| -------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `enabled`                  | `false`                                                           | the master switch                                                  |
| `log` / `logFile`          | `true` / `~/.dsh/playform/ets-plugin-dsh-workspace-authority.log` | the durable ledger                                                 |
| `defaultTtlMs`             | `300000`                                                          | the default lease TTL                                              |
| `maxLeasesPerHolder`       | `8`                                                               | the lease ceiling                                                  |
| `maxCapabilitiesPerHolder` | `16`                                                              | the capability ceiling                                             |
| `revocationGraceMs`        | `0`                                                               | the revoked capability's shield time                               |
| `policy`                   | `[]`                                                              | `{kind, disposition, ttlMs?, maxResidencyMs?, revocationGraceMs?}` |
| `automation.*`             | the D6 block (see below)                                          | the per-action allowlist (the shared factory block)                |

### The policy block (D6) - the `automation` key

The config carries the shared per-action allowlist (`automation: Policy()`, composed from the
factory's block) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The key is `automation`, NOT `policy`, because the `policy` of this package is already the residency
RULE TABLE above (`kind` -> `disposition`), a different contract.

The `plugin-dsh-route` precedent keyed its D6 block `automation` for the same reason.

The actions of this package are read-only and record, all AUTOMATIC.

It has NO gated action (no file write, no batch commit, no spawn), so the block documents the
posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).

The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## The ledger (module-owned, byte-stable)

```text
authority: activated (ttl=<ms>, policy=<n>)
authority: disabled (enabled=false)
authority: granted <id> (<holder> -> <resource>, <operations>)
authority: revoked <id>
authority: authorized <holder> <resource> (<operation>)
authority: denied <holder> <resource> (<operation>)
authority: refused grant (...)
authority: leased <id> (<holder> -> <resource>, expires <ms>)
authority: expired <id>
authority: released <id>
authority: residency <resource> (weight <w>)
authority: evicted <resource> (<disposition>)
```

## The plan

- [Workspace-Family/AUTHORITY](../../../Documentation/Plans/Workspace-Family/AUTHORITY.md) - the
  authority step.
- **The disabled posture.**

    The plugin ships **disabled** (the idle-forever posture): the service registers and reads
    honestly, but it refuses grants, leases, and evictions with a byte-stable ledger line until
    enabled.

## License

CC0-1.0.
