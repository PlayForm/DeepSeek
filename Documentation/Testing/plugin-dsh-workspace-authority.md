# plugin-dsh-workspace-authority - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-authority`
  (Classic/packages/plugin-dsh-workspace-authority).
- Profile row id: `plugin-dsh-workspace-authority` (bundled in the desktop profile).
- Exposes: the `workspaceAuthority` service
  (`export default class WorkspaceAuthority extends Service` with
  `super(Context, "workspaceAuthority")`). The licensing step of the invisible flow: grants,
  acquisitions, authorizations, revocations, evictions over the operation residence (Function/:
  Acquire, Apply, Authorize, Evict, Grant, Policy, Release, Residence, Revoke).
- Ledger lines: `` `authority: disabled (enabled=false)` `` (cold mount) and
  `` `authority: activated (ttl=300000, policy=N)` ``; logFile `~/.dsh/authority.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-workspace-authority"}` → one entry, status schema (defaults per
   Variable/Config.ts: the TTL 300000 and the policy table).
2. Service check: `cordis_inspect_query` host/Service/listService `workspaceAuthority` → resolves.
3. Ledger line: `authority: activated (ttl=300000, policy=N)` in `~/.dsh/authority.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T2 | Acquire authority for a /tmp-scope operation | the
grant issued | the residence records the TTL | | T2 | Authorize an operation whose grant expired
(ttl 300000) | the authorization fails | expiry enforced; ledgered | | T2 | Release/revoke then
re-authorize | the revoked grant no longer authorizes | revocation effective immediately |

## Known live gaps

- Not dogfooded yet. Watch for: grants surviving past TTL without eviction, and the policy table
  count N in the activation line disagreeing with the config.

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Acquire.ts`, `Authorize.ts`, `Evict.ts`, `Grant.ts`,
  `Policy.ts`, `Revoke.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-authority run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-authority/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-authority`
- Tests run: T1 config - / T2 acquire - / T2 expiry - / T2 revoke -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
