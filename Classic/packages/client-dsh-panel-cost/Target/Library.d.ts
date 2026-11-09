import type { Context } from "@deepseek-ai/cordis";
import Config from "./Variable/Config.js";
import Version from "./Variable/Version.js";
export declare const name = "client-dsh-panel-cost";
export declare const inject: string[];
export { Config, Version };
export declare function apply(ctx: Context): void;
declare const _default: {
    name: string;
    inject: string[];
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        rows: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        locale: import("@deepseek-ai/schemastery").default<"en" | "zh", "en" | "zh", "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        tabOrder: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        rows: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        locale: import("@deepseek-ai/schemastery").default<"en" | "zh", "en" | "zh", "volatile-defined">;
    }>>, "plain">;
    apply: typeof apply;
};
export default _default;
