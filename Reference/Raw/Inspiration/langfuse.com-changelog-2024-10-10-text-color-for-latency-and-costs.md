[← Back to changelog](https://langfuse.com/changelog#2024-10-10-text-color-for-latency-and-costs)
October 10, 2024
# Aggregated and Color-coded Latency and Costs on Traces
Marc Klingen
Large traces can be hard to read. We've added aggregated latency and cost information to the every span level to make it easier to spot outliers and debug the LLM application.
  1. All spans in a trace now show **aggregated latency and cost information** from nested observations. Learn more about the tracing data model [here](https://langfuse.com/docs/tracing).
  2. **Optionally, you can enable color-coding** to make it easier to detect outliers and debug the LLM application. You can toggle this via the `%` button in the top right corner of the trace view. Based on the ratio of the spans latency/cost to the total trace latency/cost, the color is determined as follows:
     * Red: When the ratio is 75% or higher.
     * Yellow: When the ratio is between 50% and 75%.
     * No color: When the ratio is below 50%.


This change was based on feedback from a YC company building complex LLM agents. If you think the Langfuse interface could be improved to help you understand and debug your LLM applications, please share this with us via [GitHub](https://langfuse.com/ideas)!
## [Learn more](https://langfuse.com/changelog/2024-10-10-text-color-for-latency-and-costs#learn-more)
Was this page helpful?
[PreviousAnnotation Queues](https://langfuse.com/changelog/2024-10-10-annotation-queues)[NextAmazon Bedrock support for LLM Playground and Evaluations](https://langfuse.com/changelog/2024-10-11-bedrock-support-playground-evals)
