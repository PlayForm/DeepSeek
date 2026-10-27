# Introspection / Live-Assertions

The folder covers the projected registration surface of the harness: the composed entries, the schema document, and the plugin-manager resolution.

## Intent

The harness must project the registration surface of the family headlessly: every family plugin composed under its exact id and package name, the fs-observation-policy entry projected (the intent gate of the governed write path), and the configuration schema document titling the profile and describing the entry dialect (including the wholesale-replacement rule).

The plugin-manager surface must resolve the installed bundles by name.

The `cordis_inspect_list`/`cordis_inspect_query` providers are session surfaces that need a live agent session, so the headless proxies asserted here are the composed-tree and CLI equivalents, and the folder documents the session-only projection as a residual.

## Scenario

- **Group: the registered names.**

    - **Leaf 1-11.**

        The check runs once per family plugin: the composed entry `<id>` carries the exact registered name `<name>` (factory, package-governor, package-pinner, cargo-governor, and the six flavors + normalize-file).

- **Group: the observation policy.**

    - **Leaf 12.**

        The fs-observation-policy entry is projected.

- **Group: the config schema document.**

    - **Leaf 13.**

        The schema document titles the dsh-test profile.

    - **Leaf 14.**

        The schema document defines the entry dialect.

    - **Leaf 15.**

        The schema document states the wholesale-replacement rule.

- **Group: the plugin-manager surface.**

    - **Leaf 16.**

        The plugin surface resolves the core bundle (`<core>@0.1.0`).

    - **Leaf 17.**

        The plugin surface resolves the factory bundle (`<factory>@0.1.0`).

## Fixtures

- **The composed entry document.**

    The fixture is `dsh --profile dsh-test --dump-config` (via `DumpConfig("plain")`).

- **The schema document.**

    The fixture is `dsh --profile dsh-test --dump-config-schema` (via `DumpSchema()`), and the exit code of the CLI may be non-zero on unrelated web-app validation warnings while the document is what matters (a live finding that the battery records).

- **The plugin-manager surface.**

    The fixture is `dsh plugin --profile dsh-test why <pkg>` (via `PluginWhy`).

## Expected ledger strings (byte-exact)

This folder asserts command output and not ledger lines.

The asserted strings are the composed entries (`- id: <id>` with `name: '<package>'` within 200 characters), the title/comment of the schema document, and the `<package>@0.1.0` of the `why` output.

## Edge cases

- **The exit code.**

    The folder deliberately does not assert the exit code of the DumpSchema CLI (the unrelated web-app validation warnings), because the document on stdout is the contract.

- **The session-only projection.**

    The projection of `cordis_inspect_*` is a residual and not a check.

## Env gate

`DSH_TEST_SCRATCH` must be set, and an unset variable means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite from which this folder was split.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

17 PASS.
