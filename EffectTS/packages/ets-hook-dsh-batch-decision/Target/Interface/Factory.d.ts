import type Factory from "@playform/ets-plugin-dsh-factory";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
        pluginFactory: Factory;
    }
}
