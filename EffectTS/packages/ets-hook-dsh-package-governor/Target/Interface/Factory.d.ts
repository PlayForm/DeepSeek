import type PluginFactory from "@playform/ets-plugin-dsh-factory";
export default interface Factory extends PluginFactory {
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
        pluginFactory: PluginFactory;
    }
}
