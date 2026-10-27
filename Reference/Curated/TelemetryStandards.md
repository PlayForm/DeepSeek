# LLM Telemetry Standards and Cost Tracking

> Decision: per-file inference cost attribution needs exactly three artifacts and two rules. The
> artifacts: a token-usage record per model call keyed by operation and model, a price table keyed
> by model with USD-per-token rates, and a join from usage back to the file whose content produced
> the tokens. The rules: cost = usage multiplied by price per usage type, with directly ingested
> cost taking priority over inferred cost (Langfuse rule), and an inclusive-vs-exclusive bucket
> conversion at the boundary because OpenTelemetry reports totals that include cached and reasoning
> tokens while Langfuse stores mutually exclusive buckets. OpenTelemetry supplies the usage-record
> shape but no cost signal; the LiteLLM price map supplies the prices; file attribution is the one
> piece no source defines.

## Sources

- OpenTelemetry GenAI spans spec (moved) -
  https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/ -
  Reference/Raw/opentelemetry-gen-ai-spans.md (stub, 601 bytes: page is a "Moved" notice)
- OpenTelemetry GenAI metrics spec (moved) -
  https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/ -
  Reference/Raw/opentelemetry-gen-ai-metrics.md (stub, 601 bytes: page is a "Moved" notice)
- OpenTelemetry GenAI semantic conventions repo -
  https://github.com/open-telemetry/semantic-conventions-genai -
  Reference/Raw/opentelemetry-semantic-conventions-genai.md
- OTel GenAI attribute registry -
  https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/ -
  Reference/Raw/opentelemetry-gen-ai-attributes.md
- OTel GenAI spans doc in the moved repo -
  https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/gen-ai-spans.md -
  Reference/Raw/opentelemetry-genai-repo-gen-ai-spans.md
- OTel GenAI metrics doc in the moved repo -
  https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/gen-ai-metrics.md -
  Reference/Raw/opentelemetry-genai-repo-gen-ai-metrics.md
- OTel GenAI inference token metrics -
  https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/gen-ai-token-metrics.md -
  Reference/Raw/opentelemetry-genai-repo-token-metrics.md
- OTel GenAI client inference (spans + metrics) -
  https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/client-inference.md -
  Reference/Raw/opentelemetry-genai-repo-client-inference.md
- OTel GenAI repo docs index -
  https://github.com/open-telemetry/semantic-conventions-genai/tree/main/docs -
  Reference/Raw/opentelemetry-genai-repo-docs-tree.md
- OTel GenAI repo docs/gen-ai index -
  https://github.com/open-telemetry/semantic-conventions-genai/tree/main/docs/gen-ai -
  Reference/Raw/opentelemetry-genai-repo-docs-gen-ai-tree.md
- Langfuse Model Usage and Cost Tracking - https://langfuse.com/docs/model-usage-and-cost -
  Reference/Raw/langfuse-model-usage-and-cost.md (redirects to
  /docs/observability/features/token-and-cost-tracking)
- LiteLLM Token Usage - https://docs.litellm.ai/docs/completion/token_usage -
  Reference/Raw/litellm-token-usage.md
- LiteLLM model price map (JSON) -
  https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json -
  Reference/Raw/litellm-model-prices-and-context-window.md (2,960,318 bytes: the script kept the
  whole document past the 40,000-char cap; the sample_spec entry documents the row schema)
