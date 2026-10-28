Concepts

# Graph Model

Flywheel represents research work as a directed graph of durable nodes.

Flywheel organizes research work as a directed graph. Nodes represent work units, branches represent divergent paths, and merged outcomes preserve a reviewable record of decisions and evidence.

The graph model is useful when an investigation branches into alternatives, when empirical work needs artifacts attached to the work that produced them, or when a team needs a durable audit trail for agent-assisted work.

## Nodes And Edges

A node is the durable unit of work. It can hold a question, claim, hypothesis, task, result, or decision. Edges connect nodes into an ancestry graph so later work can point back to the context that motivated it. A branch creates a child node from an existing node; a merge records that multiple branches have been resolved into one outcome.

This shape lets you keep alternatives visible without flattening everything into one timeline. A failed experiment, a competing explanation, and a final decision can all stay connected to the same parent while preserving their own evidence.

## Reading The Graph

Use the Web UI when you want to inspect topology visually. Use the CLI or MCP when you need a repeatable read for an agent or script:

```
flywheel hosted:node:list --page 1 --format=json
flywheel hosted:node:get <NODE_ID> --format=json
flywheel hosted:lineage:list <NODE_ID> --direction children --format=json
flywheel hosted:lineage:list <NODE_ID> --direction parents --format=json
```

For full command details, see [`hosted:node:list`](./cli-hosted-node-list.md), [`hosted:node:get`](./cli-hosted-node-get.md), and the broader [CLI reference](./cli.md).

## Practical Modeling Guidance

Prefer small, reviewable nodes over one large catch-all node. Put the current claim or task in the node content, attach concrete evidence as artifacts, and use child nodes for follow-up work that can succeed or fail independently.

When a branch changes your conclusion, update the summary and connect the outcome back into the graph. The goal is not to make every investigation neat; it is to make the lineage of evidence and decisions inspectable later.

For a practical research workflow built on this graph model, see [Encoding the Scientific Method](./how-to-use-flywheel-encoding-the-scientific-method.md).

[Terminal preview](./terminal-preview.md)

View your local Flywheel repositories in a browser, without an account or uploading your work.

[Nodes, Artifacts, And Executions](./concepts-nodes-artifacts-executions.md)

The core durable records exposed by Flywheel.

<!--
## Source links

- [hosted:node:list](./cli-hosted-node-list.md) - source: /cli/hosted-node-list
- [hosted:node:get](./cli-hosted-node-get.md) - source: /cli/hosted-node-get
- [CLI reference](./cli.md) - source: /cli
- [Encoding the Scientific Method](./how-to-use-flywheel-encoding-the-scientific-method.md) - source: /how-to-use-flywheel/encoding-the-scientific-method
- [Terminal preview View your local Flywheel repositories in a browser, without an account or uploading](./terminal-preview.md) - source: /terminal-preview
- [Nodes, Artifacts, And Executions The core durable records exposed by Flywheel.](./concepts-nodes-artifacts-executions.md) - source: /concepts/nodes-artifacts-executions
-->
