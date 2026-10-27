# SCHEME - @playform/plugin-dsh-workspace-authority

The authority service of the workspace family covers the capabilities, the leases, and the
residency - the licenses.

## Position in the flow

```
observe stamps → semantics resolve → operate proposes → govern gates →
AUTHORITY LICENSES → approve binds → merge → journal → audit → live
```

## The three separate authority records

The `AUTHORITY.md` of the corpus merged capability, lease, and residency into one object, and v4.1
section 3.9 corrects it: **three records, three owners**.

- **Capability.**

    The capability shows what the actor may do: `holder`, `resource`, `operations` (`["*"]` = any),
    `expiresAt`, `delegation` (`none` / `delegate`), and `revoked` + `revokedAt`.

    The IDs are `cap:<sequence>`.

- **Lease.**

    The lease shows for how long: `holder`, `resource`, `acquiredAt`, and `expiresAt`
    (`acquiredAt + ttl`; TTL = explicit request → policy per-kind override → config default).

    Expired leases close lazily on the next touch of the holder, and the plugin ledgers each expiry.

    The IDs are `lease:<sequence>`.

- **Residency.**

    The residency shows what stays in the store: `resource`, `kind`, `weight`, `since`, `promoted`,
    and `disposition`.

## The license/weight law (binding)

THE LICENSE IS THE AUTHORITY, AND THE WEIGHT IS THE REPRESENTATION.

Priority, retention, and permission are never interchangeable: the capability carries no weight, and
the weight of the residency ranks eviction candidates only.

No policy rule reads the weight to decide a disposition (Documentation/Plans/Workspace-
Family/PITFALLS-LOG.md).

## The disposition pass

`evict(resources?)` walks the candidates in weight-descending order and applies the first matching
rule of the policy table to each record (or `keep` when no rule matches):

| Disposition | Effect                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| `keep`      | the record stays                                                         |
| `defer`     | postponed until the residency age exceeds `maxResidencyMs`, then evicted |
| `evict`     | removed from residency, kept in the graveyard (recoverable)              |
| `discard`   | removed permanently (graveyard entry deleted too)                        |
| `promote`   | marked protected                                                         |

Three shields force `keep` regardless of the policy: an open non-expired lease on the resource, an
active (unrevoked, unexpired) capability that covers the resource, and a revoked capability within
the revocation grace (`revocationGraceMs`).

## Authorization semantics

`authorize` is the permission judgment alone, because authority is NOT knowledge (the five separate
judgments stay separate).

It reads the capability records only: revocation denies immediately, expiry denies, and an unlisted
operation denies.

The judgment never consults the weights and the residency.

## The policy block (D6)

The config carries the shared per-action allowlist (`automation: Policy()`, composed from the
factory's block) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The key is `automation`, NOT `policy`, because the `policy` of the config is the residency RULE
TABLE (`{kind, disposition, ttlMs?, maxResidencyMs?, revocationGraceMs?}`, the disposition pass
above), a different contract.

The `plugin-dsh-route` precedent keyed its D6 block `automation` for the same reason.

The actions of this package are read-only and record, all AUTOMATIC.

It has NO gated action (no file write, no batch commit, no spawn), so the block documents the
posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).

The package adds no ledger line, because it has no gated action.

## Records

The files `Source/Interface/{Capability,Lease,Residency,Policy}.ts` declare the shapes, and
`Source/Function/{Grant,Revoke,Authorize,Acquire,Release,Residence,Evict}.ts` are the paths.

`Source/Function/Service.ts` holds the `workspaceAuthority` Service, which the apply registers.