- PostHog LLM analytics - https://posthog.com/docs/llm-analytics -
  Reference/Raw/posthog-llm-analytics.md (small hub page, 2,183 bytes: now titled "AI
  Observability")
- Failure:
  https://raw.githubusercontent.com/open-telemetry/semantic-conventions-genai/main/docs/gen-ai/spans.md
  returned 404 twice (exit 5, anti-bot minimal_text on a 228-byte page); the real path is
  docs/gen-ai/gen-ai-spans.md. No file written; fetch-errors.log is owned by another lane.

## What the sources establish

1. Both opentelemetry.io GenAI spec pages are "Moved" stubs: "GenAI semantic conventions have moved
   to the OpenTelemetry GenAI semantic conventions repository"
   (github.com/open-telemetry/semantic-conventions-genai). That repo holds spans, metrics, and
   events for GenAI clients, MCP, and provider-specific conventions, with prose in docs/ generated
   from YAML in model/. (opentelemetry.io gen-ai-spans, gen-ai-metrics, and the repo page)
2. Usage attributes on the `gen_ai.client.inference` span: `gen_ai.usage.input_tokens` (int,
   Recommended, "SHOULD include all types of input tokens, including cached tokens"),
   `gen_ai.usage.output_tokens` (int, Recommended), plus subsets each marked "SHOULD be included in"
   the total: `gen_ai.usage.cache_read.input_tokens`, `gen_ai.usage.cache_write.input_tokens`,
   `gen_ai.usage.reasoning.output_tokens`, and modality variants
   `gen_ai.usage.{text,image,audio}.{input,output}_tokens`. (client-inference doc, attribute
   registry)
3. Billed-versus-consumed rule: on the usage counters, "When systems report both used tokens and
   billable tokens, instrumentation MUST report billable tokens"; on the span attributes,
   "instrumentations SHOULD report the billed count so the value matches the units the customer is
   charged for". (gen-ai-token-metrics, client-inference)
4. Metric instruments for tokens:
   `gen_ai.client.inference.usage.{input_tokens,output_tokens,cache_read.input_tokens,cache_write.input_tokens,reasoning.output_tokens}`
   are Counters with unit `{token}`; required dimensions are `gen_ai.operation.name`,
   `gen_ai.provider.name`, and `gen_ai.token.modality` (values `text`, `image`, `audio`, `unknown`);
   `gen_ai.request.model` is Conditionally Required, `gen_ai.response.model` Recommended. The
   `gen_ai.client.inference.operation.{input,output}_tokens` histograms "should not be used for
   total usage or cost calculations" (percentiles only). (gen-ai-token-metrics)
5. Span shape: span `gen_ai.client.inference`, name "{gen_ai.operation.name}
   {gen_ai.request.model}", span kind CLIENT. `gen_ai.operation.name` well-known values include
   `chat`, `create_agent`, `create_memory`, `embeddings`, `execute_tool`, `fetch_response`,
   `generate_content`, `invoke_agent`, `invoke_workflow`, `plan`, `retrieval`, `search_memory`,
   `text_completion`. `gen_ai.provider.name` well-known values include `anthropic`, `aws.bedrock`,
   `azure.ai.openai`, `cohere`, `deepseek`, `gcp.vertex_ai`, `groq`, `ibm.watsonx.ai`, `mistral`,
   `moonshot_ai`, `openai`, `perplexity`, `x_ai`. Tool spans are named
   `execute_tool {gen_ai.tool.name}`. (client-inference, gen-ai-metrics, gen-ai-spans)
6. Deprecated names the plugin must not emit: `gen_ai.usage.prompt_tokens` (replaced by
   `gen_ai.usage.input_tokens`), `gen_ai.usage.completion_tokens` (replaced by
   `gen_ai.usage.output_tokens`), `gen_ai.system` (replaced by `gen_ai.provider.name`),
   `gen_ai.openai.request.response_format` (replaced by `gen_ai.output.type`),
   `gen_ai.openai.request.service_tier` (replaced by `openai.request.service_tier`). (attribute
   registry)
7. OTel defines no USD-cost attribute or metric anywhere in the GenAI conventions; the closest the
   standard comes is calling token counters "a proxy for cost approximation". (gen-ai-token-metrics)
8. Langfuse records two maps per LLM call, on observations of type `generation` and `embedding`
   only: `usage_details` (units per usage type, e.g. `input`, `output`, `cache_read_input_tokens`)
   and `cost_details` (USD per usage type). Ingested values take priority over inferred values;
   inferred cost is computed at ingestion time from the generation's `model` matched against a model
   definition via `match_pattern` regex, and user-defined models take priority over
   Langfuse-maintained ones. (langfuse)
9. Langfuse usage types are mutually exclusive buckets: "input excludes any input_* values (such as
   input_cached_tokens)", "output excludes any output_* values (such as output_reasoning_tokens)",
   and "total is the sum of the buckets, not a bucket itself". Inclusive provider counts must be
   converted before storing, otherwise "usage and inferred cost will be counted double". OpenAI
   counts are inclusive, so Langfuse subtracts detail counts from `input` and `output`. (langfuse)
