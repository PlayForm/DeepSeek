Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/visualizations/explore/trace-integration.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/visualizations/explore/trace-integration/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
Traces in Explore
Traces in Explore
Grafana Cloud  Enterprise  Open source 
# Traces in Explore 
You can use Explore to query and visualize traces from tracing data sources. Supported data sources include:


Here are some references to learn more about traces and how you can use them:
  * [Introduction to tracing](https://grafana.com/docs/tempo/latest/introduction/)
  * [Traces and telemetry](https://grafana.com/docs/tempo/latest/introduction/telemetry/)
  * [Using traces to find solutions to problems](https://grafana.com/docs/tempo/latest/introduction/solutions-with-traces/)


## Query editors 
You can query and search tracing data using a data source’s query editor. Note that data sources in Grafana have unique query editors.
For information on how to use the query editor to create queries for tracing data sources, refer to the documentation for each individual data source.
## Trace view 
The trace view provides an overview of a request as it travels through your system. The following sections provide detail on various elements of the trace view.
[ Trace view](https://grafana.com/media/docs/tempo/screenshot-grafana-trace-view.png)
### Header 
The trace view header includes the following:
  * **Header title** - Shows the name of the root span and trace ID.
  * **Search** - Highlights spans containing the searched text.
  * **Metadata** - Various metadata about the trace.

[ Trace view header](https://grafana.com/media/docs/tempo/screenshot-grafana-trace-view-header.png)
### Minimap 
**Minimap** displays a condensed view of the trace timeline. Drag your mouse over the minimap to zoom into a smaller time range. This also updates the main timeline, making it easier to view shorter spans When zoomed in, hovering over the minimap displays **Reset selection** , which resets the zoom.
[ Trace view minimap example](https://grafana.com/media/docs/tempo/screenshot-grafana-trace-view-minimap.png)
### Timeline 
Timeline shows list of spans within the trace. Each span row consists of the following components:
  * **Expand children** - Expands or collapses all the children spans of the selected span.
  * **Service name** - Name of the service logged the span.
  * **Operation name** - Name of the operation that this span represents.
  * **Span duration bar** - Visual representation of the operation duration within the trace.


Click anywhere on the span row to reveal span details.
[ Trace view timeline](https://grafana.com/media/docs/tempo/screenshot-grafana-trace-view-timeline.png)
The **Span duration bar** highlights the trace’s critical path with a darker segment. This darker segment means the span lies on the trace’s critical path, following the CRISP (Critical Path for Service Performance) algorithm.
Use the highlight to focus on spans that drive end‑to‑end latency. Spans outside the critical path do not increase the trace duration.
[ Critical path span](https://grafana.com/media/docs/grafana/explore/traces-panel-critical-path.png)
You can also focus on this path by clicking the **Show critical path only** button in the **Span filters** options.
### Span details 
Traces are composed of one or more spans. A span is a unit of work within a trace that has a start time relative to the beginning of the trace, a duration and an operation name for the unit of work. It usually has a reference to a parent span, unless it’s the first span, the root span, in a trace. It frequently includes key/value attributes that are relevant to the span itself, for example the HTTP method used in the request, as well as other metadata such as the service name, sub-span events, or links to other spans.
You can expand any span in a trace and view the details, including the span and resource attributes.
For more information about spans and traces, refer to [Introduction to tracing](https://grafana.com/docs/tempo/latest/introduction/) in the Tempo documentation.
Span details include span attributes, resource attributes, events, and links.
#### Span and resource attributes 
**Span attributes** are key-value pairs that provide metadata about a specific span. They give context to the operation being performed, such as information about the request, response, or any relevant operational details. For example, if the span deals with calling another service via HTTP, an attribute could include the HTTP URL (maybe as the span attribute key `http.url`) and the HTTP status code returned (as the span attribute `http.status_code`).
[ Trace view span attributes](https://grafana.com/media/docs/tempo/screenshot-grafana-trace-view-span-span-attributes.png)
**Resource attributes** are key-value pairs that describe the environment or entity that is producing the trace. They capture static information about the origin of traces, like the application name or the service version.
[ Trace view span resource attributes](https://grafana.com/media/docs/tempo/screenshot-grafana-trace-view-span-resource-attributes.png)
Span attributes are specific to a particular operation, while resource attributes are associated with the whole trace or the entire service emitting the spans. Refer to [Span and resource attributes](https://grafana.com/docs/tempo/latest/operations/best-practices/#span-and-resource-attributes) for more detail.
#### Events 
Events are log-like records attached to a span that represent an occurrence during its execution. They record notable moments or occurrences within the span’s lifecycle, such as errors, warnings, or checkpoints. If an error occurs during an operation, an event can be added to the span to indicate what went wrong and when. Events include a timestamp, name, and key-value pairs attributes that provide additional context or details about the event.
[ Trace view span events](https://grafana.com/media/docs/tempo/screenshot-grafana-trace-view-span-events.png)
#### Links 
Links show relationships between spans that are not in a direct parent-child relationship. They represent associations between spans that happen concurrently or across separate trace trees, linking traces that originated from separate sources but are logically connected, such as background job processing initiated from a web request. You might use links when a trace passes through an asynchronous queue or when correlating traces from different services.
### Span filters 
Span filters allow you to refine the spans displayed in the trace timeline viewer. The more filters you add, the more specific the filtered spans become. Click on a trace to access Span filters.
You can add one or more of the following filters:
  * **Service name** - Filter by selecting a service name from the dropdown.
  * **Span name** - Filter by selecting a span name from the dropdown.
  * **Duration** - Filter by duration. Accepted units include ns, us, ms, s, m, h.
  * **Tags** - Filter by tags, process tags, or log fields in your span.


To only show the spans you have matched, toggle **Show matches only**.
Refer to [Span filters](https://grafana.com/docs/grafana/latest/datasources/tempo/span-filters/) for more in depth information.
### Trace to logs 
You can navigate from a span in a trace view directly to logs relevant for that span. This feature is available for the Tempo, Jaeger, and Zipkin data sources. Refer to each individual data source’s documentation for configuration instructions.
Click the document icon to open a split view in Explore with the configured data source and query relevant logs for the span.
[ Trace to logs](https://grafana.com/media/docs/tempo/screenshot-grafana-trace-view-trace-to-logs.png)
### Trace to metrics 
You can navigate from a span in a trace view directly to metrics relevant for that span. This feature is available for the Tempo, Jaeger, and Zipkin data sources.
Refer to each individual data source’s documentation for configuration instructions. For Tempo, refer to [Trace to metrics configuration](https://grafana.com/docs/grafana/latest/datasources/tempo/configure-tempo-data-source/configure-trace-to-metrics/).
### Trace to profiles 
Using Trace to profiles, you can use Grafana’s ability to correlate different signals by adding the functionality to link between traces and profiles.
For Tempo, refer to [Trace to profiles](https://grafana.com/docs/grafana/latest/datasources/tempo/configure-tempo-data-source/configure-trace-to-profiles/) for configuration instructions.
### Trace correlations 
You can use [correlations](https://grafana.com/docs/grafana/latest/administration/correlations/) to define custom links that appear in the trace view based on trace and span information.
For Tempo, refer to [Trace correlations](https://grafana.com/docs/grafana/latest/datasources/tempo/configure-tempo-data-source/trace-correlations/) for configuration instructions.
## Node graph 
You can also expand the node graph for a displayed trace. If the data source supports it, this displays spans of the trace as nodes in the graph, or provides additional context, such as a service graph based on the current trace.
Refer to [Node graph](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/node-graph/) for additional information.
> Note
> The node graph requires data to be returned from the data source in a specific format to display correctly. Refer to [Data API](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/node-graph/#data-api), [Nodes data frame structure](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/node-graph/#nodes-data-frame-structure) and [Node graph data requirements](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/node-graph/#data-requirements) for additional information and configuration instructions.
[ Node graph](https://grafana.com/media/docs/tempo/screenshot-grafana-node-graph.png)
## Service graph 
A service graph visualizes rates, error rates, and durations (RED), along with service relationships. After the requirements are configured, this pre-configured view is immediately available.
For additional information refer to the following documentation:
  * [Service Graph and Service Graph view](https://grafana.com/docs/grafana/latest/datasources/tempo/service-graph/)
  * [Service graph view](https://grafana.com/docs/tempo/latest/metrics-generator/service-graph-view/) in Tempo documentation

[ Service graph view](https://grafana.com/static/img/docs/grafana-cloud/apm-overview.png)
## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/grafana/edit/release-13.3.1/docs/sources/visualizations/explore/trace-integration.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/visualizations/explore/trace-integration.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-visualizations-explore-trace-integration&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-visualizations-explore-trace-integration&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-visualizations-explore-trace-integration&plcmt=related-3)
Ask Grafana Assistant 
