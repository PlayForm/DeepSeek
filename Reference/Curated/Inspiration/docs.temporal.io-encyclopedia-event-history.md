# Event History

With Temporal, your Workflows recover from crashes automatically. This is made possible by the
[Event History](https://docs.temporal.io/workflow-execution/event), a complete and durable log of
everything that has happened in the lifecycle of a Workflow Execution, as well as the ability of the
Temporal Service to durably persist the Events during Replay.

Temporal uses the Event History to record every step taken along the way. Each time your Workflow
Definition makes an API call to execute an Activity or start a Timer for instance, it doesn't
perform the action directly. Instead, it sends a Command to the Temporal Service.

A Command is a requested action issued by a Worker to the Temporal Service after a Workflow Task
Execution completes. The Temporal Service will act on these Commands such as scheduling an Activity
or scheduling a timer. These Commands are then mapped to Events which are persisted in case of
failure. For example, if the Worker crashes, the Worker uses the Event History to replay the code
and recreate the state of the Workflow Execution to what it was immediately before the crash. It
then resumes progress from the point of failure as if the failure never occurred.

For a deep dive on how the Event History works, refer to the walkthroughs in the dropdown.