10. Langfuse normalizes OpenTelemetry input: for `gen_ai.usage.*` or `llm.token_count.*` sources,
    "Cache reads and writes are subtracted from `input`". Its OpenAI map: `prompt_tokens` ->
    `input`, `completion_tokens` -> `output`, `total_tokens` -> `total`, `prompt_tokens_details.*`
    -> `input_*`, `completion_tokens_details.*` -> `output_*`; schema recognition is strict, so any
    extra key defeats the mapping and the object is stored verbatim as flat keys. (langfuse)
11. Langfuse ships default model prices in worker/src/constants/default-model-prices.json, checked
    by a daily automated audit against official provider pages; pricing tiers carry name, priority,
    and conditions over usage-detail regex sums (`gt`, `gte`, `lt`, `lte`, `eq`, `neq`), model
    parameters, or metadata, evaluated in priority order with the default tier as fallback;
    definition changes apply only to generations logged afterward. (langfuse)
12. LiteLLM returns `response_cost` on every call via `response._hidden_params["response_cost"]`,
    and exposes `cost_per_token(model, prompt_tokens, completion_tokens)` returning two USD floats,
    `completion_cost(...)` returning one USD float, and a `model_cost` dict of `max_tokens`,
    `input_cost_per_token`, `output_cost_per_token` for every model. `register_model` accepts a dict
    or a hosted JSON URL; `LITELLM_LOCAL_MODEL_COST_MAP="True"` switches to the bundled copy.
    (docs.litellm.ai token_usage)
13. The LiteLLM price map is community maintained and documents its row schema in a `sample_spec`
    entry. Cost fields present in real rows but absent from sample_spec include
    `cache_read_input_token_cost`, and per-row `*_batches` and `*_priority` price variants. The
    price unit is USD per token for `*_cost_per_token` fields; image models use
    `output_cost_per_image` (USD per image); tool-service fields use per-1k or per-query or
    per-GB-day units. Every row carries `source` (URL) and optional `deprecation_date` (YYYY-MM-DD).
    (litellm price map)
14. Concrete rows, USD per token: `gpt-4o-2024-11-20` input 2.5e-06, output 1e-05, cache_read
    1.25e-06, batches 1.25e-06/5e-06, priority 4.25e-06/1.7e-05, max_input_tokens 128000,
    max_output_tokens 16384, deprecation_date 2027-01-14; `deepseek-chat` input 2.8e-07, output
    4.2e-07, cache_read 2.8e-08, max_input_tokens 131072, max_output_tokens 8192, deprecation_date
    2026-07-24. (litellm price map)
15. PostHog renamed the LLM analytics surface to "AI Observability": it captures "the prompt, the
    response, the tokens, the cost, the latency, and the tools" into traces, ingested from PostHog
    SDK generations/spans/traces, forwarded from Helicone, Langfuse, Traceloop, or Keywords AI, plus
    user feedback attached to traces. The captured page is a hub page with no field schema.
    (posthog)

## Extracts that matter

LiteLLM price-map row schema (sample_spec entry, cost-relevant fields only):

```
"sample_spec": {
    "input_cost_per_token": 0.0,
    "output_cost_per_token": 0.0,
    "input_cost_per_audio_token": 0.0,
    "output_cost_per_reasoning_token": 0.0,
    "max_input_tokens": "max input tokens, if the provider specifies it",
    "max_output_tokens": "max output tokens, if the provider specifies it",
    "mode": "one of: chat, embedding, completion, image_generation,
             audio_transcription, audio_speech, moderation, rerank, search",
    "litellm_provider": "one of https://docs.litellm.ai/docs/providers",
    "deprecation_date": "date when the model becomes deprecated in the format YYYY-MM-DD",
    "search_context_cost_per_query": {"search_context_size_low": 0.0,
        "search_context_size_medium": 0.0, "search_context_size_high": 0.0},
    "vector_store_cost_per_gb_per_day": 0.0,
    "file_search_cost_per_1k_calls": 0.0,
    "file_search_cost_per_gb_per_day": 0.0,
    "code_interpreter_cost_per_session": 0.0,
    "computer_use_input_cost_per_1k_tokens": 0.0,
    "computer_use_output_cost_per_1k_tokens": 0.0
}
```

