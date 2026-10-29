Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/traces.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/traces/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
Traces
Traces
Grafana Cloud  Enterprise  Open source 
# Traces 
Traces visualizations let you follow a request as it traverses the services in your infrastructure. The traces visualization displays traces data in a diagram that allows you to easily interpret it. Traces visualizations currently render one trace traversal based on the traceID used in TraceQL or using a variable.
For more information about traces and how to use them, refer to the following documentation:
  * [Tracing in Explore](https://grafana.com/docs/grafana/latest/explore/trace-integration/)
  * [Tempo data source](https://grafana.com/docs/grafana/latest/datasources/tempo/)
  * [Getting started with Tempo](https://grafana.com/docs/tempo/latest/getting-started/)


Give it a try using Grafana Play
With Grafana Play, you can explore and see how it works, learning from practical examples to accelerate your development. This feature can be seen on [Traces Panel](https://play.grafana.org/d/edodkfmj0tce8f/).
## Add a panel with tracing visualizations 
After you have tracing data available in your Grafana instance, you can add tracing panels to your Grafana dashboards.
Using a dashboard variable, `traceID`, lets you create a query to show specific traces for a given trace ID. For more information about dashboard variables, refer to the [Variables documentation](https://grafana.com/docs/grafana/latest/dashboards/variables/).
### Before you begin 
To use this procedure, you need:
  * A Grafana instance
  * A [Tempo data source](https://grafana.com/docs/grafana/latest/datasources/tempo/) connected to your Grafana instance


### Steps 
To view and analyze traces data in a dashboard, you need to add the traces visualization to your dashboard and define a query using the panel editor. The query determines the data that is displayed in the visualization. For more information on the panel editor, refer to the [Panel editor documentation](https://grafana.com/docs/grafana/latest/panels-visualizations/panel-editor-overview/).
This procedure uses dashboard variables and templates to allow you to enter trace IDs which can then be visualized. You’ll use a variable called `traceId` and add it as a template query.
  1. From your Grafana instance, do one of the following:
     * On a new dashboard: Click or drag a panel onto the dashboard.
     * On an existing dashboard: Click **Edit** in the top-right corner, click the **Add new element** icon, and then click or drag a panel onto the dashboard.
  2. Click **Configure visualization** to open panel edit mode.
  3. In the query editor, click the data source list and select the appropriate tracing data source.
  4. In the top-right corner of the panel editor, select the **All visualizations** tab, search for, and select **Traces**.
  5. Under the **Panel options** , enter a **Title** for your trace panel or have Grafana create one using [generative AI features](https://grafana.com/docs/grafana/latest/dashboards/manage-dashboards/#set-up-generative-ai-features-for-dashboards).
For more information on the panel editor, refer to the [Configure panel options documentation](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-panel-options/).
  6. In the query editor, click the **TraceQL** query type tab.
  7. Enter `${traceId}` in the TraceQL query field to create a dashboard variable. This variable is used as the template query.
  8. Click **Back**.
  9. Click the **Add new element** icon and click **Variable**.
  10. Add a new variable called `traceId`, of variable type **Custom** , giving it a label if required.
  11. Click **Save**.
  12. Enter an optional description of your changes, and click **Save**.
  13. Click **Exit edit**.
  14. Verify that the panel works by using a valid trace ID for the data source used for the trace panel and editing the ID in the dashboard variable.


## Add TraceQL with table visualizations 
While you can add a trace visualization to a dashboard, having to manually add trace IDs as a dashboard variable is cumbersome. It’s more useful to instead be able to use TraceQL queries to search for specific types of traces and then select appropriate traces from matching results.
  1. In the same dashboard where you added the trace visualization, click **Edit** in the top-right corner.
  2. Click the **Add new element** icon, and then click or drag a panel onto the dashboard.
  3. Click **Configure visualization**.
  4. Select the same trace data source you used in the previous task.
  5. In the top-right corner of the panel editor, select the **All visualizations** tab, search for, and select **Table**.
  6. In the query editor, select the **TraceQL** tab.
  7. Under the **Panel options** , enter a **Title** for your trace panel or have Grafana create one using [generative AI features](https://grafana.com/docs/grafana/latest/dashboards/manage-dashboards/#set-up-generative-ai-features-for-dashboards).
  8. Add an appropriate TraceQL query to search for traces that you would like to visualize in the dashboard. This example uses a simple, static query. You can write the TraceQL query as a template query to take advantage of other dashboard variables, if they exist. This lets you create dynamic queries based on these variables.
  9. Click **Save**.
  10. Enter an optional description of your changes, and click **Save**.
  11. Click **Back** and **Exit edit**.


When results are returned from a query, the results are rendered in the panel’s table.
### Use a variable to add other links to traces 
The results in the traces visualization include links to the **Explore** page that renders the trace. You can add other links to traces in the table that fill in the `traceId` dashboard variable when selected, so that the trace is visualized in the same dashboard.
To create a set of data links in the panel, use the following steps:
  1. In the panel editor menu, under **Data links** , click **Add link**.
  2. Add a **Title** for the data link.
  3. Find the UUID of the dashboard by looking in your browser’s address bar when the full dashboard is being rendered. Because this is a link to a dashboard in the same Grafana instance, only the path of the dashboard is required.
  4. In the **URL** field, make a self-reference to the dashboard that contains both of the panels. This self-reference uses the value of the selected trace in the table to fill in the dashboard variable. Use the path for the dashboard from the previous step and then fill in the value of `traceId` using the selected results from the TraceQL table. The trace ID is exposed using the `traceID` data field in the returned results, so use that as the value for the dashboard variable.
  5. Select **Save** to save the data link.
  6. Enter an optional description of your changes, and click **Save**.
  7. Click **Back** and **Exit edit**.


You should now see a list of matching traces in the table visualization. While selecting the **TraceID** or **SpanID** fields will give you the option to either open the **Explore** page to visualize the trace or following the data link, selecting any other field (such as **Start time** , **Name** or **Duration**) automatically follows the data link, filling in the `traceId` dashboard variable, and then shows the relevant trace in the trace panel.
[ Follow the trace link populates the trace ID and displays the traces view](https://grafana.com/static/img/docs/panels/traces/screenshot-traces-trace-link-follow.png)
## Configuration options 
The following section describes the configuration options available in the panel editor pane for this visualization. These options are, as much as possible, ordered as they appear in Grafana.
### Panel options 
In the **Panel options** section of the panel editor pane, set options like the panel title, description, and show/hide rules. To learn more, refer to [Configure panel options](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/configure-panel-options/).
Expand table  
| Option  | Description  |  
| --- | --- |  
| Title  | Text entered in this field appears at the top of your panel in the panel editor and in the dashboard. You can use [variables you have defined](https://grafana.com/docs/grafana/latest/visualizations/dashboards/variables/) or [built-in variables](https://grafana.com/docs/grafana/latest/visualizations/dashboards/variables/built-in-variables/).  |  
| Description  | Add a description to a panel to share with users any important information about it, such as its purpose. Text entered in this field appears in a tooltip in the upper-left corner of the panel. Conversely, toggle on the **Use as subtitle** switch to display the description just below the panel title instead. You can use [variables you have defined](https://grafana.com/docs/grafana/latest/visualizations/dashboards/variables/) or dashboard-scoped [built-in variables](https://grafana.com/docs/grafana/latest/visualizations/dashboards/variables/built-in-variables/) (such as `$__from`, `$__to`, `$__dashboard`, `$__org`, and `$__user`). Query-scoped global variables (such as `$__interval` and `$__interval_ms`) are not available in this field.  |  
| Transparent background  | Toggle this switch on and off to control whether or not the panel has the same background color as the dashboard.  |  
| Panel links  | Add [links to the panel](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/manage-dashboard-links/#panel-links) to create shortcuts to other dashboards, panels, and external websites. Access panel links by clicking the icon next to the panel title.  |  
| Repeat options  | Set whether to repeat the panel for each value in the selected variable.  |  
| Show/hide rules  | Set whether to show or hide panels based on various rules.  |  
### Span filters options 
The **Span filters** options control the initial state of the span filters when the visualization loads, allowing you to customize your trace analysis view.
Expand table  
| Option  | Description  |  
| --- | --- |  
| Filters  |  Add free-form filters that set the initial span filter state. Use **Text search** for text queries, `duration` for duration filters, or span attributes such as `service.name` and `span.name`. Supports variable interpolation. For example, you can set a filter value to `$var`, and the visualization replaces it with the value for the dashboard variable named `$var`.  |  
| Show matches only  | Toggle the switch on to display only spans that match the defined filter criteria. This helps simplify trace interpretation.  |  
| Select critical path  | Toggle the switch on to highlight spans in the critical path, which helps identify performance bottlenecks and their impact on overall latency.  |  
Duration filters use the `duration` key with operators such as `=`, `>=`, `<=`, , and . In the visualization, users can toggle **Show all spans** to switch from the filtered view back to all spans.
## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/grafana/edit/release-13.3.1/docs/sources/visualizations/panels-visualizations/visualizations/traces/index.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/visualizations/panels-visualizations/visualizations/traces/index.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-visualizations-panels-visualizations-visualizations-traces&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-visualizations-panels-visualizations-visualizations-traces&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-visualizations-panels-visualizations-visualizations-traces&plcmt=related-3)
Ask Grafana Assistant 
