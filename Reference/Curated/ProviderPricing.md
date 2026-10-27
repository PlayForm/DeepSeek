# Provider Pricing and Token Accounting

> Decision: per-file inference cost attribution bills each token an agent spends on a file, and the
> six sources agree the billable unit is not one input price plus one output price but a set of
> buckets: uncached input, cached input reads, cache writes at a TTL-dependent multiplier, output
> tokens (thinking and reasoning tokens are billed as output), per-call tool fees, session runtime,
> and cache storage time. The same file lands in different buckets on different requests: its first
> appearance is a cache write at 1.25x to 2.5x the base input rate, later appearances are reads at
> 0.1x or lower, and time of day (DeepSeek peak/off-peak), batch mode (Anthropic, OpenAI, and Gemini
> all at 50 percent off), data residency (Anthropic 1.1x), and promo windows (Gemini, DeepSeek) move
> the rate. The plugin therefore resolves price per request from the provider's own usage fields
> plus a price table keyed on model, tier, cache state, and time, and never re-derives the
> cached/uncached split or the token counts itself.

## Sources

- Anthropic Model pricing - https://docs.anthropic.com/en/docs/about-claude/pricing -
  Raw/anthropic-pricing.md (32,443 bytes)
- Anthropic Prompt caching - https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching -
  Raw/anthropic-prompt-caching.md (63,399 bytes)
- OpenAI Pricing - https://platform.openai.com/docs/pricing - Raw/openai-pricing.md (16,615 bytes)
- DeepSeek Models and Pricing - https://api-docs.deepseek.com/quick_start/pricing -
  Raw/deepseek-pricing.md (3,669 bytes)
- Cloudflare Workers AI Pricing - https://developers.cloudflare.com/workers-ai/platform/pricing/ -
  Raw/cloudflare-workers-ai-pricing.md (13,650 bytes)
- Google Gemini Developer API pricing - https://ai.google.dev/gemini-api/docs/pricing -
  Raw/google-gemini-api-pricing.md (71,867 bytes)

## What the sources establish