LiteLLM real rows (USD per token, key fields only):

```
"gpt-4o-2024-11-20": {
    "cache_read_input_token_cost": 1.25e-06,
    "input_cost_per_token": 2.5e-06,
    "input_cost_per_token_batches": 1.25e-06,
    "input_cost_per_token_priority": 4.25e-06,
    "output_cost_per_token": 1e-05,
    "output_cost_per_token_batches": 5e-06,
    "output_cost_per_token_priority": 1.7e-05,
    "max_input_tokens": 128000, "max_output_tokens": 16384,
    "mode": "chat", "litellm_provider": "openai",
    "deprecation_date": "2027-01-14",
    "source": "https://developers.openai.com/api/docs/pricing"
},
"deepseek-chat": {
    "cache_read_input_token_cost": 2.8e-08,
    "input_cost_per_token": 2.8e-07, "output_cost_per_token": 4.2e-07,
    "max_input_tokens": 131072, "max_output_tokens": 8192,
    "mode": "chat", "litellm_provider": "deepseek",
    "deprecation_date": "2026-07-24",
    "source": "https://api-docs.deepseek.com/quick_start/pricing"
}
```

OTel usage attributes and the inclusive rule (client-inference doc):

```
gen_ai.usage.input_tokens            int  Recommended
    "This value SHOULD include all types of input tokens, including cached tokens."
gen_ai.usage.output_tokens           int  Recommended
gen_ai.usage.cache_read.input_tokens   int  Recommended when non-zero
    "The value SHOULD be included in gen_ai.usage.input_tokens."
gen_ai.usage.cache_write.input_tokens  int  Recommended when non-zero
    "The value SHOULD be included in gen_ai.usage.input_tokens."
gen_ai.usage.reasoning.output_tokens   int  Recommended when non-zero
    "The value SHOULD be included in gen_ai.usage.output_tokens."
# worked example: 100 text tokens (40 cached) + 200 image tokens
#   gen_ai.usage.input_tokens: 300
#   gen_ai.usage.cache_read.input_tokens: 40
#   gen_ai.usage.text.input_tokens: 100
#   gen_ai.usage.image.input_tokens: 200
```

OTel token metric instruments (gen-ai-token-metrics doc):

```
| Name | Instrument Type | Unit (UCUM) | Description |
| gen_ai.client.inference.usage.input_tokens | Counter | {token} | input (prompt) tokens used, including cached tokens |
| gen_ai.client.inference.usage.output_tokens | Counter | {token} | output (completion) tokens used, including reasoning tokens |
| gen_ai.client.inference.usage.cache_read.input_tokens | Counter | {token} | input tokens served from a provider-managed cache |
| gen_ai.client.inference.usage.cache_write.input_tokens | Counter | {token} | input tokens written to a provider-managed cache |
| gen_ai.client.inference.usage.reasoning.output_tokens | Counter | {token} | output tokens used for reasoning |
# "The cache_read, cache_write, and reasoning counters report subsets of the
#  input_tokens and output_tokens counters."
# Required dimensions: gen_ai.operation.name, gen_ai.provider.name,
#   gen_ai.token.modality (text, image, audio, unknown)
# Histograms gen_ai.client.inference.operation.{input,output}_tokens:
#   "should not be used for total usage or cost calculations."
```

Langfuse exclusive-bucket conversion and OpenAI mapping:

