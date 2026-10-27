---
title: Inference cost attribution - the per-file pricing model
category: Researches
kind: research-output
date: 2026-10-27
status: active
registry: Documentation/Researches/INFERENCE-COST-ATTRIBUTION.md
index: Documentation/INDEX.md
statuses:
    - name: the cost object and the grain ladder
      state: resolved
      evidence: section 1
    - name: token accounting across the six providers
      state: resolved
      evidence: section 2
    - name: the price table and its immutability rule
      state: resolved
      evidence: section 3
    - name: the three attribution models
      state: resolved
      evidence: section 4
    - name: ledger schema candidates
      state: open
      evidence: section 5 - synthesis only, no sourced schema exists
    - name: aggregation and export shapes
      state: resolved
      evidence: section 6
    - name: annotation without corrupting the file
      state: open
      evidence: section 7 - container syntaxes are sourced, the key names are not
    - name: the architect decision list
      state: open
      evidence: section 8
---

# Inference cost attribution - the per-file pricing model

> Question: how does a telemetry-only plugin compute the inference cost of every file that an agent
> conversation touches, store it in a database, and later export or annotate it, without ever
> changing the conversation?
>
> The research fixes the priced-event contract, the per-provider token shapes, the price table,
> three attribution models, a ledger schema, export shapes, and annotation rules.
>
> Every factual claim cites its source URL inline, and where the sources disagree or are silent, the
> disagreement or the gap is stated in place.

---

## 1. The cost object - what a priced event is, and the difference between a token, a call, a step, a turn, and a file touch

A priced event is one model invocation that carries a usage record and resolves to a dollar amount.

The OpenTelemetry GenAI shape is the span `gen_ai.client.inference`, named "{gen_ai.operation.name}
{gen_ai.request.model}", span kind CLIENT, with well-known operation names including `chat`,
`embeddings`, `execute_tool`, `retrieval`, `invoke_agent`, `text_completion`, and provider names
including `anthropic`, `deepseek`, `openai`
(https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/client-inference.md).

OTel supplies the usage record but no cost signal, because the GenAI conventions define no USD-cost
attribute or metric and call token counters only "a proxy for cost approximation"
(https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/gen-ai-token-metrics.md).

The five grains, smallest to largest:

