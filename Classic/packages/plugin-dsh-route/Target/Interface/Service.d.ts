import type Enforcer from "../Function/Enforcer.js";
import type Factory from "@playform/plugin-dsh-factory";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The routing-enforcer service (@playform/plugin-dsh-route). */
        dshRoute: Enforcer;
        /** The plugin-factory service (@playform/plugin-dsh-factory). */
        pluginFactory: Factory;
    }
}
