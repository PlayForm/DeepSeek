Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
No Data and Error states
No Data and Error states
Grafana Cloud  Enterprise  Open source 
# No Data and Error states 
Grafana Alerting implements the **No Data** and **Error** states to handle common scenarios when evaluating alert rules, and you can modify their behavior.
An alert instance can transition to these special states:
  * [No Data state](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/#no-data-state) occurs when the alert rule query runs successfully but returns no data points.
  * [Error state](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/#error-state) occurs when the alert rule fails to evaluate its query or queries successfully.


> Note
> No Data and Error states are supported only for Grafana-managed alert rules.
> Tip
> For common examples and practical guidance on handling **Error** , **No Data** , and **stale** alert scenarios, refer to the [Handle connectivity errors](https://grafana.com/docs/grafana/latest/alerting/best-practices/connectivity-errors/) and [Handle missing data](https://grafana.com/docs/grafana/latest/alerting/best-practices/missing-data/) guides.
##  `Error` state 
The **Error** state is triggered when the alert rule fails to evaluate its query or queries successfully.
This can occur due to evaluation timeouts (default: `30s`) or repeated failures (default: `3`) when querying the data source. The [`evaluation_timeout`](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#evaluation_timeout) and [`max_attempts`](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#max_attempts) options control these settings.
The **Error** state honors the [pending period](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#pending-period): the alert instance transitions `Normal → Pending → Error`. Set the pending period to `0` to skip the **Pending** state and enter **Error** immediately.
When an alert instance enters the **Error** state, Grafana, by default, triggers a new [`DatasourceError` alert](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/#no-data-and-error-alerts). You can control this behavior based on the desired outcome of your alert rule in [Modify the `No Data` or `Error` state](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/#modify-the-no-data-or-error-state).
##  `No Data` state 
The **No Data** state occurs when the alert rule query runs successfully but returns no data points at all.
The **No Data** state honors the [pending period](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#pending-period): the alert instance transitions `Normal → Pending → No Data`. Set the pending period to `0` to skip the **Pending** state and enter **No Data** immediately.
When an alert instance enters the **No Data** state, Grafana, by default, triggers a new [`DatasourceNoData` alert](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/#no-data-and-error-alerts). You can control this behavior based on the desired outcome of your alert rule in [Modify the `No Data` or `Error` state](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/#modify-the-no-data-or-error-state).
## Modify the `No Data` or `Error` state 
In [Configure no data and error handling](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/#configure-no-data-and-error-handling), you can configure the behavior when the evaluation returns no data or all values are null:
  * **Set No Data state** (Default)
If the pending period is `0`, the alert instance transitions immediately to **No Data**. Otherwise, it transitions to the **Pending** state, and then to **No Data** after the pending period has elapsed and the last evaluation returns no data.
When entering the **No Data** state, the alert rule creates a new `DatasourceNoData` alert instance with labels for the alert rule name, UID, and data source UID.
  * **Set Alerting state**
If the pending period is `0`, the alert instance transitions immediately to **Alerting**. Otherwise, it transitions to the **Pending** state, and then to **Alerting** after the pending period has elapsed and the last evaluation returns no data or a threshold breach.
  * **Set Normal state**
The alert instance transitions immediately to the **Normal** state.
  * **Keep last state**
The alert instance keeps its current state.


You can also configure the behavior when the evaluation returns an error or timeout:
  * **Set Error state** (Default)
If the pending period is `0`, the alert instance transitions immediately to **Error**. Otherwise, it transitions to the **Pending** state, and then to **Error** after the pending period has elapsed and the last evaluation returns an error.
When entering the **Error** state, the alert rule creates a new `DatasourceError` alert instance with labels for the alert rule name, UID, and data source UID.
  * **Set Alerting state**
If the pending period is `0`, the alert instance transitions immediately to **Alerting**. Otherwise, it transitions to the **Pending** state, and then to **Alerting** after the pending period has elapsed and the last evaluation returns an error or a threshold breach.
  * **Set Normal state**
The alert instance transitions immediately to the **Normal** state.
  * **Keep last state**
The alert instance keeps its current state.


Note that when you configure the **No Data** or **Error** behavior to set the **Alerting** or **Normal** state, Grafana attempts to keep a stable set of fields under notification `Values`. If your query returns no data or an error, Grafana re-uses the latest known set of fields in `Values`, but will use `-1` in place of the measured value.
### Keep last state 
The “Keep Last State” option helps mitigate temporary data source issues, preventing alerts from unintentionally firing, resolving, and re-firing.
However, in situations where strict monitoring is critical, relying solely on the “Keep Last State” option may not be appropriate. Instead, consider using an alternative or implementing additional alert rules to ensure that issues with prolonged data source disruptions are detected.
###  `No Data` and `Error` alerts 
When an alert rule evaluation results in a `No Data` or `Error` state, Grafana Alerting creates a new alert instance with the following additional labels:
  * `alertname`: Either `DatasourceNoData` or `DatasourceError` depending on the state.
  * `datasource_uid`: The UID of the data source that caused the state.
  * `rulename`: The name of the alert rule that originated the alert.


Note that `DatasourceNoData` and `DatasourceError` alert instances are independent from the original alert instance. They have different labels, which means existing silences, mute timings, and notification policies applied to the original alert may not apply to them.
You can manage these alerts like regular ones by using their labels to apply actions such as adding a silence, routing via notification policies, and more.
If the alert rule is configured to send notifications directly to a selected contact point (instead of using notification policies), the `DatasourceNoData` and `DatasourceError` alerts are also sent to that contact point. Any additional notification settings defined in the alert rule, such as muting or grouping, are preserved.
### Reduce `No Data` or `Error` alerts 
To minimize the number of **No Data** or **Error** state alerts received, try the following.
  1. Use the **Keep last state** option. For more information, refer to the section below. This option allows the alert to retain its last known state when there is no data available, rather than switching to a **No Data** state.
  2. For **No Data** alerts, you can optimize your alert rule by expanding the time range of the query. However, if the time range is too big, it affects the performance of the query and can lead to errors due to timeout.
To minimize timeouts resulting in the **Error** state, reduce the time range to request less data every evaluation cycle.
  3. Consider increasing the [pending period](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#pending-period). Since the **No Data** and **Error** states honor the pending period, a longer period can suppress `DatasourceNoData` and `DatasourceError` notifications for transient issues.
  4. To reduce multiple notifications from **Error** alerts, define a [notification policy](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/notification-policies/) to handle all related alerts with `alertname=DatasourceError`, and filter and group errors from the same data source using the `datasource_uid` label.
  5. Change the [evaluation timeout](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#evaluation_timeout) (default: `30s`) or the [retry mechanism (`max_attempts`)](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#max_attempts) settings. This should be a last resort, as it can affect the performance of all alert rules and may cause missed evaluations if the timeout is too long. For Grafana Cloud, open a support ticket from the [Cloud Portal](https://grafana.com/docs/grafana-cloud/account-management/support/#grafana-cloud-support-options).
> Tip
> For common examples and practical guidance on handling **Error** , **No Data** , and **stale** alert scenarios, refer to the [Handle connectivity errors](https://grafana.com/docs/grafana/latest/alerting/best-practices/connectivity-errors/) and [Handle missing data](https://grafana.com/docs/grafana/latest/alerting/best-practices/missing-data/) guides.


##  `grafana_state_reason` for troubleshooting 
Occasionally, an alert instance may be in a state that isn’t immediately clear to everyone. For example:
  * If “no data” handling is configured to transition to a state other than `No Data`.
  * If “error” handling is configured to transition to a state other than `Error`.
  * If the alert rule is deleted, paused, or updated in some cases, the alert instance also transitions to the `Normal` state.
  * [Stale alert instances](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/stale-alert-instances/) in the `Alerting` state transition to the `Normal` state when the series disappear.


In these situations, the evaluation state may differ from the alert state, and it might be necessary to understand the reason for being in that state when receiving the notification.
The `grafana_state_reason` annotation is included in these situations, providing the reason that explains why the alert instance transitioned to its current state. For example:
  * If “no data” or “error” handling transitions to the `Normal` state, the `grafana_state_reason` annotation is included with the value **No Data** or **Error** , respectively.
  * If the alert rule is deleted or paused, the `grafana_state_reason` is set to **Paused** or **RuleDeleted**. For some updates, it is set to **Updated**.
  * [Stale alert instances](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/stale-alert-instances/) in the `Normal` state include the `grafana_state_reason` annotation with the value **MissingSeries**.


## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/grafana/edit/release-13.3.1/docs/sources/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-alerting-fundamentals-alert-rule-evaluation-nodata-and-error-states&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-alerting-fundamentals-alert-rule-evaluation-nodata-and-error-states&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-alerting-fundamentals-alert-rule-evaluation-nodata-and-error-states&plcmt=related-3)
Ask Grafana Assistant 
