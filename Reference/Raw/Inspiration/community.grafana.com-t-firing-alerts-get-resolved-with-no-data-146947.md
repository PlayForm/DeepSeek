#  [ Firing alerts get resolved with no data ](https://community.grafana.com/t/firing-alerts-get-resolved-with-no-data/146947)  
You have selected **0** posts.
[ select all ](https://community.grafana.com/t/firing-alerts-get-resolved-with-no-data/146947/5)
[ cancel selecting ](https://community.grafana.com/t/firing-alerts-get-resolved-with-no-data/146947/5)
840 views  3 links 
[ alespour ](https://community.grafana.com/u/alespour)
[ Mar 2025 ](https://community.grafana.com/t/firing-alerts-get-resolved-with-no-data/146947 "Post date")
I’m getting Firing alerts resolved with grafana_state_reason=MissingSeries annotation despite setting No data hadling → Alert state if no data to either to Keep Last State or Alerting.
Do I understand it wrong how it should work? I want the alerts to stay in Firing state when corresponding series gets missing in query result.
We are running v11.3.
Thank you.
840 views  3 links 
[ pepecano ](https://community.grafana.com/u/pepecano)
[ Mar 2025 ](https://community.grafana.com/t/firing-alerts-get-resolved-with-no-data/146947/2 "Post date")
Hi Alex,
This is the expected behaviour according to the docs.
[Stale alert instances](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/state-and-health/#lifecycle-of-stale-alert-instances):
> An alert instance is considered stale if its dimension or series has disappeared from the query results entirely for two evaluation intervals. Stale alert instances that are in the **Alerting** , **No Data** , or **Error** states transition to the **Normal** state as **Resolved**.
[`grafana_state_reason`](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/state-and-health/#grafana_state_reason-for-troubleshooting):
> Stale alert instances in the `Normal` state include the `grafana_state_reason` annotation with the value **MissingSeries**.
[ alespour ](https://community.grafana.com/u/alespour)
[ Mar 2025 ](https://community.grafana.com/t/firing-alerts-get-resolved-with-no-data/146947/3 "Post date")
Hi, thanks.
But there are configuration options (in section “3. Set evaluation behavior” of an alert rule) [Configure no data and error handling](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/state-and-health/#modify-the-no-data-or-error-state) that can be used to override this behavior, **I think**. I tried “Alert state if no data or all values are null” to set to:
  * Alerting - Sets the alert instance state to `Pending` and then transitions to `Alerting` once the pending period ends. If you sent the pending period to 0, the alert instance state is immediately set to `Alerting`
  * Keep Last State - Maintains the alert instance in its last state. Useful for mitigating temporary issues.


Neither worked for me. I had alert Alerting (Firing), series disappeared, alert state went to Normal and I received the notification Resolved | MissingSeries.
Thanks!
[ yuriy.tseretyan ](https://community.grafana.com/u/yuriy.tseretyan)
[ Mar 2025 ](https://community.grafana.com/t/firing-alerts-get-resolved-with-no-data/146947/4 "Post date")
This is expected. NoData and options to execute it as X is related to a situation when query does not return any points. Only in this case it is classified as no data. A situation when a series is missing is not considered as NoData. In this case, the alerting keeps the last state of the alert instance for 2 rule evaluation cycles and if it’s still missing, it evicts it from the state with transition Normal (MissingSeries). In Grafana 12 we will let users configure that number of evaluations.
[ alespour ](https://community.grafana.com/u/alespour)
[ Mar 2025 ](https://community.grafana.com/t/firing-alerts-get-resolved-with-no-data/146947/5 "Post date")
Thank you, Yuriy. I misunderstood what NoData means.
May I hope that the new option in Grafana 12 will allow users to set really large number (or even infinite) so it would effectively allow keep the last state forever?
Thanks.
Reply
###  Related topics   
|  Topic   |  Replies   |  Views   |  Activity   |  
| --- | --- | --- | --- |  
|  [Alerts getting closed stating Normal (Missingseries)](https://community.grafana.com/t/alerts-getting-closed-stating-normal-missingseries/118213) [Grafana](https://community.grafana.com/c/support/33)

 |  4.1k  |  
|  [(Datasource)NoData alerts stick around forever](https://community.grafana.com/t/datasource-nodata-alerts-stick-around-forever/160058) [Alerting](https://community.grafana.com/c/support/alerting/60)

 |  
|   |  14.6k  |  
|  [Alerting](https://community.grafana.com/c/support/alerting/60)

 |  30.3k  |  
|  [Disable Normal [Missingseries] alerts](https://community.grafana.com/t/disable-normal-missingseries-alerts/136912) [Alerting](https://community.grafana.com/c/support/alerting/60)

 |
