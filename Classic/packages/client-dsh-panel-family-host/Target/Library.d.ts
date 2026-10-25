import Apply from "./Function/Apply.js";
export declare const name = "client-dsh-panel-family-host";
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logRoot: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    maxLines: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    ccrLog: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logRoot: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    maxLines: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    ccrLog: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, "plain">;
export declare const inject: string[];
/**
 * Apply: provide the three services and log the activation.
 * Returns nothing (the loader contract).
 */
export declare function apply(context: Parameters<typeof Apply>[0], config: Parameters<typeof Apply>[1]): void;
declare const _default: {
    name: string;
    apply: typeof apply;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logRoot: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        maxLines: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        ccrLog: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logRoot: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        maxLines: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        ccrLog: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
