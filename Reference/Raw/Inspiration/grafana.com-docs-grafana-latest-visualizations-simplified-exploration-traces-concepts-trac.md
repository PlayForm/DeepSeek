Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/visualizations/simplified-exploration/traces/concepts/trace-structure.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/visualizations/simplified-exploration/traces/concepts/trace-structure/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
Trace structure
Trace structure
Enterprise  Open source 
# Trace structure 
Traces are telemetry data structured as trees. Traces are made of spans (for example, a span tree); there is a root span that can have zero to multiple branches that are called child spans. Each child span can itself be a parent span of one or multiple child spans, and so on so forth.
In the specific context of Tempo and [TraceQL query language](https://grafana.com/docs/tempo/latest/traceql/), a span has the following associated fields:
  * **name** : the span name
  * **duration** : difference between the end time and start time of the span
  * **status** : enum: `{ok, error, unset}`. For details, refer to [OTel span status](https://opentelemetry.io/docs/concepts/signals/traces/#span-status) documentation.
  * **kind** : enum: `{server, client, producer, consumer, internal, unspecified}`. For more details, refer to [OTel span kind](https://opentelemetry.io/docs/concepts/signals/traces/#span-kind) documentation.
  * Attributes


The first four properties are _intrinsics_. Intrinsics are the core, built-in fields that are fundamental to the identity and lifecycle of spans and traces. These fields are defined by the OpenTelemetry specification and are always present. They describe the essential structure of distributed tracing data.
_Attributes_ are custom span metadata in the form of key-value pairs. There are four types of attributes: span attributes, resource attributes, event attributes, and link attributes.
_Span attributes_ are key-value pairs that contain metadata that you can use to annotate a span to carry information about the operation it’s tracking. For example, in an eCommerce application, if a span tracks an operation that adds an item to a user’s shopping cart, the user ID, added item ID and cart ID can be captured and attached to the span as span attributes.
A _resource attribute_ represents information about an entity producing the span. For example, a span created by a process running in a container deployed by Kubernetes could link a resource that specifies the cluster name, namespace, pod, and container name. Resource attributes are resource-related metadata (key-value pairs) that are describing the Resource.
An _event attribute_ represents a unique point in the time during the span’s duration. For more information, refer to [All about span events](https://grafana.com/blog/2024/08/15/all-about-span-events-what-they-are-and-how-to-query-them/#how-to-query-span-events-with-traceql) and [Span events](https://opentelemetry.io/docs/concepts/signals/traces/#span-events) in the OTEL documentation.
A _link attribute_ lets you query link data in a span. A span link associates one span with one or more other spans that are a causal relationship. For more information on span links, refer to the [Span Links](https://opentelemetry.io/docs/concepts/signals/traces/#span-links) documentation in the Open Telemetry project.
The OpenTelemetry specification defines Semantic Attributes for Spans and for Resources. Semantic Span Attributes are a set of naming schemes for attributes shared across languages, frameworks, and runtimes. For more details, refer to [Trace Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/general/trace/) and [Resource Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/resource/).
## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/traces-drilldown/edit/main/docs/sources/concepts/trace-structure.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/visualizations/simplified-exploration/traces/concepts/trace-structure.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-visualizations-simplified-exploration-traces-concepts-trace-structure&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-visualizations-simplified-exploration-traces-concepts-trace-structure&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-visualizations-simplified-exploration-traces-concepts-trace-structure&plcmt=related-3)
Ask Grafana Assistant 
