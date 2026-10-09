# @playform/ets-base-dsh

The BASE of the `ets-*` group: the shared Effect-TS plumbing that every
`@playform/ets-*` package depends on.

- The runtime wiring: the Context services, the layer graph and the
  `materialize()` runtime assembled for the factory shell.
- The fiber/stream machinery: the Gate transformer and the pure reducers, the
  Update envelope.
- The shared contract types: the factory's `Interface/*` structural contracts.

Usable outside the harness entirely (the PlayForm ecosystem). The only
external dependency is `effect` (pinned at exactly `4.0.2`).

```sh
pnpm add @playform/ets-base-dsh
```

The `ets-*` packages (`@playform/ets-hook-dsh-*`,
`@playform/ets-plugin-dsh-factory`) build on this base; the classical
`@playform/hook-dsh-*` group is the independent Effect-free sibling group.
