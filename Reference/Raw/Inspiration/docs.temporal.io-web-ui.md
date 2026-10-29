On this page
The Temporal Web UI provides users with Workflow Execution state and metadata for debugging purposes. It ships with every [Temporal CLI](https://docs.temporal.io/cli) release and is available with [Temporal Cloud](https://docs.temporal.io/cloud).
You can configure the Temporal Web UI to work in your own environment. See the [UI configuration reference](https://docs.temporal.io/references/web-ui-configuration).
Web UI open source repos:
  * [temporalio/ui-server](https://github.com/temporalio/ui-server)


## Namespaces[​](https://docs.temporal.io/web-ui#namespaces "Direct link to Namespaces")
All Namespaces in your self-hosted Temporal Service or Temporal Cloud account are listed under **Namespaces** in the left section of the window. You can also switch Namespaces from the Workflows view by selecting from the Namespace switcher at the top right corner of the window. After you select a Namespace, the Web UI shows the Recent Workflows page for that Namespace. In Temporal Cloud, users can access only the Namespaces that they have been granted access to. For details, see [Namespace-level permissions](https://docs.temporal.io/cloud/manage-access/roles-and-permissions#namespace-level-permissions).
## Workflows[​](https://docs.temporal.io/web-ui#workflows "Direct link to Workflows")
The main Workflows page displays a table of all Workflow Executions within the retention period.
Users can list Workflow Executions by any of the following:
  * Start time
  * End time
  * Any other Default or Custom [Search Attribute](https://docs.temporal.io/search-attribute) that uses [List Filter](https://docs.temporal.io/list-filter)


For start time and end time, users can set their preferred date and time format as one of the following:
  * UTC
  * Local
  * Relative


Select a Workflow Execution to view the Workflow Execution's History, Workers, Relationships, pending Activities and Nexus Operations, Queries, and Metadata.
### Saved Views[​](https://docs.temporal.io/web-ui#saved-views "Direct link to Saved Views")
Saved Views let you save and reuse your frequently used visibility queries in the Temporal Web UI. Instead of recreating complex filters every time, you can save them once and apply them with a single click.
Saved Views are stored locally in your browser and are available to you whenever you use the Temporal Web UI in this browser. Each user will have their own private collection.
#### Apply a Saved View[​](https://docs.temporal.io/web-ui#apply-a-saved-view "Direct link to Apply a Saved View")
By default, The Workflows page has several default Saved Views. You can also create your own Saved Views.
Click the name of a Saved View in the list to display the corresponding Workflows that match the query.
The Workflow List page will refresh with the results of the Saved View.
#### Create a Saved View[​](https://docs.temporal.io/web-ui#create-a-saved-view "Direct link to Create a Saved View")
You can create a new Saved View from the Workflows page.
  1. Create a Saved View by using the filter UI to build your criteria, or you can use the raw query editor to write custom query strings.
  2. Your new view will appear in the Custom Views list as New View. Click the Save as New button to bring up the Save as View window. Name your Saved View. Names must be unique to each user and can contain a max of 255 characters.
  3. Click Save. Your new view will appear in the Custom Views list


You can create up to 20 Saved Views. When you reach this limit, you'll need to delete some Saved Views before you can save new ones.
#### Make temporary changes to a Saved View query[​](https://docs.temporal.io/web-ui#make-temporary-changes-to-a-saved-view-query "Direct link to Make temporary changes to a Saved View query")
You can modify a Saved View temporarily without changing the saved criteria.
  1. Select the Saved View you want to change.
  2. Adjust the UI filters as needed.
  3. The Workflows page will refresh with the results of the new query, without changing the Saved View.
  4. If you want to keep your temporary changes, you can: 
     * Click Save, which will replace the original Saved View with your modifications.
     * Click Edit, modify the name, and click Save, which will replace the original Saved View with your modifications and change the name.
     * Click Edit, modify the name, and click Create New, which will create a new Saved View with your new settings and a new name.


#### Rename a Saved View Query[​](https://docs.temporal.io/web-ui#rename-a-saved-view-query "Direct link to Rename a Saved View Query")
You can rename an existing Saved View from the Workflows page.
  1. Select the Saved View you want to change.
  2. Click Edit.
  3. In the Edit View dialog box, enter a new name for the Saved View.
  4. Click Save to apply your changes and rename the existing Saved View, or click Create Copy to create a new Saved View with the new name.


#### Deleting Saved Views[​](https://docs.temporal.io/web-ui#deleting-saved-views "Direct link to Deleting Saved Views")
You can delete a Saved View from the Workflows page, because it is no longer useful, or to create room for new Saved Views.
  1. Select the Saved View you want to delete. You can only delete queries you’ve created; you cannot delete the system defaults.
  2. Click “Edit” and then "Delete this Saved View".


Deleting Saved Views is permanent
Deleted queries cannot be recovered, so make sure you won't need them again. If you accidentally delete a Saved List, you will need to recreate it.
#### Share a Saved View[​](https://docs.temporal.io/web-ui#share-a-saved-view "Direct link to Share a Saved View")
You can share a Saved View as a URL.
  1. Select the Saved View you want to share.
  2. Click the “Share” button to copy the URL for this Saved View to the clipboard. You can also copy the URL directly from the browser.


Saved Views and time
Saved Views that use relative times will be shared with absolute time.
## Task Failures view[​](https://docs.temporal.io/web-ui#task-failures-view "Direct link to Task Failures view")
The Task Failures view is a pre-defined Saved View that displays Workflows that have a Workflow Task failure. These Workflows are still running, but one of their Tasks has failed or timed out.
The details of the Task Failures view displays the Workflow's ID, the Run ID, and the Workflow type. Clicking on any of the links in the details opens the Workflow page for that Workflow. On this page, you will find more information about the Task that failed and remaining pending tasks. You can also cancel the Workflow by clicking the Request Cancellation button on this page.
Our system monitors Workflow task execution patterns in real-time. When a Workflow experiences five consecutive task failures or timeouts, it gets automatically flagged. The moment the Workflow recovers with a successful task, the flag clears. This smart threshold filters out minor glitches while surfacing Workflows with genuine problems.
### Activating Task Failures view[​](https://docs.temporal.io/web-ui#activate-task-failures-view "Direct link to Activating Task Failures view")
This is enabled by default for Temporal Cloud users. If you're self-hosting Temporal, you'll need to update the `system.numConsecutiveWorkflowTaskProblemsToTriggerSearchAttribute` [dynamic config](https://docs.temporal.io/references/dynamic-configuration).
Here's an example of how to make the config update for the dev server:

```


temporal server start-dev \




 --dynamic-config-value system.numConsecutiveWorkflowTaskProblemsToTriggerSearchAttribute=5


```

`numConsecutiveWorkflowTaskProblemsToTriggerSearchAttribute` is the number of consecutive Workflow Task Failures required to trigger the `TemporalReportedProblems` search attribute. The default value is 5. If adding this search attribute causes strain on the visibility system, consider increasing this number.
To turn off the feature for a Namespace, set `numConsecutiveWorkflowTaskProblemsToTriggerSearchAttribute` to 0.
## History[​](https://docs.temporal.io/web-ui#history "Direct link to History")
A Workflow Execution History is a view of the [Events](https://docs.temporal.io/workflow-execution/event#event) and Event fields within the Workflow Execution. Approximately [40 different Events](https://docs.temporal.io/references/events) can appear in a Workflow Execution's Event History.
The top of the page lists the following execution metadata:
  * Start Time, Close Time and Duration
  * Parent and Parent ID
  * SDK
  * [Billable Actions Count](https://docs.temporal.io/cloud/actions-usage#actions-in-workflows) (Temporal Cloud only)


The Input and Results section displays the function arguments and return values for debugging purposes. Results are not available until the Workflow finishes.
The History tab has the following views:
  * Timeline: A chronological or reverse-chronological order of events with a summary. Clicking into an Event displays all details for that Event.
  * All: View all History Events.
  * Compact: A logical grouping of Activities, Signals and Timers.
  * JSON: The full JSON code for the workflow.


### Download Event History[​](https://docs.temporal.io/web-ui#download-event-history "Direct link to Download Event History")
The entire Workflow Execution Event History, in JSON format, can be downloaded from this section.
### Workflow Actions[​](https://docs.temporal.io/web-ui#workflow-actions "Direct link to Workflow Actions")
Workflow Executions can request a Cancellation, send a Signal or Update, or Reset and Terminate directly from the UI. Start a new Workflow Execution with pre-filled values with the Start Workflow Like This One button. Signal and Update input, and the pre-filled Workflow input, are each a single argument. See [Pass input from the Web UI](https://docs.temporal.io/web-ui#input).
### Relationships[​](https://docs.temporal.io/web-ui#relationships "Direct link to Relationships")
Displays the full hierarchy of a Workflow Execution with all parent and child nodes displayed in a tree.
### Workers[​](https://docs.temporal.io/web-ui#workers "Direct link to Workers")
Displays the Workers currently polling on the Workflow Task Queue with a count. If no Workers are polling, an error displays.
### Pending Activities[​](https://docs.temporal.io/web-ui#pending-activities "Direct link to Pending Activities")
Displays a summary of recently active and/or pending Activity Executions. Clicking a pending Activity directs the user to the Pending Activities tab to view details.
### Call stack[​](https://docs.temporal.io/web-ui#call-stack "Direct link to Call stack")
The screen shows the captured result from the [__stack_trace](https://docs.temporal.io/sending-messages#stack-trace-query) Query. The Query is performed when the tab is selected. It works only if a Worker is running and available to return the call stack. The call stack shows each location where Workflow code is waiting.
### Queries[​](https://docs.temporal.io/web-ui#queries "Direct link to Queries")
Lists all Queries sent to the Workflow Execution. A Query you send from this tab takes a single argument. See [Pass input from the Web UI](https://docs.temporal.io/web-ui#input).
### Metadata[​](https://docs.temporal.io/web-ui#metadata "Direct link to Metadata")
Displays User Metadata including static Workflow Summary and Details and dynamic Current Details. Lists all Events with User Metadata data to give you a human-readable log of what's happening in your Workflow.
## Pass input from the Web UI[​](https://docs.temporal.io/web-ui#input "Direct link to Pass input from the Web UI")
The **Data** box on the Start Workflow form, the Signal and Update dialogs, the Queries tab, and the Schedule form takes a single JSON value. The Web UI sends that value to your code as one argument.
  * For a Workflow, Signal, Update, or Query that takes one argument, enter the argument as a JSON value, such as `"order-123"` or `{"orderId": "order-123", "quantity": 2}`.
  * You can't pass more than one argument from the Web UI. A JSON array such as `["order-123", 2]` arrives as one argument whose value is the array.


To pass more than one argument, use the [Temporal CLI](https://docs.temporal.io/cli/command-reference/workflow) and repeat `--input` once for each argument, in order:

```


temporal workflow start \




    --type YourWorkflowType \




    --task-queue YourTaskQueue \




    --workflow-id YourWorkflowId \




    --input '"order-123"' \




    --input 2


```

`temporal workflow signal`, `temporal workflow update execute`, and `temporal workflow query` accept `--input` the same way. To start a Workflow from the Web UI, give its Workflow Definition a single object parameter instead of several parameters. This is also the general [recommendation for Workflow parameters](https://docs.temporal.io/workflow-definition#workflow-parameters).
If the Web UI sends fewer arguments than a Workflow Definition or Signal handler declares, the result depends on the SDK. For example:
  * In the Python SDK, the Workflow Task fails with a `TypeError` and retries. The Workflow Execution stays Running without making progress and can appear in the [Task Failures view](https://docs.temporal.io/web-ui#task-failures-view).
  * In the Go SDK, a Workflow Execution runs with the zero value for each missing argument. If the input can't be decoded into the first parameter, the Workflow Execution fails.


**Start Workflow Like This One** copies only the first argument of the original Workflow Execution. If the original Workflow Execution took more than one argument, start the new one with the CLI.
## Schedules[​](https://docs.temporal.io/web-ui#schedules "Direct link to Schedules")
On Temporal Cloud and self-hosted Temporal Service Web UI, the Schedules page lists all the [Schedules](https://docs.temporal.io/schedule) created on the selected Namespace.
Click a Schedule to see details, such as configured frequency, start and end times, and recent and upcoming runs. The Workflow input you set when you create a Schedule in the Web UI is a single argument. See [Pass input from the Web UI](https://docs.temporal.io/web-ui#input).
Setting Schedules with Strings
Temporal Workflow Schedule Cron strings follow this format:

```


┌───────────── minute (0 - 59)




│ ┌───────────── hour (0 - 23)




│ │ ┌───────────── day of the month (1 - 31)




│ │ │ ┌───────────── month (1 - 12)




│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)




│ │ │ │ │




* * * * *


```

To read more about Schedules, explore these links:
Related 📚
  * [Schedules using the Go SDK](https://docs.temporal.io/develop/go/workflows/schedules)feature-guide
  * [Schedules using the Java SDK](https://docs.temporal.io/develop/java/workflows/schedules)feature-guide
  * [Schedules using the PHP SDK](https://docs.temporal.io/develop/php/workflows/schedules)feature-guide
  * [Schedules using the Python SDK](https://docs.temporal.io/develop/python/workflows/schedules)feature-guide
  * [Schedules using the TypeScript SDK](https://docs.temporal.io/develop/typescript/workflows/schedules)feature-guide
  * [Schedules using the .NET SDK](https://docs.temporal.io/develop/dotnet/workflows/schedules)feature-guide


### Settings[​](https://docs.temporal.io/web-ui#settings "Direct link to Settings")
On Temporal Cloud, **Settings** is visible only to Account Owner and Global Admin [roles](https://docs.temporal.io/cloud/manage-access/roles-and-permissions#account-level-roles).
Click **Settings** to see and manage the list of users in your account and to set up integrations such as [Observability](https://docs.temporal.io/cloud/monitor) and [Audit logging](https://docs.temporal.io/cloud/audit-logs).
On a self-hosted Temporal Service, manage your users, metrics, and logging in your [server configuration](https://docs.temporal.io/references/service-configuration).
### Archive[​](https://docs.temporal.io/web-ui#archive "Direct link to Archive")
On a self-hosted Temporal Service, Archive shows [Archived](https://docs.temporal.io/temporal-service/archival) data of your Workflow Executions on the Namespace.
To see data in your self-hosted Temporal Service, you must have [Archival set up and configured](https://docs.temporal.io/self-hosted-guide/archival).
For information and details on the Archive feature in Temporal Cloud, contact your Temporal representative.
### Codec Server[​](https://docs.temporal.io/web-ui#codec-server "Direct link to Codec Server")
The Web UI can use a [Codec Server](https://docs.temporal.io/codec-server) with a custom Data Converter to decode inputs and return values. For details, see [Securing your data](https://docs.temporal.io/production-deployment/data-encryption).
The UI supports a [Codec Server endpoint](https://docs.temporal.io/production-deployment/data-encryption#web-ui). For details on setting the Codec Server endpoint, see [Codec Server setup](https://docs.temporal.io/production-deployment/data-encryption#codec-server-setup).
Feedback
