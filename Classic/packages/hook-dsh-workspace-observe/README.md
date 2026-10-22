# @playform/hook-dsh-workspace-observe

The workspace-observe hook for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release, Wave 1). The first step of the invisible flow: on every `fs/observed` event the hook
records one **observation stamp** in its own KV storage domain - and the conversation never sees the
stamps. A later wave's events surface them.

## What it records

One stamp per event (and per manual call):

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
- The listener is a **synchronous recorder**: no awaits, no throws, no I/O. It reads the event
  only - it **never reads file content** and **never writes a file**.
- Guard chain, in order: an event whose actor is the hook's **own actor object** is ignored
  (`ignored <path> (own actor)`); a path matching `exclude` is ignored
  (`ignored <path> (excluded)`); a non-matching path under a non-empty `include` is ignored
  (`ignored <path> (not included)`).
- A malformed event is caught and ledgered (`failed <path> (<reason>)`) - the listener never throws.
- The latest stamp per path is the record (keyed by the path); a bounded ring of the last
  `maxStamps` stamps lives under the meta record `__ring` - the oldest drop is ledgered
  (`capped <path> (maxStamps <n>)`), never silently discarded.
- The domain is the hook's **own** (`workspace_observe`, version 1, per-record layout,
  `backup-and-skip`, tables `stamps` + `ring`) - not extension records in the shared governance
  domain. An absent storage facility is a silent skip (the stamps live in memory only); a present
  facility whose open fails is loud (one ledger line, never rethrown).

## Config

See [SCHEME.md](SCHEME.md). Every knob is a volatile cell (hot edits commit without remounting):
`enabled`, `domain`, `maxStamps`, `include`, `exclude` (plus the universal `log`/`logFile`).

## The IDLE-forever posture

The plugin ships DISABLED: the bundle entry declares `enabled: false` only, the plugin never appears
in the profile's bundles, and it enables only by an explicit ACTIVATE (you edit the profile and
restart). A cold mount logs `disabled (enabled=false)` and wires nothing.

## The ledger

One log per module: `~/.dsh/observe.log` (config `logFile`). The strings are the contract
(byte-exact, `observe: ` prefix; the durable file lines are the `[ISO] message` forms):

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

## License

CC0-1.0.
