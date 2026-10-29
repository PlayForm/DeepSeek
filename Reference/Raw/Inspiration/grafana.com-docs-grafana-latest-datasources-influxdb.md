Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/datasources/influxdb.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/datasources/influxdb/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
InfluxDB data source
InfluxDB
Grafana Cloud  Enterprise  Open source 
Last reviewed: August 4, 2026
# InfluxDB data source 
[InfluxDB](https://www.influxdata.com/products/) is an open-source time series database (TSDB) developed by [InfluxData](https://www.influxdata.com/). It is optimized for fast, high-availability storage and retrieval of time series data in fields such as operations monitoring, application metrics, IoT sensor data, and real-time analytics.
Grafana ships with the InfluxDB data source out of the box. The data source is preinstalled in both Grafana OSS and Grafana Enterprise, so there’s nothing for you to install. It’s packaged as a standalone plugin that Grafana can update independently of Grafana releases. For details, refer to [Plugin updates](https://grafana.com/docs/grafana/latest/datasources/influxdb/#plugin-updates).
Grafana offers multiple configuration options for this data source, including a choice of three query languages (SQL, InfluxQL, and Flux). SQL and InfluxQL provide both visual builder and code editing modes, while Flux provides a code editor only.
## Supported versions 
This data source supports the following InfluxDB products:
  * InfluxDB OSS 1.x, 2.x, and 3.x
  * InfluxDB Enterprise 1.x and 3.x
  * InfluxDB Cloud Serverless
  * InfluxDB Cloud Dedicated
  * InfluxDB Cloud (TSM)


## Supported features 
Expand table  
| Feature  | Supported  |  
| --- | --- |  
| Metrics  | Yes  |  
| Logs  | Yes  |  
| Traces  | No  |  
| Alerting  | Yes  |  
| Annotations  | Yes  |  
## Get started 
The following documents help you set up and use the InfluxDB data source:
  * [Configure the InfluxDB data source](https://grafana.com/docs/grafana/latest/datasources/influxdb/configure/)
  * [InfluxDB query editor](https://grafana.com/docs/grafana/latest/datasources/influxdb/query-editor/)
  * [InfluxDB template variables](https://grafana.com/docs/grafana/latest/datasources/influxdb/template-variables/)
  * [InfluxDB annotations](https://grafana.com/docs/grafana/latest/datasources/influxdb/annotations/)
  * [Troubleshoot InfluxDB data source issues](https://grafana.com/docs/grafana/latest/datasources/influxdb/troubleshooting/)


## Additional features 
After configuring the data source, you can:
  * Use [Explore](https://grafana.com/docs/grafana/latest/explore/) to query data without building a dashboard.
  * Add [transformations](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/transform-data/) to manipulate query results.
  * Configure [template variables](https://grafana.com/docs/grafana/latest/dashboards/variables/) for dynamic dashboards.
  * [Build dashboards](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/) to visualize your InfluxDB data.
  * Set up [alerting](https://grafana.com/docs/grafana/latest/alerting/) rules based on your InfluxDB query results.


To see the InfluxDB data source in action, explore this demo dashboard on Grafana Play:
Give it a try using Grafana Play
With Grafana Play, you can explore and see how it works, learning from practical examples to accelerate your development. This feature can be seen on [InfluxDB 3.0: Hourly Electric Grid Monitor for US](https://play.grafana.org/d/f9a5b2d1-0227-4341-93fd-113fedba6481/).
## Plugin updates 
Starting with Grafana v13.2, the InfluxDB data source is a standalone plugin, preinstalled in both Grafana OSS and Enterprise. This enables more frequent updates independent of Grafana releases. Grafana automatically checks the plugin catalog and installs the latest version on each server restart.
To adjust this behavior:
  * **Opt out of auto-updates:** Set `preinstall_auto_update` to `false` in your [configuration file](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/).
  * **Update manually:** Update at any time from the **Administration > Plugins** page without restarting Grafana.


The standalone plugin requires Grafana 12.3.0 or later. The InfluxDB data source bundled with Grafana 13.1 and earlier continues to work as before. Those versions are unaffected by this change.
> Caution
> Grafana recommends running plugin version 13.1.0 or later. Earlier versions could write API tokens to Grafana server logs in plain text at default log levels. If you’ve run an earlier version, treat your server logs as sensitive and rotate any tokens that may have been exposed.
Users running Grafana 12.3.x through 13.1.x can install the standalone plugin from the plugin catalog if they want the latest features before upgrading to Grafana 13.2. To use the standalone plugin with these versions, add the following to your [configuration file](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/):
ini

```
[plugin.influxdb]
as_external = true

[plugins]
; Install the latest version on startup:
preinstall_sync = influxdb
; Or install a specific version:
; preinstall_sync = influxdb@<version>
```

On self-managed Grafana, you control the plugin version. To roll back after a problematic update, pin a known-good version with `preinstall_sync = influxdb@<version>` and restart Grafana, or install a specific version from the **Administration > Plugins** page.
> Note
> In Grafana Cloud, plugin updates are managed automatically. You can’t pin the plugin to a specific version or roll back to a previous one yourself. If a plugin update causes problems with your dashboards or queries, contact Grafana Support.
## Query with the Grafana CLI 
You can query this data source from the command line and from AI coding agents using the Grafana CLI, `gcx`. `gcx` gives you and your agent structured, terminal-based access to your Grafana data sources, which is useful for automation and agent-driven investigations.
`gcx` supports Grafana Cloud and Grafana OSS or Enterprise v12 and later. Before you query, install and authenticate `gcx`. Refer to the [`gcx` CLI documentation](https://grafana.com/docs/grafana/latest/ai-tools/grafana-cli/gcx/) for installation, configuration, and the full command reference.
For example, to query your InfluxDB data source, use the `gcx datasources influxdb` commands:
sh

```
# Run a query (InfluxQL, Flux, or SQL, auto-detected from the data source)
gcx datasources influxdb query -d DATASOURCE_UID 'SELECT mean("value") FROM "cpu" WHERE time > now() - 1h'

# List measurements (add --bucket to use Flux mode)
gcx datasources influxdb list-measurements -d DATASOURCE_UID

# List field keys and tag keys, optionally filtered by measurement
gcx datasources influxdb list-field-keys -d DATASOURCE_UID --measurement cpu
gcx datasources influxdb list-tag-keys -d DATASOURCE_UID --measurement cpu

# List the values for a tag key
gcx datasources influxdb list-tag-values -d DATASOURCE_UID --key host
```

Replace _`<DATASOURCE_UID>`_with the UID of your InfluxDB data source. You can omit the`-d` flag when `datasources.influxdb` is configured in your `gcx` context. The `list-field-keys`, `list-tag-keys`, and `list-tag-values` commands work in InfluxQL mode only.
## Related resources 
  * [Official InfluxDB documentation](https://docs.influxdata.com/)
  * [Grafana community forum](https://community.grafana.com/)


## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/grafana/edit/release-13.3.1/docs/sources/datasources/influxdb/_index.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/datasources/influxdb/_index.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-datasources-influxdb&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-datasources-influxdb&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-datasources-influxdb&plcmt=related-3)
Ask Grafana Assistant 
