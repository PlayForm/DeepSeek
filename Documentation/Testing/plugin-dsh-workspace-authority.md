# plugin-dsh-workspace-authority - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-authority`
  (Classic/packages/plugin-dsh-workspace-authority).
- Profile row id: `plugin-dsh-workspace-authority` (bundled in the desktop profile).
- Exposes the `workspaceAuthority` service (`ctx.workspaceAuthority`, registered from apply):
  `grant`/`revoke`/`authorize`, `acquire`/`release`, `residence`, `evict`, `statistics`. It holds
  the licensing step of the invisible flow, the THREE separate authority records (v4.1 section 3.9):
  Capability (what the actor may do, ids `cap:<sequence>`), Lease (for how long, ids
  `lease:<sequence>`, lazy expiry sweep), and Residency (what stays in the store, with the
  representation-only `weight`).
- Ledger lines (byte-exact, README "Ledger lines"): `authority: disabled (enabled=false)` (cold
  mount) and `authority: activated (ttl=300000, policy=N)`; plus
  `authority: granted <id> (<holder> -> <resource>, <operations>)`, `authority: revoked <id>`,
  `authority: authorized <holder> <resource> (<operation>)`,
  `authority: denied <holder> <resource> (<operation>)`, `authority: refused grant (...)`,
  `authority: leased <id> (<holder> -> <resource>, expires <ms>)`, `authority: expired <id>`,
  `authority: released <id>`, `authority: residency <resource> (weight <w>)`,
  `authority: evicted <resource> (<disposition>)`. Logfile
  `~/.dsh/playform/plugin-dsh-workspace-authority.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-workspace-authority"}` for one entry with status schema.

    The defaults per the README config table: `enabled=false`, `defaultTtlMs=300000`,
    `maxLeasesPerHolder=8`, `maxCapabilitiesPerHolder=16`, `revocationGraceMs=0`, `policy=[]` (the
    residency rule table `{kind, disposition, ttlMs?, maxResidencyMs?, revocationGraceMs?}`), and
    the D6 allowlist keyed `automation.*` (NOT `policy`, because the `policy` of this package is the
    rule table, following the plugin-dsh-route precedent).

2. **The service check.**

    `cordis_inspect_query` host/Service/listService `workspaceAuthority` resolves.

3. **The ledger line.**

    The line `authority: activated (ttl=300000, policy=N)` appears in
    `~/.dsh/playform/plugin-dsh-workspace-authority.log`, and a cold mount logs
    `authority: disabled (enabled=false)`.

## Test cases

- T1 listConfigs query above - one entry, `status: "schema"` - the defaults match the README table,
  and the D6 block is keyed `automation`, not `policy`.
- T2 Acquire authority for a /tmp-scope operation - the lease issued - the log shows
  `authority: leased <id> (<holder> -> <resource>, expires <ms>)` with expires = acquiredAt + ttl
  (explicit request → policy per-kind override → config default), and the residence records the TTL.
- T2 Grant then authorize - the authorization succeeds - the log shows
  `authority: granted <id> (...)` then `authority: authorized <holder> <resource> (<operation>)`.
- T2 Authorize an operation whose grant expired - the authorization fails - the log shows
  `authority: denied <holder> <resource> (<operation>)`, expiry denies, and weights and residency
  are never consulted (authority is NOT knowledge).
- T2 Authorize an unlisted operation - denied - the `operations` list of the capability is the only
  permission source.
- T2 Release/revoke then re-authorize - the revoked grant no longer authorizes - the log shows
  `authority: released <id>` / `authority: revoked <id>` then `authority: denied ...`, and
  revocation denies immediately (shielded only within `revocationGraceMs`, default 0).
- T3 Residence then `evict` - the disposition pass - the log shows
  `authority: residency <resource> (weight <w>)` then
  `authority: evicted <resource> (<disposition>)` with the disposition from the first matching rule
  of the policy table (`keep` when no rule matches); candidates walk in weight-descending order,
  `evict` keeps the record in the graveyard, `discard` removes it permanently, and an open
  non-expired lease and an active capability force `keep`.

## Known live gaps

- Not dogfooded yet, so watch for grants surviving past TTL without the lazy expiry sweep ledgering
  `authority: expired <id>`, and for the policy table count N in the activation line disagreeing
  with the config.
- The `automation` D6 block documents the posture and refuses nothing (no gated action, no new
  ledger line), and a resolved pack's `policy` section override is the next refinement.

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Acquire.ts`, `Authorize.ts`, `Evict.ts`, `Grant.ts`,
  `Policy.ts`, `Revoke.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-authority run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-authority/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-authority`
- Tests run: T1 config - / T2 acquire - / T2 grant+authorize - / T2 expiry - / T2 unlisted - / T2
  revoke - / T3 evict -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
