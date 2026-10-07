import type Factory from "@playform/plugin-dsh-factory";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The plugin-factory service — the governance family's shared machinery. */
        pluginFactory: Factory;
    }
}
