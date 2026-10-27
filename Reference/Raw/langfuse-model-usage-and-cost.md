We value your privacy We use cookies to enhance your browsing experience, serve personalised ads or
content, and analyse our traffic. By clicking "Accept All", you consent to our use of cookies.
Customise Reject All Accept All Customise Consent Preferences We use cookies to help you navigate
efficiently and perform certain functions. You will find detailed information about all cookies
under each consent category below. The cookies that are categorised as "Necessary" are stored on
your browser as they are essential for enabling the basic functionalities of the site. ... Show more
NecessaryAlways Active Necessary cookies are required to enable the basic features of this site,
such as providing secure log-in or adjusting your consent preferences. These cookies do not store
any personally identifiable data.

- Cookie __Secure-next-auth.csrf-token.EU
- Duration session
- Description Description is currently not available.

- Cookie __Secure-next-auth.callback-url.EU
- Duration session
- Description Description is currently not available.

- Cookie __Secure-next-auth.csrf-token.US
- Duration session
- Description Description is currently not available.

- Cookie __Secure-next-auth.callback-url.US
- Duration session
- Description Description is currently not available.

- Cookie __cf_bm
- Duration 1 hour
- Description This cookie, set by Cloudflare, is used to support Cloudflare Bot Management.

- Cookie __hssrc
- Duration session
- Description This cookie is set by Hubspot whenever it changes the session cookie. The __hssrc
  cookie set to 1 indicates that the user has restarted the browser, and if the cookie does not
  exist, it is assumed to be a new session.

- Cookie __hssc
- Duration 1 hour
- Description HubSpot sets this cookie to keep track of sessions and to determine if HubSpot should
  increment the session number and timestamps in the __hstc cookie.

- Cookie __Secure-next-auth.csrf-token.HIPAA
- Duration session
- Description Description is currently not available.

- Cookie __Secure-next-auth.callback-url.HIPAA
- Duration session
- Description Description is currently not available.

- Cookie __Secure-next-auth.csrf-token.JP
- Duration session
- Description Description is currently not available.

- Cookie __Secure-next-auth.callback-url.JP
- Duration session
- Description Description is currently not available.

- Cookie theme
- Duration Never Expires
- Description No description available.

- Cookie cookietest
- Duration session
- Description The cookietest cookie is typically used to determine whether the user's browser
  accepts cookies, essential for website functionality and user experience.

- Cookie cookieyes-*
- Duration 1 year
- Description CookieYes sets this cookie for consent solution management.

Functional Functional cookies help perform certain functionalities like sharing the content of the
website on social media platforms, collecting feedback, and other third-party features.

- Cookie inkeepUsagePreferences_userId
- Duration 1 year
- Description Description is currently not available.

- Cookie _octo
- Duration 1 year
- Description No description available.

- Cookie logged_in
- Duration 1 year
- Description No description available.

Analytics Analytical cookies are used to understand how visitors interact with the website. These
cookies help provide information on metrics such as the number of visitors, bounce rate, traffic
source, etc.

- Cookie ph_phc_zkMwFajk8ehObUlMth0D7DtPItFnxETi3lmSvyQDrwB_posthog
- Duration 1 year
- Description Description is currently not available.

- Cookie __hstc
- Duration 6 months
- Description Hubspot set this main cookie for tracking visitors. It contains the domain, initial
  timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session
  number (increments for each subsequent session).

- Cookie hubspotutk
- Duration 6 months
- Description HubSpot sets this cookie to keep track of the visitors to the website. This cookie is
  passed to HubSpot on form submission and used when deduplicating contacts.

- Cookie _gh_sess
- Duration session
- Description GitHub sets this cookie for temporary application and framework state between pages
  like what step the user is on in a multiple step form.

Performance Performance cookies are used to understand and analyse the key performance indexes of
the website which helps in delivering a better user experience for the visitors.

- Cookie __sdcfduid
- Duration 5 years
- Description Stores a unique browser identifier to help Discord detect malicious activity, enforce
  security protections, manage traffic, and maintain service performance.

- Cookie __dcfduid
- Duration 5 years
- Description Enables Discord to uniquely identify your device, enhance account security, prevent
  spam and abuse, and support diagnostics across browsing sessions.

