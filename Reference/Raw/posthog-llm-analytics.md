Products[Pricing](https://posthog.com/pricing)DocsCommunityCompanyMore
Copy page
# AI Observability
#### Contents
  * Where you can use it
  * Where its data comes from


AI Observability captures every call your AI product makes to an LLM – the prompt, the response, the tokens, the cost, the latency, and the tools it reached for along the way – and stitches them into traces you can actually read. When something goes wrong, you see the whole conversation instead of a single failed request.
Because it runs on the same events as the rest of PostHog, every trace comes with the user who triggered it, their , and any the request threw. Use the trace data in .
## Where you can use it
Explore traces and debug your AI product in the PostHog web app, from an MCP client, or through the API.
PostHog Web
Read traces and sessions, watch cost and latency, cluster failures, and test prompts in the playground.
PostHog MCP
Pull up traces, costs, and errors from any MCP client or AI editor while you're still in the code.
API
Send traces in, query them back out, and drive evaluations, reviews, and clustering from your own code.
## Where its data comes from
AI Observability runs on the LLM events your app sends to PostHog. Most of them come from an SDK wrapping your model provider, but you can also forward traces from another observability tool or attach feedback from your users.
Traces and spans
Generations, spans, and traces captured by the PostHog SDKs across every model provider and framework.
Integrations
Forward traces you already collect in Helicone, Langfuse, Traceloop, or Keywords AI.
User feedback
Thumbs up and down, ratings, and comments attached to the exact trace they're about.
### Still have questions?
Ask PostHog AI
### Was this page useful?
HelpfulCould be better
  1. Legally-required cookie banner
PostHog.com doesn't use third-party cookies, only a single in-house cookie.
No data is sent to a third party. (Ursula von der Leyen would be so proud.)


Notification Legally-required cookie bannerPostHog.com doesn't use third-party cookies, only a single in-house cookie.No data is sent to a third party. (Ursula von der Leyen would be so proud.)Close
