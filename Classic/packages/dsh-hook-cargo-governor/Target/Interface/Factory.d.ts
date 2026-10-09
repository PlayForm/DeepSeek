import type PluginFactory from "@playform/plugin-dsh-factory";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The plugin-factory service — the shared governance machinery
         *  (State/Gate/Continue/Append/Wire/Attach/Schema/Seam/…). */
        pluginFactory: PluginFactory;
    }
}
