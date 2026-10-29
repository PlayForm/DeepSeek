# See what's happening. Control what happens next.

AUTHORS: Hien Phan

PUBLISHED: Oct 29, 2026

CATEGORY: Debugging, Observability, Retries, Cloud, Timeouts

DURATION: 6 MIN

A customer asks why their order hasn't finished. Payment succeeded, but fulfillment hasn't started. Before you can help, you're checking logs, querying a database, and asking another team whether its service received the request. Once you find the problem, you still need a way to get the order moving again.

Temporal records the progress of application processes, called Workflows, and coordinates their execution through failures and long waits. Each Workflow has an [Event History](https://docs.temporal.io/encyclopedia/event-history) that records its execution, including completed steps and the events it's waiting to process. You can inspect that context while the work is still running.

For this October Product Edition, we're looking at Temporal's production controls: how to find work that needs attention, hold its progress during an investigation, and change how it proceeds. These capabilities build on Temporal's existing visibility and recovery tools, giving you more ways to intervene without writing a custom administration tool for each application.

## Find the work that needs your attention

After a deployment, some orders stop advancing. They haven't completed or failed outright, but the code coordinating them keeps encountering an error.

[Task Issues Detection](https://temporal.io/changelog/task-issues) surfaces these executions in the Web UI's [Task Failures view](https://docs.temporal.io/web-ui#task-failures-view). A Workflow Task runs the logic that determines what a Workflow should do next. Repeated failures or timeouts can leave the Workflow running without making progress, so Temporal flags those executions for investigation.

Open an affected order to inspect the failure details and pending work. You can use that information to investigate the deployment and determine what needs fixing. When a Workflow Task succeeds, Temporal clears the flag.

Task Issues Detection is already Generally Available. It gives you a starting point for troubleshooting; the controls below help you act on what you find.

## Hold progress while you investigate

Suppose a fulfillment dependency is unhealthy, and you want to hold an order while you investigate. You need to continue the same execution once the dependency recovers.

[Workflow Pause](https://docs.temporal.io/encyclopedia/workflow/workflow-pause) lets you stop an individual Workflow from making further progress while preserving its state. Temporal stops dispatching new Workflow Tasks and Activity Tasks, including retries. An Activity is a step that performs application work, such as calling the fulfillment API.

Activity attempts already running can still finish, fail, or time out. Timeouts and timers also keep advancing while the Workflow is paused. When you unpause it, Workflow code can process the events that arrived during the pause and continue.

Workflow Pause is in Pre-release. For Temporal Cloud access, contact your account team or support. If you self-host Temporal, review the documentation for the required Server, CLI, and UI versions and configuration.

## Adjust how a step runs

The fulfillment API starts responding more slowly. Requests that used to finish comfortably within your timeout now need more time, and frequent retries are adding pressure to the service.

With [Update Activity Options](https://docs.temporal.io/activity-operations/update-options), you can change supported timeouts and Retry Policy settings on a pending Activity. For example, you could increase its timeout from 30 seconds to two minutes or lengthen the interval between retries. You can also change its Task Queue to route work to a different set of Workers, the processes that execute your application code.

If an attempt is already running, the new settings apply to its next execution. The current attempt continues with its existing settings. After fixing an underlying problem, [Activity Reset](https://docs.temporal.io/activity-operations/reset) also lets you clear the step's retry state and schedule a fresh attempt without resetting the whole Workflow.

These [Activity Operations](https://docs.temporal.io/activity-operations) are in Public Preview and are available through the CLI, UI, or gRPC API. [Public Preview supports production use](https://docs.temporal.io/evaluate/product-release-stages). Activity Operations aren't recorded in the Workflow's Event History; use the UI or CLI to check the Activity's current state.

## Choose how work continues after a code change

Sometimes the fix is in your application code. Temporal provides controls for choosing which code handles an execution and, when necessary, returning to an earlier point in its progress.

If you need an order to continue on a compatible Worker Deployment Version, [Workflow Update Options](https://docs.temporal.io/cli/command-reference/workflow#update-options) lets you override that execution's Worker Versioning settings. You can change the routing for work already in progress, subject to compatibility with its existing Event History. The routing change itself doesn't make incompatible code safe. This operation is separate from sending a Workflow Update, which is a message handled by your Workflow code.

For recovery that requires returning to an earlier point, the existing [Workflow Reset](https://docs.temporal.io/cli/command-reference/workflow#reset) capability starts a new Run from a selected point in Event History. Progress recorded before that point is retained, while later steps may execute again. For an order-processing application, choose the reset point with care: repeating a step that charges a payment or requests shipment has consequences outside Temporal.

## Manage executions and Cloud resources from the same CLI

An investigation can involve both an application's running work and the Temporal Cloud resources supporting it.

The Temporal CLI already provides Workflow and Activity operations. The [Temporal Cloud CLI Extension](https://docs.temporal.io/cli/cloud) adds `temporal cloud` commands for administering Namespaces, users, API keys, and Nexus Endpoints. You can inspect an execution and manage Cloud resources from the same tool, using the permissions assigned to your account.

The extension is in Public Preview. Follow the [installation and connection guide](https://docs.temporal.io/cli/cloud#connect-to-temporal-cloud), then explore the [Cloud command reference](https://docs.temporal.io/cli/command-reference/cloud) for the resources you manage.

## Already self-hosting? Move existing work to Temporal Cloud

There's another operational decision these controls don't address: **who runs the Temporal Service itself.**

You can operate Temporal yourself or use Temporal Cloud as the managed service. If you're self-hosting and want to reduce that infrastructure responsibility, long-running Workflows can complicate the move. Some business processes may continue for days or months, making it difficult to wait for everything to finish before switching environments.

[Self-hosted to Cloud Migration](https://docs.temporal.io/cloud/migrate/automated) provides a path for moving supported existing workloads to Temporal Cloud while preserving Workflow History and metadata. The process supports running and closed Workflows, subject to eligibility and migration requirements. It includes preparation, testing, and a coordinated handover so you can validate the transition before finalizing it.

Migration is in Pre-release. Contact your Temporal account executive before planning a project, and review the automated migration guide together to assess your environment and requirements.

## Start with a process you need to understand

Take an order that isn't advancing and inspect its execution in the Web UI. From there, you can investigate repeated failures, review the controls available for that execution, and choose how it should proceed. The documentation linked above covers each operation's behavior and access requirements.

If your next step is moving the Temporal Service to Cloud, start a separate conversation with your account team about [migration eligibility](https://docs.temporal.io/cloud/migrate/automated).
