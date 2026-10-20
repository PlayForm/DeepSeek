# The Loader Contract and Identity

## The four members

Every family plugin's default export carries exactly:

| Member   | Contract                                                              |
| -------- | --------------------------------------------------------------------- |
| `name`   | The identity; the loader and runtime resolve the plugin by it         |
| `apply`  | The entrypoint; returns NOTHING                                       |
| `Config` | A Schemastery schema; validated and defaulted at load, failing loud    |
| `inject` | The services the plugin needs; the loader's PENDING state orders loads |

```typescript
export default {
	name: "hook-dsh-example",
	apply(Context) {
		// register, wire, return nothing
	},
	Config: Schema.object({ ... }),
	inject: ["dsh.factory", "fs"],
};
```

## Why `apply` returns nothing

A cordis plugin's `apply` that returns a value is interpreted as a
disposer or lifecycle signal, and event delivery to the plugin stops -
silently, with no error. Every `apply` in the family produces no return
value. A diff that adds a return to `apply` is rejected by default, even
when it looks like cleanup.

## Why Config is mandatory

The loader is the one moment the configuration is guaranteed to be
inspected. A schema enforced there means a bad config dies at boot with a
named error instead of producing undefined behavior later. Defaults live
in the schema, so the schema is both the validation and the default
source.

A plugin with no configurable behavior still ships a `Config` schema (it
may be an empty object) so the validation surface stays uniform.

## Why inject is precise

The loader's PENDING state holds a plugin whose services are not yet
available and loads it once they are. Declaring only what the plugin needs
makes the boot order deterministic. Greedy injection or undeclared
dependencies break the ordering the loader relies on.

## The four identity places

A plugin's identity lives in four places that must agree:

1. the package name;
2. the `name` export;
3. the State build's `module:` option;
4. the ledger logFile default.

Each has a different consumer: the registry and the profile bundle list,
cordis at boot, the State builder's event stamps, and the ledger writer.
If two drift, the system still boots; the failure is attribution - events
in another module's ledger, or a State stamp no plugin answers to.

A rename touches all four in the same change set, or carries an explicit
by-design note.

## The ledger strings are module-owned

The factory provides the ledger machinery (the append path). Each module
supplies its own strings. If the factory owned the wording, every module's
observable output would change whenever the factory's wording changed, and
the byte-identical rule could not be enforced per module.

## Failure modes

- **The silent killer**: a `return` added to `apply`.
- **Config trusted lazily**: bad configs boot and corrupt behavior later.
- **Missing inject**: the plugin reads an undefined service.
- **Partial rename**: the logFile default still points at the old
  identity; two identities interleave in one ledger.
- **Case drift**: `hook-dsh-x` vs `hook_dsh_x` vs `HookDshX`; searches
  miss half the records.