Advertisement Advertisement cookies are used to provide visitors with customised advertisements
based on the pages you visited previously and to analyse the effectiveness of the ad campaigns. No
cookies to display. Uncategorised Other uncategorised cookies are those that are being analysed and
have not been classified into a category as yet. No cookies to display. Reject All Save My
Preferences Accept All DocsToken & Cost Tracking
[Docs](https://langfuse.com/docs)[Observability](https://langfuse.com/docs/observability/overview)[Features](https://langfuse.com/docs/observability/features/sessions)[Token & Cost Tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking)

# [Model Usage & Cost Tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking#model-usage--cost-tracking)

Langfuse tracks the usage and cost of every LLM call in your application, so you can monitor spend
across models, use cases, and over time. For most users, cost tracking works out of the box.
Langfuse ships with prices for popular models from OpenAI, Anthropic, and Google, and most
[integrations](https://langfuse.com/integrations) capture usage and cost automatically, so in most
cases you don't need to configure anything.

## [What you can do with cost data](https://langfuse.com/docs/observability/features/token-and-cost-tracking#use-cost-data)

Once usage and cost are tracked, you can put the data to work:

- monitor cost across models, tags, or users.
- get notified automatically when spend crosses a threshold.
- retrieve aggregated usage and cost, filtered by application type, user, or tags, for analytics,
  billing, and rate-limiting.

## [How cost tracking works](https://langfuse.com/docs/observability/features/token-and-cost-tracking#how-it-works)

For every LLM generation, Langfuse records two things, each broken down by **usage type** (for
example `input` and `output`, or more specific types like `cached_tokens` and `audio_tokens` that
vary by provider):

- **Usage details** : number of units consumed per usage type
- **Cost details** : USD cost per usage type

Both are captured on observations of
[type](https://langfuse.com/docs/observability/features/observation-types) `generation` and
`embedding`, and each can be either:

- [**Ingested**](https://langfuse.com/docs/observability/features/token-and-cost-tracking#ingest):
  you send the usage and cost from the LLM response, via the API, SDKs, or an integration.
- [**Inferred**](https://langfuse.com/docs/observability/features/token-and-cost-tracking#infer):
  Langfuse works them out from the generation's `model` parameter, using a model definition that
  stores prices per usage type. Langfuse ships with definitions for popular OpenAI, Anthropic, and
  Google models, and you can
  [add your own](https://langfuse.com/docs/observability/features/token-and-cost-tracking#custom-model-definitions).

When both are available, **ingested values take priority** over inferred ones:

```
%% flowchart-v2 diagram
Yes
No
multiply by usage
Ingested Observation
Usage (tokens or other unit)
Cost (in USD)
Includes usage?
Use tokenizer
Includes cost?
Use model price/unit
```

## [Model definitions and prices](https://langfuse.com/docs/observability/features/token-and-cost-tracking#infer)

When cost is not ingested directly, Langfuse infers it. The `model` parameter of the generation is
matched to a **model definition** , which stores a price per usage type. Langfuse then multiplies
those prices by the observation's usage to calculate cost. This is especially useful for model
providers or self-hosted models that do not include cost in the response. Langfuse comes with a
**list of predefined popular models and their tokenizers** including **OpenAI, Anthropic, Google**.
Check out the [full list](https://cloud.langfuse.com/project/~/models) (you need to sign in). You
can manage prices in **Project Settings > Models**, add your own
[custom model definitions](https://langfuse.com/docs/observability/features/token-and-cost-tracking#custom-model-definitions),
or request official support for new models via [GitHub](https://langfuse.com/issue). If a tokenizer
is specified for the model, Langfuse automatically calculates token amounts for ingested
generations. The following tokenizers are currently supported:

| Model                                                                                                                                                                               | Tokenizer     | Used package                                                                                                                          | Comment |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `gpt-4o`                                                                                                                                                                            | `o200k_base`  |
| `gpt*`                                                                                                                                                                              | `cl100k_base` |
| `claude*`                                                                                                                                                                           | `claude`      | According to Anthropic, their tokenizer is not accurate for Claude 3 models. If possible, send us the tokens from their API response. |
| Model definitions include prices per usage type. Usage types must match exactly with the keys in the `usage_details` object of the generation.                                      |
| Langfuse automatically calculates cost for ingested generations at the time of ingestion if (1) usage is ingested or inferred, (2) and a matching model definition includes prices. |

### [Adding custom model definitions](https://langfuse.com/docs/observability/features/token-and-cost-tracking#custom-model-definitions)

You can flexibly add your own model definitions (incl.
[pricing tiers](https://langfuse.com/docs/observability/features/token-and-cost-tracking#pricing-tiers))
to Langfuse. This is especially useful for self-hosted or fine-tuned models which are not included
in the list of Langfuse maintained models. Langfuse UIAPI To add a custom model definition in the
Langfuse UI, you can either click on the "+" sign next to the model name or navigate to the
**Project Settings > Models** to add a new model definition. Then you can add the prices per token
type and save the model definition. Now all **new traces** with this model will have the correct
token usage and cost inferred. Model definitions can also be managed programmatically via the Models
[API](https://langfuse.com/docs/api):

```
GET    /api/public/models
POST   /api/public/models
GET    /api/public/models/{id}
DELETE /api/public/models/{id}
```

Models are matched to generations based on:

| Generation Attribute                                                                                                                                                                                                                                                                                                                                                                             | Model Attribute | Notes                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------- |
| `model`                                                                                                                                                                                                                                                                                                                                                                                          | `match_pattern` | Uses regular expressions, e.g. `(?i)^(gpt-4-0125-preview)$` matches `gpt-4-0125-preview`. |
| User-defined models take priority over models maintained by Langfuse.                                                                                                                                                                                                                                                                                                                            |
| When using the `openai` tokenizer, you need to specify the following tokenization config. You can also copy the config from the list of predefined OpenAI models. See the OpenAI [documentation](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb) for further details. `tokensPerName` and `tokensPerMessage` are required for chat models. |

```

tokenizerModel": "gpt-3.5-turbo", // tiktoken model name
tokensPerName": -1, // OpenAI Chatmessage tokenization config
tokensPerMessage": 4 // OpenAI Chatmessage tokenization config

```

### [Pricing Tiers](https://langfuse.com/docs/observability/features/token-and-cost-tracking#pricing-tiers)

Some model providers charge different rates depending on context length or request attributes. For
example, Anthropic's Claude Sonnet 4.5 and Google's Gemini 2.5 Pro apply higher pricing when more
than 200K input tokens are used, while
[OpenAI Fast mode](https://developers.openai.com/api/docs/guides/fast-mode) charges a premium based
on the request's `service_tier`. Langfuse supports **pricing tiers** for models, enabling accurate
cost calculation across usage thresholds, model parameters, and metadata.

#### [How tier matching works](https://langfuse.com/docs/observability/features/token-and-cost-tracking#how-tier-matching-works)

Each model can have multiple pricing tiers, each with:

| Field                                                                                                                                                                                                                                                                                                                                  | Description                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**                                                                                                                                                                                                                                                                                                                               | A descriptive name (e.g., "Standard", "Large Context")                                                                                                                                        |
| **Priority**                                                                                                                                                                                                                                                                                                                           | Evaluation order (0 is reserved for default tier)                                                                                                                                             |
| **Conditions**                                                                                                                                                                                                                                                                                                                         | Rules that determine when the tier applies                                                                                                                                                    |
| **Prices**                                                                                                                                                                                                                                                                                                                             | Cost per usage type for this tier                                                                                                                                                             |
| When calculating cost, Langfuse evaluates tiers in priority order (excluding the default tier). The first tier whose conditions are satisfied is used. If no conditional tier matches, the default tier is applied.                                                                                                                    |
| Each condition selects one of these sources:                                                                                                                                                                                                                                                                                           |
| Source                                                                                                                                                                                                                                                                                                                                 | How it matches                                                                                                                                                                                |
| ---                                                                                                                                                                                                                                                                                                                                    | ---                                                                                                                                                                                           |
| **Usage details**                                                                                                                                                                                                                                                                                                                      | Match usage-detail keys with a regex, sum their values, and compare the result with `gt`, `gte`, `lt`, `lte`, `eq`, or `neq`. You can also control whether the key pattern is case-sensitive. |
| **Model parameters**                                                                                                                                                                                                                                                                                                                   | Match a top-level model-parameter key against one or more exact values.                                                                                                                       |
| **Metadata**                                                                                                                                                                                                                                                                                                                           | Match a top-level metadata key against one or more exact values.                                                                                                                              |
| For model parameters and metadata, select the source in the pricing-tier editor, enter the **Top-level key** , and add comma-separated exact values. String, number, and boolean values are compared as strings. Nested paths and non-primitive values are not supported. When a tier has multiple conditions, all of them must match. |
| Examples:                                                                                                                                                                                                                                                                                                                              |
| Claude Sonnet Large context tierOpenAI Fast mode                                                                                                                                                                                                                                                                                       |
| The "Large Context" tier for Claude Sonnet 4.5 has a condition: `input > 200000`, meaning it applies when the sum of all usage details matching the pattern "input" exceeds 200,000 tokens.                                                                                                                                            |
| OpenAI Fast mode tiers match the top-level model parameter `service_tier` against `fast` or `priority`. For GPT-5.6 models, this condition is combined with the input-token threshold to distinguish Standard/Fast and short/long-context prices.                                                                                      |

### [Frequently asked questions](https://langfuse.com/docs/observability/features/token-and-cost-tracking#faq)

How does Langfuse keep default model prices up to date? + Langfuse maintains its
[default model definitions](https://github.com/langfuse/langfuse/blob/main/worker/src/constants/default-model-prices.json)
in the open-source repository. A
[daily automated audit](https://github.com/langfuse/langfuse/actions/workflows/model-price-audit.yml)
checks official provider sources for changed prices, pricing tiers, usage-key mappings, and newly
released major models. The audit follows an evidence-first workflow:

1. It verifies model IDs, prices, units, usage keys, and pricing tiers against official provider
   documentation.
2. It makes focused changes only when the provider evidence can be represented safely in Langfuse.
   Uncertain findings are reported without changing the defaults.
3. It validates the pricing data and any changed model-matching patterns.
4. When changes are needed, a pull request is opened, and the updated prices are deployed shortly
   after approval.

This process keeps the default definitions current without relying on a third-party pricing
aggregator. Because inferred costs are calculated at ingestion time, updated defaults apply only to
new generations. If you need support for a model immediately or use private pricing, add a
[custom model definition](https://langfuse.com/docs/observability/features/token-and-cost-tracking#custom-model-definitions)
or
[ingest the cost directly](https://langfuse.com/docs/observability/features/token-and-cost-tracking#ingest).
Why doesn't Langfuse infer cost for reasoning models like OpenAI o1? + Cost inference by tokenizing
the LLM input and output is not supported for reasoning models such as the OpenAI o1 model family.
That is, if no token counts are ingested, Langfuse cannot infer cost for reasoning models. Reasoning
models take multiple steps to arrive at a response. The result from each step generates reasoning
tokens that are billed as output tokens. So the cost-effective output token count is the sum of all
reasoning tokens and the token count for the final completion. Since Langfuse does not have
visibility into the reasoning tokens, it cannot infer the correct cost for generations that have no
token usage provided. To benefit from Langfuse cost tracking, please provide the token usage when
ingesting o1 model generations. When utilizing the
[Langfuse OpenAI wrapper](https://langfuse.com/integrations/model-providers/openai-py) or
integrations such as for [Langchain](https://langfuse.com/integrations/frameworks/langchain),
[LlamaIndex](https://langfuse.com/integrations/frameworks/llamaindex) or
[LiteLLM](https://langfuse.com/integrations/gateways/litellm), token usage is collected and provided
automatically for you. For more details, see
[the OpenAI guide](https://platform.openai.com/docs/guides/reasoning) on how reasoning models work.
Ask another question

## [Ingest usage and cost manually](https://langfuse.com/docs/observability/features/token-and-cost-tracking#ingest)

While Langfuse tracks this data automatically (if it unexpectedly doesn't, open an
[issue](https://langfuse.com/issue) on GitHub), you might want to ingest it yourself in some cases,
for example custom or self-hosted models Langfuse cannot price, private pricing, or exact provider
counts you want recorded verbatim. Python SDKJS/TS SDK

```
from langfuse import get_client
import anthropic

langfuse = get_client()
anthropic_client = anthropic.Anthropic()

with langfuse.start_as_current_observation(
    as_type="generation",
    name="anthropic-completion",
    model="claude-3-opus-20240229",
    input=[{"role": "user", "content": "Hello, Claude"}]
) as generation:
    response = anthropic_client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello, Claude"}]


    generation.update(
        output=response.content[0].text,
        usage_details={
            "input": response.usage.input_tokens,
            "output": response.usage.output_tokens,
            "cache_read_input_tokens": response.usage.cache_read_input_tokens
            # "total": int,  # if not set, it is derived as the sum of all usage types

        # Optionally, also ingest USD cost. Alternatively, infer it via a model definition in Langfuse.
        cost_details={
            # Here we assume the input and output cost are 1 USD each and half the price for cached tokens.
            "input": 1,
            "cache_read_input_tokens": 0.5,
            "output": 1,
            # "total": float, # if not set, it is derived as the sum of all usage types


```

```
import { startObservation } from "@langfuse/tracing";

const generation = startObservation(
  "llm-call",

    model: "gpt-4",
    input: [{ role: "user", content: "What is the capital of France?" }],

asType: "generation" }


// ... LLM call logic ...

generation.update({
  usageDetails: {
    input: 10,
    output: 5,
    cache_read_input_tokens: 2,
    some_other_token_count: 10,
    total: 27, // optional, it is derived as the sum of all usage types

  costDetails: {
    // Optional. If omitted, cost is inferred from a model definition.
    input: 1,
    output: 1,
    cache_read_input_tokens: 0.5,
    some_other_token_count: 1,
    total: 3.5,

  output: { content: "The capital of France is Paris." },


generation.end();
```

Other ways to attach usage and cost with the SDK + You can set `usage_details` and `cost_details`
from any observation style, not just manual generations. Python SDKJS/TS SDK When using the
`@observe()` decorator:

```
from langfuse import observe, get_client
import anthropic

langfuse = get_client()
anthropic_client = anthropic.Anthropic()

@observe(as_type="generation")
def anthropic_completion(**kwargs):
  # optional, extract some fields from kwargs
  kwargs_clone = kwargs.copy()
  input = kwargs_clone.pop('messages', None)
  model = kwargs_clone.pop('model', None)
  langfuse.update_current_generation(
      input=input,
      model=model,
      metadata=kwargs_clone


  response = anthropic_client.messages.create(**kwargs)

  langfuse.update_current_generation(
      usage_details={
          "input": response.usage.input_tokens,
          "output": response.usage.output_tokens,
          "cache_read_input_tokens": response.usage.cache_read_input_tokens

      cost_details={
          "input": 1,
          "cache_read_input_tokens": 0.5,
          "output": 1,



  # return result
  return response.content[0].text

@observe()
def main():
  return anthropic_completion(
      model="claude-3-opus-20240229",
      max_tokens=1024,
      messages=[
"role": "user", "content": "Hello, Claude"}



main()
```

When using the context manager:

```
import { startActiveObservation, startObservation } from "@langfuse/tracing";

await startActiveObservation("context-manager", async (span) => {
  span.update({
    input: { query: "What is the capital of France?" },


  const generation = startObservation(
    "llm-call",

      model: "gpt-4",
      input: [{ role: "user", content: "What is the capital of France?" }],

asType: "generation" }


  // ... LLM call logic ...

  generation.update({
    usageDetails: { input: 10, output: 5, total: 15 },
    costDetails: { input: 1, output: 1, total: 2 },
    output: { content: "The capital of France is Paris." },


  generation.end();

```

When using the `observe` wrapper:

```
import { observe, updateActiveObservation } from "@langfuse/tracing";

async function fetchData(source: string) {
  updateActiveObservation(

      usageDetails: { input: 10, output: 5, total: 15 },
      costDetails: { input: 1, output: 1, total: 2 },

asType: "generation" }


  // ... logic to fetch data
  returndata: `some data from ${source}` };


const tracedFetchData = observe(fetchData, {
  name: "observe-wrapper",
  asType: "generation",


const result = await tracedFetchData("API");
```

You can also update usage and cost later via `generation.update()`.

### [Usage types are mutually exclusive buckets](https://langfuse.com/docs/observability/features/token-and-cost-tracking#usage-details-contract)

Langfuse treats every key in `usage_details` as a separate, non-overlapping bucket: each token must
be counted in exactly one key. This means that

- `input` excludes any `input_*` values (such as `input_cached_tokens`)
- `output` excludes any `output_*` values (such as `output_reasoning_tokens`)

`total` is the sum of the buckets, not a bucket itself. If buckets overlap, usage and inferred cost
will be counted double, and cost shown in Langfuse overstates what your provider actually charged.
Directly ingested `cost_details` are unchanged. Be careful with inclusive provider counts Some
provider counts are inclusive. For example, OpenAI input counts include cached tokens. **Inclusive
counts must be converted into exclusive buckets before they are stored.** For example, an
OpenAI-style response with 17,903 prompt tokens (of which 17,817 were cache hits) and 188 completion
tokens:

| Provider reports (inclusive)                      | Stored in Langfuse (exclusive) |
| ------------------------------------------------- | ------------------------------ |
| `prompt_tokens: 17903`                            | `input: 86`                    |
| `prompt_tokens_details: { cached_tokens: 17817 }` | `input_cached_tokens: 17817`   |
| `completion_tokens: 188`                          | `output: 188`                  |
| `total_tokens: 18091`                             | `total: 18091`                 |

#### [When Langfuse normalizes usage](https://langfuse.com/docs/observability/features/token-and-cost-tracking#usage-details-normalization)

| Usage source                                                                                                                      | Handling                                           |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Langfuse integrations and SDK wrappers, such as the [OpenAI wrapper](https://langfuse.com/integrations/model-providers/openai-py) | Normalized automatically                           |
| OpenTelemetry `gen_ai.usage.*` or `llm.token_count.*`                                                                             | Cache reads and writes are subtracted from `input` |
| Normalized only when it contains OpenAI usage fields; extra keys make it flat usage                                               |
| Flat `usage_details` / `usageDetails`, including `langfuse.observation.usage_details`                                             | Stored unchanged; values must already be exclusive |

### [Compatibility with OpenAI](https://langfuse.com/docs/observability/features/token-and-cost-tracking#openai-usage-schema)

For increased compatibility with OpenAI, you can also use the OpenAI Usage schema. Langfuse maps its
fields to its own usage types:

| OpenAI field                                                                                                                                                                                                                                                                                                                                                                                                                                 | Langfuse usage type |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `prompt_tokens`                                                                                                                                                                                                                                                                                                                                                                                                                              | `input`             |
| `completion_tokens`                                                                                                                                                                                                                                                                                                                                                                                                                          | `output`            |
| `total_tokens`                                                                                                                                                                                                                                                                                                                                                                                                                               | `total`             |
| `prompt_tokens_details.*`                                                                                                                                                                                                                                                                                                                                                                                                                    | `input_*`           |
| `completion_tokens_details.*`                                                                                                                                                                                                                                                                                                                                                                                                                | `output_*`          |
| Since OpenAI reports the detail counts inclusively, Langfuse subtracts them from `input` and `output` respectively, so that the stored buckets are [mutually exclusive](https://langfuse.com/docs/observability/features/token-and-cost-tracking#usage-details-contract).                                                                                                                                                                    |
| Schema recognition is strict: the usage object must contain **only** the OpenAI usage fields shown below. If it includes any additional key (for example, some gateways append a `cost` field), it is not recognized as OpenAI-style usage and is instead stored verbatim as [flat keys](https://langfuse.com/docs/observability/features/token-and-cost-tracking#usage-details-contract) — without the mapping and without the subtraction. |
| Python SDKJS/TS SDK                                                                                                                                                                                                                                                                                                                                                                                                                          |

```
from langfuse import get_client

langfuse = get_client()

with langfuse.start_as_current_observation(
    as_type="generation",
    name="openai-style-generation",
    model="gpt-4o"
) as generation:
    # Simulate LLM call
    # response = openai_client.chat.completions.create(...)

    generation.update(
        usage_details={
            # usage (OpenAI-style schema)
            "prompt_tokens": 10,
            "completion_tokens": 25,
            "total_tokens": 35,
            "prompt_tokens_details": {
                "cached_tokens": 5,
                "audio_tokens": 2,

            "completion_tokens_details": {
                "reasoning_tokens": 15,



```

```
import { startObservation } from "@langfuse/tracing";

const generation = startObservation(
  "openai-style-generation",

    model: "gpt-4o",
    usageDetails: {
      // usage (OpenAI-style schema)
      prompt_tokens: 10,
      completion_tokens: 25,
      total_tokens: 35,
      prompt_tokens_details: {
        cached_tokens: 5,
        audio_tokens: 2,

      completion_tokens_details: {
        reasoning_tokens: 15,



asType: "generation" },

generation.end();
```

You can also ingest OpenAI-style usage via `generation.update()` and `generation.end()`.

## [Troubleshooting](https://langfuse.com/docs/observability/features/token-and-cost-tracking#troubleshooting)

If you don't see cost on your generations, check the following:

- **Usage or cost must be present.** Langfuse can only infer cost if usage is ingested or a
  tokenizer is available for the model. If neither cost nor usage is ingested and the model has no
  tokenizer, no cost is calculated.
- **The model must match a definition.** Inferred cost requires a model definition whose
  `match_pattern` matches the generation's `model` value. If no model matches, add a
  [custom model definition](https://langfuse.com/docs/observability/features/token-and-cost-tracking#custom-model-definitions).
- **Model definition changes only apply to new generations.** If you change or add a model
  definition, the updated costs are applied only to generations logged afterward.
- **Only`generation` and `embedding` observations track cost.** Other observation types do not carry
  usage or cost.
- **Reasoning models require ingested usage.** Langfuse cannot infer cost for reasoning models such
  as the OpenAI o1 family without token counts. See
  [cost inference for reasoning models](https://langfuse.com/docs/observability/features/token-and-cost-tracking#cost-inference-for-reasoning-models).
- **Gateways:** If you use
  [OpenRouter](https://langfuse.com/integrations/gateways/openrouter#cost-tracking), Langfuse can
  directly capture the OpenRouter cost information. If you use LiteLLM, Langfuse directly captures
  the cost information returned in each LiteLLM response.

## [GitHub Discussions](https://langfuse.com/docs/observability/features/token-and-cost-tracking#github-discussions)

GitHubSupportGitHubIdeas Upvotes [GitHub](https://github.com/orgs/langfuse/discussions/new/choose)
No discussions found. Discussions last updated: 10/27/2026, 12:18:18 PM (3 hours ago) Was this page
helpful? Last updated on 9/23/2026
[PreviousSampling](https://langfuse.com/docs/observability/features/sampling)[NextTrace URLs](https://langfuse.com/docs/observability/features/url)

### On this page

[Model Usage & Cost Tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking#model-usage--cost-tracking)[What you can do with cost data](https://langfuse.com/docs/observability/features/token-and-cost-tracking#use-cost-data)[How cost tracking works](https://langfuse.com/docs/observability/features/token-and-cost-tracking#how-it-works)[Model definitions and prices](https://langfuse.com/docs/observability/features/token-and-cost-tracking#infer)[Usage](https://langfuse.com/docs/observability/features/token-and-cost-tracking#usage)[Cost](https://langfuse.com/docs/observability/features/token-and-cost-tracking#cost)[Adding custom model definitions](https://langfuse.com/docs/observability/features/token-and-cost-tracking#custom-model-definitions)[Pricing Tiers](https://langfuse.com/docs/observability/features/token-and-cost-tracking#pricing-tiers)[How tier matching works](https://langfuse.com/docs/observability/features/token-and-cost-tracking#how-tier-matching-works)[Frequently asked questions](https://langfuse.com/docs/observability/features/token-and-cost-tracking#faq)[Ingest usage and cost manually](https://langfuse.com/docs/observability/features/token-and-cost-tracking#ingest)[Usage types are mutually exclusive buckets](https://langfuse.com/docs/observability/features/token-and-cost-tracking#usage-details-contract)[When Langfuse normalizes usage](https://langfuse.com/docs/observability/features/token-and-cost-tracking#usage-details-normalization)[Compatibility with OpenAI](https://langfuse.com/docs/observability/features/token-and-cost-tracking#openai-usage-schema)[Troubleshooting](https://langfuse.com/docs/observability/features/token-and-cost-tracking#troubleshooting)[GitHub Discussions](https://langfuse.com/docs/observability/features/token-and-cost-tracking#github-discussions)
Actions
[Give us feedback](https://github.com/langfuse/langfuse-docs/issues/new?title=Feedback+for+https%3A%2F%2Flangfuse.com%2Fdocs%2Fobservability%2Ffeatures%2Ftoken-and-cost-tracking&labels=feedback)[Edit this page on GitHub](https://github.com/langfuse/langfuse-docs/edit/main/content/docs/observability/features/token-and-cost-tracking.mdx)
Contributors Last edited Sep 23, 2026
[Jannik Maierhöfer](https://github.com/jannikmaierhoefer)[Lotte Verheyden](https://github.com/Lotte-Verheyden)[Hassieb Pakzad](https://github.com/hassiebp)+5
more `Ask AI``A`
