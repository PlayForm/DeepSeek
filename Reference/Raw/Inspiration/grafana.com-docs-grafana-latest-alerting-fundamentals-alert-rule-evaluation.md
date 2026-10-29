Save the Date!
Sign up to get the latest GrafanaCON 2026 updates, agenda drops, and first access to early-bird tickets when they’re first available.
[Sign up](https://grafana.com/events/grafanacon/)
We have our sightson Barcelona
[Save the Date](https://grafana.com/events/grafanacon/)
Watch the keynote again and signup for more on-demand sessions. 
📢 Registration + agenda now live  Explore the latest Grafana Cloud and AI solutions, learn tips & tricks from demos and hands-on workshops, and get actionable advice to advance your observability strategy. Register now and get 50% off - limited tickets available (while they last!). 
[Register now](https://grafana.com/events/observabilitycon/?tech=target&plcmt=top-banner&aud=default)
> Documentation for automated readersA curated documentation index is available at: https://grafana.com/llms.txtA complete documentation index is available at: https://grafana.com/llms-full.txtThese indexes can help with page discovery before fetching individual documents.
This page is also available in Markdown, which may be easier for automated readers and AI tools to parse than HTML. The Markdown version is available at https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation.md, or by sending Accept: text/markdown to https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/. For broader documentation discovery, the curated index is available at https://grafana.com/llms.txt and the complete index is available at https://grafana.com/llms-full.txt.
Alert rule evaluation
Alert rule evaluation
Grafana Cloud  Enterprise  Open source 
# Alert rule evaluation 
The criteria determining when an alert rule fires are based on three settings:
  * [Evaluation group](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#evaluation-group): how frequently the alert rule is evaluated.
  * [Pending period](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#pending-period): how long the condition must be met to start firing.
  * [Keep firing for](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#pending-period): how long the alert continues to fire after the condition is no longer met.
[ Set alert rule evaluation](https://grafana.com/media/docs/alerting/alert-rule-evaluation-2.png)


These settings affect how alert instances progress through their lifecycle.
## Alerting lifecycle 
Each alert rule can generate one or more alert instances.
An alert instance can be in any of the following states, depending on the outcome of the alert rule evaluation:
Expand table  
| State  | Description  |  
| --- | --- |  
| **Normal**  | The state of an alert when no alerting conditions (threshold breach, no data, or error) are met.  |  
| **Pending**  | The state of an alert when a condition (threshold breach, no data, or error) has been met, but the [pending period](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#pending-period) has not yet elapsed.  |  
| **Alerting**  | The state of an alert when the threshold has been breached after the [pending period](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#pending-period) has elapsed.  |  
| **Recovering**  | The state of a firing alert when the threshold is no longer breached, but the [keep firing for](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/#keep-firing-for) period has not yet elapsed.  |  
| **No Data ***  | The state of an alert when the query returns no data or all values are null after the pending period has elapsed. You can customize the behavior of the [No Data state](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/), which by default triggers a different alert.  |  
| **Error ***  | The state of an alert when an error or timeout occurs while evaluating the alert rule after the pending period has elapsed. You can customize the behavior of the [Error state](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/), which by default triggers a different alert.  |  
[ The lifecycle diagram of alert instances](https://grafana.com/media/docs/alerting/alert-rule-evaluation-full-statediagram_v3.svg)
If an alert rule changes (except for updates to annotations, the evaluation interval, or other internal fields), its alert instances reset to the **Normal** state, and update accordingly during the next evaluation.
> Note
> The **No Data** and **Error** states are supported only for Grafana-managed alert rules. Refer to [No Data and Error states](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/) to customize their default behavior for triggering a dedicated alert.
## Notification routing 
Alert instances are routed for [notifications](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/) in two scenarios:
  1. When they transition to the **Alerting** state.
  2. When they transition to **Normal** state and marked as `Resolved`, either from the **Alerting** or **Recovering** state.


## Evaluation group 
Every alert rule and recording rule is assigned to an evaluation group. Each evaluation group contains an **evaluation interval** that determines how frequently the rule is checked. For instance, the evaluation may occur every `10s`, `30s`, `1m`, `10m`, etc.
Rules can be evaluated concurrently or sequentially. For details, see [How rules are evaluated within a group](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/evaluation-within-a-group/).
## Pending period 
You can set a **Pending period** to prevent unnecessary notifications caused by temporary issues.
When an alerting condition is met, the alert instance enters the **Pending** state. It remains in this state while any alerting condition is met during the configured pending period. After the pending period has elapsed, the alert transitions to the state corresponding to the last evaluation.
This ensures the condition breach is stable before the alert transitions to the **Alerting** state and routed for notification.
  * **Normal** -> **Pending** -> **Alerting** *


You can also set the **Pending period** to zero to skip the **Pending** state entirely and transition immediately to the **Alerting** , **No Data** , or **Error** state.
## Keep firing for 
You can set a **Keep firing for** period to avoid repeated firing-resolving-firing notifications caused by flapping conditions.
When the alert condition is no longer met during the **Alerting** state, the alert instance enters the **Recovering** state.
  * **Alerting** → **Recovering** → **Normal (Resolved)** *
  * After the **Keep firing for** period elapses, the alert transitions to the **Normal** state and is marked as **Resolved**.
  * If the alert condition is met again, the alert transitions back to the **Alerting** state, and no new notifications are sent.


You can also set the **Keep firing for** period to zero to skip the **Recovering** state entirely.
## Evaluation example 
Keep in mind:
  * One alert rule can generate multiple alert instances—one for each series or dimension produced by the rule’s query. Alert instances from the same alert rule may be in different states.
  * Only alert instances in the **Alerting** and **Normal (Resolved)** state are routed for [notifications](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/).


Consider an alert rule with an **evaluation interval** set at every 30 seconds and a **pending period** of 90 seconds. The evaluation occurs as follows:
Expand table  
| Time  | Condition  | Alert instance state  | Pending counter  |  
| --- | --- | --- | --- |  
| 00:30 (first evaluation)  | Not met  | Normal  | -  |  
| 01:00 (second evaluation)  | Breached  | Pending  | 0s  |  
| 01:30 (third evaluation)  | Breached  | Pending  | 30s  |  
| 02:00 (fourth evaluation)  | Breached  | Pending  | 60s  |  
| 02:30 (fifth evaluation)  | Breached  | Alerting 📩  | 90s  |  
With a **keep firing for** period of 0 seconds, the alert instance transitions immediately from **Alerting** to **Normal** , and marked as `Resolved`:
Expand table  
| Time  | Condition  | Alert instance state  | Pending counter  |  
| --- | --- | --- | --- |  
| 03:00 (sixth evaluation)  | Not met  | Normal Resolved 📩  | 120s  |  
| 03:30 (seventh evaluation)  | Not met  | Normal  | 150s  |  
## Was this page helpful?
[Suggest an edit in GitHub ](https://github.com/grafana/grafana/edit/release-13.3.1/docs/sources/alerting/fundamentals/alert-rule-evaluation/_index.md)[Create a GitHub issue ](https://github.com/grafana/grafana/issues/new?title=Documentation%20feedback:%20/docs/sources/alerting/fundamentals/alert-rule-evaluation/_index.md)Email docs@grafana.com [Help and support ](https://grafana.com/help/)[Community](https://grafana.com/community/)
## Related resources from Grafana Labs
Additional helpful documentation, links, and articles:
[ Video Getting started with managing your metrics, logs, and traces using Grafana In this webinar, we’ll demo how to get started using the LGTM Stack: Loki for logs, Grafana for visualization, Tempo for traces, and Mimir for metrics. ](https://grafana.com/go/webinar/getting-started-with-grafana-lgtm-stack/?pg=docs-grafana-latest-alerting-fundamentals-alert-rule-evaluation&plcmt=related)[ Video Getting started with Grafana dashboard design In this webinar, you'll learn how to design stylish and easily accessible Grafana dashboards that tell a story. ](https://grafana.com/go/webinar/getting-started-with-grafana-dashboard-design/?pg=docs-grafana-latest-alerting-fundamentals-alert-rule-evaluation&plcmt=related-2)[ Video Building advanced Grafana dashboards In this webinar, we’ll demo how to build and format Grafana dashboards. ](https://grafana.com/go/webinar/building-advanced-grafana-dashboards/?pg=docs-grafana-latest-alerting-fundamentals-alert-rule-evaluation&plcmt=related-3)
Ask Grafana Assistant 
