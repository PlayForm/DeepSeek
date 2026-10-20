# Introspection / Live-Assertions

The harness's projected registration surface: composed entries, the schema
document, the plugin-manager resolution.

## Intent

The harness must project the family's registration surface headlessly: every
family plugin composed under its exact id and package name, the
fs-observation-policy entry projected (the governed write path's intent
gate), the configuration schema document titling the profile and describing
the entry dialect (including the wholesale-replacement rule), and the
plugin-manager surface resolving the installed bundles by name. The
`cordis_inspect_list`/`cordis_inspect_query` providers are session surfaces
(a live agent session is required) - the headless proxies asserted here are
the composed-tree and CLI equivalents; the session-only projection is
documented as a residual.

## Scenario

- Group: the registered names
  - Leaf 1-11: one per family plugin - the composed entry `<id>` carries the
    exact registered name `<name>` (factory, package-governor, package-pinner,
    cargo-governor, and the six flavors + normalize-file).
- Group: the observation policy
  - Leaf 12: the fs-observation-policy entry is projected.
- Group: the config schema document
  - Leaf 13: the schema document titles the dsh-test profile.
  - Leaf 14: the schema document defines the entry dialect.
  - Leaf 15: the schema document states the wholesale-replacement rule.
- Group: the plugin-manager surface
  - Leaf 16: the plugin surface resolves the core bundle (`<core>@0.0.1`).
  - Leaf 17: the plugin surface resolves the factory bundle
    (`<factory>@0.0.1`).

## Fixtures

- `dsh --profile dsh-test --dump-config` (via `DumpConfig("plain")`): the
  composed entry document.
- `dsh --profile dsh-test --dump-config-schema` (via `DumpSchema()`): the
  schema document (the CLI's exit code may be non-zero on unrelated web-app
  validation warnings; the document is what matters - a live finding the
  battery records).
- `dsh plugin --profile dsh-test why <pkg>` (via `PluginWhy`): the
  plugin-manager surface.

## Expected ledger strings (byte-exact)

This folder asserts command output, not ledger lines. The asserted strings
are the composed entries (`- id: <id>` with `name: '<package>'` within 200
characters), the schema document's title/comment, and the `why` output's
`<package>@0.0.1`.

## Edge cases

- The DumpSchema CLI exit code is deliberately not asserted (the unrelated
  web-app validation warnings) - the document on stdout is the contract.
- The session-only projection (`cordis_inspect_*`) is a residual, not a
  check.

## Env gate

`DSH_TEST_SCRATCH` must be set. Unset means `SKIPPED (no scratch home)` with
exit 0 - identical to the `.mjs` suite this folder was split from. The folder
is never forced green in `Maintain/Run-Smokes.mjs`; it runs under
`Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

17 PASS.
