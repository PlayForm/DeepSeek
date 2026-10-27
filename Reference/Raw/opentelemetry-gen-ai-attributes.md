# Gen AI
  * [GenAI Attributes (Moved)](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#genai-attributes-moved)
  * [Deprecated GenAI Attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#deprecated-genai-attributes)
  * [Deprecated OpenAI GenAI Attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#deprecated-openai-genai-attributes)


## GenAI Attributes (Moved) 
Generative AI (GenAI) attributes have moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).
**Attributes:**  
| Key  | Stability  | Value Type  | Description  | Example Values  |  
| --- | --- | --- | --- | --- |  
| [`gen_ai.agent.description`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-agent-description)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Free-form description of the GenAI agent provided by the application.  |  `Helps with math problems`; `Generates fiction stories`  |  
|  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The unique identifier of the GenAI agent.  | `asst_5j66UpCpwteGg4YSxUnt7lPY`  |  
|  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Human-readable name of the GenAI agent provided by the application.  |  `Math Tutor`; `Fiction Writer`  |  
| [`gen_ai.agent.version`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-agent-version)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The version of the GenAI agent.  |  `1.0.0`; `2025-05-01`  |  
| [`gen_ai.conversation.id`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-conversation-id)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The unique identifier for a conversation (session, thread), used to store and correlate messages within this conversation.  | `conv_5j66UpCpwteGg4YSxUnt7lPY`  |  
| [`gen_ai.data_source.id`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-data-source-id)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The data source identifier. [1]  | `H7STPQYOND`  |  
| [`gen_ai.embeddings.dimension.count`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-embeddings-dimension-count)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | The number of dimensions the resulting output embeddings should have.  |  `512`; `1024`  |  
| [`gen_ai.evaluation.explanation`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-evaluation-explanation)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | A free-form explanation for the assigned score provided by the evaluator.  | `The response is factually accurate but lacks sufficient detail to fully address the question.`  |  
| [`gen_ai.evaluation.name`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-evaluation-name)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The name of the evaluation metric used for the GenAI response.  |  `Relevance`; `IntentResolution`  |  
| [`gen_ai.evaluation.score.label`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-evaluation-score-label)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Human readable label for evaluation. [2]  |  `relevant`; `not_relevant`; `correct`; `incorrect`; `pass`; `fail`  |  
| [`gen_ai.evaluation.score.value`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-evaluation-score-value)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | double  | The evaluation score returned by the evaluator.  | `4.0`  |  
| [`gen_ai.input.messages`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-input-messages)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | any  | The chat history provided to the model as an input. [3]  | [ { “role”: “user”, “parts”: [ { “type”: “text”, “content”: “Weather in Paris?" } ] }, { “role”: “assistant”, “parts”: [ { “type”: “tool_call”, “id”: “call_VSPygqKTWdrhaFErNvMV18Yl”, “name”: “get_weather”, “arguments”: { “location”: “Paris” } } ] }, { “role”: “tool”, “parts”: [ { “type”: “tool_call_response”, “id”: " call_VSPygqKTWdrhaFErNvMV18Yl”, “result”: “rainy, 57°F” } ] }]  |  
| [`gen_ai.operation.name`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-operation-name)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The name of the operation being performed. [4]  |  `chat`; `generate_content`; `text_completion`  |  
| [`gen_ai.output.messages`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-output-messages)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | any  | Messages returned by the model where each message represents a specific model response (choice, candidate). [5]  | [ { “role”: “assistant”, “parts”: [ { “type”: “text”, “content”: “The weather in Paris is currently rainy with a temperature of 57°F." } ], “finish_reason”: “stop” }]  |  
|  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Represents the content type requested by the client. [6]  |  `text`; `json`; `image`  |  
|  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The name of the prompt that uniquely identifies it.  | `analyze-code`  |  
| [`gen_ai.provider.name`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-provider-name)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The Generative AI provider as identified by the client or server instrumentation. [7]  |  `openai`; `gcp.gen_ai`; `gcp.vertex_ai`  |  
| [`gen_ai.request.choice.count`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-choice-count)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | The target number of candidate completions to return.  |  
| [`gen_ai.request.encoding_formats`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-encoding-formats)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string[]  | The encoding formats requested in an embeddings operation, if specified. [8]  |  `["base64"]`; `["float", "binary"]`  |  
| [`gen_ai.request.frequency_penalty`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-frequency-penalty)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | double  | The frequency penalty setting for the GenAI request.  | `0.1`  |  
| [`gen_ai.request.max_tokens`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-max-tokens)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | The maximum number of tokens the model generates for a request.  | `100`  |  
| [`gen_ai.request.model`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-model)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The name of the GenAI model a request is being made to.  | `gpt-4`  |  
| [`gen_ai.request.presence_penalty`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-presence-penalty)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | double  | The presence penalty setting for the GenAI request.  | `0.1`  |  
| [`gen_ai.request.seed`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-seed)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | Requests with same seed value more likely to return same result.  | `100`  |  
| [`gen_ai.request.stop_sequences`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-stop-sequences)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string[]  | List of sequences that the model will use to stop generating further tokens.  | `["forest", "lived"]`  |  
| [`gen_ai.request.stream`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-stream)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | boolean  | Indicates whether the GenAI request was made in streaming mode.  |  
| [`gen_ai.request.temperature`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-temperature)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | double  | The temperature setting for the GenAI request.  | `0.0`  |  
| [`gen_ai.request.top_k`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-top-k)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | double  | The top_k sampling setting for the GenAI request.  | `1.0`  |  
| [`gen_ai.request.top_p`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-request-top-p)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | double  | The top_p sampling setting for the GenAI request.  | `1.0`  |  
| [`gen_ai.response.finish_reasons`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-response-finish-reasons)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string[]  | Array of reasons the model stopped generating tokens, corresponding to each generation received.  |  `["stop"]`; `["stop", "length"]`  |  
|  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The unique identifier for the completion.  | `chatcmpl-123`  |  
| [`gen_ai.response.model`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-response-model)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The name of the model that generated the response.  | `gpt-4-0613`  |  
| [`gen_ai.response.time_to_first_chunk`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-response-time-to-first-chunk)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | double  | Time to first chunk in a streaming response, measured from request issuance, in seconds. The value is measured from when the client issues the generation request to when the first chunk is received in the response stream.  |  `0.5`; `1.2`  |  
| [`gen_ai.retrieval.documents`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-retrieval-documents)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | any  | The documents retrieved. [9]  | [ { “id”: “doc_123”, “score”: 0.95 }, { “id”: “doc_456”, “score”: 0.87 }, { “id”: “doc_789”, “score”: 0.82 }]  |  
| [`gen_ai.retrieval.query.text`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-retrieval-query-text)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The query text used for retrieval. [10]  |  `What is the capital of France?`; `weather in Paris`  |  
| [`gen_ai.system_instructions`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-system-instructions)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | any  | The system message or instructions provided to the GenAI model separately from the chat history. [11]  | [ { “type”: “text”, “content”: “You are an Agent that greet users, always use greetings tool to respond” }]; [ { “type”: “text”, “content”: “You are a language translator." }, { “type”: “text”, “content”: “Your mission is to translate text in English to French." }]  |  
|  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The type of token being counted.  |  `input`; `output`  |  
| [`gen_ai.tool.call.arguments`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-tool-call-arguments)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | any  | Parameters passed to the tool call. [12]  | { “location”: “San Francisco?”, “date”: “2025-10-01”}  |  
| [`gen_ai.tool.call.id`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-tool-call-id)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The tool call identifier.  | `call_mszuSIzqtI65i1wAUOE8w5H4`  |  
| [`gen_ai.tool.call.result`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-tool-call-result)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | any  | The result returned by the tool call (if any and if execution was successful). [13]  | { “temperature_range”: { “high”: 75, “low”: 60 }, “conditions”: “sunny”}  |  
| [`gen_ai.tool.definitions`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-tool-definitions)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | any  | The list of tool definitions available to the GenAI agent or model. [14]  | [ { “type”: “function”, “name”: “get_current_weather”, “description”: “Get the current weather in a given location”, “parameters”: { “type”: “object”, “properties”: { “location”: { “type”: “string”, “description”: “The city and state, e.g. San Francisco, CA” }, “unit”: { “type”: “string”, “enum”: [ “celsius”, “fahrenheit” ] } }, “required”: [ “location”, “unit” ] } }]  |  
| [`gen_ai.tool.description`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-tool-description)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | The tool description.  | `Multiply two numbers`  |  
|  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Name of the tool utilized by the agent.  | `Flights`  |  
|  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Type of the tool utilized by the agent [15]  |  `function`; `extension`; `datastore`  |  
| [`gen_ai.usage.cache_creation.input_tokens`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-usage-cache-creation-input-tokens)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | The number of input tokens written to a provider-managed cache. [16]  |  
| [`gen_ai.usage.cache_read.input_tokens`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-usage-cache-read-input-tokens)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | The number of input tokens served from a provider-managed cache. [17]  |  
| [`gen_ai.usage.input_tokens`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-usage-input-tokens)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | The number of tokens used in the GenAI input (prompt). [18]  | `100`  |  
| [`gen_ai.usage.output_tokens`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-usage-output-tokens)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | The number of tokens used in the GenAI response (completion).  | `180`  |  
| [`gen_ai.usage.reasoning.output_tokens`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-usage-reasoning-output-tokens)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | The number of output tokens used for reasoning (e.g. chain-of-thought, extended thinking). [19]  |  
| [`gen_ai.workflow.name`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-workflow-name)  |  Moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Human-readable name of the GenAI workflow provided by the application. [20]  |  `multi_agent_rag`; `customer_support_pipeline`  |  
**[1]`gen_ai.data_source.id` :** Data sources are used by AI agents and RAG applications to store grounding data. A data source may be an external database, object store, document collection, website, or any other storage system used by the GenAI agent or application. The `gen_ai.data_source.id` SHOULD match the identifier used by the GenAI system rather than a name specific to the external storage, such as a database or object store. Semantic conventions referencing `gen_ai.data_source.id` MAY also leverage additional attributes, such as `db.*`, to further identify and describe the data source.
**[2]`gen_ai.evaluation.score.label` :** This attribute provides a human-readable interpretation of the evaluation score produced by an evaluator. For example, a score value of 1 could mean “relevant” in one evaluation system and “not relevant” in another, depending on the scoring range and evaluator. The label SHOULD have low cardinality. Possible values depend on the evaluation metric and evaluator used; implementations SHOULD document the possible values.
**[3]`gen_ai.input.messages` :** Instrumentations MUST follow [Input messages JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-input-messages.json). When the attribute is recorded on events, it MUST be recorded in structured form. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.
Messages MUST be provided in the order they were sent to the model. Instrumentations MAY provide a way for users to filter or truncate input messages.
Warning
This attribute is likely to contain sensitive information including user/PII data.
See [Recording content on attributes](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes) section for more details.
**[4]`gen_ai.operation.name` :** If one of the predefined values applies, but specific system uses a different name it’s RECOMMENDED to document it in the semantic conventions for specific GenAI system and use system-specific name in the instrumentation. If a different name is not documented, instrumentation libraries SHOULD use applicable predefined value.
**[5]`gen_ai.output.messages` :** Instrumentations MUST follow [Output messages JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-output-messages.json)
Each message represents a single output choice/candidate generated by the model. Each message corresponds to exactly one generation (choice/candidate) and vice versa - one choice cannot be split across multiple messages or one message cannot contain parts from multiple choices.
When the attribute is recorded on events, it MUST be recorded in structured form. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.
Instrumentations MAY provide a way for users to filter or truncate output messages.
Warning
This attribute is likely to contain sensitive information including user/PII data.
See [Recording content on attributes](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes) section for more details.
**[6]`gen_ai.output.type` :** This attribute SHOULD be used when the client requests output of a specific type. The model may return zero or more outputs of this type. This attribute specifies the output modality and not the actual output format. For example, if an image is requested, the actual output could be a URL pointing to an image file. Additional output format details may be recorded in the future in the `gen_ai.output.{type}.*` attributes.
**[7]`gen_ai.provider.name` :** The attribute SHOULD be set based on the instrumentation’s best knowledge and may differ from the actual model provider.
Multiple providers, including Azure OpenAI, Gemini, and AI hosting platforms are accessible using the OpenAI REST API and corresponding client libraries, but may proxy or host models from different providers.
The `gen_ai.request.model`, `gen_ai.response.model`, and `server.address` attributes may help identify the actual system in use.
The `gen_ai.provider.name` attribute acts as a discriminator that identifies the GenAI telemetry format flavor specific to that provider within GenAI semantic conventions. It SHOULD be set consistently with provider-specific attributes and signals. For example, GenAI spans, metrics, and events related to AWS Bedrock should have the `gen_ai.provider.name` set to `aws.bedrock` and include applicable `aws.bedrock.*` attributes and are not expected to include `openai.*` attributes.
**[8]`gen_ai.request.encoding_formats` :** In some GenAI systems the encoding formats are called embedding types. Also, some GenAI systems only accept a single format per request.
**[9]`gen_ai.retrieval.documents` :** Instrumentations MUST follow [Retrieval documents JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-retrieval-documents.json). When the attribute is recorded on events, it MUST be recorded in structured form. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.
Each document object SHOULD contain at least the following properties: `id` (string): A unique identifier for the document, `score` (double): The relevance score of the document
**[10]`gen_ai.retrieval.query.text` :**
Warning
This attribute may contain sensitive information.
**[11]`gen_ai.system_instructions` :** This attribute SHOULD be used when the corresponding provider or API allows to provide system instructions or messages separately from the chat history.
Instructions that are part of the chat history SHOULD be recorded in `gen_ai.input.messages` attribute instead.
Instrumentations MUST follow [System instructions JSON schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-system-instructions.json).
When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.
Instrumentations MAY provide a way for users to filter or truncate system instructions.
Warning
This attribute may contain sensitive information.
See [Recording content on attributes](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-spans.md#recording-content-on-attributes) section for more details.
**[12]`gen_ai.tool.call.arguments` :**
Warning
This attribute may contain sensitive information.
It’s expected to be an object - in case a serialized string is available to the instrumentation, the instrumentation SHOULD do the best effort to deserialize it to an object. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.
**[13]`gen_ai.tool.call.result` :**
Warning
This attribute may contain sensitive information.
It’s expected to be an object - in case a serialized string is available to the instrumentation, the instrumentation SHOULD do the best effort to deserialize it to an object. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.
**[14]`gen_ai.tool.definitions` :** Instrumentations MUST follow [Tool Definitions JSON Schema](https://github.com/open-telemetry/semantic-conventions/blob/v1.41.0/docs/gen-ai/gen-ai-tool-definitions.json).
When the attribute is recorded on events, it MUST be recorded in structured form. When recorded on spans, it MAY be recorded as a JSON string if structured format is not supported and SHOULD be recorded in structured form otherwise.
Since this attribute could be large, it’s NOT RECOMMENDED to populate non-required properties by default. Instrumentations MAY provide a way to enable populating optional properties.
**[15]`gen_ai.tool.type` :** Extension: A tool executed on the agent-side to directly call external APIs, bridging the gap between the agent and real-world systems. Agent-side operations involve actions that are performed by the agent on the server or within the agent’s controlled environment. Function: A tool executed on the client-side, where the agent generates parameters for a predefined function, and the client executes the logic. Client-side operations are actions taken on the user’s end or within the client application. Datastore: A tool used by the agent to access and query structured or unstructured external data for retrieval-augmented tasks or knowledge updates.
**[16]`gen_ai.usage.cache_creation.input_tokens` :** The value SHOULD be included in `gen_ai.usage.input_tokens`.
**[17]`gen_ai.usage.cache_read.input_tokens` :** The value SHOULD be included in `gen_ai.usage.input_tokens`.
**[18]`gen_ai.usage.input_tokens` :** This value SHOULD include all types of input tokens, including cached tokens. Instrumentations SHOULD make a best effort to populate this value, using a total provided by the provider when available or, depending on the provider API, by summing different token types parsed from the provider output.
**[19]`gen_ai.usage.reasoning.output_tokens` :** The value SHOULD be included in `gen_ai.usage.output_tokens`.
**[20]`gen_ai.workflow.name` :** This attribute can be populated in different frameworks eg: name of the first chain in LangChain OR name of the crew in CrewAI.
`gen_ai.operation.name` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.  
| Value  | Description  | Stability  |  
| --- | --- | --- |  
| `chat`  | Chat completion operation such as [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat)  |  
| `create_agent`  | Create GenAI agent  |  
| `embeddings`  | Embeddings operation such as [OpenAI Create embeddings API](https://platform.openai.com/docs/api-reference/embeddings/create)  |  
| `execute_tool`  | Execute a tool  |  
| `generate_content`  | Multimodal content generation operation such as [Gemini Generate Content](https://ai.google.dev/api/generate-content)  |  
| `invoke_agent`  | Invoke GenAI agent  |  
| `invoke_workflow`  | Invoke GenAI workflow  |  
| `retrieval`  | Retrieval operation such as [OpenAI Search Vector Store API](https://platform.openai.com/docs/api-reference/vector-stores/search)  |  
| `text_completion`  | Text completions operation such as [OpenAI Completions API (Legacy)](https://platform.openai.com/docs/api-reference/completions)  |  
`gen_ai.output.type` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.  
| Value  | Description  | Stability  |  
| --- | --- | --- |  
| `image`  | Image  |  
| `json`  | JSON object with known or unknown schema  |  
| `speech`  | Speech  |  
| `text`  | Plain text  |  
`gen_ai.provider.name` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.  
| Value  | Description  | Stability  |  
| --- | --- | --- |  
| `anthropic`  |  
| `aws.bedrock`  |  
| `azure.ai.inference`  | Azure AI Inference  |  
| `azure.ai.openai`  |  
| `cohere`  |  
| `deepseek`  |  
| `gcp.gemini`  |  
| `gcp.gen_ai`  | Any Google generative AI endpoint [22]  |  
| `gcp.vertex_ai`  |  [Vertex AI](https://cloud.google.com/vertex-ai) [23]  |  
| `groq`  |  
| `ibm.watsonx.ai`  |  
| `mistral_ai`  |  
| `openai`  |  
| `perplexity`  |  
| `x_ai`  |  
**[21]:** Used when accessing the ‘generativelanguage.googleapis.com’ endpoint. Also known as the AI Studio API.
**[22]:** May be used when specific backend is unknown.
**[23]:** Used when accessing the ‘aiplatform.googleapis.com’ endpoint.
`gen_ai.token.type` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.  
| Value  | Description  | Stability  |  
| --- | --- | --- |  
| `input`  | Input tokens (prompt, input, etc.)  |  
| `output`  | Output tokens (completion, response, etc.)  |  
## Deprecated GenAI Attributes 
Describes deprecated `gen_ai` attributes.
**Attributes:**  
| Key  | Stability  | Value Type  | Description  | Example Values  |  
| --- | --- | --- | --- | --- |  
|  Removed, no replacement at this time.  | string  | Deprecated, use Event API to report completions contents.  | `[{'role': 'assistant', 'content': 'The capital of France is Paris.'}]`  |  
|  Removed, no replacement at this time.  | string  | Deprecated, use Event API to report prompt contents.  | `[{'role': 'user', 'content': 'What is the capital of France?'}]`  |  
|  Replaced by `gen_ai.provider.name`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Deprecated, use `gen_ai.provider.name` instead.  |  `openai`; `gcp.gen_ai`; `gcp.vertex_ai`  |  
| [`gen_ai.usage.completion_tokens`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-usage-completion-tokens)  |  Replaced by `gen_ai.usage.output_tokens`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | Deprecated, use `gen_ai.usage.output_tokens` instead.  |  
| [`gen_ai.usage.prompt_tokens`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-usage-prompt-tokens)  |  Replaced by `gen_ai.usage.input_tokens`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | Deprecated, use `gen_ai.usage.input_tokens` instead.  |  
`gen_ai.system` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.  
| Value  | Description  | Stability  |  
| --- | --- | --- |  
| `anthropic`  | Anthropic  |  
| `aws.bedrock`  | AWS Bedrock  |  
| `azure.ai.inference`  | Azure AI Inference  |  
| `azure.ai.openai`  | Azure OpenAI  |  
| `cohere`  | Cohere  |  
| `deepseek`  | DeepSeek  |  
| `gcp.gemini`  | Gemini [24]  |  
| `gcp.gen_ai`  | Any Google generative AI endpoint [25]  |  
| `gcp.vertex_ai`  | Vertex AI [26]  |  
| `groq`  | Groq  |  
| `ibm.watsonx.ai`  | IBM Watsonx AI  |  
| `mistral_ai`  | Mistral AI  |  
| `openai`  | OpenAI  |  
| `perplexity`  | Perplexity  |  
| `xai`  | xAI  |  
**[24]:** This refers to the ‘generativelanguage.googleapis.com’ endpoint. Also known as the AI Studio API. May use common attributes prefixed with ‘gcp.gen_ai.’.
**[25]:** May be used when specific backend is unknown. May use common attributes prefixed with ‘gcp.gen_ai.’.
**[26]:** This refers to the ‘aiplatform.googleapis.com’ endpoint. May use common attributes prefixed with ‘gcp.gen_ai.’.
## Deprecated OpenAI GenAI Attributes 
Describes deprecated `gen_ai.openai` attributes.
**Attributes:**  
| Key  | Stability  | Value Type  | Description  | Example Values  |  
| --- | --- | --- | --- | --- |  
| [`gen_ai.openai.request.response_format`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-openai-request-response-format)  |  Replaced by `gen_ai.output.type`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Deprecated, use `gen_ai.output.type`.  |  `text`; `json_object`; `json_schema`  |  
| [`gen_ai.openai.request.seed`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-openai-request-seed)  |  Replaced by `gen_ai.request.seed`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | int  | Deprecated, use `gen_ai.request.seed`.  | `100`  |  
| [`gen_ai.openai.request.service_tier`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-openai-request-service-tier)  |  Replaced by `openai.request.service_tier`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Deprecated, use `openai.request.service_tier`.  |  `auto`; `default`  |  
| [`gen_ai.openai.response.service_tier`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-openai-response-service-tier)  |  Replaced by `openai.response.service_tier`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Deprecated, use `openai.response.service_tier`.  |  `scale`; `default`  |  
| [`gen_ai.openai.response.system_fingerprint`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/#gen-ai-openai-response-system-fingerprint)  |  Replaced by `openai.response.system_fingerprint`, which has moved to the [OpenTelemetry GenAI semantic conventions repository](https://github.com/open-telemetry/semantic-conventions-genai).  | string  | Deprecated, use `openai.response.system_fingerprint`.  | `fp_44709d6fcb`  |  
`gen_ai.openai.request.response_format` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.  
| Value  | Description  | Stability  |  
| --- | --- | --- |  
| `json_object`  | JSON object response format  |  
| `json_schema`  | JSON schema response format  |  
| `text`  | Text response format  |  
`gen_ai.openai.request.service_tier` has the following list of well-known values. If one of them applies, then the respective value MUST be used; otherwise, a custom value MAY be used.  
| Value  | Description  | Stability  |  
| --- | --- | --- |  
| `auto`  | The system will utilize scale tier credits until they are exhausted.  |  
| `default`  | The system will utilize the default scale tier.  |  
## Feedback
Was this page helpful?
Yes No
Thank you. Your feedback is appreciated!
Please let us know [how we can improve this page](https://github.com/open-telemetry/opentelemetry.io/issues/new?template=PAGE_FEEDBACK.yml&title=\[Page+feedback\]%3A+ADD+A+SUMMARY+OF+YOUR+FEEDBACK+HERE). Your feedback is appreciated!