- **Token** - the billable unit. DeepSeek states "We bill model usage based on the total number of
  input and output tokens" and "expense = number of tokens x price"
  (https://api-docs.deepseek.com/quick_start/pricing). Cloudflare additionally prices every LLM row
  in Neurons, a GPU-compute currency, side by side with tokens
  (https://developers.cloudflare.com/workers-ai/platform/pricing/).
- **Call** - one request to one model. Per-call fees exist outside the token bill: OpenAI web search
  is $10 per 1k calls and file search $2.50 per 1k tool calls plus storage
  (https://platform.openai.com/docs/pricing); Anthropic's tool definitions add a per-model tool
  system prompt of 286-406 tokens (https://docs.anthropic.com/en/docs/about-claude/pricing).
- **Step** - one iteration of the agent loop, including its tool calls. OTel names tool spans
  `execute_tool {gen_ai.tool.name}` (client-inference URL above). Claude Code's only per-file signal
  is stated at request grain: "25% Trim ~/code/api/CLAUDE.md - 49k tokens per request"
  (https://docs.anthropic.com/en/docs/claude-code/costs).
- **Turn** - the user-prompt boundary. GitHub Copilot meters exactly here: one premium request per
  user prompt times a per-model multiplier, and actions Copilot takes autonomously, such as tool
  calls, never count
  (https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests).
- **Session** - Claude Code's /usage Session block reports Total cost, Total duration (API), Total
  duration (wall), Total code changes, and per-model input/output/cache read/cache write counts,
  computed locally and reset by /clear (claude-code costs URL above). Anthropic Managed Agents add
  session runtime at $0.08 per session-hour, metered only while status is `running`
  (https://docs.anthropic.com/en/docs/about-claude/pricing).

A **file touch** is not a priced event at any grain, because it is the event that a file's content
entered, changed, or left the conversation context (a read tool result, an edit, a write, or a
context attachment).

No fetched source meters cost per file, and the finest native grains are Claude Code's component
attribution (skills, subagents, plugins, MCP servers, each a percentage, with MCP share counting
only requests that consumed one of its tool results) and Copilot's per-prompt accounting
(https://docs.anthropic.com/en/docs/claude-code/costs;
https://docs.cursor.com/en/account/plans-and-usage now serves a billing-free landing page; the Codex
pricing page returned a 404 and then a Cloudflare anti-bot block, so no Codex unit exists -
https://openai.com/codex/pricing/).

FinOps places this layer on its third granularity rung, because beyond owner lists and resource
tags, allocation uses "observability, or utilization data"
(https://www.finops.org/framework/capabilities/allocation/).

The contract of the plugin follows: observe priced events and file touches, join them into
allocations, and never alter either.

## 2. Token accounting - the exact usage fields providers report (input, output, cache read, cache write, reasoning), which are additive and which overlap, and the trap in each provider's shape

**Anthropic** (https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching). Additive:

```
total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens
- cache_read_input_tokens:    tokens retrieved from cache
- cache_creation_input_tokens: new tokens written to cache; equals the sum of
  cache_creation.ephemeral_5m_input_tokens + ephemeral_1h_input_tokens
- input_tokens: tokens after the last cache breakpoint that are not cached
workd example: input 2048 + cache_read 1800 + cache_creation 248 = 4096; output 503
```

Overlap: none among the three input components, but thinking blocks read from cache count as input
tokens, and thinking parameters are rendered into the prompt so changing them invalidates the
messages cache. Trap: pricing the additive total at the base input rate misprices cache reads (0.1x
or lower, see section 3); and Haiku 5.5's tiered prices key on prompt length where "prompt length
counts all input tokens including cache reads and writes, per request"
(https://docs.anthropic.com/en/docs/about-claude/pricing).

**OpenAI** (https://platform.openai.com/docs/pricing). Columns: Input | Output | Cached input | 30m
write | 12h write, per 1M tokens; gpt-6-astra $10.00/$50.00/$1.00/$12.50/$25.00. Cached input prices
the cached portion of input (a discount on a subset); the two write columns bill storage of new
cache content. Trap: the price page shows no usage JSON - field names such as
`prompt_tokens_details.cached_tokens` live in the API reference, which was not fetched, so the
field-level subset relation is unverified here and the plugin must not guess it.

**DeepSeek** (https://api-docs.deepseek.com/quick_start/pricing). Buckets: input cache hit vs cache
miss vs output, each with peak and off-peak rates (flash: $0.003/$0.006 hit, $0.15/$0.30 miss,
$0.60/$1.20 output per 1M). Trap: identical tokens price differently by wall clock - peak is
01:00-04:00 and 06:00-10:00 UTC Monday through Friday excluding Chinese public holidays - so the
ledger must keep the request timestamp and resolve price at event time. The fetched page gives no
usage-field shape.

**Gemini** (https://ai.google.dev/gemini-api/docs/pricing). Output price explicitly includes
thinking tokens; input is tiered by prompt size ($2.00 <= 200k, $4.00 above for 3.1 Pro), context
caching prices reads at $0.20/$0.40 plus storage at $4.50 per 1M tokens per hour;
`promptTokensDetails` carries modality, PDFs bill at the image token rate, and retrieved grounding
context is not charged as input while URL context and File Search retrieved tokens are. Trap: one
"output" rate is really two behaviors (visible reasoning is inside it), and cache storage is a time
dimension, not a token count - a pure per-call model cannot price it.

**Cloudflare** (https://developers.cloudflare.com/workers-ai/platform/pricing/). Every LLM row
carries both a token price and a neuron price (glm-5.3-flash: $0.150/$0.030/$0.500 per M
input/cached/output tokens and 13636/2727/45455 neurons); $0.011 per 1,000 Neurons, 10,000 free
Neurons per day resetting at 00:00 UTC. Trap: dual currency; the neuron-per-token conversion is
implicit per row and never stated as a formula, so a cost model must pick a currency and record the
row it used.

**OpenTelemetry** (token-metrics and client-inference URLs in section 1). Counters
`gen_ai.client.inference.usage.{input_tokens,output_tokens,cache_read.input_tokens, cache_write.input_tokens,reasoning.output_tokens}`,
instrument Counter, unit `{token}`; the cache_read, cache_write, and reasoning counters "report
subsets of the input_tokens and output_tokens counters"; required dimensions are
`gen_ai.operation.name`, `gen_ai.provider.name`, and `gen_ai.token.modality` (text, image, audio,
unknown). The span attributes are inclusive: `gen_ai.usage.input_tokens` "SHOULD include all types
of input tokens, including cached tokens", and each subset "SHOULD be included in" the total. Bound
rule: "When systems report both used tokens and billable tokens, instrumentation MUST report
billable tokens."

**The cross-source trap** - inclusive vs exclusive buckets. OTel totals include cached and reasoning
tokens; Langfuse stores mutually exclusive buckets where "input excludes any input_* values (such as
input_cached_tokens)", "total is the sum of the buckets, not a bucket itself", and it converts
OpenAI's inclusive counts (17,903 prompt with 17,817 cached becomes input 86 + input_cached_tokens
17,817) and explicitly subtracts cache reads and writes from OTel `gen_ai.usage.*` input
(https://langfuse.com/docs/model-usage-and-cost). Storing inclusive totals into an exclusive schema
double-counts; the plugin must fix one canonical representation and implement the conversion exactly
once.

## 3. The price table - per-model rates, cache multipliers, effective dating, and why a stored price row must never be mutated after the fact

Rate shapes by provider, all per 1M tokens unless noted:

| Provider   | Buckets priced                                                                                        | Modifiers                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anthropic  | input, output, 5m write 1.25x, 1h write 2x, hit 0.1x (0.05x Opus/Sonnet 5.5, 0.025x Fable/Mythos 5.1) | Batch 50% off; residency `inference_geo: "us"` 1.1x; fast mode 2x-ish list, not with Batch (https://docs.anthropic.com/en/docs/about-claude/pricing) |
| OpenAI     | input, output, cached input, 30m write, 12h write                                                     | Flex/Batch 50%, Fast 2x, Ultrafast 6x; regional +10% uplift for models released on or after 2026-03-05 (https://platform.openai.com/docs/pricing)    |
| DeepSeek   | hit/miss input, output; peak and off-peak each                                                        | off-peak half price, windows in section 2 (https://api-docs.deepseek.com/quick_start/pricing)                                                        |
| Cloudflare | input, cached input, output - in tokens AND neurons                                                   | free 10,000 Neurons/day (https://developers.cloudflare.com/workers-ai/platform/pricing/)                                                             |
| Gemini     | input (two prompt-size tiers), output incl. thinking, cache read, cache storage per hour              | Batch 50%; promo windows time-boxed, several rates change 2027-01-01 (https://ai.google.dev/gemini-api/docs/pricing)                                 |

The joinable source of rates is the LiteLLM price map
(https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json): USD
per token (`*_cost_per_token` fields), rows keyed by model id, carrying `input_cost_per_token`,
`output_cost_per_token`, `cache_read_input_token_cost`, per-tier variants `*_batches` and
`*_priority`, `max_input_tokens`, `mode`, `litellm_provider`, a `source` URL, and `deprecation_date`
(gpt-4o-2024-11-20: 2.5e-06 in, 1e-05 out, 1.25e-06 cache-read, deprecates 2027-01-14).

The `sample_spec` entry does not list the cache-read or tier fields, so the schema must be
discovered by enumerating rows and not trusted
(https://docs.litellm.ai/docs/completion/token_usage -
`cost_per_token(model, prompt_tokens, completion_tokens)` returns two USD floats;
`response._hidden_params["response_cost"]` carries a per-call cost; `register_model` accepts a dict
or hosted JSON URL).

Effective dating: the price dimension is SCD Type 2, where rows carry Start_Date/End_Date with a
NULL end marking the current row, and a ledger row joins "the rate in force at event time", while
the Type 6 variant joins on effective date between start and end and needs no fact-table
reprocessing when the dimension changes (https://en.wikipedia.org/wiki/Slowly_changing_dimension).

Immutability rule: Type 2 binds each transaction to its time slice so aggregates keep historical
state, and retroactive dimension changes force rewrites, which the source calls expensive
(https://en.wikipedia.org/wiki/Slowly_changing_dimension); an event-sourced ledger stays immutable
and every aggregate is a rebuildable view (https://martinfowler.com/eaaDev/EventSourcing.html);
Langfuse applies model-definition changes only to generations logged afterward
(https://langfuse.com/docs/model-usage-and-cost).

Therefore a price correction is a new row with a new effective window, never an UPDATE, because the
historical bill must stay reproducible against the rates that were in force.

Freshness: `deprecation_date` is the only per-row expiry signal in the map, Gemini promos expire on
stated dates, DeepSeek windows rotate daily, and the Langfuse defaults are audited daily but apply
only to new generations.

All fetched prices are anchored to fetch date 2026-10-27 and go stale
(https://ai.google.dev/gemini-api/docs/pricing; https://api-docs.deepseek.com/quick_start/pricing;
https://docs.litellm.ai/docs/completion/token_usage).

## 4. Attribution models - direct (the step that touched the file), amortized (the context that preceded it), and cooperative (Shapley-style marginal contribution). For each: the formula, the data it needs, and where it is wrong

**Direct.** cost_direct(f) = SUM over calls c touching f of cost(c, the buckets f's tokens sat in).
Data: per-call usage plus a touch log binding each call to a file version and a role. Where it is
wrong: it ignores everything riding in the same context - a file read once then never touched again
still raises every later call's cost through the cached prefix, and the system prompt plus shared
retrieval context end as unallocated residue, which is exactly the KPI "percentage of costs that
cannot be categorized and allocated directly"
(https://www.finops.org/framework/capabilities/allocation/).

**Amortized.** cost_amort(f) = SUM over calls c of cost(c) x w(f,c), where w = tokens(f in c) /
tokens(total in c), computed per bucket so cache reads are priced at 0.1x, not 1x. Data: per-call
per-file token composition, which no provider reports - the plugin derives it from the rendered
prompt or from tokenizer estimates; Anthropic's anchors (10 kB page ~ 2,500 tokens; 100 kB doc ~
25,000) are rough, and its 4.7+ tokenizer produces about 30% more tokens for the same text
(https://docs.anthropic.com/en/docs/about-claude/pricing). Inferred counts are estimates, not billed
counts (https://langfuse.com/docs/model-usage-and-cost). Where it is wrong: token share is not cost
share when cache states differ across files; one file's cache write changes every other file's read
price on the next call; and the shared system prompt still needs an explicit shared-cost policy -
fixed, proportional, or proxy-metric - with "informed ignore" (fund centrally, allocate nothing) a
legitimate choice (https://www.finops.org/framework/capabilities/allocation/).

**Cooperative (Shapley).** With v(S) the cost of a call whose context contains only the file set S:

```
phi_i(v) = SUM over S subset N, i not in S of [ |S|! (n - |S| - 1)! / n! ] ( v(S + {i}) - v(S) )
efficiency:  SUM_i phi_i(v) = v(N)   - the split covers the bill exactly, no residue
axioms:      the only split satisfying efficiency, symmetry, additivity, null player
synergy:     phi_i = SUM over coalitions S containing i of w(S) / |S|
             (each coalition's Harsanyi dividend split equally among members)
```

(https://en.wikipedia.org/wiki/Shapley_value). Data: v(S) is a counterfactual - render each
coalition's prompt or maintain a token-level cost model; neither is observed in production. Where it
is wrong: the exact sum runs over 2^(n-1) subsets per player (or n! orderings) and the sources give
no approximation guidance at billing scale; and v is not additive in practice because shared
boilerplate creates synergies, which is the phenomenon Shapley exists to price
(https://en.wikipedia.org/wiki/Shapley_value).

## 5. Schema candidates - the entities, their keys, their cardinality, and the temporal columns

Storage posture: WAL-mode SQLite, append-only, STRICT tables.

STRICT allows only INT, INTEGER, REAL, TEXT, BLOB, ANY and raises SQLITE_CONSTRAINT_DATATYPE on a
lossless conversion failure (https://www.sqlite.org/stricttables.html).

WAL gives readers a pinned "end mark" for point-in-time reads and allows one writer at a time, with
auto-checkpoint at 1000 pages (~4 MB), and synchronous=NORMAL makes the checkpoint the only fsync
and drops power-loss durability (https://www.sqlite.org/wal.html).

Per-row payload detail lives in TEXT JSON columns read through json_each/json_tree (columns key,
value, type, atom, id, parent, fullkey, path) (https://www.sqlite.org/json1.html).

| Table        | Key                                                                                                                          | Cardinality                             | Temporal columns                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| model        | model_id TEXT PK (provider + request_model)                                                                                  | 1 : N call                              | none (static identity)                                               |
| price        | price_id INTEGER PK; FK model_id; bucket, rate REAL, tier, currency                                                          | 1 model : N price rows                  | effective_start, effective_end NULL (SCD Type 2); fetched_at; source |
| session      | session_id TEXT PK                                                                                                           | 1 : N turn                              | started_at, ended_at                                                 |
| turn         | turn_id INTEGER PK; FK session_id; seq                                                                                       | 1 turn : N step                         | started_at                                                           |
| step         | step_id INTEGER PK; FK turn_id; seq; operation                                                                               | 1 step : N call                         | started_at                                                           |
| call         | call_id TEXT PK; FK step_id; provider, request_model, response_model, operation                                              | 1 call : N touch, 1 call : N allocation | started_at, ended_at                                                 |
| file         | file_id INTEGER PK; UNIQUE(path, project)                                                                                    | 1 : N file_version                      | none                                                                 |
| file_version | file_version_id INTEGER PK; FK file_id; content_hash                                                                         | 1 : N touch                             | first_seen_at, last_seen_at                                          |
| touch        | touch_id INTEGER PK; FK call_id; FK file_version_id; role (system/context/tool_result/edit_target); token_count INTEGER NULL | N : 1 call, N : 1 file_version          | recorded_at                                                          |
| allocation   | allocation_id INTEGER PK; FK call_id; FK file_version_id; model (direct/amortized/shapley); tokens_attributed; cost_usd      | N : 1 call, N : 1 file_version          | computed_at                                                          |
| rollup       | rollup_id INTEGER PK; grain; scope; period_start, period_end; cost_usd                                                       | derived view over allocation            | computed_at                                                          |

The touch is the join point: one priced call references N file versions; one file version
participates in N calls; the allocation row is the per-(call, file) split under one attribution
model. Timestamps are RFC 3339 `date-time = full-date "T" full-time` with optional fractional
seconds; generated timestamps SHOULD use uppercase T and Z; a ledger that compares timestamps
lexically must normalize case and separator first and preserve `-00:00` (UTC known, local offset
unknown) rather than rewriting it (https://www.rfc-editor.org/rfc/rfc3339).

Booking: each call is booked with two equal and opposite entries - a debit to a cost account (a
debit increases an Expense account) and a credit to a budget/consumption account - so debits always
equal credits and a trial balance detects loss
(https://en.wikipedia.org/wiki/Double-entry_bookkeeping). Aggregates are derived views rebuilt from
the ledger (Complete Rebuild, Temporal Query, Event Replay
(https://martinfowler.com/eaaDev/EventSourcing.html)); the OMB cost-type taxonomy separates the
direct cost attributable to files from indirect shared context
(https://en.wikipedia.org/wiki/Cost_allocation).

No sourced schema exists: the STRICT datatype list and the json_tree columns are specified exactly
by their sources; every table and column name above is this document's synthesis
(https://www.sqlite.org/stricttables.html; https://www.sqlite.org/json1.html).

## 6. Aggregation and export - rollup strategy, the per-client/per-project dimension, and the export shapes a client could receive

Rollup strategy: never mutate, recompute. Rollup rows are append-only derived views keyed by (grain,
scope, period) with computed_at, rebuilt from the allocation table on demand; the ledger supports
temporal query ("state at any point in time") because every row keeps its event time
(https://martinfowler.com/eaaDev/EventSourcing.html).

The per-client/per-project dimension rides on session: every export groups by session.client and
session.project first, then by model, bucket, and period - the FinOps granularity ladder runs
owner-level (accounts, projects), then resource-level (files), then shared-cost leftovers
(https://www.finops.org/framework/capabilities/allocation/). Health metrics to compute alongside the
dollars: percentage of cost allocated directly, percentage not categorizable, percentage of touches
missing allocation metadata, and the Allocation Accuracy Index - the percentage of total cost
directly and accurately attributed (allocation URL above). Showback reports the numbers to teams;
chargeback invoices cost centers; the framework's own Chargeback and Showback capability page is
HTTP 404 (kept as error evidence), so cadence and cost-recovery rules are uncaptured
(https://www.finops.org/framework/capabilities/chargeback-showback/).

Export shapes a client could receive:

- **CSV** per RFC 4180: records delimited by CRLF, comma-separated fields, every line the same field
  count, spaces are part of a field, fields containing CRLF/quotes/commas double-quoted with
  embedded quotes escaped as 2DQUOTE, optional header line signaled by the MIME `header` parameter;
  the RFC fixes no column types or units, so the column contract is the plugin's own
  (https://www.rfc-editor.org/rfc/rfc4180).
- **FOCUS-shaped rows**: FOCUS 1.4 is a published CC-BY-4.0 billing-data schema enabling chargeback,
  cost allocation, budgeting, and forecasting, and Unit Economics consumes FOCUS for normalized cost
  datasets - but the fetched landing page carries no column fields, so no FOCUS column list is
  quotable from this research (https://focus.finops.org/focus-specification/;
  https://www.finops.org/framework/capabilities/unit-economics/).
- **JSON Lines**: one allocation row per line, RFC 3339 timestamps, model and bucket fields - the
  shape OTel-based pipelines already ingest; PostHog's AI Observability captures tokens, cost, and
  latency into traces as an existing destination for LLM usage events
  (https://posthog.com/docs/llm-analytics).
- **Code annotations** (section 7): a per-file summary written into the file itself.
- DuckDB is the positioned OLAP engine for analytical rollups over the ledger
  (https://duckdb.org/why_duckdb), but no source benchmarks it against SQLite for this workload.

## 7. Annotation - how a cost comment is injected per language without corrupting the file, and the idempotence rule

The plugin's standing posture is telemetry only: it never changes the conversation. Annotation is a
separate, explicitly invoked export that edits files on disk after the fact; it must be semantically
inert in every target language.

- **Rust**: doc comments are AST nodes - `///` and `/** ... */` compile to `#[doc="..."]` on the
  item that follows, `//!` and `/*! ... */` to `#![doc="..."]` on the parent - so a cost comment
  must NOT use `///` (it would alter the following item's documentation); a plain `//` comment is
  inert, and a four-slash `////` demotes an otherwise doc-shaped comment back to a plain comment. A
  block payload must avoid `*/` (it terminates the comment) and CR (U+000D is not allowed in doc
  comments) (https://doc.rust-lang.org/reference/comments.html).
- **TypeScript**: only the documentation tags (`@deprecated`, `@see`, `@link`) are supported in .ts
  files, and any unlisted tag is unsupported; TypeScript ignores unsupported tags, so a custom cost
  tag is safe to emit and invisible to tooling. JSDoc type tags work only in .js files
  (https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html).
- **Python**: a docstring is the string literal that is the first statement of a module, function,
  class, or method and becomes that object's `__doc__` - a cost note inside a docstring changes a
  runtime attribute, so annotation must be a `#` comment (https://peps.python.org/pep-0257/).

Idempotence rule: one machine-readable, plugin-owned key per file. A re-run either replaces the
existing block in place or skips when the value is unchanged; it never appends a second copy. Each
stamp records the price-row id and an RFC 3339 timestamp so the annotation is reproducible against
the ledger. No fetched source reserves a machine-readable key namespace inside comments or
docstrings - the key names, units, and placement are the plugin's own to define
(https://doc.rust-lang.org/reference/comments.html;
https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html). SPDX-style file headers
were the candidate standardized vocabulary, but the SPDX 2.3 package-information page blocked both
fetch attempts (anti-bot shell, 0 visible chars), so no SPDX field name is verified here and none is
cited (https://spdx.github.io/spdx-spec/v2.3/package-information/).

## 8. Open decisions for the architect

1. Canonical token shape: OTel inclusive totals or Langfuse exclusive buckets. Inclusive matches
   provider reports; exclusive avoids double-counting at the boundary - pick once, convert once.
2. Default attribution model: direct, amortized, or Shapley. Direct is cheap and under-allocates
   shared context; amortized needs per-file composition providers never report; Shapley is exact but
   exponential and counterfactual.
3. Shared-context policy per item: fixed, proportional, proxy-metric, or informed ignore. FinOps
   says most organizations mix them and names no default
   (https://www.finops.org/framework/capabilities/allocation/).
4. Price join key: (provider, request_model) vs response_model when they differ. Request is the OTel
   dimension and what the caller chose; response reflects routing and fine-tunes actually served
   (https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/gen-ai-token-metrics.md).
5. Rate source: vendored LiteLLM map vs a self-maintained rate card. The map is broad but community
   maintained with only deprecation_date as expiry; a rate card is contract-exact but costs
   maintenance
   (https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json).
6. Token-count provenance for per-file shares: provider-reported totals only, or tokenizer estimates
   per file. Estimates enable amortization but are not billed counts and the 4.7+ tokenizer inflates
   counts ~30% (https://docs.anthropic.com/en/docs/about-claude/pricing).
7. Cache-write allocation: charge the write to the triggering file, or spread it over the cached
   set. Trigger-charging is simple and biases the first toucher; spreading matches who benefits from
   later reads (https://docs.anthropic.com/en/docs/about-claude/pricing).
8. Time-of-day pricing: resolve cost at write time and store dollars, or store tokens and resolve at
   read time. Write-time freezes against price corrections; read-time keeps the full SCD2 rate
   history and event timestamps so retroactive corrections stay possible
   (https://en.wikipedia.org/wiki/Slowly_changing_dimension).
9. Ledger write topology: all agent processes funnel through one writer connection, or EXCLUSIVE
   locking mode. WAL permits one writer at a time and the sources settle nothing further
   (https://www.sqlite.org/wal.html).
10. Payload detail column: TEXT JSON vs JSONB BLOB. JSONB is smaller and faster but opaque, O(N)
    parse, and its format may change between SQLite versions (https://www.sqlite.org/json1.html).
11. Rollup engine: SQLite views vs DuckDB. Embedded simplicity versus columnar analytics; no source
    benchmarks the trade (https://duckdb.org/why_duckdb).
12. Annotation surface: sidecar CSV ledger only, or in-file comments. Comments are visible at the
    point of use but add merge noise and churn; the sidecar never touches code
    (https://www.rfc-editor.org/rfc/rfc4180).
