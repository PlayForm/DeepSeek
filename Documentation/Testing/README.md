# Live test / edit / fix methodology - the plugin family (35 new packages)

The methodology every plugin test in this folder follows.

Each per-plugin file (`Documentation/Testing/<package>.md`) is an instance of this template,
grounded in that package's `README.md`, `SCHEME.md`, `Source/Variable/Config.ts`, `cordis.patch.yml`
and its profile row.

## The state

The 35 new packages are ENABLED in the desktop profile (`~/.dsh/profiles/desktop`): each package's
name is listed in the profile `package.json` under `dsh.profile.bundles`, its row exists in the
profile's `cordis.yml` (resolved from each bundle's `cordis.patch.yml` `insert:` block), and the app
was **restarted** so the bundle layers composed at host boot.

The live app runs them.

A file: dependency alone is NOT activation; the restart is.

## The activation check

Before any behavior test, prove the plugin activated:

1. **The Config schema.**

    `cordis_inspect_query` with platform `host`, provider `Config`, method `listConfigs`, input
    `{"name": "@playform/<pkg>"}` → exactly one entry whose status is `"schema"` (the Schemastery
    schema was validated at load and every default was filled).

2. **The tools.**

    For tool plugins, the Tool inspect provider lists the tool under the provider's tool surface
    (`cordis_inspect_list` first, then the tool provider's list method).

    A missing tool means the tool registration did not run or the plugin is disabled.

3. **The ledger line.**

    The package's `activated (...)` string (quoted byte-exact in each per-plugin file) in its
    logFile (the `logFile` Config default, usually `~/.dsh/<name>.log`) or in the logger.

    A cold mount instead logs the byte-exact `disabled (enabled=false)` line - if you see that, the
    row is present but the plugin is disabled.

4. **The services.**

    For service-provider bundles (`plugin-dsh-feedback`, `plugin-dsh-ingester`,
    `plugin-dsh-pass-on`, `plugin-dsh-queue`, `plugin-dsh-route`, `plugin-dsh-workspace-*`),
    `cordis_inspect_query` host/Service/listService `<service>` (e.g. `feedback`, `workspaceGraph`,
    `dshQueue`) must resolve.

## The live test tiers

| Tier | Meaning     | Examples                                                                  |
| ---- | ----------- | ------------------------------------------------------------------------- |
| T1   | Read-only   | inspect queries, read-only tools, `git status`-class commands             |
| T2   | Safe writes | a `/tmp` scratch file through `batch_edit`; a temp repo for git           |
| T3   | Guards      | the govern gate on a tool call, the suggesters' notes, the observe stamps |
| T4   | Flows       | the batch decision → pass-on → ingester chain                             |
| T5   | Client      | the UI tabs - the user checks these by eye                                |

## The fix loop

1. **The failure.**

    The failure → capture the **error text** verbatim.

2. **The likely cause.**

    The likely cause → read the failing package's Source.

3. **The fix file.**

    The fix file → the package's `Source/` (one definition per file; never the built `Target/`).

4. **The rebuild.**

    Rebuild - the flag is MANDATORY:
    `pnpm --config.verify-deps-before-run=false --dir Classic/packages/<pkg> run prepublishOnly`

5. **The smokes.**

    Smokes stay green: for each test folder,
    `node Classic/packages/<pkg>/Target/Test/<Folder>/Test.js` must print its README's exact
    `N PASS - <Name>` count.

6. **The types.**

    Types stay green: `pnpm test:types` (the honest repo-level type gate) must report `PASS` for the
    package; see `Documentation/Plans/Completion-Spec/06-VERIFICATION.md` check 3b.

7. **The restart.**

    The app **RESTART** - a code fix does not hot-reload; re-run the live test.

## The report format (per plugin)

- **The plugin** - package name, profile row id, logFile.
- **The tests run** - pass/fail per test, with the observed output quoted.
- **The defects** - `file:line - cause - fix`.
- **The rebuild/smoke result** - the build command's outcome and the smoke counts.
- **The residuals** - what is still broken or untested and why.

## The safety rules

- Never run a destructive git command to test the gitguard: use a scratch git repo under `/tmp`, or
  a harmless deny-listed command.
- `batch_edit` writes only on `/tmp` scratch files during testing.
- Never test against the user's live profile config: the Config checks are read-only inspect
  queries.
- A plugin that crashes the boot is disabled by the Lead, not the tester.

## The known live gaps (2026-10-23 status)

- **`plugin-dsh-batch-edit` inject defect - FIXED**: the first dogfood failed every call with
  `cannot get property "fs" without inject`; `"fs"` is now in the inject list and the batch engine
  runs.
- **The workspace graph indexing - FIXED**: the graph no longer relies on a missing trigger;
  `plugin-dsh-workspace` exposes the `workspace_index` tool (path?, maxFiles?) that drives the graph
  service's `indexWorkspace`, so `workspace_map`/`workspace_find` return real data after an index.
- **`batch_decision` works** - the empty pending list is the correct answer.
