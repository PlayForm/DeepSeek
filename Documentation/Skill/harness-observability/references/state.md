# The `${DSH_HOME}` State

## Sessions

Path: `${DSH_HOME}/sessions/<workspace>/<agent-id>/session.v4.jsonl.zstd`.

Each subagent's transcript is zstd-compressed JSONL.

Per assistant message, `data.usage` carries:

- `inputTokens`
- `outputTokens`
- `cacheReadTokens`

The tally is the sum of those fields; `totalTokens` is the per-call context total.

To read one:

```sh
zstd -dc path/to/session.v4.jsonl.zstd | head
```

The main session's own usage is not in its own transcript; it is displayed app-side.

The subagents' usage is computable from their files.

## Skills

Two homes, two jobs:

| Home                   | Role                                        |
| ---------------------- | ------------------------------------------- |
| `Documentation/Skill/` | This repository's anonymised specialization |
| `${DSH_HOME}/skills/`  | The private, project-agnostic fallback      |

The project copy wins inside this repository, and the profile copy is the fallback for a project that has no skill tree of its own.

## Profiles

Path: `${DSH_HOME}/profiles/<name>/`.

- `package.json`: the bundles as dependencies and the `dsh.profile.bundles` list.
- `cordis.patch.yml`: the plugin entries and their configs.
- settings: the config surface.

Never edit the agent-loop config while subagents run.

A live re-apply can destroy inbox projections and crash the host.

Config changes need a restart with no active subagents.

## The governance ledgers

Path: `${DSH_HOME}/<identity>.log`.

Each plugin writes its own activation line at boot and its chain-pass, refusal, and update lines
thereafter.

The activation line answers "did it activate"; the later lines answer "what did it do".

The ledgers are also the observable proof that the agent's own tool-layer writes fired the
governance chain: `write`, `edit`, and `raw-write` are the plugin usage.

## The rule

A state claim cites the path or the tool that produced it.

A remembered count from a previous session is not state; it is a memory.
