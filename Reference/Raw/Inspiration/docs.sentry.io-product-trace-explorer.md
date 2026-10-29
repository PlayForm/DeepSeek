  * [Product Walkthroughs](https://docs.sentry.io/product/)
  * [Traces and Spans](https://docs.sentry.io/product/trace-explorer/)


Copy page
# Traces and Spans
## Learn how to use Sentry's Trace Explorer to search span data, find distributed traces, and debug performance issues across your entire application stack.
[**Trace Explorer**](https://sentry.io/orgredirect/organizations/:orgslug/traces/) in Sentry is designed to make performance investigation easier and more intuitive. You can explore span samples, visualize span attributes, and aggregate your data with flexible queries and filters. This guide will walk you through the key concepts and features of Trace Explorer. To learn more about Explore as a whole, see [Explore](https://docs.sentry.io/product/explore/).
## [Key Concepts](https://docs.sentry.io/product/trace-explorer/#key-concepts)
  * A trace represents a series of transactions or requests through a single system. This includes things like user browser sessions, HTTP requests, DB queries, middleware, caches and more.
  * It captures a series of operations (_spans_) that show how different parts of your application interacted during each transaction.
  * Each trace is identified by a **Trace ID** , which you can use to follow a request across services or projects.
  * A [distributed trace](https://docs.sentry.io/platforms/javascript/tracing/distributed-tracing/#what-is-distributed-tracing) is made of transactions and spans that traverse multiple servers, clients, edge workers, and other parts of your system. It is assembled by passing the Trace ID through browser headers.


  * A _span_ represents an individual operation within a trace. This could be a database query, HTTP request, or UI rendering task.
  * Each span has:
    * **Attributes** : Key-value pairs such as `http.method` or custom attributes such as `payment.provider` provide context for debugging an operation and investigating patterns. Numeric attributes can also be aggregated across sampled spans.
    * **Duration (`span.duration`)**: The time the operation took, used to measure performance.


### [Aggregating Span Attributes](https://docs.sentry.io/product/trace-explorer/#aggregating-span-attributes)
You can group span durations by custom span attributes to investigate patterns, such as `p95(span.duration)` by `payment.provider`. These aggregations query sampled span data. See your SDK's [tracing instrumentation guide](https://docs.sentry.io/platform-redirect/?next=%2Ftracing%2Finstrumentation%2F) for examples of adding attributes to spans. For counters, gauges, and distributions independent of trace sampling, use [Application Metrics](https://docs.sentry.io/product/metrics/).
## [Practical Examples](https://docs.sentry.io/product/trace-explorer/#practical-examples)
  * **See your changes in action** : Search for `span.domain is localhost:XXXX` and sort by Timestamp to see traces from your dev environment.
  * **Diagnosing slow pages** : Search for `span.op:navigation` and visualize `p90(span.duration)` to pinpoint slow page loads.
  * **Finding problematic API calls** : Aggregate by `http.url` and filter where `avg.(span.duration) > 2s` to identify slow external API calls.
  * **Database query analysis** : Aggregate by `db.query` and sort by `avg(span.duration)` to find inefficient queries.


### [Agent Tracing](https://docs.sentry.io/product/trace-explorer/#agent-tracing)
Set up [Agent Tracing](https://docs.sentry.io/platform-redirect/?next=%2Fagent-tracing%2F) to capture traces for agents in Trace Explorer. [Agent traces](https://docs.sentry.io/product/agents/) include model calls, tool executions, and token usage, so you can use the same search and aggregation tools when debugging agents.
  * **Finding slow agent runs** : Search for `span.op:gen_ai.invoke_agent` and visualize `p90(span.duration)` grouped by `gen_ai.agent.name` to compare traces for agents.
  * **Debugging tool calls** : Search for `span.op:gen_ai.execute_tool` and visualize `avg(span.duration)` grouped by `gen_ai.tool.name` to find tools that stall your agent.


## [Browsing Span and Trace Samples](https://docs.sentry.io/product/trace-explorer/#browsing-span-and-trace-samples)
Browse span and trace samples, then inspect a single span or trace:
  1. **Search for Samples** :
     * Use the search bar to filter results based on default or custom attributes, tags, and strings like `http.request_method is "GET`
     * **Edit and add** columns in the span samples table to view any attribute
     * **Sort** by clicking the column header to toggle between ascending and descending
     * Switch between **Span Samples** and **Trace Samples** tabs depending on your focus.
  2. **Inspect Samples** :
     * Clicking on a **Span ID** or **Trace ID** opens the **Trace Waterfall View** , showing the sequence of operations and their durations.
     * You can explore individual spans in detail or see the trace's overall structure.


## [Visualizing Span Attributes](https://docs.sentry.io/product/trace-explorer/#visualizing-span-attributes)
The Visualize section charts an aggregate of any span attribute.
  1. **Set Up Visualization** :
     * Use the **Visualize** section to add metrics like `avg(span.duration)` or `p90(span.duration)` to the same chart by clicking **Add Series** or a different chart by clicking the **+** icon.
     * You can also create custom visualizations like:
       * **P90 of span durations** : Useful for identifying outliers.
       * **Average cache size** : Analyze attributes specific to backend spans.
  2. **Filter Your Data** :
     * Refine your visualization by applying filters in the search bar, such as `span.op:db` to focus on database spans or `http.status_code:500` for errors.


The line chart updates dynamically as you apply filters, helping you track trends and identify anomalies.
## [Aggregating Span Data](https://docs.sentry.io/product/trace-explorer/#aggregating-span-data)
The Aggregates tab groups span data so you can compare patterns instead of reading individual spans.
  1. Click into the **Aggregates** tab.
  2. **Group By Attributes** to investigate patterns.
     * Try `http.method` to compare GET vs POST performance, `db.table` to find slow database operations, `span.op` to investigate patterns in your traces, or custom tags like cart value, CPU or memory usage, or anything else you can think of.
  3. **Filter and sort your aggregates** just like you would for transactions by querying in the search bar. Sort the table of aggregates by clicking the column headers (default: `timestamp`.)
  4. **View sample traces** that fit your aggregates by clicking the stack icon to the left side of the table rows. Use this to find outliers, debug issues, and find complex performance optimizations.


## [Compare Attributes (Beta)](https://docs.sentry.io/product/trace-explorer/#compare-attributes-beta)
Attribute Breakdowns is currently in beta. To access this feature, enable the Early Adopter flag in your [organization settings](https://sentry.io/orgredirect/organizations/:orgslug/settings/).
When investigating performance issues, you often need to answer: _"What's different about this spike compared to normal behavior?"_. Sentry's compare attributes feature lets you analyze attribute distributions between a selected time range and your baseline data without writing additional queries.
This helps you quickly identify whether a latency spike, error surge, or other anomaly is caused by a specific release, geographic region, browser, API endpoint, or any other attribute you've captured in your spans.
### [How to Use Attribute Comparison](https://docs.sentry.io/product/trace-explorer/#how-to-use-attribute-comparison)
  * On the Traces page, drag across a chart's timeline to narrow down to the time range that you want to compare. You will see an option to `Compare Attribute Breakdowns`.
  * When you click on `Compare Attribute Breakdowns`, the attribute comparison charts below will load with the baseline and time range differences. Purple bars on the left are the time range values, and gray bars on the right are the baseline values. **Note:** Clicking anywhere else on the page while in _compare attributes_ mode will stop the comparison and reset to baseline.


#### [Reading the Bar Charts](https://docs.sentry.io/product/trace-explorer/#reading-the-bar-charts)
Each chart displays two percentages, like `99.8% | 84.6%`:  
| Percentage  | Meaning  |  
| --- | --- |  
| First percentage (Selection)  | What % of spans in your **selected time range** have this attribute  |  
| Second percentage (Baseline)  | What % of spans in the **baseline** have this attribute  |  
A large difference in these percentages can indicate that the attribute is more (or less) present during the anomaly.
  * **Taller bars** = higher frequency of that attribute value within its cohort
  * If the distributions differ significantly, that attribute may explain the anomaly


Widgets are ordered based on how often the attribute is present in the selection vs the baseline. The most frequently occurring attributes are shown first.
### [Example: Debugging a Latency Spike](https://docs.sentry.io/product/trace-explorer/#example-debugging-a-latency-spike)
Suppose your p95 duration chart shows a spike from 3s to 12s. To investigate:
  1. **Drag-select the spike** on the p95 chart
  2. **Click** and choose "Compare Attribute Breakdowns" from the menu that appears
  3. **Review the breakdowns** to find attributes with different distributions:

  
| Attribute  | What to Look For  |  
| --- | --- |  
| `release`  | Is a new release version overrepresented in the spike?  |  
| `span.domain`  | Is a specific external domain causing slowdowns?  |  
| `user.geo.country_code`  | Are users in certain regions more affected?  |  
| `browser.name`  | Is the issue browser-specific?  |  
| `http.status_code`  | Are there more errors (5xx) in the spike?  |  
| `effectiveConnectionType`  | Are slow network connections involved?  |  
If, for example, you see that 80% of spans in your selection come from a specific `release` that only accounts for 20% of the baseline, you've likely found the culprit.
### [Best Practices](https://docs.sentry.io/product/trace-explorer/#best-practices)
  * **Look for the biggest differences** : Attributes where the selection and baseline distributions differ most are your best leads.
  * **Check coverage percentages** : Low coverage (e.g., `4.7% | 0.5%`) means the attribute isn't populated for most spans — take findings with caution.
  * **Use Group By together** : Combine attribute comparison with the Group By feature in Visualize to see trends broken down by your suspect attribute over time.


## [Cross-Event Querying](https://docs.sentry.io/product/trace-explorer/#cross-event-querying)
Cross-Event Querying lets you refine your span search by joining on additional Sentry event types connected by the same trace. This is useful when the data you need to filter on lives in a related event. For example, finding backend services that logged errors, or locating a representative trace based on attributes from an [Application Metrics](https://docs.sentry.io/product/metrics/) sample, where the data is not in the span itself.
Spans, logs, and application metrics are supported as join targets.
### [How to Use Cross-Event Querying](https://docs.sentry.io/product/trace-explorer/#how-to-use-cross-event-querying)
  1. In [Traces](https://sentry.io/orgredirect/organizations/:orgslug/explore/traces/), click the **Plus (+)** button next to the search bar.
  2. Choose the event type you want to join on: **Spans** , **Logs** , or **Metrics**.
  3. If you chose **Metrics** , pick the specific metric you want to join on (for example, `checkout.duration`).
  4. Add filters for that event type, such as `severity:error` on a logs join, `db.query:"SELECT *"` on a spans join, or `value > 5000` on a metrics join.


Traces returns spans whose trace also contains at least one event matching your join filter.
### [Example: Backend Services That Logged Errors](https://docs.sentry.io/product/trace-explorer/#example-backend-services-that-logged-errors)
To surface traces where a backend span ran alongside an error log:
  1. Enter your span filter, for example `span.op:http.server`.
  2. Click the **+** next to the search bar and choose **Logs**.
  3. Add `severity:error` to the Logs filter.


The span results now include only traces that also contain at least one error log.
### [Example: Finding a Comparable Trace for a Metric](https://docs.sentry.io/product/trace-explorer/#example-finding-a-comparable-trace-for-a-metric)
[Application Metrics](https://docs.sentry.io/product/metrics/) are typically sampled at 100%, while traces are sampled at a much lower rate, so a specific metric sample often won't have a trace attached to it. Joining on **Application Metrics** lets you search directly for traces that contain a matching metric event, giving you a comparable trace for the pattern you're investigating:
  1. In Traces, click the **Plus (+)** next to the search bar and choose **Application Metrics**.
  2. Pick the metric you want to trace back (for example, `checkout.duration`).
  3. Add filters that match the pattern you're investigating — for example, `value > 5000` for slow checkouts, or a custom attribute like `region:eu` to scope by segment.
  4. Pick a trace from the results. It contains at least one event of that metric matching your filter, giving you the same debugging context (spans, logs, related errors) as a trace directly attached to the metric sample would.


## [Save As Functionality](https://docs.sentry.io/product/trace-explorer/#save-as-functionality)
**Save as** stores the query, adds a dashboard widget, or creates a monitor. Saved and starred queries are shared across Explore. See [Save a Query](https://docs.sentry.io/product/explore/#save-a-query).
Run side-by-side comparisons of different queries to analyze changes in span data. Open compare from **Save as**.
## [Practical Examples](https://docs.sentry.io/product/trace-explorer/#practical-examples-1)
  * **Diagnosing slow pages** :
    * Search for `span.op:navigation` and visualize `p90(span.duration)` to pinpoint slow page loads.
  * **Finding problematic API calls** :
    * Group by `http.url` and filter where `avg(span.duration) > 2s` to identify slow external API calls.
  * **Database query analysis** : Group by `db.query` and sort by `avg(span.duration)` to find inefficient queries.


## [How Sampling Affects Queries in Trace Explorer](https://docs.sentry.io/product/trace-explorer/#how-sampling-affects-queries-in-trace-explorer)
You can use Sentry's SDKs to sample spans and control the volume of data sent to Sentry. Not every span gets captured when sampling is enabled, but Sentry will still give you accurate aggregate results by extrapolating the sampled data.
### [How It Works](https://docs.sentry.io/product/trace-explorer/#how-it-works)
Every span sent to Sentry includes its **sampling rate**. We also derive the **sampling weight** , which is the inverse of the rate and indicates the number of original spans that this sample represents.
For example:
  * At a rate of _10%_ , the weight is _10_.
  * At a rate of _50%_ , the weight is _2_.
  * At a rate of _100%_ , the weight is _1_.


All spans you send us after sampling get stored.
When you run queries in Trace Explorer, Sentry uses the sampling weight to compute counts, averages, and percentiles.
Let's say you query for spans where `span.op:db` and get **2 spans** in the results:  
| span_id  | span.op  | span.duration  | sampling_factor  | sampling_weight  |  
| --- | --- | --- | --- | --- |  
| a1b2c3  | db  | 100ms  | 0.1  | 10  |  
| d4e5f6  | db  | 200ms  | 0.5  | 2  |  
Since each span was sampled with different weights, Sentry extrapolates the **count** :
Plaintext
Copied

```
10 + 2 = 12 estimated spans

```


```
10 + 2 = 12 estimated spans

```

Traces displays **Count: 12**.
Similarly, Sentry incorporates the weight into **sum** :
Plaintext
Copied

```
10 * 100ms + 2 * 200ms = 1.4s

```


```
10 * 100ms + 2 * 200ms = 1.4s

```

Traces displays **Sum: 1.4ms**.
### [Averages and Percentiles](https://docs.sentry.io/product/trace-explorer/#averages-and-percentiles)
Averages and percentiles are **weighted**. You don't just average the 2 spans -- Sentry accounts for the fact that they represent a larger dataset. For example, the weighted average works like this:
Plaintext
Copied

```
(100ms * 10 + 200ms * 2) / (10 + 2) = 117ms (This is the average duration shown)

```


```
(100ms * 10 + 200ms * 2) / (10 + 2) = 117ms (This is the average duration shown)

```

Sentry treats this as a representation of the average across all 12 estimated spans. You can trust that metrics like `avg()` and `p90()` reflect your services' true health, adjusted for sampling.
### [Sampling Warnings](https://docs.sentry.io/product/trace-explorer/#sampling-warnings)
If your sampling rate is **too low** for an accurate extrapolation (for example, keeping less than 5% of an already low number of spans), Sentry may show a **low sampling rate warning**. This lets you know that extrapolation might be less reliable, especially for more restrictive queries.
Even if you sample your spans, extrapolation gives you reasonably accurate answers for counts, averages, and percentiles. You don't need to do anything extra.
### [When to Turn Off Extrapolation](https://docs.sentry.io/product/trace-explorer/#when-to-turn-off-extrapolation)
While extrapolation is usually helpful, if you are exclusively looking to confirm your sampling usage or look exclusively at sampled data, you can turn off extrapolation.
Disable extrapolation with the settings icon above the chart when you want the numbers to reflect only the spans Sentry stored.
### [How to Tweak Client Side Sampling to Find More Samples](https://docs.sentry.io/product/trace-explorer/#how-to-tweak-client-side-sampling-to-find-more-samples)
While you can set a uniform sampling rate with `tracesSampleRate`, the `tracesSampler` function gives you fine-grained control over sampling decisions. With `tracesSampler`, you can:
  * **Apply different sample rates to different transactions** : Sample critical endpoints at 100% while sampling less important ones at a lower rate.
  * **Use contextual information** : Make sampling decisions based on transaction name, attributes, or other context like user information or request properties.
  * **Filter out unwanted transactions** : Return `0` for transactions you don't want to capture at all.


For example, you might sample your checkout flow at 100% to catch any issues, while sampling your health check endpoint at only 1% to reduce noise. This targeted approach helps you capture the data that matters most while staying within your volume budget.
To configure `tracesSampler` for your SDK, see the tracing options in your SDK's [configuration documentation](https://docs.sentry.io/platform-redirect/?next=/configuration/options/).
Recent spans, logs, and metrics can show up as incomplete while ingestion catches up. See [Ingestion Delay](https://docs.sentry.io/product/explore/#ingestion-delay).
[ Previous Explore ](https://docs.sentry.io/product/explore/)
[ Next Errors ](https://docs.sentry.io/product/errors/)
Was this helpful?
Yes 👍No 👎
**Help improve this content** Our documentation is open source and available on GitHub. Your contributions are welcome, whether fixing a typo (drat!) or suggesting an update ("yeah, this would be better").
[How to contribute](https://docs.sentry.io/contributing/) | [Edit this page](https://github.com/getsentry/sentry-docs/edit/master/docs/product/trace-explorer/index.mdx) | [Create a docs issue](https://github.com/getsentry/sentry-docs/issues/new/choose) | [Get support](https://www.sentry.help/en/)
