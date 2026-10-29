Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/datasources/influxdb/alerting.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/datasources/influxdb/alerting/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
InfluxDB alerting
Alerting
Grafana Cloud  Enterprise  Open source 
Last reviewed: August 4, 2026
# InfluxDB alerting 
> You can use Grafana Cloud to avoid installing, maintaining, and scaling your own instance of Grafana. [Create a free account](https://grafana.com/auth/sign-up/create-user?pg=docs-grafana-latest-datasources-influxdb-alerting) to get started, which includes free forever access to 10k metrics, 50GB logs, 50GB traces, 500VUh k6 testing & more.
You can use Grafana Alerting with InfluxDB to create alerts based on your time-series data. This allows you to monitor metrics, detect anomalies, and receive notifications when specific conditions are met.
For general information about Grafana Alerting, refer to [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/).
## Before you begin 
Before creating alerts with InfluxDB, ensure you have:
  * An InfluxDB data source configured in Grafana
  * Appropriate permissions to create alert rules
  * Understanding of the metrics you want to monitor


## Supported query types 
InfluxDB alerting supports all three query languages: InfluxQL, SQL, and Flux. Queries must return time-series data for Grafana to evaluate values over time and trigger alerts when thresholds are crossed.
### Query language compatibility 
Expand table  
| Query language  | Alerting support  | Notes  |  
| --- | --- | --- |  
| InfluxQL  | Yes  | Use aggregation functions with GROUP BY time.  |  
| Flux  | Yes  | Use `aggregateWindow()` for time-based aggregation.  |  
| SQL  | Yes  | Use `$__timeFilter` and `$__dateBin` macros for time filtering.  |  
## Create an alert rule 
To create an alert rule using InfluxDB:
  1. Navigate to **Alerting** > **Alert rules**.
  2. Click **New alert rule**.
  3. Enter a name for the alert rule.
  4. Select your **InfluxDB** data source.
  5. Build your query using the query editor.
  6. Configure the alert condition (for example, when the average is above a threshold).
  7. Set the evaluation interval and pending period.
  8. Configure notifications and labels.
  9. Click **Save rule**.


For detailed instructions, refer to [Create a Grafana-managed alert rule](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/).
## Example alert queries 
The following examples show common alerting scenarios with InfluxDB.
### InfluxQL: Alert on high CPU usage 
Monitor CPU usage and alert when it exceeds a threshold:
  1. **Query:** Select the `cpu` measurement with `mean("usage_system")` as the aggregation.
  2. **GROUP BY:** `time($__interval)`
  3. **Condition:** When mean is above 90.


In raw query mode:
SQL

```
SELECT mean("usage_system") FROM "cpu" WHERE $timeFilter GROUP BY time($__interval) fill(null)
```

### Flux: Alert on memory pressure 
Monitor memory usage with a Flux query:
flux

```
from(bucket: "telegraf")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "mem")
  |> filter(fn: (r) => r["_field"] == "used_percent")
  |> aggregateWindow(every: v.windowPeriod, fn: mean)
  |> yield(name: "mean")
```

Set the condition to alert when the mean value exceeds 85.
### SQL: Alert on disk usage 
Monitor disk usage with an SQL query:
SQL

```
SELECT $__dateBin(time), mean(used_percent)
FROM disk
WHERE $__timeFilter(time)
GROUP BY $__dateBin(time)
```

Set the condition to alert when the mean value exceeds 80.
## Limitations 
When using InfluxDB with Grafana Alerting, be aware of the following limitations:
### Template variables not supported 
Alert queries can’t contain template variables. Grafana evaluates alert rules on the backend without dashboard context, so variables like `$hostname` or `$region` aren’t resolved.
If your dashboard query uses template variables, create a separate query for alerting with hard-coded values.
### Query complexity 
Complex queries with many nested functions or large result sets may timeout or fail to evaluate. Simplify queries for alerting by:
  * Reducing the time range
  * Using appropriate aggregation intervals
  * Adding filters to limit the data scanned


## Handle transient errors and timeouts 
Brief InfluxDB latency spikes or network interruptions can cause alert rule evaluations to fail. By default, a failed evaluation moves the rule into an error state, which can trigger a large number of spurious notifications at once even though your data is healthy.
To make alert rules resilient to transient errors:
  1. In the alert rule settings, expand **Configure no data and error handling** and set **Alert state if execution error or timeout** to **Keep Last State**. The rule keeps its previous state through brief evaluation failures instead of firing an error alert.
  2. Set a **Pending period** so the alert condition must be met for a sustained period across multiple evaluations before the alert fires.
  3. If evaluations fail because queries run out of time, increase the data source timeout. Refer to [Advanced HTTP settings](https://grafana.com/docs/grafana/latest/datasources/influxdb/configure/#advanced-http-settings) for details.
  4. Simplify or narrow alert queries so they complete well within the timeout. Refer to [Query complexity](https://grafana.com/docs/grafana/latest/datasources/influxdb/alerting/#query-complexity) for guidance.


For more information about error state handling, refer to [No data and error handling](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/#configure-no-data-and-error-handling).
## Best practices 
Follow these best practices when creating InfluxDB alerts:
  * **Use specific filters:** Add WHERE clauses or Flux filters to focus on relevant data and improve query performance.
  * **Choose appropriate intervals:** Match the GROUP BY time interval to your evaluation frequency.
  * **Test queries first:** Verify your query returns expected results in Explore before creating an alert.
  * **Set realistic thresholds:** Base alert thresholds on historical data patterns.
  * **Use meaningful names:** Give alert rules descriptive names that indicate what they monitor.


If you encounter errors when creating or evaluating alert rules, refer to [Troubleshoot InfluxDB data source issues](https://grafana.com/docs/grafana/latest/datasources/influxdb/troubleshooting/#alerting-errors).
## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/grafana/edit/release-13.3.1/docs/sources/datasources/influxdb/alerting/index.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/datasources/influxdb/alerting/index.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-datasources-influxdb-alerting&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-datasources-influxdb-alerting&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-datasources-influxdb-alerting&plcmt=related-3)
Ask Grafana Assistant 
