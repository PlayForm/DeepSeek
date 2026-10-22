import type Dispatcher from "../Function/Dispatcher.js";
import type Factory from "@playform/plugin-dsh-factory";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The subagent-queue service (@playform/plugin-dsh-queue). */
        dshQueue: Dispatcher;
        /** The plugin-factory service (@playform/plugin-dsh-factory). */
        pluginFactory: Factory;
    }
}
