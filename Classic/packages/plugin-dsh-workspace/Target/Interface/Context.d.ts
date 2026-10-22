import type { WorkspaceGraph } from "./Graph.js";
import type Factory from "@playform/plugin-dsh-factory";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The Wave-1 workspace graph service (@playform/plugin-dsh-workspace-graph). */
        workspaceGraph: WorkspaceGraph;
        /** The plugin-factory service (@playform/plugin-dsh-factory). */
        pluginFactory: Factory;
    }
}
