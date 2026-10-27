# @playform/hook-dsh-edit-suggester

> v0.3.0 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

This package is the modification-intent **companion suggester** for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release).

It is a DeepSeek Harness plugin that hooks the **`tools/post-execute` waterfall** for the
modification tools (`write`, `edit`, `raw-write`).

When the edited path matches one of the convention families, the hook prepends ONE labeled
`additionalContexts` note that names the standard companions the model has not touched yet - **"this
file rarely stands alone."**

This package is the second consumer of the search-suggester's pattern algebra and of its
two-consumer extraction trigger
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) sections 1.4 and
8).

## The surfaces

- The `tools/post-execute` waterfall listener for the modification tools: one labeled
  `additionalContexts` note, never a content replacement.
- No tool, no service: the note is the only surface; the learning layer records through the optional
  `pattern` service (`ctx.get("pattern")`, probed per use) or a bounded in-memory fallback.

## Why

The search-suggester's evidence shows that the edit is where the discovery happens: the model edited
its way to the target sets that it never thought to open.

The repo's convention is that a file rarely stands alone - the version lives in 36 manifests, 6
`Apply.ts` files, the CHANGELOG and the prose; a `Config.ts` edit must also land in the README's
Config section, SCHEME.md, the `cordis.patch.yml` row, and the byte-exact test.

The search consumer deliberately refuses to own the edit transform; this consumer owns the NOTIFY
side of it: it names the companions, never the change.

## The families

Seven, priority order: `Version` (0.85 - a wrong version companion set is costly), `Config`,
`Symbol`, `Test`, `Doc`, `Prose`, `Workflow`.

Each family is a pack row: its path rules (regexes on the edited path with weights) and its standard
companion set - each companion a path or glob with a prior and **one reason phrase** ("the Config
section", "the byte-exact assertion", "the long tail").

A companion without a reason is not emitted.

The families are **pack-driven**: the built-in pack (this monorepo's default) lives in
[`@playform/lib-dsh-pack`](../lib-dsh-pack) and it is projected here as the `edit/` domain.

A repository that ships `.dsh/pack.yml` (or a user-layer pack at
`~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `edit/` families; a repository without a pack
stays silent.

## The gate

The gate uses the same algebra as the search consumer: `k = sigmoid(sum(weights) - 0.6)`, the
candidate scoring over the **pickable heuristics** (see below), and the noise control - a cooldown,
a dedupe, a per-turn cap, and the already-touched filter (companions the model edited earlier this
turn are dropped; when nothing remains, the verdict is an `already-touched` abstention).

Every abstention and suppression is a ledger line.

## The learning layer (D8)

Every emitted note - and every gated silence worth learning from (`low-confidence`,
`already-touched`) - records a **decision**: the family, the companion rows with their six pickable
heuristic values (`scope`, `graph`, `prior`, `literal`, `history`, `accept`), the effective weight
table, the enabled list, and a `pending` outcome placeholder.

The record is logged (`decided ...`) and stored through the optional **pattern service**
(`ctx.get("pattern")`, probed per use, never an inject); without one it lives in a bounded in-memory
fallback (`storeLimit`, default 512), which is per instance and documented as such.

The note opens a **follow-through window** counted in judged calls (never a timer): a later call
that names one of the note's companions is an **accept** for that companion and its family
(`accepted <Family> <path>`); a window that reaches `learnWindow` judged calls untouched closes as a
**soft reject** (`rejected <Family> <n> companions`).

Both fill the decision record's outcome and move the learned accept rates.

The score is `sum over the enabled heuristics of weight * value`:

| Heuristic | Value                                                   | Default weight |
| --------- | ------------------------------------------------------- | -------------- |
| `scope`   | 1.00 - the call matched the family's path rules         | 0.35           |
| `graph`   | 0.50 - the neutral graph-distance placeholder           | 0.00           |
| `prior`   | the pack's prior for the companion                      | 0.25           |
| `literal` | 0.50 - the neutral literal (no generated index)         | 0.25           |
| `history` | the **learned per-companion accept rate** (neutral 1/3) | 0.15           |
| `accept`  | the **learned per-family accept rate** (neutral 1/3)    | 0.00           |

The default row is exactly the PoC formula, and a missing store answers the neutral 1/3, so the
default behavior is unchanged byte-for-byte.

A user can disable any heuristic (`heuristics`) or re-weight any of them (`weights`), and the
decision record plus the `decided` line show the choice.

## The delivery

The hook delivers one note, never a content replacement and never a claim of the Transform: the
post-execute listener runs after the ccr and the normalize family, and it only adds
`additionalContexts`.

The note carries the plugin's own source label
(`{kind: "edit-suggester", form: "notice", summary}`).

The `grep`/`read`/`bash` calls are not judged - this is the edit side of the family, disjoint from
the search suggester's trigger set.

## The waterfall discipline

The hook always awaits `next()` first; a pass-through returns the downstream decision unchanged; the
whole transform is fail-open (an internal error logs a warning and the decision passes through - a
note never fails a tool call).

## The ledger

The lines are prefixed `hook-dsh-edit-suggester: ` and go to `logFile`, mirroring the doc suggester:

```text
activated (...)
suggest <family> <k> <n> companions <path>
decided <family>
accepted <family> <path>
rejected <family> <n> companions
suppressed <reason> <family>
abstained <reason> <family> <k>
abstained foreign-workspace
hook-dsh-edit-suggester: <error>
```

## The configuration

See [SCHEME.md](./SCHEME.md) for the full schema.

Every knob is volatile (hot-editable, no remount).

The learning layer adds `learn`, `learnWindow`, `heuristics`, `weights`, and `storeLimit`.

Ships **disabled** - enable by explicit ACTIVATE in the profile.

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

The smoke folders: `Learning-Loop`, `Pack-Driven`, `Post-Execute-And-Ring`, `Wiring-And-Ledger`,
`Workspace-Gate`.

## The plan

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - the pattern
  algebra (sections 1.4 and 8, the second consumer).

## License

CC0-1.0.
