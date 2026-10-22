# SCHEME - @playform/plugin-dsh-workspace-authority

The authority service of the workspace family: the capabilities, the leases, the residency - the
licenses.

## Position in the flow

```
observe stamps → semantics resolve → operate proposes → govern gates →
AUTHORITY LICENSES → approve binds → merge → journal → audit → live
```

## The three separate authority records

The corpus's own `AUTHORITY.md` merged capability, lease and residency into one object; v4.1 section
3.9 corrects it: **three records, three owners**.

- **Capability** - what the actor may do. `holder`, `resource`, `operations` (`["*"]` = any),
  `expiresAt`, `delegation` (`none` / `delegate`), `revoked` + `revokedAt`. IDs are
  `cap:<sequence>`.
- **Lease** - for how long. `holder`, `resource`, `acquiredAt`, `expiresAt` (`acquiredAt + ttl`; TTL
  = explicit request → policy per-kind override → config default). Expired leases close lazily on
  the holder's next touch, each expiry ledgered. IDs are `lease:<sequence>`.
- **Residency** - what stays in the store. `resource`, `kind`, `weight`, `since`, `promoted`,
  `disposition`.

## The license/weight law (binding)

THE LICENSE IS THE AUTHORITY, THE WEIGHT IS THE REPRESENTATION. Priority, retention and permission
are never interchangeable: the capability carries no weight; the residency's weight ranks eviction
candidates only; no policy rule reads the weight to decide a disposition
(Documentation/Plans/Workspace- Family/PITFALLS-LOG.md).

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

`authorize` is the permission judgment alone - authority is NOT knowledge (the five separate
judgments stay separate). It reads the capability records only: revocation denies immediately,
expiry denies, an unlisted operation denies; the weights and the residency are never consulted.

## Records

`Source/Interface/{Capability,Lease,Residency,Policy}.ts` declare the shapes;
`Source/Function/{Grant,Revoke,Authorize,Acquire,Release,Residence,Evict}.ts` are the paths;
`Source/Function/Service.ts` is the `workspaceAuthority` Service registered from apply.
