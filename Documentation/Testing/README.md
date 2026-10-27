# Live test / edit / fix methodology - the plugin family (35 new packages)

Every plugin test in this folder follows this methodology.

Each per-plugin file (`Documentation/Testing/<package>.md`) is an instance of this template and uses
the `README.md`, `SCHEME.md`, `Source/Variable/Config.ts`, `cordis.patch.yml`, and profile row of
that package as its base.

## The state

The 35 new packages are enabled in the desktop profile (`~/.dsh/profiles/desktop`).

Each package name appears in the profile `package.json` under `dsh.profile.bundles`, its row exists
in the profile `cordis.yml` (resolved from the `insert:` block of each bundle's `cordis.patch.yml`),
and the app was **restarted** so that the bundle layers composed at host boot.

The live app runs them.

A file: dependency alone is not activation; the restart is.

## The activation check

Before any behavior test, prove that the plugin activated:

1. **Config schema.**

    `cordis_inspect_query` with platform `host`, provider `Config`, method `listConfigs`, input
    `{"name": "@playform/<pkg>"}` → exactly one entry whose status is `"schema"` (the Schemastery
    schema was validated at load, and every default was filled).

2. **Tools.**

    For tool plugins, the Tool inspect provider lists the tool under its tool surface
    (`cordis_inspect_list` first, then the list method of the tool provider).

    A missing tool means that the tool registration did not run or the plugin is disabled.

3. **Ledger line.**

    The `activated (...)` string of the package (quoted byte-exact in each per-plugin file) appears
    in its logFile (the `logFile` Config default, usually `~/.dsh/<name>.log`) or in the logger.

    A cold mount instead logs the byte-exact `disabled (enabled=false)` line, and that line means
    the row is present but the plugin is disabled.

4. **Services.**

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

1. **Failure.**

    The failure → capture the **error text** verbatim.

2. **Likely cause.**

    The likely cause → read the Source of the failing package.

3. **Fix file.**

    The fix file → use the package `Source/` (one definition per file; never the built `Target/`).

4. **Rebuild.**

    Rebuild, and the flag is mandatory:
    `pnpm --config.verify-deps-before-run=false --dir Classic/packages/<pkg> run prepublishOnly`

5. **Smokes.**

    Keep the smokes green: for each test folder,
    `node Classic/packages/<pkg>/Target/Test/<Folder>/Test.js` must print the exact
    `N PASS - <Name>` count from its README.

6. **Types.**

    Keep the types green: `pnpm test:types` (the honest repo-level type gate) must report `PASS` for
    the package; see `Documentation/Plans/Completion-Spec/06-VERIFICATION.md` check 3b.

7. **Restart.**

    **Restart** the app, because a code fix does not hot-reload, and then re-run the live test.

## The report format (per plugin)

- **Plugin.** Package name, profile row id, logFile.
- **Tests run.** Pass/fail per test, with the observed output quoted.
- **Defects.** `file:line - cause - fix`.
- **Rebuild/smoke result.** The build command outcome and the smoke counts.
- **Residuals.** What is still broken or untested, and why.

## The safety rules

- Never run a destructive git command to test the gitguard: use a scratch git repo under `/tmp`, or
  a harmless deny-listed command.
- `batch_edit` writes only `/tmp` scratch files during testing.
- Never test against the live profile config of the user: the Config checks are read-only inspect
  queries.
- The Lead disables a plugin that crashes the boot; the tester does not.

## The known live gaps (2026-10-23 status)

- **`plugin-dsh-batch-edit` inject defect - FIXED.** The first dogfood failed every call with
  `cannot get property "fs" without inject`; `"fs"` is now in the inject list, and the batch engine
  runs.
- **Workspace graph indexing - FIXED.** The graph no longer relies on a missing trigger, because
  `plugin-dsh-workspace` exposes the `workspace_index` tool (path?, maxFiles?) that drives
  `indexWorkspace` of the graph service, so `workspace_map`/`workspace_find` return real data after
  an index.
- **`batch_decision` works.** The empty pending list is the correct answer.
