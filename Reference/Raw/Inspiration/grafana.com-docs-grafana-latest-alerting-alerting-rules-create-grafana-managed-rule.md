Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
Configure Grafana-managed alert rules
Configure Grafana-managed alert rules
Grafana Cloud  Enterprise  Open source 
> Caution
> Pre-provisioned Loki and Prometheus data source-managed alerts have been deprecated in Grafana Cloud and can not be created in new stacks. New Grafana Cloud stacks will use Grafana-managed alerting (GMA) by default. Datasource-managed alerting (DMA) is not provisioned in new stacks. Existing stacks are not affected.
> This applies to the default Loki and Prometheus Grafana Cloud data sources managed by Grafana Labs and Cloud Alertmanager, which will not be available nor will Grafana provision the data source for it. If you add your own Mimir, Loki, or Alertmanager data sources, you can continue to use data source-managed alerts.
> Cloud users can import DMA rules into GMA rules with the import tool. See the [import data source-managed alerts to Grafana-managed alerts documentation](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/alerting-migration/) for information on how to do this.
# Configure Grafana-managed alert rules 
Grafana-managed alert rules are the default way to create alert rules in Grafana.
Grafana-managed rules inherit their model from Prometheus Alerting and extend it with greater flexibility—such as multi-data source queries, expression-based transformations, advanced alert conditions, images in notifications, custom states, and more.
To create or edit Grafana-managed alert rules, follow the instructions below.
> Tip
> For quick-start tutorials on key alerting features, see [Getting started with Grafana Alerting tutorials](https://grafana.com/docs/grafana/latest/alerting/best-practices/tutorials/).
## Before you begin 
Before you create Grafana-managed alert rules, review the following requirements and options.
### Supported data sources 
Grafana-managed alert rules can query backend data sources when the data source’s `plugin.json` file sets `{"backend": true, "alerting": true}`.
Before you create an alert rule, verify that the data sources you plan to query are compatible and properly configured.
You can find the public data sources that support alert rules in the [Grafana Plugins directory](https://grafana.com/grafana/plugins/data-source-plugins/?features=alerting).
### Alert rule limits in Grafana Cloud 
In Grafana Cloud, the number of Grafana-managed alert rules you can create depends on your Grafana Cloud plan.
  * Free Forever plan: You can create up to 500 free alert rules, with each alert rule having a maximum of 1000 alert instances.
  * All paid plans: They have a soft limit of 2000 alert rules and support unlimited alert instances. To increase the limit, open a support ticket from the [Cloud portal](https://grafana.com/docs/grafana-cloud/account-management/support/).


### Permissions 
Only users with **Edit** permissions for the folder storing the rules can edit or delete Grafana-managed alert rules. Only admins can restore deleted Grafana-managed alert rules.
### Provisioning 
Note that if you delete an alert resource created in the UI, you can no longer retrieve it.
To backup and manage alert rules, you can [provision alerting resources](https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/) using options such as configuration files, Terraform, or the Alerting API.
### Default versus Advanced options 
Grafana Alerting provides multiple configuration options to support different alerting needs.
To simplify alert rule creation, some settings display a **Default** and an **Advanced** configuration view:
  * [Define query and condition](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/#define-query-and-condition)
  * [Configure notifications](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/#configure-notifications)


Use **Default** to create basic query conditions and route alerts directly to a contact point. Use **Advanced** for more complex query definitions, or to route alerts using notification policies.
You can switch between options at any time. After you create an alert rule, Grafana remembers your last selection and uses it as the default for the next rule.
## Set alert rule name 
  1. Click **Alerts & IRM** -> **Alert rules** -> **+ New alert rule**.
  2. Enter a name to identify your alert rule.
This name is displayed in the alert rule list. It is also the `alertname` label for every alert instance that is created from this rule.


## Define query and condition 
Define a query to get the data you want to measure and a condition that needs to be met before an alert rule fires.
Depending on the data source, the query editor offers a **Builder** and a **Code** option. **Builder** helps you construct a query with a visual interface. The **Builder** option is useful if you have limited experience with the query language, while **Code** lets you write the query directly for more control. Switch between them using the **Builder** and **Code** tabs on the query editor toolbar.
The **Default** option allows you to configure one query and one alert condition. The **Advanced** option allows you to use multiple queries and expressions for more complex rule definitions.
Default options
  1. Select a data source.
  2. Add a [query](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/queries-conditions/).
  3. Add an [alert condition](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/queries-conditions/#alert-condition).
The **When** input includes the reducer function and the last input is the threshold.
  4. Click **Preview** to verify.


Advanced options
  1. Select a data source.
  2. From the **Options** drop-down menu, specify a [time range](https://grafana.com/docs/grafana/latest/visualizations/dashboards/use-dashboards/#time-units-and-relative-ranges).
Note that Grafana Alerting only supports fixed relative time ranges, for example, `now-24hr: now`. It doesn’t support absolute time ranges: `2021-12-02 00:00:00 to 2021-12-05 23:59:592` or semi-relative time ranges: `now/d to: now`.
  3. Add a query.
To add multiple [queries](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/queries-conditions/), click **Add query**.
All alert rules are managed by Grafana by default. If you want to switch to a data source-managed alert rule, click **Switch to data source-managed alert rule**.
  4. Add one or more [expressions](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/queries-conditions/#expression-queries).
a. For each expression, select either **Classic condition** to create a single alert rule, or choose from the **Math** , **Reduce** , and **Resample** options to generate separate alert for each series.
When using Prometheus, you can use an instant vector and built-in functions, so you don’t need to add additional expressions.
b. Click **Preview** to verify that the expression is successful.
  5. To add a [recovery threshold](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/queries-conditions/#recovery-threshold), enable the **Custom recovery threshold** toggle and enter a value that defines when the alert should recover—transition to `Normal` state from the `Alerting` or `Pending` state.
You can only add one recovery threshold, and it must be part of the alert condition.
  6. Click **Set as alert condition** on the query or expression you want to set as your [alert condition](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/queries-conditions/#alert-condition).


You can switch between **Default** and **Advanced** options at any time.
Switching from **Advanced** to **Default** may result in queries and expressions that can’t be converted. In this case, a warning message asks if you want to continue to reset to default settings.
If the [Default versus Advanced options](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/#default-versus-advanced-options) feature is not enabled in your Grafana instance, follow the **Advanced options** instructions.
## Set folder and labels 
Organize your alert rule with a folder and set of labels.
In the **Labels** section, you can optionally choose whether to add labels to organize your alert rules and their notifications. For more details, refer to [alert rule labels](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/annotation-label/#labels).
  1. Select a folder or click **+ New folder**.
  2. Add labels, if required.
Add custom labels by selecting existing key-value pairs from the drop down, or add new labels by entering the new key or value.


## Configure alert evaluation behavior 
Use [alert rule evaluation](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/) to determine how frequently an alert rule should be evaluated and how quickly it should change its state.
To do this, you need to make sure that your alert rule is in the right evaluation group and set a pending period time that works best for your use case.
  1. Select an evaluation group or click **+ New evaluation group**.
If you are creating a new evaluation group, specify the interval for the group.
All rules within the same group are evaluated concurrently over the same time interval.
  2. Enter a [pending period](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#pending-period).
The pending period is the period in which an alert rule can be in breach of the condition until it fires.
After a condition is met, the alert goes into the **Pending** state. If the condition remains active for the duration specified, the alert transitions to the **Firing** state, else it reverts to the **Normal** state.
  3. Optionally, set the [Keep firing for](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#keep-firing-for) period.
You can set the minimum amount of time that an alert remains firing after the breached threshold expression no longer returns any results. This sets an alert to a “Recovering” state for the duration of time set here. The Recovering state can be used to reduce noise from flapping alerts. Select “none” to stop an alert from firing immediately after the breach threshold is cleared.
  4. Turn on pause alert notifications, if required.
You can pause alert rule evaluation to prevent noisy alerting while tuning your alerts. Pausing stops alert rule evaluation and doesn’t create any alert instances. This is different from [mute timings](https://grafana.com/docs/grafana/latest/alerting/configure-notifications/mute-timings/), which stop notifications from being delivered, but still allow for alert rule evaluation and the creation of alert instances.
  5. In **Configure no data and error handling** , you can define the alerting behavior and alerting state for two scenarios:
     * When the evaluation returns **No data** or all values are null.
     * When the evaluation returns **Error** or timeout.
### Configure no data and error handling 
Configure the behavior when the evaluation returns no data:
     * **Set No Data state** (Default)
If the pending period is `0`, the alert instance transitions immediately to **No Data**. Otherwise, it transitions to the **Pending** state, and then to **No Data** after the pending period has elapsed and the last evaluation returns no data.
When entering the **No Data** state, the alert rule creates a new `DatasourceNoData` alert instance with labels for the alert rule name, UID, and data source UID.
     * **Set Alerting state**
If the pending period is `0`, the alert instance transitions immediately to **Alerting**. Otherwise, it transitions to the **Pending** state, and then to **Alerting** after the pending period has elapsed and the last evaluation returns no data or a threshold breach.
     * **Set Normal state**
The alert instance transitions immediately to the **Normal** state.
     * **Keep last state**
The alert instance keeps its current state.
You can also configure the behavior when the evaluation returns an error:
     * **Set Error state** (Default)
If the pending period is `0`, the alert instance transitions immediately to **Error**. Otherwise, it transitions to the **Pending** state, and then to **Error** after the pending period has elapsed and the last evaluation returns an error.
When entering the **Error** state, the alert rule creates a new `DatasourceError` alert instance with labels for the alert rule name, UID, and data source UID.
     * **Set Alerting state**
If the pending period is `0`, the alert instance transitions immediately to **Alerting**. Otherwise, it transitions to the **Pending** state, and then to **Alerting** after the pending period has elapsed and the last evaluation returns an error or a threshold breach.
     * **Set Normal state**
The alert instance transitions immediately to the **Normal** state.
     * **Keep last state**
The alert instance keeps its current state.
For more details, refer to [alert instance states](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/stale-alert-instances/) and [modify the no data or error state](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/#modify-the-no-data-or-error-state).
  6. In **Configure no data and error handling** , you can also configure [Missing series evaluations to resolve](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/stale-alert-instances/#configure-missing-series-evaluations-to-resolve): how many consecutive evaluation intervals must pass without data before an alert instance is considered stale.


## Configure notifications 
Configure who receives notifications when the alert rule fires.
The **Default** option allows you to select a [contact point](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/contact-points/) to handle notifications for this alert rule. The **Advanced** option routes notifications through [notification policies](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/notification-policies/).
Default options
  1. Select an existing [contact point](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/contact-points/).
All notifications for this alert rule are sent to this contact point automatically and notification policies aren’t used.
  2. Optionally, configure additional notification settings like grouping or timing options.


Advanced options
With this option, all notifications for this alert rule are managed by the [notification policy tree](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/notification-policies/), which routes alerts based on their labels.
Click **Change** to change the routing from the default policy to another policy.
You can preview which notification policy would handle notifications from this alert rule.
  1. Click **Preview routing** after configuring the previous alert rule settings.
Based on the alert labels and query labels, Grafana displays the notification policies that would handle the notifications.
  2. Click **View route** to view policy and routing details.


You can switch between **Default** and **Advanced** options at any time.
If the [Default versus Advanced options](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/#default-versus-advanced-options) feature is not enabled in your Grafana instance, follow the **Advanced options** instructions.
## Configure notification message 
Use [annotations](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rules/annotation-label/#annotations) to add information to alert messages that can help respond to the alert.
Annotations are included by default in notification messages, and can use text or [templates](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/templates/) to display dynamic data from queries.
Grafana provides several optional annotations.
  1. Optional: Add a summary.
Short summary of what happened and why.
  2. Optional: Add a description.
Description of what the alert rule does.
  3. Optional: Add a Runbook URL.
Webpage where you keep your runbook for the alert
  4. Optional: Add a custom annotation.
Add any additional information that could help address the alert.
  5. Optional: **Link dashboard and panel**.
[Link the alert rule to a panel](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/link-alert-rules-to-panels/) to facilitate alert investigation.
  6. Click **Save rule**.


## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/grafana/edit/release-13.3.1/docs/sources/alerting/alerting-rules/create-grafana-managed-rule.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/alerting/alerting-rules/create-grafana-managed-rule.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-alerting-alerting-rules-create-grafana-managed-rule&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-alerting-alerting-rules-create-grafana-managed-rule&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-alerting-alerting-rules-create-grafana-managed-rule&plcmt=related-3)
Ask Grafana Assistant 
