# SCHEME - @playform/plugin-dsh-workspace-authority

This is the authority service of the workspace family: the capabilities, the leases, and the
residency, which are the licenses.

## Position in the flow

```
observe stamps → semantics resolve → operate proposes → govern gates →
AUTHORITY LICENSES → approve binds → merge → journal → audit → live
```

## The three separate authority records

The corpus's own `AUTHORITY.md` merged capability, lease, and residency into one object, and v4.1
section 3.9 corrects it: **three records, three owners**.

- **Capability** - what the actor may do. `holder`, `resource`, `operations` (`["*"]` = any),
  `expiresAt`, `delegation` (`none` / `delegate`), `revoked` + `revokedAt`. IDs are
  `cap:<sequence>`.
- **Lease** - for how long. `holder`, `resource`, `acquiredAt`, `expiresAt` (`acquiredAt + ttl`; TTL
  = explicit request → policy per-kind override → config default). Expired leases close lazily on
  the holder's next touch, and each expiry is ledgered. IDs are `lease:<sequence>`.
- **Residency** - what stays in the store. `resource`, `kind`, `weight`, `since`, `promoted`,
  `disposition`.

## The license/weight law (binding)

THE LICENSE IS THE AUTHORITY, THE WEIGHT IS THE REPRESENTATION.

Priority, retention, and permission are never interchangeable: the capability carries no weight, the
residency's weight ranks eviction candidates only, and no policy rule reads the weight to decide a
disposition (Documentation/Plans/Workspace- Family/PITFALLS-LOG.md).

## The disposition pass

`evict(resources?)` walks the candidates in weight-descending order and, per record, applies the
policy table's first matching rule (or `keep` when no rule matches):

| Disposition | Effect                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| `keep`      | the record stays                                                         |
| `defer`     | postponed until the residency age exceeds `maxResidencyMs`, then evicted |
| `evict`     | removed from residency, kept in the graveyard (recoverable)              |
| `discard`   | removed permanently (graveyard entry deleted too)                        |
| `promote`   | marked protected                                                         |

Shields that force `keep` regardless of the policy: an open non-expired lease on the resource, an
active (unrevoked, unexpired) capability covering it, and a revoked capability within the revocation
grace (`revocationGraceMs`).

## Authorization semantics

`authorize` is the permission judgment alone, because authority is NOT knowledge and the five
separate judgments stay separate.

It reads the capability records only: revocation denies immediately, expiry denies, and an unlisted
operation denies, while the weights and the residency are never consulted.

## The policy block (D6)

The config carries the shared per-action allowlist (`automation: Policy()`, composed from the
factory's block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The key is `automation`, NOT `policy`, because the config's `policy` is the residency RULE TABLE
(`{kind, disposition, ttlMs?, maxResidencyMs?, revocationGraceMs?}`, the disposition pass above), a
different contract; this follows the `plugin-dsh-route` precedent, which keyed its D6 block
`automation` for the same reason.

This package's actions are read-only and record, all AUTOMATIC, and it has NO gated action (no file
write, no batch commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

No new ledger line exists, because the package has no gated action.

## Records

`Source/Interface/{Capability,Lease,Residency,Policy}.ts` declare the shapes;
`Source/Function/{Grant,Revoke,Authorize,Acquire,Release,Residence,Evict}.ts` are the paths;
`Source/Function/Service.ts` is the `workspaceAuthority` Service registered from apply.
