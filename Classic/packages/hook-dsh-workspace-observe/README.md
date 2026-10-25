# @playform/hook-dsh-workspace-observe

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/OBSERVE](../../../Documentation/Plans/Workspace-Family/OBSERVE.md)

## The role

The workspace-observe hook for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release, Wave 1). The first step of the invisible flow: on every `fs/observed` event the hook
records one **observation stamp** in its own KV storage domain - and the conversation never sees the
stamps. A later wave's events surface them.

## The surfaces

- The `fs/observed` listener on the ROOT context (the factory's `Wire`) - the only registration.
- The family's trace bus emission `observe/stamp` (when `ctx.trace` exists).
- The own KV storage domain `workspace_observe` (tables `stamps` + `ring`).
- No tool, no provided service, no file read, no file write.

## What it records

One stamp per distinct version (and per manual call; the repeat guard below coalesces the rest):

```
{ path, version, origin: "fs/observed" | "manual", sequence }
```

- `path` - the event's `displayPath` (the model-facing form), verbatim.
- `version` - the observed version token, verbatim; `absent` for an absent observation (never a
  fabricated token).
- `origin` - how the stamp was recorded.
- `sequence` - the plugin's **own monotonic counter**, incremented once per stamp and persisted with
  the domain (recovered on mount as the maximum loaded sequence). It is **never a wall clock** - the
  family's no-real-timers rule.

## The disciplines

- The listener registers on the **ROOT context** (the factory's `Wire` - the exact
  `ctx.root.on("fs/observed", ...)` registration), so it hears every `fs/observed` emission.
- Each recorded stamp is emitted on the family's **trace bus** as `observe/stamp` (the indexer's
  first source, D5): the payload is `{ path, version, origin }`. The bus (`ctx.trace`, provided by
  `@playform/plugin-dsh-factory`) is optional - a context without it records stamps exactly as
  before and emits nothing.
- The listener is a **synchronous recorder**: no awaits, no throws, no I/O. It reads the event
  only - it **never reads file content** and **never writes a file**.
- Guard chain, in order: an event whose actor is the hook's **own actor object** is ignored
  (`ignored <path> (own actor)`); a path matching `exclude` is ignored
  (`ignored <path> (excluded)`); a non-matching path under a non-empty `include` is ignored
  (`ignored <path> (not included)`); a **repeat event** - the same path carrying the same version
  within the coalescing window - is dropped silently (no line, no stamp).
- The repeat-event guard (`Function/Duplicate`, the monitor's clock pattern - no timer): a repeat
  event for the same path within a short window (2 s on the module's clock, overridable in tests via
  the `State.Now` seam) announces a file state that is already recorded, because the version token
  identifies the state; a different version, or the same version after the window, is stamped
  normally - the last distinct version always wins. The manual path is never guarded.
- A malformed event is caught and ledgered (`failed <path> (<reason>)`) - the listener never throws.
- The latest stamp per path is the record (keyed by the path); a bounded ring of the last
  `maxStamps` stamps lives under the meta record `__ring` - the oldest drop is ledgered
  (`capped <path> (maxStamps <n>)`), never silently discarded.
- The domain is the hook's **own** (`workspace_observe`, version 1, per-record layout,
  `backup-and-skip`, tables `stamps` + `ring`) - not extension records in the shared governance
  domain. An absent storage facility is a silent skip (the stamps live in memory only); a present
  facility whose open fails is loud (one ledger line, never rethrown).

## The configuration

See [SCHEME.md](SCHEME.md). Every knob is a volatile cell (hot edits commit without remounting):
`enabled`, `domain`, `maxStamps`, `include`, `exclude` (plus the universal `log`/`logFile`).

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This hook's action class is RECORD (it records one observation stamp per `fs/observed` event), and
that class is **automatic**.

The hook has **NO gated action** - it never writes a file, commits a batch or spawns an agent - so
the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount; a resolved
pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

## The IDLE-forever posture

The plugin ships DISABLED: the bundle entry declares `enabled: false` only, the plugin never appears
in the profile's bundles, and it enables only by an explicit ACTIVATE (you edit the profile and
restart). A cold mount logs `disabled (enabled=false)` and wires nothing.

## The ledger

One log per module: `~/.dsh/playform/hook-dsh-workspace-observe.log` (config `logFile`). The strings
are the contract (byte-exact, `observe: ` prefix; the durable file lines are the `[ISO] message`
forms):

```
observe: disabled (enabled=false)
observe: activated (domain=<domain>)
observe: stamped <path> version <version> (fs/observed)
observe: ignored <path> (own actor)
observe: ignored <path> (excluded)
observe: ignored <path> (not included)
observe: capped <path> (maxStamps <n>)
observe: failed <path> (<reason>)
observe: manual <path> version <version>
observe: storage open failed: <reason>
```

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

The smoke folders: `Guards-And-Ring`, `Policy-Defaults`, `Storage-And-Service`, `Wiring-And-Stamps`.

## The plan

- [Workspace-Family/OBSERVE](../../../Documentation/Plans/Workspace-Family/OBSERVE.md) - the observe
  step (Wave 1).

## License

CC0-1.0.
