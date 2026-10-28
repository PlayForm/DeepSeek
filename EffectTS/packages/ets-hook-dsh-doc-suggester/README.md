# @playform/hook-dsh-doc-suggester

> v0.2.1 - UNPUBLISHED - plan:
> [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md)

## The role

The doc-task **companion suggester** for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release).

A DeepSeek Harness plugin that hooks the **`tools/post-execute` waterfall**.

When a call touches a documentation task (a plan, guide, skill, plugin-doc, index, site, or
package-prose path in `read`, `grep`, `glob`, or an edit), it prepends ONE labeled
`additionalContexts` note that names the doc-graph companions the task conventionally requires: the
INDEX row, the frontmatter statuses/registry/index block, the archive style, the cross-references,
and the site mirror.

It is the third consumer of the pattern algebra of the search-suggester
([SEARCH-SUGGESTER-PLUGIN.md](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) section 8).

## Why

The documentation tree has a graph that the model must keep coherent but usually discovers late.

A plan edit must keep the INDEX row and the frontmatter statuses/registry/index block, a skill must
keep its references and the session-orientation routing table, and a content change must keep the
site mirror.

Like the edit suggester, this consumer owns the NOTIFY side of the pattern: it names the companions,
never the change.

## The families

Seven, in priority order: `Plan`, `Guide`, `Skill`, `PluginDoc`, `Index`, `Site`, `PackageProse`.

Each family is a pack row: its path rules (regexes on the doc path that the call names, with
weights) and its companion set, where each companion is a path or glob with a prior and **one reason
phrase** ("the index row", "the frontmatter and style rules", "the site mirror").

A companion without a reason is not emitted.

The families are **pack-driven**: the built-in pack (the default of this monorepo) lives in
[`@playform/ets-lib-dsh-pack`](../ets-lib-dsh-pack) and is projected here as the `doc/` domain.

A repository that ships `.dsh/pack.yml` (or a user-layer pack at
`~/.dsh/playform/workspaces/<slug>.yml`) gets its OWN `doc/` families, and a repository without a
pack stays silent.

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
| `prior`   | the pack's prior for the companion                      | 0.25           |
| `literal` | 0.50 - the neutral literal (no generated index)         | 0.25           |
| `history` | the **learned per-companion accept rate** (neutral 1/3) | 0.15           |
| `accept`  | the **learned per-family accept rate** (neutral 1/3)    | 0.00           |

The default row is exactly the PoC formula, and a missing store answers the neutral 1/3, so the
default behavior is unchanged byte-for-byte.

A user can disable any heuristic (`heuristics`) or re-weight any of them (`weights`), and the
decision record plus the `decided` line show the choice.

Before the score, two workspace guards run.

The workspace locator (`Locate` of [`@playform/ets-lib-dsh-pack`](../ets-lib-dsh-pack), whose
signature comes from the resolved pack; the built-in default is `Documentation/ARCHIVE-STYLE.md`)
abstains `foreign-workspace` when the call belongs to another repository.

The existence filter drops every companion that does not exist under that root, and it abstains
`no-companions` when the winning family has none left.

A note therefore never names a path from the graph of this repository in a workspace that does not
carry it.

## The delivery

One note, never a content replacement: the post-execute listener runs after the ccr and the
normalize family and only adds `additionalContexts`.

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

## The plan

- [SEARCH-SUGGESTER-PLUGIN](../../Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md) - the pattern
  algebra (section 8, the third consumer).

## License

CC0-1.0.
