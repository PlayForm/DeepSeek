# @playform/plugin-dsh-workspace-authority

The workspace-authority service: the authority step of the workspace family's
invisible flow - operate proposes → the govern gates → **the authority
licenses** → the approve binds. The service keeps the **three separate
authority records** (v4.1 section 3.9, correcting the corpus's own
conflation) and owns the **eviction dispositions**.

The plugin ships **disabled** (the idle-forever posture): the service
registers and reads honestly, but grants, leases and evictions are refused
with a byte-stable ledger line until enabled.

## The three records (never one object)

| Record       | Question              | Fields                                                                  |
| ------------ | --------------------- | ----------------------------------------------------------------------- |
| Capability   | what the actor may do | holder, resource, permitted operations, expiration, delegation, revocation |
| Lease        | for how long          | holder, resource, acquisition, expiry (lazy expiry sweep)                |
| Residency    | what stays in store   | resource, kind, **weight** (representation-only field), promoted flag    |

The license/weight conflation is a logged pitfall: priority, retention and
permission are never interchangeable - the capability carries no weight and
the policy never reads the weight except to order candidates.

## The eviction dispositions

`keep` · `defer` · `evict` · `discard` · `promote` - decided by the policy
table (rules per resource kind, with defaults, TTLs and the revocation
timing); **the license decides, the weight only ranks**. Two shields force
`keep`: an open non-expired lease, and an active capability (a revoked one
shields only within the revocation grace). `evict` keeps the record in the
graveyard (recoverable); `discard` removes it permanently.

## Service

`ctx.workspaceAuthority` (registered from apply):

- `grant({holder, resource, operations, expiresAt?, delegation?})` → capability
- `revoke(id)` · `authorize(holder, resource, operation)` → boolean
- `acquire(holder, resource, kind?, ttlMs?)` → lease · `release(id)`
- `residence(resource, kind, weight)` → residency record
- `evict(resources?)` → `{resource, disposition}[]`
- `statistics()` → counts

## Config (all volatile)

| Field                    | Default               | Meaning                              |
| ------------------------ | --------------------- | ------------------------------------ |
| `enabled`                | `false`               | the master switch                    |
| `log` / `logFile`        | `true` / `~/.dsh/authority.log` | the durable ledger         |
| `defaultTtlMs`           | `300000`              | the default lease TTL                |
| `maxLeasesPerHolder`     | `8`                   | the lease ceiling                    |
| `maxCapabilitiesPerHolder` | `16`                | the capability ceiling               |
| `revocationGraceMs`      | `0`                   | the revoked capability's shield time |
| `policy`                 | `[]`                  | `{kind, disposition, ttlMs?, maxResidencyMs?, revocationGraceMs?}` |

## Ledger lines (module-owned, byte-stable)

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
