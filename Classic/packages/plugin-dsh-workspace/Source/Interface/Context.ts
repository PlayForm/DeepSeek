// Context - the declaration merging that publishes the typed vocabulary on
// the cordis Context (the plugin-development skill, item 12; the
// live-containers Interface/Factory.ts precedent):
//
//   `ctx.workspaceGraph` - the Wave-1 graph service, typed from THIS
//     package's Interface/Graph.ts (the self-contained declaration of the
//     sibling's frozen contract - the end-phase aligns the import).
//
// The `workspaceAgent` accessor is NOT declared here: the agent is the
// four tools plus the query layer - the operational view IS the surface,
// and the family's distribution law keeps the consumers decoupled through
// the tools and the events, not through a second service handle.
import type { WorkspaceGraph } from "@Interface/Graph.js";
import type Factory from "@playform/plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The Wave-1 workspace graph service (@playform/plugin-dsh-workspace-graph). */
		workspaceGraph: WorkspaceGraph;
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
