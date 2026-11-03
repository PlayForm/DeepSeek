# @playform/hook-dsh-doc-suggester

> v0.2.1 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The doc-task **companion suggester** for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release).

A DeepSeek Harness plugin that hooks the **`tools/post-execute` waterfall**.

When a call touches a doc path (a plan, guide, skill, plugin-doc, index, site, or package-prose path
in `read`, `grep`, `glob`, or an edit), it prepends ONE labeled `additionalContexts` note that names
the files the session touched right after this one in this workspace: the companions the task most
likely needs next (the INDEX row, the frontmatter block, the archive style, the site mirror).

The candidates come from the agent's **own previous tool calls**, never from a literal built-in
pack. A pack is an explicit user/repo override only (see below).

It is the third consumer of the pattern algebra of the search-suggester
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) section 8).

## Why

The documentation tree has a graph that the model must keep coherent but usually discovers late.

A plan edit must keep the INDEX row and the frontmatter statuses/registry/index block, a skill must
keep its references and the session-orientation routing table, and a content change must keep the
site mirror.

Like the edit suggester, this consumer owns the NOTIFY side of the pattern: it names the companions,
never the change.

## The candidates (the session history)

The `tools/post-execute` listener folds every call the hook sees into the session's history before
the judged-tool guard: one touch per call that names a path (the sequence number, the normalized
path and the tool), reads included, capped at 512, oldest first.

The harness's `session/event` bus does not deliver tool calls to this hook, so the hook feeds its
own history from the stream it already receives.

On a judged call, `Adjacent(touches, callPath, { limit: maxCompanions })` scores the paths that
followed the anchor within a window of 8 calls: `1 / (1 + distance)` per occurrence, one count per
occurrence.

A repeatedly co-touched path outranks a single one, and a near neighbour outranks a far one.

Those rows become ONE synthetic `History` family (priority 0, threshold 0.75, one signal of weight
2.5, companions with prior 0.6 and the reason `touched <count> time(s) after this file`), so the
existing deterministic classifier, existence filter, scorer and decision record judge it exactly
like a pack row.

Its confidence is `k = sigmoid(2.5 - 0.6) = 0.87`.

## The pack override

The families are **pack-driven only when a pack is explicit**: `<repo>/.dsh/pack.yml` (or
`.yaml`/`.json`) or the user-layer pack at `~/.dsh/playform/workspaces/<slug>.yml`.

The listener resolves it with `Resolve(root, { home, builtin: false })`, so the literal built-in
pack is never a candidate source.

A repository that ships no pack and has no session history abstains with the byte-exact line
`abstained no-history  0.00`.

A repository that ships a pack gets its OWN `doc/` families, placed after the synthetic `History`
family, and they drive the same classifier and note.

## The gate

The same algebra as the search and edit consumers: `k = sigmoid(sum(weights) - 0.6)`, the candidate
scoring over the **pickable heuristics** (see below), and the noise control (a cooldown, a dedupe, a
per-turn cap, and the already-touched filter).

Doc paths touched earlier this turn are dropped, and when nothing remains the verdict is an
`already-touched` abstention.

Every abstention and suppression is a ledger line.

## The learning layer (D8)

Every emitted note, and every gated silence worth learning from (`low-confidence`,
`already-touched`), records a **decision**: the family, the companion rows with their six pickable
heuristic values (`scope`, `graph`, `prior`, `literal`, `history`, `accept`), the effective weight
table, the enabled list, and a `pending` outcome placeholder.

The record is logged (`decided ...`) and stored through the optional **pattern service**
(`ctx.get("pattern")`, probed per use, never an inject).

Without that service it lives in a bounded in-memory fallback (`storeLimit`, default 512), which is
per instance and documented as such.

The note opens a **follow-through window** counted in judged calls (never a timer).

A later call that names one of the companions of the note is an **accept** for that companion and
its family (`accepted <Family> <path>`), and a window that reaches `learnWindow` judged calls
untouched closes as a **soft reject** (`rejected <Family> <n> companions`).

Both fill the outcome of the decision record and move the learned accept rates.

The score is `sum over the enabled heuristics of weight * value`:

| Heuristic | Value                                                   | Default weight |
| --------- | ------------------------------------------------------- | -------------- |
| `scope`   | 1.00 - the call matched the family's path rules         | 0.35           |
| `graph`   | 0.50 - the neutral graph-distance placeholder           | 0.00           |
| `prior`   | the family's prior for the companion                    | 0.25           |
| `literal` | 0.50 - the neutral literal (no generated index)         | 0.25           |
| `history` | the **learned per-companion accept rate** (neutral 1/3) | 0.15           |
| `accept`  | the **learned per-family accept rate** (neutral 1/3)    | 0.00           |

The default row is exactly the PoC formula, and a missing store answers the neutral 1/3, so the
default behavior is unchanged byte-for-byte.

A user can disable any heuristic (`heuristics`) or re-weight any of them (`weights`), and the
decision record plus the `decided` line show the choice.

Before the score, two workspace guards run.

The workspace root (`Root` of [`@playform/lib-dsh-pack`](../lib-dsh-pack)) is PACK-INDEPENDENT: the
nearest ancestor of the call path carrying `.git` or `package.json`, from the call path plus the
session cwd. A call with no such root abstains `foreign-workspace`.

The existence filter drops every companion that does not exist under that root, and it abstains
`no-companions` when the winning family has none left.

A note therefore never names a path from the history of this repository in a workspace that does not
carry it.

## The delivery

One note, never a content replacement: the post-execute listener runs after the ccr and the
normalize family and only adds `additionalContexts`.

The mount registers three listeners: the factory's `loader/volatile-update`, `tools/post-execute`,
and `agent/pre-step`.

The note carries the plugin's own source label (`{kind: "doc-suggester", form: "notice", summary}`).

The judged tool set is config (`tools`): the read and search calls that touch documentation plus the
edits that land on it.

## The waterfall discipline

`next()` is always awaited first, and pass-through returns the downstream decision unchanged.

The whole transform is fail-open: an internal error logs a warning and the decision passes through,
so a note never fails a tool call.

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
  algebra (section 8, the third consumer).

## License

CC0-1.0.
