# Tool Execution Pipeline

This graph shows where policy, hooks, sandboxing, filesystem guards, result rewriting, final-outcome observation, and UI rendering run without changing the loop. The `tools/pre-execute` waterfall runs first, monotonic guards run next, and the `tools/execute` and `tools/post-execute` waterfalls follow; the three waterfalls may transform a call. Definition-owned `projectContent` installs prepared content before post-execute; `finalizeContent` and `tools/result` run afterward.

```mermaid
%% flowchart-v2 diagram
allow
deny
throw
ask
allowed-once
rejected, cancelled, unavailable
wrapper throws
Assistant message contains tool-call block
Session event: tool/calllogged before execution
UI pending cardpresentCall(args)
tools/pre-execute waterfallhooks, permission, sandbox
Registered monotonic guardsdeny or abstain; identity protected
denied or approval refusedtool body skipped
ctx.approval one-shot promptabsent or unanswerable: deny
tools/execute waterfalltimeout, retry, metrics (around dispatch)
Registered tool execute() body
fs/write-intent or fs/edit-intenttool-fs mutations only
Tool-owned session eventstodo/write, fs/observed, hook/invoked, hook/result, tool/ptc-dispatch
ToolDefinition.projectContentexecution-prepared text and images
tools/post-execute waterfallaccept, block, replace, add context
Registry outer normalizationpipeline/result snapshot throws become isError
ToolDefinition.finalizeContentlast content-only invariant
tools/result synchronous notificationfrozen authoritative outcome
Active-batch additionalContexts FIFOinjected user/message after recorded tool results
Session event: tool/resultsingle model-facing outcome
Tool batch settledrecorded tool/result events complete
UI completed cardpresentResult(args, result)
```

Filesystem read-before-edit checks stay below `tool-fs` on `fs/*` events. Generic pre/post waterfalls host hooks and approval policy; `ctx.approval` resolves asks before monotonic guards, and owner policy that must not be reordered remains a registered guard. Around-dispatch concerns such as timeouts wrap `tools/execute`. The registry losslessly snapshots the candidate result and normalizes a snapshot failure before the visible definition's snapshotted `finalizeContent` callback enforces its synchronous content-only invariant. `tools/result` then observes the immutable, lossless-JSON outcome. This lets hooks span tool families without coupling the tools to one policy service. PTC mode sends both the reserved `run_code` transport and its serialized sub-calls through the pipeline; sub-calls carry the parent token, log `tool/ptc-dispatch`, return denials as binding rejections, and omit `additionalContexts` to preserve call/result adjacency.

Maintenance mode: curated Mermaid flow; exact tool schemas and event signatures live in generated catalogs.
