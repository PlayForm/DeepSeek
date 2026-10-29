Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/tempo/latest/visualize-traces.md, or by sending Accept: text/markdown to https://grafana.com/docs/tempo/latest/visualize-traces/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
Visualize tracing data in Grafana
Visualize data
Open source 
# Visualize tracing data in Grafana 
Grafana has a built-in Tempo data source that can be used to query Tempo and visualize traces. This page describes the high-level features and their availability. Use the latest versions for best compatibility and stability.
## Query your data 
Using tracing data in Grafana and Grafana Cloud Traces, you can search for traces, generate metrics from spans, and link your tracing data with logs, metrics, and profiles.
> Note
> Trace results for matching spans are returned on a first-match basis. These results may not be the latest traces stored by Tempo.
### Use Traces Drilldown to investigate tracing data 
[Grafana Traces Drilldown](https://grafana.com/docs/grafana-cloud/visualizations/simplified-exploration/traces/) helps you visualize insights from your Tempo traces data. Using the app, you can:
  * Use _Rate_ , _Errors_ , and _Duration_ (RED) metrics derived from traces to investigate issues
  * Uncover related issues and monitor changes over time
  * Browse automatic visualizations of your data based on its characteristics
  * Do all of this without writing TraceQL queries


Expand your observability journey and learn about [the Drilldown apps suite](https://grafana.com/docs/grafana-cloud/visualizations/simplified-exploration/).
### Search for traces 
Search for traces using common dimensions such as time range, duration, span tags, service names, etc. Use the Explore trace view to quickly diagnose errors and high latency events in your system.
### Search is non-deterministic 
Most search functions are deterministic. When given the same criteria, a deterministic algorithm returns consistent results. For example, let’s say that you query a search engine for the definition of “traces.” The results list the same top matches for each query for “traces” in that search engine.
However, Tempo search is non-deterministic. If you perform the same search twice, you’ll get different lists, assuming the possible number of results for your search is greater than the number of results you have your search set to return.
When performing a search, Tempo does a massively parallel search over the given time range, and takes the first `N` results. Even identical searches differ due to things like machine load and network latency. This approach values speed over predictability and is quite simple; enforcing that the search results are consistent would introduce additional complexity (and increase the time the user spends waiting for results). TraceQL follows the same behavior.
By adding `most_recent=true` to your TraceQL queries, the search results become deterministic. For more information, refer to [Retrieve most recent results](https://grafana.com/docs/tempo/latest/traceql/construct-traceql-queries/#retrieve-most-recent-results-experimental).
#### Use trace search results as panels in dashboards 
You can embed tracing panels and visualizations in dashboards. You can also save queries as panels. For more information, refer to the [Traces Visualization](https://grafana.com/docs/grafana-cloud/visualizations/panels-visualizations/visualizations/traces/#add-traceql-with-table-visualizations) documentation.
For example dashboards, visit [`play.grafana.org`](https://play.grafana.org).
  * [Traces and basic operations](https://play.grafana.org/d/fab5705a-e213-4527-8c23-92cb7452e746/traces-and-basic-operations-on-them?orgId=1)
  * [Grafana Explore with a Tempo data source](https://play.grafana.org/explore?schemaVersion=1&panes=%7B%22cf2%22:%7B%22datasource%22:%22grafanacloud-traces%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22tempo%22,%22uid%22:%22grafanacloud-traces%22%7D,%22queryType%22:%22traceqlSearch%22,%22limit%22:20,%22tableType%22:%22traces%22,%22filters%22:%5B%7B%22id%22:%22ab3bc4be%22,%22operator%22:%22%3D%22,%22scope%22:%22span%22%7D%5D%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1)


### Use TraceQL to query data and generate metrics 
Inspired by PromQL and LogQL, TraceQL is a query language designed for selecting traces.
Using Grafana **Explore** , you can search traces. The default traces search reviews the whole trace. TraceQL provides a method for formulating precise queries so you can zoom in to the data you need. Query results return faster because the queries limit what is searched.
You can construct queries using the [TraceQL query editor](https://grafana.com/docs/grafana/next/datasources/tempo/query-editor/traceql-editor/) or use the [Search query type](https://grafana.com/docs/grafana/next/datasources/tempo/query-editor/traceql-search/).
For details about constructing queries, refer to the [TraceQL documentation](https://grafana.com/docs/tempo/latest/traceql/).
#### TraceQL metrics queries 
TraceQL language provides metrics queries. Metric queries extend trace queries by applying an aggregate function to trace query results. For example: `{ span:name = "foo" } | rate() by (span:status)` This powerful feature creates metrics from traces, much in the same way that LogQL metric queries create metrics from logs.
[Grafana Traces Drilldown](https://grafana.com/docs/grafana-cloud/visualizations/simplified-exploration/traces/) is powered by metrics queries.
For more information about available queries, refer to [TraceQL metrics queries](https://grafana.com/docs/tempo/latest/traceql/metrics-queries/).
### Generate metrics from spans 
RED metrics can drive service graphs and other ready-to-go visualizations of your span data. RED metrics represent:
  * _Rate_ , the number of requests per second
  * _Errors_ , the number of those requests that are failing
  * _Duration_ , the amount of time those requests take


For more information about RED method, refer to [The RED Method: how to instrument your services](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/).
To enable metrics-generator in Grafana Cloud, refer to [Enable metrics-generator](https://grafana.com/docs/grafana-cloud/send-data/traces/metrics-generator/).
To enable metrics-generator for Tempo, refer to [Configure metrics-generator](https://grafana.com/docs/tempo/latest/configuration/#metrics-generator).
These metrics exist in your Hosted Metrics instance and can also be easily used to generate powerful custom dashboards.
Metrics automatically generate exemplars as well which allows easy metrics to trace linking.
#### Service graph view 
Service graph view displays a table of request rate, error rate, and duration metrics (RED) calculated from your incoming spans. It also includes a node graph view built from your spans.
To use the service graph view, you need to enable [service graphs](https://grafana.com/docs/tempo/latest/metrics-generator/service_graphs/) and [span metrics](https://grafana.com/docs/tempo/latest/metrics-generator/span_metrics/). After it’s enabled, this pre-configured view is immediately available in **Explore > Service Graphs**.
Refer to the [service graph view documentation](https://docs/tempo/latest/metrics-generator/service-graph-view) for further information.
## Integrate other telemetry signals 
### Link traces and logs 
If you’re already doing request/response logging with trace IDs, they can be easily extracted from logs to jump directly to your traces.
In the other direction, you can configure Grafana and Grafana Cloud to create a link from an individual span to your Loki logs. If you see a long-running span or a span with errors, you can immediately jump to the logs of the process causing the error.
> Note
> Cloud Traces only supports custom tags added by Grafana Support. Cloud Traces supports these default tags: `cluster`, `hostname`, `namespace`, and `pod`. Contact Support to add a custom tag.
### Link traces and metrics 
Grafana can correlate different signals by adding the functionality to link between traces and metrics. [Trace to metrics](https://grafana.com/blog/2022/08/18/new-in-grafana-9.1-trace-to-metrics-allows-users-to-navigate-from-a-trace-span-to-a-selected-data-source/) lets you navigate from a trace span to a selected data source. Using trace to metrics, you can quickly see trends or aggregated data related to each span.
For example, you can use span attributes to metric labels by using the `$__tags` keyword to convert span attributes to metrics labels.
To set up Trace to metrics for your data source, refer to [Trace to metric configuration](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/data-sources/tempo/configure-tempo-data-source/#trace-to-metrics).
### Link traces and profiles 
Using Trace to profiles, you can correlate different signals by adding the functionality to link between traces and profiles.
Trace to profiles lets you link your [Grafana Pyroscope](https://grafana.com/docs/pyroscope/latest/) data source to tracing data in Grafana or Grafana Cloud. When configured, this connection lets you run queries from a trace span into the profile data.
For more information, refer to the [Traces to profiles documentation](https://grafana.com/docs/grafana/next/datasources/tempo/configure-tempo-data-source/#trace-to-profiles) and the [Grafana Pyroscope data source documentation](https://docs/grafana/next/datasources/grafana-pyroscope/).
For Cloud Traces, Refer to the [Traces to profiles documentation](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/data-sources/tempo/configure-tempo-data-source/#trace-to-profiles) for configuration instructions.
## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/tempo/edit/release-v3.1/docs/sources/tempo/visualize-traces/_index.md)[Create a GitHub issue ](https://github.com/grafana/tempo/issues/new?title=Documentation%20feedback:%20/docs/sources/tempo/visualize-traces/_index.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with tracing and Grafana Tempo In this webinar, we'll show you how to get started setting up Grafana Tempo, our open source, easy-to-use and high-volume distributed tracing backend. ](https://grafana.com/go/webinar/getting-started-with-tracing-and-grafana-tempo/?pg=docs-tempo-latest-visualize-traces&plcmt=related)[ Video Scaling your distributed tracing with Grafana Tempo In this demo, we’ll show how Grafana Tempo allows you to scale tracing as far as possible with less operational cost and complexity than ever before. ](https://grafana.com/go/webinar/grafana-tempo-for-distributed-tracing/?pg=docs-tempo-latest-visualize-traces&plcmt=related-2)[ Video How Grafana and Tempo 2.0 make it easier to explore distributed traces Learn best practices for operating Grafana Tempo and tips and tricks to find and visualize "needle in the haystack" traces with TraceQL. ](https://grafana.com/events/grafanacon/2023/oss-distributed-tracing-with-traceql/?pg=docs-tempo-latest-visualize-traces&plcmt=related-3)
Ask Grafana Assistant 
