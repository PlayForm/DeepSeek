# @playform/lib-dsh-style

The STYLE is the one runtime stylesheet injector of the DSH UI family: a plugin binds its own
identifier to its compiled sheet and calls `Inject`, and the sheet lands in the document head once.

```ts
import { Inject } from "@playform/lib-dsh-style";

Inject("@playform/client-dsh-panel-family", Sheet);
```

## The contract

- **One `<style>` per identifier.** The key is `${Identifier}/client.css`, written to
  `data-plugin-css`; a second call with the same identifier returns without touching the head.
- **Two attributes.** `data-plugin` carries the identifier and `data-plugin-css` the file key, so a
  served sheet stays attributable to the plugin file that mounted it.
- **Appended once, never removed.** There is no removal path: the family's sheets are idempotent,
  and a plugin that unloads leaves its mount in place rather than risk a duplicate on re-mount.
- **SSR-safe.** `typeof document === "undefined"` returns before any DOM access, so a host that
  evaluates the module outside a browser never throws.
- **A library, not a plugin.** No `cordis.patch.yml`, no loader contract, no `Config`, and no
  dependency on any family package.

Contract: [SCHEME.md](./SCHEME.md). License: CC0-1.0.
