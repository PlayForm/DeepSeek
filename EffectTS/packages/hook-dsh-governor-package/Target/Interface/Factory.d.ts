import type PluginFactory from "@playform/plugin-dsh-factory";
export default interface Factory extends PluginFactory {
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The plugin-factory service (@playform/plugin-dsh-factory). */
        pluginFactory: PluginFactory;
    }
}