1. Anthropic's model table columns are Model | Base tokens (Input, Output) | Prompt caching (5m
   writes, 1h writes, Hits and refreshes), in USD per MTok; current rows: Claude Fable 5.1 $10/$50,
   Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 5.5 $0.10 input and $0.50 output for prompts up to
   100,000 tokens. (https://docs.anthropic.com/en/docs/about-claude/pricing)
2. Anthropic Haiku 5.5 is priced by prompt length: a prompt over 100,000 tokens pays $0.50 input /
   $2.50 output / $0.625 5m write / $1 1h write / $0.05 hit, and prompt length counts all input
   tokens including cache reads and writes, per request.
   (https://docs.anthropic.com/en/docs/about-claude/pricing)
3. Anthropic cache multipliers: 5-minute write 1.25x base input, 1-hour write 2x, cache hit 0.1x,
   with 0.05x on Claude Opus 5.5 and Sonnet 5.5 and 0.025x on Claude Fable 5.1 and Mythos 5.1.
   (https://docs.anthropic.com/en/docs/about-claude/pricing)
4. Anthropic modifiers stack: Batch API is 50 percent off input and output (Opus 5.5 $2/$10 batch);
   data residency `inference_geo: "us"` is 1.1x on all token categories for Claude 4.6 and later;
   fast mode is Opus 5.5 $8/$40 and Opus 5/4.8 $10/$50, stacks with caching and residency, and is
   not available with Batch. (https://docs.anthropic.com/en/docs/about-claude/pricing)
5. Anthropic tool-use pricing adds the `tools` parameter, `tool_use` and `tool_result` blocks, and a
   per-model tool system prompt: 286 tokens with tool_choice auto/none on the 5.5 family, 406 with
   `tool`; the bash tool definition adds 325 tokens and the text editor 974 tokens on Claude 4.7 and
   later. (https://docs.anthropic.com/en/docs/about-claude/pricing)
6. Anthropic Managed Agents bills tokens at model rates plus session runtime at $0.08 per
   session-hour, metered only while session status is `running`; the worked example prices 50,000
   input and 15,000 output tokens of Opus 5.5 plus 1 hour at $0.58.
   (https://docs.anthropic.com/en/docs/about-claude/pricing)
7. Anthropic web search is $10 per 1,000 searches (errors not billed), web fetch is free, and code
   execution beyond 1,550 free hours per month is $0.05 per hour per container.
   (https://docs.anthropic.com/en/docs/about-claude/pricing)
8. Anthropic's token-to-bytes anchors for per-file estimates: average webpage (10 kB) about 2,500
   tokens, large documentation page (100 kB) about 25,000, research paper PDF (500 kB) about
   125,000; Claude 4.7 and later use a tokenizer producing about 30 percent more tokens for the same
   text. (https://docs.anthropic.com/en/docs/about-claude/pricing)
9. Anthropic caching is configured with `cache_control: {"type": "ephemeral"}` at request top level
   (automatic) or on individual blocks (explicit), with `"ttl": "1h"` for the 1-hour tier; up to 4
   breakpoints, a 20-block lookback window, and the cache hierarchy `tools` -> `system` ->
   `messages`. (https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
10. Anthropic minimum cacheable prompt lengths: 512 tokens for Fable 5.1, Mythos 5.1, Opus 5.5, Opus
    5, Sonnet 5.5, Fable 5, Mythos 5, Haiku 5.5; 1,024 for Opus 4.8 and Sonnet 5/4.6/4.5; 2,048 for
    Mythos Preview, Opus 4.7, Haiku 3.5; 4,096 for Opus 4.6/4.5 and Haiku 4.5; below the minimum the
    request is processed without caching and no error is returned.
    (https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
11. Anthropic usage accounting:
    `total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens`,
    where `input_tokens` counts only tokens after the last cache breakpoint; `cache_creation` splits
    `ephemeral_5m_input_tokens` and `ephemeral_1h_input_tokens` and `cache_creation_input_tokens`
    equals their sum. (https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
12. Anthropic mixed-TTL billing positions: A = token count at the highest cache hit, B = highest
    1-hour block after A, C = last block; charges are read for A, 1-hour write for (B - A), 5-minute
    write for (C - B), and longer TTL entries must appear before shorter ones.
    (https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
13. Anthropic cache invalidation: tool definition changes invalidate tools, system, and messages
    caches; web search, citations, and speed toggles invalidate system and messages; `tool_choice`
    and image changes invalidate messages; thinking parameters and `output_config.effort` invalidate
    messages because they are rendered into the prompt; thinking blocks read from cache count as
    input tokens. (https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
14. OpenAI's table columns are Model | Input | Output | Cached input | 30m write | 12h write, per 1M
    tokens; Standard tier: gpt-6-astra $10.00/$50.00/$1.00/$12.50/$25.00, gpt-6.1-terra
    $1.00/$5.00/$0.05/$1.25/$2.50, gpt-6-luna $0.10/$0.50/$0.01/$0.125/$0.25.
    (https://platform.openai.com/docs/pricing)
15. OpenAI speed and batch tiers multiply Standard: Flex/Batch rows are 50 percent, Fast is 2x
    (astra $20/$100), Ultrafast is 6x (astra $60/$300); regional processing endpoints and FedRAMP
    endpoints add a 10 percent uplift for models released on or after March 5, 2026.
    (https://platform.openai.com/docs/pricing)
16. OpenAI tool fees: web search $10 per 1k calls plus search content tokens billed at model rates
    (a fixed block of 8,000 input tokens per call on gpt-4o-mini and gpt-4.1-mini non-preview); file
    search $2.50 per 1k tool calls and $0.10 per GB per day storage; containers $0.03 (1 GB) to
    $1.92 (64 GB) per 20-minute session. (https://platform.openai.com/docs/pricing)
17. DeepSeek lists prices per 1M tokens and states "We bill model usage based on the total number of
    input and output tokens"; deepseek-flash (DeepSeek-V4.1-Flash-1017): input cache hit $0.003
    off-peak / $0.006 peak, cache miss $0.15 / $0.30, output $0.60 / $1.20; deepseek-v4-pro
    (DeepSeek-V4-Pro-0813): $0.022/$0.044 hit, $0.66/$1.32 miss, $1.98/$3.96 output; expense =
    number of tokens x price. (https://api-docs.deepseek.com/quick_start/pricing)
18. DeepSeek off-peak rates are half of peak; peak hours are 01:00-04:00 and 06:00-10:00 UTC Monday
    through Friday excluding Chinese public holidays, so all weekend and holiday hours bill
    off-peak; context length 1M, max output 384K, concurrency 2,500 (flash) and 500 (pro).
    (https://api-docs.deepseek.com/quick_start/pricing)
19. DeepSeek Search and Fetch are standalone APIs at $0.75 per 1,000 successful requests each,
    currently free for server-side tool calls made through DeepSeek Harness, Claude Code, or Codex
    until 00:00 Beijing time on November 1, 2026; fees draw from topped-up balance with granted
    balance used first. (https://api-docs.deepseek.com/quick_start/pricing)
20. Cloudflare Workers AI is $0.011 per 1,000 Neurons with a free allocation of 10,000 Neurons per
    day resetting daily at 00:00 UTC; Neurons measure GPU compute, and every LLM row carries both a
    Price in Tokens and a Price in Neurons for M input, M cached input (when the model has cache
    pricing), and M output tokens. (https://developers.cloudflare.com/workers-ai/platform/pricing/)
21. Cloudflare examples per 1M tokens: @cf/zai-org/glm-5.3-flash $0.150 input / $0.030 cached /
    $0.500 output (13636/2727/45455 neurons); @cf/deepseek-ai/deepseek-v4.1-flash-1017
    $0.300/$0.006/$1.200; @cf/deepseek-ai/deepseek-v4-pro-0813 $1.320/$0.044/$3.960;
    @cf/meta/llama-3.3-70b-instruct-fp8-fast $0.293 input / $2.253 output with no cached column;
    embeddings price per M input tokens only, image models per 512x512 tile and per step, audio
    models per audio minute. (https://developers.cloudflare.com/workers-ai/platform/pricing/)
22. Gemini's paid tier table rows are Input price, Output price (including thinking tokens), Context
    caching price, and a cache storage price per 1M tokens per hour; Gemini 3.1 Pro Preview: input
    $2.00 for prompts <= 200k tokens and $4.00 above, output $12.00/$18.00, cache $0.20/$0.40 plus
    $4.50 per 1M tokens per hour storage. (https://ai.google.dev/gemini-api/docs/pricing)
23. Gemini 2.5 Pro: input $1.25 <= 200k / $2.50 > 200k, output $10.00/$15.00, cache $0.125/$0.25
    plus $4.50 storage; Gemini 2.5 Flash: input $0.30 (text/image/video) and $1.00 (audio), output
    $2.50, cache $0.03 plus $1.00 storage; Batch API gives a 50 percent cost reduction on the Paid
    tier. (https://ai.google.dev/gemini-api/docs/pricing)
24. Gemini tool and agent billing: code execution bills at the model's standard token rates with
    results as output tokens when created and input tokens when reused in reasoning; file search
    embeddings are $0.15 per 1M tokens with retrieved document tokens charged as regular tokens;
    grounding for Gemini 2.5 models is 1,500 RPD free then $35 per 1,000 grounded prompts, and
    Gemini 3 and newer is 5,000 free search requests per month then $14 per 1,000 requests; Deep
    Research and managed agents bill standard list rates including intermediate reasoning tokens.
    (https://ai.google.dev/gemini-api/docs/pricing)
25. Gemini PDFs (DOCUMENT modality) are billed at the image token rate and appear under DOCUMENT in
    `promptTokensDetails`; retrieved grounding context is not charged as input tokens, while URL
    context and File Search retrieved tokens are. (https://ai.google.dev/gemini-api/docs/pricing)
26. Gemini prices are time-boxed: Gemini 4 Argon input $2.00 and output $10.00 through November 30,
    2026, then $4.00/$20.00; several models carry rates "through December 31, 2026" with higher
    rates starting January 1, 2027; the page states Last updated 2026-10-27 UTC.
    (https://ai.google.dev/gemini-api/docs/pricing)

## Extracts that matter

Anthropic cache pricing multipliers (https://docs.anthropic.com/en/docs/about-claude/pricing):

```
| Cache operation | Multiplier | Duration |
| --- | --- | --- |
| 5-minute cache write | 1.25x base input price | Cache valid for 5 minutes |
| 1-hour cache write | 2x base input price | Cache valid for 1 hour |
| Cache read (hit) | 0.1x base input price (0.025x on Claude Fable 5.1 and
Claude Mythos 5.1; 0.05x on Claude Opus 5.5 and Claude Sonnet 5.5) |
Same duration as the preceding write |
```

Anthropic usage fields and the total-input formula
(https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching):

```
total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens
- cache_read_input_tokens: Tokens retrieved from cache
- cache_creation_input_tokens: New tokens being written to cache (at cache breakpoints)
- input_tokens: Tokens after the last cache breakpoint that aren't cached
"cache_creation": { "ephemeral_5m_input_tokens": 148, "ephemeral_1h_input_tokens": 100 }
"server_tool_use": { "web_search_requests": 1 }
"usage": { "input_tokens": 2048, "cache_read_input_tokens": 1800,
           "cache_creation_input_tokens": 248, "output_tokens": 503 }
```

Anthropic cache invalidation table, transcribed (source marks the two states with symbols; here
invalid = the source's cross, valid = the source's check)
(https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching):

```
| What changes | Tools cache | System cache | Messages cache |
| Tool definitions | invalid | invalid | invalid |
| Web search toggle | valid | invalid | invalid |
| Citations toggle | valid | invalid | invalid |
| Speed setting | valid | invalid | invalid |
| Tool choice | valid | valid | invalid |
| Images | valid | valid | invalid |
| Thinking parameters | model-specific | model-specific | invalid |
```

OpenAI Standard-tier flagship table, prices per 1M tokens
(https://platform.openai.com/docs/pricing):

```
| Model | Input | Output | Cached input | 30m write | 12h write |
| gpt-6-astra | $10.00 | $50.00 | $1.00 | $12.50 | $25.00 |
| gpt-6.1-sol | $2.00 | $10.00 | $0.10 | $2.50 | $5.00 |
| gpt-6.1-terra | $1.00 | $5.00 | $0.05 | $1.25 | $2.50 |
| gpt-6-luna | $0.10 | $0.50 | $0.01 | $0.125 | $0.25 |
Flex/Batch rows halve every figure; Ultrafast gpt-6-astra is $60.00/$300.00.
```

DeepSeek price rows, units per 1M tokens (https://api-docs.deepseek.com/quick_start/pricing):

```
| PRICING | deepseek-flash | deepseek-v4-pro |
| 1M INPUT TOKENS (CACHE HIT) | OFF-PEAK $0.003 | OFF-PEAK $0.022 |
|                             | PEAK $0.006     | PEAK $0.044 |
| 1M INPUT TOKENS (CACHE MISS) | OFF-PEAK $0.15 | OFF-PEAK $0.66 |
|                              | PEAK $0.3      | PEAK $1.32 |
| 1M OUTPUT TOKENS | OFF-PEAK $0.6 | OFF-PEAK $1.98 |
|                  | PEAK $1.2     | PEAK $3.96 |
Peak hours are 01:00 - 04:00 and 06:00 - 10:00 UTC, Monday through Friday.
```

Cloudflare dual pricing, one model row verbatim from the three-column table
(https://developers.cloudflare.com/workers-ai/platform/pricing/):

```
$0.011 per 1,000 Neurons; free allocation 10,000 Neurons per day, reset daily at 00:00 UTC.
| @cf/zai-org/glm-5.3-flash |
  $0.150 per M input tokens $0.030 per M cached input tokens $0.500 per M output tokens |
  13636 neurons per M input tokens 2727 neurons per M cached input tokens
  45455 neurons per M output tokens |
```

Gemini 3.1 Pro Preview paid-tier rows, per 1M tokens
(https://ai.google.dev/gemini-api/docs/pricing):

```
| Input price | $2.00, prompts <= 200k tokens | $4.00, prompts > 200k tokens |
| Output price (including thinking tokens) | $12.00, prompts <= 200k tokens |
                                            | $18.00, prompts > 200k |
| Context caching price | $0.20, prompts <= 200k tokens | $0.40, prompts > 200k
  | $4.50 / 1,000,000 tokens per hour (storage price) |
Gemini 2.5 Pro: $1.25/$10.00 <= 200k, $2.50/$15.00 > 200k, cache $0.125/$0.25 + $4.50.
Gemini 2.5 Flash: $0.30 (text/image/video) $1.00 (audio) in, $2.50 out, cache $0.03 + $1.00.
```

## Open questions

- OpenAI's page names the cached-input and cache-write buckets but never shows the usage JSON; field
  names such as `prompt_tokens_details.cached_tokens` and
  `completion_tokens_details.reasoning_tokens` live in the API reference, which was not fetched.
- Several Anthropic model rows lost their name cells in conversion (the "Additional models" block
  shows prices with empty model names), so mapping those price rows to model IDs needs the live
  table or per-model docs.
- DeepSeek's page lists only deepseek-flash and deepseek-v4-pro; legacy names are said to route to
  flash at flash pricing, but no separate price rows for older models exist on the page.
- Cloudflare shows a token price and a neuron price side by side; the conversion rule between the
  two (neurons per M token) is implicit per row and never stated as a formula.
- Gemini marks some models "Implicit caching only (explicit caching is not supported)", so the
  per-model explicit-cache support matrix is only implied and must be confirmed per model before
  modeling writes.
- None of the six pages documents a general token-counting endpoint except Anthropic's token
  counting reference; per-file token estimates elsewhere need provider tokenizers, and Anthropic
  warns the 4.7+ tokenizer inflates counts about 30 percent.
- Time-boxed pricing (Gemini promo deadlines, DeepSeek peak windows) means any static price table
  goes stale; the note's facts are anchored to fetch date 2026-10-27 and need re-verification.
- The OpenAI pricing page sits on platform.openai.com but its navigation links point at
  developers.openai.com/api/..., so the canonical URL may migrate; the fetched URL worked and
  returned the tables above.
