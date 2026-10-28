# Gen AI

- [GenAI Attributes (Moved)](#genai-attributes-moved)
- [Deprecated GenAI Attributes](#deprecated-genai-attributes)
- [Deprecated OpenAI GenAI Attributes](#deprecated-openai-genai-attributes)

## GenAI Attributes (Moved)[](#genai-attributes-moved)

Generative AI (GenAI) attributes have moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).

**Attributes:**

| Key | Stability | Value Type | Description | Example Values |
|----|----|----|----|----|
| [`gen_ai.agent.description`](#gen-ai-agent-description) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Free-form description of the GenAI agent provided by the application. | `Helps with math problems`; `Generates fiction stories` |
| [`gen_ai.agent.id`](#gen-ai-agent-id) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The unique identifier of the GenAI agent. | `asst_5j66UpCpwteGg4YSxUnt7lPY` |
| [`gen_ai.agent.name`](#gen-ai-agent-name) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Human-readable name of the GenAI agent provided by the application. | `Math Tutor`; `Fiction Writer` |
| [`gen_ai.agent.version`](#gen-ai-agent-version) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The version of the GenAI agent. | `1.0.0`; `2025-05-01` |
| [`gen_ai.conversation.id`](#gen-ai-conversation-id) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The unique identifier for a conversation (session, thread), used to store and correlate messages within this conversation. | `conv_5j66UpCpwteGg4YSxUnt7lPY` |
| [`gen_ai.data_source.id`](#gen-ai-data-source-id) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The data source identifier. \[1\] | `H7STPQYOND` |
| [`gen_ai.embeddings.dimension.count`](#gen-ai-embeddings-dimension-count) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | The number of dimensions the resulting output embeddings should have. | `512`; `1024` |
| [`gen_ai.evaluation.explanation`](#gen-ai-evaluation-explanation) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | A free-form explanation for the assigned score provided by the evaluator. | `The response is factually accurate but lacks sufficient detail to fully address the question.` |
| [`gen_ai.evaluation.name`](#gen-ai-evaluation-name) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The name of the evaluation metric used for the GenAI response. | `Relevance`; `IntentResolution` |
| [`gen_ai.evaluation.score.label`](#gen-ai-evaluation-score-label) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Human readable label for evaluation. \[2\] | `relevant`; `not_relevant`; `correct`; `incorrect`; `pass`; `fail` |
| [`gen_ai.evaluation.score.value`](#gen-ai-evaluation-score-value) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | double | The evaluation score returned by the evaluator. | `4.0` |
| [`gen_ai.input.messages`](#gen-ai-input-messages) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | any | The chat history provided to the model as an input. \[3\] | \[   {     “role”: “user”,     “parts”: \[       {         “type”: “text”,         “content”: “Weather in Paris?"       }     \]   },   {     “role”: “assistant”,     “parts”: \[       {         “type”: “tool_call”,         “id”: “call_VSPygqKTWdrhaFErNvMV18Yl”,         “name”: “get_weather”,         “arguments”: {           “location”: “Paris”         }       }     \]   },   {     “role”: “tool”,     “parts”: \[       {         “type”: “tool_call_response”,         “id”: " call_VSPygqKTWdrhaFErNvMV18Yl”,         “result”: “rainy, 57°F”       }     \]   } \] |
| [`gen_ai.operation.name`](#gen-ai-operation-name) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The name of the operation being performed. \[4\] | `chat`; `generate_content`; `text_completion` |
| [`gen_ai.output.messages`](#gen-ai-output-messages) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | any | Messages returned by the model where each message represents a specific model response (choice, candidate). \[5\] | \[   {     “role”: “assistant”,     “parts”: \[       {         “type”: “text”,         “content”: “The weather in Paris is currently rainy with a temperature of 57°F."       }     \],     “finish_reason”: “stop”   } \] |
| [`gen_ai.output.type`](#gen-ai-output-type) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Represents the content type requested by the client. \[6\] | `text`; `json`; `image` |
| [`gen_ai.prompt.name`](#gen-ai-prompt-name) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The name of the prompt that uniquely identifies it. | `analyze-code` |
| [`gen_ai.provider.name`](#gen-ai-provider-name) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The Generative AI provider as identified by the client or server instrumentation. \[7\] | `openai`; `gcp.gen_ai`; `gcp.vertex_ai` |
| [`gen_ai.request.choice.count`](#gen-ai-request-choice-count) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | The target number of candidate completions to return. | `3` |
| [`gen_ai.request.encoding_formats`](#gen-ai-request-encoding-formats) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string\[\] | The encoding formats requested in an embeddings operation, if specified. \[8\] | `["base64"]`; `["float", "binary"]` |
| [`gen_ai.request.frequency_penalty`](#gen-ai-request-frequency-penalty) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | double | The frequency penalty setting for the GenAI request. | `0.1` |
| [`gen_ai.request.max_tokens`](#gen-ai-request-max-tokens) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | The maximum number of tokens the model generates for a request. | `100` |
| [`gen_ai.request.model`](#gen-ai-request-model) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The name of the GenAI model a request is being made to. | `gpt-4` |
| [`gen_ai.request.presence_penalty`](#gen-ai-request-presence-penalty) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | double | The presence penalty setting for the GenAI request. | `0.1` |
| [`gen_ai.request.seed`](#gen-ai-request-seed) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | Requests with same seed value more likely to return same result. | `100` |
| [`gen_ai.request.stop_sequences`](#gen-ai-request-stop-sequences) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string\[\] | List of sequences that the model will use to stop generating further tokens. | `["forest", "lived"]` |
| [`gen_ai.request.stream`](#gen-ai-request-stream) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | boolean | Indicates whether the GenAI request was made in streaming mode. |  |
| [`gen_ai.request.temperature`](#gen-ai-request-temperature) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | double | The temperature setting for the GenAI request. | `0.0` |
| [`gen_ai.request.top_k`](#gen-ai-request-top-k) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | double | The top_k sampling setting for the GenAI request. | `1.0` |
| [`gen_ai.request.top_p`](#gen-ai-request-top-p) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | double | The top_p sampling setting for the GenAI request. | `1.0` |
| [`gen_ai.response.finish_reasons`](#gen-ai-response-finish-reasons) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string\[\] | Array of reasons the model stopped generating tokens, corresponding to each generation received. | `["stop"]`; `["stop", "length"]` |
| [`gen_ai.response.id`](#gen-ai-response-id) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The unique identifier for the completion. | `chatcmpl-123` |
| [`gen_ai.response.model`](#gen-ai-response-model) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The name of the model that generated the response. | `gpt-4-0613` |
| [`gen_ai.response.time_to_first_chunk`](#gen-ai-response-time-to-first-chunk) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | double | Time to first chunk in a streaming response, measured from request issuance, in seconds. The value is measured from when the client issues the generation request to when the first chunk is received in the response stream. | `0.5`; `1.2` |
| [`gen_ai.retrieval.documents`](#gen-ai-retrieval-documents) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | any | The documents retrieved. \[9\] | \[   {     “id”: “doc_123”,     “score”: 0.95   },   {     “id”: “doc_456”,     “score”: 0.87   },   {     “id”: “doc_789”,     “score”: 0.82   } \] |
| [`gen_ai.retrieval.query.text`](#gen-ai-retrieval-query-text) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The query text used for retrieval. \[10\] | `What is the capital of France?`; `weather in Paris` |
| [`gen_ai.system_instructions`](#gen-ai-system-instructions) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | any | The system message or instructions provided to the GenAI model separately from the chat history. \[11\] | \[   {     “type”: “text”,     “content”: “You are an Agent that greet users, always use greetings tool to respond”   } \]; \[   {     “type”: “text”,     “content”: “You are a language translator."   },   {     “type”: “text”,     “content”: “Your mission is to translate text in English to French."   } \] |
| [`gen_ai.token.type`](#gen-ai-token-type) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The type of token being counted. | `input`; `output` |
| [`gen_ai.tool.call.arguments`](#gen-ai-tool-call-arguments) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | any | Parameters passed to the tool call. \[12\] | {     “location”: “San Francisco?”,     “date”: “2025-10-01” } |
| [`gen_ai.tool.call.id`](#gen-ai-tool-call-id) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The tool call identifier. | `call_mszuSIzqtI65i1wAUOE8w5H4` |
| [`gen_ai.tool.call.result`](#gen-ai-tool-call-result) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | any | The result returned by the tool call (if any and if execution was successful). \[13\] | {   “temperature_range”: {     “high”: 75,     “low”: 60   },   “conditions”: “sunny” } |
| [`gen_ai.tool.definitions`](#gen-ai-tool-definitions) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | any | The list of tool definitions available to the GenAI agent or model. \[14\] | \[   {     “type”: “function”,     “name”: “get_current_weather”,     “description”: “Get the current weather in a given location”,     “parameters”: {       “type”: “object”,       “properties”: {         “location”: {           “type”: “string”,           “description”: “The city and state, e.g. San Francisco, CA”         },         “unit”: {           “type”: “string”,           “enum”: \[             “celsius”,             “fahrenheit”           \]         }       },       “required”: \[         “location”,         “unit”       \]     }   } \] |
| [`gen_ai.tool.description`](#gen-ai-tool-description) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | The tool description. | `Multiply two numbers` |
| [`gen_ai.tool.name`](#gen-ai-tool-name) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Name of the tool utilized by the agent. | `Flights` |
| [`gen_ai.tool.type`](#gen-ai-tool-type) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Type of the tool utilized by the agent \[15\] | `function`; `extension`; `datastore` |
| [`gen_ai.usage.cache_creation.input_tokens`](#gen-ai-usage-cache-creation-input-tokens) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | The number of input tokens written to a provider-managed cache. \[16\] | `25` |
| [`gen_ai.usage.cache_read.input_tokens`](#gen-ai-usage-cache-read-input-tokens) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | The number of input tokens served from a provider-managed cache. \[17\] | `50` |
| [`gen_ai.usage.input_tokens`](#gen-ai-usage-input-tokens) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | The number of tokens used in the GenAI input (prompt). \[18\] | `100` |
| [`gen_ai.usage.output_tokens`](#gen-ai-usage-output-tokens) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | The number of tokens used in the GenAI response (completion). | `180` |
| [`gen_ai.usage.reasoning.output_tokens`](#gen-ai-usage-reasoning-output-tokens) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | The number of output tokens used for reasoning (e.g. chain-of-thought, extended thinking). \[19\] | `50` |
| [`gen_ai.workflow.name`](#gen-ai-workflow-name) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Human-readable name of the GenAI workflow provided by the application. \[20\] | `multi_agent_rag`; `customer_support_pipeline` |

**\[1\] `gen_ai.data_source.id`:** Data sources are used by AI agents and RAG applications to store grounding data. A data source may be an external database, object store, document collection, website, or any other storage system used by the GenAI agent or application. The `gen_ai.data_source.id` SHOULD match the identifier used by the GenAI system rather than a name specific to the external storage, such as a database or object store. Semantic conventions referencing `gen_ai.data_source.id` MAY also leverage additional attributes, such as `db.*`, to further identify and describe the data source.

**\[2\] `gen_ai.evaluation.score.label`:** This attribute provides a human-readable interpretation of the evaluation score produced by an evaluator. For example, a score value of 1 could mean “relevant” in one evaluation system and “not relevant” in another, depending on the scoring range and evaluator. The label SHOULD have low cardinality. Possible values depend on the evaluation metric and evaluator used; implementations SHOULD document the possible values.

**\[3\] `gen_ai.input.messages`:** Instrumentations MUST follow [Input messages JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-input-messages.json). When the attribute is recorded on events, it MUST be recorded in structured form. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.

Messages MUST be provided in the order they were sent to the model. Instrumentations MAY provide a way for users to filter or truncate input messages.

Warning

This attribute is likely to contain sensitive information including user/PII data.

See [Recording content on attributes](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes) section for more details.

**\[4\] `gen_ai.operation.name`:** If one of the predefined values applies, but specific system uses a different name it’s RECOMMENDED to document it in the semantic conventions for specific GenAI system and use system-specific name in the instrumentation. If a different name is not documented, instrumentation libraries SHOULD use applicable predefined value.

**\[5\] `gen_ai.output.messages`:** Instrumentations MUST follow [Output messages JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-output-messages.json)

Each message represents a single output choice/candidate generated by the model. Each message corresponds to exactly one generation (choice/candidate) and vice versa - one choice cannot be split across multiple messages or one message cannot contain parts from multiple choices.

When the attribute is recorded on events, it MUST be recorded in structured form. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.

Instrumentations MAY provide a way for users to filter or truncate output messages.

Warning

This attribute is likely to contain sensitive information including user/PII data.

See [Recording content on attributes](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes) section for more details.

**\[6\] `gen_ai.output.type`:** This attribute SHOULD be used when the client requests output of a specific type. The model may return zero or more outputs of this type. This attribute specifies the output modality and not the actual output format. For example, if an image is requested, the actual output could be a URL pointing to an image file. Additional output format details may be recorded in the future in the `gen_ai.output.{type}.*` attributes.

**\[7\] `gen_ai.provider.name`:** The attribute SHOULD be set based on the instrumentation’s best knowledge and may differ from the actual model provider.

Multiple providers, including Azure OpenAI, Gemini, and AI hosting platforms are accessible using the OpenAI REST API and corresponding client libraries, but may proxy or host models from different providers.

The `gen_ai.request.model`, `gen_ai.response.model`, and `server.address` attributes may help identify the actual system in use.

The `gen_ai.provider.name` attribute acts as a discriminator that identifies the GenAI telemetry format flavor specific to that provider within GenAI semantic conventions. It SHOULD be set consistently with provider-specific attributes and signals. For example, GenAI spans, metrics, and events related to AWS Bedrock should have the `gen_ai.provider.name` set to `aws.bedrock` and include applicable `aws.bedrock.*` attributes and are not expected to include `openai.*` attributes.

**\[8\] `gen_ai.request.encoding_formats`:** In some GenAI systems the encoding formats are called embedding types. Also, some GenAI systems only accept a single format per request.

**\[9\] `gen_ai.retrieval.documents`:** Instrumentations MUST follow [Retrieval documents JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-retrieval-documents.json). When the attribute is recorded on events, it MUST be recorded in structured form. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.

Each document object SHOULD contain at least the following properties: `id` (string): A unique identifier for the document, `score` (double): The relevance score of the document

**\[10\] `gen_ai.retrieval.query.text`:**

Warning

This attribute may contain sensitive information.

**\[11\] `gen_ai.system_instructions`:** This attribute SHOULD be used when the corresponding provider or API allows to provide system instructions or messages separately from the chat history.

Instructions that are part of the chat history SHOULD be recorded in `gen_ai.input.messages` attribute instead.

Instrumentations MUST follow [System instructions JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-system-instructions.json).

When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.

Instrumentations MAY provide a way for users to filter or truncate system instructions.

Warning

This attribute may contain sensitive information.

See [Recording content on attributes](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes) section for more details.

**\[12\] `gen_ai.tool.call.arguments`:**

Warning

This attribute may contain sensitive information.

It’s expected to be an object - in case a serialized string is available to the instrumentation, the instrumentation SHOULD do the best effort to deserialize it to an object. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.

**\[13\] `gen_ai.tool.call.result`:**

Warning

This attribute may contain sensitive information.

It’s expected to be an object - in case a serialized string is available to the instrumentation, the instrumentation SHOULD do the best effort to deserialize it to an object. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.

**\[14\] `gen_ai.tool.definitions`:** Instrumentations MUST follow [Tool Definitions JSON Schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-tool-definitions.json).

When the attribute is recorded on events, it MUST be recorded in structured form. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.

Since this attribute could be large, it’s NOT RECOMMENDED to populate non-required properties by default. Instrumentations MAY provide a way to enable populating optional properties.

**\[15\] `gen_ai.tool.type`:** Extension: A tool executed on the agent-side to directly call external APIs, bridging the gap between the agent and real-world systems. Agent-side operations involve actions that are performed by the agent on the server or within the agent’s controlled environment. Function: A tool executed on the client-side, where the agent generates parameters for a predefined function, and the client executes the logic. Client-side operations are actions taken on the user’s end or within the client application. Datastore: A tool used by the agent to access and query structured or unstructured external data for retrieval-augmented tasks or knowledge updates.

**\[16\] `gen_ai.usage.cache_creation.input_tokens`:** The value SHOULD be included in `gen_ai.usage.input_tokens`.

**\[17\] `gen_ai.usage.cache_read.input_tokens`:** The value SHOULD be included in `gen_ai.usage.input_tokens`.

**\[18\] `gen_ai.usage.input_tokens`:** This value SHOULD include all types of input tokens, including cached tokens. Instrumentations SHOULD make a best effort to populate this value, using a total provided by the provider when available or, depending on the provider API, by summing different token types parsed from the provider output.

**\[19\] `gen_ai.usage.reasoning.output_tokens`:** The value SHOULD be included in `gen_ai.usage.output_tokens`.

**\[20\] `gen_ai.workflow.name`:** This attribute can be populated in different frameworks eg: name of the first chain in LangChain OR name of the crew in CrewAI.

------------------------------------------------------------------------

`gen_ai.operation.name` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.

| Value | Description | Stability |
|----|----|----|
| `chat` | Chat completion operation such as [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat) | ![Development](https://img.shields.io/badge/-development-blue) |
| `create_agent` | Create GenAI agent | ![Development](https://img.shields.io/badge/-development-blue) |
| `embeddings` | Embeddings operation such as [OpenAI Create embeddings API](https://platform.openai.com/docs/api-reference/embeddings/create) | ![Development](https://img.shields.io/badge/-development-blue) |
| `execute_tool` | Execute a tool | ![Development](https://img.shields.io/badge/-development-blue) |
| `generate_content` | Multimodal content generation operation such as [Gemini Generate Content](https://ai.google.dev/api/generate-content) | ![Development](https://img.shields.io/badge/-development-blue) |
| `invoke_agent` | Invoke GenAI agent | ![Development](https://img.shields.io/badge/-development-blue) |
| `invoke_workflow` | Invoke GenAI workflow | ![Development](https://img.shields.io/badge/-development-blue) |
| `retrieval` | Retrieval operation such as [OpenAI Search Vector Store API](https://platform.openai.com/docs/api-reference/vector-stores/search) | ![Development](https://img.shields.io/badge/-development-blue) |
| `text_completion` | Text completions operation such as [OpenAI Completions API (Legacy)](https://platform.openai.com/docs/api-reference/completions) | ![Development](https://img.shields.io/badge/-development-blue) |

------------------------------------------------------------------------

`gen_ai.output.type` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.

| Value | Description | Stability |
|----|----|----|
| `image` | Image | ![Development](https://img.shields.io/badge/-development-blue) |
| `json` | JSON object with known or unknown schema | ![Development](https://img.shields.io/badge/-development-blue) |
| `speech` | Speech | ![Development](https://img.shields.io/badge/-development-blue) |
| `text` | Plain text | ![Development](https://img.shields.io/badge/-development-blue) |

------------------------------------------------------------------------

`gen_ai.provider.name` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.

| Value | Description | Stability |
|----|----|----|
| `anthropic` | [Anthropic](https://www.anthropic.com/) | ![Development](https://img.shields.io/badge/-development-blue) |
| `aws.bedrock` | [AWS Bedrock](https://aws.amazon.com/bedrock) | ![Development](https://img.shields.io/badge/-development-blue) |
| `azure.ai.inference` | Azure AI Inference | ![Development](https://img.shields.io/badge/-development-blue) |
| `azure.ai.openai` | [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview) | ![Development](https://img.shields.io/badge/-development-blue) |
| `cohere` | [Cohere](https://cohere.com/) | ![Development](https://img.shields.io/badge/-development-blue) |
| `deepseek` | [DeepSeek](https://www.deepseek.com/) | ![Development](https://img.shields.io/badge/-development-blue) |
| `gcp.gemini` | [Gemini](https://cloud.google.com/products/gemini) \[21\] | ![Development](https://img.shields.io/badge/-development-blue) |
| `gcp.gen_ai` | Any Google generative AI endpoint \[22\] | ![Development](https://img.shields.io/badge/-development-blue) |
| `gcp.vertex_ai` | [Vertex AI](https://cloud.google.com/vertex-ai) \[23\] | ![Development](https://img.shields.io/badge/-development-blue) |
| `groq` | [Groq](https://groq.com/) | ![Development](https://img.shields.io/badge/-development-blue) |
| `ibm.watsonx.ai` | [IBM Watsonx AI](https://www.ibm.com/products/watsonx-ai) | ![Development](https://img.shields.io/badge/-development-blue) |
| `mistral_ai` | [Mistral AI](https://mistral.ai/) | ![Development](https://img.shields.io/badge/-development-blue) |
| `openai` | [OpenAI](https://openai.com/) | ![Development](https://img.shields.io/badge/-development-blue) |
| `perplexity` | [Perplexity](https://www.perplexity.ai/) | ![Development](https://img.shields.io/badge/-development-blue) |
| `x_ai` | [xAI](https://x.ai/) | ![Development](https://img.shields.io/badge/-development-blue) |

**\[21\]:** Used when accessing the ‘generativelanguage.googleapis.com’ endpoint. Also known as the AI Studio API.

**\[22\]:** May be used when specific backend is unknown.

**\[23\]:** Used when accessing the ‘aiplatform.googleapis.com’ endpoint.

------------------------------------------------------------------------

`gen_ai.token.type` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.

| Value | Description | Stability |
|----|----|----|
| `input` | Input tokens (prompt, input, etc.) | ![Development](https://img.shields.io/badge/-development-blue) |
| `output` | Output tokens (completion, response, etc.) | ![Development](https://img.shields.io/badge/-development-blue) |

## Deprecated GenAI Attributes[](#deprecated-genai-attributes)

Describes deprecated `gen_ai` attributes.

**Attributes:**

| Key | Stability | Value Type | Description | Example Values |
|----|----|----|----|----|
| [`gen_ai.completion`](#gen-ai-completion) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Removed, no replacement at this time. | string | Deprecated, use Event API to report completions contents. | `[{'role': 'assistant', 'content': 'The capital of France is Paris.'}]` |
| [`gen_ai.prompt`](#gen-ai-prompt) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Removed, no replacement at this time. | string | Deprecated, use Event API to report prompt contents. | `[{'role': 'user', 'content': 'What is the capital of France?'}]` |
| [`gen_ai.system`](#gen-ai-system) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Replaced by `gen_ai.provider.name`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Deprecated, use `gen_ai.provider.name` instead. | `openai`; `gcp.gen_ai`; `gcp.vertex_ai` |
| [`gen_ai.usage.completion_tokens`](#gen-ai-usage-completion-tokens) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Replaced by `gen_ai.usage.output_tokens`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | Deprecated, use `gen_ai.usage.output_tokens` instead. | `42` |
| [`gen_ai.usage.prompt_tokens`](#gen-ai-usage-prompt-tokens) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Replaced by `gen_ai.usage.input_tokens`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | Deprecated, use `gen_ai.usage.input_tokens` instead. | `42` |

------------------------------------------------------------------------

`gen_ai.system` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.

| Value | Description | Stability |
|----|----|----|
| `anthropic` | Anthropic | ![Development](https://img.shields.io/badge/-development-blue) |
| `aws.bedrock` | AWS Bedrock | ![Development](https://img.shields.io/badge/-development-blue) |
| `azure.ai.inference` | Azure AI Inference | ![Development](https://img.shields.io/badge/-development-blue) |
| `azure.ai.openai` | Azure OpenAI | ![Development](https://img.shields.io/badge/-development-blue) |
| `cohere` | Cohere | ![Development](https://img.shields.io/badge/-development-blue) |
| `deepseek` | DeepSeek | ![Development](https://img.shields.io/badge/-development-blue) |
| `gcp.gemini` | Gemini \[24\] | ![Development](https://img.shields.io/badge/-development-blue) |
| `gcp.gen_ai` | Any Google generative AI endpoint \[25\] | ![Development](https://img.shields.io/badge/-development-blue) |
| `gcp.vertex_ai` | Vertex AI \[26\] | ![Development](https://img.shields.io/badge/-development-blue) |
| `groq` | Groq | ![Development](https://img.shields.io/badge/-development-blue) |
| `ibm.watsonx.ai` | IBM Watsonx AI | ![Development](https://img.shields.io/badge/-development-blue) |
| `mistral_ai` | Mistral AI | ![Development](https://img.shields.io/badge/-development-blue) |
| `openai` | OpenAI | ![Development](https://img.shields.io/badge/-development-blue) |
| `perplexity` | Perplexity | ![Development](https://img.shields.io/badge/-development-blue) |
| `xai` | xAI | ![Development](https://img.shields.io/badge/-development-blue) |

**\[24\]:** This refers to the ‘generativelanguage.googleapis.com’ endpoint. Also known as the AI Studio API. May use common attributes prefixed with ‘gcp.gen_ai.’.

**\[25\]:** May be used when specific backend is unknown. May use common attributes prefixed with ‘gcp.gen_ai.’.

**\[26\]:** This refers to the ‘aiplatform.googleapis.com’ endpoint. May use common attributes prefixed with ‘gcp.gen_ai.’.

## Deprecated OpenAI GenAI Attributes[](#deprecated-openai-genai-attributes)

Describes deprecated `gen_ai.openai` attributes.

**Attributes:**

| Key | Stability | Value Type | Description | Example Values |
|----|----|----|----|----|
| [`gen_ai.openai.request.response_format`](#gen-ai-openai-request-response-format) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Replaced by `gen_ai.output.type`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Deprecated, use `gen_ai.output.type`. | `text`; `json_object`; `json_schema` |
| [`gen_ai.openai.request.seed`](#gen-ai-openai-request-seed) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Replaced by `gen_ai.request.seed`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | int | Deprecated, use `gen_ai.request.seed`. | `100` |
| [`gen_ai.openai.request.service_tier`](#gen-ai-openai-request-service-tier) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Replaced by `openai.request.service_tier`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Deprecated, use `openai.request.service_tier`. | `auto`; `default` |
| [`gen_ai.openai.response.service_tier`](#gen-ai-openai-response-service-tier) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Replaced by `openai.response.service_tier`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Deprecated, use `openai.response.service_tier`. | `scale`; `default` |
| [`gen_ai.openai.response.system_fingerprint`](#gen-ai-openai-response-system-fingerprint) | ![Deprecated](https://img.shields.io/badge/-deprecated-red) Replaced by `openai.response.system_fingerprint`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai). | string | Deprecated, use `openai.response.system_fingerprint`. | `fp_44709d6fcb` |

------------------------------------------------------------------------

`gen_ai.openai.request.response_format` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.

| Value | Description | Stability |
|----|----|----|
| `json_object` | JSON object response format | ![Development](https://img.shields.io/badge/-development-blue) |
| `json_schema` | JSON schema response format | ![Development](https://img.shields.io/badge/-development-blue) |
| `text` | Text response format | ![Development](https://img.shields.io/badge/-development-blue) |

------------------------------------------------------------------------

`gen_ai.openai.request.service_tier` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.

| Value | Description | Stability |
|----|----|----|
| `auto` | The system will utilize scale tier credits until they are exhausted. | ![Development](https://img.shields.io/badge/-development-blue) |
| `default` | The system will utilize the default scale tier. | ![Development](https://img.shields.io/badge/-development-blue) |

## Feedback

Was this page helpful?

Thank you. Your feedback is appreciated!

Please let us know [how we can improve this page](https://github.com/open-telemetry/opentelemetry.io/issues/new?template=PAGE_FEEDBACK.yml&title=%5BPage+feedback%5D%3A+ADD+A+SUMMARY+OF+YOUR+FEEDBACK+HERE). Your feedback is appreciated!

\

<!--
## Source links

- [View Markdown](./docs-specs-semconv-registry-attributes-gen-ai-index.md.md) - source: /docs/specs/semconv/registry/attributes/gen-ai/index.md
- [View page source](https://github.com/open-telemetry/semantic-conventions/tree/main/docs/registry/attributes/gen-ai.md)
- [Edit this page](https://github.com/open-telemetry/semantic-conventions/edit/main/docs/registry/attributes/gen-ai.md)
- [Create child page](https://github.com/open-telemetry/semantic-conventions/new/main/docs/registry/attributes?filename=change-me.md&value=---%0Atitle%3A+%22Long+Page+Title%22%0AlinkTitle%3A+%22Short+Nav+Title%22%0Aweight%3A+100%0Adescription%3A+%3E-%0A+++++Page+description+for+heading+and+indexes.%0A---%0A%0A%23%23+Heading%0A%0AEdit+this+template+to+create+your+new+page.%0A%0A%2A+Give+it+a+good+name%2C+ending+in+%60.md%60+-+e.g.+%60get-started.md%60%0A%2A+Edit+the+%22front+matter%22+section+at+the+top+of+the+page+%28weight+controls+how+its+ordered+amongst+other+pages+in+the+same+directory%3B+lowest+number+first%29.%0A%2A+Add+a+good+commit+message+at+the+bottom+of+the+page+%28%3C80+characters%3B+use+the+extended+description+field+for+more+detail%29.%0A%2A+Create+a+new+branch+so+you+can+preview+your+new+file+and+request+a+review+via+Pull+Request.%0A)
- [Create documentation issue](https://github.com/open-telemetry/semantic-conventions/issues/new?title=Gen%20AI)
- [Create project issue](https://github.com/open-telemetry/semantic-conventions/issues/new)
- [Docs](./docs.md) - source: /docs/
- [Specs](./docs-specs.md) - source: /docs/specs/
- [Semantic conventions 1.44.0](./docs-specs-semconv.md) - source: /docs/specs/semconv/
- [Registry](./docs-specs-semconv-registry.md) - source: /docs/specs/semconv/registry/
- [Attributes](./docs-specs-semconv-registry-attributes.md) - source: /docs/specs/semconv/registry/attributes/
- [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai)
- [Input messages JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-input-messages.json)
- [Recording content on attributes](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes)
- [Output messages JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-output-messages.json)
- [Retrieval documents JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-retrieval-documents.json)
- [System instructions JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-system-instructions.json)
- [Tool Definitions JSON Schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-tool-definitions.json)
- [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat)
- [OpenAI Create embeddings API](https://platform.openai.com/docs/api-reference/embeddings/create)
- [Gemini Generate Content](https://ai.google.dev/api/generate-content)
- [OpenAI Search Vector Store API](https://platform.openai.com/docs/api-reference/vector-stores/search)
- [OpenAI Completions API (Legacy)](https://platform.openai.com/docs/api-reference/completions)
- [Anthropic](https://www.anthropic.com/)
- [AWS Bedrock](https://aws.amazon.com/bedrock)
- [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)
- [Cohere](https://cohere.com/)
- [DeepSeek](https://www.deepseek.com/)
- [Gemini](https://cloud.google.com/products/gemini)
- [Vertex AI](https://cloud.google.com/vertex-ai)
- [Groq](https://groq.com/)
- [IBM Watsonx AI](https://www.ibm.com/products/watsonx-ai)
- [Mistral AI](https://mistral.ai/)
- [OpenAI](https://openai.com/)
- [Perplexity](https://www.perplexity.ai/)
- [xAI](https://x.ai/)
- [how we can improve this page](https://github.com/open-telemetry/opentelemetry.io/issues/new?template=PAGE_FEEDBACK.yml&title=[Page+feedback]%3A+ADD+A+SUMMARY+OF+YOUR+FEEDBACK+HERE)
- [https://github.com/open-telemetry/community#mailing-lists](https://github.com/open-telemetry/community#mailing-lists)
- [https://bsky.app/profile/opentelemetry.io](https://bsky.app/profile/opentelemetry.io)
- [https://fosstodon.org/@opentelemetry](https://fosstodon.org/@opentelemetry)
- [https://stackoverflow.com/questions/tagged/open-telemetry](https://stackoverflow.com/questions/tagged/open-telemetry)
- [https://github.com/cncf/artwork/tree/master/projects/opentelemetry](https://github.com/cncf/artwork/tree/master/projects/opentelemetry)
- [https://zoom-lfx.platform.linuxfoundation.org/meetings/opentelemetry?view=week](https://zoom-lfx.platform.linuxfoundation.org/meetings/opentelemetry?view=week)
- [https://lookerstudio.google.com/s/tSTKxK1ECeU](https://lookerstudio.google.com/s/tSTKxK1ECeU)
- [https://github.com/open-telemetry](https://github.com/open-telemetry)
- [https://cloud-native.slack.com/archives/C09H3MNMBQV](https://cloud-native.slack.com/archives/C09H3MNMBQV)
- [https://cloud-native.slack.com/archives/CJFCJHG4Q](https://cloud-native.slack.com/archives/CJFCJHG4Q)
- [https://opentelemetry.devstats.cncf.io/d/8/dashboards?orgId=1&refresh=15m](https://opentelemetry.devstats.cncf.io/d/8/dashboards?orgId=1&refresh=15m)
- [https://www.linuxfoundation.org/legal/privacy-policy](https://www.linuxfoundation.org/legal/privacy-policy)
- [https://www.linuxfoundation.org/legal/trademark-usage](https://www.linuxfoundation.org/legal/trademark-usage)
- [/community/marketing-guidelines/](./community-marketing-guidelines.md) - source: /community/marketing-guidelines/
- [/site/](./site.md) - source: /site/
- [CC BY 4.0](https://creativecommons.org/licenses/by/4.0)
-->
