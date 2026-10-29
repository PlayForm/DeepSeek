Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/visualizations/simplified-exploration/traces/concepts/telemetry.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/visualizations/simplified-exploration/traces/concepts/telemetry/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
Traces and telemetry
Traces and telemetry
Enterprise  Open source 
# Traces and telemetry 
Metrics, logs, traces, and profiles form the pillars of observability. Correlating between the four pillars of observability helps create a holistic view of your application and infrastructure.
## Metrics 
Metrics provide a high level picture of the state of a system. Metrics are the foundation of alerts because metrics are numeric values and can be compared against known thresholds. Alerts constantly run in the background and trigger when a value is outside of an expected range. This is typically the first sign that something is going on and are where discovery first starts. Metrics indicate that something is happening.
## Logs 
Logs provide an audit trail of activity from a single process that create informational context. Logs act as atomic events, detailing what’s occurring in the services in your application. Whereas metrics are quantitative (numeric) and structured, logs are qualitative (textual) and unstructured or semi-structured. They offer a higher degree of detail, but also at the expense of creating significantly higher data volumes. Logs let you know what’s happening to your application.
## Traces 
Traces add further to the observability picture by telling you what happens at each step or action in a data pathway. Traces provide a map of where something is going wrong. A trace provides a graphic representation of how long each step in the data flow pathway takes to complete. For example, how long a HTTP request, a database lookup, or a call to a third party service takes. It can show where requests initiate and finish, as well as how your system responds. This data helps you locate problem areas and assess their impact, often in places you never would have anticipated or found without this ability to trace the request flow.
## Profiles 
Profiles help you understand how your applications utilize compute resources such as CPU time and memory. This helps identify specific lines of code or functions to optimize and improve performance and efficiency.
## Why traces? 
Metrics in themselves aren’t sufficient to find the root cause and solve complex issues. The same can be said for logs, which can contain a significant amount of information but lack the context of the interactions and dependencies between the different components of your complex environment. Each pillar of observability has its own unique strength when it comes to root causing issues. To get the most value of your observability strategy, you need to be able to correlate them.
Traces have the unique ability to show relationships between services. They help identify which services are upstream from your service, which is helpful when you want to understand which services might be negatively impacted by problems in your service. Traces also help identify which services are downstream from your service. This is valuable since your application relies on their downstream services, and problems with those services may be the cause of elevated errors or latency reported by your service. For example, you can directly see the failing database and all impacted failing edge endpoints.
Using traces and [exemplars](https://grafana.com/docs/grafana/next/fundamentals/exemplars/), you can go from a metric data point and get to an associated trace.
Or from traces to logs:
And vice versa, from logs to traces.
## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/traces-drilldown/edit/main/docs/sources/concepts/telemetry.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/visualizations/simplified-exploration/traces/concepts/telemetry.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-visualizations-simplified-exploration-traces-concepts-telemetry&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-visualizations-simplified-exploration-traces-concepts-telemetry&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-visualizations-simplified-exploration-traces-concepts-telemetry&plcmt=related-3)
Ask Grafana Assistant 