```
| Provider reports (inclusive)                     | Stored in Langfuse (exclusive) |
| prompt_tokens: 17903                             | input: 86                      |
| prompt_tokens_details: { cached_tokens: 17817 }  | input_cached_tokens: 17817     |
| completion_tokens: 188                           | output: 188                    |
| total_tokens: 18091                              | total: 18091                   |
# "input excludes any input_* values (such as input_cached_tokens)"
# "output excludes any output_* values (such as output_reasoning_tokens)"
# "total is the sum of the buckets, not a bucket itself."
# OpenAI map: prompt_tokens -> input; completion_tokens -> output;
#   total_tokens -> total; prompt_tokens_details.* -> input_*;
#   completion_tokens_details.* -> output_*  (strict: extra keys defeat it)
# OTel input: "OpenTelemetry gen_ai.usage.* or llm.token_count.*:
#   Cache reads and writes are subtracted from input"
```

LiteLLM cost helpers (token_usage doc):

```
from litellm import model_cost
print(model_cost)
# {'gpt-6-luna': {'max_tokens': 128000, 'input_cost_per_token': 2e-07,
#                 'output_cost_per_token': 1.2e-06}, ...}
prompt_usd, completion_usd = cost_per_token(model="gpt-6-luna",
    prompt_tokens=5, completion_tokens=10)
cost = completion_cost(completion_response=response)   # float, USD
print(response._hidden_params["response_cost"])
litellm.register_model({"gpt-6.1-sol": {"max_tokens": 128000,
    "input_cost_per_token": 0.000002, "output_cost_per_token": 0.000012,
    "litellm_provider": "openai", "mode": "chat"}})
export LITELLM_LOCAL_MODEL_COST_MAP="True"
```

## Open questions

1. No cost signal in OTel: the GenAI conventions define token usage but no USD-cost attribute or
   metric, so cost must come from either a price table joined on (`gen_ai.provider.name`,
   `gen_ai.request.model`) or directly ingested cost like Langfuse `cost_details`. Open: which join
   key wins when `gen_ai.response.model` differs from `gen_ai.request.model` (fine-tunes, aliases).
2. Inclusive versus exclusive totals conflict: OTel says cache and reasoning subsets are included in
   the totals, while Langfuse demands exclusive buckets and explicitly subtracts cache reads and
   writes from OTel input. The plugin must pick one canonical representation and implement the
   conversion once, or historical recomputation will double-count.
3. File attribution is undefined: no attribute in any source ties token usage to a file path. The
   available hooks are `gen_ai.conversation.id` (session correlation, with rules against inventing
   fallback values), tool spans (`execute_tool {gen_ai.tool.name}` with `gen_ai.tool.call.arguments`
   and `gen_ai.tool.call.result`), and `gen_ai.input.messages`. Deriving "which file's content drove
   this call's tokens" is the plugin's own rule to define.
4. `gen_ai.token.modality` is a Required dimension on usage counters, but providers rarely split
   token counts by modality; the spec's fallback is `unknown`. Pricing varies by modality (audio and
   image token prices exist in the LiteLLM map), so unknown modality leaves ambiguity in cost.
5. Price-map schema is not self-describing: `cache_read_input_token_cost` and the `*_batches` /
   `*_priority` variants appear in real rows but not in `sample_spec`; the plugin should discover
   fields by enumerating rows, not by trusting sample_spec.
6. Freshness and expiry: the LiteLLM map is community maintained with no per-row version, only
   `deprecation_date` as an expiry signal; Langfuse defaults are audited daily but "apply only to
   new generations". Open: how to price a historical call whose model row changed or expired since
   the call happened.
7. Tokenizer fidelity: LiteLLM `token_counter` defaults to tiktoken and Langfuse can infer usage
   from tokenizers (`gpt-4o` -> `o200k_base`, `gpt*` -> `cl100k_base`, `claude*` -> `claude`), but
   Anthropic warns its own tokenizer is not accurate for Claude 3 models; inferred counts are
   estimates, not billed counts.
8. PostHog's LLM analytics docs moved to "AI Observability" and the captured page carries no
   property-level schema; the token, cost, and latency property names would need a deeper page or
   the SDK docs.
